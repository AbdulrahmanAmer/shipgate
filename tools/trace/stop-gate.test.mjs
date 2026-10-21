// Watched-fail test for the Stop hook: every claim form blocks unless a real-mode record for the
// current tree proves it; a proven canonical claim and a "not done" line are allowed.
// Usage: node tools/trace/stop-gate.test.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const q = { stdio: "ignore" };
function repo(state, record) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "stop-gate-"));
  for (const x of ["BUILD_MAP.md", "SPEC.md", "spec", "trace", "tools"]) fs.cpSync(path.join(root, x), path.join(dir, x), { recursive: true });
  execFileSync("git", ["-C", dir, "init", "-q"], q);
  execFileSync("git", ["-C", dir, "add", "-A"], q);
  execFileSync("git", ["-C", dir, "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "t"], q);
  if (state !== null) fs.writeFileSync(path.join(dir, "BUILD_STATE.md"), state + "\n");
  if (record) {
    const tree = execFileSync("git", ["-C", dir, "rev-parse", "HEAD^{tree}"], { encoding: "utf8" }).trim();
    fs.mkdirSync(path.join(dir, ".git/shipgate-trace"), { recursive: true });
    fs.writeFileSync(path.join(dir, ".git/shipgate-trace", `${tree}.json`), JSON.stringify({ tree, done: record }));
  }
  return dir;
}
function hook(dir) {
  const out = execFileSync(process.execPath, [path.join(dir, "tools/trace/stop-gate.mjs")], { encoding: "utf8", env: { ...process.env, SHIPGATE_ROOT: dir } });
  return out.includes('"decision":"block"') ? "block" : "allow";
}
const cases = [
  ["no BUILD_STATE.md → allow", null, null, "allow"],
  ["canonical claim without a record → block", "WP-412: done", null, "block"],
  ["canonical claim with a record for this tree → allow", "WP-412: done", ["WP-412"], "allow"],
  ["record for another WP → block", "WP-412: done", ["WP-410"], "block"],
  ["table claim without record → block", "| WP-412 | done | answer engines |", null, "block"],
  ["em-dash claim → block", "WP-412 — done", ["WP-412"], "block"],
  ["checkbox claim → block", "- [x] WP-412", ["WP-412"], "block"],
  ["emoji claim → block", "| WP-412 | ✅ |", ["WP-412"], "block"],
  ["'complete' claim → block", "WP-412: complete", ["WP-412"], "block"],
  ["'not done' line → allow", "WP-412: not done", null, "allow"],
  ["'built' status → allow", "WP-412: built", null, "allow"],
];
let failed = 0;
for (const [name, state, record, want] of cases) {
  let got;
  try { const d = repo(state, record); got = hook(d); fs.rmSync(d, { recursive: true, force: true }); } catch (e) { got = `error: ${e.message.split("\n")[0]}`; }
  const ok = got === want;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : ` (got ${got})`}`);
  if (!ok) failed++;
}
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
