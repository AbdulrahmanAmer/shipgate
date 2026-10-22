// For candidate npm grammar packages: latest version, licence, publish date and any .wasm files inside the tarball.
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { getJson, hashUrl } from "./lib.mjs";
for (const name of process.argv.slice(2)) {
  try {
    const meta = await getJson(`https://registry.npmjs.org/${name.replace("/", "%2F")}/latest`);
    const pack = await getJson(`https://registry.npmjs.org/${name.replace("/", "%2F")}`);
    if (meta.dist.unpackedSize > 60_000_000) { console.log(name, meta.version, "too big", meta.dist.unpackedSize); continue; }
    const r = await hashUrl(meta.dist.tarball, { keep: true });
    const list = execFileSync("C:/Windows/System32/tar.exe", ["-tzf", r.file], { encoding: "utf8", maxBuffer: 1 << 27 }).split("\n");
    rmSync(r.file, { force: true });
    console.log(name, meta.version, meta.license, pack.time[meta.version]?.slice(0, 10), "size", r.size, "wasm:", list.filter((f) => f.endsWith(".wasm")).join(","));
  } catch (e) {
    console.log(name, "ERR", String(e.message).slice(0, 100));
  }
}
