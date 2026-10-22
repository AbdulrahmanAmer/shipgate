// One-off: split the old single-file hash cache into the per-URL cache files lib.mjs now uses.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SCRATCH, remember } from "./lib.mjs";
const old = JSON.parse(readFileSync(join(SCRATCH, "hash-cache.json"), "utf8"));
let n = 0;
for (const [url, v] of Object.entries(old)) { if (v && v.sha256 && v.size) { remember(url, v); n++; } }
console.log("migrated", n);
