// Claude Code Stop hook: refuse to end a turn while BUILD_STATE.md claims a work package is done
// that trace-check can't prove. The agent resolves it by finishing the work or by correcting the
// claim to NOT DONE — both are honest; a false "done" is not.
// Wired in .claude/settings.json. No-op until BUILD_STATE.md exists and claims something done.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const state = path.join(root, "BUILD_STATE.md");
if (!fs.existsSync(state) || !/WP-[0-9]{3,4}[a-z]?\s*(?:\||:)\s*\**done\**/i.test(fs.readFileSync(state, "utf8"))) process.exit(0);

try {
  execFileSync(process.execPath, [path.join(root, "tools/trace/trace-check.mjs"), "--claimed", "BUILD_STATE.md"], { cwd: root, encoding: "utf8", timeout: 60000 });
  process.exit(0);
} catch (e) {
  const out = String(e.stdout || e.message).split("\n").slice(0, 40).join("\n");
  process.stdout.write(
    JSON.stringify({
      decision: "block",
      reason:
        "BUILD_STATE.md marks work packages done that trace-check can't prove. Either deliver the missing slices, " +
        "or change those WPs back to NOT DONE and say so to the Operator. trace-check output:\n" + out,
    }),
  );
  process.exit(0);
}
