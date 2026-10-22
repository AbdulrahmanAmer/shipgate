// Mechanical spec checks. Deterministic; exits 1 when any ERROR is found.
// Usage: node tools/trace/spec-lint.mjs [--json out.json] [--quiet]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  allSpecFiles,
  readRequirements,
  readReferences,
  readOwnership,
  readWorkPackages,
  readSections,
  readAcceptanceTests,
} from "./lib.mjs";

const root = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const args = process.argv.slice(2);
const quiet = args.includes("--quiet");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const errors = [];
const warnings = [];
const err = (check, msg) => errors.push({ check, msg });
const warn = (check, msg) => warnings.push({ check, msg });

const specFiles = allSpecFiles(root);
const reqs = readRequirements(root);
const defined = new Map();

// 1. Duplicate definitions
for (const r of reqs) {
  if (defined.has(r.id)) err("duplicate", `${r.id} defined at ${defined.get(r.id).file}:${defined.get(r.id).line} and ${r.file}:${r.line}`);
  else defined.set(r.id, r);
}

// 2. Dangling references (spec + build map + index). IDs stated as unassigned/tombstoned are known.
const known = new Set(defined.keys());
for (const f of specFiles) {
  for (const line of read(f).split(/\r?\n/)) {
    if (/unassigned|tombstone|retired/i.test(line)) for (const m of line.matchAll(/[A-Z][A-Z0-9]{1,5}-[0-9]{3}/g)) known.add(m[0]);
  }
}
const refFiles = [...specFiles, "SPEC.md", "BUILD_MAP.md"];
const dangling = new Map();
for (const ref of readReferences(root, refFiles)) {
  if (/^(WP|SHA|ISO|RFC|UAX|CVE|CWE|ECMA)-/.test(ref.id)) continue;
  if (known.has(ref.id)) continue;
  if (ref.range) continue; // a range may span unassigned numbers; endpoints are checked below
  const k = ref.id;
  if (!dangling.has(k)) dangling.set(k, []);
  dangling.get(k).push(`${ref.file}:${ref.line}`);
}
for (const [id, locs] of dangling) err("dangling", `${id} referenced but not defined: ${locs.slice(0, 4).join(", ")}${locs.length > 4 ? " …" : ""}`);

// 3. Severity and channel vocabulary (channels from 04 § 1.1)
const algo = read("spec/04-algorithms.md");
const gateTable = algo.slice(algo.indexOf("### 1.1"), algo.indexOf("### 1.2"));
const channels = new Set([...gateTable.matchAll(/`([a-z]+)`/g)].map((m) => m[1]));
for (const r of reqs) {
  if (r.kind !== "rule") continue;
  if (!r.severity) {
    if (!/deprecated|tombstone/.test(fs.readFileSync(path.join(root, r.file), "utf8").split(/\r?\n/)[r.line - 1]))
      err("header", `${r.id} (${r.file}:${r.line}) has no "· severity · channels —" header`);
    continue;
  }
  if (!/^(P0|P1|P2|W)†?(\s*\(.*\))?$/.test(r.severity)) err("severity", `${r.id} severity "${r.severity}" not P0/P1/P2/W`);
  for (const c of r.channels) if (!channels.has(c)) err("channel", `${r.id} channel "${c}" is not in 04 § 1.1`);
}

// 4. Ruleset data files referenced by rules must be listed for sourcing in BUILD_MAP (WP-102/WP-104).
const buildMap = read("BUILD_MAP.md");
const sourcing = buildMap.slice(buildMap.indexOf("| WP-102 |"), buildMap.indexOf("### Phase 2"));
const norm = (s) => s.replace(/\.(json|txt)$/, "").replace(/\/<[^>]+>$/, "").toLowerCase();
const listed = new Set([...sourcing.matchAll(/`([^`]+)`/g)].map((m) => norm(m[1])));
const NOT_RULESET = new Set(["business", "ownership", "redirects", "routes", "expected", "report", "review", "refactor"]);
const rulesetRefs = new Map();
for (const f of specFiles) {
  read(f).split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(/ruleset(?:\s+per-locale)?\s+`([^`]+)`(?!\s+(?:selectors?|headings|entries|table|context))/g)) add(m[1], f, i);
  });
}
function add(name, f, i) {
  const n = norm(name);
  if (NOT_RULESET.has(n) || n.includes(".") || n.includes(" ")) return;
  if (!rulesetRefs.has(n)) rulesetRefs.set(n, []);
  rulesetRefs.get(n).push(`${f}:${i + 1}`);
}
for (const [n, locs] of rulesetRefs) {
  if (!listed.has(n)) warn("ruleset-unsourced", `ruleset data "${n}" (${locs[0]}${locs.length > 1 ? ` +${locs.length - 1}` : ""}) is not listed in BUILD_MAP WP-102/WP-104`);
}

// 4b. "ruleset" mentions that name no file ("ruleset maximums", "from the ruleset"), and `x.json`
// names inside packs that aren't sourced and aren't project/product files.
const PRODUCT_FILES = /^(image-sources|launch-forms|budgets|a11y|security|package|package-lock|tsconfig|composer|vercel|netlify|firebase|settings|manifest|business|ownership|redirects|routes|expected|report|review|refactor|dependencies|waiver-requests|counts|cycles|attempts|handoff|lock|debt|policy|shipgate|toolchain|baseline|inventory|flows|seed|approvals|_login|deno|bun|app|angular|nest-cli|turbo|nx|lerna|pnpm-lock|yarn|bower|project|launch|devcontainer|renovate|dependabot|sarif|junit|summary|verify|state|trust|keys|licence|license|feed|schema|targets|intake|site|run|keywords|serps|clusters|competitors|authority|ai-citations|families|priorities|queries|index|ranks|cwv|links|conversions|diff|findings|diagnosis|compare)$/;
for (const f of specFiles) {
  read(f).split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(/\b(?:the |a |its )?ruleset(?:'s)?\b(?!\s+(?:per-locale\s+)?`)(?!\s*\(`)([^.;:)]{0,40})/gi)) {
      const tail = m[1] || "";
      if (!f.startsWith("spec/packs/")) continue; // in 01-05 "ruleset" also means the versioned rule set itself
      if (/`/.test(tail)) continue; // "ruleset dictionary `placeholders.json`"
      if (/^\s*(version|release|data|files?|refresh|YYYY|pinned|snapshot|kill-switch|tables?|lookup|is |are |\(|,|$)/i.test(tail) && !/maxim|equivalent|list|pattern|phrases|labels|values|entries|table of/i.test(tail)) continue;
      warn("ruleset-unnamed", `${f}:${i + 1}: "ruleset${tail.slice(0, 40)}" names no ruleset file`);
    }
    if (!f.startsWith("spec/packs/")) return;
    for (const m of line.matchAll(/`([a-z0-9][a-z0-9-]*)\.json`/g)) {
      const n = m[1].toLowerCase();
      if (PRODUCT_FILES.test(n) || listed.has(n)) continue;
      warn("ruleset-unsourced", `${f}:${i + 1}: \`${m[1]}.json\` is neither listed in BUILD_MAP WP-102/WP-104 nor a known project/product file`);
    }
  });
}

// 5. `<pack>.<key>` policy references must exist as a key in some jsonc policy block.
const policyKeys = new Set();
for (const f of specFiles) for (const m of read(f).matchAll(/"([A-Za-z0-9_-]+)"\s*:/g)) policyKeys.add(m[1]);
// Keys declared in schema tables (first column) and object shapes written as `{ a, b[], c: … }`.
for (const f of specFiles) {
  for (const line of read(f).split(/\r?\n/)) {
    const first = line.match(/^\|\s*`([^`]+)`/);
    const spans = [...line.matchAll(/`([^`]*\{[^`]*)`/g)].map((m) => m[1]);
    for (const s of [first?.[1] ?? "", ...spans]) for (const t of s.matchAll(/[A-Za-z][A-Za-z0-9]*/g)) policyKeys.add(t[0]);
  }
}
const PACK_IDS = ["ux", "privacy", "security", "performance", "accessibility", "architecture", "refactor", "programmatic", "answerEngines", "searchEngines", "ops", "resilience", "testing", "verifyEnv", "project", "verify", "parity", "production"];
for (const f of specFiles) {
  read(f).split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(/`((?:ux|privacy|security|performance|accessibility|architecture|refactor|programmatic|ops|resilience|testing|verifyEnv|project|verify|parity|production)\.[A-Za-z0-9.]+)`/g)) {
      const segs = m[1].split(".").slice(1);
      if (m[1] === "security.txt") continue;
      const missing = segs.filter((s) => !/^[0-9]+$/.test(s) && !policyKeys.has(s));
      if (missing.length) warn("policy-key", `${m[1]} (${f}:${i + 1}): key ${missing.join(".")} not declared in any policy block`);
    }
  });
}
void PACK_IDS;

// 6. Ownership: every requirement owned exactly once for each part (needs trace/ownership.tsv).
const own = readOwnership(root);
const wps = readWorkPackages(root);
if (!own) err("ownership", "trace/ownership.tsv missing");
else {
  const byId = new Map();
  for (const o of own) {
    if (!wps.has(o.wp)) err("ownership", `ownership.tsv:${o.line} ${o.id} → ${o.wp}: no such work package in BUILD_MAP`);
    if (!defined.has(o.id)) err("ownership", `ownership.tsv:${o.line} ${o.id} is not a defined requirement`);
    // Phase 0/1 WPs bootstrap and gather data; they implement no rules.
    if (/^WP-(000|10[0-9])$/.test(o.wp) && !o.id.startsWith("TR-")) err("ownership", `ownership.tsv:${o.line} ${o.id} → ${o.wp}: phase 0/1 work packages implement no rules`);
    const key = `${o.id}\t${o.part}`;
    if (byId.has(key)) err("ownership", `${o.id} part ${o.part} owned twice (ownership.tsv:${byId.get(key).line} and :${o.line})`);
    byId.set(key, o);
  }
  // Channel → the WP that builds that channel's machinery. A slice owned by a WP that doesn't
  // depend (transitively) on it would be built before the thing it needs exists.
  const INFRA = {
    cfg: "WP-203", lock: "WP-205", ast: "WP-303", graph: "WP-303", diff: "WP-301", cmd: "WP-304",
    deps: "WP-705", data: "WP-203", db: "WP-403", contract: "WP-701", build: "WP-409",
    http: "WP-407", html: "WP-408", site: "WP-407", content: "WP-501", browser: "WP-601",
    baseline: "WP-801", edge: "WP-414", review: "WP-207", hook: "WP-306",
    targets: "WP-828", measure: "WP-829",
  };
  const deps = readWpDeps(buildMap.slice(0, buildMap.indexOf("### Section ownership")));
  const closure = (wp, seen = new Set()) => {
    for (const d of deps.get(wp) || []) if (!seen.has(d)) { seen.add(d); closure(d, seen); }
    return seen;
  };
  for (const r of reqs) {
    const rows = own.filter((o) => o.id === r.id);
    if (!rows.length) { err("ownership", `${r.id} (${r.file}:${r.line}) has no owning work package`); continue; }
    const star = rows.find((o) => o.part === "*");
    if (!star) err("ownership", `${r.id} has slice rows but no '*' row for the rest of the rule`);
    for (const o of rows) {
      if (o.part.startsWith("part:") && !r.parts.includes(o.part.slice(5))) err("ownership", `${r.id} ${o.part} (ownership.tsv:${o.line}) is not a part named in the spec text [${r.parts.join(", ")}]`);
      if (o.part.startsWith("channel:") && !r.channels.includes(o.part.slice(8))) err("ownership", `${r.id} ${o.part} (ownership.tsv:${o.line}) is not a channel of the rule [${r.channels.join(", ")}]`);
    }
    if (!star) continue;
    for (const [part, chans] of Object.entries(r.partChannels || {})) {
      if (rows.some((o) => o.part === `part:${part}`)) continue;
      const movedTo = chans.map((c) => rows.find((o) => o.part === `channel:${c}`)?.wp);
      if (movedTo.every((w) => w && w !== star.wp)) err("ownership", `${r.id} part ${part} runs only on [${chans.join(", ")}], owned by ${[...new Set(movedTo)].join("/")}, but stays with '*' owner ${star.wp}: add a part:${part} row`);
    }
    if (star.note.startsWith("infra-ok")) continue;
    const split = new Set(rows.filter((o) => o.part.startsWith("channel:")).map((o) => o.part.slice(8)));
    const partWps = rows.filter((o) => o.part.startsWith("part:")).map((o) => o.wp);
    for (const ch of r.channels) {
      const owners = split.has(ch) ? [rows.find((o) => o.part === `channel:${ch}`).wp] : [star.wp, ...partWps];
      const infra = INFRA[ch];
      if (!infra) continue;
      const ok = owners.some((w) => w === infra || /^WP-(9|10|11)/.test(w) || closure(w).has(infra));
      if (!ok) err("channel-infra", `${r.id} channel ${ch} → ${owners.join("/")}, which doesn't depend on ${infra} (${ch} machinery)`);
    }
  }
}

// 6b. Work-package graph: deps exist, no cycles, no dependency on a later phase.
{
  const deps = readWpDeps(buildMap.slice(0, buildMap.indexOf("### Section ownership")));
  const phaseOf = new Map();
  let phase = -1;
  for (const line of buildMap.slice(0, buildMap.indexOf("### Section ownership")).split(/\r?\n/)) {
    const p = line.match(/^### Phase ([0-9]+)/);
    if (p) phase = Number(p[1]);
    const w = line.match(/^\| (WP-[0-9]{3,4}[a-z]?)/);
    if (w && phase >= 0) phaseOf.set(w[1], phase);
  }
  for (const [wp, ds] of deps) {
    for (const d of ds) {
      if (!wps.has(d)) err("wp-graph", `${wp} depends on ${d}, which is not a work package`);
      else if ((phaseOf.get(d) ?? -1) > (phaseOf.get(wp) ?? 99)) err("wp-graph", `${wp} (phase ${phaseOf.get(wp)}) depends on ${d} (phase ${phaseOf.get(d)}): a later phase`);
    }
  }
  const state = new Map();
  const visit = (wp, stack) => {
    if (state.get(wp) === 2) return;
    if (state.get(wp) === 1) { err("wp-graph", `dependency cycle: ${[...stack, wp].join(" → ")}`); return; }
    state.set(wp, 1);
    for (const d of deps.get(wp) || []) visit(d, [...stack, wp]);
    state.set(wp, 2);
  };
  for (const wp of deps.keys()) visit(wp, []);
}

function readWpDeps(text) {
  const m = new Map();
  for (const row of text.matchAll(/^\| (WP-[0-9]{3,4}[a-z]?)(?:\.\.[0-9]{3,4})?(?: \(L\))? \| .* \| (.*) \|$/gm)) {
    m.set(row[1], [...row[2].matchAll(/WP-[0-9]{3,4}[a-z]?/g)].map((x) => x[0]));
  }
  return m;
}

// 6c. Every WP owns something the done-gate can check.
if (own) {
  const table = buildMap.slice(buildMap.indexOf("### Section ownership"), buildMap.indexOf("### Launch-stable list"));
  for (const row of buildMap.slice(0, buildMap.indexOf("### Section ownership")).matchAll(/^\| (WP-[0-9]{3,4}[a-z]?)(?:\.\.([0-9]{3,4}))?(?: \(L\))? \| (.*) \| .* \|$/gm)) {
    const ids = row[2] ? Array.from({ length: Number(row[2]) - Number(row[1].slice(3)) + 1 }, (_, k) => `WP-${Number(row[1].slice(3)) + k}`) : [row[1]];
    for (const wp of ids) {
      const hasSlice = own.some((o) => o.wp === wp);
      const inTable = new RegExp(`\\b${wp}\\b|every WP card`).test(table) && [...table.matchAll(/^\| ([^|]*§[^|]*) \| ([^|]*) \|$/gm)].some((m) => new RegExp(`\\b${wp}\\b`).test(m[2]));
      const cites = /\b0[1-6] § [0-9]/.test(row[3]);
      const acc = readAcceptanceTests(root).get(wp) || [];
      for (const name of acc) if (!name.startsWith(`wp_${wp.slice(3)}__`)) err("wp-owns-nothing", `${wp} acceptance test ${name} must be named wp_${wp.slice(3)}__<what>`);
      if (!hasSlice && !inTable && !cites && !acc.length) err("wp-owns-nothing", `${wp} owns no requirement slice and no spec section: trace-check could never hold it to anything`);
    }
  }
}

// 7. Numbered sections of 01–06 that no work package references.
const sections = readSections(root);
const wpText = buildMap.slice(buildMap.indexOf("## 5. Phases"), buildMap.indexOf("## 6."));
const sectionRefs = new Set();
for (const m of wpText.matchAll(/\b(0[1-6]) § ([0-9]+(?:\.[0-9]+)*)/g)) {
  sectionRefs.add(`${m[1]} § ${m[2]}`);
  const parts = m[2].split(".");
  for (let n = 1; n < parts.length; n++) sectionRefs.add(`${m[1]} § ${parts.slice(0, n).join(".")}`);
}
for (const s of sections) {
  const covered = [...sectionRefs].some((r) => r === s.ref || r.startsWith(s.ref + ".") || s.ref.startsWith(r + "."));
  if (!covered) err("section-unowned", `${s.ref} "${s.title}" (${s.file}:${s.line}) is not referenced by any work package`);
}

const summary = {
  requirements: reqs.length,
  rules: reqs.filter((r) => r.kind === "rule").length,
  toolRequirements: reqs.filter((r) => r.kind !== "rule").length,
  rulesWithParts: reqs.filter((r) => r.parts.length).length,
  errors: errors.length,
  warnings: warnings.length,
};
const jsonAt = args.indexOf("--json");
if (jsonAt >= 0) fs.writeFileSync(args[jsonAt + 1], JSON.stringify({ summary, errors, warnings }, null, 2) + "\n");
if (!quiet) {
  for (const e of errors) console.log(`ERROR [${e.check}] ${e.msg}`);
  for (const w of warnings) console.log(`WARN  [${w.check}] ${w.msg}`);
}
const byCheck = (list) => Object.entries(list.reduce((a, x) => ((a[x.check] = (a[x.check] || 0) + 1), a), {})).map(([k, v]) => `${k}=${v}`).join(" ");
console.log(`spec-lint: ${JSON.stringify(summary)}`);
console.log(`  errors by check: ${byCheck(errors) || "none"}`);
console.log(`  warnings by check: ${byCheck(warnings) || "none"}`);
process.exit(errors.length ? 1 : 0);
