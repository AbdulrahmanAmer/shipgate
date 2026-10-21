# Resolution — orchestrator — pass A — round 07

Consistency rows that target `tools/`, `BUILD_MAP.md` or `trace/ownership.tsv`. Every tool change has a watched-fail self-test case (`spec-lint.test.mjs`, `trace-check.test.mjs`).

| Finding | Req | Outcome | Where | Note |
|---|---|---|---|---|
| consistency#1 | done-gate: WPs owning nothing | fixed | trace-check `checkWp`; spec-lint `wp-owns-nothing`; BUILD_MAP § 5 "Acceptance tests for work packages without ledger slices"; goal-text section cites count as owned sections; sub-WPs inherit the base WP unless ownership.tsv names them | self-tests "WP owning nothing is not done", "acceptance-test WP done/not done", lint "wp-owns-nothing" |
| consistency#2 | one passing fixture hid a failing one | fixed | trace-check `need()` | self-test "missed locked holdout not hidden by a passing one" |
| consistency#3 | test-id substring match | fixed | trace-check `checkTest`: ids end with `__`; BUILD_MAP § 4.1 item 5 naming | self-tests "section not proven by a longer section id" / "proven by its own id" |
| consistency#4 | section-unowned/channel-infra only warned | fixed | spec-lint → errors; self-test asserts errors | |
| consistency#5 | CARGO_TARGET_DIR location | fixed | trace-check reads `.cargo/config.toml` `[build] target-dir`, else env, else `target/`; WP-000 text | self-test "evidence found via .cargo/config.toml target-dir" |
| consistency#6 | CI never produced the evidence; junit had no tree hash | fixed | WP-000 CI order; § 4.1 item 5 junit `treeHash` property; trace-check rejects missing/mismatched | |
| consistency#7 | fixture path/lock granularity; unlocked files | fixed | § 4.1 item 5 path = `expected.json` relative to `corpus/`; lock lists every file; trace-check walks spec/holdout dirs | self-test "unlocked file in a locked fixture dir" |
| consistency#8 | builder-added fixtures blocked done | fixed | `need()`: ≥ 1 locked passing fixture required; unlocked builder fixtures allowed (but must pass) | |
| consistency#9 | sub-bullet parts invisible to tools | fixed | lib.mjs `extractParts` reads `- \`part\` —` lists; `partChannels` reads part channel tags | MET-011 now 8 parts, IDX-008 4 |
| consistency#10 | channel slices left browser-only parts with phase-4/5 owners | fixed | ownership rows AEO-014/MET-011/URL-006 parts → WP-608; SEC-003 → WP-607; RTE-001 → WP-608; CNT-009 → WP-608 + part `raw` WP-504; spec-lint errors on a stranded part | lint self-test "stranded browser-only part" |
| consistency#11 | UX-022 owner before flows exist | fixed | UX-022 → WP-609; WP-609 depends on WP-414 | |
| consistency#12 | fetch-store writer unowned | fixed | WP-306 goal (fetch events + store writer), WP-803 per-host recording | |
| consistency#15 | WP prose vs ledger | fixed | BUILD_MAP goals carry "Not here / Also" notes; § 5 intro: ownership.tsv authoritative | |
| consistency#16 | WP-608 missing WP-412 dep | fixed | BUILD_MAP WP-608 deps | |
| consistency#17 | WP-413 missing WP-415 dep | fixed | BUILD_MAP WP-413 deps | |
| consistency#18 | PRF-011 needs WP-701 machinery | fixed | ownership PRF-011 → WP-701; WP-701 depends on WP-604 | |
| consistency#19 | WP-209 / WP-208 both edit sg-cli | fixed | WP-209 depends on WP-208 | |
| consistency#20 | done-claim format | fixed | § 4.1 item 9 format; trace-check rejects other claim lines | self-test "unrecognised done claim" |
| consistency#21 | § 6 card vs § 4.1 | fixed | § 6 acceptance + report-back lines | |
| consistency#22 | stub-scan vs spec identifiers | fixed | § 4.1 item 7: standalone `stub` comment markers only | |
| consistency#23 | § 3 layout omitted trace tooling | fixed | § 3 layout lines | |
