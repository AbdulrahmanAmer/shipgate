// Claude Code Stop hook: refuse to end a turn while BUILD_STATE.md claims a work package is done
// that no real-mode trace-check run has proven for the current tree, or contains a claim in any
// non-canonical form. The agent resolves it by running `node tools/trace/trace-check.mjs --claimed
// BUILD_STATE.md` (which builds and proves), or by correcting the claim to NOT DONE.
// Wired in .claude/settings.json. No-op when BUILD_STATE.md doesn't exist.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(process.env.SHIPGATE_ROOT || fileURLToPath(new URL("../..", import.meta.url)));
if (!fs.existsSync(path.join(root, "BUILD_STATE.md"))) process.exit(0);

try {
  execFileSync(process.execPath, [path.join(root, "tools/trace/trace-check.mjs"), "--root", root, "--claimed", "BUILD_STATE.md", "--from-hook"], { cwd: root, encoding: "utf8", timeout: 60000, stdio: ["ignore", "pipe", "pipe"] });
  process.exit(0);
} catch (e) {
  const out = String(e.stdout || e.message).split("\n").slice(0, 40).join("\n");
  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason:
        "BUILD_STATE.md claims work that trace-check hasn't proven for this commit. Run `node tools/trace/trace-check.mjs --claimed BUILD_STATE.md`, " +
        "or change those WPs back to NOT DONE and say so to the Operator. Output:\n" + out,
    }),
  );
  process.exit(0);
}
