# Cross-file requests — from data-refactor-arch-aeo-ops-testing-resilience — round 06 pass A

Each request: target file · location · exact edit · finding served. Old text quoted as it stood when this file was written; other fixers may have moved it, so match on the quoted text.

## spec/04-algorithms.md

**X1 · § 4.2 step 8, mutating-stage order, last bullet** (concreteness-data…#1 API-006, #9 API-007)
Old: `   - API-009 concurrent requests.`
New: `   - API-006 idempotency replays, API-007 oversized bodies, API-009 concurrent requests.`

**X2 · § 4.2 step 4** (concreteness-data…#12 DB-003, #14 DB-006)
Old: `4. Migrate: \`data-api.db.migrations\` (format + dir; overrides the adapter default) applied natively for \`sql-dir\`, otherwise the service's \`migrate\` command.`
New: `4. Migrate: \`data-api.db.migrations\` (format + dir; overrides the adapter default) applied natively for \`sql-dir\`, otherwise the service's \`migrate\` command. Statement logging is on during this step; for non-\`sql-dir\` formats whose adapter declares \`migrations.applyCommand\`, each pending migration file is applied by its own invocation, so the logged statements are attributed to that file (DB-003, DB-006).`

**X3 · § 4.5 Fault injection** (concreteness-data…#63 RES-001…005, #64 RES-002)
Old: `Dependencies come from the \`hosts\` registry (\`purpose: "dependency"\`) and databases.`
New: `Dependencies come from the \`hosts\` registry (entries with \`dependency: true\`) and databases.`
Old: `delayed (the egress proxy holds the response for \`resilience.timeouts.upstreamMs\` + 5,000 ms)`
New: `delayed (the egress proxy holds the response for \`resilience.timeouts.pageMs\` + 5,000 ms; RES-002)`
Why `pageMs`, not `upstreamMs`: RES-002 must fail a service with no upstream timeout. With a hold of `upstreamMs` + 5,000 ms and an Operator-set `pageMs` ≥ that, such a service answers within `pageMs` and passes; `pageMs` + 5,000 ms always exceeds the response budget.

**X4 · § 13 ARC-008 bullet** (concreteness-data…#39 ARC-008)
Old: `and files listed in \`architecture.entryPoints\`.`
New: `and files listed in \`architecture.<service>.entryPoints\`.`
(ARC-009: no 04 edit needed — the pack now references the § 13 patterns and gives SEC-050 precedence on literals both report.)

## spec/03-formats.md

**X6 · § 11, the `kind:` line** (concreteness-data…#2 REF-002/003/004/005/010/012)
Old: `` `kind`: `url-move`, `url-remove`, `markup`, `visual`, `text`, `metadata`, `api-field-added`, `api-field-removed` (+ `contractVersion`), `api-status`, `header`, `budget`, `schema`, `flow`. ``
New:
```
`kind` and the fields of each (what an entry covers):
| kind | fields | covers |
|---|---|---|
| `url-move` | `{ from, to }` URL patterns (§ 2.1) | a route matching `from` is compared with the `to` URL (REF-003) |
| `url-remove` | `{ routes }` | matching routes (and image URLs, REF-014) may answer 410 (REF-010 c, REF-011) |
| `markup` | `{ routes, selector }` | differences inside elements matching `selector` on matching routes are ignored |
| `text` | `{ routes, selector? }` | `mainTextHash`/`mainText` differences (inside `selector` when given) are ignored |
| `metadata` | `{ routes, fields: [title\|description\|h1\|canonical\|robots\|jsonld] }` | the listed `routes.jsonl` fields may differ |
| `visual` | `{ routes, maxDiffRatio }` | REF-009 threshold for those route groups |
| `api-field-added` / `api-field-removed` | `{ endpoint, jsonPath, contractVersion? }` (`contractVersion` required for removed) | that field's addition/removal (REF-004, API-004) |
| `api-status` | `{ endpoint, from, to }` | that status change |
| `header` | `{ routes, name }` | that response header may differ or disappear (REF-005 `security` included) |
| `budget` | `{ routes, metric: lcp\|cls\|tbt\|inp\|scriptBytes\|cssBytes\|apiP95, max }` | REF-005 `budget` uses `max` instead of baseline + tolerance |
| `schema` | `{ migrations: [file] }` | `db/schema.sql` and `db/policies.json` differences produced by those migrations |
| `flow` | `{ flow, steps?: [index] }` | REF-006/REF-012 differences in that flow (those steps only, when given) |
Unknown fields fail CFG-001.
```

**X7 · § 6 adapter manifest table** (concreteness-data…#14 DB-006, #20 JOB-003, #38 ARC-006, #61 TST-004, #68 RES-006)
- In the `ApiRef[]` row, remove `` `httpClientApis`, `` from the field list, and insert these rows after it:
```
| `httpClientApis` | `[ApiRef & { timeoutArg?: string /* argument or option key that sets the timeout, e.g. fetch "signal", axios "timeout", requests "timeout" */, clientFactory?: bool /* creates a client whose calls inherit timeoutArg */ }]` (RES-006; ARC-006 and `writeOperations` use `call`) | | `[]` |
| `formatterApis`, `urlBuilderApis` | ApiRef[] (ARC-006: e.g. `Intl.NumberFormat`, `Intl.DateTimeFormat`, `toLocaleString`, date-fns `format`; `new URL`, `URLSearchParams`) | | `[]` |
| `destructiveMigrationApis` | ApiRef[] (DB-006: e.g. Django `RemoveField`, `DeleteModel`; Rails `drop_table`, `remove_column`; knex `dropTable`, `dropColumn`) | | `[]` |
| `jobRetryArgs` | `[ApiRef & { arg: string, unboundedDefault: bool }]` (JOB-003: e.g. BullMQ `attempts`, Celery `max_retries`, Sidekiq `retry`) | | `[]` |
| `testReport` | path (relative to the service) of the JUnit XML the `test` command writes \| `null` (TST-004) | | `null` |
```

**X8 · § 12 baseline layout** (concreteness-data…#29 REF-009; coverage-r05-carryover #4 REF-014)
- `manifest.json` line: Old `{ id, createdAt, commit, ruleset, verifierVersion, services, counts, files: [{path, sha256}], remote: { origin } | null, signedBy, signature }` → New `{ id, createdAt, commit, ruleset, verifierVersion, services, counts, files: [{path, sha256}], visual: [{ routeGroup, url }], remote: { origin } | null, signedBy, signature }`
- Remote-baseline paragraph: Old `and adds the fields \`source: sitemap|crawl|legacy|redirect\` and \`mainWords\` (word count of \`<main>\`, REF-010 \`depth\`).` → New `and adds the fields \`source: sitemap|crawl|legacy|redirect\`, \`mainWords\` (word count of \`<main>\`, REF-010 \`depth\`) and \`images[]\` (same-page image URLs, REF-014; refactor § 2).`

**X9 · § 3.3 host registry** (concreteness-data…#63)
Old: `` `support`, `monitoring`, `dependency`, `other`. `` → New: `` `support`, `monitoring`, `other`. `` (the fault-injection marker is the `dependency` boolean only).

**X10 · § 3.5 "No default" column, data-api row** (concreteness-data…#10 API-008)
Old: `` | data-api | `contracts` (when the service has an `api` surface) | `db`, `jobs`, `idempotentPosts` | `` → New: `` | data-api | `contracts` (when the service has an `api` surface) | `db`, `jobs`, `idempotentPosts`, `contracts[].clientTypes` | ``

## spec/packs/search-engines.md

**X11 · SE-008 part `ua-reach`** (concreteness-data…#48 AEO-008 — one challenge-page definition for both rules)
Old: `that get 403/429 or a challenge page (ruleset \`error-pages\` fingerprints)` → New: `that get 403/429 or a challenge page (\`cf-mitigated: challenge\` header, or a body matching ruleset \`error-pages\` fingerprints; shared with AEO-008)`

## tools/trace/spec-lint.mjs (orchestrator)

**X12 · `PRODUCT_FILES`** (no finding; lint noise) — refactor.md now names the baseline files `budgets.json`, `a11y.json`, `security.json` (03 § 12), which the lint reports as unsourced rulesets. Add `budgets|a11y|security` to `PRODUCT_FILES`.
