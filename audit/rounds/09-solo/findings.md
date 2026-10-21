# Round 09 (solo) — one-writer consistency pass

Operator, 2026-10-22: "fix the current conflicts and contradictions yourself, one shot, then start building."
One reader and one writer (the orchestrator, Opus 5.5), reading the whole spec in order — `SPEC.md`, `spec/01..05`, all 15 packs, `BUILD_MAP.md`, `ORCHESTRATOR_PROMPT.md`, `CLAUDE.md` — so a fix in one file can't collide with a fix made in parallel in another. Shared lists were cross-checked by `xcheck.mjs` (output: `xcheck.out.txt`); every hit was read by hand.

Outcome vocabulary as in earlier rounds: fixed · rejected (with reason). Nothing is open.

| # | Location | Defect | Outcome | Fix |
|---|---|---|---|---|
| 1 | SPEC.md § Before the next session | Told the reader to move the folder off OneDrive to `D:\shipgate` and run `agent-os init`; the repo isn't on OneDrive and position lives in `.claude/POSITION.md` | fixed | Section renamed *Build environment notes*: short Cargo target dir (WP-000), Dev Drive, where position persists |
| 2 | SPEC.md § Gap audit | "The first two work packages of the build map are fixed" — BUILD_MAP starts with WP-000; the two named items are WP-101 (phase 1) and WP-209 (phase 2) | fixed | Reworded to name WP-101 and WP-209 and their phases |
| 3 | 04 § 8 *Budget exhaustion* ↔ 03 § 3.2 `timeoutSec` | 04 said a timed-out command is a finding "of BLD-001…BLD-005"; 03 maps `migrate` → DB-001 `apply`, `coverage` → TST-011, and `start` has no `timeoutSec` (BLD-005 is readiness) | fixed | 04 § 8 now lists the 03 § 3.2 mapping |
| 4 | 04 § 1.1 *db and contract gates* ↔ DB-003, DB-006, DB-007 | DB-007 `fk-index` is judged "in G4 right after 04 § 4.2 step 4", DB-003 `rewrite` (MySQL) probes in step 4, DB-003/DB-006 attribute logged statements of non-`sql-dir` formats in step 4; none was in the G4-after-migrations list, so their `gates` metadata had no rule to follow | fixed | Added to the list |
| 5 | 04 § 2 item 5 edge-pass budget ↔ SE-011, SE-115, URL-002, SEC-010/016/056/075, PRF-008 | The request list named no rule for the host-identity HEADs and didn't budget SE-011's resource-host `robots.txt` fetches or SE-115's edge part | fixed | Host-identity bullet names its rules; SE-011 and SE-115 bullets added |
| 6 | 04 § 15 *Reference time* | Time-based edge observations listed SEC-015, SEC-056, SEC-059, IDX-011 but not OPS-016 (domain expiry) or SE-115 `expired`, which both read the wall clock | fixed | Both added |
| 7 | 01 § 5.4 expiry clock ↔ OPS-015 | OPS-015 compares EOL dates with "the expiry clock (01 § 5.4)", which didn't list them | fixed | EOL dates (OPS-015) added to the "must not have passed yet" list |
| 8 | 03 § 14 *Merchant feed* ↔ SE-113/SE-114 | 03 cited "04 § 15 *Owners of BLOCKED gates*" for reassigning a feed `parse-error` finding; that section is about gates; the finding rule is 04 § 14 (fix outside the Builder's paths), which SE-113/114 cite | fixed | 03 now cites 04 § 14 |
| 9 | 03 § 17 report example | `"specVersion": "7.6.0"` while the spec is newer | fixed | `7.8.0` (spec bumped to v7.8.0 for this round) |
| 10 | BUILD_MAP § 1 | "implements the full spec (`SPEC.md` v7.4+)" | fixed | v7.8+ |
| 11 | BUILD_MAP WP-209 ↔ § 4.1 items 3, 5 ↔ 05 § 1 `dev fixture` | WP-209 described an `expected.json` with groupKey and verdict and an `xtask corpus` output "in the item 5 shape", but item 5 now reads `shipgate dev fixture --json` and item 3 defines `{ rule, part?, kind, expect[] }` | fixed | WP-209 goal names the item 3 format (extra keys allowed, ignored), `shipgate dev fixture`, and `xtask corpus` as the determinism runner |
| 12 | BUILD_MAP WP-414 goal | "SEC-066 CI hardening review UX-022 is in WP-609" — two sentences run together, reads as SEC-066 reviewing UX-022 | fixed | Full stop added |
| 12a | BUILD_MAP WP-000 ↔ `tools/trace/trace-check.mjs` | WP-000 said trace-check reads the target dir from `.cargo/config.toml` or `CARGO_TARGET_DIR`; since R08-02 it builds in its own temp worktree with an explicit `--target-dir` | fixed | WP-000 says the config is for local builds and trace-check ignores it |
| 13 | CLAUDE.md, ORCHESTRATOR_PROMPT.md non-negotiable 1, audit/README.md | All said no build work until a GO round; the Operator closed Stage 0 instead | fixed | Rewritten (D-006); Stage 0 section kept as the record |
| 14 | ORCHESTRATOR_PROMPT.md gates table | Lint self-test "14/14"; stop-gate, merge-gate and wp-card self-tests and the merge gate missing | fixed | One self-test row with all five (current counts) and a merge-gate row; merge-gate added to loop step 5 |
| 15 | ORCHESTRATOR_PROMPT.md models | "strongest model available" / "Sonnet-class" — not the explicit routing the Operator requires | fixed | Opus 5.5 high for fixture authors and reviewers, Sonnet 5.5 high for builders (own worktree), Haiku 5.5 for sweeps; phase escape-path audit on Opus (D-007) |
| 16 | xcheck `smtp`: API-009, PRV-012/016/021/023/037/041/042, RES-008, SEC-029, TST-001, UX-001 vs 03 § 3.4 `smtp` row | Rules reading the SMTP sink that the row doesn't name | rejected | Each is already covered by the row's own conditions (a flow with `expectEmail`/`openEmailLink`, a UX-022 `email:` form key, a `raceSensitive` `email` effect, the ops pack); PRV-012 doesn't read the sink |
| 17 | xcheck `required-facts`: SEC-040/041/048/063, LOC-003 | Named as required-facts rules in 04 § 1.2 but their text doesn't say `missing-element` | rejected | security § 1 *Payments applicability* and search-engines § 10 state the operator-owned `missing-element` outcome for them |
| 18 | xcheck `edge`: UX-022 | Edge-channel rule absent from the edge request list | rejected | UX-022 sends no requests (it reads `launch-forms.json` in G8; `remote: none`) |
| 19 | business.json `geo.lon` vs programmatic `geo.lng` | Two field names for longitude | rejected | Different files with different readers, each defined once and used consistently; renaming an Operator-authored key buys nothing |

Gates after the fixes: see the commit message of this round and `.claude/POSITION.md`.
