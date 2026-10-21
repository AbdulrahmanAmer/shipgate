# Cross-file requests — from programmatic-search — round 07 pass A

Requests from the fixer of `spec/packs/programmatic.md` and `spec/packs/search-engines.md`. Each names the target file, location, exact old → new text (or "insert after …"), and the finding it serves. Rows whose other side was already applied by its owner during this pass (checked against the current text) are listed at the end as "no request needed".

---

## X1 — spec/04-algorithms.md § 14: per-locale ruleset lookup (serves concreteness-programmatic-search#28, #46)

Owner: algorithms fixer. programmatic DAT-012, § 1.1 `stop-words.json`, and search-engines SE-103 / SE-121 now cite "04 § 14" for the locale fallback.

Insert after the bullet `- The binary embeds the current ruleset and the 3 previous ones.`:
```
- **Per-locale ruleset files** (e.g. `stop-words.json`, `verbs.json`, `advice-patterns.json`, `clickbait-patterns.json`) are JSON objects keyed by BCP 47 tag; the entry for a locale is looked up as `ll-CC`, then `ll`, then `en` (the first key present wins). A file whose rule text defines another key (e.g. `postal-patterns.json` by ISO 3166-1 country) uses that key and no fallback.
```

## X2 — spec/04-algorithms.md § 13: TPL-001 also covers hub route files (serves concreteness-programmatic-search#12)

Old:
```
- **TPL-001:** string literals > 80 characters **rendered as text nodes** in family route files; attribute values (`class`, `className`, `style`, `d`) excluded.
```
New:
```
- **TPL-001:** string literals > 80 characters **rendered as text nodes** in family or hub route files (the adapter route files of a family's or hub's `routePattern`); attribute values (`class`, `className`, `style`, `d`) excluded.
```

## X3 — spec/04-algorithms.md § 11: skeleton identity per hub (serves concreteness-programmatic-search#12, #15)

Step 6, old: `All pages of a family/locale share one main hash.`
New: `All pages of a family/locale share one main hash, and so do all pages of a hub/locale (paginated pages included).`

Step 8, old: `The expected main hash is the one shared by the most pages of the family/locale`
New: `The expected main hash is the one shared by the most pages of the family/locale (or hub/locale)`

*Similarity (CNT-006)* bullet, append: ` Domain, row text and pair-resolution order: programmatic CNT-006.`

## X4 — spec/03-formats.md § 13: inventory `schema.values` and hub `lastmod` (serves concreteness-programmatic-search#4, #18)

In the `page` line shape, old: `schema{types[], values{}}`
New: `schema{types[], values{"<@type>":{"<property>":value}}} (values: programmatic PCF-003)`

In the `hub` line shape, old: `items[paths], parent, lastmod }`
New: `items[paths], parent, lastmod? }` and append after that bullet: `  Hub \`lastmod\`: the greatest \`lastmod\` among the \`page\` lines in \`items\`; absent when \`items\` is empty (programmatic § 6 *Hub \`lastmod\`*).`

Append to the paragraph starting `G2 regenerates the inventory into`:
` The fixture pass (programmatic § 7) writes a separate inventory to \`quality/out/fixtures/inventory/<family>.jsonl\`; the app reads inventory files from \`SHIPGATE_INVENTORY_DIR\` when that variable is set, else from \`quality/generated/inventory/\`.`

## X5 — spec/03-formats.md § 3.5: new policy keys (serves concreteness-programmatic-search#4, coverage-visibility#5, coverage-visibility#7)

In the table row `| programmatic | … | … |`, second column, append after `` `sources` ``: ``; per source `rights` (DAT-018)``.

In the paragraph `Additional keys defined by v7.1+ text …`, insert before `; web-delivery \`siteAlternateName\``:
```
; programmatic families `offerField` (string or `null`, default `null`, PCF-003); programmatic `sources.<id>.rights` (`"owned"|"licensed"|"public-domain"|"open:<SPDX id>"|"facts-only"`, no default), `.attribution` (string or `null`; key required for `licensed`, non-null for attribution-requiring `open:` licences), `.attributionFragment` (a `staticFragments` key, default `attribution-<id>`) (DAT-018); search-engines `sitewideLinkAllow: [host | { host, anchor }]` (03 § 3.3 host grammar, default `[]`, SE-128)
```

## X6 — spec/03-formats.md § 14: owner of missing feeds (serves consistency#49)

In the `**Merchant feed**` bullet and in the `**Agentic feeds**` bullet, old (both places): `A missing or unparsable file is a blocking \`parse-error\` finding owned by \`operator\`.`
New (both places): `A missing or unparsable file is a blocking \`parse-error\` finding owned by \`builder\` (reassigned to \`operator\` only when the path lies outside the Builder's \`writeScope\`, 04 § 14).`

## X7 — spec/04-algorithms.md § 1.2: required-facts list (serves concreteness-programmatic-search#27, coverage-visibility#7)

In `**Required-facts rules (PRV-022 parts …; PRV-025; …; LOC-003 for \`project.kinds\` including \`local-business\`):**`, insert before the closing `):**`: `; DAT-006 part \`fixtures\`; DAT-018 part \`rights\``. In the list of examples "(no matching `manufacturers[]` entry, …", append `, a missing programmatic fixture file or case, a missing \`programmatic.sources.<id>.rights\``.

## X8 — spec/04-algorithms.md § 2: fixture pass and CRW-001 edge sample (serves concreteness-programmatic-search#27, consistency#132)

Insert after item 6 (`**Comparison pass (AGT-011):**`):
```
7. **Fixture pass (programmatic § 7):** when the programmatic pack is enabled and a family in `inventory` mode has a fixture file, shipgate writes the fixture inventory to `quality/out/fixtures/inventory/`, then builds and starts each service serving that family a second time with `SHIPGATE_INVENTORY_DIR` set to that directory and otherwise the main-pass environment. It runs as an extra stage on a database freshly restored from the template (§ 4.2 step 8), after the read-only G4 stage and the preview pass and before the first mutating stage; the next stage restarts the services in the main-pass environment. Every fixture row is checked (no sampling) by the rules programmatic § 7 lists. Live-mode families: `skipped(live-mode)` (programmatic § 7). Remote services: `SKIPPED`.
```
In item 5, old: `   - CRW-001 TTFB: the edge sample (20 URLs);`
New: `   - CRW-001 TTFB: the family and hub pages among the edge sample (none → \`notApplicable\`);`

(04 § 6.3 "At the start of the first of G4 and G6 that runs" from consistency#132 is already in the text — no request.)

## X9 — spec/04-algorithms.md § 10: record trap drops (serves coverage-visibility#3, CRW-004)

Bullet `- **Traps:** …`, append: ` Each URL dropped by a trap limit is recorded with the limit it hit (\`params\`, \`values\`, \`depth\`, \`maxurls\`), its path pattern, and the page and \`a[href]\` (with its \`rel\`) it was discovered from; programmatic CRW-004 reports them. A path whose segments repeat a 1–3-segment sequence ≥ 3 times consecutively is also dropped (limit \`loop\`).`

## X10 — spec/packs/web-delivery.md RTE-010: `search-agents.json` tokens (serves concreteness-programmatic-search#33, consistency#61)

Old: `User agents come from the pinned ruleset \`search-agents.json\` (§ 2 shape, for Googlebot, Bingbot and Chrome).`
New: `User agents come from the pinned ruleset \`search-agents.json\` (§ 2 shape, for Googlebot, Bingbot, YandexBot, Yeti, Baiduspider, SeznamBot, Applebot and Chrome; SE-002 and SE-008 use the engine tokens).`

(The matching BUILD_MAP WP-104 "Crawlers and agents" edit of consistency#61 is the orchestrator's.)

---

## No request needed (other side already applied this pass; checked against current text)

- consistency#26 — answer-engines AEO-014 `hidden-text` already says elements matched by `hasPart.cssSelector` are owned by SE-109; SE-109 now carries the mirror.
- consistency#41 — web-delivery *Allowed types by surface* already adds the active feature `schemaTypes` and value types.
- consistency#42 — web-delivery URL-004 already admits product-variant URLs canonical to their `ProductGroup` page under SE-111; SE-111 now mirrors it.
- consistency#43 — web-delivery URL-001 already admits `variantParams` and `facets.indexable` queries; SE-111 and search-engines § 3.3 now mirror it.
- consistency#54 — web-delivery CQ-002 already excludes pairs with a family or hub page; CNT-005 now carries the other side.
- consistency#63 — web-delivery RTE-001 already says SE-501 owns the comparison with threshold 1.0; SE-501 part `parity` now carries the other side.
- consistency#65 — answer-engines AEO-009 `pdf` already says it owns title equality; SE-006 `unpaired` now mirrors it.
- consistency#133 — answer-engines AEO-001 already states SE-103 `preview` owns `AEO-001#large-preview`; SE-103 now mirrors it.
- consistency#132 (04 § 6.3 part) — already reads "At the start of the first of G4 and G6 that runs".
