// Watched-fail helper: `break` removes the jre linux-x64-musl item and corrupts one sha256 in toolchain/manifest.json
// (saving the original next to it); `restore` puts the original back. Usage: node watched-fail.mjs break|restore <repoRoot>
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";
const [mode, root] = process.argv.slice(2);
const f = join(root, "toolchain", "manifest.json");
const bak = join(root, "toolchain", "manifest.json.orig");
if (mode === "break") {
  copyFileSync(f, bak);
  const m = JSON.parse(readFileSync(f, "utf8"));
  const before = m.items.length;
  m.items = m.items.filter((i) => !(i.name === "jre" && i.platform === "linux-x64-musl"));
  m.items.find((i) => i.name === "node").sha256 = "ABC";
  if (m.items.length !== before - 1) throw new Error("patch did not apply");
  writeFileSync(f, JSON.stringify(m, null, 2));
  console.log("broken");
} else {
  copyFileSync(bak, f);
  console.log("restored");
}
