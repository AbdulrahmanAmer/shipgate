// Usage: node wp/WP-104/scripts/part-c-official-check.mjs <rules dir> <eurlex corpus dir>
// WP-104 part c. For the part-c lists whose EU-language entries are claimed to come from an official translation, asserts that
// at least `min` phrases of every EU language (and every group) occur verbatim (NFKC, case-folded) in the named EUR-Lex
// texts (<celex>.<lang>.txt extractions of publications.europa.eu/resource/celex/<celex>). Exit 1 if any claim fails.
//   32011L0083 CRD   32023L2673 CRD Art. 11a   52021XC1229%2804%29 Commission CRD Notice   32016R0679 GDPR
//   32022R2065 DSA   32018D1523 model accessibility statement
import fs from "node:fs";
import path from "node:path";

const [dir, corpusDir] = process.argv.slice(2);
const EU13 = ["cs", "da", "de", "en", "es", "fi", "fr", "it", "nl", "pl", "pt", "ro", "sv"];
const norm = (s) => s.normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
const corpusCache = new Map();
const text = (celex, lang) => {
  const k = `${celex}.${lang}`;
  if (!corpusCache.has(k)) corpusCache.set(k, norm(fs.readFileSync(path.join(corpusDir, `${celex}.${lang}.txt`), "utf8")));
  return corpusCache.get(k);
};
const load = (f) => JSON.parse(fs.readFileSync(path.join(dir, `${f}.json`), "utf8"));

// [file, group|null, [celex...], min]
const CLAIMS = [
  ["withdrawal-labels", null, ["32023L2673"], 1],
  ["withdrawal-confirm-labels", null, ["32023L2673"], 1],
  ["order-button-labels", null, ["32011L0083"], 1],
  ["order-button-labels", null, ["52021XC1229%2804%29"], 3],
  ["withdrawal-info-phrases", "right", ["32011L0083"], 1],
  ["withdrawal-info-phrases", "period", ["32011L0083"], 1],
  ["withdrawal-info-phrases", "howTo", ["32011L0083"], 1],
  ["withdrawal-info-phrases", "effects", ["32011L0083"], 1],
  ["withdrawal-info-phrases", "modelForm", ["32011L0083"], 1],
  ["dsa-contact-phrases", null, ["32022R2065"], 1],
  ["dsa-terms-phrases", "restrictions", ["32022R2065"], 1],
  ["dsa-terms-phrases", "moderation", ["32022R2065"], 1],
  ["dsa-terms-phrases", "complaints", ["32022R2065"], 1],
  ["report-content-labels", "goodFaith", ["32022R2065"], 1],
  ["transfer-mechanism-phrases", "adequacy", ["32016R0679"], 1],
  ["transfer-mechanism-phrases", "scc", ["32016R0679"], 1],
  ["transfer-mechanism-phrases", "bcr", ["32016R0679"], 1],
  ["transfer-mechanism-phrases", "derogation", ["32016R0679"], 1],
  ["a11y-statement-phrases", "conformance", ["32018D1523"], 1],
  ["a11y-statement-phrases", "inaccessible", ["32018D1523"], 1],
  ["a11y-statement-phrases", "feedback", ["32018D1523"], 1],
  ["a11y-statement-phrases", "enforcement", ["32018D1523"], 1],
  ["marketing-consent-phrases", "withdraw", ["32016R0679"], 1],
];
const NESTED = [
  ["privacy-notice-elements", "gdpr", ["rights", "legalBasis", "retention", "complaint", "transfers"], ["32016R0679"], 1],
];

let fail = 0;
const lines = [];
function check(label, data, group, celexes, min) {
  for (const lang of EU13) {
    const list = group ? data[lang][group] : data[lang];
    const found = list.filter((p) => celexes.some((c) => text(c, lang).includes(norm(p))));
    const ok = found.length >= min;
    if (!ok) { fail++; lines.push(`FAIL ${label} [${lang}] ${found.length}/${min} found; phrases: ${list.join(" | ")}`); }
  }
}
for (const [file, group, celexes, min] of CLAIMS) check(`${file}${group ? "." + group : ""} <- ${celexes.join("+")}`, load(file), group, celexes, min);
for (const [file, top, groups, celexes, min] of NESTED) {
  const data = load(file);
  for (const g of groups) {
    const sub = Object.fromEntries(EU13.map((l) => [l, data[l][top]]));
    check(`${file}.${top}.${g} <- ${celexes.join("+")}`, sub, g, celexes, min);
  }
}
console.log(lines.join("\n"));
console.log(fail ? `${fail} claim failure(s)` : `all ${CLAIMS.length + NESTED.reduce((n, x) => n + x[2].length, 0)} official-text claims hold for ${EU13.length} EU languages`);
process.exit(fail ? 1 : 0);
