// Usage: node audit/rounds/09-solo/xcheck.mjs [root] — cross-file list checks for the round-09 solo pass.
// Prints candidate seams (lists that one file defines and others rely on); every hit is read by hand.
import fs from "node:fs";
import path from "node:path";
import { readRequirements, allSpecFiles } from "../../../tools/trace/lib.mjs";

const root = process.argv[2] || process.cwd();
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const reqs = readRequirements(root).filter((r) => r.kind === "rule");
const byId = new Map(reqs.map((r) => [r.id, r]));
const body = (r) => read(r.file).split(/\r?\n/).slice(r.line - 1, r.endLine).join("\n");
const alg = read("spec/04-algorithms.md");
const fmt = read("spec/03-formats.md");
const section = (t, start, endRe) => {
  const s = t.indexOf(start);
  if (s < 0) throw new Error(`section ${start}`);
  const rest = t.slice(s + start.length);
  const e = rest.search(endRe);
  return e < 0 ? rest : rest.slice(0, e);
};
const out = [];
const say = (k, msg) => out.push(`[${k}] ${msg}`);

// 1. Rules with a `content` channel outside the programmatic pack vs the 04 § 1.4 SKIPPED list.
const g5List = new Set(["CQ-002", "CQ-008", "CQ-010"]);
for (const r of reqs) {
  if (!r.channels.includes("content") || r.file.endsWith("programmatic.md")) continue;
  if (!g5List.has(r.id)) say("g5-skipped", `${r.id} (${r.file}) has a content channel but is not in 04 § 1.4 SKIPPED list`);
}
for (const id of g5List) if (!byId.get(id)?.channels.includes("content")) say("g5-skipped", `${id} listed in 04 § 1.4 but has no content channel`);

// 2. "(mutating stage" mentions vs the 04 § 4.2 step 8 order.
const step8 = section(alg, "8. **Mutating stages run one after another**", /\n9\. Teardown/);
for (const r of reqs) {
  const b = body(r);
  if (!/mutating stage/.test(b)) continue;
  if (!step8.includes(r.id)) say("mutating-stage", `${r.id} (${r.file}:${r.line}) says mutating stage but 04 § 4.2 step 8 never names it`);
}
for (const m of step8.matchAll(/\b([A-Z]{2,4}-\d{3})\b/g)) if (!byId.has(m[1])) say("mutating-stage", `04 § 4.2 step 8 names unknown ${m[1]}`);

// 3. Flow journeys used vs 03 § 10.
const journeys = new Set(["login", "logout", "signup", "checkout", "contact", "deletion", "export", "withdrawal", "cancel", "subscribe", "other"]);
for (const f of allSpecFiles(root).concat(["BUILD_MAP.md"])) {
  const t = read(f);
  for (const m of t.matchAll(/journey(?:`)?(?::)?\s*(?:"|`)([a-z-]+)(?:"|`)/g)) if (!journeys.has(m[1])) say("journey", `${f}: journey "${m[1]}" not in 03 § 10`);
  for (const m of t.matchAll(/`journey: "([a-z-]+)"`/g)) if (!journeys.has(m[1])) say("journey", `${f}: journey "${m[1]}" not in 03 § 10`);
}

// 4. Report warning codes vs 03 § 17.
const codes = new Set(["pack-disabled", "fetch-store-evicted", "unused-allowance", "trailing-slash-assumed", "host-directive-unsupported", "foreign-output", "generated-file-not-ignored", "build-modified-tracked-file"]);
for (const f of allSpecFiles(root)) {
  const t = read(f);
  for (const m of t.matchAll(/(?:\bW \(|warning[s]? \(|report warning |warnings` \(|under `warnings` \()`([a-z][a-z0-9-]+)`/g)) if (!codes.has(m[1])) say("warning-code", `${f}: warning code \`${m[1]}\` not in 03 § 17 list`);
  for (const m of t.matchAll(/`warnings`[^.]{0,40}?`([a-z][a-z0-9-]+)`/g)) if (!codes.has(m[1])) say("warning-code", `${f}: warnings code \`${m[1]}\` not in 03 § 17 list`);
}

// 5. SMTP-dependent rules vs 03 § 3.4 `smtp` list.
const smtpRow = fmt.match(/\| `smtp` .*$/m)[0];
for (const r of reqs) {
  const b = body(r);
  if (!/SMTP sink|expectEmail|openEmailLink|`email:/.test(b)) continue;
  if (!smtpRow.includes(r.id) && !r.file.endsWith("ops.md")) say("smtp", `${r.id} (${r.file}:${r.line}) reads the SMTP sink but 03 § 3.4 smtp row doesn't list it`);
}

// 6. 04 § 1.2 facts-oracle / required-facts rules: their own text should name the class.
const p12 = section(alg, "### 1.2 Per-rule outcome", /\n### 1\.3/);
const fo = p12.slice(p12.indexOf("**Facts-oracle rules"), p12.indexOf("**Required-facts rules"));
const rf = p12.slice(p12.indexOf("**Required-facts rules"));
for (const [label, txt, cls] of [["facts-oracle", fo, "forbidden-value"], ["required-facts", rf, "missing-element"]]) {
  for (const id of new Set([...txt.matchAll(/\b([A-Z]{2,4}-\d{3})\b/g)].map((m) => m[1]))) {
    const r = byId.get(id);
    if (!r) { say(label, `04 § 1.2 names unknown ${id}`); continue; }
    if (!body(r).includes(cls) && !body(r).includes("1.2")) say(label, `${id} (${r.file}:${r.line}) is a 04 § 1.2 ${label} rule but its text names neither \`${cls}\` nor 04 § 1.2`);
  }
}

// 7. Edge-channel rules vs the 04 § 2 step 5 request list.
const step5 = section(alg, "5. **Edge pass (G8):**", /\n6\. \*\*Comparison pass/);
for (const r of reqs) {
  const chans = new Set([...r.channels, ...Object.values(r.partChannels).flat()]);
  if (!chans.has("edge")) continue;
  if (!step5.includes(r.id)) say("edge", `${r.id} (${r.file}:${r.line}) has an edge channel but 04 § 2 step 5 doesn't budget its requests`);
}

// 8. Distinct skipped(...) / blocked(...) / notConfigured(...) reasons, for review.
const reasons = new Map();
for (const f of allSpecFiles(root)) for (const m of read(f).matchAll(/\b(skipped|blocked|SKIPPED|BLOCKED)\(([a-z][a-z0-9-]*)/g)) {
  const k = `${m[1].toLowerCase()}(${m[2]})`;
  reasons.set(k, (reasons.get(k) || new Set()).add(f.replace("spec/", "")));
}
say("reasons", [...reasons.keys()].sort().join(" "));

console.log(out.join("\n"));
console.error(`${out.length} lines`);
