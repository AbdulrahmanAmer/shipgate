// Watched-fail test for the merge gate: a branch touching any contract file is refused; a branch
// touching only code (and spec/CHANGES.md proposals) passes.
// Usage: node tools/trace/merge-gate.test.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const q = { stdio: "ignore" };
const git = (d, ...a) => execFileSync("git", ["-C", d, "-c", "user.email=t@t", "-c", "user.name=t", ...a], q);
function repo(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "merge-gate-"));
  const seed = ["corpus/FIXTURES.lock", "corpus/ux/UX-001/spec/kb/expected.json", "trace/ownership.tsv", "tools/trace/trace-check.mjs", "spec/packs/ux.md", "spec/CHANGES.md", "crates/sg-core/src/lib.rs"];
  for (const f of seed) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), "x\n"); }
  git(dir, "init", "-q", "-b", "main");
  git(dir, "add", "-A");
  git(dir, "commit", "-qm", "base");
  git(dir, "checkout", "-q", "-b", "builder");
  for (const f of files) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.appendFileSync(path.join(dir, f), "y\n"); }
  git(dir, "add", "-A");
  git(dir, "commit", "-qm", "work", "--allow-empty");
  return dir;
}
function gate(dir) {
  try { execFileSync(process.execPath, [path.join(here, "merge-gate.mjs"), "builder", "--root", dir], { encoding: "utf8" }); return "ok"; } catch { return "refused"; }
}
const cases = [
  ["code only → ok", ["crates/sg-core/src/lib.rs"], "ok"],
  ["spec/CHANGES.md proposal → ok", ["spec/CHANGES.md", "crates/sg-core/src/lib.rs"], "ok"],
  ["re-hashed FIXTURES.lock → refused", ["corpus/FIXTURES.lock"], "refused"],
  ["edited locked expected.json → refused", ["corpus/ux/UX-001/spec/kb/expected.json"], "refused"],
  ["new file in a holdout dir → refused", ["corpus/ux/UX-001/holdout/new/expected.json"], "refused"],
  ["moved a slice in ownership.tsv → refused", ["trace/ownership.tsv"], "refused"],
  ["patched trace-check → refused", ["tools/trace/trace-check.mjs"], "refused"],
  ["edited the spec → refused", ["spec/packs/ux.md"], "refused"],
];
let failed = 0;
for (const [name, files, want] of cases) {
  let got;
  try { const d = repo(files); got = gate(d); fs.rmSync(d, { recursive: true, force: true }); } catch (e) { got = `error: ${e.message.split("\n")[0]}`; }
  const ok = got === want;
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : ` (got ${got})`}`);
  if (!ok) failed++;
}
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
