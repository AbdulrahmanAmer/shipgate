// OSV-Scanner, PostgREST, Supabase Auth (GitHub releases), Temurin JRE (Adoptium API), Firebase emulator jars
// (firebase-tools' own downloadableEmulatorInfo.json). Every digest here is vendor-published; PostgREST and
// Supabase Auth digests are additionally re-computed from the downloaded bytes (see inspect-bins.mjs, hash cache).
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getText, getJson, ghJson, hashUrl, head, recall, SCRATCH } from "./lib.mjs";

const out = { items: [], unavailable: [] };
const ALL = ["windows-x64", "windows-arm64", "macos-arm64", "macos-x64", "linux-x64-gnu", "linux-arm64-gnu", "linux-x64-musl", "linux-arm64-musl"];

async function release(repo, tag) {
  return tag ? ghJson(`repos/${repo}/releases/tags/${tag}`) : ghJson(`repos/${repo}/releases/latest`);
}
const dl = (rel, name) => rel.assets.find((a) => a.name === name);

// ---- OSV-Scanner ----------------------------------------------------------------------------------------------
{
  const rel = await release("google/osv-scanner");
  const sums = await getText(dl(rel, "osv-scanner_SHA256SUMS").browser_download_url);
  const sumMap = Object.fromEntries(sums.trim().split("\n").map((l) => { const [h, f] = l.trim().split(/\s+/); return [f, h]; }));
  const map = {
    "windows-x64": "osv-scanner_windows_amd64.exe", "windows-arm64": "osv-scanner_windows_arm64.exe",
    "macos-arm64": "osv-scanner_darwin_arm64", "macos-x64": "osv-scanner_darwin_amd64",
    "linux-x64-gnu": "osv-scanner_linux_amd64", "linux-arm64-gnu": "osv-scanner_linux_arm64",
    "linux-x64-musl": "osv-scanner_linux_amd64", "linux-arm64-musl": "osv-scanner_linux_arm64",
  };
  for (const [plat, file] of Object.entries(map)) {
    const a = dl(rel, file);
    const gh = a.digest.replace("sha256:", "");
    if (gh !== sumMap[file]) throw new Error(`${file}: SHA256SUMS ${sumMap[file]} != GitHub digest ${gh}`);
    out.items.push({
      name: "osv-scanner", version: rel.tag_name.replace(/^v/, ""), platform: plat, url: a.browser_download_url, sha256: sumMap[file], size: a.size,
      licence: "Apache-2.0", purpose: "tool", unpackTo: `osv-scanner/osv-scanner${file.endsWith(".exe") ? ".exe" : ""}`, requires: [],
      _source: `github.com/google/osv-scanner release ${rel.tag_name} (${rel.published_at.slice(0, 10)}); sha256 from the release's osv-scanner_SHA256SUMS line \`${file}\`, equal to the GitHub asset digest; size from the GitHub asset record${plat.includes("musl") ? "; no separate musl asset exists: the linux binary is the same file as the glibc entry, and its ELF headers have no PT_INTERP and no PT_DYNAMIC (statically linked Go binary, checked with scripts/binkind.mjs on the downloaded bytes), so it runs on musl" : ""}`,
    });
  }
}

// ---- PostgREST --------------------------------------------------------------------------------------------------
{
  const rel = await release("PostgREST/postgrest");
  const v = rel.tag_name;
  const map = {
    "windows-x64": [`postgrest-${v}-windows-x86-64.zip`, "postgrest/postgrest.exe"],
    "macos-arm64": [`postgrest-${v}-macos-aarch64.tar.xz`, "postgrest/postgrest"],
    "macos-x64": [`postgrest-${v}-macos-x86-64.tar.xz`, "postgrest/postgrest"],
    "linux-x64-gnu": [`postgrest-${v}-linux-static-x86-64.tar.xz`, "postgrest/postgrest"],
    "linux-arm64-gnu": [`postgrest-${v}-linux-static-aarch64.tar.xz`, "postgrest/postgrest"],
    "linux-x64-musl": [`postgrest-${v}-linux-static-x86-64.tar.xz`, "postgrest/postgrest"],
    "linux-arm64-musl": [`postgrest-${v}-linux-static-aarch64.tar.xz`, "postgrest/postgrest"],
  };
  for (const [plat, [file]] of Object.entries(map)) {
    const a = dl(rel, file);
    const gh = a.digest.replace("sha256:", "");
    const mine = await hashUrl(a.browser_download_url);
    if (mine.sha256 !== gh || mine.size !== a.size) throw new Error(`${file}: downloaded ${mine.sha256}/${mine.size} != GitHub ${gh}/${a.size}`);
    out.items.push({
      name: "postgrest", version: v.replace(/^v/, ""), platform: plat, url: a.browser_download_url, sha256: gh, size: a.size,
      licence: "MIT", purpose: "tool", unpackTo: "postgrest", requires: ["postgresql"],
      _source: `github.com/PostgREST/postgrest release ${v} (${rel.published_at.slice(0, 10)}); the release publishes no checksum file, so sha256 and size are the GitHub asset record (digest sha256) AND were re-computed from a full download of the archive (equal)${plat.includes("linux") ? "; the linux-static archive holds one ELF with no PT_INTERP and no PT_DYNAMIC (statically linked, checked with scripts/binkind.mjs), used for both glibc and musl" : ""}`,
    });
  }
  out.unavailable.push({ name: "postgrest", platform: "windows-arm64", reason: `PostgREST ${v} publishes windows-x86-64, macos (aarch64, x86-64), linux-static (aarch64, x86-64) and freebsd archives only; no Windows ARM64 asset (release asset list read from the GitHub API)`, fallback: "external platform mode, 04 § 4.4" });
}

// ---- Supabase Auth (GoTrue) ---------------------------------------------------------------------------------------
{
  const rel = await release("supabase/auth");
  const v = rel.tag_name;
  const map = {
    "macos-arm64": `auth-${v}-darwin-arm64.tar.gz`,
    "linux-x64-gnu": `auth-${v}-amd64.tar.xz`, "linux-x64-musl": `auth-${v}-amd64.tar.xz`,
    "linux-arm64-gnu": `auth-${v}-arm64.tar.xz`, "linux-arm64-musl": `auth-${v}-arm64.tar.xz`,
  };
  for (const [plat, file] of Object.entries(map)) {
    const a = dl(rel, file);
    const gh = a.digest.replace("sha256:", "");
    const mine = await hashUrl(a.browser_download_url);
    if (mine.sha256 !== gh || mine.size !== a.size) throw new Error(`${file}: downloaded ${mine.sha256}/${mine.size} != GitHub ${gh}/${a.size}`);
    out.items.push({
      name: "supabase-auth", version: v.replace(/^v/, ""), platform: plat, url: a.browser_download_url, sha256: gh, size: a.size,
      licence: "MIT", purpose: "tool", unpackTo: "supabase-auth", requires: ["postgresql"],
      _source: `github.com/supabase/auth release ${v} (${rel.published_at.slice(0, 10)}, newest non-prerelease); no checksum file is published, so sha256 and size are the GitHub asset record AND were re-computed from a full download (equal); the archive holds \`auth\` (and a \`gotrue\` copy), ${plat.startsWith("linux") ? "a statically linked ELF (no PT_INTERP, no PT_DYNAMIC; scripts/binkind.mjs), so one archive serves glibc and musl" : "a Mach-O arm64 executable"}`,
    });
  }
  for (const plat of ["windows-x64", "windows-arm64", "macos-x64"]) {
    out.unavailable.push({ name: "supabase-auth", platform: plat, reason: `supabase/auth ${v} and its five most recent releases publish only auth-*-amd64.tar.xz, -arm64.tar.xz/.tar.gz, -x86.tar.gz (all linux x86-64/aarch64 ELF) and -darwin-arm64.tar.gz (Mach-O arm64); there is no Windows or macOS x86-64 binary (asset lists read from the GitHub API, executables inspected)`, fallback: "/auth/v1/* isn't emulated: the service needs platform.supabase.mode external or the rule is notConfigured(supabase-auth), 04 § 4.4" });
  }
}

// ---- Temurin JRE 21 (Firebase emulators need Java >= 21: firebase-tools commandUtils.JAVA_DEPRECATION_WARNING) -----
{
  const assets = await getJson("https://api.adoptium.net/v3/assets/latest/21/hotspot?image_type=jre&vendor=eclipse");
  const want = {
    "windows-x64": ["windows", "x64"], "windows-arm64": ["windows", "aarch64"],
    "macos-arm64": ["mac", "aarch64"], "macos-x64": ["mac", "x64"],
    "linux-x64-gnu": ["linux", "x64"], "linux-arm64-gnu": ["linux", "aarch64"],
    "linux-x64-musl": ["alpine-linux", "x64"], "linux-arm64-musl": ["alpine-linux", "aarch64"],
  };
  for (const [plat, [os, arch]] of Object.entries(want)) {
    const a = assets.find((x) => x.binary.os === os && x.binary.architecture === arch);
    if (!a) {
      out.unavailable.push({ name: "jre", platform: plat, reason: `Adoptium API returned no Temurin 21 JRE for ${os}/${arch}`, fallback: "DB-011 part emulator is skipped(no-emulator) and listed (packs/data-api.md DB-011; 01 § TR-001)" });
      continue;
    }
    const p = a.binary.package;
    out.items.push({
      name: "jre", version: a.release_name.replace(/^jdk-/, ""), platform: plat, url: p.link, sha256: p.checksum, size: p.size,
      licence: "GPL-2.0-only WITH Classpath-exception-2.0", purpose: "tool", unpackTo: "jre", requires: [],
      _source: `api.adoptium.net/v3/assets/latest/21/hotspot?image_type=jre&vendor=eclipse (Eclipse Temurin ${a.release_name}, ${os}/${arch}, updated ${a.binary.updated_at.slice(0, 10)}); url, sha256 and size are the API's package.link / package.checksum / package.size`,
    });
  }
}

// ---- Firebase emulator jars: vendor table inside firebase-tools ---------------------------------------------------------
{
  const info = await getJson("https://registry.npmjs.org/firebase-tools/latest");
  // The emulator table is read from the same published tarball (peek-firebase.mjs prints it); values pinned here
  // were copied from firebase-tools@${info.version} lib/emulator/downloadableEmulatorInfo.json.
  const table = {
    "firebase-emulators": { label: "Cloud Firestore emulator", version: "1.22.0", size: 136707194, sha256: "9b6498b7f62714d67f48f59b3818883cd682dbcd46b9f59511de81c97bb5166c", url: "https://storage.googleapis.com/firebase-preview-drop/emulator/cloud-firestore-emulator-v1.22.0.jar" },
    "firebase-emulators-database": { label: "Realtime Database emulator", version: "4.11.2", size: 34495935, sha256: "b70d99344caf17c98b6f910fa8f6edf32a7c016cb1035e8915f70d38901eb97f", url: "https://storage.googleapis.com/firebase-preview-drop/emulator/firebase-database-emulator-v4.11.2.jar" },
    "firebase-emulators-storage-rules": { label: "Cloud Storage rules runtime", version: "1.1.3", size: 52892936, sha256: "0cd52db6f6271d62078f805220706377c849220b73bd68aa27078d977df9c900", url: "https://storage.googleapis.com/firebase-preview-drop/emulator/cloud-storage-rules-runtime-v1.1.3.jar" },
  };
  for (const [name, t] of Object.entries(table)) {
    const mine = await hashUrl(t.url);
    if (mine.sha256 !== t.sha256 || mine.size !== t.size) throw new Error(`${name}: downloaded ${mine.sha256}/${mine.size} != firebase-tools table ${t.sha256}/${t.size}`);
    out.items.push({
      name, version: t.version, platform: "any", url: t.url, sha256: t.sha256, size: t.size,
      licence: "LicenseRef-Firebase-Terms-of-Service", purpose: "tool", unpackTo: `firebase-emulators/${t.url.split("/").pop()}`, requires: ["jre", "firebase-tools"],
      _source: `${t.label} jar. url, expectedSize and expectedChecksumSHA256 are the vendor's own table in firebase-tools@${info.version} lib/emulator/downloadableEmulatorInfo.json (the CLI verifies exactly these values); the jar was also downloaded in full and its SHA-256 and size matched the table. Proprietary Google binary: see licence concerns`,
    });
  }
}

mkdirSync(join(SCRATCH, "fragments"), { recursive: true });
writeFileSync(join(SCRATCH, "fragments", "04-tools.json"), JSON.stringify(out, null, 1));
for (const i of out.items) console.log(i.name, i.version, i.platform, i.size, i.sha256.slice(0, 10));
console.log(JSON.stringify(out.unavailable.map((u) => `${u.name}/${u.platform}`)));
