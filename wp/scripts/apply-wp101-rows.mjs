// Usage: node wp/scripts/apply-wp101-rows.mjs — orchestrator-only. Applies the fenced replacement rows of
// wp/WP-101/spec-changes.md to the tables they target (03 § 16 Host mappings / Hook output, 05 § 3.3 matrix).
// A row replaces the row of the same first cell inside that table; every replacement must hit.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const changes = fs.readFileSync(path.join(root, "wp/WP-101/spec-changes.md"), "utf8").replace(/\r\n/g, "\n");
const targets = {
  "03:mapping": ["spec/03-formats.md", "**Host mappings**"],
  "03:output": ["spec/03-formats.md", "**Hook output**"],
  "05:matrix": ["spec/05-integrations.md", "| Host | Config | Events used |"],
};
const first = (row) => row.trim().replace(/^\|/, "").split("|")[0].trim();
const files = {};
for (const m of changes.matchAll(/```md target=(\S+)\n([\s\S]*?)```/g)) {
  const [file, anchor] = targets[m[1]] || [];
  if (!file) throw new Error(`unknown target ${m[1]}`);
  files[file] ??= fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
  let t = files[file];
  const at = t.indexOf(anchor);
  if (at < 0) throw new Error(`anchor not found: ${anchor}`);
  const lines = t.slice(at).split("\n");
  let end = 1;
  while (end < lines.length && (lines[end].startsWith("|") || lines[end].trim() === "")) end++;
  const table = lines.slice(0, end);
  for (const row of m[2].trim().split("\n")) {
    const key = first(row);
    const i = table.findIndex((l, k) => k > 0 && l.startsWith("|") && first(l) === key);
    if (i < 0) throw new Error(`${m[1]}: no row ${key}`);
    table[i] = row;
    console.log(`${m[1]}: replaced ${key}`);
  }
  files[file] = t.slice(0, at) + [...table, ...lines.slice(end)].join("\n");
}
const swap = (file, a, b) => {
  files[file] ??= fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n");
  if (!files[file].includes(a)) throw new Error(`${file}: not found: ${a.slice(0, 70)}`);
  files[file] = files[file].split(a).join(b);
};
swap("spec/03-formats.md", "(to be confirmed by WP-101, which updates this table and 05 § 3.3 statuses)", "(confirmed by WP-101 on 2026-10-22 for `claude-code`, `codex` and `opencode` against recorded payloads in `crates/sg-hooks/tests/host-payloads/`; the `cursor` and `antigravity` rows are docs-derived and unconfirmed, 05 § 3.3)");
swap(
  "spec/05-integrations.md",
  "**Invariants:** pre-hooks never need the toolchain or network; shipgate converts its own crashes/timeouts into the host's explicit deny where possible;",
  "**Invariants:** pre-hooks never need the toolchain or network; shipgate converts its own crashes/timeouts into the host's explicit deny where possible, and never relies on the host for that: Claude Code and Codex kill a hook that exceeds its timeout and let the tool call proceed (fail-open, observed by WP-101), so `check --hook` times itself out and answers deny before the installed host timeout;",
);
swap("spec/05-integrations.md", "or its CLI is on `PATH` (`claude`, `codex`, `cursor-agent`, `opencode`, `antigravity`; names confirmed by WP-101 with the § 3.3 statuses)", "or its CLI is on `PATH` (`claude`, `codex`, `opencode` confirmed by WP-101; `cursor-agent` unconfirmed; Antigravity installs no CLI on `PATH` on Windows, so `.agents/` is its only detection there)");
for (const [f, t] of Object.entries(files)) fs.writeFileSync(path.join(root, f), t);
console.log("ok");
