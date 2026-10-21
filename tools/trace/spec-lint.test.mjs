// Watched-fail test for spec-lint: plant one defect per check in a temp copy of the repo and
// assert spec-lint reports it (and that the untouched copy is clean).
// Usage: node tools/trace/spec-lint.test.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const COPY = ["SPEC.md", "BUILD_MAP.md", "spec", "trace", "tools"];

function fresh() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "spec-lint-"));
  for (const p of COPY) fs.cpSync(path.join(root, p), path.join(dir, p), { recursive: true });
  return dir;
}
function lint(dir) {
  const out = path.join(dir, "lint.json");
  try {
    execFileSync(process.execPath, [path.join(dir, "tools/trace/spec-lint.mjs"), "--quiet", "--json", out], { stdio: "pipe" });
  } catch {}
  return JSON.parse(fs.readFileSync(out, "utf8"));
}
function edit(dir, file, from, to) {
  const p = path.join(dir, file);
  const t = fs.readFileSync(p, "utf8");
  if (!t.includes(from)) throw new Error(`fixture setup: "${from.slice(0, 60)}" not in ${file}`);
  fs.writeFileSync(p, t.split(from).join(to));
}

const cases = [
  ["clean copy has no findings", () => {}, (r) => r.errors.length === 0 && r.warnings.length === 0],
  ["duplicate", (d) => edit(d, "spec/packs/resilience.md", "## 2. Rules", "## 2. Rules\n\n- **UX-001** · P0 · html — duplicate."), (r) => r.errors.some((e) => e.check === "duplicate" && e.msg.startsWith("UX-001"))],
  ["dangling", (d) => edit(d, "spec/packs/ux.md", "Form coverage of the testing pack", "See UX-099. Form coverage of the testing pack"), (r) => r.errors.some((e) => e.check === "dangling" && e.msg.startsWith("UX-099"))],
  ["channel", (d) => edit(d, "spec/packs/ux.md", "**UX-012** · W · html, browser", "**UX-012** · W · html, telepathy"), (r) => r.errors.some((e) => e.check === "channel" && e.msg.includes("telepathy"))],
  ["severity", (d) => edit(d, "spec/packs/ux.md", "**UX-012** · W ·", "**UX-012** · P9 ·"), (r) => r.errors.some((e) => e.check === "severity")],
  ["ruleset-unsourced", (d) => edit(d, "spec/packs/privacy.md", "ruleset per-locale `sct-labels`", "ruleset per-locale `made-up-phrases`"), (r) => r.warnings.some((w) => w.check === "ruleset-unsourced" && w.msg.includes("made-up-phrases"))],
  ["policy-key", (d) => edit(d, "spec/packs/ux.md", "`ux.stockSources`", "`ux.stockSourcez`"), (r) => r.warnings.some((w) => w.check === "policy-key" && w.msg.includes("stockSourcez"))],
  ["ownership: missing row", (d) => edit(d, "trace/ownership.tsv", "UX-012\t*\tWP-609", "#removed"), (r) => r.errors.some((e) => e.check === "ownership" && e.msg.startsWith("UX-012"))],
  ["ownership: unknown WP", (d) => edit(d, "trace/ownership.tsv", "UX-012\t*\tWP-609", "UX-012\t*\tWP-999"), (r) => r.errors.some((e) => e.check === "ownership" && e.msg.includes("WP-999"))],
  ["ownership: bogus part", (d) => edit(d, "trace/ownership.tsv", "SEC-047\tpart:stored", "SEC-047\tpart:nonsense"), (r) => r.errors.some((e) => e.check === "ownership" && e.msg.includes("part:nonsense"))],
  ["ownership: data WP owns a rule", (d) => edit(d, "trace/ownership.tsv", "SE-103	*	WP-411", "SE-103	*	WP-104"), (r) => r.errors.some((e) => e.check === "ownership" && e.msg.includes("phase 0/1"))],
  ["channel-infra", (d) => edit(d, "trace/ownership.tsv", "AEO-009\tchannel:browser\tWP-608", "#moved"), (r) => r.errors.some((w) => w.check === "channel-infra")],
  ["wp-graph: cycle", (d) => edit(d, "BUILD_MAP.md", "| WP-201 | `sg-core`: shared types from spec 01 § 4 and 04 § 1 (incl. finding parts 04 § 1.8, failure classes 04 § 9.1) | WP-000 |", "| WP-201 | `sg-core`: shared types from spec 01 § 4 and 04 § 1 (incl. finding parts 04 § 1.8, failure classes 04 § 9.1) | WP-000, WP-202 |"), (r) => r.errors.some((e) => e.check === "wp-graph" && e.msg.includes("cycle"))],
  ["wp-graph: later phase", (d) => edit(d, "BUILD_MAP.md", "| WP-201 | `sg-core`: shared types from spec 01 § 4 and 04 § 1 (incl. finding parts 04 § 1.8, failure classes 04 § 9.1) | WP-000 |", "| WP-201 | `sg-core`: shared types from spec 01 § 4 and 04 § 1 (incl. finding parts 04 § 1.8, failure classes 04 § 9.1) | WP-000, WP-601 |"), (r) => r.errors.some((e) => e.check === "wp-graph" && e.msg.includes("later phase"))],
  ["ruleset-unnamed", (d) => edit(d, "spec/packs/ux.md", "Pages matching `chromeVariants` are excluded.", "Pages matching `chromeVariants` are excluded. Limits come from the ruleset maximums for each kind."), (r) => r.warnings.some((w) => w.check === "ruleset-unnamed" && w.msg.includes("ux.md"))],
  ["wp-owns-nothing", (d) => edit(d, "BUILD_MAP.md", "| WP-404 | MySQL embedded lifecycle (04 § 4.2, 03 § 3.4; same template/reset contract as WP-403) |", "| WP-404 | MySQL embedded lifecycle |"), (r) => r.errors.some((e) => e.check === "wp-owns-nothing" && e.msg.startsWith("WP-404"))],
  ["stranded browser-only part", (d) => edit(d, "trace/ownership.tsv", "MET-011\tpart:dead-anchor\tWP-608", "#moved"), (r) => r.errors.some((e) => e.check === "ownership" && e.msg.includes("MET-011 part dead-anchor"))],
  ["section-unowned", (d) => edit(d, "BUILD_MAP.md", "| 05 § 4 MCP server | WP-804 |", "| MCP server | WP-804 |"), (r) => r.errors.some((w) => w.check === "section-unowned" && w.msg.startsWith("05 § 4 "))],
];

let failed = 0;
for (const [name, plant, expect] of cases) {
  const dir = fresh();
  let ok = false;
  let detail = "";
  try {
    plant(dir);
    const r = lint(dir);
    ok = expect(r);
    if (!ok) detail = JSON.stringify({ errors: r.errors.slice(0, 3), warnings: r.warnings.slice(0, 3) });
  } catch (e) {
    detail = String(e.message);
  }
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : `\n     ${detail}`}`);
  if (!ok) failed++;
}
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
