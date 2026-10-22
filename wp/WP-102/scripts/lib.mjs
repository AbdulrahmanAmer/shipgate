// Shared helpers for the WP-102 sourcing scripts. Streams downloads through SHA-256 (and sha512/sha1/md5 for
// cross-checks against vendor digests), deletes the payload, and memoises the digests one file per URL so
// several scripts can run in parallel without clobbering each other's cache.
import { createHash } from "node:crypto";
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { execFileSync } from "node:child_process";

export const SCRATCH = process.env.WP102_SCRATCH;
if (!SCRATCH) throw new Error("set WP102_SCRATCH");
mkdirSync(join(SCRATCH, "cache"), { recursive: true });
const cacheFile = (key) => join(SCRATCH, "cache", createHash("sha1").update(key).digest("hex") + ".json");
export function recall(key) {
  const f = cacheFile(key);
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : undefined;
}
export function remember(key, value) { writeFileSync(cacheFile(key), JSON.stringify(value)); }

const UA = { "user-agent": "shipgate-wp102-sourcing/1.0 (+builder)" };

/** fetch with up to 5 attempts (transient network errors / 5xx / 429), linear backoff. */
async function rfetch(url, opts) {
  let last;
  for (let i = 0; i < 5; i++) {
    try {
      const r = await fetch(url, opts);
      if (r.status >= 500 || r.status === 429) { last = new Error(`${url}: HTTP ${r.status}`); await new Promise((s) => setTimeout(s, 2000 * (i + 1))); continue; }
      return r;
    } catch (e) {
      last = e;
      await new Promise((s) => setTimeout(s, 2000 * (i + 1)));
    }
  }
  throw last;
}

export async function getText(url, headers = {}) {
  const r = await rfetch(url, { headers: { ...UA, ...headers }, redirect: "follow" });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return r.text();
}
export async function getJson(url, headers = {}) {
  return JSON.parse(await getText(url, headers));
}
export async function head(url) {
  const r = await rfetch(url, { method: "HEAD", headers: UA, redirect: "follow" });
  if (r.ok) return { ok: true, status: r.status, size: Number(r.headers.get("content-length") ?? 0), type: r.headers.get("content-type"), url: r.url, headers: Object.fromEntries(r.headers) };
  // Some CDNs refuse HEAD: a one-byte ranged GET reports the total in Content-Range.
  const g = await rfetch(url, { headers: { ...UA, range: "bytes=0-0" }, redirect: "follow" });
  const cr = g.headers.get("content-range");
  const total = cr ? Number(cr.split("/")[1]) : 0;
  await g.body?.cancel();
  return { ok: g.ok, status: g.status, size: total, type: g.headers.get("content-type"), url: g.url, headers: Object.fromEntries(g.headers) };
}

/** Download `url` (streamed) to a temp file, return { sha256, sha512b64, sha1, md5, size }; delete the file unless keep. */
export async function hashUrl(url, { keep = false } = {}) {
  const hit = recall(url);
  if (hit && !keep) return hit;
  const dir = join(SCRATCH, "dl");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, createHash("sha1").update(url).digest("hex"));
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await rfetch(url, { headers: UA, redirect: "follow" });
      if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
      const h = createHash("sha256"), h5 = createHash("sha512"), h1 = createHash("sha1"), hm = createHash("md5");
      let size = 0;
      const src = Readable.fromWeb(r.body);
      src.on("data", (c) => { h.update(c); h5.update(c); h1.update(c); hm.update(c); size += c.length; });
      await pipeline(src, createWriteStream(file));
      const out = { sha256: h.digest("hex"), sha512b64: h5.digest("base64"), sha1: h1.digest("hex"), md5: hm.digest("hex"), size };
      const declared = Number(r.headers.get("content-length") ?? 0);
      if (declared && !r.headers.get("content-encoding") && declared !== size) throw new Error(`${url}: received ${size} bytes, Content-Length ${declared}`);
      remember(url, out);
      if (!keep) rmSync(file, { force: true });
      return { ...out, file: keep ? file : undefined };
    } catch (e) {
      lastErr = e;
      rmSync(file, { force: true });
      await new Promise((s) => setTimeout(s, 3000 * (attempt + 1)));
    }
  }
  throw lastErr;
}

// GitHub REST (authenticated through the local `gh` login to avoid the anonymous rate limit).
let ghTok;
export async function ghJson(path) {
  ghTok ??= execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
  const r = await rfetch(`https://api.github.com/${path}`, { headers: { ...UA, authorization: `Bearer ${ghTok}`, accept: "application/vnd.github+json" } });
  if (!r.ok) throw new Error(`GitHub ${path}: HTTP ${r.status}`);
  return r.json();
}
