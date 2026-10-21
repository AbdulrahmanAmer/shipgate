# Cross-file requests — from formats-integrations (03, 05) — round 07, pass A

Context for every request below: 03 § 8 now has a bullet **Operator-owned sources** (the single definition: a file is an oracle only when it is a lock input under `quality/` or an `appliedMigrations` file; seeded rows only when inserted by a locked seed file and written by no other statement before the read; feeds/datasets/flows/contracts/fixtures outside their `quality/` dirs are never oracles). 03 § 3.4 `seed` and 03 § 8 inputs now lock seed files under `quality/`.

## 1. spec/04-algorithms.md — § 4.2 steps 5–6 (statement log for seeded rows)
Serves: consistency#13 (UX-020 `stock`/`social-proof` `db` sources; ux.md:54 *Valid db source* already cites 03 § 8 and "written by no other statement before the read", which nothing records today — step 4 logs only migrations).
Old text: `5. Seed once.`
New text: `5. Seed once. Statement logging (as step 4) stays on through steps 5 and 6 and the read-only stage, and every logged write is attributed to its source (migration file, seed file, service start-up, probe), so 03 § 8 *Operator-owned sources* can decide which seeded rows only a locked seed file wrote (UX-020 *valid db source*).`

## 2. spec/04-algorithms.md — § 4.3 Seed contract (clarification)
Serves: consistency#13 ("04 § 4.3 treats seed inputs changed in the diff as builder work").
Old text: `— except when seed inputs changed in the diff, in which case it is BLD-005 (owner `builder`).`
New text: `— except when seed inputs changed in the diff, in which case it is BLD-005 (owner `builder`). Seed files under `quality/` are lock inputs (03 § 8) that the Builder can't change; this exception therefore applies only to seed files elsewhere, `run` seeds and new migrations, none of which is an Operator-owned source.`

## 3. spec/packs/programmatic.md — family `dataset` / `retired` location
Serves: consistency#13 / orchestrator note ("make every source that any rule treats as Operator-owned a lock input"): the programmatic oracle (04 § 11) treats `families[].dataset` as Operator data, but the key may point anywhere in the repo.
Location: policy example, line `"dataset": "quality/data/service-city.jsonl",` (and the PCF-* cfg rule that validates family keys).
Insert after the policy block (or as a PCF-001 sentence): `` `families[].dataset` and `.retired` must lie under `quality/data/` (lock inputs, 03 § 8 *Operator-owned sources*); a path elsewhere → CFG-001. ``

## 4. spec/packs/testing.md — TST-007
Serves: consistency#127 (and 03 § 8 *Operator-owned sources*, which lists flows/contracts/fixtures outside their `quality/` dirs as non-oracles).
TST-007 text: replace `Flows, fixtures and contracts used as oracles are Operator-owned and signed; agents propose new ones in `quality/proposals/`.` with `Flows, fixtures and contracts used as oracles are Operator-owned and signed; agents propose new ones in `quality/proposals/`. `testing.flows` must be `quality/flows/`, and fixture and contract paths must lie under `quality/fixtures/` and `quality/contracts/` (03 § 8 *Operator-owned sources*); otherwise a `schema-violation` finding owned by `operator`.`

## 5. spec/packs/testing.md — TST-008
Serves: consistency#128.
TST-008: append `Listed flows run in `flow.browsers` ∪ {firefox, webkit} (03 § 10 `browsers`).`

## 6. spec/packs/search-engines.md — LOC-001 part `address`
Serves: consistency#29 (03 § 14 `postalAddress`, `manufacturers[].address`, `euResponsible.address` are compared "with LOC-001's normalised containment").
Append to part `address`: `A candidate also passes when it contains the `street`, `locality` and `postalCode` of `business.json` `postalAddress`, a `manufacturers[].address` or a `euResponsible.address`; with an empty `locations`, the `forbidden-value` finding is raised only for a candidate matching none of these.`

## 7. spec/packs/security.md — SEC-067 `gate`/`email`
Serves: consistency#70 (03 § 10 flow semantics: where a signup flow is cut).
SEC-067: add `Parts `gate` and `email` run on the signup flow truncated before its first `openEmailLink` step; the new account's session = the `auth.sessionCookies` cookies of that browser context at the cut; a signup flow with neither `openEmailLink` nor `expectEmail` → `notConfigured(flow email step)`.`
(03 § 3.4 `smtp.enabled` now defaults to `true` when SEC-067 applies — consistency#71.)

## 8. spec/packs/security.md — SEC-028
Serves: consistency#73. 03 § 10 `journey` enum now includes `logout` (security.md:109 already reads `journey: "logout"`). No edit needed unless the text changed; listed for traceability. Note for the security fixer: SEC-028's "no logout flow → `missing-element` owned by the builder, naming a `quality/flows/*.json` flow" asks the Builder for a file only the Operator can write (`quality/flows/**`, 01 § 5.2); consider owner `operator` (missing Operator input).

## 9. spec/packs/security.md and spec/04-algorithms.md § 1.8 — static part severities
Serves: consistency#84. 03 § 5 `parts` comment now says "static: an input-dependent severity is two parts, 04 § 1.8".
04 § 1.8: add `A part's severity is static; an input-dependent downgrade is a separate part.` security.md: split each input-dependent part as consistency#84 proposes (e.g. `expiry` P0 / `expiry-unverified` W; `licence-unknown`, `deprecated-unknown`, `age-unknown`, `rate-limit-edge` W).

## 10. spec/packs/security.md — SEC-064
Serves: consistency#85 (03 § 4 `tokenTtlVar` now "integer seconds; read by SEC-029, SEC-037 `expired`, SEC-044").
SEC-064: `idleVar`/`absoluteVar` → `` `idleVar`/`absoluteVar` hold integer seconds ``.

## 11. spec/04-algorithms.md — § 13 request-derived data flow
Serves: consistency#86. 03 § 6 now has adapter field `requestSources: ApiRef[]`.
04 § 13 add: `**Request-derived data flow** (SEC-003 `source`, SEC-027, SEC-045, SEC-062): from a `requestSources` call (03 § 6) or a route handler parameter, through assignments in the same function and one call level into same-module functions.`

## 12. spec/packs/resilience.md — RES-006 `upstreamMs`
Serves: consistency#96 (03 § 14 `jobs[]` no longer has `idempotencyKey`; data-api.md:40 already lacks it).
RES-006: `…passes `timeoutArg` with an integer literal ≤ `resilience.timeouts.upstreamMs` (a non-literal value: W).`

## 13. spec/04-algorithms.md — § 15 Default `remote` metadata
Serves: consistency#68. 03 § 5 `parts` now has `remote?` (default: the rule's).
Append to the bullet: `Every rule or part whose text says "(mutating stage, 04 § 4.2 step 8)", every fault rule (RTE-007, RES-*) and TST-001..010 are `remote: write`; OPS-001..005 and OPS-007..014 are `remote: none`; channels `cfg`, `lock`, `hook`, `baseline`, `contract`, `review` default to `none`.`

## 14. spec/packs/refactor.md — REF-002 / REF-011 with a remote baseline
Serves: consistency#106. 03 § 12 now says a remote baseline has no `redirects.jsonl` and REF-011 is `notApplicable` against it; 05 § 2.1 step 4 now says REF-010/013/014.
refactor.md:50 (the sentence "REF-011 is among them because a remote baseline has no `redirects.…`"): replace with `With a remote baseline only REF-001, REF-010, REF-013 and REF-014 apply; REF-011 is `notApplicable` (a remote baseline has no `redirects.jsonl`, 03 § 12; old-site URLs: REF-010).`

## 15. spec/packs/refactor.md — REF-001
Serves: consistency#126.
REF-001: replace `(for a rebuild of a live site, a signed remote baseline of its o…)` with `(for a rebuild of a live site, a signed remote baseline of its origin; the `commit` condition does not apply to it)`.

## 16. spec/01-core.md — § 5.2 ownership table
Serves: consistency#110 (03 § 6 conformance result now lives at `quality/conformance/<id>.json`, Operator-signed, committed, not a lock input).
Insert row after the `quality/refactor.json, …` row: `| `quality/conformance/**` | Operator (signed, 03 § 6) | read | read |`. (02:19/:103 already match 03 § 6; no 02 edit needed.)

## 17. spec/01-core.md:26 — `inventory` actor
Serves: consistency#112.
Old: `` (`codegen`/`inventory` only on Operator or CI command) `` → New: `` (`codegen` only on Operator or CI command; `inventory` is licence-free and may be run by anyone, 03 § 13) ``.

## 18. spec/01-core.md:241 — review entries
Serves: consistency#125 (03 § 17 `auditTargets` now: one entry per (applicable `review`-channel rule, target) pair).
Old: `the Auditor writes one `review.json` entry per target with `target` set to that id` → New: `the Auditor writes one `review.json` entry per (applicable `review`-channel rule, target) pair, with `rule` = that rule id and `target` = that id`.

## 19. spec/packs/programmatic.md — ROL-003 CLI syntax
Serves: consistency#116 (05 § 1: `rollout release <family>` is positional).
ROL-003: `shipgate rollout release --family <id>` → `shipgate rollout release <family>`.

## 20. spec/04-algorithms.md — health polling (§ 4.1/4.2, lines ~174/176)
Serves: consistency#122. 03 § 3.4 `health` already reads: start at `intervalMs`, double up to 5,000 ms, ready = 200–399 (200 with `endpoint: true`), stop at `timeoutSec`.
04:174 → `starting at `intervalMs`, doubling to 5,000 ms, until 200–399 (200 with `endpoint: true`) or `timeoutSec` (03 § 3.4)`; 04:176 → `` `verifyEnv.health.<service>.timeoutSec`, in G4 after BLD-005 ``.

## 21. spec/04-algorithms.md — `--resume`
Serves: consistency#129.
§ 1.6 step 2: add "a run with `--resume`" to the partial causes; § 15 `verify --resume`: `…reuses finished gates even under `--no-cache`; it is a partial cause (§ 1.6), so it never seals a PASS.`

## 22. spec/packs/web-delivery.md — CQ-010 cross-reference
Serves: consistency#135.
CQ-010: `whose 05 § 3.3 row reports no fetch events` → `whose 03 § 16 row reports no fetches (05 § 3.3)`.

## 23. spec/packs/architecture.md — ARC-010
Serves: consistency#109.
ARC-010 append: `A diff that turns a pointer off, removes it or adds a weakening override is reported only by AGT-001 and AGT-003; ARC-010 reports the state at the diff base (owner `operator`).`

## 24. spec/packs/data-api.md — API-004
Serves: consistency#77. 03 § 11 `api-status` now: REF-004 uses the baseline; API-004 (G2) uses the latest released contract's documented `from`; 03 § 14 CHANGES.md headings are `## <semver>`.
API-004 "declared" = `(a) an `api-field-removed` entry naming `endpoint`/`jsonPath`; (b) an `api-status` entry whose `from` equals the status the latest released contract documents; (c) a `- removed:`/`- changed:` line under a `## <semver>` heading of `quality/contracts/released/<service>/CHANGES.md` whose major equals the current contract's; removals and narrowed types also need current major > latest released major.`

## 25. spec/packs/search-engines.md — SE-113/SE-114 owner
Serves: consistency#49. Already applied in search-engines.md:61–62 (builder, reassigned to operator outside `writeScope`); 03 § 14 now says the same and adds that only a feed under `quality/data/` is an Operator-owned source. Note: the cited "04 § 14" should read "04 § 15 *Owners of BLOCKED gates*" (the owners list is in § 15).
