# shipgate — System Specification (index)

```yaml
spec_version: 8.0.0
status: source of truth for the tool build
working_name: shipgate        # rename freely; nothing depends on the name
date: 2026-10-22
history: v3 (Gemini draft) → v4.x (merged reviews: Claude, GPT, DeepSeek, Grok) → v5 (single-file SEO spec) → v6 (any product, any stack; core + adapters + packs) → v7 (independent gap audit resolved: formats, algorithms, integrations, new packs) → v7.1 (verification audit resolved: verdict engine, enforcement chain, remote mode, missing schemas, decidability; answer-engines pack) → v7.2 (multi-engine search-engines pack, programmatic AI-text/rollout/crawl rules, readiness audit resolved; BUILD_MAP and orchestrator prompt added) → v7.3 (final readiness audits: GO; two-step verdict so narrow runs can't hide FAIL; reduced mode only via signed policy; handoff conditions; per-part severities in keys; section-aware skeleton identity; CI detection; operational-only precedence; test-keys signing; full WP ownership) → v7.4 (outcome coverage audits: launch and re-platforming checks, placeholder/business-fact oracles, ux pack, local and ecommerce search, trust pages, AI agents, OWASP 2025 probes, supply chain, Consent Mode v2 / CCPA 2026 / EAA / AI Act, WCAG 2.2 gaps, verifier-evasion detection, new-project lifecycle, host-calibrated budgets) → v7.5 (round-06 concreteness audit: 404 findings fixed; ownership ledger, spec-lint, completeness contract) → v7.6 (round-07: 436 findings fixed, done-gate hardened) → v7.7 (round-08: 387 findings fixed; gate produces its own evidence) → v7.8 (round-09 single-writer consistency pass; Stage 0 closed by the Operator, build starts) → v8.0 (scope correction by the Operator: from a pass/fail verifier to the whole growth pipeline — intake, research, plan, gate, measure, iterate — with seven entry modes; targeting and measure packs; growth connectors)
```

## What shipgate is

The system that gets a site found, ranked, chosen and cited, for **anything reachable in a browser** (marketing sites, programmatic SEO sites, SaaS apps, APIs, multi-service platforms, plain HTML sites and hosted-builder sites, on any stack), built by AI coding agents (Claude Code, Codex, Cursor, OpenCode, Antigravity, custom loops).

It works the way an enterprise agency does, as one pipeline (06):
1. **Intake:** the business, its markets, offerings and goals.
2. **Research:** what people actually search, with what intent, who ranks and why, the content and link gaps, adjacent demand, and who the AI engines cite.
3. **Plan:** a site architecture and a brief per page drawn from that demand, priorities, and an off-site plan.
4. **Build:** agents build, **briefed** automatically with the page's brief and only the rules that apply, with every edit **checked** through hooks.
5. **Gate:** completion is gated with a verdict shipgate computes itself, on technical quality and against the approved plan; behaviour is **locked** before refactors to prove nothing broke.
6. **Measure:** rankings, clicks, index status, AI citations, field speed and conversions in production.
7. **Iterate:** results turn into the next plan.

It starts from wherever the site is: an existing repo, a live URL with no code, a refactor, a site built from scratch, a comparison of two sites, research only or measurement only. Agents write the code and draft the judgement parts of plans; the Operator signs the policy, the targets and the plan; shipgate computes every number and owns the verdict. The gate runs on the device alone (no Docker, no global installs); research and measure use the data providers the Operator connects.

This spec is for the tool and the people/agents building it. **Agents using shipgate never read it.**

## File map

| File | Contents | Load when building |
|---|---|---|
| `spec/01-core.md` | Principles, scope, surfaces, rule model, ownership, signed lock, waivers, debt ratchet, core policy rules, modes, pipeline (G0–G9), agent conduct, roles, tool requirements | always |
| `spec/02-adapters.md` | Coverage tiers, composition, engines (ast-grep-core + oxc), built-in adapters and traps, local databases, adding stacks | stack support, source rules |
| `spec/03-formats.md` | Grammars (URL patterns, globs, tokens, command policy), policy schema + defaults, auth/test accounts, rule metadata, adapter manifest, lock, debt, flows, refactor, baselines, inventory, report/SARIF, agent-side files | any reader/writer |
| `spec/04-algorithms.md` | Verdict, origin mapping, host emulation, processes/databases/platform services, diff base, browser driver matrix, brief, check/stop budgets, grouping & hashing, crawl & sampling, programmatic algorithms, parity/soft-404/leaks, static-analysis precision, false-positive governance, caching | engine subsystems |
| `spec/05-integrations.md` | CLI surface, `init`, agent-host hook matrix, MCP mode, CI, versioning, releases, licensing, telemetry, growth connectors | CLI, installers, release, connectors |
| `spec/06-growth.md` | Stage model, entry modes and stage sequences, intake, research, plan, build briefs, measure, diagnosis, growth algorithms | intake, research, plan, measure, diagnosis |
| `spec/packs/targeting.md` | The site against its approved targets and plan: planned pages exist, no cannibalisation, query placement, terms, outline, links, schema, depth, proof, intent fit | sites with signed targets |
| `spec/packs/measure.md` | Post-launch signals (W only, never a verdict): index status, ranking, unplanned demand, CTR, AI visibility, field speed, authority, conversions, local consistency | production sites |
| `spec/packs/web-delivery.md` | Full SEO: rendering, status, URLs, metadata, structured data, links, sitemaps, robots & AI crawlers, i18n, mobile parity, content quality, keyword targeting | public surfaces |
| `spec/packs/search-engines.md` | Engine-specific: Google features (Discover, News, Images, Video, Merchant, Jobs, paywall, site names), spam-policy compliance, faceted navigation, robots.txt robustness, Bing/Copilot, Yandex, Naver, Baidu, Seznam, Apple; ruleset-maintained feature tables | public surfaces |
| `spec/packs/answer-engines.md` | AEO/GEO: snippet controls, entity identity, authors, answer-ready structure, citations, freshness, IndexNow, crawler reach at the edge, text-first content | public surfaces |
| `spec/packs/programmatic.md` | Dataset-generated page families: data contracts, quarantine, templates-as-data, oracle, anti-doorway checks, AI-text governance, demand gating, cannibalisation, staged rollout, crawl efficiency | programmatic SEO |
| `spec/packs/performance.md` | Core Web Vitals budgets, INP in flows, images, fonts, caching, compression, API latency | everything user-facing |
| `spec/packs/accessibility.md` | WCAG 2.2 AA automated checks incl. reflow, text spacing, focus, auth | public + app |
| `spec/packs/security.md` | Output safety, headers, cookies, CORS, auth/authorization/session probes, payments, realtime, storage, secrets, dependencies | everything |
| `spec/packs/privacy.md` | Consent, processors, legal pages, PII leakage | public + app |
| `spec/packs/architecture.md` | Layers, server/client boundaries, env module, data access, singletons, dependency policy | source structure |
| `spec/packs/data-api.md` | Contracts vs real responses, breaking changes, migrations, RLS, jobs | APIs, databases |
| `spec/packs/resilience.md` | Fault injection: database down, slow/failed upstreams, blocked third parties | apps, APIs |
| `spec/packs/ops.md` | Logs, health, error reporting, email | apps, APIs |
| `spec/packs/testing.md` | Operator-owned flows, project tests, cross-browser, mutation sampling | apps with journeys |
| `spec/packs/refactor.md` | Behaviour + visual baselines, allowed changes, re-platforming from a live site (remote baselines, legacy URLs) | refactors, migrations, site rebuilds |
| `spec/packs/ux.md` | Real-use basics: every form proven to deliver, business facts oracle, contact links, error pages, dead controls, cross-browser smoke, visual collateral damage, analytics/conversion firing | public and app surfaces |

Rule prefixes — core: `CFG AGT BLD` (tool requirements `TR`) · web-delivery: `WCF RTE URL MET SCH LNK IDX I18 CQ KW TRS` · search-engines: `SE LOC` · answer-engines: `AEO` · programmatic: `PCF DAT TPL CNT PLK ROL CRW` (+ `KW-003`) · `PRF` · `A11` · `SEC` · `PRV` · `ARC` · `API DB JOB` · `RES` · `OPS` · `TST` · `REF` · ux: `UX` · targeting: `TGT` · measure: `MSR` · growth tool requirements `TR-2xx` (06) · adapter traps `<ADAPTER>-NNN`.

## Architecture decision (tool)

- **Rust core:** config, signed lock, data validation, inventories, source analysis (ast-grep-core on tree-sitter for structural YAML rules in every language; `oxc` for JS/TS semantics and module graphs), SQL parsing, process supervisor, front proxy with TLS and host emulation, egress proxy, SMTP sink, crawler, HTML parsing (`html5ever`), site graph, content analysis, HTTP probes, baselines, verdict, reports, hook adapters, MCP server (`rmcp`).
- **Managed Node subprocess** only for Playwright (flows, axe-core, layout, screenshots, web-vitals) and Lighthouse (navigation mode), sharing one Playwright-pinned Chromium.
- **Managed tools:** OSV-Scanner (offline database), PostgreSQL/MySQL builds, PostgREST, Supabase Auth.
- **Runs on the device alone:** everything fetched on first use into the user cache, pinned and checksum-verified, then offline.
- **Distribution:** signed binaries per platform on releases + npm platform packages (`npx shipgate`); cargo later.
- **Commercial, closed source;** offline signed licences; no telemetry.

## Decision log

Settled; re-open only with the Operator.

| Decision | Chosen | Rejected (why) |
|---|---|---|
| Form | Growth pipeline with a verifier at its core (v8.0, Operator): intake → research → plan → build → gate → measure → iterate; spec is its source; agents get stage and rule slices | A pass/fail verifier only (v7: left research, strategy and measurement out by definition, so a technically perfect site still didn't rank); big Markdown prompt/skill |
| Entry points | Seven modes over one pipeline: audit a repo, audit a live URL, refactor, new site, compare, research, measure (06 § 2) | Codebase-only entry |
| External data | Gate offline and deterministic; research and measure online through Operator-connected providers (keychain credentials, cached, budgeted); every number sourced and dated; a missing provider is BLOCKED, never guessed (06 G1–G5) | Calling providers inside `verify` (non-deterministic verdicts); model-estimated numbers |
| Scope | Any browser-reachable product, any stack; core + growth stages (06) + adapters + 17 packs (incl. search-engines, answer-engines, ux, targeting and measure); new projects from scratch, live projects, re-platforming and launch | SEO-only; existing-projects-only |
| Search engine coverage | Shared fundamentals (web-delivery) + engine-specific pack for Google, Bing/Copilot (and DuckDuckGo/Yahoo via Bing), Yandex, Naver, Baidu, Seznam, Apple; Google feature requirements in ruleset-maintained tables refreshed every release from the engines' docs | Google-only rules; hard-coded feature requirements that go stale |
| Build scope | Full system, built by agents in dependency order from a build map | Narrow v1 slice |
| Stack support | Behaviour checks everywhere; source depth by earned tier; `minCoverage` per service | Pretending equal depth everywhere |
| Role | Intake + research + plan + brief (auto-injected) + check + gate + refactor baselines + measure + iterate (v8.0) | Gate-only (v7; the reason a passing site still didn't rank); tool-generated code |
| Oracle | Policy + data, contracts, Operator flows, signed baselines | Tests calling the app's own code |
| Acceptance criteria | Operator-signed; agents draft proposals only | Agent-defined contracts |
| Spec layout | Index + core + formats + algorithms + integrations + one file per pack | Single huge file |
| Verdict model | PASS / FAIL / BLOCKED / PARTIAL; gates PASS/FAIL/SKIPPED/NOT_CONFIGURED/BLOCKED | Any non-PASS gate blocks (made every normal run BLOCKED) |
| Local vs production identity | Origin mapping through a local TLS front proxy + host emulation + preview pass + edge pass | Running on localhost URLs (every canonical rule fails) |
| Existing repos | Signed debt ratchet; † rules only with ≤ 90-day expiry | Fix everything first; unlimited debt |
| Lock | Operator Ed25519 signature; private key in the OS keychain encrypted with a never-stored passphrase (Argon2id); keychain-backed trust store with `operator`/`ci` roles; CI pins keys in settings; `_main` baselines signed by the CI role and excluded from the lock | Digest in a CI secret; plain-file trust store; keychain without passphrase (readable by any same-user process) |
| Stop decision | Sealed verdict record (HMAC with an install secret) in the user state dir; stop allowed on sealed PASS or Verifier handoff | Trusting `quality/out/report.json` (agent-writable) |
| Project commands | BLD-001..005 rules (typecheck, lint, tests, build, start) owned by the Builder; BLOCKED only before project code runs | Treating build/start failures as BLOCKED (an agent escape hatch) |
| Rule evaluation | Channel → gate table; per-rule outcomes; `scope: changed\|repo`; `remote: read\|write\|none`; `profile: default\|nightly` | Single gate per rule; implicit scopes |
| Remote/production targets | Only `remote: read` rules; capped sampled crawl; preview pass skipped | Write probes against live sites |
| Hosts | One `hosts[]` registry (`server`, `browser`, `essential` flags; `dependency` as a purpose) | Five overlapping allowlists |
| Browser third parties | Recorded, then stubbed unless allowed; non-origin script errors excluded | Real third parties everywhere (flaky) or blocked (false errors) |
| Fault injection | Core G4 facility; RTE-007 owns page behaviour | Only inside the resilience pack |
| Answer engines (AEO/GEO) | Separate pack; decidable rules P1, heuristics W; citations not promised | Speculative tactics as blocking rules |
| AI-written programmatic text | Allowed only as a dataset field with provenance, grounded (every number/date matches the row), human-reviewed before it renders, never counted toward eligibility, disclosed on the page (per Google's 2026 guidance: fact-check and review all AI content) | Unreviewed AI prose; sampled review; AI text as the page's value |
| pSEO publication | Staged rollout in Operator-released waves gated by index rate from a Search Console export; demand gating; cross-family cannibalisation and duplicate checks; TTFB budget and 304 support for crawl efficiency | Launching every page at once; noindex as a crawl-budget tool |
| Operator commands | Interactive TTY + keychain; denied in agent sessions | Trusting agents not to run them |
| Runtime dependencies | None beyond the device; managed toolchain | Docker |
| Databases run locally | PostgreSQL, MySQL, SQLite | Postgres only |
| Supabase runtime | Managed PostgREST + Supabase Auth where builds exist; else dedicated non-production project | Vendor local stack (needs Docker) |
| Browser | Playwright + its pinned Chromium; Lighthouse navigation mode on the same binary; INP via web-vitals | Chrome DevTools from Rust; Lighthouse timespans in Playwright (unsupported); separate Chrome for Testing |
| Logins | Strategies: login flow / command / header; seed contract; SMTP sink; TOTP | Undefined credentials |
| `brief` | Deterministic from paths/routes/kind; auto-injected at session start, first file touch, prompt tags | Free-text interpretation |
| Stop hook | Allows stop only with a PASS report or handoff for the current tree; never runs long work | Running verify inside the hook (timeouts) |
| Rule rollout | experimental (W) → stable after conformance corpus; signed kill-switch | Rules blocking from day one |
| Versioning | Pinned verifier range + ruleset (`YYYY.MM`) + `migrate` | Floating versions |
| Formatting parity | Inventory mode formats once (ICU4X); live mode = exact machine value + parse-back | Bridges between runtimes |
| Skeleton & similarity | Token-wrapped templates, masked skeleton hash; similarity on row-specific text only | Whole-text similarity (flags every family) |
| Tracking params | 200 + clean canonical | Redirect |
| Dependency errors | 5xx, proven by fault injection | `try/catch` → 404 |
| Env detection | `DEPLOY_ENV` | `NODE_ENV`, hostnames |
| Facets | Canonical-to-clean **or** noindex | Both |
| URL style | Per service, matching the live site | Hardcoded |
| Programmatic review/FAQ markup | Denied | Allowed |
| Indexation checks | Raw HTML via HTTP + rendered parity in the browser | Rendered DOM only |
| Auth/authorization | Probe-proven (anonymous, other role, other tenant, CSRF replay, logout replay) | Reading code |
| Refactors | Behaviour + visual baselines + declared changes | "Tests still pass" |
| Config format | JSON + JSON Schema | Code-based config |
| Rule format | ast-grep-compatible YAML | Own schema |
| Language | Rust core + managed Node for Playwright/Lighthouse | Pure TypeScript; Go; Python |
| Licence | Closed/commercial; offline signed licence; licence-free deploy-pipeline commands | Online activation |
| Telemetry | None; opt-in crash reports | Usage stats on by default |
| Production monitoring | In scope as `measure` (v8.0): read-only, W findings, never part of a verdict, feeds `iterate` | A separate later product (v7; reversed by the Operator) |

## Gap audit (v6 → v7)

An independent audit found 134 gaps (26 blockers). Resolved in v7:
- Verdict, tier and stop-hook model.
- Origin mapping and host emulation.
- Every format, grammar and the policy schema.
- Browser driver matrix.
- Auth strategies and the database lifecycle.
- Diff base, debt ratchet and `init`.
- `brief`, `check` and caching algorithms.
- Grouping, hashing, skeleton, similarity, crawl and sampling.
- Hook matrix for five hosts, command policy and Operator-command gating.
- False-positive governance, versioning, licensing, telemetry and releases.
- New packs and rules: privacy, resilience, ops; responsive/WCAG 2.2; SaaS security; visual regression; runtime errors; AI crawlers; cross-browser; full SEO map.
- Contradictions and duplicate rule ownership.

A verification audit of v7 (288 rule IDs, 0 duplicates, 0 dangling references) found 64 further items (15 blockers). v7.1 resolves all of them:
- Verdict engine: channel→gate table, rule outcomes, gate status derivation, prerequisites, BLD rules, budget exhaustion.
- Enforcement chain:
  - sealed verdict record, detached verify;
  - lock inputs that survive merges;
  - key roles and passphrase-encrypted keys;
  - built-in protected and deny lists, role-aware hooks;
  - sensitive ignored paths, command indirection.
- Onboarding: `init` order, `verify --adopt`, `debt add`, complete debt keys with occurrences and rename tracking.
- Environment and probes:
  - sequential database resets with logins captured before the snapshot;
  - per-host proxies with mounts, cross-browser routing, preview rebuild, edge production checks;
  - remote/read-only mode with crawl caps;
  - Supabase gateway and schema prep.
- Schemas and keys: 13 missing schemas (ownership, examples, released contracts, jobs, break-glass, trust store, hook events, failure classes, file roles, detector layout, baselines, finding status, toolchain); all missing policy keys added; examples corrected.
- Decidability: SEC-005 secret classification; undecidable † parts downgraded; concrete detectors for flagged rules.

Two work packages of the build map carry the assumptions everything else rests on, so they come first in their phases:
1. WP-101 (phase 1): verify each agent host's hook API against its current version.
2. WP-209 (phase 2): the conformance corpus harness (synthetic fixture apps per adapter and pack), since no rule becomes blocking without it.

Still open as engineering tasks for the build (not Operator decisions):
1. Availability of PostgREST/Supabase Auth builds per OS (fallback is defined).
2. PostgreSQL/MySQL portable build sources and their extension lists.
3. Locale parse-back coverage per CLDR locale.
4. Host-emulation fidelity per host (unsupported directives fall back to the edge pass).
5. Route discovery per adapter.
6. `check` performance on very large repositories.
7. Codex/Cursor/OpenCode/Antigravity hook behaviour verified against each host's current version (host APIs change; the matrix in 05 § 3.3 carries a verification status per row).
8. Tree-sitter grammar maturity for template languages (blade, jinja2, twig); regex fallback caps the tier where needed.
9. Supabase Realtime/Storage runtime emulation (currently `external`-only).

## Expectations

shipgate removes every site-side reason a page can't rank or a product can't be trusted: broken rendering, wrong status codes, duplicate or thin pages, bad canonicals, crawler blocks, slow pages, inaccessible UI, security and privacy holes, fragile dependencies and invented content. Since v8.0 it also decides what the site should win and checks that it competes: research finds the demand, the competitors and the gaps; the plan turns them into pages and briefs; the targeting pack gates the site against that plan (pages exist, match intent, cover what the winning pages cover, link as planned); measure shows what actually happened in search results and AI answers, and iterate turns it into the next plan. What no tool can promise is the outcome itself: rankings and citations also depend on authority and on what competitors do next. shipgate plans for them, measures them and says what to do about them; it never claims them.

A readiness audit of v7.1 + the search-engines pack + the build map (354 rule IDs, 0 duplicates, 0 dangling references) returned NO-GO on 8 items plus Majors; v7.2 resolves them:
- **Verdict:** build failures can't yield BLOCKED; reduced mode must be declared; subset and adopt runs never seal a PASS; the loop guard records `unverified-stop`.
- **Paths and keys:** `quality/out` is excluded from the sensitive-path snapshot; pack-policy defaults are defined with required keys; the seed shape is specified; key and lock entry formats are defined.
- **Content:** aiText is allowed and marked up; per-part severities; paywall-aware cloaking checks; one consistent facet policy; rows seen by each programmatic rule.
- **Missing detail:** channel and debt keys for every channel; default formats; contract request generation and fuzzing; channel fixes; fuzzy rules made precise or downgraded to warnings.
- **Build map:** WP-209 (corpus harness), WP-415 (runtime orchestration), WP-508 (codegen) and WP-608 (browser parts) added; dependencies corrected; large packages split.

## Building it

- `BUILD_MAP.md`: Rust workspace, phases, work packages with dependencies and acceptance checks, Definition of Done, risks.
- `ORCHESTRATOR_PROMPT.md`: the first message for the session that builds shipgate end to end.

## Build environment notes
- The repo lives outside OneDrive. Its path is longer than 60 characters, so WP-000 sets a short Cargo target directory (BUILD_MAP WP-000) and enables Windows long paths.
- On Windows, a Dev Drive speeds up Rust builds.
- Position and decisions persist in `.claude/POSITION.md`, `BUILD_STATE.md` and `DECISIONS.md` (ORCHESTRATOR_PROMPT.md).
