# Cross-file requests from security — round 08 pass A

Each entry: target file · location · exact edit · finding served. Anchors are quoted text, not line numbers (other fixers are editing in parallel). Already-applied items were checked at the time of writing: 04 § 4.2 step 8 already lists `SEC-037 \`expired\`` (consistency#28, 04 side) and 04 § 1.2 already lists "SEC-032 without an upload flow" (consistency#32, 04 side); 03 § 3.5 security row already matches consistency#27. They are not re-requested.

## X1 — 04-algorithms.md § 4.2 step 8: short-lifetime stages and SEC-077
- Location: first stage bullet, `SEC-028, SEC-029, SEC-030, SEC-032;`
- Edit: `SEC-028, SEC-029, SEC-030, SEC-032;` → `SEC-028, SEC-029 (part \`single-use\`), SEC-029 \`expiry\`, SEC-030, SEC-032;`
- Location: second stage bullet, `- SEC-036, SEC-038, SEC-039, SEC-041, SEC-043 (the publish), SEC-044 reads (after the uploading flow),`
- Edit: → `- SEC-036, SEC-077, SEC-038, SEC-039, SEC-041, SEC-043 (the publish), SEC-044 reads (after the uploading flow), SEC-044 \`signed-url-expiry\`,`
- Location: replay paragraph, `Probes that replay requests recorded during flows (SEC-021/SEC-022 \`write-methods\`, SEC-024, SEC-036, SEC-041,`
- Edit: `SEC-036, SEC-041,` → `SEC-036, SEC-077, SEC-041,`
- Insert after that paragraph: `   SEC-029 \`expiry\`, SEC-037 \`expired\` and SEC-044 \`signed-url-expiry\` restart the service on their stage's fresh database copy with \`auth.tokenTtlVar\` set to \`5\` and log the account in afresh (security.md shared definitions *Short-lifetime stage*); every other stage runs with the variable as configured.`
- Serves: concreteness-security#3, consistency#28 (SEC-029/SEC-044 halves), coverage-real-use#16.

## X2 — 04-algorithms.md § 1.2 required-facts list: payments without a checkout flow
- Location: `SEC-032 without an upload flow; SEC-028 without a logout flow;`
- Edit: → `SEC-032 without an upload flow; SEC-028 without a logout flow; SEC-040 part \`dom\`, SEC-041, SEC-048 part \`foreign-session\` and SEC-063 when payments apply (security.md § 1 *Payments applicability*) and no flow has \`journey: "checkout"\`, and SEC-041 when no checkout flow has a \`markAmount\` step;`
- Serves: concreteness-security#4.

## X3 — 04-algorithms.md § 2 item 5, edge-pass request limits: SEC-079
- Location: the "Also in the edge pass:" list, after `   - SEC-059: DNS lookups and two GETs (https and http root) per listed host;`
- Edit: insert `   - SEC-079: one anonymous GET per ruleset \`probePaths\` entry for each object-storage candidate host covered by a \`hosts[]\` entry, at most 20 hosts per run (lock-digest PRNG, stream id \`SEC-079\`);`
- Serves: coverage-real-use#18.

## X4 — 04-algorithms.md § 15 *Lock-digest PRNG*, *Values*: security nonce length
- Location: `a nonce is the lowercase hex of value k.`
- Edit: → `a nonce is the lowercase hex of value k, zero-padded to 16 digits (the security pack's \`{n}\` takes its first 8 characters, security.md shared definitions *Nonce*).`
- Serves: concreteness-security#15.

## X5 — 04-algorithms.md § 13 *Request-derived data flow*: users list
- Location: `- **Request-derived data flow** (SEC-003 \`source\`, SEC-027, SEC-045, SEC-062,`
- Edit: → `- **Request-derived data flow** (SEC-003 \`source\`, SEC-027, SEC-031, SEC-045, SEC-062,`
- Serves: concreteness-security#2.

## X6 — testing.md TST-007: `security.ownership` under `quality/fixtures/`
- Same text as consistency#26 (that row's Location also names testing.md, so the testing fixer may already have applied it; apply once).
- Location: TST-007, `` `data-api.contracts[].path`, `data-api.examples` and `data-api.released` must lie under `quality/contracts/`; flow `upload` files under `quality/fixtures/`. ``
- Edit: → `` `data-api.contracts[].path`, `data-api.examples` and `data-api.released` must lie under `quality/contracts/`; `security.ownership` under `quality/fixtures/` (flow `upload` paths outside `quality/fixtures/` are CFG-001, 03 § 10). ``
- Serves: consistency#26 (security.md:21 needs no change: the key's default already is `quality/fixtures/ownership.json`).
