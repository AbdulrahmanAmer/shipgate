// Usage: node wp/scripts/merge-wp104-part.mjs <branch> <part>
// Orchestrator-only. Merges one WP-104 part branch into main after merge-gate, folds the part's
// provenance fragment into rules/provenance.json (the orchestrator is its only writer), runs the
// wp_104 tests and prints how many problem lines name files the part's provenance lists.
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const [branch, part] = process.argv.slice(2);
if (!branch || !part) throw new Error("usage: merge-wp104-part.mjs <branch> <part>");
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

console.log(run("node", ["tools/trace/merge-gate.mjs", branch]).trim());
run("git", ["merge", "--no-ff", "-q", "-m", `Merge WP-104 part ${part} (${branch})\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, branch]);
const fragFile = path.join(root, "wp/WP-104", `provenance-${part}.json`);
const frag = JSON.parse(fs.readFileSync(fragFile, "utf8"));
const provFile = path.join(root, "rules/provenance.json");
const prov = fs.existsSync(provFile) ? JSON.parse(fs.readFileSync(provFile, "utf8")) : {};
for (const [k, v] of Object.entries(frag)) {
  if (prov[k] && JSON.stringify(prov[k]) !== JSON.stringify(v)) throw new Error(`provenance conflict for ${k}`);
  prov[k] = v;
}
const sorted = Object.fromEntries(Object.keys(prov).sort().map((k) => [k, prov[k]]));
fs.writeFileSync(provFile, JSON.stringify(sorted, null, 2) + "\n");
const t = spawnSync("cargo", ["nextest", "run", "--profile", "ci", "-E", "test(/^wp_104__/)"], { cwd: root, encoding: "utf8" });
const out = t.stdout + t.stderr;
const mine = Object.keys(frag);
const lines = out.split(/\r?\n/).filter((l) => /^(missing rules\/|rules\/)/.test(l.trim()));
const hit = lines.filter((l) => mine.some((f) => l.includes(`rules/${f}`) || l.includes(`[${f}]`) || l.includes(`for ${f}`)));
const total = (out.match(/(\d+) problem\(s\)/g) || []).join(", ");
console.log(`part ${part}: ${mine.length} files in fragment; problem lines naming them: ${hit.length}; totals: ${total}`);
for (const l of hit.slice(0, 20)) console.log(`  ${l.trim()}`);
run("git", ["add", "rules/provenance.json"]);
run("git", ["commit", "-q", "-m", `rules/provenance.json: add WP-104 part ${part}\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`]);
console.log(run("git", ["log", "--oneline", "-3"]).trim());
process.exit(hit.length ? 1 : 0);
