# Resolution — privacy-a11y-perf — pass A — round 07
| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-privacy-a11y-perf#1 | PRV-025, PRV-026 | adapted | privacy.md:65, :108, :119 | *Product page* defined in § 1 as proposed (markup or *Price* + add-to-cart/order control; removing markup doesn't remove scope). PRV-025 and PRV-026 `indication` use it; `indication` text as proposed, restructured into "indicated prices". Adapted: a product page with neither `manufacturer.name` nor `brand.name` (e.g. JSON-LD stripped) is now a **builder-owned** blocking `missing-element`, not operator-owned — the Operator cannot add a name to a page, so an operator handoff there was a dead end; a name matching no entry stays operator-owned (round-6 decision kept). A page with no `Product` JSON-LD also fails the identifier bullet (builder-owned). `add-to-cart-labels.json` → Ruleset data. |
| concreteness-privacy-a11y-perf#2 | PRV-001/002/003/007/014 | fixed | privacy.md:59, :79-82, :85 | *Third-party host* defined; "a third-party host without `essential: true`" in PRV-001/002/003/007. PRV-014 never contained the phrase (it defers to PRV-001/003). |
| concreteness-privacy-a11y-perf#3 | PRV-001..004, 011, 014 | adapted | privacy.md:23, :55, :71 | Merged with consistency#34 (they conflict on PRV-001). *Consent not required* paragraph: `false` is valid only when `consent-models.json` gives every declared jurisdiction `opt-out` (Validation paragraph → CFG-006 `schema-violation`); then PRV-001/002/003/011/014 are `notApplicable`, PRV-004 runs without the accept step, PRV-007/PRV-015 use a fresh context, PRV-013 and the rest unchanged. Not adopted: "PRV-001 applies unchanged" — it would fail every opt-out-only (e.g. US) site that runs analytics, making `false` meaningless; the opt-out validation keeps EU/opt-in sites from using it, and the key is Operator-signed. |
| concreteness-privacy-a11y-perf#4 | PRV-002/003/004/014 | fixed | privacy.md:75 | Fewer than 3 sampled public pages → repeat the last page; none → `notApplicable`. |
| concreteness-privacy-a11y-perf#5 | PRV-003 | fixed | privacy.md:81 | `server-side` window = first navigation of the context until 5 s after its last observation window; class `forbidden-value` with host, method, path. Also marked "exclusive stage, 04 § 4.2 step 8" (consistency#38). |
| concreteness-privacy-a11y-perf#6 | PRV-011 | fixed | privacy.md:89 | `advanced`/`basic` split, contexts and classes as proposed. |
| concreteness-privacy-a11y-perf#7 | PRV-015 | fixed | privacy.md:93 | PRV-014 accept context after its three windows and the reload. |
| concreteness-privacy-a11y-perf#8 | PRV-018 | xfile | privacy.md:96; xfile X1 | "(mutating stage, 04 § 4.2 step 8; `remote: write`)" appended; 04 § 4.2 step 8 list edit requested (X1). |
| concreteness-privacy-a11y-perf#9 | PRV-018 | fixed | privacy.md:96 | `ai` + `browser: true` host with empty `ai.assistants` → one blocking operator-owned `missing-element` naming `privacy.ai.assistants`. |
| concreteness-privacy-a11y-perf#10 | PRV-019 | fixed | privacy.md:97 | `expectEgress` step exemption added as proposed. |
| concreteness-privacy-a11y-perf#11 | PRV-022 | fixed | privacy.md:63, :100-104 | *Fact containment* defined in § 1 (also covers `cnpj`, `abn`, slashes removed, for the new rules); parts `imprint`, `controller`, `kr-ecommerce`, `jp-sct` say "(fact containment)"; "each of `legal.registerNumber` and `legal.vatId` that is declared". |
| concreteness-privacy-a11y-perf#12 | PRV-022 | fixed | privacy.md:100 | `required-legal-pages.json` shape appended as proposed; undeclared required key = operator-owned `missing-element` naming `privacy.legalPages.<key>`. |
| concreteness-privacy-a11y-perf#13 | PRV-025 | fixed | privacy.md:108, :113 | `manufacturer.name`-then-`brand.name` rule and the safety-info link/heading test as proposed. |
| concreteness-privacy-a11y-perf#14 | PRV-027 | fixed | privacy.md:122 | Renewal-consent checkbox detector via `renewal-terms-phrases` `consent` list; shape stated; class `forbidden-value`. |
| concreteness-privacy-a11y-perf#15 | PRV-028 | fixed | privacy.md:123 | Pages in scope, personal-data field token list, jurisdiction-independence and login-form exclusion as proposed. |
| concreteness-privacy-a11y-perf#16 | PRV-026 | fixed | privacy.md:119 | Covered by #1's text ("… judged by SCH-006 and skipped by this part"). |
| concreteness-privacy-a11y-perf#17 | PRV-003..027 | fixed | privacy.md:81-123 | Classes added to PRV-005, 006, 012, 013, 014, 015, 017, 019, 020, 021, 022, 023, 024, 027 (PRV-003 via #5; PRV-004 `required` → `value-mismatch`; PRV-011 via #6). PRV-017's "page absent" class now belongs to PRV-022 (consistency#37). |
| concreteness-privacy-a11y-perf#18 | A11-003 | fixed | accessibility.md:38 | Error element / announced test as proposed. |
| concreteness-privacy-a11y-perf#19 | A11-004 | fixed | accessibility.md:28 | Radio group = one element for the Tab walk. |
| concreteness-privacy-a11y-perf#20 | A11-005, A11-009 | fixed | accessibility.md:40, :44 | `color-contrast` with blocking impacts; `incomplete` nodes W; 1.4.11 moved to A11-009 review. |
| concreteness-privacy-a11y-perf#21 | A11-007 | fixed | accessibility.md:42 | `alt=""` decorative only on `<img>`; `input[type=image]`/`area[href]` need a non-empty name. |
| concreteness-privacy-a11y-perf#22 | A11-012, A11-013 | fixed | accessibility.md:47-48 | Baseline + 1 px tolerance, hidden containers excluded, `aria-expanded`/`aria-controls` expand control. A11-013 states its baseline (1280 × 800, DPR 1). |
| concreteness-privacy-a11y-perf#23 | A11-011 | fixed | accessibility.md:46 | Hidden or `position: fixed` elements excepted. |
| concreteness-privacy-a11y-perf#24 | A11-022 | fixed | accessibility.md:30, :57 | `autocomplete-map.json` shape and match order as proposed; *Phrase match* defined in § 1. |
| concreteness-privacy-a11y-perf#25 | A11-016, A11-022 | fixed | accessibility.md:57 | Merged with consistency#40: an `email`- or `text`-typed input before the first password input also accepts `username`. |
| concreteness-privacy-a11y-perf#26 | A11-017 | fixed | accessibility.md:52 | "Covered" excludes the element, its descendants/ancestors and its `<label>`. |
| concreteness-privacy-a11y-perf#27 | A11-029 | fixed | accessibility.md:64 | Hidden → not hidden per 04 § 15, judged before and 100 ms after. |
| concreteness-privacy-a11y-perf#28 | § 1 `viewports` | fixed | accessibility.md:13 | Height 800, DPR 1, no touch. |
| concreteness-privacy-a11y-perf#29 | A11-001..029 | fixed | accessibility.md:32, :36-64 | *Axe findings* paragraph (A11-001, A11-003 labels, A11-006: `forbidden-value` + rule id + selector); classes appended per rule as listed. |
| concreteness-privacy-a11y-perf#30 | PRF-001 | adapted | performance.md:34 | Merged with consistency#134 (conflicting audit lists). Part `seo` = weighted score over SEO-category audits other than `document-title`, `meta-description`, `http-status-code`, `is-crawlable`, `robots-txt`, `canonical`, `hreflang`, `link-text`, `crawlable-anchors`, `image-alt` (all owned by web-delivery/search-engines/A11 rules: e.g. IDX-001/004, URL-001, LNK-002, A11-007); none left in the pinned Lighthouse → part `notApplicable`. #134's claim that `is-crawlable`/`http-status-code` are unowned is wrong (IDX-001, IDX-004, LNK-002 own them). |
| concreteness-privacy-a11y-perf#31 | PRF-003 | fixed | performance.md:36 | Parts `discovery`, `srcset`, `format` with per-image-type `notApplicable`; classes stated. |
| concreteness-privacy-a11y-perf#32 | PRF-004 | fixed | performance.md:37 | Declared (`style` or CSSOM) width/height instead of computed; `cls-culprits-insight` failure → `budget-exceeded`. |
| concreteness-privacy-a11y-perf#33 | PRF-006 | fixed | performance.md:39 | Sum of `mainThreadTime` over non-first-party entity rows; `budget-exceeded`. |
| concreteness-privacy-a11y-perf#34 | PRF-008 | fixed | performance.md:41 | Directive-set test; `header-value` / `missing-header`. |
| concreteness-privacy-a11y-perf#35 | PRF-016 | fixed | performance.md:49 | Browser sample per 04 § 10; class added. |
| concreteness-privacy-a11y-perf#36 | § 1 `lighthouse` | fixed | performance.md:17 | Preset enum and viewport/DPR defined. |
| concreteness-privacy-a11y-perf#37 | PRF-018 | fixed | performance.md:51 | First same-origin non-self, non-fragment link, then back; class added. |
| concreteness-privacy-a11y-perf#38 | PRF-011 | fixed | performance.md:44 | No GET operation → `notApplicable`; no accounts → `notConfigured(verifyEnv.auth.accounts)` (Operator-owned `verify.env`, not agent-escapable). |
| concreteness-privacy-a11y-perf#39 | PRF-003/006/015/017/018 | fixed | performance.md:36, :39, :48, :50-52 | PRF-006 `budget-exceeded`; PRF-015 per part (`oversize` budget-exceeded, `srcset` missing-element, `format` forbidden-value); PRF-017 `forbidden-value` with selector; PRF-018 `forbidden-value` with reasons; PRF-019 `budget-exceeded` also stated. |
| consistency#18 | PRF-011 | rejected (orchestrator's) | — | Fix targets `trace/ownership.tsv` and BUILD_MAP WP-604/WP-701 only; per brief those are the orchestrator's. No performance.md text change needed. |
| consistency#29 | PRV-022/025 ↔ LOC-001 | xfile | xfile X9 | LOC-001 must accept `postalAddress`, `legal.registeredOffice`, `legal.host.address`, manufacturer and EU-responsible addresses (extended for PRV-030). |
| consistency#30 | PRV-025 ↔ UX-003 | xfile | xfile X10 | UX-003 email/phone exemptions, extended to the new DPO/grievance emails and register numbers. |
| consistency#31 | PRV-025 | fixed | privacy.md:115 | "A field for which the matched entry has no value is not evaluated on the page; only part `facts` (operator-owned) reports it." |
| consistency#32 | 04 § 1.2 list | xfile | xfile X2 | Required-facts list edit incl. `phones`, `name`/`legalName`, PRV-002/014/018/026/028 operator-owned outcomes and the new rules. |
| consistency#33 | PRV-018 ↔ 04 § 4.6 | fixed | privacy.md:96 | 04 § 4.6/§ 6.1 already stub model-provider hosts in every stage (applied by the algorithms fixer, verified at 04:222 and § 6.1); PRV-018 now cites "model-provider hosts are stubbed, 04 § 4.6". |
| consistency#34 | privacy § 1 `consent.required` | adapted | privacy.md:55, :71 | See concreteness#3. Adopted the `consent-models.json` opt-out validation (as CFG-006 pack Validation, the mechanism 01 CFG-006 defines for pack cross-checks, instead of CFG-001) and the not-applicable set. Kept PRV-007 running (in a fresh context): PII in third-party URLs is a leak under any consent model; #34 listed it among the switched-off rules. |
| consistency#35 | PRV-026 | fixed | privacy.md:120 | "no extractable amount → no finding from this part (UX-015 reports it)". |
| consistency#36 | `uk-consumer` scope (05:99) | xfile | xfile X8 | 05 wording edit requested (adds `br-consumer`/`au-consumer`/`in-ecommerce`). privacy.md already scopes `uk-consumer` to PRV-023/026. |
| consistency#37 | PRV-017 | fixed | privacy.md:95 | First sentence states PRV-022/PRV-006 own declaration, existence and footer link; PRV-017 reports none of them. Channels now `cfg, html`. |
| consistency#38 | PRV-003 ↔ 04 § 4.2 | fixed | privacy.md:81 | 04 § 4.2 step 8 already lists "PRV-003 `server-side` (exclusive stage …)" (other fixer, verified at 04:201); PRV-003 `server-side` now cites it. |
| consistency#39 | A11-026 | fixed | accessibility.md:61 | > 20 MB → `budget-exceeded`; PDFs beyond `maxFiles` → one W item. |
| consistency#40 | A11-016 ↔ A11-022 | fixed | accessibility.md:57 | See concreteness#25. |
| consistency#132 | perf calibration | fixed | performance.md:28, :60 | Calibration at "the first of G4 and G6 that runs"; `minBenchmarkIndex` default 1000 also without the pack. 04 § 6.3 and CRW-001 already carry the same text (other fixers, verified 04:255, programmatic.md:237). |
| consistency#134 | PRF-001 `seo` | adapted | performance.md:34 | See concreteness#30. |
| coverage-real-use#1 | PRV-029 (new) | adapted | privacy.md:21, :124; xfile X3, X6 | Added. Signals split into Operator-owned (policy `locales`, `business.json` currencies/countries/VAT prefix, merchant-feed shipping countries, origin ccTLDs → operator-owned required-facts `missing-element`) and builder-written (`lang`/hreflang/sitemap alternates, JSON-LD currency/shipping/areaServed → builder-owned facts-oracle `forbidden-value`), replacing the proposal's ambiguous ownership sentence. `market-signals.json` shape defined; `jurisdictionsNotTargeted` policy key; `brief` (TR-112) mention dropped (not in my files). |
| coverage-real-use#2 | PRV-030 (new) | adapted | privacy.md:67, :125; xfile X4, X9 | Added with parts `link`, `content`, `country`; with `de`/`at` part `content` is owned by PRV-022 `imprint` (no double report); `provider-id-by-country.json` shape with `placeNames`; new `legal` keys via X4. |
| coverage-real-use#5 | PRV-031 (new) | adapted | privacy.md:126, :87; xfile X5 | Added (`processors`, `elements`). Unnamed fired host → operator-owned `missing-element` (not CFG-006, which can't know what fired). PRV-009's processor clause removed and pointed here. `purpose-phrases.json` and `privacy-notice-elements.json` (one file with `gdpr`/`ccpa`/`dpdp`/`app` sets, absorbing the proposed `au-privacy-elements.json`). |
| coverage-real-use#6 | PRV-032 (new) | adapted | privacy.md:48, :127 | Added. Adapted: SMS forms also come from Operator-owned `privacy.smsForms` (form keys), so removing the "text me" wording cannot remove a form from scope (C10). Item (c) "not satisfiable without the box" dropped as undecidable without a submit probe; the separate unchecked checkbox in (a) carries the requirement. |
| coverage-real-use#7 | PRV-033 (new) | fixed | privacy.md:128 | Added; `in-dpdp` part dated via the expiry clock (01 § 5.4), `notApplicable` before 2027-05-13 (UX-013 `green` convention instead of the proposed `skipped(not-yet-active)`, which 04 § 1.2 doesn't allow). `legal.grievanceOfficer` via X4. |
| coverage-real-use#8 | PRV-034 (new) + PRV-026 | fixed | privacy.md:119, :121, :129 | PRV-034 parts `privacy-policy`, `abn`; PRV-026 `indication` with `au-consumer` (GST phrases in `vat-phrases`), `drip` with `au-consumer` from 2027-07-01 on the expiry clock. PRV-027 already applies in every jurisdiction (no amendment needed; noted in its text). |
| coverage-real-use#9 | PRV-035 (new) | fixed | privacy.md:130; xfile X1, X4 | Parts `identity`, `regret` (runs PRV-021 parts with `br-consumer`), `dpo`. "or every checkout page" alternative dropped (header/footer only) for one decidable location. |
| coverage-real-use#11 | PRV-036 (new) | fixed | privacy.md:131 | Parts `cmp`, `string`; `tcf-ad-vendors.json` (`host`, `gvlVendorId`) and `google-certified-cmps.json` shapes defined. |
| coverage-real-use#12 | PRV-028 part `terms` | fixed | privacy.md:123 | Added; "adjacent to the submit control" made decidable (submit's parent or its previous/next sibling). |
| coverage-real-use#13 | PRV-017 part `statement` | fixed | privacy.md:95 | Added with `a11y-statement-phrases.json` shape. |
| coverage-real-use#14 | A11-030 (new) | adapted | accessibility.md:65 | Added. "View" defined; also excludes `cc-number` and `cc-exp` besides `cc-csc` (WCAG 3.3.7 security exception for re-entered payment data). |
| coverage-real-use#19 | PRV-037 (new) | adapted | privacy.md:49, :132; xfile X7 | Added. User-content selectors are `privacy.dsa.ugcSelectors` (no default; `search-engines.ugcSelectors` selects links, not regions). Missing `report-content` flow → operator-owned `missing-element` (flows are Operator-owned). |
| coverage-visibility (all rows) | — | — | — | No gap in coverage-visibility.md names the privacy, accessibility or performance pack; no row for this group. No gap in either coverage file is marked "statute unconfirmed", so no rule was added at W for that reason. |

Notes
- coverage-real-use#10 (I18-010) is the web-delivery group's; privacy.md § 1 now documents the `ca-qc` jurisdiction value it keys on (xfile X11 informational).
- `spec/CHANGES.md` entries for these fixes are not written here (file outside my set); the orchestrator records round-07 outcomes.

## Ownership rows
```
PRV-029	*	WP-606	new rule (market signals vs declared jurisdictions; ruleset market-signals.json)
PRV-030	*	WP-606	new rule (provider identification; WP-606(c))
PRV-031	*	WP-606	new rule (privacy notice content)
PRV-032	*	WP-606	new rule (TCPA SMS consent)
PRV-033	*	WP-606	new rule (India)
PRV-034	*	WP-606	new rule (Australia)
PRV-035	*	WP-606	new rule (Brazil; part regret reuses PRV-021 flow machinery)
PRV-036	*	WP-606	new rule (IAB TCF; WP-606(b))
PRV-037	*	WP-606	new rule (EU DSA)
A11-030	*	WP-605	new rule (3.3.7 redundant entry; WP-605(b))
```
New parts covered by existing `*` rows (listed for the record): `PRV-017 part:statement`, `PRV-028 part:terms`, `PRF-003 part:discovery|srcset|format`. WP-606 goal text should gain "PRV-029..037" and WP-605(b) "A11-030" (BUILD_MAP, orchestrator).

## Ruleset data
All WP-104 "Round-7 data":
- `add-to-cart-labels.json` per locale (privacy § 1 *Product page*)
- `consent-models.json` — content shape now stated `{ "<jurisdiction>": "opt-in" | "opt-out" }`, entries for every jurisdiction value incl. the new ones (already listed, Round-4)
- `renewal-terms-phrases` gains the `consent` list (PRV-027)
- `required-legal-pages.json` shape stated (PRV-022); add entries for `au-privacy`, `in-dpdp` → `privacy`, `eu-dsa` → `terms`
- `vat-phrases` gains GST phrases (PRV-026 `au-consumer`)
- `withdrawal-labels.json`, `withdrawal-confirm-labels.json` gain pt-BR entries (PRV-035 `regret`)
- `autocomplete-map.json` shape stated (A11-022; already listed)
- `a11y-statement-phrases.json` per locale (PRV-017 `statement`)
- `terms-acceptance-phrases.json` per locale (PRV-028 `terms`)
- `market-signals.json` (PRV-029)
- `provider-id-by-country.json` (PRV-030)
- `purpose-phrases.json` per locale, `privacy-notice-elements.json` per locale (PRV-031, PRV-033, PRV-034)
- `sms-markers.json`, `sms-consent-phrases.json` per locale (PRV-032)
- `country-of-origin-labels.json` per locale (PRV-033)
- `tcf-ad-vendors.json`, `google-certified-cmps.json` (PRV-036)
- `dsa-contact-phrases.json`, `report-content-labels.json`, `dsa-terms-phrases.json` per locale (PRV-037)
- `same-as-labels.json` per locale (A11-030)

## Policy keys added (key · type · default · file)
- `privacy.jurisdictions` values `in-ecommerce`, `in-dpdp`, `au-consumer`, `au-privacy`, `br-consumer`, `us-tcpa`, `eu-dsa`, `ca-qc` · enum values · — · privacy.md
- `privacy.jurisdictionsNotTargeted` · `[{ jurisdiction, reason }]` · `[]` · privacy.md
- `privacy.smsForms` · form-key string[] · `[]` · privacy.md
- `privacy.dsa.ugcSelectors` · selector[] · no default · privacy.md (03 § 3.5 row via X7)
- `hosts[].name` · string · none · 03 § 3.3 (X5)
- `business.json` `legal.registeredOffice`, `registerCountry`, `host`, `publicationDirector`, `cnpj`, `grievanceOfficer`, `dpo`, `abn` · see X4 · optional · 03 § 14 (X4)
- `accessibility.viewports` · comment only (height 800, DPR 1) · unchanged · accessibility.md
- `performance.lighthouse.preset` · `"mobile" | "desktop"` (enum now stated) · `"mobile"` · performance.md

## spec-lint (last three lines, after my edits)
```
spec-lint: {"requirements":546,"rules":527,"toolRequirements":19,"rulesWithParts":172,"errors":28,"warnings":64}
  errors by check: dangling=2 ownership=20 channel-infra=6
  warnings by check: ruleset-unsourced=61 ruleset-unnamed=3
```
Errors from my files (expected, ownership rows above not yet added): `[ownership]` A11-030, PRV-029, PRV-030, PRV-031, PRV-032, PRV-033, PRV-034, PRV-035, PRV-036, PRV-037 have no owning work package (10). Warnings from my files: `ruleset-unsourced` for the Round-7 files listed above (35 lines). All other errors/warnings (dangling I18-010 etc., channel-infra, other packs' new rules) come from files edited in parallel by other fixers. No `ruleset-unnamed` warning remains in my files.
