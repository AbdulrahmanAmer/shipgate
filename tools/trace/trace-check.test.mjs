// Watched-fail test for trace-check. A stand-in `shipgate` (a small node script) answers
// `rule --list --json` from FAKE_REGISTRY and `dev fixture <dir> --json` from <dir>/fake-findings.json,
// so the test exercises trace-check's own fixture enumeration and judging. Each case plants one
// defect or attack; the clean case must be DONE.
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
const mine = own.filter((o) => o.wp === WP && o.part === "*");
if (!mine.length) throw new Error(`${WP} owns nothing`);
const first = mine[0].id;
const FAKE_BIN = `import fs from "node:fs"; import path from "node:path";
const a = process.argv.slice(2);
if (a[0] === "rule") process.stdout.write(fs.readFileSync(process.env.FAKE_REGISTRY, "utf8"));
else if (a[0] === "dev" && a[1] === "fixture") { const f = path.join(a[2], "fake-findings.json"); process.stdout.write(fs.existsSync(f) ? fs.readFileSync(f, "utf8") : '{"findings":[]}'); }
else process.exit(3);`;

// One fixture = corpus/answer-engines/<RULE>/<spec|holdout>/<name>/{expected.json,fake-findings.json}
function plan() {
  const rules = [];
  const fx = [];
  for (const o of mine) {
    const r = reqs.get(o.id);
    const moved = own.filter((x) => x.id === o.id && x.part.startsWith("part:") && x.wp !== WP).map((x) => x.part.slice(5));
    const parts = r.parts.filter((p) => !moved.includes(p));
    const classes = r.failureClasses.length ? r.failureClasses : ["missing-element"];
    rules.push({ id: o.id, parts, channels: r.channels, failureClasses: classes });
    for (const part of ["main", ...parts]) {
      for (const dir of ["spec", "holdout"]) {
        for (const fc of part === "main" ? classes : [classes[0]]) {
          fx.push({ path: `answer-engines/${o.id}/${dir}/kb-${part}-${fc}`, expected: { rule: o.id, part, kind: "known-bad", expect: [{ rule: o.id, part, failureClass: fc }] }, findings: [{ rule: o.id, part, failureClass: fc, channel: r.channels[0] }] });
        }
      }
    }
    fx.push({ path: `answer-engines/${o.id}/spec/known-good`, expected: { rule: o.id, kind: "known-good" }, findings: [] });
  }
  return { rules, fx, junit: '<testsuites><testsuite><testcase name="x::wp_000__unrelated"/></testsuite></testsuites>', after: null };
}

function setup(mutate) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "trace-check-"));
  for (const x of ["BUILD_MAP.md", "SPEC.md", "spec", "trace", "tools"]) fs.cpSync(path.join(root, x), path.join(dir, x), { recursive: true });
  const c = plan();
  mutate?.(c);
  fs.writeFileSync(path.join(dir, "fakebin.mjs"), FAKE_BIN);
  fs.writeFileSync(path.join(dir, "registry.json"), JSON.stringify({ rules: c.rules }));
  fs.writeFileSync(path.join(dir, "junit.xml"), c.junit);
  const lock = [];
  for (const f of c.fx) {
    const d = path.join(dir, "corpus", f.path);
    fs.mkdirSync(d, { recursive: true });
    fs.writeFileSync(path.join(d, "expected.json"), JSON.stringify(f.expected));
    fs.writeFileSync(path.join(d, "fake-findings.json"), JSON.stringify({ findings: f.findings }));
    for (const n of ["expected.json", "fake-findings.json"]) lock.push(`${crypto.createHash("sha256").update(fs.readFileSync(path.join(d, n))).digest("hex")}  ${f.path}/${n}`);
  }
  fs.mkdirSync(path.join(dir, "corpus"), { recursive: true });
  fs.writeFileSync(path.join(dir, "corpus/FIXTURES.lock"), lock.join("\n") + "\n");
  c.after?.(dir);
  return dir;
}
function run(dir, extra, env = {}) {
  const real = extra.includes("--real");
  const rest = extra.filter((x) => x !== "--real");
  const a = [path.join(dir, "tools/trace/trace-check.mjs"), ...(rest.includes("--wp") || rest.includes("--claimed") ? [] : ["--wp", WP]), ...rest];
  const fakeArgs = real ? [] : ["--fake-bin", path.join(dir, "fakebin.mjs"), "--fake-junit", path.join(dir, "junit.xml")];
  try {
    return { code: 0, out: execFileSync(process.execPath, [...a, ...fakeArgs], { encoding: "utf8", env: { ...process.env, CI: "", FAKE_REGISTRY: path.join(dir, "registry.json"), ...env }, stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (e) {
    return { code: e.status, out: String(e.stdout) + String(e.stderr) };
  }
}
const kb = (c) => c.fx.find((f) => f.path.startsWith(`answer-engines/${first}/spec/kb-main`));
const ho = (c) => c.fx.find((f) => f.path.startsWith(`answer-engines/${first}/holdout/kb-main`));
const claim = (line) => [`claim "${line}" is not silently accepted`, (c) => (c.after = (d) => fs.writeFileSync(path.join(d, "BUILD_STATE.md"), line + "\n")), (r) => r.code === 1 && r.out.includes("unrecognised done claim"), ["--claimed", "BUILD_STATE.md"]];
const commit = (d) => { const q = { stdio: "ignore" }; execFileSync("git", ["-C", d, "init", "-q"], q); execFileSync("git", ["-C", d, "add", "-A"], q); execFileSync("git", ["-C", d, "-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "t"], q); };

const cases = [
  ["complete evidence → DONE", null, (r) => r.code === 0 && /DONE {4} WP-412/.test(r.out), []],
  ["rule missing from the built binary", (c) => (c.rules = c.rules.filter((x) => x.id !== first)), (r) => r.code === 1 && r.out.includes(`${first}: not registered in the built binary`), []],
  ["known-bad not detected", (c) => (kb(c).findings = []), (r) => r.code === 1 && r.out.includes("not detected"), []],
  ["no holdout", (c) => (c.fx = c.fx.filter((f) => !f.path.startsWith(`answer-engines/${first}/holdout/`))), (r) => r.code === 1 && r.out.includes(`${first}: no locked holdout fixture`), []],
  ["known-good produces findings", (c) => (c.fx.find((f) => f.path === `answer-engines/${first}/spec/known-good`).findings = [{ rule: first, part: "main" }]), (r) => r.code === 1 && r.out.includes("produces findings"), []],
  ["registered part missing", (c) => { const x = c.rules.find((x) => x.parts.length); if (!x) throw new Error("no rule with parts"); x.parts = []; }, (r) => r.code === 1 && /part '[a-z-]+' not registered/.test(r.out), []],
  ["metadata class without a fixture", (c) => c.rules.find((x) => x.id === first).failureClasses.push("leak"), (r) => r.code === 1 && r.out.includes("failure class 'leak'"), []],
  ["second locked holdout missed (one passing never hides another)", (c) => c.fx.push({ path: `answer-engines/${first}/holdout/second`, expected: { rule: first, part: "main", kind: "known-bad", expect: [{ rule: first, part: "main" }] }, findings: [] }), (r) => r.code === 1 && r.out.includes("holdout/second"), []],
  ["fixture relabelled to another rule", (c) => (ho(c).expected.rule = "AEO-999"), (r) => r.code === 1 && r.out.includes("doesn't match its directory"), []],
  ["unlocked file in a locked fixture dir", (c) => (c.after = (d) => fs.writeFileSync(path.join(d, "corpus", kb(c).path, "policy.json"), "{}")), (r) => r.code === 1 && r.out.includes("unlocked file"), []],
  ["locked fixture edited", (c) => (c.after = (d) => fs.appendFileSync(path.join(d, "corpus", kb(c).path, "expected.json"), " ")), (r) => r.code === 1 && r.out.includes("locked fixture file modified"), []],
  ["deferred slice", (c) => (c.after = (d) => fs.writeFileSync(path.join(d, "trace/deferred.tsv"), `${first}\t*\t${WP}\tran out of time\n`)), (r) => r.code === 1 && r.out.includes("deferred:"), []],
  ["WP owning nothing", null, (r) => r.code === 1 && r.out.includes("owns no requirement slice"), ["--wp", "WP-399"]],
  ["another WP's section test doesn't count", (c) => (c.junit = '<testsuites><testsuite><testcase name="x::wp_206__sec_05_4__other"/></testsuite></testsuites>'), (r) => r.code === 1 && r.out.includes("wp_804__sec_05_4"), ["--wp", "WP-804"]],
  ["a longer section id doesn't count", (c) => (c.junit = '<testsuites><testsuite><testcase name="x::wp_804__sec_05_4_1__other"/></testsuite></testsuites>'), (r) => r.code === 1, ["--wp", "WP-804"]],
  ["own section test counts", (c) => (c.junit = '<testsuites><testsuite><testcase name="x::wp_804__sec_05_4__server"/></testsuite></testsuites>'), (r) => r.code === 0, ["--wp", "WP-804"]],
  ["acceptance test required", (c) => (c.junit = '<testsuites><testsuite><testcase name="x::wp_000__workspace_builds_and_lints"/></testsuite></testsuites>'), (r) => r.code === 1 && r.out.includes("wp_000__ci_runs_trace_gates"), ["--wp", "WP-000"]],
  ["acceptance tests present", (c) => (c.junit = '<testsuites><testsuite><testcase name="x::wp_000__workspace_builds_and_lints"/><testcase name="x::wp_000__ci_runs_trace_gates"/></testsuite></testsuites>'), (r) => r.code === 0, ["--wp", "WP-000"]],
  claim("WP-412 — done"),
  claim("WP-412 is done"),
  claim("| WP-412 | ✅ done |"),
  claim("- [x] WP-412"),
  claim("WP-412: complete"),
  claim("WP-412: done (WP-410 not done)"),
  ["a 'not done' status is not a claim", (c) => (c.after = (d) => fs.writeFileSync(path.join(d, "BUILD_STATE.md"), "WP-410: not done\n")), (r) => r.code === 0 && r.out.includes("no work packages selected"), ["--claimed", "BUILD_STATE.md"]],
  ["WP-920 needs every other WP done", null, (r) => r.code === 1 && r.out.includes("not every other WP is done"), ["--wp", "WP-920"]],
  ["fake evidence refused under CI", null, (r) => r.code === 2 && r.out.includes("refused"), [], { CI: "true" }],
  ["real mode: hand-written evidence files are ignored, no workspace → nothing done", (c) => (c.after = (d) => { fs.mkdirSync(path.join(d, "target/trace"), { recursive: true }); fs.writeFileSync(path.join(d, "target/trace/registry.json"), fs.readFileSync(path.join(d, "registry.json"))); commit(d); }), (r) => r.code === 1 && r.out.includes("no Cargo workspace"), ["--real"]],
];

let failed = 0;
for (const [name, mutate, expect, extra, env] of cases) {
  let ok = false, out = "";
  try {
    const dir = setup(mutate);
    const r = run(dir, extra, env);
    out = r.out;
    ok = expect(r);
    try { execFileSync("git", ["-C", dir, "worktree", "prune"], { stdio: "ignore" }); } catch {}
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (e) { out = String(e.message); }
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : "\n" + out.split("\n").slice(0, 8).join("\n")}`);
  if (!ok) failed++;
}
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
