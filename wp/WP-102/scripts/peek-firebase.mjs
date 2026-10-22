// Inspect firebase-tools: downloadableEmulatorInfo.json (the vendor's emulator jar table with expectedSize / checksums)
// and the Java requirement text in the package.
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getJson, hashUrl } from "./lib.mjs";

const meta = await getJson("https://registry.npmjs.org/firebase-tools/latest");
const r = await hashUrl(meta.dist.tarball, { keep: true });
const dest = "C:/Users/DELL/AppData/Local/Temp/wp102x/fbt";
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
execFileSync("C:/Windows/System32/tar.exe", ["-xf", r.file, "-C", dest], { stdio: "inherit" });
const info = JSON.parse(readFileSync(join(dest, "package/lib/emulator/downloadableEmulatorInfo.json"), "utf8"));
console.log(JSON.stringify(info, null, 1));
console.log("--- java version checks");
const files = ["package/lib/emulator/commandUtils.js", "package/lib/emulator/downloadableEmulators.js", "package/lib/emulator/emulatorServer.js"];
for (const f of files) {
  const t = readFileSync(join(dest, f), "utf8");
  for (const m of t.matchAll(/.{0,120}(?:Java|java -version|MIN_JAVA|javaVersion).{0,160}/g)) console.log(f.split("/").pop(), "::", m[0].replace(/\s+/g, " "));
}
rmSync(r.file, { force: true });
