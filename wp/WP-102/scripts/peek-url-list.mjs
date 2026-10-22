// List archive entries of a URL (tar.gz/zip) that match a regex. Usage: node peek-url-list.mjs <url> <regex>
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { hashUrl } from "./lib.mjs";
const r = await hashUrl(process.argv[2], { keep: true });
const re = new RegExp(process.argv[3]);
const list = execFileSync("C:/Windows/System32/tar.exe", ["-tf", r.file], { encoding: "utf8", maxBuffer: 1 << 27 }).split("\n");
rmSync(r.file, { force: true });
console.log("entries", list.length);
console.log(list.filter((f) => re.test(f)).slice(0, 60).join("\n"));
