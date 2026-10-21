// Usage: node dep08.mjs <BUILD_MAP.md> <names...> — WP-703 += WP-705, WP-605 += WP-607; source round-8 ruleset names
import fs from "node:fs";
const [, , f, ...names] = process.argv;
let t = fs.readFileSync(f, "utf8");
const addDeps = (wp, extra) => {
  const re = new RegExp(`^(\\| ${wp}(?: \\(L\\))? \\| .* \\| )([^|]*?)( \\|)$`, "m");
  if (!re.test(t)) throw new Error(wp);
  t = t.replace(re, (_, a, d, c) => a + [...d.split(",").map((s) => s.trim()), ...extra].filter((x, i, arr) => arr.indexOf(x) === i).join(", ") + c);
};
addDeps("WP-703", ["WP-705"]);
addDeps("WP-605", ["WP-607"]);
const anchor = "- **Public Suffix List snapshot**";
if (!t.includes(anchor)) throw new Error("anchor");
t = t.split(anchor).join(`- **Round-8 named files**: ${names.map((n) => "`" + n + "`").join(", ")}.\n${anchor}`);
fs.writeFileSync(f, t);
console.log("ok", names.length);
