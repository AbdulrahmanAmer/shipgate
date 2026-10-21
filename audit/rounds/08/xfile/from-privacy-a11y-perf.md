# Cross-file requests — from privacy-a11y-perf — round 08 pass A

Each item: target file · location · exact edit · finding it serves. Rows that only restate an edit another fixer owns through its own Location are marked "(also in <file>'s own findings)" so the orchestrator can dedupe.

## X1 — spec/04-algorithms.md § 1.2 *Required-facts rules*, the "The same holds for …" sentence
Serves: consistency#79, concreteness#10, concreteness#11, consistency#38, consistency#40, consistency#80, coverage-real-use#2, #3, #8, #10, #11.
The privacy pack now names these operator-owned blocking outcomes; the 04 list must name them too. Replace the sentence (whatever its current text after other fixers' edits) so that it lists, in addition to what it already lists:
- PRV-016 (no `accountData`, or a missing `accountData` key, when a flow has `journey: "signup"`; part `export` with no stored row)
- PRV-021 part `flow` (no `journey: "withdrawal"` flow; a withdrawal flow with no `expectEmail` after the confirmation)
- PRV-022 (an undeclared required `legalPages` key; part `jp-sct` without `legalPages.commercialTransactions`)
- PRV-023 and PRV-027 (a checkout flow with no order request and no outcome step)
- PRV-033 part `in-ecommerce`, PRV-037 part `contact` and PRV-042 part `dmca-agent` (no identification page)
- PRV-037 (no `report-content` flow; no `privacy.dsa.ugcSelectors` with `eu-dsa`)
- PRV-038 parts `registry` and `representative`
- PRV-039 (neither `legalPages.returns` nor `legalPages.terms`)
- PRV-040 part `register`
- PRV-041 (part `wording` missing `business.json` values; part `confirm` without a `subscribe` flow)
- PRV-042 (no `privacy.dsa.ugcSelectors`; part `dmca-agent` without `legal.dmcaAgent`; part `uk-osa` without the `report-content` flow)

Proposed full text (if the sentence is still the round-07 one): "The same holds for the PRV-002/PRV-014 (`consent.banner`), PRV-016 (`accountData` and its keys with a signup flow; part `export` with no stored row), PRV-018 (`ai.assistants`), PRV-021 part `flow` (withdrawal flow and its `expectEmail`), PRV-022 (an undeclared required `legalPages` key; `jp-sct` without `commercialTransactions`), PRV-023/PRV-027 (a checkout flow with no order request and no outcome step), PRV-026 `total` (more than 16 fee entries), PRV-028 (including part `terms`), PRV-033 `in-ecommerce`, PRV-037 and PRV-042 (no identification page, no `dsa.ugcSelectors`, no `report-content` flow, no `legal.dmcaAgent`), PRV-038 `registry` and `representative`, PRV-039 (no withdrawal text page), PRV-040 `register` and PRV-041 (`business.json` values, `subscribe` flow) outcomes that their pack text says are owned by `operator`."

## X2 — spec/04-algorithms.md § 15 *Disclosure exemption*, item 5
Serves: concreteness#12.
Replace "that has a non-hidden control whose accessible name matches `carousel-controls.json`" with "that has a non-hidden control whose accessible name has a phrase match (accessibility § 1 *Phrase match*) in `carousel-controls.json`".
Note for the algorithms owner (not a requested edit): A11-021 `carousel` no longer depends on `aria-roledescription`/`carousel-markers.json` (concreteness#31, agent-written markers). Item 5 still keys the exemption on those markers; consider "an inactive slide of an auto-advancing region (A11-021 part `carousel` definition) or of a region matching …".

## X3 — spec/03-formats.md § 3.3 Host registry, Shape sentence
Serves: coverage-real-use#2 (PRV-038).
Replace "`{ host, purposes: string[] (≥ 1), server: false, browser: false, essential: false, name?: string }` (defaults shown). `name` is the vendor's display name as the privacy notice names it (PRV-031 `processors`); no default." with "`{ host, purposes: string[] (≥ 1), server: false, browser: false, essential: false, name?: string, country?: string, transfer?: \"adequacy\"|\"dpf\"|\"scc\"|\"bcr\"|\"derogation\" }` (defaults shown). `name` is the vendor's display name as the privacy notice names it (PRV-031 `processors`); no default. `country` (ISO 3166-1 alpha-2: where the vendor processes the data or is established) and `transfer` (the GDPR Chapter V transfer mechanism) are read by PRV-038; no default; another value is CFG-001."

## X4 — spec/03-formats.md § 14 *Business facts* shape and value formats
Serves: concreteness#14 (PRV-025 `pagePaths`), coverage-real-use#2 (PRV-038), coverage-real-use#11 (PRV-042).
- In the shape: replace "`manufacturers: [{ id, name, address, contact, country, euResponsible?: { name, address, contact } }]`" with "`manufacturers: [{ id, name, address, contact, country, euResponsible?: { name, address, contact }, pagePaths?: [pattern] }]`".
- In the shape, `legal: { … }`: after "`abn?`" insert ", `euRepresentative?: { name, address, email }`, `ukRepresentative?: { name, address, email }`, `dmcaAgent?: { name, address, email?, phone? }`".
- In the value formats, after "`legal.grievanceOfficer` needs `email` or `phone` (else CFG-001);" insert "`manufacturers[].pagePaths` URL patterns (§ 2.1; PRV-025); `legal.euRepresentative.address`, `legal.ukRepresentative.address` and `legal.dmcaAgent.address` have the `locations[].address` shape and `.email` is an email address (PRV-038, PRV-042); `legal.dmcaAgent` needs `email` or `phone`, `phone` E.164 (else CFG-001);".
- In the sentence "`postalAddress` has the same shape … (PRV-030)." append "; `legal.euRepresentative.address`, `legal.ukRepresentative.address` (PRV-038) and `legal.dmcaAgent.address` (PRV-042) likewise".

## X5 — spec/03-formats.md § 14, new item after *Image sources*
Serves: coverage-real-use#8 (PRV-040).
Insert: "- **Product compliance** — `quality/data/product-compliance.json` (Operator-owned, locked; an Operator-owned source, § 8): `{ formatVersion: 1, products: [{ match, regime: \"eu-energy-label\"|\"eu-food-info\"|\"us-ca-prop65\", values?, notRegulated? }] }`. `match`: a § 2.2 glob over the page path (no scheme, no query), or `sku:<glob>` against the JSON-LD `Product.sku`; per regime the first matching entry applies. `values` by regime: `eu-energy-label` `{ class, labelUrl, ficheUrl }` (`class` the energy class letter, the URLs absolute or root-relative); `eu-food-info` `{ ingredients, allergens, netQuantity, nutrition? }` (non-empty strings, written as the page must show them); `us-ca-prop65` `{ warning }` (the warning text). `notRegulated`: a non-empty reason that the product is outside the regime; an entry needs `values` or `notRegulated` (else CFG-001). PRV-040 reads it."

## X6 — spec/03-formats.md § 10 Flows, `journey` comment
Serves: coverage-real-use#10 (PRV-041 part `confirm`).
Replace "// login | logout | signup | checkout | contact | deletion | export | withdrawal | cancel | other (default other)" with "// login | logout | signup | checkout | contact | deletion | export | withdrawal | cancel | subscribe | other (default other); subscribe: PRV-041 `confirm`".

## X7 — spec/04-algorithms.md § 4.2 step 8, stage list
Serves: coverage-real-use#14 (A11-033).
Replace "SEC-064 `lifetime`," with "SEC-064 `lifetime` (its idle stage also runs A11-033 in the same restart),". Also, if the list enumerates G6 mutating flow parts by rule, add PRV-041 `confirm` and PRV-042 `uk-osa` next to PRV-037 `notice` (all three run Operator flows with `mutates: true`).

## X8 — spec/packs/ux.md:34 (UX-003 `phones`) and spec/packs/search-engines.md:130 (LOC-001 `phones`)
Serves: consistency#37 (also in ux.md's and search-engines.md's own findings; dedupe).
ux.md: replace "Part `phones`: a phone candidate's E.164 form equals a `phones[].e164` or `locations[].phone`." with "Part `phones`: a phone candidate's E.164 form equals a `phones[].e164`, `locations[].phone`, `legal.host.phone` or `legal.grievanceOfficer.phone` value (PRV-030 and PRV-033 require the last two on pages)."
search-engines.md: replace "or in a `tel:` link equals a `business.json` `phones[].e164` or `locations[].phone`." with "or in a `tel:` link equals a `business.json` `phones[].e164`, `locations[].phone`, `legal.host.phone` or `legal.grievanceOfficer.phone`."
(At HEAD the ux.md half is already applied by the ux fixer.) New in this pass, both files: PRV-042 `dmca-agent` requires `legal.dmcaAgent.phone`/`.email` on a page and PRV-038 `representative` requires `legal.euRepresentative.email` / `legal.ukRepresentative.email` on the privacy page, so a compliant page would otherwise get a P0 UX-003 `forbidden-value`:
- ux.md UX-003 part `phones`: replace "`legal.host.phone` or `legal.grievanceOfficer.phone` value (PRV-030 and PRV-033 require the last two on pages)" with "`legal.host.phone`, `legal.grievanceOfficer.phone` or `legal.dmcaAgent.phone` value (PRV-030, PRV-033 and PRV-042 require the last three on pages)".
- ux.md UX-003 emails: replace "`legal.dpo.email` or `legal.grievanceOfficer.email` value (PRV-025, PRV-033 and PRV-035 require those on pages)" with "`legal.dpo.email`, `legal.grievanceOfficer.email`, `legal.euRepresentative.email`, `legal.ukRepresentative.email` or `legal.dmcaAgent.email` value (PRV-025, PRV-033, PRV-035, PRV-038 and PRV-042 require those on pages)".
- search-engines.md LOC-001 `phones`: add `legal.dmcaAgent.phone` to the same list.

## X9 — spec/03-formats.md § 3.5 table, privacy row
Serves: coverage-real-use#11 (PRV-042) — no-default list unchanged; new privacy keys `art27Exempt` (`{}`), `unitPriceExempt` (`[]`), `doubleOptIn` (`false`), `marketingForms` (`[]`), `ugc.primaryForum` (`false`) all have the defaults shown in the pack block. No edit needed unless § 3.5 enumerates defaulted keys; listed for the orchestrator's key audit.
