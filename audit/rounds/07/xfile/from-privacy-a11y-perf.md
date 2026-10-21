# Cross-file requests — from privacy-a11y-perf — round 07 pass A

Each request: target file · location · exact edit · finding it serves. Requests marked "(check first)" may already have been applied by the fixer that owns the target file; apply only the part that is missing.

## X1 — spec/04-algorithms.md § 4.2 step 8 (G6 mutating-flow stage list)
Old: `PRV-021 withdrawal flows; A11-028 `on-input``
New: `PRV-021 withdrawal flows (and PRV-035 `regret`, which runs them with `br-consumer`); PRV-018 assistant messages; A11-028 `on-input``
Serves: concreteness-privacy-a11y-perf#8 (PRV-018 sends a message = write; privacy.md PRV-018 now ends "(mutating stage, 04 § 4.2 step 8; `remote: write`)"); coverage-real-use#9 (PRV-035 `regret`).
Already applied by another fixer (verified in 04 at the time of writing): consistency#38 (PRV-003 `server-side` exclusive stage), consistency#33 (model-provider hosts stubbed in every stage, 04 § 4.6 / § 6.1), consistency#132 (04 § 6.3 "first of G4 and G6 that runs"; CRW-001 default `minBenchmarkIndex`).

## X2 — spec/04-algorithms.md § 1.2, required-facts list (line starting "**Required-facts rules (")
Old: `Required-facts rules (PRV-022 parts `imprint`, `controller`, `kr-ecommerce`, `jp-sct`, `cn-icp`; PRV-025; UX-015 when a provider price id is sent and the `prices[]` entry has no `providerId`; UX-022 launch-form confirmations; LOC-003 for `project.kinds` including `local-business`)`
New: `Required-facts rules (PRV-022 parts `imprint`, `controller`, `kr-ecommerce`, `jp-sct`, `cn-icp`; PRV-025; PRV-029 Operator-owned market signals; PRV-030; PRV-031 `processors` (`hosts[].name`); PRV-033; PRV-034 `abn`; PRV-035; PRV-002/PRV-014 (`consent.banner`), PRV-018 (`ai.assistants`), PRV-026 `total` (> 16 fees), PRV-028 and its part `terms` (`legalPages.privacy`, `legalPages.terms`) where they say "owned by `operator`"; UX-015 when a provider price id is sent and the `prices[]` entry has no `providerId`; UX-022 launch-form confirmations; LOC-003 for `project.kinds` including `local-business`)`
And in the same paragraph, old: `a missing `legal`, `legalName`, `postalAddress` or `emails` value`
New: `a missing `legal`, `phones`, `postalAddress` or `emails` value, `name` and `legalName` both absent`
Serves: consistency#32; coverage-real-use cross-cutting edit (04 § 1.2) for PRV-029/030/033/035 and PRV-028 `terms`.

## X3 — spec/04-algorithms.md § 1.2, facts-oracle list (line starting "**Facts-oracle rules (")
Old: `Facts-oracle rules (UX-003, UX-013, UX-014, UX-019, UX-020 `social-proof`, `stock` and `timer`, LOC-001 `address` and `hours`)`
New: `Facts-oracle rules (UX-003, UX-013, UX-014, UX-019, UX-020 `social-proof`, `stock` and `timer`, LOC-001 `address` and `hours`, PRV-029 builder-written market signals)`
Serves: coverage-real-use#1 (PRV-029: a market targeted only by builder-written markup is a builder-owned `forbidden-value`).

## X4 — spec/03-formats.md § 14 Business facts (inside the `business.json` shape)
Old: `legal: { registerNumber?, vatId?, representative?, mailOrderNumber?, icpNumber?, psbNumber? }`
New: `legal: { registerNumber?, vatId?, representative?, mailOrderNumber?, icpNumber?, psbNumber?, registeredOffice?, registerCountry?, host?: { name, address, phone }, publicationDirector?, cnpj?, grievanceOfficer?: { name, designation, email?, phone? }, dpo?: { name?, email }, abn? }`
And append to the "Value formats" sentence list: "`legal.registeredOffice` and `legal.host.address` have the `locations[].address` shape; `legal.registerCountry` is ISO 3166-1 alpha-2 or an ISO 3166-2 subdivision code (e.g. `GB-ENG`); `legal.host.phone` and `legal.grievanceOfficer.phone` are E.164; `legal.grievanceOfficer` needs `email` or `phone` (else CFG-001); `legal.dpo.email` and `legal.grievanceOfficer.email` are email addresses (PRV-030, PRV-033, PRV-034, PRV-035)."
Serves: coverage-real-use#2 (PRV-030), #7 (PRV-033), #8 (PRV-034), #9 (PRV-035).

## X5 — spec/03-formats.md § 3.3 `hosts[]` registry shape
Old: `{ host, purposes: string[] (≥ 1), server: false, browser: false, essential: false }`
New: `{ host, purposes: string[] (≥ 1), server: false, browser: false, essential: false, name?: string }`
And append after the shape sentence: "`name` is the vendor's display name as the privacy notice names it (PRV-031); no default."
Serves: coverage-real-use#5 (PRV-031 `processors`).

## X6 — spec/03-formats.md § 14 Merchant feed (fields read)
Old: `Fields read: `id`, `link`, `price`, `sale_price`, `sale_price_effective_date` (ISO 8601 interval `start/end`), `availability`, `gtin`, `item_group_id` (SE-113).`
New: `Fields read: `id`, `link`, `price`, `sale_price`, `sale_price_effective_date` (ISO 8601 interval `start/end`), `availability`, `gtin`, `item_group_id` (SE-113), and the `country` of each `shipping` value (`g:shipping/g:country` in XML; the first `:`-separated field of the TSV `shipping` column) (PRV-029).`
Serves: coverage-real-use#1 (PRV-029 Operator-owned shipping-country signal).

## X7 — spec/03-formats.md § 3.5 pack keys table, `privacy` row ("No default" column)
Old: `| privacy | `jurisdictions` | `legalPages`, `consent.banner`, `ccpa.gpcIndicator`, `accountData`, `audience.ageGate`, `digitalProductPaths` |`
New: `| privacy | `jurisdictions` | `legalPages`, `consent.banner`, `ccpa.gpcIndicator`, `accountData`, `audience.ageGate`, `digitalProductPaths`, `dsa.ugcSelectors` |`
Serves: coverage-real-use#19 (PRV-037 `notice` reads `privacy.dsa.ugcSelectors`, no default).

## X8 — spec/05-integrations.md § 2.1 init kinds table, `ecommerce` row (check first)
Old: `privacy `jurisdictions` + `eu-consumer` when an EU jurisdiction is chosen, + `uk-consumer` when the UK is chosen (withdrawal function, order-button wording)`
New: `privacy `jurisdictions` + `eu-consumer` when an EU jurisdiction is chosen, + `uk-consumer` when the UK is chosen (order-button wording, price indication, drip pricing), + `br-consumer`, `au-consumer` or `in-ecommerce` when Brazil, Australia or India is chosen (PRV-035, PRV-034/PRV-026, PRV-033)`
Serves: consistency#36; coverage-real-use#7, #8, #9.

## X9 — spec/packs/search-engines.md LOC-001 part `address` (check first)
Insert at the end of part `address`: "A candidate also passes when it contains the `street`, `locality` and `postalCode` of `business.json` `postalAddress`, `legal.registeredOffice`, `legal.host.address`, a `manufacturers[].address` or a `manufacturers[].euResponsible.address`; with an empty `locations`, the `forbidden-value` finding is raised only for a candidate matching none of these."
Serves: consistency#29 (PRV-022 `imprint`/`kr-ecommerce`/`jp-sct`, PRV-025, and now PRV-030 `content`/`country` require these addresses on pages).

## X10 — spec/packs/ux.md UX-003 (check first)
Replace "Email addresses ∈ `emails`" with "Email addresses ∈ `emails` or equal to a `manufacturers[].contact`, `manufacturers[].euResponsible.contact`, `legal.dpo.email` or `legal.grievanceOfficer.email` value"; and add: "A digit string equal to a JSON-LD `gtin*`, `mpn` or `sku` of the page's `Product`, or to `legal.registerNumber`, `vatId`, `mailOrderNumber`, `cnpj` or `abn` (fact containment normalisation, privacy § 1), is not a phone candidate."
Serves: consistency#30 (PRV-025 requires manufacturer contacts on pages; identifiers and register numbers were taken for phone numbers); coverage-real-use#2, #7, #9 (new required emails and numbers).

## X11 — spec/packs/web-delivery.md (for the web-delivery fixer; informational)
`ca-qc` is now a documented `privacy.jurisdictions` value in privacy.md § 1 ("Quebec, Charter of the French Language; web-delivery pack"), so I18-010 (coverage-real-use#10) can key on it. No edit to privacy.md is needed when I18-010 lands; if I18-010 is not added, tell this group so the `ca-qc` value is removed.
