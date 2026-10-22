// Usage: node wp/WP-104/scripts/part-c-gen-cmps.mjs <google-cmps.json> <out rules/google-certified-cmps.json>
// <google-cmps.json> = [{ name, id, platform }] parsed from Google's "Certified CMPs" table
// (https://support.google.com/adsense/answer/13554116, fetched 2026-10-22). Web-capable CMPs only.
// minTcfPolicyVersion = tcfPolicyVersion of the live IAB Global Vendor List (https://vendor-list.consensu.org/v3/vendor-list.json,
// vendorListVersion 181, lastUpdated 2026-10-15) = 5 = TCF v2.3, mandatory for Google ad requests since 2026-03-01.
import fs from "node:fs";

const [inFile, outFile] = process.argv.slice(2);
const rows = JSON.parse(fs.readFileSync(inFile, "utf8"));
const web = rows.filter((r) => /\bweb\b/i.test(r.platform));
const ids = [...new Set(web.map((r) => r.id))].sort((a, b) => a - b);
if (ids.length < 100) throw new Error("too few CMP ids: " + ids.length);
fs.writeFileSync(outFile, JSON.stringify({ minTcfPolicyVersion: 5, cmpIds: ids }, null, 1) + "\n");
console.log(`web=${web.length} ids=${ids.length} of ${rows.length}`);
