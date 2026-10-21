# Cross-file requests — from data-refactor-arch-aeo-ops-testing-resilience — round 08 pass A

Each item: target file · location · exact edit · finding served. Items already present in the target when this file was written (other fixers applied them) are not repeated here; the resolution file lists them as "xfile — already applied".

## spec/03-formats.md

1. **§ 6 adapter manifest table — insert a row after the `schemaDriftCommand` row:**
   `| \`dbTypes\` | \`[{ command, output }]\`: \`command\` = a § 3.2 command string in which \`{db.url}\` is replaced by the migrated database's URL (e.g. \`supabase gen types typescript --db-url {db.url}\`); \`output\` = the file it writes, relative to the service (DB-001 \`drift\`) | | \`[]\` |`
   Serves: concreteness-data-refactor-arch-aeo-ops-testing-resilience#9.

2. **§ 6 *Common types*, `ApiRef`:** old `args?: { <role>: <0-based index> | "<0-based index>.<key>" } }\`` → new `args?: { <role>: <0-based index> | "<0-based index>.<key>" | "callee:<0-based index>" } }\` (the \`"callee:<n>"\` form names the n-th segment of the dotted callee path; used only by the \`queryApis\` role \`entity\`, ARC-005)`.
   And in the `rawHtmlSinks`, `envReadApis`, `queryApis`, … row: old `` `queryApis`, `` → new `` `queryApis` (role `entity`: `<n>` = the literal or identifier text at argument n, or `"callee:<n>"`; ARC-005), ``.
   Serves: concreteness#32.

3. **§ 12 layout block, `api.jsonl` line:** old `api.jsonl         { request: {method, url, headersSubset, body?}, status` → new `api.jsonl         { request: {method, url, headersSubset, body?, account}, status` and append to the same line ` (\`account\`: the \`auth.accounts\` id that sent the request, or \`null\` for anonymous; REF-004)`.
   Serves: concreteness#21.

4. **§ 12 layout block, `budgets.json` line:** old `budgets.json      { routeGroup: { lcp, cls, tbt, inp, scriptBytes, cssBytes }, api: { endpoint: p95 } }` → new `budgets.json      { routeGroup: { urls: [..], lcp, cls, tbt, inp, scriptBytes, cssBytes }, api: { endpoint: p95 } }   (urls = the browser-sampled pages measured at capture; REF-005 \`budget\` re-measures them)`.
   Serves: concreteness#23.

5. **§ 11 `kind` table, `text` row, "Covers" cell:** old `REF-010 \`depth\` becomes W on covered URLs` → new `on covered URLs REF-010 part \`depth\` is not judged and part \`depth-covered\` (W) applies`.
   Serves: concreteness#30.

6. **§ 3.5 "Additional keys" paragraph:** old ``ops `email.dkimSelectors: []`;`` → new ``ops `email.dkimSelectors: []`, `domain.minDaysValid: 60` (integer days, OPS-016);``.
   Serves: coverage-real-use#20 (OPS-016).

## spec/04-algorithms.md

7. **§ 1.2 *Required-facts rules* list — insert after `UX-022 launch-form confirmations;`:** ` OPS-005 part \`postal\` when a bulk email was captured and \`business.json\` has neither \`postalAddress\` nor \`locations[0].address\`; API-003 kind (c) when ids are harvested (no ownership file) and none is found for an operation with path parameters;`
   Serves: concreteness#42 (OPS-005 `postal`), concreteness#3 (API-003 harvest outcome).

8. **§ 4.2 step 8, end of the stage chain:** old `→ load (PRF-011).` → new `→ load (PRF-011) → REF-004 replays of \`api.jsonl\` records whose method is not GET/HEAD/OPTIONS (one stage, records in file order).`
   Serves: concreteness#22.

9. **§ 2 item 5, edge-pass list:** old `- AEO-002 \`sameAs\` HEAD, OPS-006 DNS lookups and SEC-015 \`security.txt\`: one request each;` → new `- AEO-002 \`sameAs\` HEAD, OPS-006 DNS lookups and SEC-015 \`security.txt\`: one request each; OPS-016: one GET of the IANA RDAP bootstrap file per run plus one RDAP GET per registrable domain of \`production.origins\` (with \`edge.production\`);`
   Serves: coverage-real-use#20 (OPS-016).

## spec/01-core.md

10. **TR-106 network list — insert a bullet after `- declared hosts;`:** `  - RDAP lookups (OPS-016, edge pass, with \`edge.production\` only): read-only GETs of \`https://data.iana.org/rdap/dns.json\` and of the registry RDAP service named there for each production registrable domain;`
    Serves: coverage-real-use#20 (OPS-016).

## Notes (no edit requested)
- BUILD_MAP WP-104 additions (`date-labels`, `eol-products`) and the `eol-dates` data snapshot (WP-401) are listed under "Ruleset data" in the resolution file, per round-07 passB-notes item 5 (BUILD_MAP is the orchestrator's).
