// Shared parsing for the shipgate requirement trace. Pure functions over the spec text; no I/O
// beyond reading files under the repo root passed in.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const SPEC_FILES = [
  "spec/01-core.md",
  "spec/02-adapters.md",
  "spec/03-formats.md",
  "spec/04-algorithms.md",
  "spec/05-integrations.md",
  "spec/06-growth.md",
];

export function packFiles(root) {
  return fs
    .readdirSync(path.join(root, "spec/packs"))
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => `spec/packs/${f}`);
}

export function allSpecFiles(root) {
  return [...SPEC_FILES, ...packFiles(root)];
}

export const ID = "[A-Z][A-Z0-9]{1,5}-[0-9]{3}";
const DEF_RE = new RegExp(`^- \\*\\*(${ID})\\*\\*(.*)$`);
const SEV_RE = /^\s*·\s*([PW][0-9]?†?(?:\s*\([^)]*\))?)\s*·\s*([^—]+?)\s*—\s*/;

const sha = (s) => crypto.createHash("sha256").update(s).digest("hex").slice(0, 12);

// A rule's own part names: `part \`x\`` / `parts \`a\`, \`b\`` mentions not attached to another rule ID.
export function extractParts(id, body) {
  const parts = new Set();
  const re = /\b[Pp]arts?\s+((?:`[a-z0-9][a-z0-9-]*`(?:\s*(?:,|and|or|\/)\s*)?)+)/g;
  let m;
  while ((m = re.exec(body))) {
    const before = body.slice(Math.max(0, m.index - 14), m.index);
    const other = before.match(new RegExp(`(${ID})\\s*$`));
    if (other && other[1] !== id) continue;
    for (const p of m[1].matchAll(/`([a-z0-9][a-z0-9-]*)`/g)) parts.add(p[1]);
  }
  // Sub-bullet part lists: "  - `lorem` — …", "  - `dead-anchor` (P1, browser) — …"
  for (const s of body.matchAll(/^\s+- `([a-z0-9][a-z0-9-]*)`(?:\s*\([^)]*\))?\s*(?:—|:)/gm)) parts.add(s[1]);
  return [...parts].sort();
}

const CHANNELS = ["cfg", "lock", "ast", "graph", "diff", "deps", "cmd", "data", "db", "contract", "build", "http", "html", "site", "content", "browser", "baseline", "edge", "review", "hook"];
// Channels a part declares in its parenthetical tag: "Part `x` (P1 · html; …)", "- `x` (P1, browser) —".
export function partChannels(body) {
  const out = {};
  const re = /(?:[Pp]art\s+|^\s+- )`([a-z0-9][a-z0-9-]*)`\s*\(([^)]*)\)/gm;
  for (const m of body.matchAll(re)) {
    const chans = m[2].split(/[\s,;·]+/).filter((t) => CHANNELS.includes(t));
    if (chans.length) out[m[1]] = [...new Set([...(out[m[1]] || []), ...chans])];
  }
  return out;
}

// 04 § 9.1 failure-class vocabulary (the backticked names in that section).
export function readFailureClasses(root) {
  const t = fs.readFileSync(path.join(root, "spec/04-algorithms.md"), "utf8");
  const s = t.indexOf("### 9.1");
  if (s < 0) return [];
  const sec = t.slice(s, t.indexOf("\n### ", s + 5));
  return [...new Set([...sec.matchAll(/`([a-z][a-z0-9-]+)`/g)].map((m) => m[1]))];
}

export function readRequirements(root) {
  const reqs = [];
  const FC = new Set(readFailureClasses(root));
  for (const file of allSpecFiles(root)) {
    const lines = fs.readFileSync(path.join(root, file), "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      const m = line.match(DEF_RE);
      if (!m) return;
      const id = m[1];
      // A rule continues on indented lines (sub-bullets) and blank lines between them, up to the
      // next unindented line.
      let end = i + 1;
      while (end < lines.length && (/^\s+\S/.test(lines[end]) || (lines[end] === "" && /^\s+\S/.test(lines[end + 1] ?? "")))) end++;
      const rest = [m[2], ...lines.slice(i + 1, end)].join("\n");
      const sev = rest.match(SEV_RE);
      const body = sev ? rest.slice(sev[0].length) : rest.replace(/^\s*/, "");
      reqs.push({
        id,
        family: id.split("-")[0],
        kind: id.startsWith("TR-") ? "tool-requirement" : "rule",
        file,
        line: i + 1,
        endLine: end,
        severity: sev ? sev[1].trim() : null,
        channels: sev ? sev[2].split(",").map((s) => s.trim()) : [],
        parts: extractParts(id, body),
        partChannels: partChannels(body),
        failureClasses: [...new Set([...body.matchAll(/`([a-z][a-z0-9-]+)`/g)].map((x) => x[1]).filter((x) => FC.has(x)))].sort(),
        textHash: sha(rest),
        title: body.split(/(?<=[.:])\s/)[0].slice(0, 140),
      });
    });
  }
  return reqs;
}

// Numbered headings of spec/01..05 ("## 4. Verdict", "### 4.2 Start order") → "04 § 4.2".
export function readSections(root) {
  const out = [];
  for (const file of SPEC_FILES) {
    const num = path.basename(file).slice(0, 2);
    const lines = fs.readFileSync(path.join(root, file), "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      const m = line.match(/^(#{2,4})\s+([0-9]+(?:\.[0-9]+)*)\.?\s+(.*)$/);
      if (m) out.push({ ref: `${num} § ${m[2]}`, file, line: i + 1, title: m[3].trim() });
    });
  }
  return out;
}

// Expand "UX-013..021", "SEC-070..073", "A11-001..A11-017" into concrete IDs.
export function expandRange(text) {
  const slash = text.match(/^([A-Z][A-Z0-9]{1,5})-([0-9]{3})((?:\/[0-9]{3})+)$/);
  if (slash) return [`${slash[1]}-${slash[2]}`, ...slash[3].split("/").filter(Boolean).map((n) => `${slash[1]}-${n}`)];
  const m = text.match(new RegExp(`^(${ID})\\.\\.(?:([A-Z][A-Z0-9]{1,5})-)?([0-9]{3})$`));
  if (!m) return [text];
  const [fam, start] = m[1].split("-");
  const end = Number(m[3]);
  const ids = [];
  for (let n = Number(start); n <= end; n++) ids.push(`${fam}-${String(n).padStart(3, "0")}`);
  return ids;
}

// An ID reference: "UX-001", a range "UX-013..021", or a slash list "SEC-051/052/053".
export const ID_REF_RE = () => new RegExp(`\\b${ID}(?:\\.\\.(?:[A-Z][A-Z0-9]{1,5}-)?[0-9]{3}|(?:\\/[0-9]{3}(?![0-9]))+)?(?![0-9])`, "g");

// Every rule ID mentioned anywhere (ranges expanded), with location.
export function readReferences(root, files) {
  const refs = [];
  const re = ID_REF_RE();
  for (const file of files) {
    const lines = fs.readFileSync(path.join(root, file), "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      for (const m of line.matchAll(re)) {
        for (const id of expandRange(m[0])) refs.push({ id, file, line: i + 1, range: m[0].includes("..") });
      }
    });
  }
  return refs;
}

// trace/ownership.tsv: "<ID>\t<part|*>\t<WP>\t<note>" — one row per (rule, part); '*' = whole rule
// or every part not listed separately. Lines starting with '#' are comments.
export function readOwnership(root) {
  const p = path.join(root, "trace/ownership.tsv");
  if (!fs.existsSync(p)) return null;
  return fs
    .readFileSync(p, "utf8")
    .split(/\r?\n/)
    .map((l, i) => ({ l, line: i + 1 }))
    .filter(({ l }) => l.trim() && !l.startsWith("#"))
    .map(({ l, line }) => {
      const [id, part, wp, note = ""] = l.split("\t");
      return { id, part, wp, note, line };
    });
}

// BUILD_MAP § 5 "Acceptance tests for work packages without ledger slices": WP → [test names]
export function readAcceptanceTests(root) {
  const text = fs.readFileSync(path.join(root, "BUILD_MAP.md"), "utf8");
  const start = text.indexOf("### Acceptance tests for work packages without ledger slices");
  const out = new Map();
  if (start < 0) return out;
  const section = text.slice(start, text.indexOf("\n### ", start + 10));
  for (const m of section.matchAll(/^\| (WP-[0-9]{3,4}) \| ([^|]*) \| [^|]* \|$/gm)) out.set(m[1], [...m[2].matchAll(/`([a-z0-9_]+)`/g)].map((x) => x[1]));
  return out;
}

export function readWorkPackages(root) {
  const text = fs.readFileSync(path.join(root, "BUILD_MAP.md"), "utf8");
  const wps = new Set();
  for (const m of text.matchAll(/^\| (WP-[0-9]{3,4}[a-z]?)(?:\.\.([0-9]{3,4}))? /gm)) {
    if (m[2]) {
      const start = Number(m[1].slice(3));
      for (let n = start; n <= Number(m[2]); n++) wps.add(`WP-${n}`);
    } else wps.add(m[1]);
  }
  return wps;
}
