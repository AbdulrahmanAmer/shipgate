// Claude Code Stop hook: refuse to end a turn while BUILD_STATE.md claims a work package is done
// that nothing has proven for the current commit, or contains a claim in any non-canonical form.
// Proof is either (a) a local real-mode trace-check record for HEAD's tree, or (b) a successful
// GitHub Actions `ci` run for HEAD's commit — CI runs `trace-check --claimed BUILD_STATE.md` on a
// clean checkout and is authoritative (BUILD_MAP § 4.1 item 6), so the laptop needn't rebuild.
// (b) counts only when the working BUILD_STATE.md equals HEAD's, so CI judged the same claims.
// Wired in .claude/settings.json. No-op when BUILD_STATE.md doesn't exist.
// Test seam: SHIPGATE_GH = a node script standing in for `gh` (self-test only).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(process.env.SHIPGATE_ROOT || fileURLToPath(new URL("../..", import.meta.url)));
if (!fs.existsSync(path.join(root, "BUILD_STATE.md"))) process.exit(0);
const sh = (cmd, args) => execFileSync(cmd, args, { cwd: root, encoding: "utf8", timeout: 30000, stdio: ["ignore", "pipe", "pipe"] });

function block(reason, out) {
  process.stdout.write(JSON.stringify({ decision: "block", reason: reason + (out ? "\nOutput:\n" + out : "") }));
  process.exit(0);
}

let out = "";
try {
  sh(process.execPath, [path.join(root, "tools/trace/trace-check.mjs"), "--root", root, "--claimed", "BUILD_STATE.md", "--from-hook"]);
  process.exit(0);
} catch (e) {
  out = String(e.stdout || e.message).split("\n").slice(0, 40).join("\n");
}
// Anything other than a missing record (e.g. a non-canonical claim) can't be excused by CI.
const lines = out.split("\n").filter((l) => /^(GLOBAL|NOT DONE| {9}- )/.test(l) && !/^GLOBAL {2}note:/.test(l));
const onlyMissingRecord = lines.length > 0 && lines.every((l) => /^NOT DONE /.test(l) || /no real-mode trace-check record/.test(l));
if (!onlyMissingRecord) block("BUILD_STATE.md has a claim trace-check rejects. Fix the claim (use `WP-<id>: done` only for proven WPs; otherwise NOT DONE) and say so to the Operator.", out);

let sha = "";
let ciVerdict = "";
try {
  sha = sh("git", ["rev-parse", "HEAD"]).trim();
  // CI judged HEAD's BUILD_STATE.md; the working copy must be that file, byte for byte (an untracked
  // or edited copy carries claims CI never saw; `git diff` alone ignores untracked files).
  const committed = sh("git", ["show", "HEAD:BUILD_STATE.md"]);
  if (committed.replace(/\r\n/g, "\n") !== fs.readFileSync(path.join(root, "BUILD_STATE.md"), "utf8").replace(/\r\n/g, "\n")) throw new Error("BUILD_STATE.md differs from HEAD's");
  const gh = process.env.SHIPGATE_GH ? [process.execPath, [process.env.SHIPGATE_GH]] : ["gh", []];
  const runs = JSON.parse(sh(gh[0], [...gh[1], "run", "list", "--commit", sha, "--workflow", "ci", "--json", "status,conclusion", "--limit", "5"]) || "[]");
  if (runs.some((r) => r.status === "completed" && r.conclusion === "success")) process.exit(0);
  ciVerdict = runs.length ? runs.map((r) => `${r.status}/${r.conclusion || "-"}`).join(", ") : "no CI run for this commit (not pushed?)";
} catch (e) {
  ciVerdict = `CI result unavailable (${String(e.message).split("\n")[0]}; BUILD_STATE.md must be committed and HEAD pushed)`;
}
block(
  `BUILD_STATE.md claims work not yet proven for commit ${sha.slice(0, 7)}: GitHub CI says ${ciVerdict}. ` +
    "Push the commit and wait for the `ci` run to succeed (CI is authoritative), or run `node tools/trace/trace-check.mjs --claimed BUILD_STATE.md` locally, " +
    "or change those WPs back to NOT DONE and say so to the Operator.",
  out,
);
