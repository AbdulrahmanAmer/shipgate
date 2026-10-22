// Builds rules/popular-packages/pypi.txt: top 10,000 PyPI projects by downloads in the last full month,
// most popular first. Source: the public ClickHouse PyPI dataset (ClickPy), the same data hugovk/top-pypi-packages
// publishes (that repo carries no licence file, so the dataset is queried directly). Names are PEP 503 normalised.
// Run: node wp/WP-104/scripts/e/pkg-pypi.mjs
import path from 'node:path';
import { addProvenance, get, rulesDir, today, writeText } from './common.mjs';

const N = 10000;
const now = new Date();
const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
const month = first.toISOString().slice(0, 10);
const URL = 'https://sql-clickhouse.clickhouse.com/?user=demo&default_format=JSON';
// the demo server caps a result at 10,000 rows, so read two pages
const rows = [];
for (const offset of [0, 10000]) {
  const query = `SELECT SUM(count) AS download_count, project FROM pypi.pypi_downloads_per_month WHERE month = '${month}' GROUP BY project ORDER BY download_count DESC, project LIMIT 10000 OFFSET ${offset}`;
  const r = await get(URL, { method: 'POST', body: query });
  rows.push(...(await r.json()).data);
}
const j = { data: rows };
if (!j.data?.length) throw new Error('no rows for ' + month);
const seen = new Set();
const out = [];
for (const row of j.data) {
  const n = String(row.project).toLowerCase().replace(/[-_.]+/g, '-');
  if (!n || seen.has(n)) continue;
  seen.add(n);
  out.push(n);
  if (out.length === N) break;
}
if (out.length < N) throw new Error('only ' + out.length);
writeText(path.join(rulesDir, 'popular-packages', 'pypi.txt'), out.join('\n') + '\n');
addProvenance({
  'popular-packages/pypi.txt': {
    source: ['https://sql-clickhouse.clickhouse.com/'],
    retrieved: today(),
    licence: 'LicenseRef-PyPI-public-download-statistics',
    attribution: `PyPI download counts for ${month.slice(0, 7)} from the public ClickHouse PyPI dataset (ClickPy); names only, no counts stored.`,
  },
});
console.log('month', month, 'rows fetched', j.data.length, 'wrote', out.length, 'top:', out.slice(0, 5).join(','));
