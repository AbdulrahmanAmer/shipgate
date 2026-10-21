# Resolution — privacy-a11y-perf — pass A — round 06
| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-privacy-a11y-perf#1 | PRV-001..004, PRV-014 | fixed | privacy.md:49 | *Observation window* definition added as proposed; PRV-001/002/003/004/014 now read state "at the end of the observation window". |
| concreteness-privacy-a11y-perf#2 | PRV-001 | fixed | privacy.md:51, :57, :71 | *Essential cookie / storage entry* defined (exact or trailing-`*` prefix; includes `verifyEnv.auth.sessionCookies`); PRV-001 and PRV-015 use "non-essential". |
| concreteness-privacy-a11y-perf#3 | PRV-002, PRV-014 | adapted | privacy.md:17-18, :53, :58 | Definitions (first layer, label match, reachable, consent pages) put in § 1 so PRV-002/003/004/014 share them; labels accept `{ "<locale>": string }`; `consent.required: true` without `consent.banner` → blocking operator-owned `missing-element` naming `privacy.consent.banner` (PRV-002 and PRV-014). |
| concreteness-privacy-a11y-perf#4 | PRV-003 | fixed | privacy.md:59 | Withdrawal procedure via `reopenLabel` → `rejectLabel`; unknown hosts owned by PRV-005; part `server-side` unchanged. |
| concreteness-privacy-a11y-perf#5 | PRV-004 | fixed | privacy.md:60 | Fresh context, `Sec-GPC: 1` + `navigator.globalPrivacyControl` init script, after accept, two consent pages, `advertising`/`affiliate` hosts. |
| concreteness-privacy-a11y-perf#6 | PRV-007 | adapted | privacy.md:63 | As proposed, plus: probe load runs in an accepted-consent context (otherwise PRV-001 already blocks the requests and the probe is vacuous), and `&` when the URL already has a query. |
| concreteness-privacy-a11y-perf#7 | PRV-008 | fixed | privacy.md:64 | New ruleset `marketing-optin-labels.json` (see Ruleset data). |
| concreteness-privacy-a11y-perf#8 | PRV-010 | fixed | privacy.md:66 | Scope stated: requests recorded during flows and sampled-page loads; evidence shows URL and encoding. |
| concreteness-privacy-a11y-perf#9 | PRV-014 | adapted | privacy.md:53, :70 | "Sample order" is not defined in 04 § 10, so *consent pages* = first sampled public page by URL (lexicographic), then the next two in that order. |
| concreteness-privacy-a11y-perf#10 | PRV-016 | fixed + xfile | privacy.md:38, :72; xfile X2 | `exportFields[].keyColumn` added; export text extraction for download / ZIP / PDF; `expectEmail.attachment` needs 03 § 10 (X2). |
| concreteness-privacy-a11y-perf#11 | PRV-018 | fixed | privacy.md:74 | Sending, first reply, containment defined; added `missing-element` class for the disclosure check. |
| concreteness-privacy-a11y-perf#12 | PRV-022 | fixed + xfile | privacy.md:78, :83; xfile X5 | `imprint`/`controller` use `emails[]` and `postalAddress` (else first `locations[].address`); required-facts clause covers all five parts; 04 § 1.2 heading list → X5. |
| concreteness-privacy-a11y-perf#13 | PRV-022 | fixed | privacy.md:31, :45 | `legalPages.commercialTransactions` added to the policy block; "`legalPages` accepts exactly the keys shown; each value is `{ path, index }`". |
| concreteness-privacy-a11y-perf#14 | PRV-022 | fixed | privacy.md:80 | `sct-labels` shape and pass condition (NFKC, case-folded, `<main>` text). |
| concreteness-privacy-a11y-perf#15 | PRV-022 | fixed | privacy.md:81 | Start-of-text match, NFKC, whitespace removed, `-<digits>` suffix allowed, both clauses. |
| concreteness-privacy-a11y-perf#16 | PRV-025 | fixed + xfile | privacy.md:40, :95; xfile X1 | Digital exemption only via Operator-owned `privacy.digitalProductPaths` (no default); `digital-product-types` match without a path → blocking operator-owned `missing-element`; the `security.payments without physical items` escape removed. 03 § 3.5 "No default" cell → X1. |
| concreteness-privacy-a11y-perf#17 | PRV-025 | fixed + xfile | privacy.md:86, :90, :93; xfile X3 | Name normalisation, address/contact shapes and matching, product identifier properties, new part `facts` (P1 · data). 03 § 14 shape sentence → X3 (inserted as a sentence after the `postalAddress` note instead of inside the long code span). Also states the builder-owned `missing-element` for a shown value that differs or is absent (C6). |
| concreteness-privacy-a11y-perf#18 | PRV-026 | fixed | privacy.md:97 | Price scoping, fragment-link footnote, `vat-phrases` + `legalPages.shipping` or new ruleset `shipping-cost-phrases.json`; failure class stated. |
| concreteness-privacy-a11y-perf#19 | PRV-026 | adapted | privacy.md:98 | Extraction/units/missing-input outcomes as UX-015; per-item equality owned by UX-015. Adapted: "plus fees declared with `kind: fee`" made decidable as "plus some subset of the declared fee entries in the same currency" (≤ 16 per currency; more → operator-owned blocking `missing-element`). Reading it as "plus all declared fees" would fail every checkout with an optional fee; this is a clarification, not a weakening — an undeclared fee still fails. |
| concreteness-privacy-a11y-perf#20 | PRV-027 | fixed | privacy.md:100 | Phrase categories and `prices[]` entries named; order control = PRV-023's, not observed → `notConfigured` for that flow (same as PRV-023). |
| concreteness-privacy-a11y-perf#21 | PRV-028 | fixed | privacy.md:101 | Closest `<section>/<article>/<aside>/<dialog>/<main>` ancestor; no `legalPages.privacy` → operator-owned blocking `missing-element`. |
| concreteness-privacy-a11y-perf#22 | A11-001, A11-006 | adapted | accessibility.md:26, :32, :37, :34, :38 | axe `runOnly` tags stated; exclusion list as proposed plus `area-alt` (A11-007) and `select-name` (A11-003); A11-003 and A11-007 now state that they run the excluded axe rules (`label`/`select-name`, `button-name`/`link-name`, `role=img` names) so nothing is checked by nobody. A11-006 = axe `target-size`. |
| concreteness-privacy-a11y-perf#23 | A11-002 | fixed | accessibility.md:33 | Parts `landmarks`, `ids`, `nesting`; failure classes stated. |
| concreteness-privacy-a11y-perf#24 | A11-003 | fixed | accessibility.md:34 | Part `required` with new ruleset `required-labels.json`; native `invalid`-event validation passes the association/announcement checks. |
| concreteness-privacy-a11y-perf#25 | A11-004 | adapted | accessibility.md:24, :28, :35 | Interactive element and pixel threshold (≥ 16 per channel) defined in § 1. Adapted: interactive element excludes negative `tabindex`; press limit = max(500, 2 × interactive elements + 10) so a page with > 500 controls isn't a false trap. |
| concreteness-privacy-a11y-perf#26 | A11-007 | adapted | accessibility.md:38 | Element set, decorative marker, filename regex, `src` equality, `genericAltWords` locale fallback as proposed; plus `role=img` names and axe `button-name`/`link-name` (owned here after the A11-001 exclusion). |
| concreteness-privacy-a11y-perf#27 | A11-011 | fixed | accessibility.md:42 | Border-box test with explicit exception set; `budget-exceeded`. |
| concreteness-privacy-a11y-perf#28 | A11-012, A11-013 | fixed | accessibility.md:43, :44 | A11-012 viewports, `!important` injection, text container; A11-013 200 % zoom emulated as 640 × 400 at DPR 2. |
| concreteness-privacy-a11y-perf#29 | A11-014 | adapted | accessibility.md:45 | Parts `lock`, `landscape`; "no rotation component" made decidable: computed `transform` is `none` or a matrix with `b` = `c` = 0 (|x| < 0.001). |
| concreteness-privacy-a11y-perf#30 | A11-015 | fixed | accessibility.md:46 | 3 × 3 `elementFromPoint` grid after scroll-into-view; covering element fixed/sticky. |
| concreteness-privacy-a11y-perf#31 | A11-016 | adapted | accessibility.md:47 | Parts `paste`, `autocomplete`. Adapted: (a) a synthetic `ClipboardEvent` is untrusted and never inserts text in Chromium, so the proposed test would fail every input — replaced by real clipboard paste (`clipboard-read/write` granted, `ControlOrMeta+V`); (b) one-time-code input = the input a `totp` step locates (the proposed `inputmode`/`maxlength` heuristic was undecidable); (c) username/email token kept here for the identifier input that A11-022's map doesn't cover, so it isn't checked by nobody. |
| concreteness-privacy-a11y-perf#32 | A11-017 | fixed | accessibility.md:48 | Overflow definition shared with A11-011; 320 px overflow owned by A11-011; scroll into view before `elementFromPoint`. |
| concreteness-privacy-a11y-perf#33 | A11-021 | fixed | accessibility.md:52 | One W review item per `video`-purpose iframe. |
| concreteness-privacy-a11y-perf#34 | A11-026 | fixed | accessibility.md:57 | Discovery order and `skipped(size)` per URL. |
| concreteness-privacy-a11y-perf#35 | A11-029 | fixed | accessibility.md:60 | Hover set (≤ 50 per page, document order). |
| concreteness-privacy-a11y-perf#36 | PRF-001 | fixed + xfile | performance.md:28, :34; xfile X7 | Parts `lcp`, `cls`, `tbt`, `seo`; only `lcp`/`tbt` calibrated (Calibration paragraph updated); 01-core TR-111 list → X7. |
| concreteness-privacy-a11y-perf#37 | PRF-001, PRF-010 | fixed | performance.md:34, :43 | Script transfer removed from PRF-001; PRF-010 measure = gzip-9 of manifest-listed initial-load JS/CSS, route group max; growth names `scriptBytes`/`cssBytes` vs `_main/budgets.json`. |
| concreteness-privacy-a11y-perf#38 | PRF-002 | adapted + xfile | performance.md:35; xfile X6 | Measure, flow window and no throttling adopted. Not adopted: "flows without a `measure` step are not measured" — that deletes checks (the rule said "each declared flow"). Kept every flow (main Chromium run; A11-019 replays excluded; no interaction → pass); a `measure: "inp"` step only records an intermediate value (03 § 10 row → X6). |
| concreteness-privacy-a11y-perf#39 | PRF-003, PRF-015 | adapted | performance.md:36, :48, :59 | Modern format and viewport/DPR in § 3; PRF-003 `srcset`+`sizes`, non-image LCP → `notApplicable`; PRF-015 parts `oversize`, `srcset`, `format`. Added: SVG exempt; PRF-015 `srcset`/`format` exclude the LCP image (owned by PRF-003) so it isn't judged twice. |
| concreteness-privacy-a11y-perf#40 | PRF-004, PRF-003, PRF-007 | fixed | performance.md:36, :37, :40 | PRF-004 space-reservation test for video/iframe/embed/object; `unsized-images` and "ad slots" removed from PRF-004, `width`/`height` from PRF-003; PRF-007 owns every `<img>`'s dimension attributes. |
| concreteness-privacy-a11y-perf#41 | PRF-005 | adapted + xfile | performance.md:38; xfile X8 | Four parts as proposed; channel now `browser` (checks read loaded stylesheets). Adapted: font files on a `hosts[]` entry with purpose `assets` (the project's own asset CDN, 03 § 3.3) count as self-hosted. 02-adapters still lists PRF-005 as a template rule → X8. |
| concreteness-privacy-a11y-perf#42 | PRF-009 | fixed | performance.md:42 | Content-type set, ≥ 1,024 bytes floor, `Accept-Encoding: br, gzip`, `missing-header`. |
| concreteness-privacy-a11y-perf#43 | PRF-011 | fixed | performance.md:44 | GET operations of data-api `contracts`, `api.requests`/`api.concurrency`, 04 § 15 request generation, first account, p95 to last byte; mutating "load" stage; `remote: write`. |
| concreteness-privacy-a11y-perf#44 | PRF-012 | adapted | performance.md:20, :45 | List-page detector, `listMaxItems` (default 100), pagination signals, new ruleset `pagination-labels.json`; channel `html, browser` (app pages come from flows). Not adopted: the "fewer seeded rows → `skipped(small-data)`" clause — shipgate can't map a list to a seed table, and it would add a skip escape; the rule judges what is rendered. |
| concreteness-privacy-a11y-perf#45 | PRF-008 | fixed | performance.md:41 | `s-maxage` and missing `Cache-Control` handling. |
| concreteness-privacy-a11y-perf#46 | PRF-018 | fixed | performance.md:51 | Parts `unload`/`no-store` at P2, emitted instead of main when they are the only reason. |
| coverage-r05-carryover#3 | PRV-023, PRV-026 (`uk-consumer`) | fixed + xfile | privacy.md:15, :84, :97, :99; xfile X4 | New jurisdiction `uk-consumer`. PRV-023 applies with `uk-consumer` (CCR 2013 reg. 14(3)); PRV-026 `indication` applies with `uk-consumer` (Price Marking Order 2004); new part `drip` (P1 · browser; DMCC Act 2024 Part 4): a checkout total that only matches with a `feeType: "mandatory"` fee is a `value-mismatch`. `business.json` `prices[].feeType` (default `mandatory`, Operator-owned) → X4. |
| lint.json ruleset-unnamed privacy.md:13 | — | fixed | privacy.md:13 | `required-legal-pages.json` / `consent-models.json` now backticked. |
| lint.json ruleset-unnamed privacy.md:57 | PRV-011 | fixed | privacy.md:67 | "the `gcd` table of ruleset `google-tags.json`" (WP-104 already lists "`google-tags.json` plus the `gcd` decoding table"). |
| lint.json ruleset-unnamed performance.md:57 | — | fixed | performance.md:58 | Named `lighthouse-audit-renames.json` (see Ruleset data). |
| DECISIONS.md D-001..D-004 | — | rejected (not applicable) | — | D-001 (budget exhaustion, 04 § 8), D-002 (cache keys), D-003 (SEC-024 CSRF), D-004 (SEC-064 session lifetimes) touch no text in privacy, accessibility or performance; nothing to apply. |

## Ownership rows
All new parts are covered by the existing `*` rows (same WP); listed for the orchestrator's record — no new tsv rows are needed unless explicit part rows are wanted.
```
PRV-025	part:facts	WP-606	new part (business.json manufacturer facts, data channel)
PRV-026	part:drip	WP-606	new part (uk-consumer drip pricing)
PRF-001	part:lcp	WP-604	new part name
PRF-001	part:cls	WP-604	new part name
PRF-001	part:tbt	WP-604	new part name
PRF-001	part:seo	WP-604	new part name
PRF-005	part:self-hosted	WP-604	new part name; rule channel now browser (was ast, html)
PRF-005	part:families	WP-604	new part name
PRF-005	part:display	WP-604	new part name
PRF-005	part:external	WP-604	new part name
PRF-015	part:oversize	WP-604	new part name
PRF-015	part:srcset	WP-604	new part name
PRF-015	part:format	WP-604	new part name
A11-002	part:landmarks	WP-605	new part name
A11-002	part:ids	WP-605	new part name
A11-002	part:nesting	WP-605	new part name
A11-003	part:required	WP-605	new part
A11-014	part:lock	WP-605	new part name
A11-014	part:landscape	WP-605	new part name
A11-016	part:paste	WP-605	new part name
A11-016	part:autocomplete	WP-605	new part name
```
Channel changes (no tsv change needed; WP-604 already depends on WP-601): PRF-005 `ast, html` → `browser`; PRF-012 `http` → `html, browser`.

## Ruleset data
- `marketing-optin-labels.json` per locale (PRV-008) — WP-104 "Round-6 data".
- `shipping-cost-phrases.json` per locale (PRV-026 `indication`) — WP-104 "Round-6 data".
- `required-labels.json` per locale (A11-003 `required`) — WP-104 "Round-6 data".
- `pagination-labels.json` per locale (PRF-012) — WP-104 "Round-6 data".
- `lighthouse-audit-renames.json` — this is the existing WP-104 "Code and tooling" item "the Lighthouse audit-ID rename map"; please name the file there.
- No change, note only: `order-button-labels.json` and `vat-phrases` `en` lists must include UK wording ("Order with obligation to pay", "inc. VAT", "including VAT") now that `uk-consumer` uses them.

## Policy keys added (key · type · default · file)
- `privacy.jurisdictions` value `uk-consumer` · enum value · — · privacy.md
- `privacy.consent.banner.*Label` · string \| `{ "<locale>": string }` (type widened) · no default (as before) · privacy.md
- `privacy.legalPages.commercialTransactions` · `{ path, index }` · no default (as `legalPages`) · privacy.md
- `privacy.accountData.exportFields[].keyColumn` · string · no default (as `accountData`) · privacy.md
- `privacy.digitalProductPaths` · [URL pattern] · no default (03 § 3.5 cell: xfile X1) · privacy.md
- `performance.listMaxItems` · integer · 100 · performance.md
- `business.json` `prices[].feeType` · `"mandatory"|"delivery"|"optional"` · `mandatory` · 03-formats.md § 14 (xfile X4)
- flow step `expectEmail.attachment` · bool · false · 03-formats.md § 10 (xfile X2)

## spec-lint (last three lines, after my edits)
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":132,"errors":6,"warnings":57}
  errors by check: dangling=1 ownership=5
  warnings by check: ruleset-unsourced=50 ruleset-unnamed=3 channel-infra=4
```
None of the 6 errors is in my files. They come from other fixers' edits in progress: `TCL-004` dangling (04-algorithms.md:387); `AGT-006 channel:html`; and no-owner errors for `REF-014`, `SEC-067`, `UX-022`, `CQ-010`, which are new IDs waiting for ownership rows. Lint lists no error and no `ruleset-unnamed` warning for privacy/accessibility/performance (all three round-6 lint warnings for these files are cleared). What remains for my files are the expected `ruleset-unsourced` warnings for the five new ruleset files above, until the orchestrator adds them to WP-104.
