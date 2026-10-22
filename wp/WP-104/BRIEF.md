# WP-104 (ruleset data) — brief shared by every WP-104 part

Read `wp/BUILDER-BRIEF.md` first. WP-104 is split into parts (a, b, c, d1, d2, e, f); each part owns a disjoint list of files under `rules/` (your prompt lists yours). Write only those.

## What each file must be
- **Shape:** exactly the shape the spec defines where a rule cites the file. Find it with a search for the file name across `spec/**` (e.g. `ruleset \`social-hosts.json\`` or `` `social-hosts.json` ``) and follow every sentence that describes keys, value types, matching rules and shipped examples. Where the spec lists "shipped" entries, all of them are in your file. When the spec is silent or contradicts itself on a shape, write the problem and your proposal to `wp/WP-104/spec-changes-<part>.md`, use the proposal, and say so in your report.
- **Location and name:** `rules/<name>.json` (or `.txt` where the name says so), the name exactly as `xtask/tests/wp_104.rs` lists it (camelCase names stay camelCase). Plain JSON, UTF-8, no comments, no `formatVersion` (03 § 1 exempts ruleset data).
- **Per-locale files** (the test's `PER_LOCALE` list) are objects keyed by BCP 47 primary tags and cover all 20 locales of DECISIONS D-010: ar, cs, da, de, en, es, fi, fr, it, ja, ko, nb, nl, pl, pt, ro, ru, sv, tr, zh. Entries are what real pages in that language actually say (the phrases a site really uses, e.g. German "Zahlungspflichtig bestellen", Japanese "特定商取引法に基づく表記"), not literal translations of English. Prefer published sources (CLDR, Snowball stop-word lists, legal texts that prescribe wording, vendor documentation) and cite them; where a list is authored from knowledge, keep it conservative and precise (phrase lists drive blocking checks: a wrong phrase is a false positive or a missed defect).
- **Fidelity:** never invent URLs, IDs, vendor names, CIDR ranges, version numbers or legal requirements. Anything vendor- or law-specific comes from a source you fetched; record it.

## Provenance (single writer: the orchestrator)
Don't write `rules/provenance.json`. Write `wp/WP-104/provenance-<part>.json`: `{ "<path under rules/>": { "source": ["https://…" or "spec:<file> § <section>"], "retrieved": "YYYY-MM-DD", "licence": "<SPDX id, or LicenseRef-shipgate-authored for lists you authored>", "attribution": "<required attribution text, if the licence needs one>" } }` with one entry per file you wrote. Data under a non-permissive licence (GPL, CC-BY-SA, NC) is not usable; CC-BY and ODbL are usable with attribution recorded.

## Checking your part
`cargo nextest run --profile ci -E "test(/^wp_104__/)"` prints every problem across all parts. Your part is done when no problem line names one of your files (other parts' files will still be missing). To check provenance, merge your fragment into a scratch copy of `rules/provenance.json` locally, run the test, then delete that scratch file before committing. Paste the filtered problem count for your files (it must be 0) in your report.
