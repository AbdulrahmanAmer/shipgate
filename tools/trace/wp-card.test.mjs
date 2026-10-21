// Watched-fail test for wp-card: the card is the builder's whole brief, so anything trace-check
// will demand must be on it.
// Usage: node tools/trace/wp-card.test.mjs
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readOwnership, readAcceptanceTests } from "./lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const card = (...a) => execFileSync(process.execPath, [path.join(here, "wp-card.mjs"), ...a], { encoding: "utf8" });
const own = readOwnership(root);
const acc = readAcceptanceTests(root);
const cases = [
  ["a sub-package not yet in ownership.tsv inherits its base's slices", () => {
    const n = own.filter((o) => o.wp === "WP-410").length;
    return card("WP-410a").includes(`**Requirement slices:** ${n} `);
  }],
  ["every acceptance test of WP-000 is on its card", () => {
    const c = card("WP-000", "--checklist");
    return (acc.get("WP-000") || []).length > 0 && acc.get("WP-000").every((t) => c.includes(t));
  }],
  ["goal-cited sections appear as owed tests", () => card("WP-404", "--checklist").includes("wp_404__sec_04_4_2__")],
  ["preamble sections are not owed tests", () => !card("WP-000", "--checklist").includes("sec_01_1__")],
  ["failure classes column is present", () => card("WP-412", "--checklist").includes("Failure classes")],
  ["deferred format is spelled out", () => card("WP-412").includes("ID<TAB>scope<TAB>WP<TAB>reason")],
  ["slices owned elsewhere are named as not-here", () => card("WP-410").includes("Not in this WP:")],
];
let failed = 0;
for (const [name, fn] of cases) {
  let ok = false;
  try { ok = fn(); } catch (e) { ok = false; console.log(`     ${e.message.split("\n")[0]}`); }
  console.log(`${ok ? "ok  " : "FAIL"} ${name}`);
  if (!ok) failed++;
}
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
