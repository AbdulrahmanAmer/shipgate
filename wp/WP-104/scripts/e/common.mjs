// Shared helpers for the WP-104 part e data scripts (Node 20+, no dependencies).
// Raw downloads go to a work directory OUTSIDE the repo: $SHIPGATE_WP104E_WORK or <os tmp>/shipgate-wp104e.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const repoRoot = path.resolve(here, '..', '..', '..', '..');
export const rulesDir = path.join(repoRoot, 'rules');
export const provDir = path.join(repoRoot, 'wp', 'WP-104');
export const workDir = process.env.SHIPGATE_WP104E_WORK || path.join(os.tmpdir(), 'shipgate-wp104e');
export const UA = 'shipgate-ruleset-builder/1.0 (+dave@omnikom.io)';

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
  return d;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** fetch with retries/backoff; returns a Response whose body is not yet consumed. */
export async function get(url, { headers = {}, method = 'GET', body, retries = 6, okStatuses = [200] } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(url, { method, body, headers: { 'user-agent': UA, ...headers } });
      if (okStatuses.includes(r.status)) return r;
      if (r.status === 429 || r.status >= 500) {
        const ra = Number(r.headers.get('retry-after'));
        await r.arrayBuffer();
        await sleep((ra > 0 ? ra * 1000 : 1500 * 2 ** i));
        lastErr = new Error(`HTTP ${r.status} ${url}`);
        continue;
      }
      const text = (await r.text()).slice(0, 200);
      throw new Error(`HTTP ${r.status} ${url} ${text}`);
    } catch (e) {
      if (String(e.message).startsWith('HTTP 4')) throw e;
      lastErr = e;
      await sleep(1000 * 2 ** i);
    }
  }
  throw lastErr;
}

export async function getJson(url, opts) {
  const r = await get(url, { ...opts, headers: { accept: 'application/json', ...(opts?.headers ?? {}) } });
  return r.json();
}

export async function getText(url, opts) {
  const r = await get(url, opts);
  return r.text();
}

export async function download(url, dest) {
  ensureDir(path.dirname(dest));
  const r = await get(url);
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
  return dest;
}

/** Run fn over items with bounded concurrency. */
export async function pool(items, n, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      for (;;) {
        const i = next++;
        if (i >= items.length) return;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

/** Read one named entry out of a .zip (stored or deflate), no dependencies. */
export function readZipEntry(zipPath, entryName) {
  const buf = fs.readFileSync(zipPath);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 70000); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('not a zip: ' + zipPath);
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let k = 0; k < count; k++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('bad central directory');
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28);
    const elen = buf.readUInt16LE(p + 30);
    const clen = buf.readUInt16LE(p + 32);
    const lho = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nlen);
    if (name === entryName) {
      const lnlen = buf.readUInt16LE(lho + 26);
      const lelen = buf.readUInt16LE(lho + 28);
      const start = lho + 30 + lnlen + lelen;
      const data = buf.subarray(start, start + csize);
      if (method === 0) return Buffer.from(data);
      if (method === 8) return zlib.inflateRawSync(data);
      throw new Error('unsupported zip method ' + method);
    }
    p += 46 + nlen + elen + clen;
  }
  throw new Error(`entry ${entryName} not in ${zipPath}`);
}

export function writeText(file, text) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, text, 'utf8');
}

/** Merge entries into this part's provenance fragment (single writer for the file: this part). */
export function addProvenance(entries) {
  const f = path.join(provDir, 'provenance-e.json');
  const lock = path.join(ensureDir(workDir), 'provenance.lock');
  for (;;) {
    try {
      fs.mkdirSync(lock);
      break;
    } catch {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100); // scripts may run in parallel
    }
  }
  try {
    let cur = {};
    try {
      cur = JSON.parse(fs.readFileSync(f, 'utf8'));
    } catch {
      cur = {};
    }
    Object.assign(cur, entries);
    const sorted = Object.fromEntries(Object.keys(cur).sort().map((k) => [k, cur[k]]));
    fs.writeFileSync(f, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
  } finally {
    fs.rmdirSync(lock);
  }
}

export function lines(names) {
  return names.join('\n') + '\n';
}
