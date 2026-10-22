// WP-104 part d1: assemble rules/verbs.json (SE-121) from the per-language modules in ./verbs/<tag>.mjs.
// Usage: node build-verbs.mjs <rulesDir> [tag ...]
// Each module: `export default function forms() { return [ "form", ... ] }` - every inflected form of the language's
// most common verbs, authored from linguistic knowledge (no third-party morphology data is used or copied).
// Output: { "<tag>": [form...] }, forms NFKC + case-folded (same fold as stop-words.json), sorted, unique.
// With tags given, only those languages are (re)built and the others are kept from the existing file.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const [rulesDir, ...only] = process.argv.slice(2);
if (!rulesDir) throw new Error("usage: build-verbs.mjs <rulesDir> [tag ...]");
const here = path.dirname(fileURLToPath(import.meta.url));
const LOCALES = ["ar", "cs", "da", "de", "en", "es", "fi", "fr", "it", "ja", "ko", "nb", "nl", "pl", "pt", "ro", "ru", "sv", "tr", "zh"];

const fold = (s) => s.normalize("NFKC").toLowerCase().replaceAll("ß", "ss").replaceAll("ς", "σ").replaceAll("ſ", "s");
const target = path.join(rulesDir, "verbs.json");
const out = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, "utf8")) : {};
const tags = only.length ? only : LOCALES;
for (const tag of tags) {
  const file = path.join(here, "verbs", `${tag}.mjs`);
  if (!fs.existsSync(file)) {
    console.log(`${tag}: no module yet`);
    continue;
  }
  const mod = await import(pathToFileURL(file).href);
  const set = new Set();
  for (const raw of mod.default()) {
    const w = fold(String(raw).trim());
    if (!w || /\s/.test(w)) throw new Error(`${tag}: form must be a single word, got "${raw}"`);
    if (!/[\p{L}\p{N}]/u.test(w)) throw new Error(`${tag}: form without a letter: "${raw}"`);
    set.add(w);
    if (w.includes("'")) set.add(w.replaceAll("'", "’"));
  }
  out[tag] = [...set].sort();
  console.log(`${tag}: ${out[tag].length} forms`);
}
const ordered = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
// One locale per line keeps the file diffable at a third of the size of one-form-per-line.
fs.writeFileSync(target, "{\n" + Object.entries(ordered).map(([k, v]) => ` ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n") + "\n}\n");
