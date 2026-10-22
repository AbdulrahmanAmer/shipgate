// Usage: node wp/WP-104/scripts/part-c-check-gcd.mjs <rules/google-tags.json> [<tests-out.json>]
// WP-104 part c. Exhaustively checks the `gcd` table: for all 9^4 = 6561 letter combinations, exactly one row matches the
// constructed gcd string, that row's `default` equals the per-letter defaults of gcdLetters, and PRV-011's "denied by default
// for all four types" holds exactly for the 81 strings whose letters are all in {p, q, r}. Optionally writes a tests file
// for the Rust regex crate (same format as the other part-c tests).
import fs from "node:fs";

const [file, testsOut] = process.argv.slice(2);
const t = JSON.parse(fs.readFileSync(file, "utf8"));
const L = Object.keys(t.gcdLetters);
const KEYS = ["ad_storage", "analytics_storage", "ad_user_data", "ad_personalization"];
const rows = t.gcd.map((r) => ({ ...r, re: new RegExp(r.pattern) }));
let bad = 0;
let allDenied = 0;
const tests = [];
for (const a of L) for (const b of L) for (const c of L) for (const d of L) {
  for (const sep of ["1", "3"]) {
    const s = `1${sep}${a}${sep}${b}${sep}${c}${sep}${d}5`;
    const hit = rows.filter((r) => r.re.test(s));
    if (hit.length !== 1) { bad++; console.error("rows matching", s, hit.length); continue; }
    const want = [a, b, c, d].map((x) => t.gcdLetters[x].default);
    const got = KEYS.map((k) => hit[0].default[k]);
    if (JSON.stringify(want) !== JSON.stringify(got)) { bad++; console.error("default mismatch", s, want, got); }
    const denied = got.every((v) => v === "denied");
    if (denied !== [a, b, c, d].every((x) => "pqr".includes(x))) { bad++; console.error("denied flag mismatch", s); }
    if (denied) allDenied++;
    if (sep === "3" && Math.random() < 0.02) tests.push({ regex: hit[0].pattern, text: s, match: true, label: "gcd/pos" });
  }
}
// non-gcd strings must match no row
for (const s of ["", "abc", "G100", "13p3p3p3p", "13x3p3p3p5", "23p3p3p3p5"]) {
  const hit = rows.filter((r) => r.re.test(s));
  if (hit.length) { bad++; console.error("unexpected match", JSON.stringify(s)); }
  tests.push({ regex: rows[0].pattern, text: s, match: false, label: "gcd/neg" });
}
if (allDenied !== 2 * 81) { bad++; console.error("all-denied count", allDenied); }
if (testsOut) fs.writeFileSync(testsOut, JSON.stringify(tests, null, 1));
if (bad) { console.error(`${bad} problem(s)`); process.exit(1); }
console.log(`gcd table ok: ${rows.length} rows, 6561 letter combinations x 2 separators, ${allDenied} all-denied strings`);
