// Completeness gate (BUILD_MAP § 4.1). A work package is done only when every requirement slice,
// section and acceptance test it owns is proven by evidence that THIS SCRIPT produces:
//   1. it checks out HEAD into a clean temporary worktree (uncommitted files are never evidence);
//   2. builds `shipgate` there and reads the rule registry from the built binary;
//   3. enumerates every locked fixture from corpus/FIXTURES.lock itself, runs each one through the
//      binary (`shipgate dev fixture <dir> --json`) and judges the result against the fixture's
//      locked expected.json — it never reads a builder-written results file;
//   4. runs `cargo nextest run --profile ci` in that worktree and reads the fresh junit.
// Contract files (FIXTURES.lock, locked fixtures, ownership.tsv, tools/trace) are protected at merge
// time by tools/trace/merge-gate.mjs; CI on a clean checkout is the authoritative run.
//
// Usage: node tools/trace/trace-check.mjs (--wp WP-410 | --phase 4 | --all | --claimed BUILD_STATE.md)
//        [--root dir] [--json out.json]
//   Self-test only (refused when CI is set or --from-hook is passed):
//        --fake-bin <node script> --fake-junit <file>   (skips git/cargo; same enumeration and judging)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readRequirements, readOwnership, readWorkPackages, readAcceptanceTests } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const root = path.resolve(opt("--root") || fileURLToPath(new URL("../..", import.meta.url)));
const p = (...x) => path.join(root, ...x);

const reqs = new Map(readRequirements(root).map((r) => [r.id, r]));
const own = readOwnership(root) || [];
const allWps = readWorkPackages(root);
const acceptance = readAcceptanceTests(root);
const buildMap = fs.readFileSync(p("BUILD_MAP.md"), "utf8");
const phaseTables = buildMap.slice(0, buildMap.indexOf("### Section ownership"));
const global = [];

// ---- which WPs
let targets = [];
if (opt("--wp")) targets = [opt("--wp")];
else if (opt("--phase")) targets = wpsOfPhase(Number(opt("--phase")));
else if (args.includes("--all")) targets = [...allWps];
else if (opt("--claimed")) targets = claimedDone(opt("--claimed"));
else {
  console.error("usage: trace-check.mjs --wp WP-<id> | --phase N | --all | --claimed BUILD_STATE.md");
  process.exit(2);
}

// ---- evidence (produced here)
const fake = opt("--fake-bin");
if (fake && (process.env.CI || args.includes("--from-hook"))) {
  console.error("--fake-bin is for the self-test only; refused under CI or from the Stop hook");
  process.exit(2);
}
const fromHook = args.includes("--from-hook");
const ev = !targets.length || fromHook ? { registry: null, junit: null, bin: null } : fake ? fakeEvidence() : realEvidence();

// ---- locked fixtures, enumerated from the lock (never from a results file)
const locked = new Map(); // corpus-relative file → sha256
if (fs.existsSync(p("corpus/FIXTURES.lock"))) {
  for (const l of fs.readFileSync(p("corpus/FIXTURES.lock"), "utf8").split(/\r?\n/)) {
    const m = l.match(/^([0-9a-f]{64})  (.+)$/);
    if (m) locked.set(m[2], m[1]);
  }
}
for (const [rel, h] of locked) {
  const f = p("corpus", rel);
  if (!fs.existsSync(f)) global.push(`locked fixture file deleted: corpus/${rel}`);
  else if (sha256(f) !== h) global.push(`locked fixture file modified: corpus/${rel}`);
}
for (const file of walk(p("corpus"))) {
  const rel = path.relative(p("corpus"), file).split(path.sep).join("/");
  if (/(^|\/)(spec|holdout)\//.test(rel) && !locked.has(rel)) global.push(`unlocked file in a locked fixture directory: corpus/${rel}`);
}
// A fixture is a directory corpus/<pack>/<RULE-ID>/<spec|holdout>/<name>/ with a locked expected.json.
const fixtures = [];
for (const rel of locked.keys()) {
  const m = rel.match(/^([a-z0-9-]+)\/([A-Z][A-Z0-9]{1,5}-[0-9]{3})\/(spec|holdout)\/([^/]+)\/expected\.json$/);
  if (!m) continue;
  let exp;
  try { exp = JSON.parse(fs.readFileSync(p("corpus", rel), "utf8")); } catch { global.push(`unreadable expected.json: corpus/${rel}`); continue; }
  const kind = m[3] === "holdout" ? "holdout" : exp.kind;
  if (exp.rule !== m[2]) { global.push(`corpus/${rel}: expected.rule ${exp.rule} doesn't match its directory ${m[2]}`); continue; }
  if (m[3] === "holdout" && exp.kind && exp.kind !== "known-bad") { global.push(`corpus/${rel}: a holdout must be known-bad`); continue; }
  if (!["known-bad", "known-good", "holdout"].includes(kind)) { global.push(`corpus/${rel}: kind must be known-bad or known-good`); continue; }
  fixtures.push({ dir: path.dirname(p("corpus", rel)), rel, rule: m[2], part: exp.part || "main", kind, expect: exp.expect || [], result: null });
}
// Judge each fixture by running the binary on it.
for (const f of fixtures) {
  if (!ev.bin) break;
  let out;
  try { out = JSON.parse(run(ev.bin.cmd, [...ev.bin.args, "dev", "fixture", f.dir, "--json"], { cwd: root })); } catch (e) { f.result = { pass: false, why: `binary failed: ${String(e.message).split("\n")[0]}` }; continue; }
  const found = out.findings || [];
  if (f.kind === "known-good") {
    const bad = found.filter((x) => x.rule === f.rule);
    f.result = { pass: bad.length === 0, why: bad.length ? `${bad.length} finding(s) of ${f.rule}` : "", found };
  } else {
    const want = f.expect.length ? f.expect : [{ rule: f.rule, part: f.part }];
    const missing = want.filter((w) => !found.some((x) => x.rule === w.rule && (x.part || "main") === (w.part || "main") && (!w.failureClass || x.failureClass === w.failureClass)));
    f.result = { pass: missing.length === 0, why: missing.length ? `not detected: ${missing.map((w) => `${w.rule}/${w.part || "main"}${w.failureClass ? "/" + w.failureClass : ""}`).join(", ")}` : "", found };
  }
}

const deferred = fs.existsSync(p("trace/deferred.tsv"))
  ? fs.readFileSync(p("trace/deferred.tsv"), "utf8").split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#")).map((l) => l.split("\t"))
  : [];

// ---- Stop-hook mode: no build; a claimed WP needs a real-mode record for HEAD's tree saying DONE.
if (fromHook) {
  let tree = null;
  try { tree = run("git", ["-C", root, "rev-parse", "HEAD^{tree}"]).trim(); } catch {}
  const rec = tree ? readRecord(tree) : null;
  const report = targets.map((wp) => ({ wp, slices: 0, missing: rec?.done?.includes(wp) ? [] : [`no real-mode trace-check record for tree ${tree?.slice(0, 12)} says ${wp} is DONE — run: node tools/trace/trace-check.mjs --claimed BUILD_STATE.md`] }));
  for (const g of global) console.log(`GLOBAL  ${g}`);
  for (const r of report) console.log(`${r.missing.length ? "NOT DONE" : "DONE    "} ${r.wp}${r.missing.length ? "\n         - " + r.missing[0] : ""}`);
  process.exit(global.some((g) => !g.startsWith("note:")) || report.some((r) => r.missing.length) ? 1 : 0);
}
function recordPath(tree) {
  let gitDir;
  try { gitDir = run("git", ["-C", root, "rev-parse", "--git-common-dir"]).trim(); } catch { return null; }
  return path.join(path.isAbsolute(gitDir) ? gitDir : path.join(root, gitDir), "shipgate-trace", `${tree}.json`);
}
function readRecord(tree) {
  const f = recordPath(tree);
  return f && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
}

// ---- per WP
const report = [];
const done = new Map();
for (const wp of targets.sort((a, b) => (a === "WP-920") - (b === "WP-920") || a.localeCompare(b))) {
  const r = checkWp(wp);
  done.set(wp, r.missing.length === 0);
  report.push(r);
}

function checkWp(wp) {
  const missing = [];
  const base = wp.replace(/[a-z]$/, "");
  const named = own.filter((o) => o.wp === wp);
  const slices = named.length || base === wp ? named : own.filter((o) => o.wp === base);
  const owner = named.length || base === wp ? wp : base;
  const sections = sectionsOf(owner);
  const accTests = acceptance.get(owner) || [];
  if (wp === "WP-920") {
    // WP-920's acceptance is the whole ledger: every other WP done in this same run.
    const others = [...allWps].filter((w) => w !== "WP-920");
    const notDone = others.filter((w) => (done.has(w) ? !done.get(w) : checkWp(w).missing.length > 0));
    if (notDone.length) missing.push(`not every other WP is done: ${notDone.slice(0, 20).join(", ")}${notDone.length > 20 ? " …" : ""}`);
    return { wp, slices: others.length, missing };
  }
  if (!slices.length && !sections.length && !accTests.length) missing.push("owns no requirement slice, no spec section and no acceptance test");
  for (const d of deferred.filter((d) => d[2] === wp)) missing.push(`deferred: ${d[0]} ${d[1]} — ${d[3] || "no reason"} (deferred.tsv must be empty)`);
  for (const o of slices) {
    const r = reqs.get(o.id);
    if (!r) { missing.push(`${o.id}: in ownership.tsv but not in the spec`); continue; }
    if (r.kind === "tool-requirement") { checkTest(owner, o.id.toLowerCase().replace("-", "_"), o.id, missing); continue; }
    const reg = ev.registry?.rules?.find((x) => x.id === o.id);
    if (!reg) { missing.push(`${o.id}: not registered in the built binary`); continue; }
    const movedParts = own.filter((x) => x.id === o.id && x.part.startsWith("part:") && x.wp !== owner).map((x) => x.part.slice(5));
    const parts = o.part.startsWith("part:") ? [o.part.slice(5)] : o.part === "*" ? ["main", ...r.parts.filter((x) => !movedParts.includes(x))] : [];
    for (const part of parts) {
      if (part !== "main" && !(reg.parts || []).includes(part)) missing.push(`${o.id}: part '${part}' not registered`);
      need(o.id, part, "known-bad", missing);
      need(o.id, part, "holdout", missing);
    }
    if (o.part.startsWith("channel:")) {
      const ch = o.part.slice(8);
      if (!(reg.channels || []).includes(ch)) missing.push(`${o.id}: channel '${ch}' not registered`);
      const hit = fixtures.some((f) => f.rule === o.id && f.kind !== "known-good" && f.result?.pass && (f.result.found || []).some((a) => a.rule === o.id && a.channel === ch));
      if (!hit) missing.push(`${o.id}: no locked known-bad fixture detected through channel '${ch}'`);
    }
    if (o.part === "*") {
      // channels this owner must register: the rule's, minus those moved by channel rows or used only by moved parts
      const movedCh = new Set(own.filter((x) => x.id === o.id && x.part.startsWith("channel:") && x.wp !== owner).map((x) => x.part.slice(8)));
      const keptPartCh = new Set(Object.entries(r.partChannels || {}).filter(([pt]) => !movedParts.includes(pt)).flatMap(([, c]) => c));
      const onlyMovedPartCh = new Set(Object.entries(r.partChannels || {}).filter(([pt]) => movedParts.includes(pt)).flatMap(([, c]) => c).filter((c) => !keptPartCh.has(c)));
      for (const ch of r.channels) if (!movedCh.has(ch) && !onlyMovedPartCh.has(ch) && !(reg.channels || []).includes(ch)) missing.push(`${o.id}: channel '${ch}' not registered`);
      // failure classes: those named in the spec text are required even if the metadata forgets them
      const classes = new Set([...(reg.failureClasses || []), ...(r.failureClasses || [])]);
      for (const fc of classes) {
        if (!fixtures.some((f) => f.rule === o.id && f.kind !== "known-good" && f.result?.pass && f.expect.some((w) => w.failureClass === fc))) missing.push(`${o.id}: no locked known-bad fixture detected for failure class '${fc}'`);
      }
      if (!classes.size) missing.push(`${o.id}: no failure class in its metadata or spec text (04 § 9.1)`);
      for (const fc of r.failureClasses || []) if (!(reg.failureClasses || []).includes(fc)) missing.push(`${o.id}: metadata lacks failure class '${fc}' that the spec text names`);
      const good = fixtures.filter((f) => f.rule === o.id && f.kind === "known-good");
      if (!good.length) missing.push(`${o.id}: no locked known-good fixture`);
      for (const g of good.filter((f) => !f.result?.pass)) missing.push(`${o.id}: known-good ${g.rel} produces findings (${g.result?.why || "not run"})`);
    }
  }
  for (const s of sections) checkTest(owner, "sec_" + s.replace(/ § /, "_").replace(/\./g, "_"), s, missing);
  for (const name of accTests) checkTest(owner, name.replace(/^wp_[0-9]+__/, ""), name, missing);
  return { wp, slices: slices.length + sections.length + accTests.length, missing };
}

// Every locked fixture of the kind for the part must be detected; at least one must exist.
function need(id, part, kind, missing) {
  const fs_ = fixtures.filter((f) => f.rule === id && f.part === part && (kind === "holdout" ? f.kind === "holdout" : f.kind === "known-bad"));
  if (!fs_.length) missing.push(`${id}: no locked ${kind} fixture for part '${part}'`);
  for (const f of fs_.filter((f) => !f.result?.pass)) missing.push(`${id}: ${kind} ${f.rel} — ${f.result?.why || "not run"}`);
}
// Tests prove TR-*, sections and acceptance items only when the test is named for THIS WP:
// `wp_<id>__<req>__<what>`, e.g. wp_207__sec_03_17__report_schema, wp_209__tr_103__byte_identical.
function checkTest(wp, req, label, missing) {
  const slug = `wp_${wp.slice(3).toLowerCase()}__${req}`;
  if (!ev.junit) { missing.push(`${label}: no test evidence (nextest did not run)`); return; }
  const cases = [...ev.junit.matchAll(/<testcase\b[^>]*\bname="([^"]*)"[^>]*?(\/>|>([\s\S]*?)<\/testcase>)/g)].filter((m) => new RegExp(`(^|[^0-9a-z_])${slug}(__|$)`).test(m[1]));
  if (!cases.length) missing.push(`${label}: no test named *${slug}__*`);
  else if (cases.some((m) => /<(failure|error|skipped)\b/.test(m[3] || ""))) missing.push(`${label}: test(s) *${slug}* failed or were skipped`);
}
function sectionsOf(wp) {
  const table = buildMap.slice(buildMap.indexOf("### Section ownership"), buildMap.indexOf("### Acceptance tests for work packages"));
  const out = [];
  for (const m of table.matchAll(/^\| ([^|]*§[^|]*) \| ([^|]*) \|$/gm)) {
    if (!new RegExp(`\\b${wp}\\b`).test(m[2])) continue;
    for (const s of m[1].matchAll(/\b(0[1-5]) § ([0-9]+(?:\.[0-9]+)*)/g)) out.push(`${s[1]} § ${s[2]}`);
  }
  const row = phaseTables.match(new RegExp(`^\\| ${wp}(?: \\(L\\))? \\| (.*) \\| .* \\|$`, "m"));
  if (row) for (const s of row[1].matchAll(/\b(0[1-5]) § ([0-9]+(?:\.[0-9]+)*)/g)) out.push(`${s[1]} § ${s[2]}`);
  return [...new Set(out)];
}
function wpsOfPhase(n) {
  const out = [];
  let phase = -1;
  for (const line of phaseTables.split(/\r?\n/)) {
    const m = line.match(/^### Phase ([0-9]+)/);
    if (m) phase = Number(m[1]);
    const w = line.match(/^\| (WP-[0-9]{3,4}[a-z]?)(?:\.\.([0-9]{3,4}))? /);
    if (w && phase === n) {
      if (w[2]) for (let k = Number(w[1].slice(3)); k <= Number(w[2]); k++) out.push(`WP-${k}`);
      else out.push(w[1]);
    }
  }
  return out;
}
// The only done claims: a line "WP-<id>: done" or a table row "| WP-<id> | done | …". Any other line
// that pairs a WP id with a completion word is rejected, so a claim can't slip past in another form.
function claimedDone(file) {
  if (!fs.existsSync(p(file))) return [];
  const claims = new Set();
  const COMPLETE = /\b(done|complete|completed|finished|shipped|closed)\b|✅|☑|✔|\[x\]/i;
  const NOT = /^\s*(\|\s*)?WP-[0-9]{3,4}[a-z]?\s*(:|\|)\s*(not\s+done|in\s+progress|blocked|built)\b/i;
  for (const line of fs.readFileSync(p(file), "utf8").split(/\r?\n/)) {
    const a = line.match(/^(WP-[0-9]{3,4}[a-z]?):\s*done\s*$/i) || line.match(/^\|\s*(WP-[0-9]{3,4}[a-z]?)\s*\|\s*done\s*\|/i);
    if (a) claims.add(a[1]);
    else if (/WP-[0-9]{3,4}/.test(line) && COMPLETE.test(line) && !NOT.test(line)) global.push(`unrecognised done claim in ${file} (use "WP-<id>: done" or "| WP-<id> | done |"): ${line.trim().slice(0, 120)}`);
  }
  return [...claims];
}

// ---- evidence producers
function realEvidence() {
  let tree;
  try {
    tree = run("git", ["-C", root, "rev-parse", "HEAD^{tree}"]).trim();
  } catch {
    global.push("not a git repository: evidence must come from a committed tree");
    return { registry: null, junit: null, bin: null };
  }
  const dirty = run("git", ["-C", root, "status", "--porcelain"]).trim();
  if (dirty) global.push("note: uncommitted changes are not evidence — the check builds HEAD only");
  const wt = path.join(os.tmpdir(), `sg-trace-${tree.slice(0, 12)}`);
  if (!fs.existsSync(path.join(wt, ".git"))) {
    try { run("git", ["-C", root, "worktree", "add", "--detach", "--force", wt, "HEAD"]); } catch (e) { global.push(`could not create a clean worktree: ${e.message.split("\n")[0]}`); return { registry: null, junit: null, bin: null }; }
  }
  if (!fs.existsSync(path.join(wt, "Cargo.toml"))) {
    global.push("HEAD has no Cargo workspace yet: nothing can be proven done");
    return { registry: null, junit: null, bin: null };
  }
  const target = path.join(wt, "target");
  try { run("cargo", ["build", "--release", "-p", "sg-cli", "--target-dir", target], { cwd: wt, timeout: 3600_000 }); } catch (e) { global.push(`cargo build failed at HEAD: ${e.message.split("\n")[0]}`); return { registry: null, junit: null, bin: null }; }
  const exe = path.join(target, "release", process.platform === "win32" ? "shipgate.exe" : "shipgate");
  let registry = null;
  try { registry = JSON.parse(run(exe, ["rule", "--list", "--json"], { cwd: wt })); } catch (e) { global.push(`shipgate rule --list --json failed: ${e.message.split("\n")[0]}`); }
  let junit = null;
  try { run("cargo", ["nextest", "run", "--profile", "ci", "--target-dir", target, "--no-fail-fast"], { cwd: wt, timeout: 7200_000 }); } catch { /* failures are read from junit */ }
  const jf = path.join(target, "nextest", "ci", "junit.xml");
  if (fs.existsSync(jf)) junit = fs.readFileSync(jf, "utf8");
  else global.push("cargo nextest produced no junit.xml (profile ci must set junit.path)");
  return { registry, junit, bin: { cmd: exe, args: [] }, tree };
}
function fakeEvidence() {
  const bin = { cmd: process.execPath, args: [path.resolve(fake)] };
  let registry = null;
  try { registry = JSON.parse(run(bin.cmd, [...bin.args, "rule", "--list", "--json"], { cwd: root })); } catch (e) { global.push(`fake registry failed: ${e.message}`); }
  const jf = opt("--fake-junit");
  return { registry, junit: jf && fs.existsSync(jf) ? fs.readFileSync(jf, "utf8") : null, bin };
}

function run(cmd, a, o = {}) {
  return execFileSync(cmd, a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 256 * 1024 * 1024, ...o });
}
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}
function sha256(f) {
  return crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
}

// ---- output
let bad = global.some((g) => !g.startsWith("note:"));
for (const g of global) console.log(`GLOBAL  ${g}`);
for (const r of report) {
  if (r.missing.length) bad = true;
  console.log(`${r.missing.length ? "NOT DONE" : "DONE    "} ${r.wp} (${r.slices} items${r.missing.length ? `, ${r.missing.length} missing` : ""})`);
  for (const m of r.missing.slice(0, 200)) console.log(`         - ${m}`);
}
if (!targets.length) console.log("no work packages selected");
if (opt("--json")) fs.writeFileSync(opt("--json"), JSON.stringify({ global, report }, null, 2) + "\n");
// Real mode records which WPs it proved DONE for this tree (the Stop hook reads it; CI is authoritative).
if (!fake && ev.tree) {
  const f = recordPath(ev.tree);
  if (f) {
    const prev = readRecord(ev.tree) || { tree: ev.tree, done: [] };
    const doneNow = report.filter((r) => !r.missing.length && !global.some((g) => !g.startsWith("note:"))).map((r) => r.wp);
    const notNow = new Set(report.filter((r) => r.missing.length).map((r) => r.wp));
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, JSON.stringify({ tree: ev.tree, done: [...new Set([...prev.done.filter((w) => !notNow.has(w)), ...doneNow])].sort() }, null, 2) + "\n");
  }
}
process.exit(bad ? 1 : 0);
