// WP-104 part d1: normalise the hand-authored phrase lists and validate them.
// Usage: node finalize-lists.mjs <rulesDir>      (idempotent)
// For the phrase-list files: NFKC + case-fold every entry (the spec compares both sides folded), add the typographic-
// apostrophe form (U+2019) of entries containing U+0027, add comma-below/cedilla and dotless-i spelling variants for ro/tr,
// drop duplicates and blanks, apply the reviewed removals below. Regex files (clickbait/advice) are untouched.
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir) throw new Error("usage: finalize-lists.mjs <rulesDir>");
const LOCALES = ["ar", "cs", "da", "de", "en", "es", "fi", "fr", "it", "ja", "ko", "nb", "nl", "pl", "pt", "ro", "ru", "sv", "tr", "zh"];
const fold = (s) => s.normalize("NFKC").toLowerCase().replaceAll("ß", "ss").replaceAll("ς", "σ").replaceAll("ſ", "s");

// Reviewed removals / replacements: bare prepositions and trailing-space entries that would over-match.
const remove = {
  "comparison-patterns": { de: ["gegen"], da: ["mod"], nb: ["mot"], sv: ["mot"], fr: ["contre"], pt: ["contra"], ro: ["contra"], pl: ["kontra"], cs: ["proti"], it: ["contro"], ru: ["против"], es: ["frente a"], nl: ["tegenover"], fi: ["vastaan"], tr: ["karşı"], ja: ["対"], ko: ["대"], ar: ["ضد"] },
  "attribution-phrases": { de: ["laut "], it: ["secondo i "], pt: ["segundo o ", "segundo a ", "segundo os ", "segundo as ", "segundo um ", "segundo uma "], ro: ["potrivit "] },
};
const add = {
  "attribution-phrases": {
    de: ["laut einer", "laut dem", "laut der", "laut den", "laut des", "laut ihrer", "laut seiner", "laut aktuellen", "laut studien", "laut statistik", "laut umfrage", "laut bericht", "laut angaben", "laut experten"],
    it: ["secondo i ricercatori", "secondo gli esperti"],
    pt: ["segundo o estudo", "segundo o relatório", "segundo a pesquisa", "segundo as pesquisas", "segundo os dados", "segundo estudo", "segundo um estudo", "segundo uma pesquisa", "segundo especialistas"],
    ro: ["potrivit unui", "potrivit datelor", "potrivit studiului", "potrivit raportului", "potrivit statisticilor", "potrivit specialiștilor", "potrivit cercetării"],
  },
};

const phraseFiles = ["soft-404-phrases", "generic-anchors", "generic-titles", "evergreen-words", "comparison-patterns", "attribution-phrases", "ai-addressed-phrases", "load-more-labels", "pagination-labels"];
const variants = (tag, w) => {
  const v = [w];
  if (w.includes("'")) v.push(w.replaceAll("'", "’"));
  if (tag === "ro") {
    for (const x of [...v]) v.push(x.replaceAll("ș", "ş").replaceAll("ț", "ţ"), x.replaceAll("ş", "ș").replaceAll("ţ", "ț"));
  }
  if (tag === "tr") for (const x of [...v]) v.push(x.replaceAll("ı", "i"));
  return v;
};
const normList = (tag, list, rm = [], extra = []) => {
  const rmSet = new Set(rm);
  const out = new Set();
  for (const raw of [...list, ...extra]) {
    if (rmSet.has(raw)) continue;
    const w = fold(raw);
    if (!w.trim()) continue;
    for (const x of variants(tag, w)) out.add(x);
  }
  return [...out];
};

for (const name of phraseFiles) {
  const file = path.join(dir, `${name}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const tag of Object.keys(data)) {
    data[tag] = normList(tag, data[tag], remove[name]?.[tag] ?? [], add[name]?.[tag] ?? []);
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}
// date-labels: { updated, published }
{
  const file = path.join(dir, "date-labels.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const tag of Object.keys(data)) for (const k of ["updated", "published"]) data[tag][k] = normList(tag, data[tag][k]);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

// ---- validation -------------------------------------------------------------------------------------------------
const problems = [];
const all = [...phraseFiles, "date-labels", "clickbait-patterns", "advice-patterns", "bool-labels", "placeholders", "stop-words", "verbs"];
for (const name of all) {
  const file = path.join(dir, `${name}.json`);
  if (!fs.existsSync(file)) {
    problems.push(`${name}: file missing`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const tag of LOCALES) {
    const v = data[tag];
    if (v === undefined) {
      problems.push(`${name}: no ${tag}`);
      continue;
    }
    const lists = name === "date-labels" ? [v.updated, v.published] : name === "bool-labels" ? [] : name === "placeholders" ? Object.values(v).filter(Array.isArray) : [v];
    if (name === "bool-labels" && !(typeof v.true === "string" && typeof v.false === "string" && v.true && v.false && v.true !== v.false)) problems.push(`${name}[${tag}]: needs distinct true/false strings`);
    if (name === "date-labels") {
      if (!v.updated?.length || !v.published?.length) problems.push(`${name}[${tag}]: updated/published empty`);
      const both = v.updated.filter((x) => v.published.includes(x));
      if (both.length) problems.push(`${name}[${tag}]: in both lists: ${both}`);
    }
    if (name === "placeholders" && !(v.lorem.length && v.names.length)) problems.push(`${name}[${tag}]: lorem/names empty`);
    for (const l of lists) {
      if (!Array.isArray(l)) {
        problems.push(`${name}[${tag}]: not an array`);
        continue;
      }
      const seen = new Set();
      for (const x of l) {
        if (typeof x !== "string" || !x.trim()) problems.push(`${name}[${tag}]: blank entry`);
        else if (x !== x.trim()) problems.push(`${name}[${tag}]: untrimmed "${x}"`);
        else if (seen.has(x)) problems.push(`${name}[${tag}]: duplicate "${x}"`);
        seen.add(x);
        const regexFile = name === "clickbait-patterns" || name === "advice-patterns";
        const sensitive = ["phoneRanges", "faviconSha256"];
        if (!regexFile && typeof x === "string" && !sensitive.includes(name) && x !== fold(x) && !/^[+0-9a-f]+$/.test(x)) {
          // domains / imageHosts are lower-case ASCII; everything else must be a fold fixed point.
          problems.push(`${name}[${tag}]: not NFKC+casefolded: "${x}"`);
        }
      }
    }
  }
}
if (problems.length) {
  console.log(problems.join("\n"));
  console.log(`${problems.length} problem(s)`);
  process.exit(1);
}
console.log("finalize-lists: all lists normalised, 0 problems");
