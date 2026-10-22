// Builds rules/popular-packages/nuget.txt: top 10,000 NuGet packages by total downloads, most popular first.
// Source: nuget.org legacy v2 feed `Search()` ordered by DownloadCount (the v3 search API caps `skip` at ~4,000).
// Run: node wp/WP-104/scripts/e/pkg-nuget.mjs
import path from 'node:path';
import { addProvenance, getText, rulesDir, sleep, today, writeText } from './common.mjs';

const N = 10000;
const PAGE = 100;
const out = [];
const seen = new Set();
let last = Infinity;
const rowsDl = [];
for (let skip = 0; out.length < N + 100 && skip < 14000; skip += PAGE) {
  const url =
    "https://www.nuget.org/api/v2/Search()?$filter=IsLatestVersion&$orderby=DownloadCount%20desc&searchTerm=%27%27&targetFramework=%27%27&includePrerelease=false" +
    `&$top=${PAGE}&$skip=${skip}`;
  const xml = await getText(url);
  const entries = xml.split('<entry>').slice(1);
  if (entries.length === 0) break;
  for (const e of entries) {
    const id = /<d:Id>([^<]+)<\/d:Id>/.exec(e)?.[1] ?? /<title[^>]*>([^<]+)<\/title>/.exec(e)?.[1];
    const dl = Number(/<d:DownloadCount[^>]*>(\d+)</.exec(e)?.[1]);
    if (!id || !Number.isFinite(dl)) throw new Error('unparseable entry at skip ' + skip);
    rowsDl.push(dl);
    last = dl;
    const n = id.toLowerCase();
    if (!seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  }
  if ((skip / PAGE) % 20 === 0) console.log('skip', skip, out.length, 'downloads', last);
  await sleep(200);
}
// nuget.org's index order is the ranking; its displayed counts jitter locally (index lag, int32 clamp), so only the trend is checked
if (!(rowsDl[1000] > rowsDl[5000] && rowsDl[5000] > rowsDl[9900])) throw new Error('v2 Search() results do not trend down by DownloadCount');
if (out.length < N) throw new Error('only ' + out.length);
const names = out.slice(0, N);
writeText(path.join(rulesDir, 'popular-packages', 'nuget.txt'), names.join('\n') + '\n');
addProvenance({
  'popular-packages/nuget.txt': {
    source: ['https://www.nuget.org/api/v2/Search()', 'https://api.nuget.org/v3/index.json'],
    retrieved: today(),
    licence: 'LicenseRef-NuGet-public-metadata',
    attribution: 'Package ids ranked by nuget.org total downloads (public NuGet feed; ids only).',
  },
});
console.log('wrote', names.length, 'top:', names.slice(0, 5).join(','), 'downloads at tail:', last);
