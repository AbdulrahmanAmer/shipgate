# Resolution — privacy-a11y-perf — pass A — round 08

Inputs: all 39 rows of `concreteness-privacy-a11y-perf.md` (key `concreteness#N`); consistency rows ≥ 20 whose Location names one of my files: 37, 38, 39, 40, 41, 79, 80, 81, 98, 110 (key `consistency#N`); coverage gaps whose pack is privacy, accessibility or performance: `coverage-real-use` #2, #3, #6, #7, #8, #10, #11, #12, #13, #14. `coverage-visibility.md` has no gap in these packs (its 9 gaps are search-engines, web-delivery, answer-engines, ux), so it contributes no row. No gap in my packs is marked by its auditor as unconfirmed against statute text, so none was downgraded to W; where I narrowed a statutory claim myself, the Note says so.

Cross-file edits: `audit/rounds/08/xfile/from-privacy-a11y-perf.md` items X1–X9.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness#1 | PRV-*, A11-*, PRF-003..019 | adapted | privacy.md:69; accessibility.md:20; performance.md:26 | *Sampled page* / *Sampled public page* / product-page scope defined (PRV-040 added to the product-page list). A11 § 1 now cites it with exactly min(3, group size). PRF § 1: PRF-008/009 keep the response sets their own text names (crawl responses, not the HTTP sample as proposed, which would have narrowed PRF-009); PRF-005/012 named too. |
| concreteness#2 | PRV-006 etc. | adapted | privacy.md:63 | Per-locale `path` map added as proposed; added a fallback (first key in byte order) for when `web-delivery.defaultLocale` doesn't exist (pack off, consistency#68). |
| concreteness#3 | PRV-002..036 | adapted | privacy.md:93, :98 | Missing `acceptLabel` control → builder-owned `missing-element` on PRV-002. Dependent rules are `blocked(prerequisite: PRV-002)` instead of the proposed `notApplicable` (they did not stop applying, they could not run). Proposal over-reached on PRV-011 and PRV-036: PRV-011's default-command/first-request checks and PRV-036 `cmp` need no consent context and still run; PRV-014 keeps its own `consent.banner` finding. |
| concreteness#4 | PRV-003 | fixed | privacy.md:87, :99 | *Pre-consent context* defined; PRV-003 cites it and the PRV-002 reject context. |
| concreteness#5 | PRV-008, PRV-028, PRV-032 | fixed | privacy.md:77, :104, :142, :146 | *Page state* defined (A11-030 view); three rules use it. |
| concreteness#6 | PRV-010, PRV-019 | fixed | privacy.md:106, :115 | PRV-019 owns values typed into its fields; `hashed` not reported for `advertising` hosts. |
| concreteness#7 | PRV-010, PRV-019 | fixed | privacy.md:75 | *Encodings of a value* defined (wording tightened: output characters depending on unknown bytes on both sides are dropped). |
| concreteness#8 | PRV-011 | fixed | privacy.md:67 | `google-tags.json` shape and `gcd` decoding stated. |
| concreteness#9 | PRV-014 | fixed | privacy.md:110 | Request test after reject only; reopen control tested in the accept context, Label match, 1 s. |
| concreteness#10 | PRV-016 | fixed + xfile | privacy.md:44, :112; X1 | Operator-owned blocking finding with a signup flow; `notApplicable` otherwise; policy comment updated. |
| concreteness#11 | PRV-021 `flow` | adapted + xfile | privacy.md:117; X1 | Missing withdrawal flow → `operator`. Split the proposed builder-owned case: no activated control phrase-matches → builder (site label); no `expectEmail` after it → `operator` (flow content is Operator-owned, 01 § 5.2). |
| concreteness#12 | PRV-008/021/023, A11-021, PRF-012 | fixed + xfile | privacy.md:73, :104, :117, :124, :125; accessibility.md:32, :58; performance.md:45; X2 | Pack-wide "matches = phrase match" sentence in privacy and accessibility; each listed rule rewritten to say "phrase match". 04 § 15 item 5 → X2. |
| concreteness#13 | PRV-024 `prior-price` | fixed | privacy.md:125 | CSS `line-through` included; 200 characters before/after in visible text; rule channels `html, browser`, part tagged `(html, browser)`. |
| concreteness#14 | PRV-025 | fixed + xfile | privacy.md:126; X4 | Operator decision applied with the auditor's proposed default: optional `manufacturers[].pagePaths` beats the JSON-LD name when any entry has it. Residual C10 (an Operator who declares no `pagePaths` still lets JSON-LD choose the entry) is the documented Operator choice. |
| concreteness#15 | PRV-026 `total` | fixed | privacy.md:138 | Last payments request with an extractable amount; `total` field else sum of items. |
| concreteness#16 | PRV-028 | fixed | privacy.md:142 | `autocomplete-map.json` mapping extends *personal-data field*. |
| concreteness#17 | PRV-017 | fixed | privacy.md:113 | |
| concreteness#18 | — | fixed | privacy.md:28 | `settingsLabel` deleted (no reader anywhere in spec/). |
| concreteness#19 | PRV-004 | fixed | privacy.md:100 | `us-opt-out-states.json` shape and effect stated. |
| concreteness#20 | PRV-024, PRV-025 | fixed | privacy.md:125, :135 | Both shapes stated. |
| concreteness#21 | PRV-029 | fixed | privacy.md:143 | |
| concreteness#22 | PRV-030 | fixed | privacy.md:144 | |
| concreteness#23 | PRV-031 | fixed | privacy.md:145 | |
| concreteness#24 | PRV-001/002/005 | fixed | privacy.md:71 | Unknown hosts → PRV-005 only (P0 there, so no PASS is reachable). |
| concreteness#25 | PRV-015 | fixed | privacy.md:111 | |
| concreteness#26 | PRV-013 | fixed | privacy.md:109 | Normalisation applied to both sides. |
| concreteness#27 | PRV-018 | fixed | privacy.md:53 | Type of `page` stated in the policy comment. |
| concreteness#28 | PRV-001..014 | fixed | privacy.md:85 | Also names the PRV-004 GPC context. |
| concreteness#29 | A11-001, -004, -015, -027 | fixed | accessibility.md:22, :64 | *Consent state* paragraph; A11-001 also runs on the first consent page before accepting. |
| concreteness#30 | A11-007 | fixed | accessibility.md:44 | Channels `html, browser`, with the per-check channel split. |
| concreteness#31 | A11-021 `carousel` | adapted | accessibility.md:58 | Region found from shipgate's own observation: full-page screenshots, `elementFromPoint` at differing pixels, nearest ancestor-or-self with ≥ 2 same-tag children and ≥ 200 × 100 CSS px; media subtrees ignored; markers only name the region. |
| concreteness#32 | A11-005, -021, -026 | fixed | accessibility.md:42, :58, :63 | W parts `incomplete`, `embed-captions`, `over-limit` (spec-lint parses all three). |
| concreteness#33 | A11-003 | fixed | accessibility.md:40 | |
| concreteness#34 | A11-017, A11-024 | fixed | accessibility.md:54, :61 | |
| concreteness#35 | PRF § 1 | adapted | performance.md:26 | As proposed, but a URL reached by several accounts uses the account id first in byte order (consistency#110: `accounts` is a JSON object, so "order" is undefined). |
| concreteness#36 | PRF-002 | fixed | performance.md:35 | |
| concreteness#37 | PRF-011, PRF-016 | fixed | performance.md:44, :49 | |
| concreteness#38 | PRF-012 | fixed | performance.md:45 | |
| concreteness#39 | PRF § 3 | fixed | performance.md:58 | |
| consistency#37 | UX-003 / LOC-001 `phones` | xfile | X8 | No edit needed in privacy.md. The ux.md half is already applied at HEAD (ux fixer); the search-engines.md half is pending its owner. Extended X8 with the contact values that PRV-038/PRV-042 now put on pages (`legal.dmcaAgent.phone`/`.email`, `legal.eu/ukRepresentative.email`). |
| consistency#38 | PRV-023, PRV-027 | fixed + xfile | privacy.md:124, :141; X1 | |
| consistency#39 | PRV-037 `notice` | adapted | privacy.md:151 | Markers (G6 mutating flow; mutating stage; `remote: write`) put on part `notice`, the only part that submits, not on `terms` as the proposed placement read. |
| consistency#40 | PRV-033, PRV-037 | fixed + xfile | privacy.md:83; X1 | Also covers new PRV-042 `dmca-agent`. |
| consistency#41 | PRV-026 `total`, PRV-032 (WP deps) | xfile (orchestrator) | — | Every edit targets BUILD_MAP.md (WP-609/WP-203/WP-602), which is orchestrator-owned (07 passB-notes item 5). No pack text change needed; not copied into my xfile. |
| consistency#79 | 04 § 1.2 list | xfile | X1 | Merged with every new operator-owned outcome from this pass. |
| consistency#80 | PRV-022 `jp-sct` | fixed | privacy.md:120 | |
| consistency#81 | PRV-022 `imprint` ↔ PRV-030 | fixed | privacy.md:118 | |
| consistency#98 | PRF-016 | fixed | performance.md:49 | |
| consistency#110 | PRF-011 | fixed | performance.md:44 | Same rule applied in PRF § 1 and A11-033. |
| coverage-real-use#2 | PRV-038 (new) | fixed + xfile | privacy.md:26, :65, :152–157; X3, X4 | Parts `registry` (operator), `notice`, `representative`. Art. 27(2) exemption = signed `art27Exempt`. The `transfers` phrase group is read only by PRV-038, so PRV-031 doesn't require it of sites with no third-country processor. |
| coverage-real-use#3 | PRV-039 (new) | adapted | privacy.md:158 | No text page → operator-owned blocking instead of the proposed `notApplicable` (which was an escape once a checkout flow exists but PRV-022 requires no page). Dropped the proposed "digital products skip `modelForm`": CRD Annex I(B) requires the model form wherever the right exists, and digital-content exceptions (Art. 16(m)) depend on consent, not on the URL. |
| coverage-real-use#6 | PRV-026 `drip` | adapted | privacy.md:21–22, :139, :143 | `ca-consumer`, `us-consumer` added; `market-signals` `commerce` gains `ca-pipeda → ca-consumer`. I narrowed the statutory claim myself: 16 CFR Part 464 covers only live-event tickets and short-term lodging, while California Civ. Code § 1770(a)(29) is general. Both bases are stated. EU basis cited as Directive 98/6/EC Art. 2(a) (selling price) + CRD Art. 6(1)(e). |
| coverage-real-use#7 | PRV-026 `unit` (new part) | adapted | privacy.md:52, :140 | Comparison made at the shown reference quantity (indicated × per ÷ pack, within one minor unit), not after scaling to 1 kg, so 100 g displays aren't penalised for rounding. |
| coverage-real-use#8 | PRV-040 (new) | adapted + xfile | privacy.md:21–22, :159–165; X5 | The Operator register is the primary scope (an entry puts the page in scope); category regexes over agent-written markup only trigger the operator-owned `register` finding. That keeps C10: removing markup can't take a page out of scope once registered. |
| coverage-real-use#10 | PRV-041 (new) | adapted + xfile | privacy.md:23, :55–57, :65, :166–168; X6 | `marketingForms` given an object shape (the proposal used it both as a key list and as entries with `confirmation`). Part `confirm` stated as resting on case law (§ 7(2) UWG, BGH I ZR 164/09), not on statute; it is still P1 because the auditor didn't mark it unconfirmed and it applies only with `de`/`at` or the Operator's `doubleOptIn`. |
| coverage-real-use#11 | PRV-042 (new) | adapted + xfile | privacy.md:24, :58–59, :151, :169–175; X4 | Missing `dsa.ugcSelectors` with `us-ugc`/`uk-osa` is an operator-owned blocking finding instead of the proposed `notConfigured`. Applied the same change to PRV-037 `notice` (it had the same escape). The off-site Copyright Office registration is a named W part `dmca-registration` (C5). `required-legal-pages.json` must require `terms` for both keys (ruleset data). |
| coverage-real-use#12 | A11-031 (new) | fixed | accessibility.md:68 | |
| coverage-real-use#13 | A11-032 (new) | fixed | accessibility.md:69 | |
| coverage-real-use#14 | A11-033 (new) | adapted + xfile | accessibility.md:70; X7 | Added `remote: none` (the stage restarts the service), a byte-order account choice and a fallback page when no `app` page is browser-sampled. Stage shared with SEC-064 `lifetime` → X7. `notConfigured(security.session.idleVar)` kept: it is a signed-policy input the agent can't remove, as in SEC-064. |

## Ownership rows
```
PRV-038	*	WP-606	R08 new: third-country transfers and Art. 27 representatives (hosts[] country/transfer validation: WP-205)
PRV-039	*	WP-606	R08 new: right-of-withdrawal information
PRV-040	*	WP-606	R08 new: regulated-product disclosures (product-compliance.json loading/validation: WP-205)
PRV-041	*	WP-606	R08 new: marketing e-mail consent capture (part confirm uses flows WP-602, journey "subscribe")
PRV-042	*	WP-606	R08 new: user-content duties outside the EU (DMCA agent, TAKE IT DOWN, UK OSA)
A11-031	*	WP-605	R08 new: label in name + positive tabindex (WP-605(b))
A11-032	*	WP-605	R08 new: status messages (WP-605(b))
A11-033	*	WP-605	R08 new: timing adjustable; runs in SEC-064 lifetime idle stage (WP-607): WP-605 Depends needs WP-607, or move this row to WP-607
```
WP-606 goal text (BUILD_MAP, orchestrator): append "Also PRV-038..042 (transfers/representatives, withdrawal information, regulated products, marketing consent, US/UK user-content duties) and PRV-026 part `unit`." WP-605: "Also A11-031..033."

## Ruleset data
WP-104 bullet **Privacy** (new files): `transfer-adequacy.json`, `transfer-mechanism-phrases.json`, `withdrawal-info-phrases.json`, `unit-quantity-patterns.json`, `regulated-product-regimes.json`, `prop65-link-labels.json`, `marketing-signup-markers.json`, `marketing-consent-phrases.json`, `dmca-phrases.json`, `tida-phrases.json`, `osa-terms-phrases.json`.
WP-104 bullet **Privacy** (content changes to existing files): `privacy-notice-elements.json` `gdpr` gains group `transfers`; `market-signals.json` `commerce` gains `ca-pipeda → ca-consumer`; `required-legal-pages.json` requires `terms` for `us-ugc` and `uk-osa`; shapes now stated for `google-tags.json` (incl. `gcd` rows), `us-opt-out-states.json`, `rating-widget-markers.json`, `digital-product-types`.
WP-104 bullet **Accessibility**: `extend-session-labels.json`.
Operator data file (not ruleset; 03 § 14 via X5): `quality/data/product-compliance.json`.

## Policy keys added (key · type · default · file)
- `privacy.art27Exempt` · `{ "eu-gdpr"|"uk-gdpr": non-empty string }` · `{}` · privacy.md (validation CFG-006, privacy.md:65)
- `privacy.unitPriceExempt` · `[URL pattern]` · `[]` · privacy.md
- `privacy.doubleOptIn` · bool · `false` · privacy.md
- `privacy.marketingForms` · `[{ formKey, confirmation?: "provider", reason? }]` · `[]` · privacy.md (validation privacy.md:65)
- `privacy.ugc.primaryForum` · bool · `false` · privacy.md
- `privacy.legalPages.<key>.path` · type widened to `pattern | { "<locale>": pattern }` · no default (unchanged) · privacy.md
- removed: `privacy.consent.banner.settingsLabel`
- `privacy.jurisdictions` values: `ca-consumer`, `us-consumer`, `us-ca-prop65`, `ca-casl`, `au-spam`, `us-ugc`, `uk-osa`
- Non-policy fields requested through xfile: `hosts[].country`, `hosts[].transfer` (X3); `manufacturers[].pagePaths`, `legal.euRepresentative`, `legal.ukRepresentative`, `legal.dmcaAgent` (X4); `quality/data/product-compliance.json` (X5); flow `journey: "subscribe"` (X6).

## spec-lint
`node tools/trace/spec-lint.mjs` after my edits (other fixers' edits are in the same tree), last three lines:
```
spec-lint: {"requirements":575,"rules":556,"toolRequirements":19,"rulesWithParts":201,"errors":27,"warnings":64}
  errors by check: ownership=27
  warnings by check: ruleset-unsourced=64
```
Expected, from this pass: 8 `ownership` errors "has no owning work package" for PRV-038, PRV-039, PRV-040, PRV-041, PRV-042, A11-031, A11-032, A11-033 (rows above), and 23 `ruleset-unsourced` warnings for the 12 new ruleset files above (each is reported once or twice). The other 19 errors (AGT-011 part row; AEO-015, OPS-015/016, TPL-008, SE-010/011/115/129, SEC-076..079, UX-025..027, URL-015, MET-014, I18-011) and the other ruleset warnings come from other fixers' files. My files raise no `header`, `severity`, `channel`, `dangling`, `policy-key` or `ruleset-unnamed` diagnostics. I fixed 2 `ruleset-unnamed` warnings my own wording caused before taking this run.
