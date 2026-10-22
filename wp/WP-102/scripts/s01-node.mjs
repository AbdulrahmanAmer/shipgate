// Node.js LTS: official SHASUMS256.txt (nodejs.org) for glibc/macOS/Windows; unofficial-builds.nodejs.org for musl.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getJson, getText, head, hashUrl, SCRATCH } from "./lib.mjs";
async function sizeByDownload(url, expected) { const r = await hashUrl(url); if (r.sha256 !== expected) throw new Error(`sha mismatch ${url}`); return r.size; }

const out = { items: [], unavailable: [] };
const idx = await getJson("https://nodejs.org/dist/index.json");
const lts = idx.find((x) => x.lts);
const v = lts.version;
console.log("LTS", v, lts.lts, lts.date);

const sums = await getText(`https://nodejs.org/dist/${v}/SHASUMS256.txt`);
const sumMap = Object.fromEntries(sums.trim().split("\n").map((l) => { const [h, f] = l.trim().split(/\s+/); return [f, h]; }));

const official = {
  "windows-x64": `node-${v}-win-x64.zip`,
  "windows-arm64": `node-${v}-win-arm64.zip`,
  "macos-arm64": `node-${v}-darwin-arm64.tar.gz`,
  "macos-x64": `node-${v}-darwin-x64.tar.gz`,
  "linux-x64-gnu": `node-${v}-linux-x64.tar.xz`,
  "linux-arm64-gnu": `node-${v}-linux-arm64.tar.xz`,
};
for (const [plat, file] of Object.entries(official)) {
  const url = `https://nodejs.org/dist/${v}/${file}`;
  const h = await head(url);
  if (!h.ok) throw new Error(`${url} ${h.status}`);
  out.items.push({
    name: "node", version: v.slice(1), platform: plat, url, sha256: sumMap[file], size: h.size, licence: "MIT",
    purpose: "tool", unpackTo: "node", requires: [],
    _source: `official release ${v} (${lts.lts} LTS, released ${lts.date}); sha256 from https://nodejs.org/dist/${v}/SHASUMS256.txt line \`${file}\`; size = HEAD Content-Length`,
  });
}
// musl: unofficial-builds.nodejs.org publishes its own SHASUMS256.txt per version.
const uidx = await getJson("https://unofficial-builds.nodejs.org/download/release/index.json");
const un = uidx.find((x) => x.version === v);
let usums = null;
if (un) {
  try { usums = await getText(`https://unofficial-builds.nodejs.org/download/release/${v}/SHASUMS256.txt`); } catch (e) { console.log("unofficial sums", e.message); }
}
const uMap = usums ? Object.fromEntries(usums.trim().split("\n").map((l) => { const [h, f] = l.trim().split(/\s+/); return [f, h]; })) : {};
for (const [plat, file] of [["linux-x64-musl", `node-${v}-linux-x64-musl.tar.xz`], ["linux-arm64-musl", `node-${v}-linux-arm64-musl.tar.xz`]]) {
  const url = `https://unofficial-builds.nodejs.org/download/release/${v}/${file}`;
  if (uMap[file]) {
    const h = await head(url);
    if (!h.ok) throw new Error(`${url} ${h.status}`);
    out.items.push({
      name: "node", version: v.slice(1), platform: plat, url, sha256: uMap[file], size: h.size || (await sizeByDownload(url, uMap[file])), licence: "MIT",
      purpose: "tool", unpackTo: "node", requires: [],
      _source: `Node.js project's unofficial-builds host (not an OpenJS-signed release; the host is run by the Node.js build team); sha256 from https://unofficial-builds.nodejs.org/download/release/${v}/SHASUMS256.txt line \`${file}\`; size = HEAD Content-Length`,
    });
  } else {
    out.unavailable.push({ name: "node", platform: plat, reason: `unofficial-builds.nodejs.org has no ${file} for ${v} (checked its index.json and SHASUMS256.txt)`, fallback: "no managed Node on this platform; Lighthouse and Playwright checks are skipped and listed (01 TR-001, 03 § 19)" });
  }
}
mkdirSync(join(SCRATCH, "fragments"), { recursive: true });
writeFileSync(join(SCRATCH, "fragments", "01-node.json"), JSON.stringify(out, null, 1));
console.log(out.items.map((i) => `${i.platform} ${i.size} ${i.sha256.slice(0, 12)}`).join("\n"));
console.log(out.unavailable);
