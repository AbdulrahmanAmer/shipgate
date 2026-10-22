// Builds rules/gazetteer/<cc>.json (web-delivery § 2 `gazetteer/<country>.json`: [string] of place names).
// Source: GeoNames cities1000.zip (populated places, `alternatenames` column = all alternate names
// without links/postal codes). Licence CC BY 4.0, attribution "GeoNames, https://www.geonames.org/".
// Run: node wp/WP-104/scripts/e/gazetteer.mjs
import fs from 'node:fs';
import path from 'node:path';
import { addProvenance, download, readZipEntry, rulesDir, today, workDir, writeText } from './common.mjs';

const COUNTRIES = [
  'ae', 'at', 'au', 'be', 'br', 'ca', 'ch', 'cn', 'cz', 'de', 'dk', 'eg', 'es', 'fi', 'fr', 'gb', 'ie', 'in',
  'it', 'jp', 'kr', 'mx', 'nl', 'no', 'nz', 'pl', 'pt', 'ro', 'ru', 'sa', 'se', 'tr', 'tw', 'us',
];
const URL = 'https://download.geonames.org/export/dump/cities1000.zip';
const zip = path.join(workDir, 'geonames', 'cities1000.zip');
if (!fs.existsSync(zip)) await download(URL, zip);
const text = readZipEntry(zip, 'cities1000.txt').toString('utf8');

const byCountry = new Map(COUNTRIES.map((c) => [c.toUpperCase(), new Set()]));
let rows = 0;
for (const line of text.split('\n')) {
  if (!line) continue;
  const f = line.split('\t');
  if (f.length < 15) continue;
  const set = byCountry.get(f[8]);
  if (!set) continue;
  if (f[6] !== 'P') continue; // populated places only
  if (Number(f[14]) < 1000) continue;
  rows++;
  for (const raw of [f[1], f[2], ...f[3].split(',')]) {
    const n = raw.normalize('NFC').trim();
    if ([...n].length < 2) continue;
    if (/^\p{Nd}+$/u.test(n)) continue;
    if (/\p{Cc}/u.test(n)) continue;
    set.add(n);
  }
}

const prov = {};
const counts = {};
for (const cc of COUNTRIES) {
  const names = [...byCountry.get(cc.toUpperCase())].sort();
  if (names.length === 0) throw new Error('no names for ' + cc);
  const body = '[\n' + names.map((n) => JSON.stringify(n)).join(',\n') + '\n]\n';
  writeText(path.join(rulesDir, 'gazetteer', cc + '.json'), body);
  counts[cc] = names.length;
  prov[`gazetteer/${cc}.json`] = {
    source: [URL, 'https://download.geonames.org/export/dump/readme.txt'],
    retrieved: today(),
    licence: 'CC-BY-4.0',
    attribution: 'GeoNames, https://www.geonames.org/',
  };
}
addProvenance(prov);
console.log('populated places used:', rows);
console.log(JSON.stringify(counts));
