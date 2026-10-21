# shipgate — 01 Core

> Principles, scope, rule model, ownership, policy core, modes, pipeline, verdict, agent conduct and roles. Formats are in `03-formats.md`, algorithms in `04-algorithms.md`, CLI/hosts/product in `05-integrations.md`.

---

## 1. Principles

- **P1 — No invented facts.** A value appears in output only if it is in source data, the policy, or a pure function of those. Absent → omitted. Never a plausible substitute, filler, or machine translation.
- **P2 — Behaviour is the contract.** Verdicts are proven on what the running system does (HTTP responses, raw HTML, browser behaviour, API responses, database state in a disposable environment). Source checks add precision and speed; they never replace behaviour checks.
- **P3 — The oracle is never the implementation.** Expectations come from the policy, source data, a declared contract, Operator-owned flows or a locked baseline.
- **P4 — One source of truth per concern.** One inventory, one URL builder, one data-access layer per entity, one env module, one contract per API.
- **P5 — Finite, declared surface.** Every route, endpoint, family and critical flow is declared or discovered and recorded. Unknown URLs are 404; undeclared endpoints are findings.
- **P6 — Agents cannot move the goalposts.** Policy, data, fixtures, flows, contracts, baselines and debt are signed by the Operator.
- **P7 — Fail safe.** 404 a non-existent thing, 5xx a broken dependency, quarantine a bad row, block when the verifier itself fails (where the host allows), stop and hand off rather than guess.
- **P8 — Small context for agents.** The tool tells agents what applies and what failed in a few lines. Agents never carry the rulebook.
- **P9 — Adoptable on real repos.** Existing problems are recorded as debt and ratcheted down; they never block new work, except non-waivable safety rules after their debt expiry.

---

## 2. Scope

**Projects:** marketing/content sites, programmatic SEO sites, SaaS web apps, APIs, multi-service platforms, plain HTML sites, sites on hosted builders.
**Stacks:** anything that serves HTTP to a browser; depth by adapter coverage level (`02-adapters.md`).
**Lifecycle:** new projects built from scratch (`init --new`, CFG-009; the brief starts with the launch definition of done), live projects, re-platforming of existing sites (old-URL preservation, REF-010), and launch (`project.stage: "live"`, launch checks against production).
**Role:** brief → check every edit → gate completion → lock behaviour for refactors. Agents write all code; shipgate never edits application code (`codegen` only on Operator or CI command; `inventory` is licence-free and may be run by anyone, 03 § 13).
**Out of scope:** ranking outcomes, the truth of upstream data, native mobile/desktop apps, infrastructure provisioning, production monitoring (a separate later product).

### 2.1 Surfaces
Every route and endpoint belongs to exactly one surface per service:

| Surface | Example | Default access | Main packs |
|---|---|---|---|
| `public` | marketing, blog, docs, programmatic pages | anonymous | web-delivery, search-engines, answer-engines, programmatic, performance, accessibility, privacy, security, ux |
| `app` | dashboard, settings | `auth: required` | security, accessibility, performance, testing, privacy, resilience, ux |
| `api` | REST/GraphQL/RPC, webhooks | per `security.routes` | data-api, security, performance, resilience |
| `asset` | static files, images, fonts | anonymous | performance, security |

An undeclared route is a P0 finding (CFG-003).

---

## 3. Vocabulary

**Operator** (the human; signs policy, data, flows, contracts, baselines, debt, waivers) · **Planner / Builder / Auditor** (agent roles, § 10) · **Verifier** (shipgate) · **Pack** (rules for one quality domain) · **Adapter** (stack knowledge) · **Service** (one runnable or remote unit) · **Verify environment** (disposable, seeded, local; never production) · **Baseline** (locked behaviour recording) · **Debt** (recorded pre-existing findings) · **Finding** (one rule × one root cause, with count and examples).

---

## 4. Rule model

Each project rule: **`ID` · severity · channel(s)** — requirement. `†` = non-waivable. Machine metadata per rule: `03-formats.md` § 5.

| Severity | Meaning |
|---|---|
| P0 | Blocking. Correctness, safety, data integrity, indexation, invented data. |
| P1 | Blocking. Quality and consistency. Waivable. |
| P2 | Blocking. Budgets. Waivable. |
| W | Warning; never blocks. Agents MUST NOT change code solely to clear a warning. |

**Lifecycle:** every rule is `experimental` (reported as W) until its conformance corpus passes, then `stable` (04 § 14).

| Channel | Checked by |
|---|---|
| `cfg` | Policy validation and discovery |
| `lock` | Signed lock over protected inputs |
| `hook` | Agent-host hook payloads (tool calls, commands) |
| `ast` / `graph` | Source analysis / import graph via the adapter |
| `diff` | Changes vs the diff base (04 § 5) |
| `deps` | Manifests and lockfiles |
| `cmd` | The project's own typecheck, lint and test commands |
| `data` | Datasets, eligibility, inventories |
| `db` | Migrations on a disposable database; schema and policy inspection |
| `build` | Production build + artifact scan |
| `http` / `html` | Running services: responses / raw HTML (no JavaScript) |
| `site` | Whole-site graph: links, sitemap, hreflang |
| `content` | Cross-page analysis |
| `browser` | Headless browser: flows, performance, accessibility, layout, screenshots |
| `contract` | Responses vs declared API contracts |
| `baseline` | Observations vs a locked baseline |
| `edge` | Read-only checks against a deployed preview (`previewUrl`) |
| `review` | Auditor checklist (`quality/audit/review.json`); rare; review-only rules are W unless they have an automated part |

Each channel belongs to one gate (normative table: `04-algorithms.md` § 1.1). Rule outcomes, finding statuses, gate statuses and the verdict are defined in `04-algorithms.md` § 1.

Tool requirements (how shipgate itself behaves) use the `TR-*` prefix and are not project rules: they never appear in `brief`, findings or coverage counts.

---

## 5. Authority, ownership, signing

### 5.1 Precedence
Spec > policy > task instructions > agent judgement. A conflicting task instruction: the agent stops, quotes both, asks the Operator; the Operator records a waiver if they agree.

### 5.2 Ownership

| Path | Owner | Builder | Auditor |
|---|---|---|---|
| `quality/policy.json`, `quality/verify.env.example` | Operator | read | read |
| `quality/verify.env` (secrets, git-ignored) | Operator | not readable through host read tools (the pre-hook denies `read` events on it); shell reads can't be prevented, and AGT-011 (b) flags its values in source | — |
| `quality/data/**`, `quality/fixtures/**`, `quality/flows/**`, `quality/contracts/**`, `quality/adapters/**`, `quality/host/**` | Operator | read | read |
| `quality/refactor.json`, `quality/debt.json`, `quality/lock.json`, `quality/rollout/**`, `quality/approvals/**` | Operator (signed) | read | read |
| `quality/conformance/**` | Operator (signed, 03 § 6; not a lock input) | read | read |
| `quality/baselines/**` | Verifier on Operator/CI command (signed) | read | read |
| `quality/generated/**` | Verifier on Operator/CI command | read | read |
| `quality/out/**` | Verifier | read | read |
| `quality/proposals/**` (policy drafts, flows, `dependencies.json`, `waiver-requests.json`) | Planner and Builder (Auditor: `waiver-requests.json` only) | write | write (`waiver-requests.json`) |
| `quality/audit/**` | Auditor | read | write |
| Paths in `writeScope` | Builder | write | read |
| New migration files in the migrations dir | Builder | create | read |
| Applied migrations (listed in the lock's `appliedMigrations`) | Operator | read | read |
| Dependency manifests and lockfiles | Builder | write, only if the change matches `quality/proposals/dependencies.json` | read |
| Protected JSON keys (`protectedKeys`, e.g. `tsconfig` strictness) | Operator | read | read |
| Agent-host hook configs, CI workflows, git hooks | Operator | read | read |

### 5.3 Signed lock
`shipgate lock` (Operator, interactive) hashes the inputs listed in 03 § 8 and signs the digest with the Operator's Ed25519 key. The private key is stored in the OS keychain **encrypted with a passphrase-derived key** (Argon2id); the passphrase is never stored or cached, so other programs running as the same user (including agents) can't use the key. Trusted public keys live in a keychain-backed trust store with roles (`operator`, `ci`); in CI they come from a CI setting, never from the repo (03 § 7). An unsigned or mismatched lock → `BLOCKED`. Works per branch; base-branch baselines (`_main`) carry their own CI-role signature and never invalidate the lock. Honest limit: someone who controls the account **and** knows the passphrase defeats any local check; CI with pinned keys is authoritative.

### 5.4 Waivers and overrides
`policy.waivers[]` (03 § 3) and `policy.ruleOverrides[]` are part of the signed policy. `†` rules cannot be waived or turned off. Expired waivers are ignored; waivers expiring within 14 days are warned about.

**Expiry clock.** The reference time (04 § 15) is the HEAD commit time, which an agent can set freely, so date comparisons that gate verification never use it alone. A date that must not have passed yet — waiver `expires`, debt `expires`, `ruleOverrides[].expires`, break-glass `expiresAt`, `certifications[].validUntil` (UX-019), and the activation dates of date-activated rules or parts (e.g. UX-013 `green` from 2026-09-27) — is compared with the **later** of the reference time and the wall-clock UTC time at run start. A date that must already have happened — `testimonials[].consentedOn` (UX-014), `launch-forms.json` `confirmedOn` (UX-022) — must not be after the **earlier** of the two. Outcomes that depend on the wall clock this way are marked non-deterministic (TR-103), are excluded from evidence hashes, and are recomputed on every run, never taken from the gate cache (04 § 16).

### 5.5 Debt (ratchet)
`shipgate debt record` (Operator) fingerprints current findings into `quality/debt.json` (03 § 9) with per-key occurrence counts. Matching findings are reported under `debt` and don't block; new findings (or higher occurrence counts) block. Debt only shrinks, with one exception: `debt add --reason` (Operator) may absorb findings from rules that became stable, packs newly enabled, or inputs newly configured since the last record. To make that decidable, `debt record` stores in `debt.json` `packs` (enabled pack keys), `stableRules` (rule ids stable in the recorded ruleset) and `notConfigured` (rule ids whose outcome was `notConfigured` in the recording run); each `debt add` updates the three arrays to the current run. `debt add` accepts a finding only when its rule ∉ `stableRules`, or its pack ∉ `packs`, or its rule ∈ `notConfigured`; any other finding is refused (exit 2) and listed. `†` rules may enter debt only with an expiry ≤ 90 days (§ 5.4 expiry clock), after which they block: `debt record` sets `expires` = record date + 90 days for † rules and parts, and `debt add` requires `--expires` for them (03 § 9). File renames are followed (04 § 9.3).

---

## 6. Policy and environment

Policy shape, defaults and every key: `03-formats.md` § 3. Core validation:

- **CFG-001** · P0† · cfg — Policy parses its JSON Schema; unknown keys rejected; required keys present; a live-mode programmatic family without `family.snapshot` is a CFG-001 finding (programmatic § 6 *live*).
- **CFG-002** · P0 · cfg — Every service resolves to exactly one primary adapter plus its addons (02 § 3) and, after adapter defaults, has these commands: `start` (local services, unless the primary adapter serves the files itself, e.g. `static-html`); `migrate` (for the service named by `data-api.db.service`, when the data-api pack is enabled and `data-api.db.migrations.format` isn't `sql-dir`). A command the primary adapter supplies by default can be replaced but not removed: a policy value of `null` or `""` for it is a finding. Other commands are optional: absent `typecheck` → BLD-001 `notApplicable`; absent `lint` → BLD-002 `notApplicable`; absent `test` → BLD-003 `notApplicable`; absent `build` → BLD-004 `notApplicable`; absent `coverage` → TST-011 `notApplicable`. A missing required command is a finding naming the service and the command.
- **CFG-003** · P0 · cfg, http — Every discovered route (adapter discovery in G0, crawl discovery in G4) matches exactly one surface pattern (most specific wins; ties fail).
- **CFG-004** · P0† · cfg — Verify-environment targets are not production (targets = remote service `url`s, `previewUrl`s, external `databases[].url`, and every `verify.env` or service `env` value that parses as a URL): no URL/host in `production.origins/hosts` (except the URL of a service declared `readOnlyProduction`, which then only runs rules with `remote: read`), no live-key patterns (`sk_live_`, `rk_live_`, `pk_live_`, production project refs, `AKIA` followed by 16 characters of `[0-9A-Z]`) or `production.keyPrefixes` in `verify.env` or service env, remote services only with `nonProduction` or `readOnlyProduction`. Violations make the run `BLOCKED` (owner `operator`). This rule owns live-key detection in the environment; SEC-042 covers client bundles.
- **CFG-005** · P0 · cfg — `writeScope` doesn't overlap protected paths: no path of the working tree, and no protected pattern read as a literal path (glob metacharacters `*`, `?`, `[`, `{` replaced by `x`), matches both a `writeScope` glob and a protected pattern (the § 5.2 rows owned by the Operator or the Verifier, policy `protected` (03 § 3), and the built-in protected paths of 05 § 3.1). Each overlap is a `schema-violation` finding naming both globs.
- **CFG-006** · P0 · cfg — Each enabled pack's section passes (a) its JSON Schema (key types and enums from the pack example, 03 § 3.5) and (b) these cross-checks: every route pattern parses (03 § 2.1) and resolves to a declared service; every value of a key typed `host` is in `hosts[]`; every `db` id is in `verifyEnv.databases`; every `family` is a declared programmatic family; every CSS selector parses; every ruleset-id value exists in the pinned ruleset; plus the pack's own `Validation:` paragraph where one exists. Each failed check is a `schema-violation` finding naming the key path.
- **CFG-007** · P0 · cfg — Every service meets its `minCoverage`, else `BLOCKED` with the gap listed.
- **CFG-008** · P0† · cfg — `policy.verifier` range and `ruleset` match the running binary.
- **CFG-009** · P0 · cfg, edge — New projects (`project.stage: "new"`, set by `init --new`): the policy may declare services whose `path` doesn't exist yet. Those services are reported as `planned`, their gates are `SKIPPED(planned)`, and the verdict is at most `PARTIAL` with a `planned` handoff on a base PASS (04 § 1.6, § 1.9). Once a planned path exists it must resolve like any other service (CFG-002). Safety net for unannounced rebuilds: with stage `new` and `edge.production: true`, the edge pass fetches `/` and `/sitemap.xml` of each `production.origins` entry. If `/` answers 200 with an HTML body whose visible text has ≥ 50 UAX #29 words (the text of `<body>` excluding `script`, `style`, `template` and `noscript`) and no `noindex` (meta robots or `X-Robots-Tag`), or the sitemap answers 200 with ≥ 1 `<loc>`, and there is no signed `refactor.json`, that is part `existing-site-unprotected` (P1, owner `operator`, channel `edge`): replacing a live site needs `baseline --from-remote` first. With stage `new`, non-empty `production.origins` and `edge.production: false`: part `rebuild-check-off` (W), because the safety net can't run. A service path that ever existed can never become planned again. It counts as having existed if it was present at the diff base (04 § 5), in any session snapshot, or in `git log -- <path>` since the lock's `createdAt`. shipgate records such paths in the state dir; if it's missing, that is a CFG-002 finding owned by the builder, so deleting half-built work can't earn a stop. `project.stage: "live"` (the default) forbids planned services. The Operator switches the stage to `live` at launch, which makes the launch-check rules (IDX-011, URL-011, SEC-065, UX-022, REF-010 when replacing a site) apply. A `live` project without `edge.production: true` gets part `launch-checks-off` (W), because those checks would otherwise be skipped silently. Parts: `main` (P0, the planned-service checks), `existing-site-unprotected` (P1), `rebuild-check-off` (W), `launch-checks-off` (W).

### 6.1 Runs on the device alone — tool requirements
- **TR-001** Managed toolchain: portable Node (Lighthouse and Playwright only), Playwright with its pinned Chromium (+ Firefox/WebKit on demand), Lighthouse, axe-core, web-vitals, OSV-Scanner with an offline database, PostgreSQL/MySQL builds, PostgREST and Supabase Auth where builds exist, the Firebase emulator suite (with a JRE) where builds exist. Downloaded on first use into shipgate's cache directory (user config `cache.dir`, 03 § 7.3; a protected path, 05 § 3.1), pinned and checksum-verified, reused offline; `fetch` pre-downloads; `doctor` reports gaps (including Linux system libraries for the browser).
- **TR-002** Services start natively with the project's commands under the process supervisor (04 § 4); the project's own runtime is the project's prerequisite.
- **TR-003** Disposable databases (PostgreSQL, MySQL, SQLite) run from the managed toolchain; `external` databases must pass CFG-004.
- **TR-004** Supabase-style platforms: database prep always; PostgREST/Auth managed where available; otherwise a dedicated non-production project.
- **TR-005** Remote mode for services without local source/runtime: read-only unless `nonProduction: true`.
- **TR-006** Dynamic ports; parallel runs never collide.
- **TR-007** A local egress proxy is always present in the verify environment, and so is the SMTP sink unless `verifyEnv.smtp.enabled` is `false` (03 § 3.4).

---

## 7. Modes

| Command | When | Verdict |
|---|---|---|
| `brief` | before and during tasks (auto-injected by hooks) | — |
| `check --hook pre\|post\|session\|prompt` | every tool call / session / prompt | blocks or injects context |
| `check --hook stop` | agent tries to finish | allows only with a PASS report or a handoff for the current tree |
| `verify --changed` | during work | `PARTIAL` at best |
| `verify` | before handoff; CI | `PASS` / `FAIL` / `BLOCKED`, or `PARTIAL` when the run has a partial cause (04 § 1.6 step 2) |
| `baseline`, `verify --against` | refactors | as above |
| Operator commands | exactly the commands denied by 05 § 3.2 "shipgate Operator verbs" (the single definition; incl. `debt rotate`, `conformance`, `migrate`). Its exceptions `init --draft`, `migrate --check`, `codegen --check` and `baseline --ci` (CI detection required, 04 § 15), and `keys show` and `inventory`, which are not Operator verbs, may be run by anyone | — |

Full CLI: `05-integrations.md` § 1. Time budgets and what each mode runs: `04-algorithms.md` § 8.

---

## 8. Pipeline

Gate statuses, prerequisites and early stopping: `04-algorithms.md` § 1.4–1.5 (only CFG-001/008, licence and an invalid lock signature stop the whole run; a gate whose prerequisite *failed* still runs; only a *blocked* prerequisite stops dependents). All findings are reported, deduplicated and ranked (04 § 9). Remote services run only rules with `remote: read` (or `write` when `nonProduction: true`).

| Gate | Does |
|---|---|
| **G0 config** | Discovery, policy validation, coverage levels, licence, signed-lock check |
| **G1 static** | Project typecheck, lint and test commands (tests once for BLD-003; a second, shuffled run when the testing pack's TST-004 applies, with the egress proxy started before G1 for it, 04 § 4.6); adapter source rules; import graph; diff/scope; dependency audit; secret scan of the diff |
| **G2 data** | Datasets, inventories, oracles; migrations on a disposable database; schema/RLS checks; contract validation |
| **G3 build** | Production build per local service; artifact scan (secrets, server-only code in client bundles, sizes, source maps) |
| **G4 runtime** | Start databases, platform services, SMTP sink, egress proxy, front proxies, services (04 §§ 2–4); seed; log in accounts; HTTP probes (status, redirects, headers, auth/authorization, CORS, CSRF, error leakage); core fault injection (04 § 4.5); raw-HTML checks; site graph; API contract tests; preview pass |
| **G5 content** | Skeleton identity, duplicates, similarity, claims, content quality |
| **G6 browser** | Flows (incl. cross-browser), performance, accessibility, responsive layout, runtime errors, consent behaviour, parity checks, screenshots |
| **G7 baseline** | Equivalence vs a baseline (only with `--against`; otherwise `SKIPPED`) |
| **G8 edge** | Read-only checks against `previewUrl` and, with `edge.production: true`, `production.origins` (otherwise `SKIPPED` with the list of edge rules) |
| **G9 verdict** | Compute verdict (04 § 1), write reports (03 § 17), update the sealed verdict record (04 § 8.1) |

Coverage, crawl and sampling: 04 § 10.

---

## 9. Agent conduct — `AGT-*`

- **AGT-001** · P0† · lock, diff, hook — Protected paths and protected keys unchanged (the paths that AGT-006 owns excepted).
- **AGT-002** · P0† · diff, hook — Changed files ⊆ `writeScope` (plus new migration files and reported dependency changes).
- **AGT-003** · P0† · ast — No type/lint suppressions in changed code (adapter-supplied forms per language) and no non-null assertions/unwraps on external data (04 § 13).
- **AGT-004** · P0† · ast, diff — No test evasion: skip/only/todo markers, always-passing commands, "pass with no tests" flags, snapshot-update flags, self-comparing assertions, weakened or deleted assertions (04 § 13).
- **AGT-005** · P0† · baseline, site — No coverage shrinking: counts of routes, endpoints, flows and indexable pages (04 § 15 *Indexable page*) don't drop versus `_main` unless each dropped item is covered by a `refactor.json` `allowedChanges` entry (`url-remove` for routes and indexable pages; `api-status` with status 404 or 410 for endpoints; `flow` for flows), or by a web-delivery `retired` or programmatic family `retired` entry. Each uncovered dropped item is a `diff-violation` finding naming it.
- **AGT-006** · P0† · diff — No edits to Operator-owned inputs: a diff touching `quality/{data,contracts,fixtures,flows,baselines}/**` is a `diff-violation` finding (owned here; AGT-001 owns nothing on these paths). Invented facts on pages are owned by the facts-oracle rules (04 § 1.2) and the programmatic oracle (04 § 11); AGT-006 has no `html` part.
- **AGT-007** · P0† · hook — The verdict comes only from the Verifier; the stop hook enforces it.
- **AGT-008** · P0† · hook — Command policy (03 § 2.4): no deploys, production data access, history rewrites, `--no-verify`, secret rotation, billing/security changes, indexing pings or Operator commands.
- **AGT-009** · P1 · diff, deps — Every added dependency is declared in `quality/proposals/dependencies.json` with reason and licence: each direct dependency added, or whose version range changed, in a manifest (diff vs base) has a `dependencies.json` entry with the same `name` whose `version` equals the manifest range or the resolved lockfile version. A lockfile change passes when every top-level package whose resolved version changed is a declared entry (transitive entries are not compared); a lockfile change with no manifest change and no declared entry is a finding.
- **AGT-011** · P0† · ast, http, browser — No verifier detection. The `ast` part flags, in application source outside files with role `test` (04 § 7.1) and outside the file that `routes.fileMap` maps to `verifyBackdoor`:
  - (a) an `envReadApis` call whose key literal matches `SHIPGATE_*`;
  - (b) a string literal equal to any `verify.env` value of ≥ 6 characters or to a test-account e-mail (03 § 4);
  - (c) a string literal containing `HeadlessChrome` or `Lighthouse`, or a member access `navigator.webdriver`.

  Branching on the per-run verify CA has no source form and is covered by the behavioural part only.

  Behavioural part `behaviour` (browser and http): a **comparison pass** (04 § 2 item 6) restarts each service in the same production mode with `SHIPGATE_VERIFY` unset. That is the only difference, so legitimate `DEPLOY_ENV` switches don't count. It re-runs PRV-001, SEC-010, RTE-013 and MET-011 (all parts except `dead-anchor`) on a sample. A rule that passes in the main pass and fails in the comparison pass is a finding. Parts `ast` and `behaviour`: `ast` (P0†, source check, channel `ast`), `behaviour` (P0†, comparison pass, channels `browser` and `http`).
- **AGT-010** · P0† · ast — No error swallowing: empty catch/except/rescue, catch blocks that return success, render a page or turn errors into "not found" without logging or rethrowing (precise detector: 04 § 13; fallbacks without logging are W).

### 9.1 Project commands — `BLD-*`
- **BLD-001** · P0 · cmd — The service's `typecheck` command exits 0 (G1).
- **BLD-002** · P1 · cmd — The `lint` command exits 0 (G1).
- **BLD-003** · P0 · cmd — When `commands.test` is set (and the testing pack doesn't set `projectTests: false`), the project's test command exits 0 (G1, one run; flakiness via TST-004).
- **BLD-004** · P0 · build — The production `build` command exits 0 (G3).
- **BLD-005** · P0 · http — Each local service starts and passes its health check within `timeoutSec` (G4).

These are owned by the Builder. `BLOCKED` is reserved for failures that happen before project code runs (toolchain, database engine, ports, licence, lock, or the seed contract when neither seed inputs, migrations nor the service's own files changed), so breaking a build or startup never gives an agent an exit.

---

## 10. Repair loop and roles

### 10.1 Repair loop
1. `verify` (or `verify --changed` during work).
2. Work findings in rank order; `rule <ID>` for details.
3. Change only what you own (§ 5.2).
4. Re-run. Attempts are tracked by the Verifier (04 § 9); exhausted findings are handed off.
5. Operator-owned findings (data, contracts, baselines, environment, lock) → write nothing, hand off.
6. A rule that seems wrong → add to `quality/proposals/waiver-requests.json` (and `shipgate report-fp` for false positives), never a workaround.
7. Long runs: `verify --detach`, then `status --wait`; stopping is allowed only with a sealed PASS or a Verifier-written handoff for the current tree (04 § 8.1).

**Done:** a `verify` without a partial cause (04 § 1.6) on a clean tree → `PASS` (the definition-of-done run, DECISIONS D-002); cached gate results count only when their environment hash equals this run's (04 § 15–16).

### 10.2 Roles

| Role | Writes | Does |
|---|---|---|
| Operator | everything signed | Decides handoffs, waivers, policy |
| Planner | `quality/proposals/**` (including `quality/proposals/plan.md`) | Splits work into tasks of (rule IDs + paths + surfaces) using `brief`; drafts policy fragments, flows and contracts; never changes acceptance criteria |
| Builder | owned paths (§ 5.2) | Implements; hooks keep it honest; cannot self-certify |
| Auditor (fresh context) | `quality/audit/**` | Runs `verify --no-cache` on a clean checkout; reviews the diff for evasion; completes `review.json`; spot-checks the targets the report lists under `auditTargets` (03 § 17): the Verifier draws 20 (fewer when the union is smaller) with the lock-digest PRNG (04 § 15, stream id `audit-targets`) from the union of route-group ids and changed-file paths, and the Auditor writes one `review.json` entry per (applicable `review`-channel rule, target) pair, with `rule` set to that rule id and `target` set to that id. Read-only on app code. |

Builder → Auditor → Builder, max 3 rounds, then the Operator. Only a passing gate, a debt match or an Operator waiver clears a finding.

---

## 11. Tool requirements for agent use — `TR-1xx`

- **TR-101** Agents never receive the spec; `brief` and `rule` give slices (04 § 7).
- **TR-102** Output is short and ranked: rule, severity, count, ≤ 5 examples, expected/actual, file, fix hint.
- **TR-103** Deterministic: same inputs → same report, order and hashes. The only exceptions are observations of live systems — every edge-pass (G8) observation plus the external link checks LNK-006/007 (04 § 15) — and wall-clock reads: expiry comparisons (§ 5.4 expiry clock) and UX-020 part `timer`. The report marks them non-deterministic and keeps them out of evidence hashes for other rules (04 § 15).
  - **Lock-digest PRNG:** selections are defined once, in 04 § 15 (hash-ranked draw; no ChaCha or shuffle). Stream ids: the rule id of the use site (`OPS-010`, `IDX-011`, `SEC-030`), `audit-targets` (§ 10.2: the first 20 candidates in rank order, candidate key = route-group id or changed-file path), or the sample name (04 § 10). **Value streams:** where a rule needs values rather than a choice (SEC-030 fuzzing, probe nonces), value k (k = 0, 1, …) of stream s is the first 8 bytes of SHA-256(lock digest ‖ `0x00` ‖ s ‖ `0x00` ‖ decimal k) read as a big-endian u64; a nonce is the lowercase hex of value k.
- **TR-104** `verify`/`check` never edit application code.
- **TR-105** Exit codes and hook protocols per `05-integrations.md`.
- **TR-106** Local and CI behave identically. Network access is limited to:
  - the verify environment;
  - the edge pass (04 § 2 item 5, including the bounded read-only GET launch checks against production);
  - declared hosts;
  - external link checks: links newly added in the diff (LNK-007, at most 50 requests per run; off with `web-delivery.externalLinks.checkAdded: false`), and, with explicit opt-in only, all outbound links (`web-delivery.externalLinks.check`, nightly profile, LNK-006).
- **TR-107** Every finding carries an `evidenceHash`.
- **TR-108** Hooks are fail-closed wherever the host allows it; where a host is fail-open by design, `doctor` and the report say so.
- **TR-109** `check` (post) ≤ 10 s; pre ≤ 300 ms without toolchain or network; stop reads only the sealed verdict record (< 2 s).
- **TR-110** Reports state "no automated violations at the configured level" for accessibility, never "accessible" or "compliant"; the same wording discipline applies to privacy ("no observed violations of the declared obligations").
- **TR-112** Agents get the facts and the target before they build, so they can get it right the first time:
  - The `brief` for files whose role (04 § 7.1) is `route`, `layout` or `component`, and for files matching `**/*.{md,mdx,markdoc}` outside `quality/` and the repository root, includes `business.json` excerpts (every key present, 03 § 14; at most 40 lines, arrays cut in file order with the count of omitted entries, 04 § 7) with the instruction to use only these facts and never invent others.
  - `brief --stage start` lists the pages that applicable rules require, each with its rule id: `/` (always); `trustPages.about` and `trustPages.contact` (when TRS-001 applies); every legal page that PRV-022 requires via `required-legal-pages.json` for the declared `jurisdictions` and `kinds`; the accessibility statement `legalPages.accessibility` (when PRV-017 applies, i.e. `eu-eaa`); the 404 page (RTE-004, always); the withdrawal function (when PRV-021 applies); feeds (when IDX-015 applies); `/.well-known/security.txt` (when SEC-015 applies).
- **TR-111** Performance budgets are calibrated to the machine:
  - Each run records one median `benchmarkIndex`, measured at the start of the first of G4 and G6 that runs (04 § 6.3), and the report states it.
  - On a host whose index is below `performance.minBenchmarkIndex`, these timing parts are `skipped(slow-host)` rather than FAIL: PRF-001 parts `lcp` and `tbt`; PRF-002 part `main` (INP across flows) and part `probe` (W); PRF-006; PRF-011; PRF-016; CRW-001's verify-environment measurement (`http` channel; its edge-pass measurement is not calibrated and always runs). PRF-001 parts `cls` and `seo` always run, as do the byte budgets (PRF-010). Byte budgets are never skipped. Because an agent could slow the machine on purpose, such a run is partial: a base PASS becomes PARTIAL, never a sealed PASS (04 § 1.6); it gets a `reduced-environment` handoff only when the signed policy allows reduced runs (`verifyEnv.reduced`, 03 § 3.4; 04 § 1.9), otherwise none. Laptops on battery and slow CI runners therefore don't produce false failures.
  - A local run never reads CI results. CI is authoritative because the merge gate is CI's `verify`: a P2 budget finding raised only in CI is fixed like any other finding, and a local PASS does not override it.
