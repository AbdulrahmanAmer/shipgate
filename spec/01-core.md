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
**Role:** brief → check every edit → gate completion → lock behaviour for refactors. Agents write all code; shipgate never edits application code (`codegen`/`inventory` only on Operator or CI command).
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
| `quality/verify.env` (secrets, git-ignored) | Operator | read via shipgate only | — |
| `quality/data/**`, `quality/fixtures/**`, `quality/flows/**`, `quality/contracts/**`, `quality/adapters/**`, `quality/host/**` | Operator | read | read |
| `quality/refactor.json`, `quality/debt.json`, `quality/lock.json`, `quality/rollout/**`, `quality/approvals/**` | Operator (signed) | read | read |
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

### 5.5 Debt (ratchet)
`shipgate debt record` (Operator) fingerprints current findings into `quality/debt.json` (03 § 9) with per-key occurrence counts. Matching findings are reported under `debt` and don't block; new findings (or higher occurrence counts) block. Debt only shrinks, with one exception: `debt add --reason` (Operator) may absorb findings from rules that became stable, packs newly enabled, or inputs newly configured since the last record. `†` rules may enter debt only with an expiry ≤ 90 days, after which they block. File renames are followed (04 § 9.3).

---

## 6. Policy and environment

Policy shape, defaults and every key: `03-formats.md` § 3. Core validation:

- **CFG-001** · P0† · cfg — Policy parses its JSON Schema; unknown keys rejected; required keys present.
- **CFG-002** · P0 · cfg — Every service resolves to adapters and has the commands its enabled packs need.
- **CFG-003** · P0 · cfg, http — Every discovered route (adapter discovery in G0, crawl discovery in G4) matches exactly one surface pattern (most specific wins; ties fail).
- **CFG-004** · P0† · cfg — Verify-environment targets are not production: no URL/host in `production.origins/hosts` (except the URL of a service declared `readOnlyProduction`, which then only runs rules with `remote: read`), no live-key patterns (`sk_live_`, `rk_live_`, `pk_live_`, production project refs, `AKIA…`) or `production.keyPrefixes` in `verify.env` or service env, remote services only with `nonProduction` or `readOnlyProduction`. Violations make the run `BLOCKED` (owner `operator`). This rule owns live-key detection in the environment; SEC-042 covers client bundles.
- **CFG-005** · P0 · cfg — `writeScope` doesn't overlap protected paths.
- **CFG-006** · P0 · cfg — Each enabled pack's section passes its validation.
- **CFG-007** · P0 · cfg — Every service meets its `minCoverage`, else `BLOCKED` with the gap listed.
- **CFG-008** · P0† · cfg — `policy.verifier` range and `ruleset` match the running binary.
- **CFG-009** · P0 · cfg, edge — New projects (`project.stage: "new"`, set by `init --new`): the policy may declare services whose `path` doesn't exist yet. Those services are reported as `planned`, their gates are `SKIPPED(planned)`, and the verdict is at most `PARTIAL` with a `planned` handoff on a base PASS (04 § 1.6, § 1.9). Once a planned path exists it must resolve like any other service (CFG-002). Safety net for unannounced rebuilds: with stage `new` and `edge.production: true`, the edge pass fetches `/` and the sitemap of `production.origins`. If they return indexable content and there is no signed `refactor.json`, that is an Operator-owned P1 finding (`existing-site-unprotected`): replacing a live site needs `baseline --from-remote` first. A service path that ever existed can never become planned again. It counts as having existed if it was present at the diff base (04 § 5), in any session snapshot, or in `git log -- <path>` since the lock's `createdAt`. shipgate records such paths in the state dir; if it's missing, that is a CFG-002 finding owned by the builder, so deleting half-built work can't earn a stop. `project.stage: "live"` (the default) forbids planned services. The Operator switches the stage to `live` at launch, which makes the launch-check rules (IDX-011, URL-011, REF-010 when replacing a site) apply. A `live` project without `edge.production: true` gets a W finding (`launch-checks-off`), because those checks would otherwise be skipped silently.

### 6.1 Runs on the device alone — tool requirements
- **TR-001** Managed toolchain: portable Node (Lighthouse and Playwright only), Playwright with its pinned Chromium (+ Firefox/WebKit on demand), Lighthouse, axe-core, web-vitals, OSV-Scanner with an offline database, PostgreSQL/MySQL builds, PostgREST and Supabase Auth where builds exist. Downloaded on first use into the user cache, pinned and checksum-verified, reused offline; `fetch` pre-downloads; `doctor` reports gaps (including Linux system libraries for the browser).
- **TR-002** Services start natively with the project's commands under the process supervisor (04 § 4); the project's own runtime is the project's prerequisite.
- **TR-003** Disposable databases (PostgreSQL, MySQL, SQLite) run from the managed toolchain; `external` databases must pass CFG-004.
- **TR-004** Supabase-style platforms: database prep always; PostgREST/Auth managed where available; otherwise a dedicated non-production project.
- **TR-005** Remote mode for services without local source/runtime: read-only unless `nonProduction: true`.
- **TR-006** Dynamic ports; parallel runs never collide.
- **TR-007** A local SMTP sink and an egress proxy are always present in the verify environment.

---

## 7. Modes

| Command | When | Verdict |
|---|---|---|
| `brief` | before and during tasks (auto-injected by hooks) | — |
| `check --hook pre\|post\|session\|prompt` | every tool call / session / prompt | blocks or injects context |
| `check --hook stop` | agent tries to finish | allows only with a PASS report or a handoff for the current tree |
| `verify --changed` | during work | `PARTIAL` at best |
| `verify` | before handoff; CI | `PASS` / `FAIL` / `BLOCKED` |
| `baseline`, `verify --against` | refactors | as above |
| Operator commands | `init`, `lock`, `debt record\|add`, `waiver add`, `override add`, `keys`, `hooks install`, `baseline`, `codegen`, `rollout release`, `break-glass`, `approve pages` (`inventory` is licence-free and may be run by anyone) | — |

Full CLI: `05-integrations.md` § 1. Time budgets and what each mode runs: `04-algorithms.md` § 8.

---

## 8. Pipeline

Gate statuses, prerequisites and early stopping: `04-algorithms.md` § 1.4–1.5 (only CFG-001/008, licence and an invalid lock stop the whole run; a gate whose prerequisite *failed* still runs; only a *blocked* prerequisite stops dependents). All findings are reported, deduplicated and ranked (04 § 9). Remote services run only rules with `remote: read` (or `write` when `nonProduction: true`).

| Gate | Does |
|---|---|
| **G0 config** | Discovery, policy validation, coverage levels, licence, signed-lock check |
| **G1 static** | Project typecheck, lint and test commands (tests once for BLD-003; a second, shuffled run when the testing pack's TST-004 applies); adapter source rules; import graph; diff/scope; dependency audit; secret scan of the diff |
| **G2 data** | Datasets, inventories, oracles; migrations on a disposable database; schema/RLS checks; contract validation |
| **G3 build** | Production build per local service; artifact scan (secrets, server-only code in client bundles, sizes, source maps) |
| **G4 runtime** | Start databases, platform services, SMTP sink, egress proxy, front proxies, services (04 §§ 2–4); seed; log in accounts; HTTP probes (status, redirects, headers, auth/authorization, CORS, CSRF, error leakage); core fault injection (04 § 4.5); raw-HTML checks; site graph; API contract tests; preview pass |
| **G5 content** | Skeleton identity, duplicates, similarity, claims, content quality |
| **G6 browser** | Flows (incl. cross-browser), performance, accessibility, responsive layout, runtime errors, consent behaviour, parity checks, screenshots |
| **G7 baseline** | Equivalence vs a baseline (only with `--against`; otherwise `SKIPPED`) |
| **G8 edge** | Read-only checks against `previewUrl` (otherwise `SKIPPED` with the list of edge rules) |
| **G9 verdict** | Compute verdict (04 § 1), write reports (03 § 17), update the sealed verdict record (04 § 8.1) |

Coverage, crawl and sampling: 04 § 10.

---

## 9. Agent conduct — `AGT-*`

- **AGT-001** · P0† · lock, diff, hook — Protected paths and protected keys unchanged.
- **AGT-002** · P0† · diff, hook — Changed files ⊆ `writeScope` (plus new migration files and reported dependency changes).
- **AGT-003** · P0† · ast — No type/lint suppressions in changed code (adapter-supplied forms per language) and no non-null assertions/unwraps on external data (04 § 13).
- **AGT-004** · P0† · ast, diff — No test evasion: skip/only/todo markers, always-passing commands, "pass with no tests" flags, snapshot-update flags, self-comparing assertions, weakened or deleted assertions (04 § 13).
- **AGT-005** · P0† · baseline, site — No coverage shrinking: counts of routes, endpoints, flows and indexable pages don't drop versus `_main` unless declared in `refactor.json` or the Operator's policy.
- **AGT-006** · P0† · diff, html, data — No edits to data, contracts, fixtures, flows or baselines; no invented data where an oracle exists (elsewhere covered by review).
- **AGT-007** · P0† · hook — The verdict comes only from the Verifier; the stop hook enforces it.
- **AGT-008** · P0† · hook — Command policy (03 § 2.4): no deploys, production data access, history rewrites, `--no-verify`, secret rotation, billing/security changes, indexing pings or Operator commands.
- **AGT-009** · P1 · diff, deps — Every added dependency is declared in `quality/proposals/dependencies.json` with reason and licence; manifest/lockfile changes that don't match it are findings.
- **AGT-011** · P0† · ast, http, browser — No verifier detection. Application code outside the `verifyBackdoor` handler and tests never does any of the following:
  - reads `SHIPGATE_*` variables;
  - reads values from `quality/verify.env` or test-account identifiers;
  - branches on automation signals: user agents containing `HeadlessChrome` or `Lighthouse`, `navigator.webdriver`, or the verify CA.

  Behavioural part (browser and http): a **comparison pass** (04 § 2 item 6) restarts each service in the same production mode with `SHIPGATE_VERIFY` unset. That is the only difference, so legitimate `DEPLOY_ENV` switches don't count. It re-runs PRV-001, SEC-010, RTE-013 and MET-011 (all parts except `dead-anchor`) on a sample. A rule that passes in the main pass and fails in the comparison pass is a finding.
- **AGT-010** · P0† · ast — No error swallowing: empty catch/except/rescue, catch blocks that return success, render a page or turn errors into "not found" without logging or rethrowing (precise detector: 04 § 13; fallbacks without logging are W).

### 9.1 Project commands — `BLD-*`
- **BLD-001** · P0 · cmd — The service's `typecheck` command exits 0 (G1).
- **BLD-002** · P1 · cmd — The `lint` command exits 0 (G1).
- **BLD-003** · P0 · cmd — When `commands.test` is set (and the testing pack doesn't set `projectTests: false`), the project's test command exits 0 (G1, one run; flakiness via TST-004).
- **BLD-004** · P0 · build — The production `build` command exits 0 (G3).
- **BLD-005** · P0 · http — Each local service starts and passes its health check within `timeoutSec` (G4).

These are owned by the Builder. `BLOCKED` is reserved for failures that happen before project code runs (toolchain, database engine, ports, licence, lock, or the seed contract when seed inputs didn't change), so breaking a build or startup never gives an agent an exit.

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

**Done:** `verify --no-cache` on a clean tree → `PASS`.

### 10.2 Roles

| Role | Writes | Does |
|---|---|---|
| Operator | everything signed | Decides handoffs, waivers, policy |
| Planner | `quality/proposals/**` (including `quality/proposals/plan.md`) | Splits work into tasks of (rule IDs + paths + surfaces) using `brief`; drafts policy fragments, flows and contracts; never changes acceptance criteria |
| Builder | owned paths (§ 5.2) | Implements; hooks keep it honest; cannot self-certify |
| Auditor (fresh context) | `quality/audit/**` | Runs `verify --no-cache` on a clean checkout; reviews the diff for evasion; completes `review.json`; spot-checks 20 targets chosen by a PRNG seeded with the lock digest. Read-only on app code. |

Builder → Auditor → Builder, max 3 rounds, then the Operator. Only a passing gate, a debt match or an Operator waiver clears a finding.

---

## 11. Tool requirements for agent use — `TR-1xx`

- **TR-101** Agents never receive the spec; `brief` and `rule` give slices (04 § 7).
- **TR-102** Output is short and ranked: rule, severity, count, ≤ 5 examples, expected/actual, file, fix hint.
- **TR-103** Deterministic: same inputs → same report, order and hashes. The only exception is observations of live systems: every edge-pass (G8) observation plus the external link checks LNK-006/007 (04 § 15). The report marks them non-deterministic and keeps them out of evidence hashes for other rules (04 § 15).
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
  - The `brief` for route, component and content files includes `business.json` excerpts (name, contacts, prices, claims, people, testimonials) with the instruction to use only these facts and never invent others.
  - `brief --stage start` lists the pages required for the declared kinds and jurisdictions: home, about, contact, the legal set (PRV-022), 404, the accessibility statement, the withdrawal function, feeds, `security.txt`.
- **TR-111** Performance budgets are calibrated to the machine:
  - Each run records one median `benchmarkIndex`, measured at the start of G4 (04 § 6.3), and the report states it.
  - On a host whose index is below `performance.minBenchmarkIndex`, the timing budget rules (PRF-001, PRF-002, PRF-006, PRF-011, PRF-016) are `skipped(slow-host)` rather than FAIL. Byte budgets are never skipped. Because an agent could slow the machine on purpose, such a run is partial: a base PASS becomes PARTIAL with a `reduced-environment` handoff, never a sealed PASS (04 § 1.6). Laptops on battery and slow CI runners therefore don't produce false failures.
  - When local results and CI results disagree, CI's result is authoritative for P2 budgets.
