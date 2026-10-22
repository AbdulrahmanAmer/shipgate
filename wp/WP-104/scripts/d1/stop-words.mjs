// WP-104 part d1: build rules/stop-words.json from fetched sources.
// Usage: node stop-words.mjs <downloadDir> <rulesDir>
//   <downloadDir>/snowball/<language>.txt  - https://snowballstem.org/algorithms/<language>/stop.txt (3-clause BSD)
//   <downloadDir>/iso/<tag>.json           - https://raw.githubusercontent.com/stopwords-iso/stopwords-<tag>/master/stopwords-<tag>.json (MIT)
// Output: { "<tag>": [word...] }, words NFKC + case-folded (programmatic.md "Per-locale word lists"), sorted, unique.
import fs from "node:fs";
import path from "node:path";

const [dl, rules] = process.argv.slice(2);
if (!dl || !rules) throw new Error("usage: stop-words.mjs <downloadDir> <rulesDir>");

const fold = (s) => s.normalize("NFKC").toLowerCase().replaceAll("ß", "ss").replaceAll("ς", "σ").replaceAll("ſ", "s");
const hasWordChar = (s) => /[\p{L}\p{N}]/u.test(s);

const snowball = { da: "danish", nl: "dutch", en: "english", fi: "finnish", fr: "french", de: "german", it: "italian", nb: "norwegian", pt: "portuguese", ru: "russian", es: "spanish", sv: "swedish" };
const iso = ["ar", "cs", "pl", "ro", "tr", "ja", "ko", "zh"];

const out = {};
const counts = {};
for (const [tag, lang] of Object.entries(snowball)) {
  const text = fs.readFileSync(path.join(dl, "snowball", `${lang}.txt`), "utf8");
  const words = [];
  for (const line of text.split(/\r?\n/)) {
    const body = line.split("|")[0].trim();
    if (body) words.push(...body.split(/\s+/));
  }
  out[tag] = words;
}
for (const tag of iso) {
  const arr = JSON.parse(fs.readFileSync(path.join(dl, "iso", `${tag}.json`), "utf8"));
  out[tag] = arr.map((w) => String(w).trim()).filter(Boolean);
}

for (const tag of Object.keys(out)) {
  const set = new Set();
  for (const raw of out[tag]) {
    const w = fold(raw);
    if (!hasWordChar(w)) continue;
    set.add(w);
    // Typographic apostrophe: UAX #29 keeps U+2019 inside a word and NFKC leaves it, so list both forms.
    if (w.includes("'")) set.add(w.replaceAll("'", "’"));
    // Romanian: comma-below and cedilla forms of s/t are both in use.
    if (tag === "ro") {
      set.add(w.replaceAll("ș", "ş").replaceAll("ț", "ţ"));
      set.add(w.replaceAll("ş", "ș").replaceAll("ţ", "ț"));
    }
  }
  out[tag] = [...set].sort();
  counts[tag] = out[tag].length;
}
const ordered = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
fs.writeFileSync(path.join(rules, "stop-words.json"), JSON.stringify(ordered, null, 1) + "\n");
console.log(JSON.stringify(counts));
