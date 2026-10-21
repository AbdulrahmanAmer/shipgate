// Prove which model each sub-agent of a Claude Code session actually ran on (the Agent tool's
// `model` argument is a request; the transcript is the evidence).
// Usage: node tools/trace/agent-models.mjs [sessionDir]
//   sessionDir defaults to the newest session folder of this project under ~/.claude/projects.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
let dir = process.argv[2];
if (!dir) {
  const slug = root.replace(/[:\\/ ]/g, "-");
  const proj = path.join(os.homedir(), ".claude", "projects", slug);
  if (!fs.existsSync(proj)) {
    console.error(`no project transcripts at ${proj}`);
    process.exit(2);
  }
  const sessions = fs
    .readdirSync(proj, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(proj, d.name, "subagents")))
    .map((d) => path.join(proj, d.name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  dir = sessions[0];
}
const sub = path.join(dir, "subagents");
for (const f of fs.readdirSync(sub).filter((f) => f.endsWith(".jsonl")).sort()) {
  const text = fs.readFileSync(path.join(sub, f), "utf8");
  const models = {};
  for (const m of text.matchAll(/"model":"([^"]+)"/g)) models[m[1]] = (models[m[1]] || 0) + 1;
  console.log(`${f.replace(/^agent-|\.jsonl$/g, "")}  ${Object.entries(models).map(([k, v]) => `${k}×${v}`).join(" ") || "no model field yet"}`);
}
