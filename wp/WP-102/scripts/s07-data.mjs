// Data snapshots and grammar/DDL artifacts: OSV ecosystem databases, endoflife.date data, Public Suffix List,
// Hunspell dictionaries, libphonenumber metadata, Supabase schema DDL reference, tree-sitter wasm grammars.
// Everything is pinned to an immutable URL (commit/tag/versioned path) except the OSV zips, which the vendor
// regenerates hourly (the manifest records the bytes seen today; `fetch` refreshes them).
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getJson, getText, ghJson, hashUrl, head, SCRATCH } from "./lib.mjs";
import { npmItem } from "./npm.mjs";

const out = { items: [], unavailable: [], notes: {} };
const data = (o) => ({ purpose: "data", refresh: "fetch", platform: "any", requires: [], ...o });

// ---- OSV per-ecosystem databases ---------------------------------------------------------------------------------------
const OSV = [
  ["osv-db", "npm", "npm"], ["osv-db-pypi", "PyPI", "pypi"], ["osv-db-crates-io", "crates.io", "cargo"], ["osv-db-go", "Go", "go"],
  ["osv-db-packagist", "Packagist", "composer"], ["osv-db-rubygems", "RubyGems", "rubygems"], ["osv-db-maven", "Maven", "maven"], ["osv-db-nuget", "NuGet", "nuget"],
];
for (const [name, eco, ours] of OSV) {
  const url = `https://osv-vulnerabilities.storage.googleapis.com/${eco}/all.zip`;
  let r, h, ok = false;
  for (let i = 0; i < 3 && !ok; i++) {
    h = await head(url);
    const md5 = /md5=([^,\s]+)/.exec(h.headers["x-goog-hash"] ?? "")?.[1];
    // the zip is regenerated hourly: bypass the digest cache so the bytes and the header come from the same object
    r = await hashUrl(url, { keep: true });
    const h2 = await head(url);
    const md5b = /md5=([^,\s]+)/.exec(h2.headers["x-goog-hash"] ?? "")?.[1];
    const mine = Buffer.from(r.md5, "hex").toString("base64");
    ok = md5 === md5b && md5 === mine;
    if (!ok) console.log("retry", eco, md5, md5b, mine);
    if (r.file) (await import("node:fs")).rmSync(r.file, { force: true });
  }
  if (!ok) throw new Error(`${eco}: object changed during every attempt`);
  out.items.push(data({
    name, version: `${h.headers["last-modified"] ? new Date(h.headers["last-modified"]).toISOString().slice(0, 13) + "Z" : "unknown"}`, url, sha256: r.sha256, size: r.size,
    licence: "CC-BY-4.0 AND CC0-1.0", unpackTo: `osv-scanner-db/${eco}/all.zip`, requires: ["osv-scanner"],
    _source: `${url} (OSV per-ecosystem export for ${eco}, shipgate ecosystem \`${ours}\`); sha256 and size from a full download; Google Cloud Storage's x-goog-hash md5 (HEAD before and after the download) equals the md5 of the downloaded bytes, so the object did not change mid-download; version = the object's Last-Modified hour (the export is regenerated hourly, so this entry is a seed value that \`fetch\` replaces). Licence: osv.dev/data lists the source databases (GitHub Advisory Database CC-BY-4.0, Go vulndb CC-BY-4.0, RustSec CC0-1.0, ...): attribution required`,
  }));
}

// ---- endoflife.date (repo archive; the API host is unreachable from this machine) ------------------------------------------
{
  const sha = (await ghJson("repos/endoflife-date/endoflife.date/commits/master")).sha;
  const url = `https://codeload.github.com/endoflife-date/endoflife.date/tar.gz/${sha}`;
  const r = await hashUrl(url);
  out.items.push(data({
    name: "eol-dates", version: sha.slice(0, 12), url, sha256: r.sha256, size: r.size, licence: "MIT", unpackTo: "eol-dates",
    _source: `endoflife.date source repository (the data the endoflife.date site and API are built from; products/*.md front matter holds the eol dates), commit ${sha} of master, via GitHub's archive endpoint; sha256 and size from a full download. The API (endoflife.date/api/v1/products/full) could not be reached from this machine (curl and Node: connection timeout, three attempts), so the repository archive is used; repository licence MIT (GitHub licence API)`,
  }));
}

// ---- Public Suffix List ---------------------------------------------------------------------------------------------------
{
  const c = await ghJson("repos/publicsuffix/list/commits/main");
  const url = `https://raw.githubusercontent.com/publicsuffix/list/${c.sha}/public_suffix_list.dat`;
  const r = await hashUrl(url);
  out.items.push(data({
    name: "public-suffix-list", version: c.sha.slice(0, 12), url, sha256: r.sha256, size: r.size, licence: "MPL-2.0", unpackTo: "public-suffix-list/public_suffix_list.dat",
    _source: `publicsuffix/list upstream repository (the source of publicsuffix.org/list/public_suffix_list.dat), commit ${c.sha} (${c.commit.committer.date.slice(0, 10)}), immutable raw URL; sha256 and size from a full download. Licence: MPL-2.0 (GitHub licence API / repository LICENSE)`,
  }));
}

// ---- Hunspell dictionaries ------------------------------------------------------------------------------------------------
{
  const LOCALES = ["cs", "da", "de", "en", "es", "fr", "it", "ko", "nb", "nl", "pl", "pt", "ro", "ru", "sv", "tr"];
  const lic = {};
  for (const l of LOCALES) {
    try { lic[l] = (await getJson(`https://registry.npmjs.org/dictionary-${l}/latest`)).license; } catch (e) { lic[l] = `ERR ${e.message}`; }
  }
  out.notes.hunspellLicences = lic;
  const spdx = [...new Set(Object.values(lic).flatMap((x) => String(x).replace(/[()]/g, "").split(/\s+(?:AND|OR)\s+/)))].sort();
  const sha = "8cfea406b505e4d7df52d5a19bce525df98c54ab";
  const url = `https://codeload.github.com/wooorm/dictionaries/tar.gz/${sha}`;
  const r = await hashUrl(url);
  out.items.push(data({
    name: "hunspell-dictionaries", version: sha.slice(0, 12), url, sha256: r.sha256, size: r.size, licence: `MIT AND ${spdx.join(" AND ")}`, unpackTo: "hunspell",
    _source: `wooorm/dictionaries (Hunspell dictionaries repackaged from LibreOffice/OpenOffice extensions), commit ${sha} (last commit of the repo, 2024-09-09), via GitHub's archive endpoint; sha256 and size from a full download. The archive holds dictionaries/<locale>/index.aff|index.dic for ${LOCALES.join(", ")} (D-010 locales) plus ~70 more; each dictionary directory has its own license file. Licence field = MIT (the repo) AND the union of the SPDX licences that the npm packages dictionary-<locale> declare for the 16 D-010 locales: ${JSON.stringify(lic)}`,
  }));
  // Arabic: not in wooorm/dictionaries; LibreOffice's dictionaries repo has ar/ar.aff + ar/ar.dic (Ayaspell)
  const lo = (await ghJson("repos/LibreOffice/dictionaries/commits/master")).sha;
  const readme = await getText(`https://raw.githubusercontent.com/LibreOffice/dictionaries/${lo}/ar/README_ar.txt`);
  out.notes.arReadme = readme.slice(0, 1500);
  for (const ext of ["aff", "dic"]) {
    const u = `https://raw.githubusercontent.com/LibreOffice/dictionaries/${lo}/ar/ar.${ext}`;
    const x = await hashUrl(u);
    out.items.push(data({
      name: `hunspell-ar-${ext}`, version: lo.slice(0, 12), url: u, sha256: x.sha256, size: x.size, licence: "LicenseRef-PENDING-ar-README", unpackTo: `hunspell/ar/index.${ext}`,
      _source: `LibreOffice/dictionaries repository (official LibreOffice dictionaries), commit ${lo}, file ar/ar.${ext} (Ayaspell Arabic); sha256 and size from a full download; licence from ar/README_ar.txt (see sourcing.md)`,
    }));
  }
  for (const [l, why] of [
    ["fi", "no Hunspell Finnish dictionary exists in wooorm/dictionaries or in LibreOffice/dictionaries (directory listings read from the GitHub API, 2026-10-22); a web search found none"],
    ["ja", "Hunspell has no Japanese dictionary (no word-delimited spelling model); absent from wooorm/dictionaries and LibreOffice/dictionaries"],
    ["zh", "Hunspell has no Chinese dictionary (no word-delimited spelling model); absent from wooorm/dictionaries and LibreOffice/dictionaries"],
  ]) out.unavailable.push({ name: "hunspell-dictionaries", platform: "any", locale: l, reason: why, fallback: "a page locale without a toolchain dictionary is never skipped: 04 § 15 Page locale (no entry) applies (packs/web-delivery.md CQ-007)" });
}

// ---- libphonenumber metadata -----------------------------------------------------------------------------------------------
{
  const rel = await ghJson("repos/google/libphonenumber/releases/latest");
  const url = `https://raw.githubusercontent.com/google/libphonenumber/${rel.tag_name}/resources/PhoneNumberMetadata.xml`;
  const r = await hashUrl(url);
  out.items.push(data({
    name: "libphonenumber-metadata", version: rel.tag_name.replace(/^v/, ""), url, sha256: r.sha256, size: r.size, licence: "Apache-2.0", unpackTo: "libphonenumber/PhoneNumberMetadata.xml",
    _source: `google/libphonenumber release ${rel.tag_name} (${rel.published_at.slice(0, 10)}), resources/PhoneNumberMetadata.xml at that tag; sha256 and size from a full download; Apache-2.0 (GitHub licence API)`,
  }));
}

// ---- Supabase schema DDL (upstream reference scripts) ----------------------------------------------------------------------------
{
  const c = await ghJson("repos/supabase/postgres/commits/develop");
  const url = `https://codeload.github.com/supabase/postgres/tar.gz/${c.sha}`;
  const r = await hashUrl(url);
  out.items.push({
    name: "supabase-schema-ddl", version: c.sha.slice(0, 12), platform: "any", url, sha256: r.sha256, size: r.size, licence: "PostgreSQL", purpose: "tool", unpackTo: "supabase-schema-ddl", requires: [],
    _source: `supabase/postgres repository, commit ${c.sha} of develop (${c.commit.committer.date.slice(0, 10)}), GitHub archive endpoint; sha256 and size from a full download. The archive's migrations/db/init-scripts/ holds 00000000000000-initial-schema.sql (roles, schemas, publication), 00000000000001-auth-schema.sql, 00000000000002-storage-schema.sql, 00000000000003-post-setup.sql (listed through the GitHub contents API). This is the UPSTREAM reference for the 04 § 4.4 schema-prep DDL, not shipgate's own DDL: see spec-changes.md. Licence: PostgreSQL (GitHub licence API)`,
  });
}

// ---- tree-sitter grammars (prebuilt wasm) ---------------------------------------------------------------------------------------
{
  const it = await npmItem("tree-sitter-wasms", "0.1.13", { name: "tree-sitter-wasms", purpose: "grammar", unpackTo: "grammars/tree-sitter-wasms", requires: [] });
  it._source += "; the tarball's out/ holds prebuilt tree-sitter-<lang>.wasm for bash, c, c_sharp, cpp, css, dart, elisp, elixir, elm, embedded_template, go, html, java, javascript, json, kotlin, lua, objc, ocaml, php, python, ql, rescript, ruby, rust, scala, solidity, swift, systemrdl, tlaplus, toml, tsx, typescript, vue, yaml, zig (tar listing read); of the 02 § 4 template grammars it covers vue and embedded_template only";
  out.items.push(it);
  for (const [g, pkg, ver, lic] of [["svelte", "@tree-sitter-grammars/tree-sitter-svelte", "1.0.2", "MIT"], ["astro", "none on npm", "-", "-"], ["twig", "tree-sitter-twig", "0.8.2", "MPL-2.0"], ["blade", "tree-sitter-blade", "0.11.0", "MIT"], ["jinja2", "tree-sitter-jinja2", "0.2.0", "GPL-3.0-or-later"]]) {
    out.unavailable.push({ name: `tree-sitter-${g}`, platform: "any", reason: `no prebuilt wasm artifact exists: ${pkg === "none on npm" ? "no tree-sitter-astro package is published on npm (registry 404 for tree-sitter-astro and @tree-sitter-grammars/tree-sitter-astro)" : `the npm package ${pkg}@${ver} (${lic}) ships C sources and no .wasm file (tarball listing read)`}; building wasm needs the tree-sitter CLI plus emscripten or docker, which belongs to the release pipeline (WP-103 decides maturity)`, fallback: "declared regexSinks with a structural-tier cap, 02 § 4 Templates" });
  }
}

// ---- registry snapshots and WordPress feed: no downloadable artifact --------------------------------------------------------
out.unavailable.push(
  { name: "npm-deprecations", platform: "any", reason: "no downloadable bulk artifact exists: npm publishes `deprecated` only inside per-package packuments (registry.npmjs.org/<name>); the only bulk sources are the CouchDB replica and ecosyste.ms's packages dump (63,693,845,834 bytes, CC-BY-SA-4.0, last built 2026-02-05). 03 § 19 itself scopes this data to 'packages in the project's lockfiles only', i.e. it is queried at fetch time, not shipped", fallback: "SEC-052 part deprecated-unknown (W): deprecation unknown when the package is absent from the snapshot, 03 § 19; see wp/WP-102/spec-changes.md § 3" },
  { name: "registry-publish-times", platform: "any", reason: "no downloadable bulk artifact exists: publish times are per-version fields in registry packuments (npm `time`, PyPI/crates.io/Packagist/RubyGems APIs); only huge or stale dumps exist (ecosyste.ms packages dump 63.7 GB CC-BY-SA-4.0 from 2026-02-05; crates.io db-dump covers one ecosystem)", fallback: "SEC-053 part age-unknown (W): publish time absent from the snapshot, 03 § 19; see wp/WP-102/spec-changes.md § 3" },
  { name: "wordpress-vulnerabilities", platform: "any", reason: "BLOCKED: the Wordfence Intelligence feed is v3 only (v2 returns 410 Gone, checked 2026-10-22) and v3 returns 401 'API key must be supplied using a Bearer token'; keys are issued to an account holder and their terms forbid sharing or sublicensing the key (per Wordfence's published terms and v3 docs; the wordfence.com pages themselves answered 202 to scripted fetches, so the terms text was read through web search snippets only, UNPROVEN in full). WPScan is commercial (BUILD_MAP WP-102 row). Needs an Operator-owned Wordfence account key and a terms check that redistributing a derived snapshot to licensed customers is allowed", fallback: "SEC-073 part version-unknown cannot run offline; the check is unavailable until a snapshot exists, 03 § 19 (data snapshots are vendor-built and signed); see wp/WP-102/spec-changes.md § 3" },
);

mkdirSync(join(SCRATCH, "fragments"), { recursive: true });
writeFileSync(join(SCRATCH, "fragments", "07-data.json"), JSON.stringify(out, null, 1));
for (const i of out.items) console.log(i.name, i.version, i.size, i.sha256.slice(0, 10), i.licence);
console.log(JSON.stringify(out.notes, null, 1).slice(0, 3500));
