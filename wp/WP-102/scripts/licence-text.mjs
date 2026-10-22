// Print the opening of each upstream licence text (for the evidence in sourcing.md).
import { getText } from "./lib.mjs";
const src = {
  node: "https://raw.githubusercontent.com/nodejs/node/main/LICENSE",
  mysql: "https://raw.githubusercontent.com/mysql/mysql-server/trunk/LICENSE",
  mysqlFoss: "https://raw.githubusercontent.com/mysql/mysql-server/trunk/LICENSE",
  firefox: "https://raw.githubusercontent.com/mozilla-firefox/firefox/main/LICENSE",
  temurin: "https://raw.githubusercontent.com/adoptium/temurin21-binaries/main/README.md",
  webkit: "https://webkit.org/licensing-webkit/",
  postgres: "https://raw.githubusercontent.com/postgres/postgres/master/COPYRIGHT",
  tsw: "https://unpkg.com/tree-sitter-wasms@0.1.13/README.md",
  geonames: "https://www.geonames.org/export/",
};
for (const [k, u] of Object.entries(src)) {
  try {
    let t = await getText(u);
    t = t.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
    const n = Number(process.env.N ?? 420);
    let i = 0;
    if (k === "webkit") i = Math.max(0, t.search(/LGPL|BSD/i) - 100);
    if (k === "geonames") i = Math.max(0, t.search(/Creative Commons/i) - 200);
    if (k === "temurin") i = Math.max(0, t.search(/licen/i) - 100);
    if (k === "tsw") i = Math.max(0, t.search(/licen/i) - 100);
    console.log(`== ${k} (${u})\n${t.slice(i, i + n)}\n`);
  } catch (e) {
    console.log("==", k, "ERR", e.message);
  }
}
