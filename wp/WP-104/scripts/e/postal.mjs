// Builds rules/postal-patterns.json: { "<ISO 3166-1 alpha-2>": "<regex>" } from the `zip` field of
// Google libaddressinput address metadata (chromium-i18n service; Apache-2.0). Countries without a
// `zip` pattern have no entry (search-engines LOC-001: "a country without an entry yields no candidates").
// Run: node wp/WP-104/scripts/e/postal.mjs
import path from 'node:path';
import { addProvenance, getJson, pool, rulesDir, today, writeText } from './common.mjs';

const BASE = 'https://chromium-i18n.appspot.com/ssl-address/data';
const idx = await getJson(BASE);
const codes = idx.countries.split('~').filter((c) => /^[A-Z]{2}$/.test(c));
const rows = await pool(codes, 6, async (cc) => {
  const d = await getJson(`${BASE}/${cc}`);
  return [cc, d.zip];
});
const out = {};
let noZip = 0;
for (const [cc, zip] of rows.sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
  if (typeof zip === 'string' && zip.length > 0) out[cc] = zip;
  else noZip++;
}
writeText(path.join(rulesDir, 'postal-patterns.json'), JSON.stringify(out, null, 2) + '\n');
addProvenance({
  'postal-patterns.json': {
    source: [BASE, 'https://github.com/google/libaddressinput'],
    retrieved: today(),
    licence: 'Apache-2.0',
    attribution: 'Address metadata from Google libaddressinput (chromium-i18n), Apache License 2.0',
  },
});
console.log(`countries listed: ${codes.length}; with zip pattern: ${Object.keys(out).length}; without: ${noZip}`);
