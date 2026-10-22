// Timeout probe: records start, sleeps 8 s, then would deny. If the host kills it at its timeout, "done" never appears.
import fs from "node:fs";
const log = process.argv[2];
fs.readFileSync(0, "utf8");
fs.appendFileSync(log, `start ${new Date().toISOString()}\n`);
await new Promise((r) => setTimeout(r, 8000));
fs.appendFileSync(log, `done ${new Date().toISOString()}\n`);
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: "slow hook" } }));
