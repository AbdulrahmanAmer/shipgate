// Builds rules/popular-packages/go.txt: top 10,000 Go module paths by "imported by" count, most popular first.
// Source: the pkg.go.dev API `GET https://pkg.go.dev/v1/search?q=<q>&limit=100[&token=..]`, whose items carry
// `importedByCounts.modules` (number of modules importing the package). The search returns at most 1,000
// results per query, ranked by relevance, so the candidate set is grown by snowballing: seed queries, then the
// path words of the most-imported modules found so far, until the top-10,000 set stops changing
// (churn per round below CHURN_STOP for two rounds). A module's score is the highest count among its packages seen.
// State is cached in the work dir so the crawl resumes. Run: node wp/WP-104/scripts/e/pkg-go.mjs
import fs from 'node:fs';
import path from 'node:path';
import { addProvenance, ensureDir, getJson, pool, rulesDir, sleep, today, workDir, writeText } from './common.mjs';

const N = 10000;
const ROUND = 200; // queries per round
const MAX_QUERIES = 6000;
const BUDGET_MS = Number(process.env.GO_BUDGET_MINUTES || 100) * 60000; // wall-clock cap for this run
const T0 = Date.now();
const CHURN_STOP = 0.004;
const stateFile = path.join(ensureDir(path.join(workDir, 'go')), 'state.json');

let state = { mods: {}, done: [], prevTop: [], calm: 0 };
try {
  state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
} catch {
  /* fresh start */
}
const mods = state.mods;
const done = new Set(state.done);
const save = () => fs.writeFileSync(stateFile, JSON.stringify({ mods, done: [...done], prevTop: state.prevTop, calm: state.calm }));

function cutoff() {
  const v = Object.values(mods).sort((a, b) => b - a);
  return v.length >= N ? v[N - 1] : 0;
}

async function runQuery(q) {
  const cut = Math.max(cutoff(), 10);
  let token = '';
  for (let page = 0; page < 10; page++) {
    if (page > 0 && Date.now() - T0 > BUDGET_MS) break;
    const url = `https://pkg.go.dev/v1/search?q=${encodeURIComponent(q)}&limit=100${token ? '&token=' + token : ''}`;
    const j = await getJson(url);
    let useful = false;
    for (const it of j.items ?? []) {
      if (!it.modulePath || it.modulePath === 'std') continue;
      const c = it.importedByCounts?.modules ?? 0;
      if (c > (mods[it.modulePath] ?? -1)) mods[it.modulePath] = c;
      if (c >= cut) useful = true;
    }
    token = j.nextPageToken;
    if (!token || !useful) break;
  }
}

function words() {
  const freq = new Map();
  const top = Object.entries(mods).sort((a, b) => b[1] - a[1]).slice(0, 25000);
  for (const [m] of top) {
    for (const w of m.toLowerCase().split(/[/._~-]+/)) {
      if (w.length < 2 || /^v\d+$/.test(w) || /^\d+$/.test(w)) continue;
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).map((e) => e[0]).filter((w) => !done.has(w));
}

const seeds = [
  ...'abcdefghijklmnopqrstuvwxyz'.split(''),
  ...'0123456789'.split(''),
  'http', 'grpc', 'sql', 'redis', 'kubernetes', 'aws', 'azure', 'google', 'json', 'yaml', 'log', 'test', 'cli',
  'router', 'cache', 'queue', 'metrics', 'trace', 'crypto', 'auth', 'oauth', 'jwt', 'proto', 'websocket', 'kafka',
  'mongo', 'postgres', 'mysql', 'sqlite', 'docker', 'terraform', 'prometheus', 'otel', 'uuid', 'time', 'errors',
].filter((q) => !done.has(q));

let queries = done.size;
let pending = seeds;
while (queries < MAX_QUERIES) {
  if (pending.length === 0) pending = words().slice(0, ROUND);
  if (pending.length === 0) break;
  const batch = pending.splice(0, ROUND);
  let n = 0;
  await pool(batch, 8, async (q) => {
    try {
      await runQuery(q);
      done.add(q);
    } catch (e) {
      console.error('query failed', q, e.message);
    }
    n++;
    await sleep(100);
  });
  queries = done.size;
  const top = Object.entries(mods).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, N).map((e) => e[0]);
  const prev = new Set(state.prevTop);
  const added = top.filter((m) => !prev.has(m)).length;
  const churn = state.prevTop.length ? added / N : 1;
  state.calm = churn < CHURN_STOP ? state.calm + 1 : 0;
  state.prevTop = top;
  save();
  console.log(`queries ${queries} modules ${Object.keys(mods).length} cutoff(10k) ${cutoff()} churn ${(churn * 100).toFixed(2)}% calm ${state.calm}`);
  if (state.calm >= 2 && queries >= 1500) break;
  if (Date.now() - T0 > BUDGET_MS) {
    console.log('time budget reached; stopping the crawl with the candidate set found so far');
    break;
  }
}

const ranked = Object.entries(mods)
  .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
  .map((e) => e[0]);
const seen = new Set();
const out = [];
for (const m of ranked) {
  const l = m.toLowerCase();
  if (seen.has(l)) continue;
  seen.add(l);
  out.push(l);
  if (out.length === N) break;
}
if (out.length < N) throw new Error('only ' + out.length);
const must = ['github.com/spf13/cobra', 'github.com/stretchr/testify', 'golang.org/x/net', 'google.golang.org/grpc', 'go.uber.org/zap', 'gopkg.in/yaml.v3', 'github.com/gin-gonic/gin', 'github.com/google/uuid'];
const missing = must.filter((m) => !seen.has(m));
if (missing.length) throw new Error('coverage check failed, missing: ' + missing.join(', '));
writeText(path.join(rulesDir, 'popular-packages', 'go.txt'), out.join('\n') + '\n');
addProvenance({
  'popular-packages/go.txt': {
    source: ['https://pkg.go.dev/v1/search'],
    retrieved: today(),
    licence: 'LicenseRef-pkg.go.dev-public-metadata',
    attribution: 'Go module paths ranked by pkg.go.dev "imported by" module counts (public pkg.go.dev API; names only).',
  },
});
console.log('wrote', out.length, 'top:', out.slice(0, 5).join(','), 'count at rank 10000:', mods[ranked[N - 1]]);
