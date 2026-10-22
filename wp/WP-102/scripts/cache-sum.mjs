// Sum the byte sizes of every distinct URL this builder downloaded and hashed (the per-URL cache files).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
const dir = join(process.env.WP102_SCRATCH, "cache");
let n = 0, total = 0;
for (const f of readdirSync(dir)) { const v = JSON.parse(readFileSync(join(dir, f), "utf8")); if (v.size) { n++; total += v.size; } }
console.log(`${n} distinct downloads, ${(total / 1e9).toFixed(2)} GB`);
