// Download archives (kept in the scratch dir, extracted into a fresh empty directory each), then report the
// executable kind of every file over 1 MB inside. Usage: node inspect-bins.mjs <url>...
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, readdirSync, statSync, copyFileSync } from "node:fs";
import { join, basename } from "node:path";
import { hashUrl, SCRATCH } from "./lib.mjs";
import { binKind } from "./binkind.mjs";

function walk(d, out = []) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const TAR = "C:/Windows/System32/tar.exe";
import { readFileSync } from "node:fs";
const urls = process.argv.slice(2).flatMap((a) => a.startsWith("@") ? readFileSync(a.slice(1), "utf8").split(/\s+/).filter(Boolean) : [a]);
for (const url of urls) {
  const r = await hashUrl(url, { keep: true });
  const dest = join(process.env.WP102_XDIR || "C:/Users/DELL/AppData/Local/Temp/wp102x", basename(url).replace(/[^A-Za-z0-9._-]/g, "_"));
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  const name = basename(url);
  let target = dest;
  if (/\.(tar\.xz|tar\.gz|tgz|zip)$/.test(name)) {
    execFileSync(TAR, ["-xf", r.file, "-C", dest], { stdio: "inherit" });
  } else {
    copyFileSync(r.file, join(dest, name));
  }
  console.log(`== ${name}  sha256=${r.sha256} size=${r.size}`);
  for (const f of walk(target)) {
    if (statSync(f).size < 1_000_000) continue;
    console.log("  ", f.slice(dest.length + 1), JSON.stringify(binKind(f)));
  }
  rmSync(dest, { recursive: true, force: true });
  rmSync(r.file, { force: true });
}
