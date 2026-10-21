// Watched-fail test for trace-check: synthesise complete evidence for one WP (must be DONE), then
// remove or corrupt one piece at a time (each must be NOT DONE for the right reason).
// Usage: node tools/trace/trace-check.test.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readRequirements, readOwnership } from "./lib.mjs";

const root = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const WP = "WP-412";
const reqs = new Map(readRequirements(root).map((r) => [r.id, r]));
const own = readOwnership(root);
const mine = own.filter((o) => o.wp === WP);
if (!mine.length) throw new Error(`${WP} owns nothing — pick another WP for the test`);

function evidence() {
  const rules = [];
  const fixtures = [];
  for (const o of mine) {
    const r = reqs.get(o.id);
    const split = own.filter((x) => x.id === o.id && x.wp !== WP);
    const parts = r.parts.filter((p) => !split.some((s) => s.part === `part:${p}`));
    rules.push({ id: o.id, parts, channels: r.channels, failureClasses: ["missing-element"], lifecycle: "experimental" });
    for (const part of ["main", ...parts]) {
      for (const kind of ["known-bad", "holdout"]) {
        fixtures.push({ path: `${o.id}/${kind}-${part}/expected.json`, kind, rule: o.id, part, failureClass: "missing-element", pass: true, actual: [{ rule: o.id, channel: r.channels[0] }] });
      }
    }
    fixtures.push({ path: `${o.id}/good/expected.json`, kind: "known-good", rule: o.id, part: "main", pass: true, actual: [] });
  }
  return { rules, fixtures };
}

function setup(mutate) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "trace-check-"));
  for (const x of ["BUILD_MAP.md", "SPEC.md", "spec", "trace", "tools"]) fs.cpSync(path.join(root, x), path.join(dir, x), { recursive: true });
  const ev = evidence();
  const ctx = { dir, ev, treeHash: "TREE", junit: `<testsuites><testsuite><testcase name="sec_placeholder"/></testsuite></testsuites>`, lockSkip: null };
  mutate?.(ctx);
  fs.mkdirSync(path.join(dir, "target/trace"), { recursive: true });
  fs.mkdirSync(path.join(dir, "target/nextest/ci"), { recursive: true });
  fs.writeFileSync(path.join(dir, "target/trace/registry.json"), JSON.stringify({ treeHash: ctx.treeHash, rules: ctx.ev.rules }));
  fs.writeFileSync(path.join(dir, "target/trace/corpus-results.json"), JSON.stringify({ treeHash: ctx.treeHash, fixtures: ctx.ev.fixtures }));
  fs.writeFileSync(path.join(dir, "target/nextest/ci/junit.xml"), ctx.junit);
  // fixture files + lock
  const lock = [];
  for (const f of ctx.ev.fixtures) {
    if (f.kind === "known-good") continue;
    const file = path.join(dir, "corpus", f.path);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(f));
    if (f.path !== ctx.lockSkip) lock.push(`${crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")}  ${f.path}`);
  }
  fs.writeFileSync(path.join(dir, "corpus/FIXTURES.lock"), lock.join("\n") + "\n");
  ctx.after?.(dir);
  return dir;
}
function run(dir, extra = ["--no-tree-check"]) {
  try {
    const out = execFileSync(process.execPath, [path.join(dir, "tools/trace/trace-check.mjs"), ...(extra.includes("--wp") || extra.includes("--claimed") ? [] : ["--wp", WP]), ...extra], { encoding: "utf8" });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: String(e.stdout) };
  }
}

const first = mine[0].id;
const cases = [
  ["complete evidence → DONE", null, (r) => r.code === 0 && /DONE {4} WP-412/.test(r.out)],
  ["rule missing from registry", (c) => (c.ev.rules = c.ev.rules.filter((x) => x.id !== first)), (r) => r.code === 1 && r.out.includes(`${first}: not registered`)],
  ["known-bad not detected", (c) => c.ev.fixtures.filter((f) => f.rule === first && f.kind === "known-bad").forEach((f) => (f.pass = false)), (r) => r.code === 1 && r.out.includes("known-bad fixture(s) for part 'main' not detected")],
  ["no holdout fixture", (c) => (c.ev.fixtures = c.ev.fixtures.filter((f) => !(f.rule === first && f.kind === "holdout"))), (r) => r.code === 1 && r.out.includes(`${first}: no holdout fixture`)],
  ["known-good produces findings", (c) => c.ev.fixtures.filter((f) => f.rule === first && f.kind === "known-good").forEach((f) => (f.pass = false)), (r) => r.code === 1 && r.out.includes("known-good fixture(s) produce findings")],
  ["registered part missing", (c) => { const x = c.ev.rules.find((x) => x.parts.length); if (!x) throw new Error("no rule with parts in WP"); c.part = x; x.parts = []; }, (r) => r.code === 1 && /part '[a-z-]+' not registered/.test(r.out)],
  ["failure class without fixture", (c) => c.ev.rules.find((x) => x.id === first).failureClasses.push("leak"), (r) => r.code === 1 && r.out.includes("failure class 'leak'")],
  ["stale evidence", (c) => { c.after = (dir) => { const q = { stdio: "ignore" }; execFileSync("git", ["-C", dir, "init", "-q"], q); execFileSync("git", ["-C", dir, "add", "-A"], q); execFileSync("git", ["-C", dir, "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "t"], q); }; }, (r) => r.code === 1 && r.out.includes("stale evidence"), []],
  ["fixture not in lock", (c) => (c.lockSkip = `${first}/known-bad-main/expected.json`), (r) => r.code === 1 && r.out.includes("not in corpus/FIXTURES.lock")],
  ["locked fixture edited by builder", (c) => (c.after = (dir) => fs.appendFileSync(path.join(dir, "corpus", `${first}/known-bad-main/expected.json`), " ")), (r) => r.code === 1 && r.out.includes("locked fixture modified")],
  ["WP owning nothing is not done", null, (r) => r.code === 1 && r.out.includes("owns no requirement slice"), ["--no-tree-check", "--wp", "WP-399"]],
  ["missed locked holdout not hidden by a passing one", (c) => c.ev.fixtures.push({ path: `${first}/holdout-main-2/expected.json`, kind: "holdout", rule: first, part: "main", failureClass: "missing-element", pass: false, actual: [] }), (r) => r.code === 1 && r.out.includes("holdout fixture(s) for part 'main' not detected")],
  ["section not proven by a longer section id", (c) => (c.junit = '<testsuites><testsuite><testcase name="crate::mcp::sec_05_4_1__tools"/></testsuite></testsuites>'), (r) => r.code === 1 && r.out.includes("no test named *sec_05_4__*"), ["--no-tree-check", "--wp", "WP-804"]],
  ["section proven by its own id", (c) => (c.junit = '<testsuites><testsuite><testcase name="crate::mcp::sec_05_4__server"/></testsuite></testsuites>'), (r) => r.code === 0, ["--no-tree-check", "--wp", "WP-804"]],
  ["unlocked file in a locked fixture dir", (c) => (c.after = (dir) => { fs.mkdirSync(path.join(dir, "corpus/x/spec"), { recursive: true }); fs.writeFileSync(path.join(dir, "corpus/x/spec/policy.json"), "{}"); }), (r) => r.code === 1 && r.out.includes("unlocked file in a locked fixture directory")],
  ["unrecognised done claim", (c) => (c.after = (dir) => fs.writeFileSync(path.join(dir, "BUILD_STATE.md"), "| WP-412 | answer engines | done |\n")), (r) => r.code === 1 && r.out.includes("unrecognised done claim"), ["--no-tree-check", "--claimed", "BUILD_STATE.md"]],
  ["evidence found via .cargo/config.toml target-dir", (c) => (c.after = (dir) => { fs.renameSync(path.join(dir, "target"), path.join(dir, "tgt")); fs.mkdirSync(path.join(dir, ".cargo")); fs.writeFileSync(path.join(dir, ".cargo/config.toml"), '[build]\ntarget-dir = "tgt"\n'); }), (r) => r.code === 0],
  ["acceptance-test WP done with its tests", (c) => (c.junit = '<testsuites><testsuite><testcase name="xtask::wp_000__workspace_builds_and_lints"/><testcase name="xtask::wp_000__ci_runs_trace_gates"/></testsuite></testsuites>'), (r) => r.code === 0, ["--no-tree-check", "--wp", "WP-000"]],
  ["acceptance-test WP not done without one", (c) => (c.junit = '<testsuites><testsuite><testcase name="xtask::wp_000__workspace_builds_and_lints"/></testsuite></testsuites>'), (r) => r.code === 1 && r.out.includes("wp_000__ci_runs_trace_gates"), ["--no-tree-check", "--wp", "WP-000"]],
  ["deferred slice", (c) => (c.after = (dir) => fs.writeFileSync(path.join(dir, "trace/deferred.tsv"), `${first}\t*\t${WP}\tran out of time\n`)), (r) => r.code === 1 && r.out.includes("deferred:")],
];

let failed = 0;
for (const [name, mutate, expect, extra] of cases) {
  let ok = false;
  let out = "";
  try {
    const dir = setup(mutate);
    const r = run(dir, extra);
    out = r.out;
    ok = expect(r);
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (e) {
    out = String(e.message);
  }
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : "\n" + out.split("\n").slice(0, 8).join("\n")}`);
  if (!ok) failed++;
}
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
