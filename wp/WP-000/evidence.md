### WP-000 (commit d7463d4, 2026-10-22)
```
$ node tools/trace/trace-check.mjs --wp WP-000
DONE     WP-000 (2 items)
$ cargo nextest run --profile ci --workspace
     Summary [   1.433s] 7 tests run: 7 passed, 0 skipped
$ cargo clippy --workspace --all-targets -- -D warnings      → Finished, no warnings
$ cargo xtask stub-scan                                       → stub-scan: clean (crates, sidecar/src, rules, adapters)
```
Watched-fail: planting a CI reorder, a `// TODO` comment and `dbg_macro = "warn"` each turned the acceptance tests red; restored → green.
Not run locally: `cargo deny check` (needs the advisory DB download; runs in CI). CI itself can't run until the repo has a GitHub remote (UNPROVEN in CI).
