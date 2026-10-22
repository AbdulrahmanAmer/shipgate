// MySQL Community Server 9.7.x LTS from cdn.mysql.com. Oracle publishes only MD5 (<file>.md5) and a GnuPG
// signature (<file>.asc), no SHA-256, so every archive is downloaded and hashed here; the vendor MD5 is
// re-checked against the downloaded bytes (an independent integrity check).
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getText, hashUrl, head, SCRATCH } from "./lib.mjs";

const V = process.argv[2] ?? "9.7.4";
const series = V.split(".").slice(0, 2).join(".");
const base = `https://cdn.mysql.com/Downloads/MySQL-${series}`;
const map = {
  "windows-x64": `mysql-${V}-winx64.zip`,
  "macos-arm64": `mysql-${V}-macos15-arm64.tar.gz`,
  "macos-x64": `mysql-${V}-macos15-x86_64.tar.gz`,
  "linux-x64-gnu": `mysql-${V}-linux-glibc2.28-x86_64-minimal.tar.xz`,
  "linux-arm64-gnu": `mysql-${V}-linux-glibc2.28-aarch64.tar.xz`,
};
const out = { items: [], unavailable: [] };
for (const [plat, file] of Object.entries(map)) {
  const url = `${base}/${file}`;
  const h = await head(url);
  if (!h.ok) throw new Error(`${url}: ${h.status}`);
  const md5Txt = (await getText(`${url}.md5`)).trim();
  const vendorMd5 = md5Txt.split(/\s+/)[0].toLowerCase();
  const r = await hashUrl(url);
  if (r.md5 !== vendorMd5) throw new Error(`${file}: vendor md5 ${vendorMd5} != downloaded ${r.md5}`);
  if (h.size && h.size !== r.size) throw new Error(`${file}: HEAD ${h.size} != GET ${r.size}`);
  out.items.push({
    name: "mysql", version: V, platform: plat, url, sha256: r.sha256, size: r.size,
    licence: "GPL-2.0-only WITH Universal-FOSS-exception-1.0", purpose: "database", unpackTo: `mysql/${series}`, requires: [],
    _source: `dev.mysql.com / cdn.mysql.com MySQL Community Server ${V} (an LTS release per the 9.7 release notes); sha256 computed over a full download; the vendor's ${file}.md5 (${vendorMd5}) matched the downloaded bytes; size = bytes downloaded (= HEAD Content-Length)${file.includes("minimal") ? "; Oracle's \"minimal\" Linux generic archive (no debug or test binaries) is used for x86-64 because the full archive is 987 MB, and Oracle publishes no aarch64 minimal archive (HEAD 404), so aarch64 uses the full archive" : ""}${plat === "macos-x64" ? "; the macOS x86_64 archive exists on the CDN but x86_64 is not in Oracle's supported-platforms matrix for macOS (arm64 only)" : ""}`,
  });
}
const why = "Oracle's MySQL supported-platforms page (mysql.com/support/supportedplatforms/database.html) lists Microsoft Windows on x86_64 only, and the 9.7 reference manual says MySQL is available for Windows 64-bit; the CDN has no winarm64 archive (HEAD 404)";
out.unavailable.push({ name: "mysql", platform: "windows-arm64", reason: why, fallback: "external database provider, 04 § 4.2 step 1a" });
for (const p of ["linux-x64-musl", "linux-arm64-musl"]) {
  out.unavailable.push({ name: "mysql", platform: p, reason: "Oracle publishes MySQL generic Linux binaries built against glibc 2.28 only; its supported-platforms matrix lists no Alpine or other musl distribution, and the CDN has no musl archive", fallback: "external database provider, 04 § 4.2 step 1a" });
}
mkdirSync(join(SCRATCH, "fragments"), { recursive: true });
writeFileSync(join(SCRATCH, "fragments", "05-mysql.json"), JSON.stringify(out, null, 1));
for (const i of out.items) console.log(i.name, i.version, i.platform, i.size, i.sha256.slice(0, 12));
