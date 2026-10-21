# Pack: programmatic

> Page **families**: many pages generated from a dataset (city × service, products, locations, glossaries, integrations). Adds data contracts, quarantine, templates-as-data, an independent oracle, and anti-doorway checks on top of `web-delivery`.

Google treats pages that differ only by a swapped name as doorway pages / scaled content abuse. **Valid row ≠ eligible page ≠ indexable page** — three separate decisions, all computed by the Verifier.

---

## 1. Policy section

```jsonc
"programmatic": {
  "dataAsOf": "2026-10-01T00:00:00Z",          // freshness reference; never the wall clock
  "maxGeneratedUrls": 50000,
  "maxQuarantineRate": 0.05,
  "bannedClaims": ["best", "#1", "cheapest", "guaranteed", "award-winning", "top-rated", "trusted by"],
  "sources": {
    "census-acs-2024": { "name": "US Census ACS 2024", "url": "https://www.census.gov/programs-surveys/acs" },
    "internal-pricing": { "name": "Pricing DB export" },
    "keyword-export": { "name": "Keyword tool export (search volume)" }
  },
  "families": [
    {
      "id": "service-city",
      "service": "web",
      "routePattern": "/plumbers/{slug}",
      "dataset": "quality/data/service-city.jsonl",
      "retired": "quality/data/service-city.retired.jsonl",
      "intent": "Compare plumbing prices and availability in one city",   // documentation only
      "primaryEntityField": "city",
      "fields": {
        "id":            { "type": "id", "required": true },
        "slug":          { "type": "slug", "required": true },
        "previousSlugs": { "type": "slugList" },
        "city":          { "type": "text", "required": true, "max": 80, "source": "census-acs-2024" },
        "stateCode":     { "type": "text", "required": true, "pattern": "^[A-Z]{2}$", "source": "census-acs-2024" },
        "stateName":     { "type": "text", "required": true, "source": "census-acs-2024" },
        "stateSlug":     { "type": "slug", "required": true },
        "geo":           { "type": "geo", "required": true, "source": "census-acs-2024" },
        "population":    { "type": "int", "required": true, "min": 0, "source": "census-acs-2024", "label": "Population",
                           "format": { "style": "decimal", "grouping": true } },
        "avgJobPrice":   { "type": "money", "required": true, "source": "internal-pricing",
                           "observedAtField": "avgJobPriceObservedAt", "maxAgeDays": 180, "label": "Average job price",
                           "format": { "display": "symbol" } },
        "avgJobPriceObservedAt": { "type": "datetime" },
        "stateAvgJobPrice": { "type": "money", "source": "internal-pricing", "regional": true, "label": "{stateName} average" },
        "searchVolume":  { "type": "int", "min": 0, "source": "keyword-export" },
        "imageUrl":      { "type": "url" },
        "updatedAt":     { "type": "datetime", "required": true }
      },
      "localFacts": ["city", "geo", "population", "avgJobPrice"],
      "localEvidence": "measurement",          // "measurement" | "sourcedText"
      "sourcedTextField": null,
      "minLocalFacts": 3,
      "localCardinalityRatio": 0.5,
      "maxSimilarity": 0.85,
      "onNearDuplicate": "fail",               // "fail" | "omit"
      "onThin": "omit",                        // "omit" | "noindex"
      "indexation": "index",
      "rendering": "ssg",                      // "ssg" | "isr" | "ssr"
      "revalidateSeconds": null,
      "dataMode": "inventory",                 // "inventory" | "live"
      "snapshot": null,                        // live mode: { "db": "main", "sql": "select … " } or use the service's snapshot command
      "priorityField": "population",           // ordering for relations, omit tie-breaks and partial prebuild
      "prebuild": "all",                       // "all" | { "top": 5000 }
      "locales": ["en-US"], "localeField": null, // multi-locale: list locales; localeField or one dataset per locale; templates keyed by locale
      "ymyl": false,
      "ymylReviewers": [],                     // names allowed as <field>ReviewedBy in YMYL families (DAT-015)
      "lastmodField": "updatedAt",             // row field feeding lastmod (PCF-004)
      "titleTemplates": [
        "Plumbers in {city}, {stateCode} — Prices & Availability | {brand}",
        "Plumbers in {city}, {stateCode} — Prices | {brand}",
        "Plumbers in {city}, {stateCode}"
      ],
      "descriptionTemplates": ["Compare plumbers in {city}, {stateName}: average job price {avgJobPrice}, serving {population} residents."],
      "h1Template": "Plumbers in {city}, {stateCode}",
      "staticFragments": { "priceIntro": "Prices are averages of completed jobs in the last 180 days.",
                           "aiDisclosure": "Some descriptions on this page were drafted with AI and checked by our editors." },
      "breadcrumbs": [ { "name": "Home", "path": "/" }, { "name": "{stateName}", "path": "/plumbers/state/{stateSlug}" }, { "name": "{city}", "path": "{self}" } ],
      "hub": "/plumbers/state/{stateSlug}",
      "links": { "relation": "nearest-by-geo", "count": 3, "maxClickDepth": 4 },
      "contentParams": [],
      "schemaTypes": ["WebPage", "BreadcrumbList", "Service"],
      "localBusiness": null,                   // or { "requiredFields": ["streetAddress","addressLocality","postalCode","addressCountry"] }
      "targetQueryTemplate": "plumber in {city} {stateCode}",            // KW-003 cross-family cannibalisation
      "demand": { "field": "searchVolume", "min": 10, "onLow": "omit" }, // optional; field holds Operator-provided demand data
      "rollout": { "pilot": 100, "waveSize": 1000, "minIndexRate": 0.7, "minWaveAgeDays": 14 },   // optional staged publication
      "aiTextDisclosure": "aiDisclosure",      // staticFragments key shown on pages that render reviewed AI text
      "allowedTerms": []                       // proper nouns AI text may use beyond the row's own fields (DAT-014)
    }
  ],
  "hubs": [
    {
      "id": "state-hub",
      "service": "web",
      "minMembers": 2,
      "parent": null,
      "descriptionTemplate": "Find plumbers across {stateName}: prices and availability by city.",
      "routePattern": "/plumbers/state/{stateSlug}",
      "groupBy": { "family": "service-city", "field": "stateSlug" },
      "titleTemplate": "Plumbers in {stateName} | {brand}",
      "paginatedTitleTemplate": "Plumbers in {stateName} — Page {page} | {brand}",
      "paginatedDescriptionTemplate": "More plumbers across {stateName}, page {page}: prices and availability by city.",
      "h1Template": "Plumbers in {stateName}",
      "pagination": { "pageSize": 50, "style": "query", "param": "page" },
      "indexation": "index"
    }
  ]
}
```

### 1.1 Field types

| Type | Value | Rules |
|---|---|---|
| `id` | `^[A-Za-z0-9_-]{1,128}$` | unique per family |
| `slug` | `^[a-z0-9]+(?:-[a-z0-9]+)*$`, ≤ 80 | URL-007 |
| `slugList` | array of slugs | URL-008 |
| `text` | 1–500 chars, trimmed, no double spaces, no `<` `>` | `max`, `pattern` |
| `sourcedText` | ≥ `min` (default 80) code points, no `<` `>` | not the entity name wrapped in a sentence |
| `int` / `number` | finite | `min`, `max` |
| `money` | `{ amountMinor: int ≥ 0, currency: ISO-4217 }` | DAT-010 |
| `geo` | `{ lat: -90..90, lng: -180..180 }` | DAT-011 |
| `url` | absolute `https:` | SEC-002 |
| `date` / `datetime` | ISO-8601 (datetime with offset) | |
| `enum` / `bool` | declared values / boolean | |
| `aiText` | text generated by a model into the dataset, 1–2,000 chars | DAT-013..016; never counts toward eligibility |

Field attributes: `required`, `source`, `observedAtField` + `maxAgeDays`, `regional` (context figure, never local), `label`.

### 1.2 Validation — `PCF-*` (G0)
- **PCF-001** · P0 · cfg — Template tokens reference only required fields of the family, whitelisted constants (`{brand}`, `{siteName}`), `{self}`, or `{page}` in paginated hub templates. Hub templates use only fields constant within each group (checked at G2).
- **PCF-002** · P0 · cfg — `localFacts` ⊆ declared fields (required or optional), none `regional`, includes `primaryEntityField`, and `|localFacts| ≥ minLocalFacts ≥ 3`; `measurement` needs a numeric/money/geo local fact; `sourcedText` needs `sourcedTextField` ∈ `localFacts` of type `sourcedText`.
- **PCF-003** · P0 · cfg — `schemaTypes` ⊆ allowed; `LocalBusiness` only with a `localBusiness` block whose fields are required; `Offer` needs a required `money` field.
- **PCF-004** · P0 · cfg — `rendering: isr` ⇔ `revalidateSeconds` set; every `source` exists; `ymyl: true` ⇒ required `reviewedBy` (text) and `sourceUrl` (url); `demand.field`, `lastmodField` and `priorityField` name declared fields.
- **PCF-005** · P0 · cfg — Every field rendered as text has a `format` (defaults per type, 04 § 15); `links.relation` is one of `nearest-by-geo`, `same-group:<field>`, `field-similarity:<fields>`, `declared:<field>`.
- **PCF-006** · P0 · cfg — Multi-locale families declare `locales`, a `localeField` (or one dataset per locale) and templates keyed by locale (`"titleTemplates": { "en-US": [...], "es-US": [...] }`); rows of different locales with the same `id` are alternates.
- **PCF-007** · P0 · cfg — Hubs declare `service`, `minMembers` (default 2), `descriptionTemplate`, `paginatedTitleTemplate` and `paginatedDescriptionTemplate` (both containing `{page}`, so MET-001/002 uniqueness holds), and an optional `parent` hub; a hub with fewer released eligible members than `minMembers` is not generated (404) and its members link to the parent hub instead.

---

## 2. Data — `DAT-*`

- **DAT-001** · P0 · data — Every row is validated by the Verifier against the field types. Unknown keys fail the row. The app's row types are generated from policy (`quality/generated/`), never hand-written divergent schemas.
- **DAT-002** · P0 · data — Blank, whitespace-only and `null` = missing; reject `NaN`/`Infinity`, invalid dates, malformed slugs, out-of-range numbers, unknown enums, `<`/`>` in text.
- **DAT-003** · P0 · data — Required field missing/invalid/stale → row **quarantined** with rule IDs (no page, no links, no sitemap entry). Optional field missing → its fact slot, sentence, meta claim and JSON-LD property are all omitted.
- **DAT-004** · P0† · data — Quarantined/total > `maxQuarantineRate` → build fails. Agents never edit data to change the rate.
- **DAT-005** · P0 · data — Duplicate `(family, locale, slug)`, pathname or canonical → build failure (never first-row-wins).
- **DAT-006** · P0 · data — Inventory size ≤ `maxGeneratedUrls`; every page maps to a row, a hub/pagination page or a static path; no cartesian expansion.
- **DAT-007** · P0† · data, html — No fallback chains (proven on output: every fact slot's `data-value` equals the row's own field; a regional field never fills a local slot). The source pattern check (`??`/`||` around fact fields in family route files) is a W hint only. Regional/national figures are their own `regional` fields with their own labels ("Texas average"), never in a local slot and never counted as local. No filler strings.
- **DAT-008** · P0 · cfg, data — Every fact field declares a registered `source`. Conflicts between suppliers are resolved upstream; the snapshot carries one value per field.
- **DAT-009** · P0 · data — Freshness via `observedAtField` vs `dataAsOf` (never the wall clock). Stale required → quarantine; stale optional → omitted.
- **DAT-010** · P0 · data, html — Money is `{amountMinor, currency}`; one formatter produces the visible text and `Offer.price`.
- **DAT-011** · P0 · data — Geo: both coordinates, finite, in range, not `(0, 0)`.
- **DAT-012** · P0 · data — YMYL rows without `reviewedBy` and https `sourceUrl` are quarantined; no advice sentences outside sourced fields.

## 3. Templates as data — `TPL-*`

- **TPL-001** · P0 · cfg, ast — All user-visible copy on family and hub pages comes from policy (templates, labels, breadcrumbs, `staticFragments`). String literals > 80 characters rendered in family route files fail. Agents write markup and structure, not copy.
- **TPL-002** · P0 · data — `applyTemplate` replaces `{token}` with formatted values (row field → constant → `{self}` → `{page}`). Unknown token, leftover brace, `${` or empty substitution is an error. No expressions or conditionals. The first title/description template whose result fits `web-delivery.titleLength.hardMax` / `descriptionLength.hardMax` is used; none fits → quarantine.
- **TPL-003** · P0 · html — Every rendered fact is an element with `data-fact="<field>"` and `data-value="<canonical machine value>"`, text = formatted value. Other template-token text (e.g. `{city}` in the H1, breadcrumb names, labels) is wrapped in `data-token="<name>"`. Optional sections are wrapped in `data-section="<field>"`; variable-length lists (related links, hub items) in a `data-list` container. The Verifier checks `data-value` exactly and the text against the oracle (inventory mode) or by parse-back (live mode).
- **TPL-004** · P0 · content — **Skeleton identity** (algorithm: 04 § 11): after masking token/fact text and variable attributes, collapsing `data-list` containers and hashing `data-section` subtrees separately (unreviewed `aiText` counts as absent), the canonical `<main>` serialisation is identical across a family's pages (per locale), and every instance of a given section is identical too. Per-row prose and hidden doorway branches become impossible.
- **TPL-005** · P0 · content — Conditionals exist only around declared optional fields.
- **TPL-006** · P0† · content — No per-row generated prose in templates (proven by skeleton identity, TPL-004; any source-level check is a W hint). Long-form text per row is allowed only as a `sourcedText` field or a **reviewed** `aiText` field in the data (Operator-owned pipeline, DAT-013..016).
- **TPL-007** · P0 · html — `sourcedText` and `aiText` fields render as an element with `data-fact="<field>"` inside a `data-section="<field>"` wrapper; their `data-value` is the lowercase hex SHA-256 of the field's exact text, and the element's text must equal the field text (whitespace-normalised). This keeps TPL-003/TPL-004 decidable for long text.

## 4. Eligibility & scaled-content safety — `CNT-*`

- **CNT-001** · P0 · data — Eligible = valid + required present and fresh + ≥ `minLocalFacts` local facts **present and fresh in this row** + a fitting title/description template + YMYL fields. The eligible set is the inventory.
- **CNT-002** · P0 · data — Local evidence matches `localEvidence` (`measurement`: a numeric/money/geo local fact; `sourcedText`: the field meets its rule).
- **CNT-003** · P0 · data — Local cardinality: with n ≥ 2 eligible rows, each local fact has ≥ `max(2, ⌈localCardinalityRatio · n⌉)` distinct values. Failure fails the build (a family design problem). Agents never relabel facts or drop rows to pass.
- **CNT-004** · P0 · data — No two eligible rows share the full tuple of local-fact values apart from the entity name. Fails the build.
- **CNT-005** · P0 · content — Exact duplicate `<main>` text across indexable URLs fails.
- **CNT-006** · P1 · content — Near-duplicates measured over **row-specific text only** (fact texts, `sourcedText`, list items; template text excluded, since TPL-004 makes it identical by design): MinHash/LSH as in 04 § 11; pairs above `maxSimilarity` get `onNearDuplicate`; top 20 pairs reported.
- **CNT-007** · P0 · data — Ineligible rows follow `onThin` (`omit` default → quarantine/404; `noindex` → served noindex, excluded from sitemap and related links). Agents never choose this.
- **CNT-008** · P0† · content — On family and hub pages, visible text matching `bannedClaims` (whole word, case-insensitive, NFKC) fails unless inside a fact slot whose data value contains it.
- **CNT-009** · P0† · browser, html — Required facts and main text are never hidden (`hidden`, `aria-hidden="true"`, `display:none`, `visibility:hidden`, `font-size:0`, off-screen, same colour as background). Excluded: content inside user-revealable disclosure widgets (`<details>`, elements controlled by a control with `aria-expanded="false"`, inactive `role="tabpanel"`). No bot-only content.
- **CNT-010** · P1 · html — "Updated"/"as of" dates come from data fields, never build time.

## 4-0. Which rows each rule sees

- **All eligible rows** (released or not): eligibility (CNT-001/002), cardinality (CNT-003), tuple uniqueness (CNT-004), similarity (CNT-006/012), cannibalisation (KW-003).
- **Released eligible rows only:** inventory, sitemap, hubs and `minMembers`, related links (PLK-001), breadcrumbs, internal-link graph.
- Rows withheld by demand gating (DAT-017) or not yet released (ROL-001) are **not quarantined** and don't count toward `maxQuarantineRate` (DAT-004).

## 4a. AI-written text — `DAT-013..016`

Evidence basis: Google's generative-AI guidance (updated 2026-10-01) says AI content must be fact-checked and reviewed before publishing, and that generating many pages without added value is scaled content abuse; quality raters flag automated main content as potentially lowest quality; case studies show unique data, not prose, separates programmatic winners from deindexed sites, and schema-constrained generation grounded in data outperforms freeform text. So AI text is allowed only as reviewed, grounded enrichment of real data.

- **DAT-013** · P0 · data — Every `aiText` field has provenance sibling fields: `<field>Model`, `<field>GeneratedAt`, `<field>PromptVersion`, and, once reviewed, `<field>ReviewedBy`, `<field>ReviewedAt`. Generation happens upstream in the Operator's pipeline (one schema field per prompt, never whole pages); agents never write it.
- **DAT-014** · P0 · data — Grounding: every number, percentage, currency amount and date in `aiText` (number detection: 04 § 15) equals a value of a field in the same row; otherwise the text is rejected. Proper nouns not present in the row's fields or the family's `allowedTerms` → W.
- **DAT-015** · P0† · data, html — Unreviewed `aiText` (no `ReviewedBy`/`ReviewedAt`, or reviewed before the text was regenerated) is never rendered on indexable pages; the page still publishes from its data if otherwise eligible. YMYL families additionally require `<field>ReviewedBy` to be one of the family's `ymylReviewers`.
- **DAT-016** · P0 · data — `aiText` never counts toward `minLocalFacts`, local evidence, cardinality or tuple checks: eligibility comes from data only. It does count in similarity checks (CNT-006) as row-specific text.
- **CNT-011** · W · html — Pages rendering reviewed AI text show the family's `aiTextDisclosure` fragment (Google suggests telling readers how automated content was made).

## 4b. Demand, cannibalisation, cross-family duplicates

- **DAT-017** · P1 · data — With `demand` set, rows whose demand field is below `min` follow `onLow` (`omit` by default; the demand data is Operator-provided, e.g. from a keyword tool export, with a declared `source`).
- **KW-003** · P1 · data, site — Each family's `targetQueryTemplate` yields one target query per page; after normalisation (lowercase, NFKC, stop words removed, light stemming, tokens sorted), no two indexable pages across all families and `web-delivery.targets` share a target query.
- **CNT-012** · P1 · content — Across families and non-programmatic pages, two indexable pages whose full `<main>` text has Jaccard similarity > 0.9 (MinHash/LSH, 04 § 11) are a finding (e.g. a neighbourhood page that duplicates its city page).

## 4c. Staged rollout — `ROL-*`

Evidence basis: practitioner case studies consistently show pilot batches indexing well and bulk launches indexing poorly, with "scale only when the previous batch indexes ≥ 70 %" as a common gate. Not an official Google rule; it is low-regret risk control.

- **ROL-001** · P0 · data, site — With `rollout` set, only rows in released waves (`quality/rollout/<family>.json`, Operator-signed) are published: inventory, sitemap, hubs and related links include released pages only; unreleased rows return 404 (omission, not `noindex`: Google still crawls noindex pages).
- **ROL-002** · P0 · data — Wave 1 has ≤ `pilot` rows; later waves ≤ `waveSize`; rows are assigned to waves by `priorityField` (highest first), deterministically.
- **ROL-003** · P0 · cfg — `shipgate rollout release --family <id>` (Operator) releases the next wave only if the previous wave is at least `minWaveAgeDays` old and its index rate ≥ `minIndexRate`, computed from an Operator-provided Search Console indexing export (`quality/data/indexing/<family>.csv`, 03 § 18). The rollout file records the evidence used; G2 re-verifies it.
- **ROL-004** · W · data — Index rate of the latest wave below 0.4 in the export: warning recommending a pause and a quality review of that family.

## 4d. Crawl efficiency — `CRW-*`

Evidence basis: Google's crawl-budget documentation (crawl capacity rises with stable, fast responses including TTFB and falls with slowdowns, 5xx and 429; support `304 Not Modified`; use 404/410 for removed pages; noindex still consumes crawling).

- **CRW-001** · P2 · http, edge — Family pages: p75 time-to-first-byte ≤ `crawl.ttfbMs` (default 500 ms) on the sampled pages in the verify environment, and on `previewUrl` in the edge pass when available.
- **CRW-002** · P1 · http — Family and hub pages send `ETag` or `Last-Modified` (from row `updatedAt`), and a repeat request with `If-None-Match` / `If-Modified-Since` returns `304` when unchanged.
- **CRW-003** · W · cfg — Families using `onThin: "noindex"` get a reminder that omission (404) saves crawl capacity; use noindex only for pages users need.

## 5. Family links — `PLK-*`

- **PLK-001** · P1 · html — Family pages link every breadcrumb, the hub, and exactly the oracle's related set (`links.relation`, computed by the Verifier, relative to the current row, tie-break by slug, no self). Fewer candidates than `count` → link all + warning. Never invented targets. "First N alphabetically" is not a relation.
- **PLK-002** · P1 · html — Links inside `<main>` ⊆ breadcrumb ∪ hub ∪ related set ∪ links in static fragments.

## 6. The oracle and inventory

For every eligible row the Verifier computes from policy + data only: `pathname`, `canonical`, `locale`, `robots`, `title`, `description`, `h1`, `facts` (`{value, text}`), `breadcrumbs`, `hub`, `related`, `alternates`, schema values, `lastmod`. G4 compares each served page's raw HTML with it.

**Data modes:**
- **`inventory` (default, every stack):** `shipgate inventory` (licence-free, so deploy pipelines can run it) writes `quality/generated/inventory/<family>.jsonl` before the build (03 § 13); the app's route generation, sitemap, links and breadcrumbs read only this file, and render `facts.*.text` verbatim. shipgate is the only formatter (ICU4X, pinned CLDR version recorded in the report), so there is nothing to keep in sync. Any language reads JSON lines, so this works for every stack.
- **`live`:** for data that changes between builds. The app reads its own source and formats with its own runtime; the oracle uses a snapshot produced at verify time by the service's `snapshot` command or `family.snapshot: { db, sql }` (JSONL, same field schema).

**Formatting across stacks (live mode).** Runtimes ship different Unicode CLDR versions, and CLDR changes visible output between versions (CLDR 42 replaced the space before AM/PM with U+202F, which changed Node 18.13+ and JDK 20+ output). No bridge between programs can make two runtimes with different locale data print identical strings, so live mode never compares formatted strings for equality. Instead:
1. `data-value` (machine value) must equal the data exactly.
2. The visible text is **parsed back into a value** (locale-aware: grouping and decimal separators, currency symbol or code, digits in any numbering system, date fields) and must equal `data-value`. All space variants (U+0020, U+00A0, U+202F, U+2009) are treated as one.
3. Text that can't be parsed back as the declared type fails with the exact characters shown, so the cause is visible.

Inventory line:
```json
{"family":"service-city","rowId":"tx-austin","locale":"en-US","pathname":"/plumbers/austin-tx","canonical":"https://www.example.com/plumbers/austin-tx","robots":"index,follow","title":"Plumbers in Austin, TX — Prices & Availability | Acme","description":"…","h1":"Plumbers in Austin, TX","facts":{"population":{"value":974447,"text":"974,447"},"avgJobPrice":{"value":{"amountMinor":28500,"currency":"USD"},"text":"$285.00"}},"breadcrumbs":[…],"hub":"/plumbers/state/texas","related":["/plumbers/round-rock-tx","/plumbers/pflugerville-tx","/plumbers/cedar-park-tx"],"alternates":{},"schema":{"types":["WebPage","BreadcrumbList","Service"]},"lastmod":"2026-09-30T00:00:00Z","previousSlugs":[]}
```
Quarantine line (`quality/out/quarantine.jsonl`):
```json
{"family":"service-city","rowId":"tx-nowhere","rules":["DAT-003"],"fields":["avgJobPrice"],"detail":"required field missing"}
```

## 7. Fixtures (Operator-owned)
Longest/shortest entity names; apostrophes/diacritics (`Coeur d'Alene`, `São Paulo`); same name in two regions; every optional field missing; value `0`; stale fact; `</script><script>alert(1)</script>` in a text field; `javascript:` URL; literal `{city}` and `undefined`; row with `previousSlugs`; retired row; thin row; hub with more than one page. Poison fixtures run in an isolated fixture build, never in the production inventory.

## 8. Adapter notes (programmatic-specific)
- Next.js App Router: route generation from the inventory + `dynamicParams = false` (or inventory check before render with partial prebuild); `revalidate` literal must equal `revalidateSeconds`; `notFound()` before `<Suspense>`.
- Astro: `getStaticPaths()` from the inventory. Nuxt: prerender routes from the inventory. Other stacks: the route handler loads the row from the inventory and returns 404 when absent.
