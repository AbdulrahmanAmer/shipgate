// Usage: node wp/WP-104/scripts/part-c-verify.mjs <rules dir> [<eurlex corpus dir>] [--dedupe]
// WP-104 part c. Structural checks of every per-locale file of part c, and (with a corpus dir of EUR-Lex plain-text
// extractions named <celex>.<lang>.txt) a per-file report of how many EU-language phrases occur verbatim in the
// official translation of the legal text (the rest are authored variants).
//   - exit 1 on a structural problem: missing locale, wrong group keys, empty list, non-string, blank or untrimmed phrase,
//     duplicate within a list.
//   - --dedupe rewrites the files with duplicate phrases removed (order kept) before checking.
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
const corpusDir = process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : null;
const dedupe = process.argv.includes("--dedupe");
const LOCALES = ["ar", "cs", "da", "de", "en", "es", "fi", "fr", "it", "ja", "ko", "nb", "nl", "pl", "pt", "ro", "ru", "sv", "tr", "zh"];
const EU13 = ["cs", "da", "de", "en", "es", "fi", "fr", "it", "nl", "pl", "pt", "ro", "sv"];

// file -> group keys (null = plain list per locale; "purpose" = keys are host purposes)
const SHAPES = {
  "withdrawal-labels": null, "withdrawal-confirm-labels": null, "withdrawal-info-phrases": ["right", "period", "howTo", "effects", "modelForm"],
  "order-button-labels": null, "prior-price-phrases": null, "review-verification-phrases": null, "cancel-labels": null,
  "vat-phrases": null, "shipping-cost-phrases": null, "renewal-terms-phrases": ["frequency", "cancellation", "consent"],
  "sct-labels": ["price", "shippingCost", "payment", "delivery", "returns"],
  "purpose-phrases": ["analytics", "advertising", "affiliate", "payments", "email", "support", "ai", "monitoring", "maps", "video"],
  "dsa-contact-phrases": null, "dsa-terms-phrases": ["restrictions", "moderation", "complaints"], "report-content-labels": ["control", "goodFaith"],
  "sms-consent-phrases": ["autodial", "frequency", "rates", "optout", "notCondition"], "sms-markers": null,
  "transfer-mechanism-phrases": ["adequacy", "dpf", "scc", "bcr", "derogation"],
  "marketing-consent-phrases": ["purpose", "withdraw"], "marketing-signup-markers": null, "marketing-optin-labels": null,
  "dmca-phrases": null, "tida-phrases": ["process", "timeline"], "osa-terms-phrases": ["complaints", "illegal"], "prop65-link-labels": null,
  "country-of-origin-labels": null, "add-to-cart-labels": null, "a11y-statement-phrases": ["conformance", "inaccessible", "feedback", "enforcement"],
  "terms-acceptance-phrases": null, "safety-info-labels": null,
};
const NESTED = { "privacy-notice-elements": { gdpr: ["rights", "legalBasis", "retention", "complaint", "contact", "transfers"], ccpa: ["categories", "sellShare", "rights", "limit"], dpdp: ["itemisedData", "purpose", "rights", "grievance", "board"], app: ["kinds", "purposes", "accessCorrect", "complaints", "overseas"] } };

const problems = [];
const prob = (m) => problems.push(m);
const norm = (s) => s.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
// keep arrays of strings on one line when a file is rewritten
const collapse = (t) => t.replace(/\[\n\s+((?:"(?:[^"\\\n]|\\.)*"(?:,\n\s+)?)+)\n\s+\]/g, (m, inner) => "[" + inner.replace(/,\n\s+/g, ", ") + "]");

// optional corpora
let corpus = {};
if (corpusDir) {
  for (const f of fs.readdirSync(corpusDir)) {
    const m = f.match(/^(.+)\.([a-z]{2})\.txt$/);
    if (!m) continue;
    corpus[m[2]] = (corpus[m[2]] || "") + "\n" + norm(fs.readFileSync(path.join(corpusDir, f), "utf8"));
  }
}

function checkList(file, loc, group, list, stats) {
  const where = `${file}.json[${loc}${group ? "." + group : ""}]`;
  if (!Array.isArray(list) || list.length === 0) { prob(`${where}: needs a non-empty array`); return list; }
  const seen = new Set();
  const out = [];
  for (const p of list) {
    if (typeof p !== "string" || !p.length) { prob(`${where}: non-string or empty phrase`); continue; }
    if (p !== p.trim()) prob(`${where}: untrimmed phrase ${JSON.stringify(p)}`);
    if (/\s{2,}/.test(p)) prob(`${where}: double space in ${JSON.stringify(p)}`);
    const k = norm(p);
    if (seen.has(k)) { if (!dedupe) prob(`${where}: duplicate phrase ${JSON.stringify(p)}`); continue; }
    seen.add(k);
    out.push(p);
    if (corpusDir && corpus[loc]) {
      stats.total++;
      if (corpus[loc].includes(k)) stats.found++;
    }
  }
  return out;
}

const report = [];
for (const file of [...Object.keys(SHAPES), ...Object.keys(NESTED)]) {
  const fp = path.join(dir, `${file}.json`);
  if (!fs.existsSync(fp)) { prob(`missing ${file}.json`); continue; }
  const data = JSON.parse(fs.readFileSync(fp, "utf8"));
  const stats = { total: 0, found: 0 };
  for (const loc of Object.keys(data)) if (!LOCALES.includes(loc)) prob(`${file}.json: unexpected key ${loc}`);
  for (const loc of LOCALES) {
    const v = data[loc];
    if (v === undefined) { prob(`${file}.json: no ${loc} entry`); continue; }
    if (file in NESTED) {
      const spec = NESTED[file];
      for (const top of Object.keys(v)) if (!(top in spec)) prob(`${file}.json[${loc}]: unexpected ${top}`);
      for (const top of Object.keys(spec)) {
        if (!v[top]) { prob(`${file}.json[${loc}]: no ${top}`); continue; }
        for (const g of Object.keys(v[top])) if (!spec[top].includes(g)) prob(`${file}.json[${loc}.${top}]: unexpected group ${g}`);
        for (const g of spec[top]) v[top][g] = checkList(file, loc, `${top}.${g}`, v[top][g], stats);
      }
    } else if (SHAPES[file] === null) {
      data[loc] = checkList(file, loc, null, v, stats);
    } else {
      for (const g of Object.keys(v)) if (!SHAPES[file].includes(g)) prob(`${file}.json[${loc}]: unexpected group ${g}`);
      for (const g of SHAPES[file]) v[g] = checkList(file, loc, g, v[g], stats);
    }
  }
  if (dedupe) fs.writeFileSync(fp, collapse(JSON.stringify(data, null, 2)) + "\n");
  if (corpusDir) report.push(`${file}: ${stats.found}/${stats.total} EU-language phrases occur verbatim in the official texts`);
}
if (corpusDir) console.log(report.join("\n"));
if (problems.length) { console.error(problems.join("\n")); console.error(`${problems.length} problem(s)`); process.exit(1); }
console.log("part c per-locale structure ok");
