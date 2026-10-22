// Usage: node wp/WP-104/scripts/part-c-merge-scratch.mjs <provenance-c.json> <rules/provenance.json>
// Merges the part-c fragment into a (scratch) copy of rules/provenance.json IN PLACE. The orchestrator is the only committer
// of rules/provenance.json; run `git checkout -- rules/provenance.json` afterwards.
import fs from "node:fs";

const [fragFile, provFile] = process.argv.slice(2);
const frag = JSON.parse(fs.readFileSync(fragFile, "utf8"));
const prov = JSON.parse(fs.readFileSync(provFile, "utf8"));
for (const [k, v] of Object.entries(frag)) {
  if (prov[k] && JSON.stringify(prov[k]) !== JSON.stringify(v)) throw new Error(`provenance conflict for ${k}`);
  prov[k] = v;
}
fs.writeFileSync(provFile, JSON.stringify(Object.fromEntries(Object.keys(prov).sort().map((k) => [k, prov[k]])), null, 2) + "\n");
console.log(`merged ${Object.keys(frag).length} entries`);
