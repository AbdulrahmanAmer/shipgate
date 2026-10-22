// Print "<url> <sha256> <size>" of the manifest item with the given name and platform. Usage: node manifest-get.mjs <manifest> <name> <platform>
import { readFileSync } from "node:fs";
const [file, name, platform] = process.argv.slice(2);
const i = JSON.parse(readFileSync(file, "utf8")).items.find((x) => x.name === name && x.platform === platform);
if (!i) { console.error("no such item"); process.exit(1); }
console.log(`${i.url} ${i.sha256} ${i.size}`);
