// npm-delivered tools at exact versions (registry tarballs) + the size of each one's transitive closure, which a single
// tarball URL in the manifest cannot express (reported in spec-changes.md).
import { writeFileSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { getJson, SCRATCH } from "./lib.mjs";
import { npmItem } from "./npm.mjs";

const out = { items: [], unavailable: [], closure: {} };
const pick = async (pkg) => (await getJson(`https://registry.npmjs.org/${pkg.replace("/", "%2F")}/latest`)).version;
const spec = [
  ["lighthouse", { name: "lighthouse", requires: ["node", "chromium"] }],
  ["axe-core", { name: "axe-core", requires: [] }],
  ["web-vitals", { name: "web-vitals", requires: [] }],
  ["firebase-tools", { name: "firebase-tools", requires: ["node", "jre"] }],
  ["@firebase/rules-unit-testing", { name: "firebase-rules-unit-testing", requires: ["node", "firebase"] }],
  ["firebase", { name: "firebase", requires: ["node"] }],
];
for (const [pkg, o] of spec) {
  const v = await pick(pkg);
  out.items.push(await npmItem(pkg, v, { ...o, purpose: "tool", unpackTo: `npm/${pkg}` }));
  console.log(pkg, v);
}

// Transitive closure sizes (lockfile-only resolution, no install scripts run).
const NPM = process.platform === "win32" ? "npm.cmd" : "npm";
for (const it of [...out.items, ...JSON.parse(readFileSync(join(SCRATCH, "fragments", "02-playwright-npm.json"), "utf8")).items].filter((i) => i.name !== "playwright-core")) {
  const dir = join("C:/Users/DELL/AppData/Local/Temp/wp102x", "closure-" + it.name.replace(/[^a-z0-9]/gi, "_"));
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "closure-probe", version: "0.0.0", private: true }));
  const pkg = it.url.match(/registry\.npmjs\.org\/(.+)\/-\//)[1];
  try {
    execFileSync(NPM, ["install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund", `${pkg}@${it.version}`], { cwd: dir, stdio: "pipe", shell: true });
    const lock = JSON.parse(readFileSync(join(dir, "package-lock.json"), "utf8"));
    const pk = Object.keys(lock.packages).filter((k) => k);
    out.closure[it.name] = { packages: pk.length };
    console.log("closure", it.name, pk.length);
  } catch (e) {
    out.closure[it.name] = { error: String(e.stderr ?? e.message).slice(0, 300) };
    console.log("closure failed", it.name, String(e.stderr ?? e.message).slice(0, 200));
  }
  rmSync(dir, { recursive: true, force: true });
}
mkdirSync(join(SCRATCH, "fragments"), { recursive: true });
writeFileSync(join(SCRATCH, "fragments", "06-npm.json"), JSON.stringify(out, null, 1));
