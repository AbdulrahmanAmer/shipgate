# Cross-file requests — from algorithms — round 07

Requests from the algorithms fixer (pass A) for files it doesn't own. 04 § 15 now holds the single definitions of **Indexable page**, **Page locale** (with the per-locale list lookup and the no-entry outcome) and the **Lock-digest PRNG** (draws and value streams). Each request: target, location, exact edit, finding served. Check the current text first: several sibling rows were already applied by their owners in pass A, and these requests cover only what was still missing when this file was written.

## X1 — spec/packs/web-delivery.md § 2 *Indexable page* (dedupe with 04 § 15)
Serves: orchestrator instruction (one definition, in 04 § 15); concreteness-algorithms #2; concreteness-web-delivery #1.

04 § 15 *Indexable page* now carries your § 2 text items 1–5 and the closing paragraph, with key paths qualified (`web-delivery.indexRules`, `search-engines.facets.indexable`, …). Two definitions would drift.

Old: the whole block from `**Indexable page** (the only definition; every pack uses it, …` through `… The expected canonical of an indexable page is its own canonical form (URL-001).`
New: `**Indexable page**: 04 § 15 *Indexable page* (the only definition; "indexable canonical" and "indexable URL" mean the same set). Nothing on the page (a `noindex`, a robots.txt disallow, a canonical elsewhere) removes a URL from the set; on an indexable page those are findings of MET-006, IDX-004 and URL-004.`

If you change items 1–5 in pass B, send the change back as an xfile to algorithms instead of keeping a local copy.

## X2 — spec/packs/web-delivery.md § 1 *Locale segment* paragraph, last sentence
Serves: orchestrator instruction (page locale in 04 § 15); concreteness-core-adapters-ux #9; concreteness-web-delivery #4.

Old: `**Page locale** = URL locale.`
New: `**Page locale** = URL locale (04 § 15 *Page locale*, which also defines per-locale ruleset lookup and the outcome for a locale with no ruleset entry). With no URL locale, 04 § 15 uses `defaultLocale` for list lookups; MET-007 still reports the URL.`

## X3 — spec/01-core.md TR-111 first sub-bullet
Serves: consistency #132 (calibration skipped by `--gate G6`); 04 § 6.3 now calibrates at the first of G4 and G6 that runs.

Old: `Each run records one median `benchmarkIndex`, measured at the start of G4 (04 § 6.3), and the report states it.`
New: `Each run records one median `benchmarkIndex`, measured at the start of the first of G4 and G6 that runs (04 § 6.3), and the report states it.`

## X4 — spec/03-formats.md § 17 report, finding object
Serves: concreteness-algorithms #13 (04 § 9.4 dedupe now lists absorbed rule ids in `absorbed`).

In the `findings` example, insert after `"count": 3,`: `"absorbed": [],` and add to the prose under the example: "`absorbed`: rule ids (or `RULE#part`) whose findings merged into this one under 04 § 9.4 *Dedupe*, sorted; `[]` when none."

## X5 — spec/03-formats.md § 6 adapter manifest table
Serves: concreteness-algorithms #25 (04 § 13 AGT-004 matcher widening reads the adapter list).

Insert a row after `requestSources`: `| `matcherWidening` | `[{ from, to }]`: test-assertion matcher pairs (callee names) whose replacement from → to in a kept assertion is AGT-004 `transform` matcher widening (04 § 13); e.g. `{ "from": "toEqual", "to": "toBeTruthy" }`, `{ "from": "assertEqual", "to": "assertTrue" }` | | `[]` |`

## X6 — BUILD_MAP.md (orchestrator)
Serves: consistency #108 (WP-307 must produce the TR-112 required pages and `business.json` excerpts that 04 § 7 now lists); concreteness-algorithms #24 and #26 (ruleset data, see resolution file).

WP-307 Goal: append "; TR-112 required-pages list and `business.json` excerpts (04 § 7)". WP-104: add `secret-patterns.json` to the "provider secret-key patterns (SEC-050)" item; WP-102 or WP-104 "Foundation recipes per adapter" bullet: name the files `recipes/<adapter id>.json` (04 § 7).
