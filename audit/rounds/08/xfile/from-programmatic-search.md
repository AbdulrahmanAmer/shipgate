# Cross-file requests from programmatic-search — round 08 pass A

Each entry: target file · location · exact edit · finding served. Anchors are quoted text, not line numbers (other fixers are editing in parallel). Not re-requested (the row's Location already names the other file, so its own fixer applies it in pass A): consistency#21 04:406 and 01:133 halves (01 CFG-001 half already present), #37 ux.md half, #52, #53, #54 04 half, #55 answer-engines half, #56, #58 03:535 half, #60, #95, #98, #99, #100.

## X1 — packs/web-delivery.md § 2 coverage map: SE-010, SE-011
- Location: row `| robots.txt & AI crawlers | IDX-004, IDX-008, IDX-010, IDX-014 |`
- Edit: → `| robots.txt & AI crawlers | IDX-004, IDX-008, IDX-010, IDX-014; search-engines SE-001, SE-002, SE-010 (auxiliary image/video/news/shopping tokens), SE-011 (resource-host robots.txt) |`
- Serves: coverage-visibility#1, coverage-visibility#6.

## X2 — 04-algorithms.md § 15 *robots.txt evaluation*: users list
- Location: `Used by IDX-008, IDX-011, SE-002 and SE-301.`
- Edit: → `Used by IDX-008, IDX-011, SE-002, SE-010 (auxiliary tokens with \`fallbackTokens\`: search-engines SE-010 *Token decision*), SE-011, SE-132, SE-301 and CRW-004.`
- Serves: coverage-visibility#1, coverage-visibility#6, concreteness-programmatic-search#2.

## X3 — 04-algorithms.md § 10 *Extraction*: first discovery page (SE-129)
- Location: end of the bullet `- **Extraction:** \`a[href]\`, \`area[href]\`, \`link[rel=canonical|alternate|next|prev]\`, sitemap \`<loc>\`, redirect \`Location\`; same-origin after mapping.`
- Edit: append ` Each crawled URL records the first page, in crawl order, from whose \`a[href]\` it was extracted (none for seeds); SE-129 uses it as the origin page.`
- Serves: coverage-visibility#2.

## X4 — 03-formats.md § 6 adapter manifest: `historyApis`
- Location: the ApiRef[] row starting `| \`rawHtmlSinks\`, \`envReadApis\`, …`, after `` `redirectApis`, ``
- Edit: insert `` `historyApis` (SE-129 `source-hint`: calls that add or move history entries, e.g. `history.pushState`, `history.go`, `history.forward`, `location.assign`, `location.replace`, assignment to `location.href`; empty → `noAdapterSupport` for that part), ``
- Serves: coverage-visibility#2.

## X5 — 03-formats.md § 3.5: programmatic `priorityField`
- Location: programmatic row, "No default" cell, `` `hubs`, `demand`, `rollout`, `targetQueryTemplate`, `snapshot`; ``
- Edit: → `` `hubs`, `demand`, `rollout`, `targetQueryTemplate`, `snapshot`, `priorityField` (default `null`, programmatic § 1.3; the example value is a placeholder); ``
- Serves: concreteness-programmatic-search#12.

## X6 — 03-formats.md § 8 *Operator-owned sources*: live-mode snapshot outcome
- Location: `(UX-020: unmapped, blocking \`forbidden-value\`; programmatic: CFG-001; TST-007: \`schema-violation\` owned by \`operator\`)`
- Edit: `programmatic: CFG-001;` → `programmatic: CFG-001 for \`dataset\`/\`retired\` paths, and for live-mode snapshot rows that are not Operator-owned one blocking \`missing-element\` finding per family owned by \`operator\` (programmatic § 6 *live*);`
- Serves: consistency#21.

## X7 — 03-formats.md § 3.2 `commands`: `snapshot` is no oracle source
- Location: `| \`commands\` | \`{ install, build, start, typecheck, lint, test, coverage, migrate, snapshot }\``
- Edit: append to the cell ` \`snapshot\` output is never a programmatic oracle source (programmatic § 6 *live*: only \`family.snapshot { db, sql }\` is).` (or drop `snapshot` from the list when no other rule reads it — the formats fixer decides; grep finds no other reader).
- Serves: consistency#21.

## X8 — 03-formats.md § 13 `hub` line: item order
- Location: after `` Hub `lastmod`: the greatest `lastmod` among the `page` lines in `items`; absent when `items` is empty (programmatic § 6 *Hub `lastmod`*). ``
- Edit: append ` Item order, page slicing (\`page\`, \`pages\`, \`pageSize\`) and membership: programmatic § 6 *Hub items*.`
- Serves: concreteness-programmatic-search#5.

## X9 — 04-algorithms.md § 11 *Relations*: candidate set pointer
- Location: `**Relations:** \`nearest-by-geo\` (haversine), \`same-group:<field>\` (by \`priorityField\` desc, then slug), \`field-similarity:<fields>\` (equal fields desc, then slug), \`declared:<field>\`. Ties → slug ascending; self excluded.`
- Edit: append ` Candidate set, the \`geo\` field used, R = 6,371.0088 km, and \`declared\` order (no slug tie-break): programmatic PCF-005 *Related candidates*.`
- Serves: concreteness-programmatic-search#4.
