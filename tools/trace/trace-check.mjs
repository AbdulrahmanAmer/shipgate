// Completeness gate: a work package is done only when every requirement slice it owns is
// registered in the built binary, detected by known-bad fixtures (spec-authored and held-out),
// silent on known-good fixtures, and all of that evidence comes from a run on the current tree.
// Inputs are produced by running things, never written by hand (BUILD_MAP § 4.1):
//   target/trace/registry.json        `shipgate rule --list --json` from the built binary
//   target/trace/corpus-results.json  `cargo xtask corpus --json`
//   target/nextest/ci/junit.xml       `cargo nextest run --profile ci` (TR-* and section tests)
//   corpus/FIXTURES.lock              sha256 of every spec/holdout fixture file (orchestrator-owned)
//   trace/deferred.tsv                slices a builder could not deliver (must be empty for done)
// Usage: node tools/trace/trace-check.mjs (--wp WP-410 | --phase 4 | --all | --claimed BUILD_STATE.md)
//        [--root dir] [--no-tree-check] [--json out.json]
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readRequirements, readOwnership, readWorkPackages } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const root = path.resolve(opt("--root") || fileURLToPath(new URL("../..", import.meta.url)));
const p = (...x) => path.join(root, ...x);
const target = process.env.CARGO_TARGET_DIR ? path.resolve(process.env.CARGO_TARGET_DIR) : p("target");
const t = (...x) => path.join(target, ...x);
const readJson = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null);

const reqs = new Map(readRequirements(root).map((r) => [r.id, r]));
const own = readOwnership(root) || [];
const allWps = readWorkPackages(root);
const buildMap = fs.readFileSync(p("BUILD_MAP.md"), "utf8");

// ---- which WPs to check
let targets = [];
if (opt("--wp")) targets = [opt("--wp")];
else if (opt("--phase")) targets = wpsOfPhase(Number(opt("--phase")));
else if (args.includes("--all")) targets = [...allWps];
else if (opt("--claimed")) targets = claimedDone(opt("--claimed"));
else {
  console.error("usage: trace-check.mjs --wp WP-<id> | --phase N | --all | --claimed BUILD_STATE.md");
  process.exit(2);
}

// ---- evidence
const registry = readJson(t("trace/registry.json"));
const corpus = readJson(t("trace/corpus-results.json"));
const junit = fs.existsSync(t("nextest/ci/junit.xml")) ? fs.readFileSync(t("nextest/ci/junit.xml"), "utf8") : null;
const deferred = fs.existsSync(p("trace/deferred.tsv"))
  ? fs.readFileSync(p("trace/deferred.tsv"), "utf8").split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#")).map((l) => l.split("\t"))
  : [];
const global = [];

let tree = null;
if (!args.includes("--no-tree-check")) {
  try {
    tree = execFileSync("git", ["-C", root, "rev-parse", "HEAD^{tree}"], { encoding: "utf8" }).trim();
    const dirty = execFileSync("git", ["-C", root, "status", "--porcelain", "--", "crates", "sidecar", "rules", "adapters", "corpus", "xtask"], { encoding: "utf8" }).trim();
    if (dirty) global.push(`uncommitted changes under crates/sidecar/rules/adapters/corpus/xtask — evidence must come from a committed tree:\n${dirty.split("\n").slice(0, 10).join("\n")}`);
  } catch {
    global.push("not a git repository (or git missing): can't prove the evidence matches the code");
  }
}
for (const [name, ev] of [["registry.json", registry], ["corpus-results.json", corpus]]) {
  if (!ev) global.push(`target/trace/${name} missing — run the producing command (BUILD_MAP § 4.1)`);
  else if (tree && ev.treeHash !== tree) global.push(`target/trace/${name} is from tree ${ev.treeHash}, HEAD is ${tree} — stale evidence, re-run`);
}

// fixture integrity: every locked fixture file still has its locked hash, and no unlocked file sits in spec/ or holdout/
const lockPath = p("corpus/FIXTURES.lock");
const locked = new Map();
if (fs.existsSync(lockPath)) {
  for (const l of fs.readFileSync(lockPath, "utf8").split(/\r?\n/)) {
    const m = l.match(/^([0-9a-f]{64})  (.+)$/);
    if (m) locked.set(m[2], m[1]);
  }
}
for (const [rel, h] of locked) {
  const f = p("corpus", rel);
  if (!fs.existsSync(f)) global.push(`locked fixture deleted: corpus/${rel}`);
  else if (sha256(f) !== h) global.push(`locked fixture modified: corpus/${rel} (spec/holdout fixtures are not the builder's to change)`);
}

// ---- per WP
const report = [];
for (const wp of targets.sort()) report.push(checkWp(wp));

function checkWp(wp) {
  const missing = [];
  const slices = own.filter((o) => o.wp === wp);
  for (const d of deferred.filter((d) => d[2] === wp)) missing.push(`deferred: ${d[0]} ${d[1]} — ${d[3] || "no reason"} (resolve in ownership.tsv; deferred.tsv must be empty)`);
  for (const o of slices) {
    const r = reqs.get(o.id);
    if (!r) { missing.push(`${o.id}: in ownership.tsv but not in the spec`); continue; }
    if (r.kind === "tool-requirement") { checkTest(o.id, missing); continue; }
    const reg = registry?.rules?.find((x) => x.id === o.id);
    if (!reg) { missing.push(`${o.id}: not registered in the binary (registry.json)`); continue; }
    const splitParts = own.filter((x) => x.id === o.id && x.part.startsWith("part:") && x.wp !== wp).map((x) => x.part.slice(5));
    const parts = o.part.startsWith("part:") ? [o.part.slice(5)] : o.part === "*" ? ["main", ...r.parts.filter((x) => !splitParts.includes(x))] : [];
    for (const part of parts) {
      if (part !== "main" && !(reg.parts || []).includes(part)) missing.push(`${o.id}: part '${part}' not registered`);
      need(o.id, part, "known-bad", missing);
      need(o.id, part, "holdout", missing);
    }
    if (o.part.startsWith("channel:")) {
      const ch = o.part.slice(8);
      if (!(reg.channels || []).includes(ch)) missing.push(`${o.id}: channel '${ch}' not registered`);
      const hit = fixtures(o.id).some((f) => f.kind !== "known-good" && f.pass && (f.actual || []).some((a) => a.rule === o.id && a.channel === ch));
      if (!hit) missing.push(`${o.id}: no passing known-bad fixture whose finding comes from channel '${ch}'`);
    }
    if (o.part === "*") {
      for (const ch of r.channels) {
        const movedAway = own.some((x) => x.id === o.id && x.part === `channel:${ch}` && x.wp !== wp);
        if (!movedAway && !(reg.channels || []).includes(ch)) missing.push(`${o.id}: channel '${ch}' not registered`);
      }
      for (const fc of reg.failureClasses || []) {
        if (!fixtures(o.id).some((f) => f.kind !== "known-good" && f.pass && f.failureClass === fc)) missing.push(`${o.id}: no passing known-bad fixture for failure class '${fc}'`);
      }
      const good = fixtures(o.id).filter((f) => f.kind === "known-good");
      if (!good.length) missing.push(`${o.id}: no known-good fixture`);
      else if (good.some((f) => !f.pass)) missing.push(`${o.id}: known-good fixture(s) produce findings: ${good.filter((f) => !f.pass).map((f) => f.path).join(", ")}`);
      if (!(reg.failureClasses || []).length) missing.push(`${o.id}: registry lists no failure classes (04 § 9.1 requires them in metadata)`);
    }
  }
  for (const s of sectionsOf(wp)) checkTest(s, missing);
  return { wp, slices: slices.length, missing };
}

function fixtures(id) {
  return (corpus?.fixtures || []).filter((f) => f.rule === id);
}
function need(id, part, kind, missing) {
  const fs_ = fixtures(id).filter((f) => f.kind === kind && (f.part || "main") === part);
  if (!fs_.length) missing.push(`${id}: no ${kind} fixture for part '${part}'`);
  else if (!fs_.some((f) => f.pass)) missing.push(`${id}: ${kind} fixture(s) for part '${part}' not detected: ${fs_.map((f) => f.path).join(", ")}`);
  else if (fs_.some((f) => f.path && f.kind !== "known-good" && !locked.has(f.path))) missing.push(`${id}: ${kind} fixture for part '${part}' is not in corpus/FIXTURES.lock`);
}
// TR-* and owned sections are proven by tests whose name carries the id, e.g. `tr_103_reports_are_byte_identical`
// or `sec_03_17_report_schema` for "03 § 17".
function checkTest(id, missing) {
  const slug = /§/.test(id) ? "sec_" + id.replace(/ § /, "_").replace(/\./g, "_") : id.toLowerCase().replace("-", "_");
  if (!junit) { missing.push(`${id}: no test evidence (target/nextest/ci/junit.xml missing)`); return; }
  const cases = [...junit.matchAll(/<testcase\b[^>]*\bname="([^"]*)"[^>]*?(\/>|>([\s\S]*?)<\/testcase>)/g)].filter((m) => m[1].includes(slug));
  if (!cases.length) missing.push(`${id}: no test named *${slug}*`);
  else if (cases.some((m) => /<(failure|error|skipped)\b/.test(m[3] || ""))) missing.push(`${id}: test(s) *${slug}* failed or were skipped`);
}
function sectionsOf(wp) {
  const table = buildMap.slice(buildMap.indexOf("### Section ownership"), buildMap.indexOf("### Launch-stable list"));
  const out = [];
  for (const m of table.matchAll(/^\| ([^|]*§[^|]*) \| ([^|]*) \|$/gm)) {
    if (!new RegExp(`\\b${wp}\\b`).test(m[2])) continue;
    for (const s of m[1].matchAll(/\b(0[1-5]) § ([0-9]+(?:\.[0-9]+)*)/g)) out.push(`${s[1]} § ${s[2]}`);
  }
  return out;
}
function wpsOfPhase(n) {
  const out = [];
  let phase = -1;
  for (const line of buildMap.split(/\r?\n/)) {
    const m = line.match(/^### Phase ([0-9]+)/);
    if (m) phase = Number(m[1]);
    const w = line.match(/^\| (WP-[0-9]{3,4})(?:\.\.([0-9]{3,4}))? /);
    if (w && phase === n) {
      if (w[2]) for (let k = Number(w[1].slice(3)); k <= Number(w[2]); k++) out.push(`WP-${k}`);
      else out.push(w[1]);
    }
  }
  return out;
}
// BUILD_STATE.md marks a WP done with a table row "| WP-410 | done | …" or a line "WP-410: done".
function claimedDone(file) {
  if (!fs.existsSync(p(file))) return [];
  const t = fs.readFileSync(p(file), "utf8");
  return [...new Set([...t.matchAll(/(WP-[0-9]{3,4}[a-z]?)\s*(?:\||:)\s*\**done\**/gi)].map((m) => m[1]))];
}
function sha256(f) {
  return crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
}

// ---- output
let bad = global.length > 0;
for (const g of global) console.log(`GLOBAL  ${g}`);
for (const r of report) {
  if (r.missing.length) bad = true;
  console.log(`${r.missing.length ? "NOT DONE" : "DONE    "} ${r.wp} (${r.slices} slices${r.missing.length ? `, ${r.missing.length} missing` : ""})`);
  for (const m of r.missing.slice(0, 200)) console.log(`         - ${m}`);
}
if (!targets.length) console.log("no work packages selected");
if (opt("--json")) fs.writeFileSync(opt("--json"), JSON.stringify({ tree, global, report }, null, 2) + "\n");
process.exit(bad ? 1 : 0);
