// List the executables and key dirs in the MySQL minimal Linux archive (argument: URL) to confirm it is a usable server.
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { hashUrl } from "./lib.mjs";
const r = await hashUrl(process.argv[2], { keep: true });
const list = execFileSync("C:/Windows/System32/tar.exe", ["-tf", r.file], { encoding: "utf8", maxBuffer: 1 << 27 }).split("\n");
rmSync(r.file, { force: true });
console.log("entries", list.length);
console.log(list.filter((f) => /\/bin\/[^/]+$/.test(f)).join("\n"));
console.log("share/ entries", list.filter((f) => /\/share\//.test(f)).length, "plugin entries", list.filter((f) => /\/lib\/plugin\//.test(f)).length);
