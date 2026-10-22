// Merge gate: a builder branch may not change the contract it is judged against. The orchestrator
// runs this before merging any builder/reviewer branch; contract changes are made on main by the
// orchestrator only (BUILD_MAP § 4.1 item 3).
// Protected: locked fixtures and their lock, the ownership ledger, deferred list, the trace tools,
// the spec (except spec/CHANGES.md proposals), BUILD_MAP, the audit loop and the Claude settings.
// Usage: node tools/trace/merge-gate.mjs <branch> [--base main] [--root dir]
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const branch = args.find((a, i) => !a.startsWith("--") && !["--base", "--root"].includes(args[i - 1]));
const base = opt("--base", "main");
const root = path.resolve(opt("--root", fileURLToPath(new URL("../..", import.meta.url))));
if (!branch) {
  console.error("usage: merge-gate.mjs <branch> [--base main]");
  process.exit(2);
}
export const PROTECTED = [
  /^corpus\/FIXTURES\.lock$/,
  /^corpus\/.+\/(spec|holdout)\//,
  /^trace\//,
  /^tools\/trace\//,
  /^spec\/(?!CHANGES\.md$)/,
  /^SPEC\.md$/,
  /^BUILD_MAP\.md$/,
  /^ORCHESTRATOR_PROMPT\.md$/,
  /^audit\//,
  /^\.claude\//,
  /^CLAUDE\.md$/,
  // WP acceptance tests are written by the orchestrator before the builder starts (BUILD_MAP § 4.1 item 3).
  /(^|\/)tests\/wp_[0-9]{3,4}[a-z]?(_[a-z0-9_]+)?\.rs$/,
];
const changed = execFileSync("git", ["-C", root, "diff", "--name-only", `${base}...${branch}`], { encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);
const hits = changed.filter((f) => PROTECTED.some((re) => re.test(f)));
if (hits.length) {
  console.log(`REFUSED  ${branch} changes ${hits.length} contract file(s) (only the orchestrator changes these, on ${base}):`);
  for (const h of hits.slice(0, 50)) console.log(`         - ${h}`);
  process.exit(1);
}
console.log(`OK       ${branch}: ${changed.length} file(s) changed, none of them contract files`);
