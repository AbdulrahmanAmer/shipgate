# WP-103 — spec changes proposed

Proposals only; the orchestrator decides and edits the spec. Each cites the spec line, what was observed, and the change.

## 1. 02 § 4 "Templates" — two of the seven grammars exist only as git repositories

- Spec line: "tree-sitter grammars for `vue`, `svelte`, `astro`, `embedded-template` (ERB/EJS), `twig`, `blade`, `jinja2` parse template markup …" and 05 § 8 (compiled-in dependencies permissive, `cargo deny`).
- Observed: `twig` (gbprod/tree-sitter-twig, MIT, active) and `blade` (EmranMR/tree-sitter-blade, MIT, active) are maintained and parse, but neither is on crates.io, and `deny.toml` has `unknown-git = deny`. Built as vendored generated parsers: `crates/sg-analysis/vendor/tree-sitter-{twig,blade}` (`VENDORED.md` has commit and sha256). Blade's `parser.c` is 23 MB. Twig was relicensed WTFPL to MIT on 2026-08-25 by its author (the vendored commit is after that).
- Proposal: add to 02 § 4 (or 05 § 8): "A grammar with no published crate is vendored verbatim with its licence and pinned commit under `crates/sg-analysis/vendor/`; a vendored grammar must be permissively licensed at the pinned commit." The alternative (not taken): treat both as `maintained: false` and use `regexSinks`, which caps them at `structural`. Decision for the Operator: repository size (23 MB generated C) and build time against the tier gain. Revert is two JSON edits plus deleting the vendor directory (both `VENDORED.md` say so).

## 2. 03 § 6 `regexSinks` vs `rules/grammar-tiers.json` entries

- Spec line: `regexSinks`: `[{ templateLanguage, pattern: regex, precision: number 0–1 }]`.
- Observed: in `rules/grammar-tiers.json` the language is the key of the entry, so entries are `{ pattern, precision }` without `templateLanguage` (the WP-103 test and 02 § 4 imply this). The regex dialect is Rust `regex`, matched against the whole file; a match is a sink at the line where it starts.
- Proposal: state in 03 § 6 that the pattern dialect is Rust `regex`, that `templateLanguage` is implied by the key in `grammar-tiers.json`, and that `precision` is a declared value, not a measurement. The values recorded (0.8 to 0.95) are declared: on the fixtures the patterns agree with the grammar on every sink line, and on commented-out decoys they report sinks the grammar ignores (`tests/templates.rs`); their precision on real code is UNPROVEN.

## 3. 05 § 1 `dev grammar-probe` row

Details the row leaves open, as built (all covered by tests):
- `parsed` is true when a syntax tree was produced; it is `false` (with `errorNodes: 0`) for the `regex` engine, which parses nothing.
- `errorNodes` counts ERROR and MISSING nodes, named and anonymous.
- The file name is a hint: EJS `<%-` (raw output) and ERB `<%-` (trim marker) are the same node in the grammar, so `<%-` is a sink only for `*.ejs`.
- Bad or missing arguments also exit 3; without `--json` a short text form is printed.
- Proposal: add these four facts to the row.

## 4. Environment (not a spec text): Windows path length

Builds in the worktree's own `target/` fail with `LNK1104: cannot open file ...\build_script_build-<hash>.exe` for several grammar crates, because worktree path (about 160 characters) plus `target\debug\build\<crate>-<hash>\build_script_build-<hash>.exe` exceeds 260. This session built with `CARGO_TARGET_DIR=C:/t/wp103`. `trace-check.mjs` (clean temporary worktree) and CI on Windows will hit the same limit with long checkout paths. Cause inferred from the path length and confirmed only by the short target dir working; the fix below is untested. Unblock: a short `target-dir` for trace-check's temporary worktree, or Windows long paths (`LongPathsEnabled`).
