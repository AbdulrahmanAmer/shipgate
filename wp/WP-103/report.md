# WP-103 report (written by the orchestrator from the builder's final message; the builder's Write was refused)

Engine: `ast-grep-core` 0.51.0 on `tree-sitter` 0.27.1, measured 2026-10-22 on Windows/MSVC. Sources: crates.io and GitHub APIs, the crates' own source, local builds.

| Language | Chosen | Version | Licence | Kinds / ABI | Sink node |
|---|---|---|---|---|---|
| vue | `tree-sitter-vue-next` | 0.1.0 | MIT | 67 / 15 | `directive_attribute` with `directive_name` = `v-html` |
| svelte | `tree-sitter-svelte-next` | 0.1.1 | MIT OR Apache-2.0 | 118 / 14 | `html_tag` |
| astro | `tree-sitter-astro-next` | 0.1.1 | MIT OR Apache-2.0 | 58 / 14 | `attribute` named `set:html` |
| embedded-template | `tree-sitter-embedded-template` | 0.25.0 | MIT | official | `output_directive` starting `<%==`; Ruby `raw()` / `.html_safe`; `<%-` only for `.ejs` |
| twig | gbprod/tree-sitter-twig, vendored | 1.1.0 @ 2208d2a | MIT (WTFPL until 2026-08-25) | 153 / 15 | `filter` with `filter_identifier` = `raw`; autoescape false |
| blade | EmranMR/tree-sitter-blade, vendored | 0.12.0 @ b5291d1 | MIT | 279 / 15 | `php_statement` starting `{!!` |
| jinja2 | `tree-sitter-jinja` | 0.13.0 | Apache-2.0 | 235 / 15 | `binary_expression` with `\|` and right side `safe`; `autoescape_statement` false |

All 7 embed and parse their samples and stress files with 0 ERROR/MISSING nodes: `maintained: true`, `embedding: pass`, `tierCap: full`. `regexSinks` are declared for all 7 as a fallback and cross-checked against the grammar in tests; their `precision` values are declared, not measured (UNPROVEN on real code).

Not chosen (each built alone):
- vue: `arborium-vue` 2.18.2 (clean; fallback), `tree-sitter-vue-updated` 0.1.0 (clean, different kinds), `tree-sitter-vue` 0.0.3 / `tree-sitter-vue3` 0.0.4 (tree-sitter 0.20 API; LNK2005/LNK2019).
- svelte: `tree-sitter-svelte-ng` 1.0.2 (clean, idle since 2024-10-19), `arborium-svelte` (clean), `tree-sitter-svelte` 0.10.2 (LNK2005).
- jinja2: `tree-sitter-jinja2` 0.0.16 (no licence file), `arborium-jinja2` (clean), `tree-sitter-jinja-dialects` 0.1.1 (1 ERROR on the Twig stress file).
- twig: `tree-sitter-shopware-twig` (9 / 52 ERRORs); kaermorchen's grammar is MPL-2.0, not built.
- blade, astro: no other crates on crates.io.

Findings:
- Several grammar crates export the same C symbol; linked together, the linker silently resolves to one grammar. A test now checks the node kinds each language id resolves to.
- ERB vs EJS `<%-` can't be told apart by the grammar; the file name decides.
- PHP: a bare ast-grep pattern doesn't parse; rules match by node kind.
- Single-maintainer risk: the vue, svelte and astro `-next` crates have one maintainer each.
- Windows: building in a deep worktree `target/` fails with LNK1104 (path > 260 characters) for several grammar crates; a short `CARGO_TARGET_DIR` works.

Decisions (orchestrator): vendoring twig and blade is accepted (MIT, generated parsers copied verbatim; `deny.toml` bans git dependencies). Blade's `parser.c` is 23 MB; accepted.
