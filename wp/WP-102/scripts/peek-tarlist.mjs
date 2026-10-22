// List the files inside an npm tarball (name@version as argument).
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { getJson, hashUrl } from "./lib.mjs";
const [spec] = process.argv.slice(2);
const [name, ver] = spec.split("@").length === 3 ? ["@" + spec.split("@")[1], spec.split("@")[2]] : spec.split("@");
const meta = await getJson(`https://registry.npmjs.org/${name.replace("/", "%2F")}/${ver || "latest"}`);
console.log(meta.name, meta.version, meta.license, meta.dist.tarball, meta.dist.unpackedSize);
const r = await hashUrl(meta.dist.tarball, { keep: true });
console.log("size", r.size, "sha256", r.sha256);
console.log(execFileSync("C:/Windows/System32/tar.exe", ["-tzf", r.file], { encoding: "utf8", maxBuffer: 1 << 26 }).split("\n").slice(0, Number(process.env.N ?? 200)).join("\n"));
rmSync(r.file, { force: true });
