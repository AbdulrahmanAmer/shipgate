// Normalise CRLF to LF in the given directory's files (non-recursive). Usage: node to-lf.mjs <dir>
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
for (const f of readdirSync(process.argv[2], { withFileTypes: true })) {
  if (!f.isFile()) continue;
  const p = join(process.argv[2], f.name);
  const t = readFileSync(p, "utf8");
  if (t.includes("\r")) { writeFileSync(p, t.replace(/\r\n/g, "\n")); console.log("fixed", f.name); }
}
