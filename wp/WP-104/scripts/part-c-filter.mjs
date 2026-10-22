// Usage: cargo nextest run --profile ci -E "test(/^wp_104__/)" 2>&1 | node wp/WP-104/scripts/part-c-filter.mjs <provenance-c.json>
// Reads the wp_104 test output on stdin and prints the problem lines that name a file of part c, then the count (must be 0).
import fs from "node:fs";

const files = Object.keys(JSON.parse(fs.readFileSync(process.argv[2], "utf8")));
const input = fs.readFileSync(0, "utf8").split(/\r?\n/);
const problemLines = input.filter((l) => /^\s*(missing rules\/|rules\/)/.test(l));
const mine = problemLines.filter((l) => files.some((f) => l.includes(`rules/${f}`) || l.includes(`for ${f}`) || l.includes(`[${f}]`)));
const summary = input.filter((l) => /Summary|FAIL|PASS|problem\(s\)/.test(l));
console.log(mine.join("\n"));
console.log(`total problem lines in the run: ${problemLines.length}; naming a part-c file: ${mine.length}`);
console.log(summary.slice(-6).join("\n"));
