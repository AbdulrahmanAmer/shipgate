// Builds rules/popular-packages/npm.txt: top 10,000 npm package names by downloads, most popular first.
// Candidates: package names from wooorm/npm-high-impact `lib/top-download.js` (MIT; a list of npm packages
// crawled by download count). Ranking: last-month download counts from the official npm API
// (https://api.npmjs.org/downloads/point/last-month/<pkg>; bulk for unscoped names, one call per scoped name).
// Run: node wp/WP-104/scripts/e/pkg-npm.mjs
import fs from 'node:fs';
import path from 'node:path';
import { addProvenance, ensureDir, getJson, getText, pool, rulesDir, sleep, today, workDir, writeText } from './common.mjs';

const N = 10000;
const CAND = 'https://raw.githubusercontent.com/wooorm/npm-high-impact/main/lib/top-download.js';
const cacheFile = path.join(ensureDir(path.join(workDir, 'npm')), 'counts.json');

const src = await getText(CAND);
const arr = [...src.slice(src.indexOf('[')).matchAll(/'([^'\n]+)'/g)].map((m) => m[1]);
const cands = [...new Set(arr)];
console.log('candidates', cands.length);

let counts = {};
try {
  counts = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
} catch {
  counts = {};
}
const todo = cands.filter((n) => !(n in counts));
const unscoped = todo.filter((n) => !n.startsWith('@'));
const scoped = todo.filter((n) => n.startsWith('@'));
const API = 'https://api.npmjs.org/downloads/point/last-month/';

const chunks = [];
for (let i = 0; i < unscoped.length; i += 100) chunks.push(unscoped.slice(i, i + 100));
await pool(chunks, 4, async (chunk) => {
  const j = await getJson(API + chunk.map(encodeURIComponent).join(','));
  for (const n of chunk) {
    // a single-name response is not keyed by name; chunks of 1 are handled by the fallback below
    counts[n] = j[n]?.downloads ?? (chunk.length === 1 ? j.downloads : null) ?? 0;
  }
});
fs.writeFileSync(cacheFile, JSON.stringify(counts));
let done = 0;
for (let pass = 0; pass < 4; pass++) {
  const left = scoped.filter((n) => !(n in counts));
  if (left.length === 0) break;
  console.log('scoped pass', pass, 'left', left.length);
  await pool(left, 5, async (n) => {
    try {
      const j = await getJson(API + n.replace('/', '%2f'));
      counts[n] = j.downloads ?? 0;
    } catch (e) {
      if (/HTTP 404/.test(e.message)) counts[n] = 0;
      else console.error('scoped lookup failed (will retry)', n, e.message);
    }
    await sleep(150);
    if (++done % 500 === 0) fs.writeFileSync(cacheFile, JSON.stringify(counts));
  });
}
const unresolved = cands.filter((n) => !(n in counts));
if (unresolved.length) throw new Error('no download count for ' + unresolved.length + ' names, e.g. ' + unresolved[0]);
fs.writeFileSync(cacheFile, JSON.stringify(counts));

const ranked = cands
  .map((n, i) => ({ n: n.toLowerCase(), d: counts[n] ?? 0, i }))
  .sort((a, b) => b.d - a.d || a.i - b.i);
const seen = new Set();
const out = [];
for (const r of ranked) {
  if (seen.has(r.n)) continue;
  seen.add(r.n);
  out.push(r.n);
  if (out.length === N) break;
}
if (out.length < N) throw new Error('only ' + out.length);
writeText(path.join(rulesDir, 'popular-packages', 'npm.txt'), out.join('\n') + '\n');
addProvenance({
  'popular-packages/npm.txt': {
    source: [CAND, 'https://api.npmjs.org/downloads/point/last-month/'],
    retrieved: today(),
    licence: 'MIT',
    attribution: 'Candidate names: wooorm/npm-high-impact (MIT). Download counts: npm public download-counts API.',
  },
});
console.log('wrote', out.length, 'top:', out.slice(0, 5).join(','), 'min downloads:', ranked[N - 1].d);
