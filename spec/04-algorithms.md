# shipgate — 04 Algorithms

> How the Verifier decides things. Every algorithm is deterministic for identical inputs (TR-103) and has conformance fixtures in shipgate's own corpus. Load when implementing the corresponding subsystem.

---

## 1. Rule outcomes, gate statuses, verdict

### 1.1 Channel → gate (normative)

| Channel | Gate |
|---|---|
| `cfg`, `lock` | G0 |
| `ast`, `graph`, `diff`, `deps`, `cmd` | G1 |
| `data`, `db` (migrations, SQL), `contract` (static validation) | G2 |
| `build` | G3 |
| `http`, `html`, `site`, `contract` (live responses), `db` (runtime checks: JOB-002 job runs, readback and "no side effect" checks after G4 probes) | G4 |
| `content` | G5 |
| `browser`, `db` (checks run after a G6 flow, e.g. PRV-016) | G6 |
| `baseline` (against `--against`, refactor or remote baselines) | G7 |
| `baseline` (against `_main`, e.g. AGT-005, AEO-012, CQ-006) | G5 when `_main` exists; otherwise `skipped(no-main)` with a warning |
| `edge` | G8 |
| `review` | consumed in G9 |
| `hook` | `check` modes only |

A rule spanning several channels is evaluated in each corresponding gate; each finding carries the gate of the channel that produced it.

### 1.2 Per-rule outcome
For each rule × service: `applied` | `notApplicable` (surfaces/packs/kinds exclude it) | `noAdapterSupport` | `skipped(reason)` (mode, profile, remote mode, missing optional input explicitly allowed by the rule's metadata) | `notConfigured(input)` (an input the rule requires is missing) | `blocked(reason)`. Recorded per rule in `report.coverage.rules`.

**Facts-oracle rules (UX-003, UX-013, UX-014, UX-019, UX-020 `social-proof`):** when the page shows content of the kind the rule checks (claims, testimonials, people, trust marks, logo walls, social-proof widgets) and the matching `business.json` key or policy source is absent, the outcome is **not** `notConfigured`. It's a blocking finding with failure class `forbidden-value`, owned by the builder: the content is unsupported and must be removed, or the Operator must supply the facts. Only when no such content exists is a missing key `notApplicable`.

### 1.3 Finding status
`blocking` (stable, P0–P2, not debt, not waived, not overridden) | `debt` | `waived` | `experimental` (lifecycle experimental, or override `warn`) | `warning` (severity W) | `exhausted` (repair budget used up; still blocking for the verdict, but allows a handoff).

### 1.4 Gate status
- `BLOCKED` — the gate could not run (tool error, toolchain missing, port/engine failure, licence, budget exhausted) or a prerequisite gate is `BLOCKED`.
- `NOT_CONFIGURED` — a `†` rule in the gate is `notConfigured` (non-† `notConfigured` rules become warnings).
- `SKIPPED` — no applicable rules for this run (e.g. G7 without `--against`, G5 with no families, G3 for remote-only services, G8 without `previewUrl` and without `edge.production`).
- `FAIL` — at least one `blocking` or `exhausted` finding.
- `PASS` — otherwise.

### 1.5 Prerequisites and stopping
| Gate | Needs (not BLOCKED) |
|---|---|
| G0 | — |
| G1, G2 | G0 |
| G3 | G0 |
| G4 | G3 (local services) |
| G5 | G4 crawl completed |
| G6 | G4 environment up |
| G7 | G4 + a valid baseline |
| G8 | G0 |
| G9 | all others finished |

A gate whose prerequisite is `FAIL` still runs; only `BLOCKED` stops dependents. The whole run stops early only on: CFG-001, CFG-008, licence, invalid lock signature. Build or start failures are findings (BLD-004/005), not run-stoppers; gates depending on a failed build are `BLOCKED(prerequisite)`.

### 1.6 Verdict
The verdict is computed in two steps, so a narrow run can never hide a failure.

**Step 1: base verdict** over the gates that ran. Gates excluded by the run's scope (subset flags, `--changed` scoping, reduced mode) are `SKIPPED(scope)` and count neither as BLOCKED nor as PASS.
1. If at least one gate is `BLOCKED` and every `BLOCKED` gate traces back (through prerequisites) to a builder-owned BLD-001..005 failure → `FAIL`. Breaking the build or startup never yields `BLOCKED` or a handoff.
2. Otherwise → `BLOCKED` if any gate that ran is `BLOCKED`/`NOT_CONFIGURED`, any service is below `minCoverage`, or the lock is invalid.
3. Otherwise → `FAIL` if any finding is `blocking` or `exhausted`.
4. Otherwise → `PASS`.

**Implied baseline:** when a signed `quality/refactor.json` exists, `verify` runs as `verify --against <refactor.json baseline>` (G7 included). A site rebuild is just a refactor whose baseline is remote: `init --new` replacing a site, or `baseline --from-remote`, writes a signed `refactor.json` with `baseline` set to the remote baseline id and `goal: "replatform"` (05 § 2.1). An agent therefore can't finish a refactor or re-platforming without the behaviour checks. Removing `refactor.json` is an Operator action (it's a protected, signed file).

**Step 2: scope downgrade.** A run is *partial* when it is any of:
- `check`;
- `verify --changed`;
- a subset run (`--gate`, `--pack`, `--service`);
- `verify --adopt`;
- a reduced run;
- a run with any timing rule `skipped(slow-host)` (TR-111);
- a run where planned services are skipped (CFG-009, `project.stage: "new"`).

For a partial run, a base `PASS` becomes `PARTIAL`; a base `FAIL` or `BLOCKED` is reported unchanged. A `PARTIAL` verdict never produces a sealed PASS.

**Reduced runs** (G0–G3 only) happen only when the signed policy allows them (`verifyEnv.reduced`, 03 § 3.4) **and** the environment really lacks a browser or free ports (shipgate probes this itself). Environment variables, user config and command-line flags can't switch reduced mode on, so an agent can't grant itself a stop.

**Coverage levels:** `full` (Tier 1) > `structural` (Tier 2) > `behaviour` (Tier 3), by earned tier.

### 1.7 Review results
`quality/audit/review.json` entries affect only rules with a `review` channel. Rules whose only channel is `review` are W. For rules with automated channels plus `review`, an Auditor `fail` produces a finding at the rule's severity.

### 1.8 Partial severities
A rule may declare `parts: [{ part, severity }]` in its metadata (03 § 5). Every finding carries a `part` (default `main`, which has the rule's own severity); the detector that emits the finding sets it. The part is independent of the failure class, so two parts may emit the same class. Waivability follows the rule unless the part's metadata sets its own `waivable` (`parts: [{ part, severity, waivable? }]`); W parts are always waivable. Rules described in packs as "the X part is W" are encoded this way, for example:
- **RTE-010:** `behaviour` P0†, `source-hint` W.
- **AGT-004:** `transform` P0†, `derived-expectation` W.
- **AGT-010:** `swallow` P0†, `fallback-unlogged` W.
- **SEC-050:** `provider-pattern` P0†, `env-value` P0†, `entropy` W, `history` P0. The `history` part is not †: it is Operator-owned debt with no expiry, recorded at adoption, and it clears only when `debt rotate` sets `rotatedOn` (05 § 1). Until then every report lists it.

### 1.9 Handoffs
The Verifier writes a handoff (03 § 15, inside the sealed record) **only** in these cases; in every other case there is none, and the agent must keep fixing:

| Reason | Condition |
|---|---|
| `exhausted` / `operator-owned` | Base verdict `FAIL`, and every blocking finding is `exhausted` or owned by `operator` |
| `operator-owned` / `budget` | Base verdict `BLOCKED`, and every BLOCKED/NOT_CONFIGURED gate has owner `operator` (missing input, no baseline, licence, budget, coverage) |
| `tool-error` | Base verdict `BLOCKED` caused by a shipgate tool error (exit 3) |
| `reduced-environment` | Reduced run, or run with `skipped(slow-host)` timing rules, whose base verdict is `PASS` |
| `planned` | New-project run (CFG-009) whose base verdict is `PASS` and whose only skipped scope is planned services; lets an agent stop between milestones of a project that isn't fully built yet |
| `break-glass` | A valid Operator-signed break-glass for the tree hash (04 § 8.1) |
| `unverified-stop` | Loop guard (04 § 8.1) |

---

## 2. Verify environment identity

1. Each local service starts with `SITE_URL` (or the adapter's equivalent) = its origin, `DEPLOY_ENV=production`, `SHIPGATE_VERIFY=1`, `PORT={port}`.
2. **One front proxy per origin host.** Services on the same host are mounted by path prefix (`services[].mount`, longest prefix wins; default `/`). The proxy terminates TLS with a per-run certificate for the host, issued by a per-run CA; forwards with `Host`, `X-Forwarded-Host`, `X-Forwarded-Proto: https`, `X-Forwarded-For: 203.0.113.10` (a TEST-NET address, so apps that trust loopback forwarding aren't fooled and SEC-021's `127.0.0.1` bypass probe stays meaningful). The exception is probe requests that shipgate itself marks with an internal header, which the proxy strips; for those it passes the probe's own `Host`, `X-Forwarded-Host` and the SEC-021 `override-headers` (including `X-Forwarded-For`/`X-Real-IP`) through unchanged (SEC-038 host-header poisoning, SEC-021 header-based bypass); applies host emulation (§ 3) and, for Supabase-style platforms, the gateway routes (§ 4.4).
3. HTTP probes go to the proxies directly. **Browsers** reach origins through Playwright's `proxy` option pointing at shipgate's forward proxy, which routes origin hosts to their front proxies and everything else per the third-party policy (§ 6.1). TLS trust: Chromium with `--ignore-certificate-errors-spki-list=<CA SPKI>`; Firefox with a per-run profile importing the CA; WebKit with `ignoreHTTPSErrors`.
4. **Preview pass:** a second **build and start** of each local service with `DEPLOY_ENV=preview` and `SHIPGATE_VERIFY` unset (adapters declare `envInlinedAtBuild`; when false, a restart without rebuild is enough). Probes a 20-URL sample per surface for IDX-005, the RTE-004 preview row and SEC-033. `static-html` services: host emulation only. Remote services: `SKIPPED`.
5. **Edge pass (G8):** read-only GET/HEAD checks of rules that list the `edge` channel, against `previewUrl` (with `edge.bypassHeaderVar` for deployment protection), and, when `edge.production: true`, read-only checks against `production.origins`:
   - HEAD for host identity (apex↔www, http→https, HSTS, TLS, caching headers), for each `aliasHosts` entry (URL-011), and for the social preview fetcher user agents on the homepage (MET-005 `fetchers` part);
   - when `project.stage: "live"`, a **bounded GET launch check**: `robots.txt`, the sitemap index plus at most 10 child sitemaps, the homepage and 20 sitemap `<loc>` URLs sampled with the lock-digest PRNG (IDX-011). That is at most 33 requests per origin at 1 request per second, without cookies, using shipgate's own user agent; robots.txt is evaluated for the Googlebot and Bingbot groups.

   Against `previewUrl`, the IDX-005 `preview-edge` part makes one unauthenticated request (no bypass header) to the homepage and `robots.txt`.

   Also in the edge pass:
   - SEC-058 `edge`: two anonymous GETs per cache-deception variant URL (at most 3 variants × 5 route groups);
   - SEC-059: DNS lookups and one GET per listed host;
   - REF-010 (and `old-origin`): the IDX-011 sample plus recorded `url-move` sources, at most 200 URLs per origin;
   - SEC-034 exposed-path probes: the ruleset path list only, no backup-copy variants against production;
   - SE-008 and AEO-008 user-agent checks: homepage + 5 sampled URLs per listed agent;
   - CRW-001 TTFB: the 20-URL sample;
   - AEO-002 `sameAs` HEAD, OPS-006 DNS lookups and SEC-015 `security.txt`: one request each;
   - SEC-065: each recorded checkout route plus its same-origin scripts, at most 30 requests per origin;
   - CFG-009 safety net (stage `new`): `/` and the sitemap index, 2 requests.

   **Limits for every edge request:** 1 request per second per origin, GET/HEAD only, no cookies, and shipgate's user agent unless a rule tests a specific one.

   Without either: `SKIPPED` with the list of edge rules.
6. **Comparison pass (AGT-011):** after G6, each local service restarts with exactly the main-pass environment except that `SHIPGATE_VERIFY` is unset, with no rebuild unless `envInlinedAtBuild`. PRV-001 (browser), SEC-010, RTE-013 and MET-011 (all parts except `dead-anchor`) re-run on a 10-URL sample per surface. A rule that passed in the main pass and fails here is an AGT-011 finding. Remote services: `SKIPPED`.

---

## 3. Host emulation

| Host | Files | Supported |
|---|---|---|
| vercel | `vercel.json` | `redirects`, `rewrites`, `headers`, `cleanUrls`, `trailingSlash` |
| netlify | `netlify.toml`, `_redirects`, `_headers` | redirects/rewrites with status, splats, placeholders; headers; force |
| cloudflare-pages | `_redirects`, `_headers` | Netlify file syntax subset |
| nginx | `quality/host/nginx.conf` | `return`, `rewrite … permanent\|redirect`, `add_header`, `location` prefix/exact/regex, `try_files` |
| apache | `.htaccess` | `Redirect`, `RedirectMatch`, `RewriteRule` `[R=301\|302,L]`, `Header set` |
| none | — | pass-through |

Unsupported directives are listed; rules depending on them run only in G8.

---

## 4. Processes, databases, platforms, fault injection

### 4.1 Process supervisor
Windows Job Objects / Unix process groups; `shell` per command (`none` = direct exec, default); environment = user environment + policy `env` + shipgate variables; logs to `quality/out/logs/<service>.log`; readiness via `verifyEnv.health` with exponential backoff to `timeoutSec`; whole tree killed on exit; Windows long paths and `.cmd` shims handled.
- **Graceful stop (OPS-012):** on Unix, SIGTERM, then wait up to `ops.shutdownSec`, then kill. On Windows, the tree is killed directly, so OPS-012 is `skipped(platform)`.
- **Missing-variable start probe (OPS-010):** after G3, each service is started once more with one required env-module variable removed (chosen by the lock-digest PRNG). Expected outcome: a non-zero exit within `verifyEnv.health.timeoutSec`, with the variable's name in the output.

### 4.2 Database lifecycle
1. Start each `embedded` database (PostgreSQL, MySQL, SQLite file) from the managed toolchain on a free port, temp data dir, current user (root containers: drop to an unprivileged user or require `external`).
2. Detect required extensions from migrations; missing in the pinned build → `BLOCKED` listing them.
3. Platform prep (addon adapters) before migrations (§ 4.4).
4. Migrate: `data-api.db.migrations` (format + dir; overrides the adapter default) applied natively for `sql-dir`, otherwise the service's `migrate` command.
5. Seed once.
6. **Start services and log in every test account** (auth strategy); store sessions.
7. Snapshot all databases as templates (Postgres `CREATE DATABASE … TEMPLATE`; MySQL dump/restore; SQLite file copy) — sessions stored in the database are part of the snapshot.
8. **Mutating stages run one after another** in a fixed order. Every rule or part whose text says "(mutating stage, 04 § 4.2 step 8)" runs in one, and anything that writes, logs out or locks out an account must be marked that way. Probes in the read-only stage never change state.

   The order: G4 write probes, one stage per probe family:
   - SEC-007 non-GET probes, SEC-017, SEC-018, the SEC-023 write part, SEC-024, SEC-025, SEC-026, SEC-028, SEC-029, SEC-030, SEC-032;
   - SEC-036, SEC-038, SEC-039, SEC-041, SEC-045 `traversal` (non-GET) and `ssti`, SEC-046 replays, SEC-047 `stored`, SEC-048, SEC-049;
   - SEC-054, SEC-055, SEC-057 `behaviour`, SEC-062 `access`, SEC-064 `lifetime`, SEC-072;
   - API-009 concurrent requests.

   Probes that replay requests recorded during flows (SEC-024, SEC-036, SEC-041, SEC-046, SEC-047 `stored`, SEC-057 `behaviour`) first run their source flow on the fresh instance to record its requests, then replay them in the same stage.

   → job runs (JOB-002, one stage per job; OPS-013 overlapping runs) → fault injection → G6 mutating flows (each; then their keyboard replays for A11-019; PRV-016 deletion/export; PRV-021 withdrawal flows; A11-028 `on-input`; then REF-013 `sw-cache`, which revisits pages the flows saw) → the control click probe (UX-006: every inventoried control clicked once, with a reset after each page) → load.
   Embedded databases log statements during G6 (`log_min_duration_statement = 0` on PostgreSQL, the general log on MySQL) so DB-010 can `EXPLAIN` the observed queries afterwards. Before each: stop services and platform processes → drop and recreate the fixed-name database from the template → start → health. Read-only stages run against the untouched instance before the first mutating stage. Sessions stay valid because they were captured before the snapshot (step 6); flows that log in again use their own login steps.
9. Teardown deletes everything.

### 4.3 Seed contract
After step 6 every account in `auth.accounts` must have a working session; otherwise `BLOCKED(seed-contract)`, owner `operator` — except when seed inputs changed in the diff, in which case it is BLD-005 (owner `builder`).

### 4.4 Supabase-style platforms (addon `supabase`)
- **Schema prep, independent of binaries:** roles `anon`, `authenticated`, `service_role`, `authenticator`, `supabase_admin`; schemas `auth`, `storage`, `extensions`, `realtime`; the `auth` tables migrations commonly reference (`auth.users`, `auth.identities`, `auth.sessions`, `auth.refresh_tokens`), `storage.buckets`, `storage.objects`; functions `auth.uid()`, `auth.role()`, `auth.jwt()`, `auth.email()` reading `request.jwt.claims`; publication `supabase_realtime`; default grants. Shipped as versioned DDL in the toolchain.
- **Runtime:** PostgREST (managed binary) always where available; Supabase Auth (managed binary) where builds exist for the OS. The front proxy provides the gateway: `/rest/v1/*` → PostgREST, `/auth/v1/*` → Auth, `apikey` header checked against generated anon/service keys; `SUPABASE_URL` = the gateway origin.
- **Fallback (`external`):** a dedicated non-production project (CFG-004). Rules needing clones or writes against it (SEC-023 writes, SEC-024, SEC-028/029, fault injection, mutating flows) are `skipped(external-platform)` and listed; read probes still run.
- Storage and Realtime runtimes are not emulated: SEC-043/044 behaviour parts need `external`, else `notConfigured`.

### 4.5 Fault injection (core G4 facility)
Used by RTE-007 (owner of dependency-failure behaviour), RES-* and OPS-002. Dependencies come from the `hosts` registry (`purpose: "dependency"`) and databases. Faults: database stopped; HTTP dependency refused, delayed beyond `resilience.timeouts.upstreamMs`, or answering 5xx (egress proxy). Each fault runs on a fresh database instance (§ 4.2 step 8) against a 20-route sample per surface.

### 4.6 SMTP sink and egress proxy
Local SMTP on `{smtp.port}` captures all mail for flows and OPS checks. Server egress: services get `HTTP_PROXY`/`HTTPS_PROXY`/`NO_PROXY` and `NODE_USE_ENV_PROXY=1`. `NO_PROXY` lists only the exact `host:port` pairs of the verify environment's own databases, platform processes, SMTP sink and sibling services, never whole loopback or private ranges, so requests to other internal addresses stay observable. For SSRF probes (SEC-046), shipgate also runs canary listeners on loopback and on a private-range alias address. A probe counts as successful SSRF if a canary or the egress proxy receives a request carrying the probe's nonce, or if the response contains canary content.
- The proxy itself serves `ssrf-redirect.shipgate.test`, which answers with a 302 to the loopback canary (the redirect-to-internal probe).
- `*.shipgate.test` names never resolve outside the verify environment.
- The proxy records every connection to a loopback, private or link-local address.
- During rate-limit bursts and access probes against AI endpoints (SEC-054, SEC-062 `access`), requests to model-provider hosts (`hosts[]` entries with purpose `ai`, plus the ruleset `model-hosts.json` list) are stubbed, so probes never spend real tokens.
- **Outcome stubs win over forwarding:** a host named in any flow's `expectEgress` or in `ux.egressStubs` is always answered by its stub, server-side here and browser-side in § 6.1, for the whole run, even if `hosts[]` marks it `server: true` or `browser: true`. Form submissions, CRM leads and emails to real third parties never leave the verify environment. the egress proxy allows `hosts` entries with `server: true`, records everything else (SEC-004 finding), and serves fault injection. Processes ignoring proxy variables can't be contained without OS sandboxing; the report says so.

---

## 5. Diff base and sensitive paths

- **Hook sessions:** at the first `check` of an agent session, shipgate snapshots tracked files, untracked non-ignored files, and a fixed list of **ignored but sensitive paths** (`quality/verify.env`, `.claude/settings.local.json`, local variants of host hook configs, `.env*`) into the state dir. Diff rules compare against it. A changed hash on a sensitive path is a P0 AGT-001 finding; a changed `verify.env` additionally requires the Operator to re-lock (the lock stores `verifyEnvSha256`).
- **Verifier outputs** (`quality/out/**`) are not part of the snapshot: they change on every run. Instead shipgate records the SHA-256 of every file it writes there (reports, `handoff.json`, `break-glass.sig` it accepted) in the state dir; any content in `quality/out/` that doesn't match a recorded digest is ignored by every shipgate reader and reported as W (`foreign-output`).
- **CI / `verify`:** merge-base of `HEAD` with `baseBranch` plus uncommitted changes.
- **No git:** `†` diff rules are `blocked(no-git)` (the run is `BLOCKED`); non-† diff rules `skipped(no-git)`. Remote-only projects have no diff rules applicable.
- Known limit: a session snapshot taken after another session's uncommitted edits treats them as base; CI's merge-base diff catches this.

---

## 6. Browser

### 6.1 Driver matrix
| Need | Driver |
|---|---|
| Flows, axe-core, computed styles, hidden-text checks, raw-vs-rendered parity, layout, screenshots | Playwright (managed Node) with its pinned Chromium; Firefox/WebKit when listed |
| Page-load performance | Lighthouse navigation mode (managed Node) on the same Chromium |
| INP in flows | `web-vitals` `onINP` injected at page start, `reportAllChanges` |
| HTTP probes, raw HTML | Rust HTTP client |

**Third-party requests in the browser:** every request to a host other than the project's origins is intercepted (Playwright `route`): recorded (for PRV-*, PRF third-party budgets), then fulfilled by the real host only if it is in `hosts` with `browser: true` and isn't an outcome-stub host (§ 4.6, answered with its stub); otherwise answered with `204` (scripts: empty body, `application/javascript`). Errors thrown by scripts from non-origin hosts are excluded from RTE-013/TST-009. Lighthouse runs with the same policy; third-party costs are reported separately (PRF-006).

### 6.2 Aggregation
Lighthouse runs `runs` times per sampled URL; median per URL; maximum across URLs of a route group vs the most specific budget.

### 6.3 Host calibration (TR-111)
At the start of G4, before any timing measurement, shipgate runs Lighthouse's benchmark 3 times and records the median `benchmarkIndex` in the report. Timing rules compare against it (TR-111).

---

## 7. `brief`

Deterministic; free text is never interpreted.
**Inputs:** `--paths`, `--routes`, `--service`, `--surface`, `--family`, `--kind feature|fix|refactor|migration|content|dependency`, `--tags`.
**Resolution:** path → service → file role (§ 7.1) → routes/surfaces → enabled packs → rules whose `appliesTo` matches (+ kind rules: refactor → REF-*, migration → DB-*, dependency → SEC-051/052, ARC-007, AGT-009).
**Output:** ≤ 40 rules ranked severity → gate → id, each with title and fix hint; policy excerpts ≤ 60 lines.
**Delivery:** session start (repo summary ≤ 40 lines), first touch of each file (`brief --paths`), prompt submit (rules whose `tags` match prompt words exactly, ≤ 10).
**Start of a project (`brief --stage start`, also injected at session start while `project.stage: "new"`):**
- the **launch definition of done** for the declared `project.kinds`: the P0/P1 rules that will apply at launch, grouped by pack, ≤ 60 lines;
- the **Operator inputs still missing**: business facts, legacy URLs (when replacing a site), flows per `journey`, contracts, analytics processor, legal pages and jurisdictions;
- the **foundation recipes** for the detected adapter: fix-hint snippets for security headers, the consent loader, error pages, the health endpoint, robots/sitemap and the form handler. These are hints the agent applies; shipgate never writes them (TR-104).

### 7.1 File roles
Adapter `fileRoles` patterns first (e.g. Next: `app/**/page.*` → route, `app/**/route.*` → api-handler, `app/**/layout.*` → layout), then generic defaults: `**/*.{test,spec}.*`, `**/__tests__/**`, `tests/**`, `test/**` → test; migrations dir → migration; `**/*.{css,scss,sass,less}` → style; `quality/data/**` → data; config files (`*.config.*`, `tsconfig*.json`, `package.json`, `pyproject.toml`, …) → config; image/font extensions → asset; remaining source files under route trees → component; else `source`.

---

## 8. `check`, stop, detached verify, budgets

| Mode | Budget | Runs |
|---|---|---|
| `pre` | ≤ 300 ms, no toolchain/network | protected paths/keys, sensitive paths, role write scopes, command policy (§ 8.2), Operator-command gating |
| `post` | ≤ `timeBudgets.check` (10 s) | lock (mtime+size cache), diff rules, `ast` rules on changed files, `graph` rules on the reverse-import closure (≤ 2,000 files; else deferred), data validation if data changed, brief injection |
| `stop` | ≤ min(`timeBudgets.stop`, host timeout − 5 s); in practice < 2 s | reads the **sealed verdict record** (§ 8.1) |
| `verify --changed` | ≤ `timeBudgets.verify` | G0–G2; G3 for affected services; G4/G6 on routes affected by changed files and flows touching them → at most `PARTIAL` (FAIL/BLOCKED reported as is) |
| `verify` | ≤ `timeBudgets.verify`; rules with `profile: nightly` only under `--profile nightly` | everything |

**Budget exhaustion:** gates not finished when the budget runs out are `BLOCKED(budget)`, owner `operator` (raise the budget or move rules to the nightly profile).

**Detached runs:** `verify --detach` starts a background job and returns its id immediately; `status --wait [--timeout <s>]` blocks until done or timeout and prints the summary. Agents use these so long runs never exceed shell-tool timeouts.

### 8.1 Sealed verdict record and stop rules
- The tree hash is computed **before G1**. Files generated by builds that are not git-ignored (e.g. `next-env.d.ts`, `*.tsbuildinfo`) are reported as W (`generated-file-not-ignored`) and excluded from later tree-hash comparisons.
- At the end of every `verify`, shipgate writes `<state dir>/shipgate/<repo-id>/verdicts/<treeHash>.json`: `{ treeHash, verdict, reportDigest, handoff, createdAt }` plus an HMAC-SHA256 with the per-install secret (03 § 7.1). Report files in `quality/out/` are for humans and tools; **the stop hook trusts only the sealed record**.
- **Stop is allowed when** the sealed record matches the current tree hash and either the verdict is `PASS` (from a full, non-PARTIAL run), or a Verifier-written handoff exists (reasons and conditions: 04 § 1.9).
- Otherwise stop is blocked with: "Run `shipgate verify --detach`, then `shipgate status --wait`, and fix the findings."
- Loop guard: after **3** consecutive blocked stops with an unchanged tree hash and no new verify, shipgate writes an `unverified-stop` handoff and allows the stop; the next `verify` and CI report it prominently as W, and AGT-007 counts it in the session summary.
- Break-glass: an Operator-signed `quality/out/break-glass.sig` (03 § 15) allows one stop for a given tree hash before its expiry.
- Honest limit: the install secret has no passphrase, so a process running as the same user could forge a sealed record locally; CI (which recomputes the verdict) is authoritative, exactly as for the lock (01 § 5.3).

### 8.2 Command policy evaluation
1. Tokenise per shell (bash, PowerShell, cmd); split pipelines, chains, subshells.
2. Resolve one level of indirection: package-manager scripts (`npm|pnpm|yarn|bun run <name>`, `npx <bin>` of known deploy tools) to their script bodies; `make <target>` to its recipe when a Makefile is present; `bash|sh|pwsh -c "<string>"` to the inner command.
3. Match each simple command against the built-in deny list (05 § 3.2) and the policy's `commandPolicy`.
4. Commands containing dynamic expansion (`$(…)`, backticks, `eval`, `Invoke-Expression`) whose literal text contains a denied token are denied.
5. Remaining gap (scripts written to files and executed later, compiled binaries): the post-hook diff and CI are the backstop; the report states it.

---

## 9. Findings: grouping, fingerprints, attempts

### 9.1 Failure classes (normative taxonomy)
`status-mismatch`, `redirect-chain`, `redirect-target`, `missing-element`, `duplicate-element`, `value-mismatch`, `forbidden-value`, `missing-header`, `header-value`, `leak`, `parse-error`, `budget-exceeded`, `access-allowed`, `access-denied-wrongly`, `schema-violation`, `contract-violation`, `diff-violation`, `pattern-match`, `cycle`, `orphan`, `inconsistent-set`, `similarity`, `skeleton-mismatch`, `visual-diff`, `flow-step-failed`, `runtime-error`, `vulnerability`, `licence`, `stale`, `quarantine-rate`, `command-failed`. Each rule's metadata lists the classes it can emit.

### 9.2 groupKey
| Channel | groupKey |
|---|---|
| http, html, site | rule + route pattern + failure class |
| ast, graph | rule + file + pattern id |
| content | rule + family / route group |
| browser (budgets) | rule + route group + metric |
| browser (axe, layout, flows) | rule + route group + check id (axe rule id / flow id + step index) |
| deps | rule + package + advisory |
| data | rule + family + field |
| db | rule + migration file / table |
| contract, baseline | rule + endpoint/route pattern + diff path |
| cfg, lock, diff, build | rule + path / command |
| cmd | rule + service + command |
| edge | as `http` |
| hook | rule + session + tool |
| review | rule + review target |

### 9.3 Debt location keys and matching
| Channel | locationKey |
|---|---|
| ast | file + enclosing symbol path + pattern id + occurrence index within the symbol |
| graph | rule + cycle member set (sorted) / import edge |
| http, html, site | route pattern + failure class |
| browser | route group + check id + normalised selector (axe) / flow id + step |
| content | family / route group + failure class |
| data | family + field + failure class |
| db | migration file + statement index / table + policy |
| deps | package@major + advisory |
| contract, baseline | endpoint + diff path |
| cfg, diff, build, lock | rule + path |
| cmd | rule + service + command; `occurrences` = diagnostics counted with the adapter's `diagnosticPatterns` (default 1) |
| diff (SEC-050 `history`) | path + `@` + first commit containing it + `#` + pattern id + `#` + first 12 hex of the value's SHA-256 |
| edge | as `http` |

Each debt item records `occurrences`; a higher count for the same key is a new finding. File renames are followed with git rename detection (similarity ≥ 50 %).

### 9.4 evidenceHash, dedupe, ranking
- Every groupKey (§ 9.2) and locationKey (§ 9.3) also includes the finding's `part` (§ 1.8). Findings of different parts, and so different severities, never merge, and W debt can't hide a P0 part.
- `evidenceHash` = SHA-256 of JCS `{ rule, part, groupKey, targets: first 50 sorted target ids, actualBucket }`; times bucketed to 100 ms, CLS to 0.01, bytes to 1 KB; counts, timestamps, nonces excluded.
- Dedupe: findings of a rule listed in another rule's `owns` merge into the owner. An owner never has a weaker waivability than what it absorbs (metadata validation rejects that).
- Ranking: severity → owner (`builder` first) → gate → rule id → groupKey.

### 9.5 Repair attempts
An **attempt** = a `verify` run on a tree hash different from the previous run in which the finding was reported. A finding becomes `exhausted` when its evidenceHash survives 2 attempts, or its groupKey survives 3 attempts (P2 budget findings use groupKey only, since bucketed values drift). Attempts are stored in the user state dir.

---

## 10. Crawl, discovery, sampling, route groups

- **Seeds:** `/`, sitemaps (robots `Sitemap:` + `/sitemap.xml`), declared static paths, adapter routes (params from inventory rows, fixtures, then probe values), inventory pages.
- **Normalisation:** service case/trailing-slash policy, drop fragments and tracking params, sort remaining query params.
- **Extraction:** `a[href]`, `area[href]`, `link[rel=canonical|alternate|next|prev]`, sitemap `<loc>`, redirect `Location`; same-origin after mapping.
- **Traps:** ≤ 3 query params per URL, ≤ 50 values per param per path pattern, depth ≤ 20, ≤ `crawl.maxUrls` (default 200,000) local, ≤ `crawl.remoteMaxUrls` (default 3,000) remote.
- **Order:** BFS, frontier sorted lexicographically per depth. Concurrency 16 local; remote 2 req/s (or lower `Crawl-delay`), GET/HEAD only.
- **Route groups:** adapter route patterns; else path clustering (> 20 distinct values at a position → `{param}`), then split by `<main>` skeleton hash.
- **Sampling** (above 50,000 indexable pages, remote mode, and browser gates): PRNG seeded with the lock digest; strata service × surface × family/route group × locale; ≥ 1,000 per family for HTTP (remote: proportional within the cap), ≥ 3 per route group for browser; always hubs, declared paths, fixtures, flow pages.
- **Graph rules:** inventory families use the oracle graph and verify a sample; crawl-only sites need a complete crawl, else graph rules are `skipped(incomplete-crawl)` with a warning.
- **Discovered routes:** CFG-003 is also evaluated in G4 on crawl-discovered routes.

---

## 11. Programmatic algorithms

**Formatting (inventory mode):** ICU4X, pinned CLDR version in the report. Field `format`: numbers `{ style: decimal|percent|unit, unit?, minFrac, maxFrac, grouping }`; money `{ display: symbol|narrowSymbol|code|name, minFrac?, maxFrac? }` (defaults from ISO 4217 digits); dates `{ dateStyle, timeStyle?, timeZone }`. Rounding half-even.

**Relations:** `nearest-by-geo` (haversine), `same-group:<field>` (by `priorityField` desc, then slug), `field-similarity:<fields>` (equal fields desc, then slug), `declared:<field>`. Ties → slug ascending; self excluded.

**Skeleton identity (TPL-004):**
1. Parse `<main>` (html5ever); drop comments, `<script>`, `<style>`, whitespace-only text.
2. Replace text of `data-fact` / `data-token` elements with `⟦name⟧`.
3. Mask values of `href`, `src`, `srcset`, `alt`, `title`, `aria-label`, `data-value`, `datetime`, `content`.
4. Replace all children of each `data-list` container with a single `⟦list⟧` placeholder (empty and non-empty lists hash the same).
5. Detach every `data-section` element from the tree **without leaving a placeholder**. A section is *present* when its field has a value for the row. `aiText` fields that aren't reviewed (DAT-015) count as absent here, in the oracle and in the inventory.
6. **Main hash:** canonical serialisation of what remains (sorted attributes, collapsed whitespace, NFC) → SHA-256. All pages of a family/locale share one main hash.
6a. **Section presence and order:** on each page, the detached sections are exactly the present fields, none missing and none extra. They appear in template order: the order of the family's sections in the field declaration.
7. **Section hashes:** each detached section is hashed with steps 2–4 and 6 applied to its own subtree. Every instance of a section name across the family/locale must have the same hash.
8. The report shows the first differing node path (main or section).

**Similarity (CNT-006):** row-specific text only; UAX #29 words, NFKC + lowercase, 5-shingles, MinHash 128 (fixed seeds), LSH 32×4, exact Jaccard on candidates; `omit` drops the lower `priorityField` row (ties → later slug).

**Live-mode snapshot and parse-back:** `commands.snapshot` or `family.snapshot { db, sql }` → JSONL. Parse-back: digits of any numbering system → ASCII; CLDR grouping/decimal separators; all space variants equal; currency by symbol/narrow symbol/code mapped to the data's ISO code; percent position free; dates against the locale's CLDR patterns at four lengths comparing Y/M/D (+ h/m). Also used by SCH-006 for prices and dates. Unparseable → fail with code points shown.

---

## 12. Parity, soft-404, leaks

- **Raw vs rendered (RTE-001):** token overlap of `<main>` text raw vs rendered ≥ `parity.minOverlap` on browser-sampled pages.
- **Mobile vs desktop (RTE-014):** raw `<main>` text and links under smartphone vs desktop Googlebot UAs, overlap ≥ `parity.mobileMinOverlap`; head metadata (title, description, robots, canonical, hreflang pairs, JSON-LD `@type` set) compared for equality.
- **Soft-404:** title, H1 and the first 200 characters of `<main>` vs per-locale `soft404Phrases` (the ruleset ships complete lists for 20 major locales); or near-empty `<main>` (< 50 words and no fact slots).
- **Leak scan (MET-008):** template markers (`{{…}}`, `{field}`, `${`, `<%=`, `%s`/`%d`, `[INSERT`, `[object Object]`) everywhere except `<code>`, `<pre>`, `<kbd>`, `<samp>`, `<script>`, `<style>`, `<template>`. The words `undefined`, `NaN`, `null`, `TODO`, `FIXME`, `TBD` only where they make up the **entire** value of: `<title>`, meta description, `og:*`, `<h1>`, an attribute value, a `data-fact`/`data-token` element, or a table cell — never in ordinary prose (filler text such as lorem ipsum is owned by MET-011 everywhere). `data-shipgate-ignore="leaks"` excludes an element and is reported as W.
- **Error leakage (SEC-007):** response bodies of error probes are scanned for stack-trace patterns (`at <fn> (<path>:<line>`, `Traceback (most recent call last)`, `Exception in`, `.php on line`, `stack:`), SQL error signatures (`SQLSTATE`, `syntax error at or near`, `You have an error in your SQL syntax`, `ORA-\d+`), absolute file paths (`/home/`, `/var/www/`, `C:\`), framework debug-page markers, and internal hostnames (`localhost`, RFC 1918 addresses).

---

## 13. Static analysis precision

- **AGT-003:** non-null assertions/unwraps on values whose data-flow origin (same function) is an adapter-declared source (HTTP client responses, JSON parse, request params/body, DB results, env reads).
- **AGT-004:** transforms between base and head of a test: deleted assert/expect calls, fewer assertions in a kept test, matcher widening (`toEqual`→`toBeTruthy`/`toBeDefined`, `assertEqual`→`assertTrue`), removed test cases/files, added skip markers, assertions whose two sides are the identical expression (part `transform`). Expectations that merely look derived from the implementation → part `derived-expectation` (W).
- **SEC-001:** a raw-HTML sink's argument must be (a) a direct call to `safeJsonLd(...)` or to the configured sanitizer, or (b) a variable assigned exactly once, in the same function, from such a call. Anything else in scope is a finding.
- **SEC-050 secret scan (diff):** provider key patterns from the ruleset (AWS, Stripe, GitHub, Google, Supabase JWTs, Slack, OpenAI/Anthropic, private-key PEM headers) (part `provider-pattern`) and literal values of non-public env vars from `verify.env` (part `env-value`) are P0†; generic high-entropy strings are part `entropy` (W); lockfiles, `*.svg`, source maps and binary files are excluded.
- **AGT-010 (`swallow` part, P0†):** empty catch/except/rescue blocks; catch blocks that return an HTTP success status, render a page, or call not-found/404 without rethrowing or logging (adapter `loggerApis`). Catch blocks that return a fallback value while logging or rethrowing are allowed; catch blocks returning a fallback **without** logging → part `fallback-unlogged` (W).
- **URL-003:** URL construction whose result flows into an emitted sink (HTML attributes, canonical/meta, sitemap writer, JSON-LD) and whose origin includes request URL/headers/query.
- **ARC-006:** calls to adapter-declared API families (HTTP client, formatter, URL builder, auth guard, DB client) outside the declared singleton module.
- **ARC-008:** files, exports and dependencies added in the diff that nothing imports, excluding adapter-declared framework entry points (route files, config files, exported route handlers, `generateMetadata`-style exports) and files listed in `architecture.entryPoints`.
- **ARC-009:** string literals shaped like URLs/hosts, API keys or UUID ids outside the env/config module and tests, excluding `schema.org`, `w3.org` namespaces and hosts in the `hosts` registry.
- **TPL-001:** string literals > 80 characters **rendered as text nodes** in family route files; attribute values (`class`, `className`, `style`, `d`) excluded.
- **RTE-010 (source hint, W):** reads of user-agent/IP inside render paths that select different content; `security.analyticsModules` excluded.
- **RTE-011:** allowed: year-only formatting, CSP nonce generators, request ids not rendered into indexable content.
- **DB-003 "code still referencing":** after a migration renames/drops column `c` of table `t`, changed or existing code still containing `t.c`/`"c"` in adapter `queryApis` calls or ORM model definitions for `t`.
- **Scope:** every ast/graph rule declares `scope: changed` (only changed lines/symbols) or `repo` (whole repository). Default `changed`; `repo` only for SEC-001, SEC-031, ARC-002, ARC-010 and adapter traps that must hold globally.

---

## 14. False-positive governance and rulesets

- Every rule starts `experimental` and becomes `stable` when its corpus passes: ≥ 3 known-good projects (synthetic per-adapter fixture apps count) with zero findings and ≥ 1 known-bad fixture per failure class detected. A **launch-stable list** in the first ruleset names the rules that ship stable on day one.
- `shipgate report-fp <evidenceHash>` packages a redacted repro (never sent automatically).
- `policy.ruleOverrides`: `off` and `warn` for non-† rules; for `†` rules only `warn`, with `expires` ≤ 14 days and a mandatory `fpReport` (the `report-fp` hash), printed on every report while active. `experimental-on` makes an experimental rule block at its declared severity.
- Vendor hotfix rulesets (`YYYY.MM.N`) can demote a rule; projects adopt them by bumping `ruleset`.
- A finding whose fix lies outside the Builder's owned paths (`fixLocation`) is reassigned to owner `operator`.
- The binary embeds the current ruleset and the 3 previous ones.

---

## 15. Supplementary definitions

- **treeHash:** SHA-256 over sorted lines `path\0sha256\n` for all tracked files plus untracked non-ignored files of the working tree (computed before G1).
- **repo-id:** first 16 hex characters of SHA-256 of the canonical absolute path of the worktree root (each git worktree is its own repo-id).
- **Reference time:** rules that depend on "now" (SE-104 news recency, SE-108 expiry, freshness warnings) use the HEAD commit time (or `dataAsOf` for data rules), never the wall clock, so reports stay deterministic. Exceptions: every observation made in the edge pass (G8), plus LNK-006/007, depends on live systems. Those that are time-based (SEC-056 certificate validity, SEC-059, IDX-011) use the wall clock. All of these results are marked non-deterministic in the report and are excluded from the determinism tests.
- **E.164 normalisation:** libphonenumber metadata from the toolchain. The default region is the country of the business-facts location the page belongs to (`pagePath`), else the region of `defaultLocale`, else none (the number must be in international format).
- **robots.txt evaluation:** RFC 9309. Use the most specific matching user-agent group, or the `*` group if none matches. Allow/Disallow resolve by longest match, with Allow winning ties. `$` and `*` wildcards are supported. Engine-specific groups don't inherit from `*`. Used by IDX-008, IDX-011, SE-002 and SE-301.
- **Swap similarity (CQ-008):**
  1. Within one route group, replace place names from the ruleset gazetteer with `⟦place⟧` (longest match, NFKC, case-folded).
  2. Find candidate pairs with MinHash/LSH (§ 11 parameters) at Jaccard ≥ 0.5 on the masked text.
  3. A pair is swap-similar when, on a word-level Myers diff, matched words plus words in substitution hunks of ≤ 3 words on each side make up ≥ 0.8 of the longer text.
  4. A connected component of ≥ 5 swap-similar pages is a finding.
- **Reference year:** the calendar year of the reference time (CQ-009 and other year checks).
- **Dead control (MET-011 `dead-anchor` for `<a>` elements on public pages; UX-006 for `<a>` elements on `app` pages and all other controls):** the control is actually clicked in the control click probe (a registered listener is not enough). It is dead when, within 1 s, the click causes none of these:
  - a navigation;
  - a network request;
  - a DOM mutation outside the element;
  - a focus change;
  - a dialog;
  - a change of `aria-expanded`, `aria-pressed` or `aria-selected`.

  Controls with native activation behaviour (`<summary>`, `<label>`, submit and reset buttons, `popovertarget`/`commandfor` buttons) are judged by their native effect. On public pages every `<a>` whose `href` is absent, empty, `#` or `javascript:` belongs to MET-011 `dead-anchor`, whatever its role.
- **Copyright holder (MET-011 `copyright`):** the text after `©`/`(c)`/`Copyright` and an optional year range, up to the end of the sentence or element, compared with `brand`, `siteName`, `business.json` `name`/`legalName` and `placeholderAllow`.
- **Visible dates (AEO-006, AEO-012, mainTextHash):** `<time datetime>` elements, plus text matched by the locale's CLDR date patterns within 200 characters after the `<h1>` or inside elements whose class or id contains `date`, `updated`, `published` or `byline`.
- **Alias-host wildcards (URL-011):** an adapter's `defaultAliasHosts` entry with a wildcard is resolved from platform config: the Vercel project name in `.vercel/project.json` or `vercel.json`, the Netlify site name in `netlify.toml` or `.netlify/state.json`, the Pages project name in `wrangler.toml`. If no concrete host can be resolved, that entry is `notConfigured` (W) and the report asks the Operator to list it in `aliasHosts`.
- **Fallback body (SEC-034):** the response to a random non-existent path `/sg-{n}<ext>`, normalised (nonce, dates and request ids removed) and hashed. A probe response with the same masked hash is a fallback, not an exposed file.
- **No side effect:** before and after the probe, shipgate compares the row count and the hash of rows (excluding columns named `updated_at`, `updatedAt`, `modified_at`, `modifiedAt`, `last_seen_at`, `lastSeenAt`, `last_login_at`, `lastLoginAt`, and timestamp columns the adapter declares) of every table the seeded database contains. Any difference is a side effect. Captured emails and egress requests are compared too.
- **Default `remote` metadata:** rules whose channels are only GET/HEAD-capable (`http`, `html`, `site`, `content`, `browser`, `edge`) default to `read`; rules that send writes, login attempts, fuzzing, load or faults declare `write`; `ast`, `graph`, `diff`, `deps`, `cmd`, `data`, `db`, `build` are `none` for remote services.
- **Default field formats (inventory mode):** `int` → decimal, grouping on, 0 fraction digits; `number` → decimal, grouping on, max 2 fraction digits; `money` → `symbol`, ISO 4217 minor digits; `date` → `medium`; `datetime` → `medium` date + `short` time in the site time zone; `bool` → localized yes/no from the ruleset; `geo` → not rendered as text (coordinates only in data attributes and JSON-LD).
- **AI-text number detection (DAT-014):** numeric tokens are runs matching the locale's CLDR number pattern (with grouping/decimal separators, optional currency symbol or percent sign); spelled-out numbers are ignored; 4-digit tokens between 1900 and 2100 are treated as years and must match a year of a date field; money values are compared in major units against `money` fields; dates are found with the locale's CLDR date patterns.
- **aiText provenance:** a field of type `aiText` implicitly declares its five sibling fields (`<f>Model`, `<f>GeneratedAt`, `<f>PromptVersion`, `<f>ReviewedBy`, `<f>ReviewedAt`); they are not unknown keys. YMYL reviewer authority = family key `ymylReviewers: [names]`.
- **Index rate (ROL-003):** `indexed URLs of the wave ÷ all URLs of the wave`; wave URLs absent from the export count as not indexed.
- **Contract request generation (API-002):** for every operation and every documented response status, one request built from the operation's examples, else from a minimal valid instance of the request schema (required fields only, first enum value, minimum lengths); statuses that need special state (401, 403, 404) are produced with the anonymous account, the other tenant's account, and a probe id.
- **Fuzzing (SEC-030):** per operation, seeded by the lock digest: each required field removed in turn, each field with a wrong JSON type, one 10 KB string field, one unknown extra field; expected 400/422 with the error shape.
- **Facet probes (SE-130/131):** for each `facets.params` entry, a request with the value `shipgate-none` (expected 404), a request with parameters in reversed order and one with a default value from `facets.defaults` (both expected to redirect once to the normalised URL).
- **Same-colour text (CNT-009, SE-123):** contrast ratio between text colour and computed background < 1.1.
- **Production project refs (CFG-004):** values of `production.keyPrefixes` and Supabase project refs extracted from `production.origins`/`hosts` entries ending in `.supabase.co`.
- **CI detection:** true when shipgate's own process environment has any of these set: `CI=true`, `GITHUB_ACTIONS`, `GITLAB_CI`, `BITBUCKET_BUILD_NUMBER`, `TF_BUILD`, `CIRCLECI`, `BUILDKITE`. It decides the trust-store source (`SHIPGATE_TRUSTED_KEYS`, 03 § 7.2), `verifyEnv.reduced.where: "ci"` and `baseline --ci`. It can be spoofed on a local machine, so setting these variables is on the agent deny list (05 § 3.2) and CI itself stays authoritative.
- **Owners of BLOCKED gates:**
  - A missing toolchain, port exhaustion, a database engine failure or another environment fault has owner `operator`. The reason is `tool-error` if shipgate itself crashed, otherwise `operator-owned`, and the gate gets a handoff (§ 1.9).
  - A gate blocked by a prerequisite takes the owner of the gate that blocked it.
- **`verify --resume`:** reuses cached results of gates that finished in the previous run for the same tree hash and lock; never used for the definition-of-done run.

## 16. Caching

Key = SHA-256 of (lock digest, ruleset, verifier version, toolchain manifest hash, environment hash, tree hash for G1+ / input-file hashes for G0). Stored in `quality/out/cache/<gate>/`. Never reused across lock changes. `--no-cache` for the definition-of-done run and base-branch CI.
