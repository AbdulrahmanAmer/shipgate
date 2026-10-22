// Playwright npm packages + the browser builds Playwright 1.64.1 pins (browsers.json + DOWNLOAD_PATHS in
// playwright-core/lib/coreBundle.js, read from the published tarball). Playwright publishes no checksums for
// its CDN builds, so every browser archive is streamed through SHA-256 here.
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getJson, hashUrl, head, SCRATCH } from "./lib.mjs";
import { npmItem } from "./npm.mjs";

const PWV = process.argv[2] ?? "1.64.1";
const ONLY = process.argv[3] ?? "all"; // all | npm | chromium | firefox | webkit
const browsers = JSON.parse(readFileSync(join(SCRATCH, "pw", "package", "browsers.json"), "utf8")).browsers;
const rev = (n) => browsers.find((b) => b.name === n);
const base = "https://cdn.playwright.dev/dbazure/download/playwright";
const cft = rev("chromium").browserVersion;

const files = {
  chromium: {
    "windows-x64": `CFT/${cft}/win64/chrome-win64.zip`,
    "windows-arm64": `CFT/${cft}/win64/chrome-win64.zip`,
    "macos-arm64": `CFT/${cft}/mac-arm64/chrome-mac-arm64.zip`,
    "macos-x64": `CFT/${cft}/mac-x64/chrome-mac-x64.zip`,
    "linux-x64-gnu": `CFT/${cft}/linux64/chrome-linux64.zip`,
    "linux-arm64-gnu": `CFT/${cft}/linux-arm64/chrome-linux-arm64.zip`,
  },
  firefox: {
    "windows-x64": `builds/firefox/${rev("firefox").revision}/firefox-win64.zip`,
    "windows-arm64": `builds/firefox/${rev("firefox").revision}/firefox-win64.zip`,
    "macos-arm64": `builds/firefox/${rev("firefox").revision}/firefox-mac-arm64.zip`,
    "macos-x64": `builds/firefox/${rev("firefox").revision}/firefox-mac.zip`,
    "linux-x64-gnu": `builds/firefox/${rev("firefox").revision}/firefox-ubuntu-24.04.zip`,
    "linux-arm64-gnu": `builds/firefox/${rev("firefox").revision}/firefox-ubuntu-24.04-arm64.zip`,
  },
  webkit: {
    "windows-x64": `builds/webkit/${rev("webkit").revision}/webkit-win64.zip`,
    "windows-arm64": `builds/webkit/${rev("webkit").revision}/webkit-win64.zip`,
    "macos-arm64": `builds/webkit/${rev("webkit").revision}/webkit-mac-15-arm64.zip`,
    "macos-x64": `builds/webkit/${rev("webkit").revision}/webkit-mac-15.zip`,
    "linux-x64-gnu": `builds/webkit/${rev("webkit").revision}/webkit-ubuntu-24.04.zip`,
    "linux-arm64-gnu": `builds/webkit/${rev("webkit").revision}/webkit-ubuntu-24.04-arm64.zip`,
  },
};
const licence = { chromium: "BSD-3-Clause", firefox: "MPL-2.0", webkit: "BSD-2-Clause AND LGPL-2.0-or-later" };
const out = { items: [], unavailable: [] };

if (ONLY === "all" || ONLY === "npm") out.items.push(await npmItem("playwright-core", PWV, { name: "playwright-core", purpose: "tool", unpackTo: "npm/playwright-core", requires: ["node"] }));
if (ONLY === "all" || ONLY === "npm") out.items.push(await npmItem("playwright", PWV, { name: "playwright", purpose: "tool", unpackTo: "npm/playwright", requires: ["node", "playwright-core"] }));

for (const [name, plats] of Object.entries(files)) {
  if (ONLY !== "all" && ONLY !== name) continue;
  const b = rev(name);
  for (const [plat, path] of Object.entries(plats)) {
    const url = path.startsWith("CFT/") ? `https://storage.googleapis.com/chrome-for-testing-public/${path.slice(4)}` : `${base}/${path}`;
    const h = await head(url);
    if (!h.ok) throw new Error(`${url} -> ${h.status}`);
    const r = await hashUrl(url);
    if (h.size && h.size !== r.size) throw new Error(`size mismatch ${url}: HEAD ${h.size} GET ${r.size}`);
    let etagNote = "";
    if (url.includes("storage.googleapis.com")) {
      const etag = (h.headers.etag ?? "").replaceAll('"', "");
      if (etag && etag !== r.md5) throw new Error(`GCS ETag md5 ${etag} != downloaded md5 ${r.md5} for ${url}`);
      etagNote = `; the Google Cloud Storage ETag (md5 ${etag}) matched the downloaded bytes`;
    }
    out.items.push({
      name, version: b.browserVersion, platform: plat, url, sha256: r.sha256, size: r.size, licence: licence[name],
      purpose: "browser", unpackTo: `browsers/${name}`, requires: ["playwright"],
      _source: `Playwright ${PWV} pin: browsers.json revision ${b.revision}${name === "chromium" ? ` (Chrome for Testing ${cft}, official Google bucket chrome-for-testing-public, which is where Playwright redirects its cft paths)` : ""}; path from DOWNLOAD_PATHS for host platform ${plat === "windows-arm64" ? "win64 (calculatePlatform() returns win64 for every win32 host, so Windows on ARM runs the x64 build under emulation; UNPROVEN on ARM hardware)" : plat}; sha256 and size from a streamed download of the CDN file (Playwright publishes no checksum), size cross-checked against HEAD Content-Length${etagNote}`,
    });
  }
  for (const plat of ["linux-x64-musl", "linux-arm64-musl"]) {
    out.unavailable.push({
      name, platform: plat,
      reason: `Playwright ${PWV} builds ${name} for glibc Ubuntu/Debian, macOS and Windows only; its host-platform table (coreBundle.js calculatePlatform) has no musl/Alpine entry and falls back to the glibc ubuntu24.04 build, which does not run on musl`,
      fallback: "managed builds exist only where 03 § 19 lists them (01 TR-001); rules that need this browser are skipped(no-browser) and listed (packs/testing.md TST-008, packs/search-engines.md and packs/answer-engines.md missing-input outcomes); no general chromium-absent rule exists, see wp/WP-102/spec-changes.md § 2",
    });
  }
}
mkdirSync(join(SCRATCH, "fragments"), { recursive: true });
writeFileSync(join(SCRATCH, "fragments", `02-playwright-${ONLY}.json`), JSON.stringify(out, null, 1));
console.log(out.items.map((i) => `${i.name} ${i.platform} ${i.size}`).join("\n"));
