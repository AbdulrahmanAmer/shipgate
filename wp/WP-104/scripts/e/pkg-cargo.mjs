// Builds rules/popular-packages/cargo.txt: top 10,000 crates by all-time downloads, most popular first.
// Source: crates.io API, `GET /api/v1/crates?sort=downloads&per_page=100&page=1..100`
// (crawler policy: identifying User-Agent, <= 1 request per second).
// Run: node wp/WP-104/scripts/e/pkg-cargo.mjs
import path from 'node:path';
import { addProvenance, getJson, rulesDir, sleep, today, writeText } from './common.mjs';

const N = 10000;
const out = [];
const seen = new Set();
for (let page = 1; out.length < N && page <= 120; page++) {
  const j = await getJson(`https://crates.io/api/v1/crates?sort=downloads&per_page=100&page=${page}`);
  for (const c of j.crates) {
    const n = String(c.name).toLowerCase();
    if (!seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  if (page % 20 === 0) console.log('page', page, out.length);
  await sleep(1100);
}
if (out.length < N) throw new Error('only ' + out.length);
const names = out.slice(0, N);
writeText(path.join(rulesDir, 'popular-packages', 'cargo.txt'), names.join('\n') + '\n');
addProvenance({
  'popular-packages/cargo.txt': {
    source: ['https://crates.io/api/v1/crates?sort=downloads'],
    retrieved: today(),
    licence: 'LicenseRef-crates.io-public-metadata',
    attribution: 'Crate names ranked by crates.io total downloads (public crates.io API; names only).',
  },
});
console.log('wrote', names.length, 'top:', names.slice(0, 5).join(','));
