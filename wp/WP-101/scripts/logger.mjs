// WP-101 hook logger. Usage: node logger.mjs <host> <logDir> <ctlFile>
// Saves the raw stdin payload to <logDir>/<event>__<tool>__<n>.json, appends an index line to
// <logDir>/calls.jsonl, and (if ctlFile asks) answers with the deny / block output of 03 section 16.
import fs from "node:fs";
import path from "node:path";

const [host, logDir, ctlFile] = process.argv.slice(2);
fs.mkdirSync(logDir, { recursive: true });
const raw = fs.readFileSync(0, "utf8");
let p = null;
try {
  p = JSON.parse(raw);
} catch {}
const event = (p && (p.hook_event_name || p.event)) || "unparsed";
const tool = (p && (p.tool_name || p.tool)) || "none";
let n = 1;
const base = `${event}__${tool}__`;
while (fs.existsSync(path.join(logDir, `${base}${n}.json`))) n++;
const file = `${base}${n}.json`;
fs.writeFileSync(path.join(logDir, file), raw);

let ctl = {};
try {
  ctl = JSON.parse(fs.readFileSync(ctlFile, "utf8"));
} catch {}

let out = "";
let code = 0;
const cmd = p && p.tool_input && (p.tool_input.command || "");
if (event === "PreToolUse" && ctl.denyContains && typeof cmd === "string" && cmd.includes(ctl.denyContains)) {
  out = JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "shipgate WP-101 deny test",
    },
  });
}
if (event === "Stop" && ctl.blockStopOnce) {
  const flag = path.join(logDir, "stop-blocked.flag");
  if (!fs.existsSync(flag)) {
    fs.writeFileSync(flag, "1");
    out = JSON.stringify({ decision: "block", reason: "shipgate WP-101 block test: also create the file after-block.txt containing ok" });
  }
}
if (ctl.allowJson && out === "") out = "{}";
if (ctl.contextCodeword && event === "UserPromptSubmit") {
  out = JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: `The secret codeword is ${ctl.contextCodeword}.` } });
}
if (ctl.contextCodeword && event === "SessionStart") {
  out = JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: `The session codeword is ${ctl.contextCodeword}-S.` } });
}
if (ctl.contextCodeword && event === "PostToolUse") {
  out = JSON.stringify({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: `The tool codeword is ${ctl.contextCodeword}-T.` } });
}
fs.appendFileSync(
  path.join(logDir, "calls.jsonl"),
  JSON.stringify({ t: new Date().toISOString(), event, tool, file, stdout: out, exit: code, cwd: process.cwd() }) + "\n",
);
process.stdout.write(out);
process.exit(code);
