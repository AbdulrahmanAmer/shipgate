// Merge the fragment files into toolchain/manifest.json, toolchain/unavailable.json and the generated per-item part
// of wp/WP-102/sourcing.md (the hand-written parts are in sourcing-head.md / sourcing-tail.md next to this script's
// output directory). Usage: node s09-assemble.mjs <repoRoot>
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { SCRATCH } from "./lib.mjs";

const root = process.argv[2];
const frag = (f) => JSON.parse(readFileSync(join(SCRATCH, "fragments", f), "utf8"));
const files = ["01-node.json", "02-playwright-npm.json", "02-playwright-chromium.json", "02-playwright-firefox.json", "02-playwright-webkit.json", "03-postgresql.json", "04-tools.json", "05-mysql.json", "06-npm.json", "07-data.json"];
const hl = frag("07-data.json").notes.hunspellLicences;
const hunspellLicence = "MIT AND " + [...new Set(Object.values(hl).map((x) => (x.startsWith("(") ? x : `(${x})`)))].sort().join(" AND ");
const LICENCE_PATCH = { "hunspell-dictionaries": hunspellLicence, "tree-sitter-wasms": "Unlicense AND LicenseRef-bundled-grammars-unaudited", "hunspell-ar-aff": "GPL-2.0-or-later OR LGPL-2.1-or-later OR MPL-1.1", "hunspell-ar-dic": "GPL-2.0-or-later OR LGPL-2.1-or-later OR MPL-1.1" };
const EXTRA_SOURCE = {
  mysql: (it) => (it.platform === "linux-x64-gnu" ? "; archive listing read: the minimal archive holds bin/mysqld, mysql, mysqldump, mysqladmin, mysqlbinlog, mysql_tzinfo_to_sql, share/ and lib/plugin/, i.e. a complete server" : ""),
};

let items = [];
let unavailable = [];
for (const f of files) {
  const j = frag(f);
  items.push(...j.items);
  unavailable.push(...(j.unavailable ?? []));
}
const ORDER = ["name", "version", "platform", "url", "sha256", "size", "licence", "purpose", "refresh", "unpackTo", "requires", "extensions"];
const clean = (it) => {
  const o = {};
  for (const k of ORDER) if (it[k] !== undefined) o[k] = it[k];
  if (LICENCE_PATCH[it.name]) o.licence = LICENCE_PATCH[it.name];
  return o;
};
const PLAT = ["windows-x64", "windows-arm64", "macos-arm64", "macos-x64", "linux-x64-gnu", "linux-arm64-gnu", "linux-x64-musl", "linux-arm64-musl", "any"];
const cmp = (a, b) => a.name.localeCompare(b.name) || b.version.localeCompare(a.version, undefined, { numeric: true }) || PLAT.indexOf(a.platform) - PLAT.indexOf(b.platform);
items.sort(cmp);
const seen = new Set();
for (const it of items) {
  const k = `${it.name}|${it.platform}|${it.version}`;
  if (seen.has(k)) throw new Error(`duplicate item ${k}`);
  seen.add(k);
}
// every `requires` must name an item
const names = new Set(items.map((i) => i.name));
for (const it of items) for (const r of it.requires) if (!names.has(r)) throw new Error(`${it.name} requires unknown ${r}`);

const manifest = { formatVersion: 1, items: items.map(clean) };
mkdirSync(join(root, "toolchain"), { recursive: true });
writeFileSync(join(root, "toolchain", "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

for (const u of unavailable) {
  if (u.name === "postgresql") {
    u.version = "15";
    u.reason += "; the vendor's 15.19.1 release notes say 'Add native Windows ARM64 packages for PostgreSQL 16–18' (PostgreSQL 16, 17 and 18 do have windows-arm64 items in the manifest)";
  }
}
const ukey =(u) => `${u.name}|${u.platform}|${u.locale ?? ""}|${u.version ?? ""}`;
const um = new Map();
for (const u of unavailable) um.set(ukey(u), u);
unavailable = [...um.values()].sort((a, b) => a.name.localeCompare(b.name) || PLAT.indexOf(a.platform) - PLAT.indexOf(b.platform));
for (const u of unavailable) if (!u.reason || u.reason.length < 10 || !u.fallback?.includes("§")) throw new Error(`bad unavailable entry ${ukey(u)}`);
writeFileSync(join(root, "toolchain", "unavailable.json"), JSON.stringify({ items: unavailable }, null, 2) + "\n");

// ---- generated provenance section --------------------------------------------------------------------------------------
const mb = (n) => (n / 1048576).toFixed(1) + " MB";
let md = "";
const groups = new Map();
for (const it of items) {
  const k = `${it.name}@${it.version}`;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(it);
}
for (const [k, g] of groups) {
  md += `### ${k}\n\n`;
  const byText = new Map();
  for (const it of g) {
    const t = (it._source ?? "") + (EXTRA_SOURCE[it.name]?.(it) ?? "");
    if (!byText.has(t)) byText.set(t, []);
    byText.get(t).push(it.platform);
  }
  for (const [t, plats] of byText) md += `- **${plats.join(", ")}** — ${t}\n`;
  md += `\nLicence field: \`${clean(g[0]).licence}\`.\n\n| platform | size | sha256 | url |\n|---|---|---|---|\n`;
  for (const it of g) md += `| ${it.platform} | ${it.size} (${mb(it.size)}) | \`${it.sha256}\` | ${it.url} |\n`;
  md += "\n";
}
writeFileSync(join(SCRATCH, "sourcing-generated.md"), md);
const total = items.reduce((s, i) => s + i.size, 0);
console.log(`items ${items.length}, unavailable ${unavailable.length}, distinct names ${names.size}, groups ${groups.size}, sum of sizes ${(total / 1e9).toFixed(2)} GB`);
console.log("extensions sample", JSON.stringify(items.find((i) => i.name === "postgresql")?.extensions?.slice(0, 5)));
