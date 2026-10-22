// Portable PostgreSQL from theseus-rs/postgresql-binaries (vendor-published <asset>.sha256, per-asset manifest.json
// with the full file list). Extensions = every extension/*.control file in that archive's own manifest.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getText, getJson, ghJson, SCRATCH } from "./lib.mjs";

const MAJORS = [15, 16, 17, 18];
const TARGETS = {
  "windows-x64": ["x86_64-pc-windows-msvc", "zip"],
  "windows-arm64": ["aarch64-pc-windows-msvc", "zip"],
  "macos-arm64": ["aarch64-apple-darwin", "tar.gz"],
  "macos-x64": ["x86_64-apple-darwin", "tar.gz"],
  "linux-x64-gnu": ["x86_64-unknown-linux-gnu", "tar.gz"],
  "linux-arm64-gnu": ["aarch64-unknown-linux-gnu", "tar.gz"],
  "linux-x64-musl": ["x86_64-unknown-linux-musl", "tar.gz"],
  "linux-arm64-musl": ["aarch64-unknown-linux-musl", "tar.gz"],
};
const out = { items: [], unavailable: [], extensionsByBuild: {} };
const rels = [];
for (let page = 1; ; page++) {
  const r = await ghJson(`repos/theseus-rs/postgresql-binaries/releases?per_page=100&page=${page}`);
  if (!r.length) break;
  rels.push(...r);
}
const verKey = (t) => t.split(".").map(Number);
const cmp = (a, b) => { const x = verKey(a), y = verKey(b); for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (y[i] ?? 0) - (x[i] ?? 0); return 0; };

for (const major of MAJORS) {
  const cands = rels.filter((r) => !r.draft && !r.prerelease && r.tag_name.startsWith(`${major}.`)).sort((a, b) => cmp(a.tag_name, b.tag_name));
  const rel = cands[0];
  console.log("PG", major, "->", rel.tag_name, rel.published_at);
  const pgVersion = rel.tag_name; // theseus tag = <postgres version>.<build>
  for (const [plat, [triple, ext]] of Object.entries(TARGETS)) {
    const name = `postgresql-${rel.tag_name}-${triple}.${ext}`;
    const asset = rel.assets.find((a) => a.name === name);
    const sumAsset = rel.assets.find((a) => a.name === `${name}.sha256`);
    const manAsset = rel.assets.find((a) => a.name === `${name}.manifest.json`);
    if (!asset || !sumAsset) {
      out.unavailable.push({ name: "postgresql", platform: plat, reason: `release ${rel.tag_name} has no ${name}`, fallback: "external database provider, 04 § 4.2 step 1a" });
      continue;
    }
    const sumTxt = (await getText(sumAsset.browser_download_url)).trim();
    const sha = sumTxt.split(/\s+/)[0];
    const gh = asset.digest?.replace("sha256:", "");
    if (gh && gh !== sha) throw new Error(`${name}: .sha256 file ${sha} != GitHub asset digest ${gh}`);
    let exts = [];
    if (manAsset) {
      const man = await getJson(manAsset.browser_download_url);
      if (man.sha256 !== sha) throw new Error(`${name}: manifest sha256 ${man.sha256} != .sha256 file ${sha}`);
      exts = Object.keys(man.files).map((p) => p.match(/extension\/([^/]+)\.control$/)?.[1]).filter(Boolean).sort();
    }
    out.extensionsByBuild[`${major}/${plat}`] = exts;
    out.items.push({
      name: "postgresql", version: pgVersion, platform: plat, url: asset.browser_download_url, sha256: sha, size: asset.size,
      licence: "PostgreSQL", purpose: "database", unpackTo: `postgresql/${major}`, requires: [], extensions: exts,
      _source: `github.com/theseus-rs/postgresql-binaries release ${rel.tag_name} (${rel.published_at.slice(0, 10)}), asset ${name}; sha256 from the release's ${name}.sha256 file, equal to the GitHub asset digest and to the sha256 recorded in the asset's manifest.json; size from the GitHub asset record; extensions = ${exts.length} extension/*.control files listed in the asset's manifest.json`,
    });
  }
}
mkdirSync(join(SCRATCH, "fragments"), { recursive: true });
writeFileSync(join(SCRATCH, "fragments", "03-postgresql.json"), JSON.stringify(out, null, 1));
for (const i of out.items) console.log(i.version, i.platform, i.size, i.sha256.slice(0, 10), i.extensions.length);
console.log(out.unavailable);
