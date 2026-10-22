// Inspect the structure of a theseus-rs postgresql-binaries per-archive manifest.json (file argument).
import { readFileSync } from "node:fs";
const m = JSON.parse(readFileSync(process.argv[2], "utf8"));
console.log("build.features", JSON.stringify(m.build.features));
console.log("build.configure_flags", JSON.stringify(m.build.configure_flags));
console.log("build.runtime", JSON.stringify(m.build.runtime).slice(0, 600));
console.log("build.build_mode", JSON.stringify(m.build.build_mode));
const f = m.files;
console.log("files keys", Object.keys(f).slice(0, 8), Object.keys(f).length);
const first = Object.entries(f)[0];
console.log(JSON.stringify(first).slice(0, 300));
const paths = Array.isArray(f) ? f.map((x) => x.path) : Object.keys(f);
const ext = paths.filter((p) => /extension\/[^/]+\.control$/.test(p));
console.log("control files", ext.length, ext.map((p) => p.split("/").pop().replace(".control", "")).join(" "));
