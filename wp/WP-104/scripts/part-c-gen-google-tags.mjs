// Usage: node wp/WP-104/scripts/part-c-gen-google-tags.mjs <supported_domains.txt> <out rules/google-tags.json>
// WP-104 part c. Builds rules/google-tags.json.
//   hosts   : Google's CSP guide for the Google tag (developers.google.com/tag-platform/security/guides/csp),
//             with `https://www.google.<TLD>` expanded from https://www.google.com/supported_domains.
//   gcd     : third-party-documented decoding of the `gcd` request parameter (Google documents that the parameter
//             exists but publishes no letter table; see wp/WP-104/spec-changes-c.md item 1).
import fs from "node:fs";

const [domainsFile, outFile] = process.argv.slice(2);
if (!domainsFile || !outFile) throw new Error("usage: part-c-gen-google-tags.mjs <supported_domains.txt> <out.json>");

const domains = fs
  .readFileSync(domainsFile, "utf8")
  .split(/\s+/)
  .filter(Boolean)
  .map((d) => d.replace(/^\./, "").toLowerCase());
if (domains.length < 150 || !domains.includes("google.com")) throw new Error("supported_domains looks wrong");

const hosts = [
  "www.googletagmanager.com",
  "*.google-analytics.com",
  "analytics.google.com",
  "*.g.doubleclick.net",
  "ad.doubleclick.net",
  "*.fls.doubleclick.net",
  "pagead2.googlesyndication.com",
  "ade.googlesyndication.com",
  "adservice.google.com",
  "www.googleadservices.com",
  ...domains.map((d) => `www.${d}`),
];
const uniqueHosts = [...new Set(hosts)];

// Letter table (consent signal state encoded by one `gcd` letter).
// Sources: docs.cookiehub.com/advanced/consent-mode-v2-signals and uniconsent.com/consent-data-validator
// (both reverse-documented; Google publishes no table).
const letters = {
  l: { default: null, update: null },
  m: { default: null, update: "denied" },
  n: { default: null, update: "granted" },
  p: { default: "denied", update: null },
  q: { default: "denied", update: "denied" },
  r: { default: "denied", update: "granted" },
  t: { default: "granted", update: null },
  u: { default: "granted", update: "denied" },
  v: { default: "granted", update: "granted" },
};
const KEYS = ["ad_storage", "analytics_storage", "ad_user_data", "ad_personalization"];
// A row covers every string whose four letters share the given per-signal DEFAULT state.
const classes = {
  denied: Object.keys(letters).filter((k) => letters[k].default === "denied"),
  granted: Object.keys(letters).filter((k) => letters[k].default === "granted"),
  none: Object.keys(letters).filter((k) => letters[k].default === null),
};
const states = ["denied", "granted", "none"];
const rows = [];
function walk(i, picked) {
  if (i === 4) {
    const pattern = "^1" + picked.map((s) => `\\d+[${classes[s].join("")}]`).join("") + "\\d+$";
    const def = {};
    const upd = {};
    picked.forEach((s, k) => {
      def[KEYS[k]] = s === "none" ? null : s;
      upd[KEYS[k]] = null;
    });
    rows.push({ pattern, default: def, update: upd });
    return;
  }
  for (const s of states) walk(i + 1, [...picked, s]);
}
walk(0, []);
// Put the all-denied-default row first (the one PRV-011 tests for).
rows.sort((a, b) => Number(Object.values(b.default).every((v) => v === "denied")) - Number(Object.values(a.default).every((v) => v === "denied")));

const out = {
  hosts: uniqueHosts,
  libraryPaths: ["/gtag/js", "/gtm.js"],
  measurementPaths: ["/g/collect", "/mp/collect", "/pagead/", "/ccm/"],
  gcd: rows,
  gcdLetters: Object.fromEntries(Object.entries(letters)),
};
fs.writeFileSync(outFile, JSON.stringify(out, null, 1) + "\n");
console.log(`hosts=${uniqueHosts.length} gcdRows=${rows.length}`);
