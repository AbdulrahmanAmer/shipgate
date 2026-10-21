// One-off helper: draft trace/ownership.tsv from BUILD_MAP.md prose. Prints conflicts and orphans
// for a human/orchestrator to resolve; the reviewed TSV (not this script) is the source of truth.
// Usage: node tools/trace/bootstrap-ownership.mjs [--write]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readRequirements, expandRange, ID_REF_RE } from "./lib.mjs";

const root = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const reqs = readRequirements(root);
const text = fs.readFileSync(path.join(root, "BUILD_MAP.md"), "utf8");

// WP rows: "| WP-410 (L) | goal | deps |"
const rows = [...text.matchAll(/^\| (WP-[0-9]{3,4}(?:\.\.[0-9]{3,4})?)(?: \(L\))? \| (.*) \| (.*) \|$/gm)].map((m) => ({
  wp: m[1],
  goal: m[2],
}));

// Family wildcards stated in prose, per WP. Explicit, reviewed list (prose is not machine-parseable).
const FAMILY_DEFAULT = {
  "WP-410": ["RTE", "URL", "MET", "SCH", "LNK", "IDX", "I18", "KW", "WCF", "CQ", "TRS"],
  "WP-411": ["SE", "LOC"],
  "WP-412": ["AEO"],
  "WP-502": ["PCF", "DAT"],
  "WP-504": ["TPL", "CNT", "PLK"],
  "WP-506": ["ROL", "CRW"],
  "WP-604": ["PRF"],
  "WP-605": ["A11"],
  "WP-606": ["PRV"],
  "WP-607": ["TST"],
  "WP-609": ["UX"],
  "WP-701": ["API", "DB", "JOB"],
  "WP-702": ["ARC"],
  "WP-703": ["RES", "OPS"],
  "WP-801": ["REF"],
  "WP-413": ["SEC"],
  "WP-304": ["AGT"],
  "WP-203": ["CFG"],
};

// Reviewed resolutions for IDs the prose mentions in several WPs, and for unowned IDs.
// Scope: "*" (whole rule / everything not split off) | "part:<name>" | "channel:<name>".
const OVERRIDES = {
  "CFG-001": [["*", "WP-203"]], "CFG-002": [["*", "WP-203"]], "CFG-003": [["*", "WP-203"]],
  "CFG-004": [["*", "WP-203", "live-key prefixes data from WP-104"]], "CFG-005": [["*", "WP-203"]],
  "CFG-006": [["*", "WP-203"]], "CFG-007": [["*", "WP-203"]], "CFG-008": [["*", "WP-203"]],
  "CFG-009": [["*", "WP-203"], ["channel:edge", "WP-414"]],
  "AGT-009": [["*", "WP-304"], ["channel:deps", "WP-705", "npm deprecation/licence snapshot"]],
  "AGT-011": [["*", "WP-304"], ["channel:browser", "WP-608", "comparison pass 04 § 2 item 6"], ["channel:http", "WP-608"]],
  "A11-026": [["*", "WP-605", "PDF parser crate sourced by WP-102"]],
  "DB-010": [["*", "WP-701", "statement logging infrastructure from WP-415"]],
  "PRF-002": [["*", "WP-604", "click probe infrastructure from WP-602"]],
  "PRF-008": [["*", "WP-604"], ["channel:edge", "WP-414"]],
  "PRF-020": [["*", "WP-703"]],
  "CNT-009": [["*", "WP-504"], ["channel:browser", "WP-608"]],
  "SE-008": [["*", "WP-414"]],
  "SE-106": [["*", "WP-411"], ["channel:browser", "WP-608"]],
  "SE-122": [["*", "WP-608"]], "SE-123": [["*", "WP-608"]], "SE-124": [["*", "WP-608"]],
  "SE-401": [["*", "WP-608"]],
  "SEC-058": [["*", "WP-607"], ["channel:edge", "WP-414"]],
  "SEC-056": [["*", "WP-414", "webpki root store sourced by WP-102"]],
  "SEC-047": [["*", "WP-413"], ["part:stored", "WP-607"]],
  "SEC-050": [["*", "WP-304", "provider patterns from WP-104"]],
  "SEC-053": [["*", "WP-705", "registry snapshot sourced by WP-102"]],
  "SEC-073": [["*", "WP-413", "WordPress feed sourced by WP-102"]],
  "UX-009": [["*", "WP-801"]],
  "RTE-001": [["*", "WP-410"], ["channel:browser", "WP-608"]],
  "URL-002": [["*", "WP-410"], ["channel:edge", "WP-414"]],
  "URL-011": [["*", "WP-414"]],
  "MET-005": [["*", "WP-410"], ["part:fetchers", "WP-414"]],
  "MET-011": [["*", "WP-410"], ["channel:browser", "WP-608", "incl. dead-anchor; uses WP-602 control inventory"]],
  "MET-012": [["*", "WP-410"], ["channel:browser", "WP-608"]],
  "LNK-006": [["*", "WP-414"]], "LNK-007": [["*", "WP-414"]], "IDX-011": [["*", "WP-414"]],
  "IDX-005": [["*", "WP-410"], ["part:preview-edge", "WP-414"]],
  "IDX-016": [["*", "WP-608"]],
  "CQ-002": [["*", "WP-501"]], "CQ-008": [["*", "WP-501"]],
  "CQ-007": [["*", "WP-410", "Hunspell dictionaries sourced by WP-102"]],
  "SEC-010": [["*", "WP-413"], ["channel:edge", "WP-414"]],
  "AEO-014": [["*", "WP-412"], ["channel:browser", "WP-608"]],
  "BLD-005": [["*", "WP-409"]],
  "TR-001": [["*", "WP-401"]], "TR-002": [["*", "WP-402"]], "TR-003": [["*", "WP-403"]],
  "TR-004": [["*", "WP-704"]], "TR-005": [["*", "WP-919"]], "TR-006": [["*", "WP-402"]],
  "TR-007": [["*", "WP-406"]],
  "TR-101": [["*", "WP-307"]], "TR-102": [["*", "WP-207"]], "TR-103": [["*", "WP-209", "double-run harness; every report path"]],
  "TR-104": [["*", "WP-209", "tree-unchanged assertion after every corpus verify"]], "TR-105": [["*", "WP-208"]],
  "TR-106": [["*", "WP-406", "egress proxy enforces the network allowlist"]], "TR-107": [["*", "WP-207"]],
  "TR-108": [["*", "WP-306"]], "TR-109": [["*", "WP-308"]], "TR-110": [["*", "WP-207"]],
  "TR-111": [["*", "WP-604"]], "TR-112": [["*", "WP-307"]],
  "KW-003": [["*", "WP-505", "stop words/stemmer data from WP-104"]],
  "UX-006": [["*", "WP-609", "control inventory and click probe built in WP-602"]],
  // channel-infra resolutions (round 6)
  "CFG-003": [["*", "WP-203"], ["channel:http", "WP-407", "crawl discovery in G4"]],
  "AGT-001": [["*", "WP-304"], ["channel:hook", "WP-306"]],
  "AGT-002": [["*", "WP-304"], ["channel:hook", "WP-306"]],
  "AGT-007": [["*", "WP-304"], ["channel:hook", "WP-306"]],
  "AGT-008": [["*", "WP-304"], ["channel:hook", "WP-306"]],
  "AGT-005": [["*", "WP-801", "needs _main routes.jsonl from baseline capture"]],
  "AGT-006": [["*", "WP-304"], ["channel:html", "WP-410"]],
  "AEO-012": [["*", "WP-801", "_main routes.jsonl comparison"]],
  "CQ-006": [["*", "WP-801", "_main routes.jsonl comparison"]],
  "BLD-005": [["*", "WP-409", "infra-ok: health check is WP-402's supervisor, not the crawler"]],
  "DAT-007": [["*", "WP-502"], ["channel:html", "WP-504"]],
  "DAT-010": [["*", "WP-502"], ["channel:html", "WP-504"]],
  "CRW-001": [["*", "WP-506"], ["channel:edge", "WP-414"]],
  "SEC-015": [["*", "WP-413"], ["channel:edge", "WP-414"]],
  "SEC-016": [["*", "WP-413"], ["channel:edge", "WP-414"]],
  "SEC-034": [["*", "WP-413"], ["channel:edge", "WP-414"]],
  "SEC-073": [["*", "WP-413", "infra-ok: WordPress feed matching is self-contained; feed fetched by WP-401"]],
};

const mentions = new Map(); // id -> Set(wp)
const re = ID_REF_RE();
for (const { wp, goal } of rows) {
  for (const m of goal.matchAll(re)) {
    for (const id of expandRange(m[0])) {
      if (!mentions.has(id)) mentions.set(id, new Set());
      mentions.get(id).add(wp);
    }
  }
}

const out = [];
const conflicts = [];
const orphans = [];
for (const r of reqs) {
  const ms = mentions.get(r.id);
  if (OVERRIDES[r.id]) for (const [scope, wp, note = "resolved"] of OVERRIDES[r.id]) out.push([r.id, scope, wp, note]);
  else if (ms && ms.size === 1) out.push([r.id, "*", [...ms][0], "explicit"]);
  else if (ms && ms.size > 1) conflicts.push(`${r.id}\t${[...ms].join(",")}`);
  else {
    const fam = Object.entries(FAMILY_DEFAULT).filter(([, fams]) => fams.includes(r.family)).map(([wp]) => wp);
    if (fam.length === 1) out.push([r.id, "*", fam[0], "family-default"]);
    else orphans.push(`${r.id}\t${r.file}:${r.line}`);
  }
}
console.log(`requirements ${reqs.length} · owned ${out.length} · multi-mention ${conflicts.length} · orphans ${orphans.length}`);
console.log("--- multi-mention (resolve to part-level rows)\n" + conflicts.join("\n"));
console.log("--- orphans\n" + orphans.join("\n"));
if (process.argv.includes("--write")) {
  if (fs.existsSync(path.join(root, "trace/ownership.tsv")) && !process.argv.includes("--force")) {
    console.error("trace/ownership.tsv exists and is the source of truth; edit it directly (or pass --force to regenerate).");
    process.exit(2);
  }
  fs.mkdirSync(path.join(root, "trace"), { recursive: true });
  const header = [
    "# Requirement ownership: the single source of truth for which work package builds what.",
    "# Columns: ID<TAB>scope<TAB>WP<TAB>note. scope = * | part:<name> | channel:<name>.",
    "# Every rule needs a '*' row; a part or channel row moves that slice to another WP.",
    "# Edit this file (not BUILD_MAP prose) when ownership changes; spec-lint enforces it.",
  ];
  fs.writeFileSync(path.join(root, "trace/ownership.tsv"), [...header, ...out.map((r) => r.join("\t"))].join("\n") + "\n");
}
