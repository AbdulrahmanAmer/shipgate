// Builds rules/popular-packages/rubygems.txt: top 10,000 gems by total downloads, most popular first.
// Source: RubyGems search API `GET https://rubygems.org/api/v1/search.json?query=downloads:>N&page=P`, which
// returns results ordered by downloads (30 per page). Run: node wp/WP-104/scripts/e/pkg-rubygems.mjs
import path from 'node:path';
import { addProvenance, getJson, rulesDir, sleep, today, writeText } from './common.mjs';

const N = 10000;
const out = [];
const seen = new Set();
let last = Infinity;
let inversions = 0;
// The search endpoint stops at page 333 (9,990 results) per query, so a second query continues below the
// last download count reached by the first.
async function crawl(query, maxPages) {
  const q = encodeURIComponent(query);
  for (let page = 1; out.length < N + 100 && page <= maxPages; page++) {
    const j = await getJson(`https://rubygems.org/api/v1/search.json?query=${q}&page=${page}`);
    if (!Array.isArray(j) || j.length === 0) break;
    for (const g of j) {
      if (g.downloads > last) inversions++; // counts move while paging; a few local swaps are expected
      last = g.downloads;
      const n = String(g.name).toLowerCase();
      if (!seen.has(n)) {
        seen.add(n);
        out.push(n);
      }
    }
    if (page % 50 === 0) console.log(query, 'page', page, out.length, 'downloads at tail', last);
    await sleep(250);
  }
}
await crawl('downloads:>100000', 333);
if (out.length < N + 100) await crawl(`downloads:<${last + 1}`, 333);
if (inversions > out.length / 50) throw new Error('search results are not ordered by downloads: ' + inversions + ' inversions');
if (out.length < N) throw new Error('only ' + out.length);
const names = out.slice(0, N);
writeText(path.join(rulesDir, 'popular-packages', 'rubygems.txt'), names.join('\n') + '\n');
addProvenance({
  'popular-packages/rubygems.txt': {
    source: ['https://rubygems.org/api/v1/search.json'],
    retrieved: today(),
    licence: 'LicenseRef-RubyGems-public-metadata',
    attribution: 'Gem names ranked by RubyGems total downloads (public RubyGems API; names only).',
  },
});
console.log('wrote', names.length, 'top:', names.slice(0, 5).join(','), 'downloads at rank 10000:', last);
