# Cross-file requests — from security — round 06

Requests from the security fixer (pass A) for files it doesn't own. Each gives target, location, exact edit, and the finding it serves.

## X1 — spec/04-algorithms.md § 4.2 step 8 (mutating-stage list)
Serves: concreteness-security #1 (SEC-021/022), #7 (SEC-003), #3 (SEC-043), #4 (SEC-044); coverage-r05-carryover #5 (SEC-067).

Old (first stage bullet):
`   - SEC-007 non-GET probes, SEC-017, SEC-018, the SEC-023 write part, SEC-024, SEC-025, SEC-026, SEC-028, SEC-029, SEC-030, SEC-032;`
New:
`   - SEC-003 `login-replay`, SEC-007 non-GET probes, SEC-017, SEC-018, SEC-021/SEC-022 `write-methods`, the SEC-023 write part, SEC-024, SEC-025, SEC-026, SEC-028, SEC-029, SEC-030, SEC-032;`

Old (second stage bullet):
`   - SEC-036, SEC-038, SEC-039, SEC-041, SEC-045 `traversal` (non-GET) and `ssti`, SEC-046 replays, SEC-047 `stored`, SEC-048, SEC-049;`
New:
`   - SEC-036, SEC-038, SEC-039, SEC-041, SEC-043 (the publish), SEC-044 reads (after the uploading flow), SEC-045 `traversal` (non-GET) and `ssti`, SEC-046 replays, SEC-047 `stored`, SEC-048, SEC-049;`

Old (third stage bullet):
`   - SEC-054, SEC-055, SEC-057 `behaviour`, SEC-062 `access`, SEC-064 `lifetime`, SEC-072;`
New:
`   - SEC-054, SEC-055, SEC-057 `behaviour`, SEC-062 `access`, SEC-064 `lifetime`, SEC-067, SEC-072;`

Old (replay paragraph):
`   Probes that replay requests recorded during flows (SEC-024, SEC-036, SEC-041, SEC-046, SEC-047 `stored`, SEC-057 `behaviour`) first run their source flow`
New:
`   Probes that replay requests recorded during flows (SEC-021/SEC-022 `write-methods`, SEC-024, SEC-036, SEC-041, SEC-044 reads, SEC-046, SEC-047 `stored`, SEC-054, SEC-057 `behaviour`, SEC-067) first run their source flow`

## X2 — spec/04-algorithms.md § 10 "Order" bullet
Serves: concreteness-security #33 (SEC-071).

Old: `Concurrency 16 local; remote 2 req/s (or lower `Crawl-delay`), GET/HEAD only.`
New: `Concurrency 16 local; remote 2 req/s (or lower `Crawl-delay`), GET/HEAD only — one exception: SEC-071's `POST /xmlrpc.php` `system.listMethods` call (read-only, `remote: read`).`

## X3 — spec/04-algorithms.md § 1.8 Partial severities, SEC-050 bullet
Serves: concreteness-security #26 (SEC-050 `env-file`).

Old: `- **SEC-050:** `provider-pattern` P0†, `env-value` P0†, `entropy` W, `history` P0.`
New: `- **SEC-050:** `provider-pattern` P0†, `env-value` P0†, `env-file` P0†, `entropy` W, `history` P0.`

## X4 — spec/03-formats.md § 6 Adapter manifest (fields list/table)
Serves: concreteness-security #2 (SEC-027), #21 (SEC-030).

At the adapter field text "`validatorApis` (SEC-045)": replace with "`validatorApis` (SEC-030, SEC-045)", and insert directly after that field: "`passwordHashApis` (SEC-027: approved password hashers — bcrypt, scrypt, argon2, PBKDF2 and the framework's default password hasher — as `{ module, export }` or call patterns)". Use the section's current format (list item or table row) as left by the 03 fixer.

## X5 — spec/03-formats.md § 14 Webhook fixtures
Serves: concreteness-security #19 (SEC-026/049 fixture path).

Old: `- **Webhook fixtures** — `quality/fixtures/webhooks/<route-id>/*.json`: raw provider event bodies`
New: `- **Webhook fixtures** — the JSON file, or every `*.json` file in the directory, named by the route's `fixture` (`security.routes`), under `quality/fixtures/webhooks/`: raw provider event bodies`

## X6 — spec/packs/data-api.md § 1 policy, `contracts` entry
Serves: concreteness-security #5 (SEC-060 GraphQL endpoint).

Old: `    // also: "graphql" (SDL), "trpc"/"rpc" (generated schema), "jsonschema"`
New: `    // also: "graphql" (SDL; optional "endpoint": path served, default "/graphql", SEC-060), "trpc"/"rpc" (generated schema), "jsonschema"`
