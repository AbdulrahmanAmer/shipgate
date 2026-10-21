# Cross-file requests — from data-refactor-arch-aeo-ops-testing-resilience — round 07 pass A

Each request: target file · location · exact edit · finding served. Old text quoted as it stood when this file was written (other fixers were editing in parallel; match on the quoted text). Requests already applied on disk by another fixer when this file was written are not repeated (listed at the end).

## spec/04-algorithms.md

**X1 · § 4.2 step 8, stage chain after fault injection** (concreteness#21 OPS-012; coverage-real-use#16 RES-008)
Old: `→ fault injection (§ 4.5, one stage per dependency × fault) → browser host blocks (RES-004,`
New: `→ fault injection (§ 4.5, one stage per dependency × fault) → delivery faults (RES-008, one stage per form key × fault: outcome answering 500, outcome held; § 4.6) → graceful shutdown (OPS-012, one stage per service; the next stage restarts it) → browser host blocks (RES-004,`

**X2 · § 4.5, first sentence and last sentence** (concreteness#20 OPS-003 `event`; consistency#99 RES-003)
Old: `Used by RTE-007 (owner of dependency-failure behaviour), RES-* and OPS-002.`
New: `Used by RTE-007 (owner of dependency-failure behaviour), RES-*, OPS-002 and OPS-003 \`event\`.`
Old: `against the 20-route sample per surface \`fault-20\` (§ 10 "Fixed-size samples").`
New: `against the 20-route sample per surface \`fault-20\` (§ 10 "Fixed-size samples"), plus, in the stages of a dependency named in \`resilience.degradable\`, the RES-003 probe URLs (the lowest-ranked crawled 200 URL of each matching route group).`

**X3 · § 4.6, new bullet after "- **Outcome stubs win over forwarding:** …"** (coverage-real-use#16 RES-008)
Insert: `- **Delivery faults (RES-008):** in a RES-008 stage (§ 4.2 step 8) the outcome stub of the faulted \`egress:<host>\` form key answers \`500\` with an empty body, or, in the second stage for that key, holds its stub answer for \`resilience.timeouts.upstreamMs\` + 5,000 ms, server-side here and browser-side (§ 6.1); for an \`email:<to>\` key the SMTP sink answers \`451 4.3.0\` to \`RCPT TO:<to>\` and accepts every other recipient.`

**X4 · § 13, new bullet after the AGT-003 bullet** (concreteness#4 DB-008)
Insert: `- **DB-008:** a \`queryApis\` call whose nearest enclosing loop in the same function — \`for\`, \`for…of\`, \`for…in\`, \`while\`, \`do…while\`, a Python/Ruby/Rust loop or comprehension, or a callback passed to \`map\`, \`forEach\`, \`flatMap\`, \`reduce\` or \`each\` (including \`Promise.all(x.map(…))\`) — iterates a value whose data-flow origin (same function, as AGT-003) is the result of another \`queryApis\` call; calls reached only through a callee are not followed.`

**X5 · § 13 ARC-006 bullet** (concreteness#11 ARC-006)
Old: `- **ARC-006:** calls to adapter-declared API families (HTTP client, formatter, URL builder, auth guard, DB client) outside the declared singleton module.`
New: `- **ARC-006:** calls to adapter-declared API families (\`httpClientApis\`, \`formatterApis\`, \`urlBuilderApis\`, \`authGuardApis\`, \`dbClientApis\` — DB client construction only; \`queryApis\` calls are ARC-005's) outside the declared singleton module.`

**X6 · § 4.2 step 4, append** (concreteness#3 DB-003 `rewrite`)
Append to step 4: ` For MySQL, before a pending migration file that changes a column type on a \`largeTables\` table is applied, the DB-003 \`rewrite\` probe runs: \`CREATE TABLE sg_probe LIKE <table>\`, the same \`ALTER TABLE\` on \`sg_probe\` with \`, ALGORITHM=INSTANT\` appended, else with \`, ALGORITHM=INPLACE, LOCK=NONE\`, then \`DROP TABLE sg_probe\`.`

## spec/03-formats.md

**Y1 · § 6 adapter manifest, the ApiRef[] row** (concreteness#11 ARC-006)
Old: `` `authGuardApis` (ARC-006, SEC-057, SEC-062), `` 
New: `` `authGuardApis` (ARC-006, SEC-057, SEC-062), `dbClientApis` (ARC-006 `db-client`: calls that construct a database client, e.g. `new PrismaClient`, `createClient`, `new Pool`, `create_engine`; empty → `noAdapterSupport` for that singleton key), ``

**Y2 · § 6 adapter manifest, `httpClientApis` row** (concreteness#28 / consistency#96 RES-006 `bound`)
Old: `` `[ApiRef & { timeoutArg?: string, clientFactory?: bool }]`: `timeoutArg` = the argument role or option key that sets the request timeout (e.g. `fetch` `signal`, axios `timeout`, `requests` `timeout`); ``
New: `` `[ApiRef & { timeoutArg?: string, timeoutUnit?: "ms"|"s", clientFactory?: bool }]`: `timeoutArg` = the argument role or option key that sets the request timeout (e.g. `fetch` `signal`, axios `timeout`, `requests` `timeout`); `timeoutUnit` = the unit of a literal value passed there (default `ms`; e.g. `s` for Python `requests`; RES-006 `bound`); ``

## spec/05-integrations.md

**Z1 · § 2.1 step 4** (consistency#106 REF-011 vs remote baseline)
Old: `so every \`verify\` runs G7 and REF-010/011/013 (04 § 1.6).`
New: `so every \`verify\` runs G7 and REF-010/013/014 (04 § 1.6); REF-011 is \`notApplicable\` with a remote baseline (no \`redirects.jsonl\`).`

## spec/packs/search-engines.md

**S1 · SE-109, append after "RTE-010 owns user-agent-dependent differences; SE-109 owns the markup."** (consistency#26 AEO-014 `hidden-text` vs SE-109)
Insert: ` On pages where the signed \`search-engines.features\` contains \`paywalled-content\`, SE-109 \`owns\` \`AEO-014#hidden-text\` for the elements matched by its class-selector \`hasPart.cssSelector\`; without that feature the markup exempts nothing from AEO-014.`

## Already applied by other fixers when this file was written (no request filed)
- 04 § 4.2 step 8: API-001/002/003 non-GET requests (consistency#75); RES-004 browser host block stage + § 6.1 `connectionrefused` (consistency#100).
- 04 § 1.1 `db` detectors before the first probe and § 1.5 DB-001 `apply` prerequisite (consistency#82).
- 04 § 4.6 G1 proxy for TST-004 `egress` (consistency#114); 04 § 13 Scope list incl. ARC-008 `repo-deps` (consistency#115).
- 03 § 14 Jobs without `idempotencyKey` (concreteness#6, consistency#96); 03 § 11 `api-status` row (consistency#77); 03 § 12 remote baseline without `redirects.jsonl` (consistency#106).
- web-delivery RTE-007 owner split (consistency#98, #99); RTE-010 head-signal comparison and paywall gate (consistency#28); programmatic CNT-009 page total (consistency#25); search-engines SE-103 `owns` `AEO-001#large-preview` (consistency#133).

## For the orchestrator (BUILD_MAP / ownership — not edited here)
- BUILD_MAP WP-104 `safe-type-changes` shape → `{ postgres: [{ from: <type regex>, to: <type regex> }] }`; drop `condition?` and the `mysql` key (concreteness#3).
- ownership.tsv: `RES-008	*	WP-703	R07 new: delivery-fault replays of UX-001 form keys (needs UX-022 form key, WP-602 flows)`.
