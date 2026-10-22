// Builds rules/popular-packages/composer.txt: top 10,000 Packagist packages by downloads, most popular first.
// Source: Packagist `GET https://packagist.org/explore/popular.json?per_page=100&page=1..100`.
// Run: node wp/WP-104/scripts/e/pkg-composer.mjs
import path from 'node:path';
import { addProvenance, getJson, rulesDir, sleep, today, writeText } from './common.mjs';

const N = 10000;
const out = [];
const seen = new Set();
for (let page = 1; out.length < N && page <= 130; page++) {
  const j = await getJson(`https://packagist.org/explore/popular.json?per_page=100&page=${page}`);
  if (!j.packages?.length) break;
  for (const p of j.packages) {
    const n = String(p.name).toLowerCase();
    if (!seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  if (page % 20 === 0) console.log('page', page, out.length);
  await sleep(300);
}
if (out.length < N) throw new Error('only ' + out.length);
const names = out.slice(0, N);
writeText(path.join(rulesDir, 'popular-packages', 'composer.txt'), names.join('\n') + '\n');
addProvenance({
  'popular-packages/composer.txt': {
    source: ['https://packagist.org/explore/popular.json'],
    retrieved: today(),
    licence: 'LicenseRef-Packagist-public-metadata',
    attribution: 'Package names ranked by Packagist downloads (public Packagist API; names only).',
  },
});
console.log('wrote', names.length, 'top:', names.slice(0, 5).join(','));
