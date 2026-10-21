# Resolution — orchestrator — pass A — round 08

Consistency rows 1–19 (done-gate). Design change: trace-check no longer reads any results file — it builds HEAD in a clean worktree, runs every locked fixture through the binary itself and runs nextest itself; contract files are protected by a merge gate. Self-tests: trace-check 28 cases, stop-gate 11, merge-gate 8, wp-card 7, spec-lint 19.

| Finding | Req | Outcome | Where | Note |
|---|---|---|---|---|
| consistency#1 | hand-written evidence | fixed | trace-check `realEvidence()`; BUILD_MAP § 4.1 item 5 | self-test "real mode: hand-written evidence files are ignored" |
| consistency#2 | runner omits failing holdouts | fixed | fixtures enumerated from FIXTURES.lock, judged by trace-check | self-test "second locked holdout missed" |
| consistency#3 | relabelled rule/part/kind | fixed | rule + kind from the fixture path; expected.rule must match | self-test "fixture relabelled to another rule" |
| consistency#4 | re-hashed lock / moved ownership | fixed | tools/trace/merge-gate.mjs; § 4.1 item 3 | merge-gate self-test 8/8 (re-hash, edited fixture, new holdout file, ownership move, tool patch, spec edit) |
| consistency#5 | other WPs' section tests | fixed | tests named `wp_<id>__<req>__`; § 4.1 item 5 | self-test "another WP's section test doesn't count" |
| consistency#6 | Stop hook pre-filter | fixed | stop-gate.mjs always runs `--claimed --from-hook`; record per tree | stop-gate self-test 11/11 |
| consistency#7 | WP-920 circular | fixed | WP-920 = every other WP DONE in the same run | self-test "WP-920 needs every other WP done" |
| consistency#8 | junit treeHash impossible | fixed | junit produced in the clean worktree; no property needed | |
| consistency#9 | "not done" in a claim line | fixed | only a status of not done/in progress/blocked/built is exempt | self-test claim "WP-412: done (WP-410 not done)" |
| consistency#10 | sub-WP card empty | fixed | wp-card inherits base | wp-card self-test |
| consistency#11 | card lacks acceptance/sections | fixed | wp-card lists S/A/T rows with exact test ids | wp-card self-test |
| consistency#12 | (L) split broke lint/phase | fixed | WP-id regexes accept `WP-410a` | spec-lint self-test "split sub-package" |
| consistency#13 | failure classes from builder metadata | fixed | lib reads 04 § 9.1 classes named in rule text; trace-check requires them; card lists them | |
| consistency#14 | no self-tests for stop-gate/wp-card | fixed | stop-gate.test.mjs, wp-card.test.mjs (+ merge-gate.test.mjs) | |
| consistency#15 | channel owed for moved parts | fixed | trace-check drops channels used only by moved parts | |
| consistency#16 | target-dir precedence text | fixed | obsolete: trace-check builds in its own worktree target | |
| consistency#17 | deferred.tsv format on card | fixed | wp-card text | |
| consistency#18 | builder can't be "done" before holdouts | fixed | `WP-<id>: built` status (§ 4.1 item 6; card; claims exempt "built") | |
| consistency#19 | section-table 02 row | fixed | BUILD_MAP section table: WP-302 only | |
