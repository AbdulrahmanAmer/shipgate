# shipgate — Build Map

> The plan an orchestrating agent follows to build shipgate end to end from `SPEC.md` + `spec/**`. The spec says **what** shipgate does; this file says **in what order, in which pieces, and how each piece proves it's done**.

---

## 1. Outcome

A signed, closed-source, single-binary tool (`shipgate`) for Windows, macOS and Linux that implements the full spec (`SPEC.md` v7.8+): core engine, all 15 packs, adapters, agent-host hooks, MCP mode, licensing and release pipeline. It must be proven on its own conformance corpus and dogfooded on real projects.

## 2. Development environment (Windows-first, no Docker)

- Rust stable via `rustup` with the MSVC toolchain; Visual Studio Build Tools (C++ workload); `git`; Node.js LTS (only for developing the browser sidecar and corpus fixture apps; end users never need it); optional Windows Dev Drive for the repo.
- Repo location: any local folder outside OneDrive (today: `D:\internal building pipeline for making sure that all websites we make real enterprise grade on search engines\shipgate`; moving it to a short path such as `D:\shipgate` is recommended, see WP-000). Git is initialised; default branch `main`.
- CI: GitHub Actions matrix (windows-latest, macos-latest, ubuntu-latest). If the repo isn't on GitHub yet, CI configs are still written and run locally via the same `xtask` commands.

## 3. Repository layout

```
<repo>\
  SPEC.md  BUILD_MAP.md  ORCHESTRATOR_PROMPT.md  spec\           # specification (source of truth)
  BUILD_STATE.md                                                  # live progress ledger (orchestrator-owned)
  DECISIONS.md                                                    # decisions taken during the build
  spec\CHANGES.md                                                 # spec amendments discovered while building
  Cargo.toml                                                      # workspace
  crates\
    sg-core          types: rule ids, severities, part severities, lifecycles, outcomes, statuses, findings, errors
    sg-formats       serde models + JSON Schema generation for every format in spec/03; JCS hashing
    sg-policy        policy loading/validation (CFG-*, pack validators, 03 § 3.5 defaults), URL-pattern grammar, globs
    sg-rules         rule registry (metadata YAML), embedded rulesets, feature tables, ruleset data, brief resolution
    sg-keys          Ed25519, Argon2id, OS keychain backends, trust store, signatures, sealed-verdict HMAC
    sg-lock          lock inputs/digest/sign/verify, debt fingerprints & ratchet, waivers, overrides
    sg-toolchain     toolchain manifest, download, checksum, cache, mirrors, data snapshots, fetch/doctor
    sg-adapters      adapter manifests, detection/priority, composition, route discovery, file roles, built-in adapters
    sg-analysis      ast-grep-core integration, oxc semantics/module graph, template grammars, SQL parsing
    sg-diff          diff bases, treeHash/repo-id, session snapshots, sensitive paths, git integration, rename detection
    sg-env           process supervisor, ports, embedded Postgres/MySQL/SQLite, SessionProvider, Supabase prep/gateway,
                     SMTP sink, egress proxy, front proxy (TLS, host emulation), fault injection, stage scheduler
    sg-http          HTTP probes, crawler, sampling, route groups, site graph
    sg-html          html5ever DOM, raw-HTML checks, leak scan, soft-404, parse-back, skeleton hashing
    sg-content       MinHash/LSH similarity, duplicates, claims
    sg-programmatic  dataset validation, quarantine, eligibility, inventory, oracle, ICU4X formatting,
                     relations, AI-text grounding, rollout
    sg-codegen       generated helpers per language: URL module, safeJsonLd, env module, inventory reader, row types
    sg-browser       sidecar protocol client; flows, axe, layout, screenshots, web-vitals, Lighthouse
    sg-baseline      baseline capture/compare, normalisers, visual diff
    sg-packs         rule implementations, one module per pack (+ core AGT/BLD/CFG)
    sg-engine        pipeline G0–G9, prerequisites, caching, verdict, grouping, attempts, reports (JSON/SARIF/JUnit/MD)
    sg-hooks         host adapters (claude-code, codex, cursor, opencode, antigravity, git), normalised events,
                     command-policy evaluator, sealed-verdict stop logic
    sg-mcp           MCP server (rmcp)
    sg-licence       licence verification, seats, CI tokens
    sg-cli           clap CLI, every command in spec/05 § 1, exit codes
  sidecar\           TypeScript package executed by the managed Node: Playwright runner, axe, web-vitals, Lighthouse
  rules\             rule metadata YAML, detectors, feature tables, ruleset data (phrase lists, stop words, patterns)
  adapters\          built-in adapter manifests and trap rules
  schemas\           generated JSON Schemas (checked in)
  corpus\            conformance fixture projects (known-good / known-bad) per adapter and pack
  tests\             integration and golden-report tests
  xtask\             schema generation, corpus runner, feature-table refresh, release, notices, stub-scan
  trace\             ownership.tsv (who builds what), deferred.tsv (must end empty)
  tools\trace\       spec-lint, wp-card, trace-check, stop-gate, collect-round, agent-models (+ *.test.mjs self-tests)
  audit\             spec audit loop: STANDARD.md, prompts\, rounds\NN\
  corpus\<pack>\<rule>\{spec,holdout}\  locked fixtures; corpus\FIXTURES.lock
  .claude\settings.json  Stop hook → tools\trace\stop-gate.mjs
```

## 4. Engineering rules for the build

- `cargo fmt --check`, `cargo clippy --workspace -- -D warnings`, `cargo test --workspace`, `cargo deny check` (licences: permissive only, spec 05 § 8) pass on every merge.
- Every work package ships tests: unit tests for logic, corpus fixtures for rules (≥ 1 known-good and ≥ 1 known-bad per failure class, in the WP-209 format), golden reports for end-to-end behaviour.
- No rule is marked `stable` until its corpus passes (spec 04 § 14). Rules land `experimental` first.
- Determinism tests: every report-producing path runs twice in CI and compares output byte-for-byte.
- Windows parity: every work package's tests run on Windows in CI (or locally on Windows when CI isn't available).
- Spec fidelity: each work package lists the exact spec sections and rule IDs it implements; the reviewer checks behaviour against those sections, not against the implementer's summary.
- **Signing in tests:**
  - A `test-keys` cargo feature provides an in-memory keychain with a fixed passphrase for unit, integration and golden tests.
  - Corpus locks are signed by a corpus key that the WP-209 harness trusts.
  - Release builds never enable `test-keys`; WP-1002 checks every artifact for it.
  - A non-test build never reads a passphrase from an env var or stdin.
- Spec gaps found while building are recorded in `spec/CHANGES.md` (problem, decision, affected sections) and applied to the spec in the same change; nothing is silently invented.

### 4.1 Completeness contract (nothing specified is skipped)
Agents tend to report a work package done when the parts they found hard are missing. These mechanisms make that impossible to report without the gate going red. Each is enforced by a script in `tools/trace/`, and each script has a watched-fail self-test (`*.test.mjs`) that plants the defect it catches.

1. **The ledger is the contract.** `trace/ownership.tsv` assigns every rule, rule part, channel slice and `TR-*` requirement to exactly one WP; the section table in § 5 does the same for sections without rule IDs. `spec-lint.mjs` fails on any unowned requirement or section, a WP dependency cycle, a dependency on a later phase, or a slice owned by a WP that doesn't depend on the machinery its channel needs. Ownership changes are edits to `ownership.tsv`, never to prose.
2. **Builders get the generated card, not a summary.** `node tools/trace/wp-card.mjs WP-<id>` prints every slice the WP owns with the verbatim spec text and the checklist. The builder brief **is** that output plus § 4 and § 6. Nothing is paraphrased away.
3. **Tests are written by someone other than the builder, and builders can't change them.** Before a builder starts, a separate fixture-author agent writes the WP's known-good and known-bad fixtures from the card alone (≥ 1 known-bad per part and per failure class the card lists, ≥ 1 known-good per rule) as `corpus/<pack>/<RULE-ID>/spec/<name>/` directories, each with an `expected.json` (`{ rule, part?, kind: known-bad|known-good, expect: [{ rule, part, failureClass }] }`). The orchestrator records the sha256 of every file under them in `corpus/FIXTURES.lock` and commits on `main`. Builders and reviewers work on their own branches; **`node tools/trace/merge-gate.mjs <branch>` refuses any branch that changes a contract file** — the lock, any `spec/` or `holdout/` fixture, `trace/`, `tools/trace/`, the spec (except `spec/CHANGES.md` proposals), `BUILD_MAP.md`, `audit/`, `.claude/`. Contract changes are made by the orchestrator on `main` only.
4. **Held-out fixtures catch overfitting.** After the build, the reviewer (fresh context) writes ≥ 1 new known-bad fixture per part from the spec text, under `corpus/<pack>/<rule>/holdout/`, without reading the implementation. They're locked the same way. A WP whose code misses its holdouts goes back to the builder.
5. **trace-check produces its own evidence; it never reads a results file.** `node tools/trace/trace-check.mjs` (a) checks out `HEAD` into a clean temporary worktree, so uncommitted or hand-written files are never evidence; (b) builds `shipgate` there (`cargo build --release -p sg-cli`) and reads the registry from the binary (`shipgate rule --list --json` → `{ rules: [{ id, parts[], channels[], failureClasses[], lifecycle }] }`, only rules with an implementation); (c) enumerates every locked fixture from `FIXTURES.lock` itself, runs each through the binary (`shipgate dev fixture <dir> --json` → `{ findings: [{ rule, part, failureClass, channel }] }`) and judges it against its locked `expected.json` — rule and kind come from the fixture's path, never from the binary; (d) runs `cargo nextest run --profile ci` in the worktree and reads that fresh junit. Tests prove `TR-*`, owned sections and § 5 acceptance items only when named for **this** WP: `wp_<id>__tr_103__…`, `wp_<id>__sec_03_17__…`, `wp_<id>__<acceptance name>`. `WP-920`'s acceptance is every other WP DONE in the same run. Failure classes the rule text names (04 § 9.1 vocabulary) are required even if the builder's metadata omits them. WP-209 must provide `shipgate dev fixture` and the registry export.
6. **Done means `trace-check.mjs --wp WP-<id>` exits 0 in that mode.** For each slice: registered with every spec part and channel; every locked known-bad and holdout fixture of every part detected (one passing fixture never hides a failing one); every failure class covered; known-good fixtures silent; owned `TR-*`, sections and acceptance tests passing under this WP's name. A WP that owns no slice, no section and no acceptance test is never done. A slice the builder can't deliver goes into `trace/deferred.tsv` (`ID<TAB>scope<TAB>WP<TAB>reason`), which keeps the WP NOT DONE until the orchestrator re-assigns it in `ownership.tsv`. Builders report `WP-<id>: built` when the only missing lines are holdouts; the reviewer's holdouts decide done. Definition of Done item 1 requires `trace-check.mjs --all` to exit 0 and `deferred.tsv` to be empty. **Trust boundary, stated plainly:** these local checks stop mistakes and lazy completion, not a deliberately hostile process on the same machine; the authoritative run is CI on a clean checkout of `main` after merge-gate, and the orchestrator merges only on green CI.
7. **No stubs.** Workspace lints deny `clippy::todo`, `clippy::unimplemented`, `clippy::dbg_macro` and (in `sg-packs`) `clippy::panic`. `xtask stub-scan` fails on `#[ignore]` without an `// ignore-reason:` comment, and on `TODO`, `FIXME`, `XXX`, `unimplemented`, `not yet implemented`, or a standalone `stub` comment marker (`// stub`, `/* stub */`; identifiers such as `egressStubs` are fine) in `crates/`, `sidecar/src/`, `rules/` and `adapters/`.
8. **Phase checkpoints add mutation testing.** At each phase end, `cargo mutants` runs on the phase's rule-decision modules (time-boxed, sampled). A surviving mutant in decision code means a missing fixture; the fixture is added (by the fixture author) before the next phase opens.
9. **False "done" can't end a session.** The project Stop hook (`.claude/settings.json` → `tools/trace/stop-gate.mjs`) runs `trace-check --claimed BUILD_STATE.md --from-hook`: every claimed WP needs a real-mode trace-check record for the current tree (written under `.git/shipgate-trace/`), and any line that pairs a WP id with a completion word (done, complete, finished, ✅, [x], …) in another form than `WP-<id>: done` or `| WP-<id> | done | …` blocks the stop. The agent either runs the real check, or corrects the claim to NOT DONE / `built` and tells the Operator.
10. **The reviewer fills the checklist.** The reviewer returns the card's checklist with every row's last four columns filled (fixture paths, `file:line` of the implementation, verdict). A row left empty is a review failure, whatever the summary says.

## 5. Phases and work packages

**Goal text summarises; `trace/ownership.tsv` is authoritative** for which WP builds which rule, part and channel slice, and `wp-card.mjs` prints the exact list. Phases run in order; work packages inside a phase run in parallel when their dependencies allow (dependencies listed explicitly, including same-phase ones). Each work package is sized for one agent session (roughly 300–1,500 lines of code plus tests); packages marked (L) are large and must be split by the orchestrator into sub-packages (e.g. WP-410a, WP-410b) along the rule families shown. IDs are stable; the orchestrator may split a package but never merge two.

### Phase 0 — Bootstrap
| WP | Goal | Depends |
|---|---|---|
| WP-000 | Repo outside OneDrive with git (already initialised); if the repo path is longer than 60 characters, set a short target directory (e.g. `D:\sgt`) as `[build] target-dir` in `.cargo/config.toml` for local builds (trace-check ignores it: it builds in its own clean worktree under the OS temp directory with `--target-dir <worktree>/target`) and enable Windows long paths (MSVC/cmake build scripts break past 260 characters); workspace skeleton (all crates as empty libs, `sg-cli` binary), workspace lints of § 4.1 item 7, `xtask stub-scan`, nextest `ci` profile with JUnit output, CI workflows running, in order: `spec-lint`, the `tools/trace/*.test.mjs` self-tests, `merge-gate` on the PR branch, then `trace-check --claimed BUILD_STATE.md` (which builds, runs every locked fixture and nextest itself) — CI's result is authoritative over the local Stop hook, `cargo deny` config, `rust-toolchain.toml`, `BUILD_STATE.md`, `DECISIONS.md`, `spec/CHANGES.md`, empty `corpus/FIXTURES.lock` and `trace/deferred.tsv` | — |

### Phase 1 — Verify assumptions and gather ruleset data (parallel; results feed the spec)
| WP | Goal | Depends |
|---|---|---|
| WP-101 | For each agent host (Claude Code, Codex, Cursor, OpenCode, Antigravity): **observe a live hook run** (config location, events, payloads, block signals, timeouts, Windows behaviour); update spec 05 § 3.3 statuses and 03 § 16 mappings | WP-000 |
| WP-102 | Toolchain sourcing: portable PostgreSQL (versions, extensions per OS), MySQL portable builds, PostgREST and Supabase Auth builds per OS, Playwright + browser pins, Lighthouse, axe-core, web-vitals, OSV-Scanner + offline DB; Hunspell dictionaries per locale (CQ-007); `lingua` language models pinned for I18-007; libphonenumber metadata; PDF parser crate (A11-026); webpki root store (SEC-056); registry publish-time snapshot sources (SEC-053); offline WordPress vulnerability feed with licence check (Wordfence free feed needs attribution, WPScan is commercial; SEC-073); Hunspell, GeoNames and web-features licences; licences and checksums → draft toolchain manifest (03 § 19) | WP-000 |
| WP-103 | Grammar maturity (02 § 4): tree-sitter grammars for vue, svelte, astro, embedded-template, twig, blade, jinja2 + ast-grep-core embedding test; record tier caps | WP-000 |
| WP-104 | **Ruleset data**: feature tables (`rules/features/google.json`, `bing.json`, `naver.json`) from current docs; soft-404 phrase lists for 20 locales; generic anchor-text lists; clickbait patterns (SE-103); China-blocked host list (SE-501); stop words, verb lists and a pinned Snowball stemmer per locale (KW-002/003, SE-121); Search Console "indexed" state labels per locale (ROL-003); provider secret-key patterns (SEC-050); live-key prefixes (CFG-004); bool labels per locale; plus the coverage-audit data listed below the table | WP-000 |

**WP-104 coverage-audit ruleset data:**
- **Crawlers and agents:** `ai-agents.json` (token, vendor, category, userAgent); `content-signals.json`; `social-agents.json`.
- **Content checks:**
  - `placeholders.json` per locale: lorem/filler, starter strings, default favicon hashes, fictional phone ranges, placeholder addresses and names, reserved domains, placeholder image hosts;
  - generic titles per locale;
  - a pinned `schemaorg.json` plus ISO 4217;
  - `stock-phrases.json`;
  - `gazetteer/<country>.json` (GeoNames);
  - `autoIdPatterns`.
- **Security probes:** `exposed-paths.json`, `debug-paths.json`, `mass-assignment-fields.json`, `file-params.json`, `traversal-payloads.json`, `ssrf-params.json`, `xss-payloads.json`, `challenge-fields.json`, `webhook-schemes.json`, `payment-id-shapes.json`, `registries.json`, `popular-packages/<ecosystem>.txt`, `breached-passwords.txt`, `wp-lockout-signatures.json`.
- **Privacy:** `google-tags.json` plus the `gcd` decoding table.
- **Accessibility:** `a11y-overlays.json`, `carousel-markers.json`, `carousel-controls.json`, `autocomplete-map.json`, `drag-libraries.json`.
- **UX and analytics:** `error-pages` fingerprints, `ratingPatterns`/`claimPatterns`, `analytics-vendors`, the web-features dataset, `bfcache-harness-reasons`.
- **Code and tooling:** `runtime-pins`, `classNameFunctions`, the Lighthouse audit-ID rename map.
- **Builder deny list:** hosted-builder publish APIs (05 § 3.2).
- **Round-2 security/privacy/UX data:**
  - `auth-bypass-headers.json`, `cache-hit-headers.json`, `takeover-fingerprints.json`, `us-opt-out-states.json`, `required-legal-pages.json`;
  - per locale: `withdrawal-labels.json`, `withdrawal-confirm-labels.json`, `order-button-labels.json`, `prior-price-phrases.json`, `review-verification-phrases.json`, `cancel-labels.json`, `claimPhrases`, `password-reset-labels`;
  - `rating-widget-markers.json`, `generic-green-claims.json`, `testimonial-markers.json`, `payment-amounts.json`, `chrome-state-classes`, `password-reset-paths`, `user-tables`, `password-columns`, `default-emails`.
- **Round-3 data:** `publishable-keys.json`, `trust-marks.json` (with perceptual hashes), `logo-wall-headings`, `safety-info-labels`, `digital-product-types`, `vat-phrases`, `renewal-terms-phrases`.
- **Round-4 data:** `countdown-markers`, `stock-count-phrases`, `social-proof-widgets`, `affiliate-disclosure-phrases`, `payment-test-markers.json`, `consent-models.json`, required legal pages for `kr-pipa`/`cn-pipl`/`br-lgpd`/`ca-pipeda`/`jp-appi`, CI hardening checks per provider.
- **Round-6 data:** `ai-addressed-phrases.json` per locale (AEO-014), `sct-labels` per locale (PRV-022 `jp-sct`), required legal pages for `jp-sct` (`commercialTransactions` with `ecommerce`).
- **Round-6 named files** (canonical file names; where an earlier bullet describes the same data in prose — stop words, clickbait patterns, China-blocked hosts, Search Console state labels, Lighthouse renames, CI hardening checks — this is its file; content shapes are defined where each rule cites the file): `advice-patterns`, `attribution-phrases`, `china-blocked-hosts`, `ci-hardening`, `clickbait-patterns`, `csrf-token-names`, `error-reporting-providers`, `fetch-tools`, `generic-anchors`, `gsc-indexed-states`, `install-script-flags`, `lighthouse-audit-renames`, `marketing-optin-labels`, `pagination-labels`, `password-hash-patterns`, `postal-patterns`, `required-labels`, `safe-type-changes`, `search-agents` (`[{ token, engine, variant: "desktop"|"smartphone", userAgent }]` for Googlebot smartphone/desktop, Bingbot, YandexBot, Yeti, Baiduspider, SeznamBot, Applebot and Chrome; every engine token of SE-002 and RTE-010 must have a row), `session-lifetimes`, `shipping-cost-phrases`, `sri-hosts`, `stop-words`, `tracking-param-expansions`, `unsubscribe-labels`, `verbs`, `weak-hash-apis`, `write-apis`.
- **Round-7 named files** (content shapes are defined where each rule cites the file; per-locale files follow 04 § 15 *page locale*): `a11y-statement-phrases`, `add-to-cart-labels`, `attribution-licences`, `country-of-origin-labels`, `csp-bypass-hosts`, `default-documents`, `dsa-contact-phrases`, `dsa-terms-phrases`, `generic-titles`, `google-certified-cmps`, `load-more-labels`, `local-listing-sources`, `market-signals`, `privacy-notice-elements`, `provider-id-by-country`, `purpose-phrases`, `report-content-labels`, `same-as-labels`, `secret-patterns`, `sensitive-properties`, `sms-consent-phrases`, `sms-markers`, `stock-preview-hosts`, `tcf-ad-vendors`, `term-patterns`, `terms-acceptance-phrases`.
- **Round-8 named files**: `baseline-js-syntax`, `campaign-params`, `date-labels`, `dmca-phrases`, `engine-crawlers`, `eol-products`, `extend-session-labels`, `geo-headers`, `incentive-disclosure-phrases`, `marketing-consent-phrases`, `marketing-signup-markers`, `no-results-phrases`, `object-storage-hosts`, `osa-terms-phrases`, `placeholder-tracking-ids`, `prop65-link-labels`, `quantity-fields`, `regulated-claims`, `regulated-product-regimes`, `tida-phrases`, `transfer-adequacy`, `transfer-mechanism-phrases`, `unit-quantity-patterns`, `withdrawal-info-phrases`.
- **Public Suffix List snapshot** (SEC-059, alias-host resolution), refreshed by `fetch`.
- **Round-2 toolchain (WP-102):** Firebase emulator suite (needs a JRE; `skipped(no-emulator)` where unavailable), a Firebase rules parser, an XMP/C2PA reader.
- **Round-2 content data:** `social-hosts.json`, `placeholder-handles.json`, `scaffold-routes.json`, `evergreen-words.json`, `comparison-patterns.json`, `agentic-feeds.json`, `model-hosts.json`.
- **Foundation recipes per adapter** (04 § 7 `brief --stage start`).

### Phase 2 — Foundations
| WP | Goal | Depends |
|---|---|---|
| WP-201 | `sg-core`: shared types from spec 01 § 4 and 04 § 1 (incl. finding parts 04 § 1.8, failure classes 04 § 9.1) | WP-000 |
| WP-202 | `sg-formats`: serde models for every format in spec 03; JSON Schema generation into `schemas/`; JCS canonicalisation | WP-201 |
| WP-203 | `sg-policy`: policy loading, defaults (03 § 3.5), unknown-key rejection, CFG-001..009 (incl. `project.stage` and planned services), Operator data files (business facts, legacy URLs, approvals, merchant feed, webhook fixtures; 03 § 14), URL-pattern grammar (03 § 2.1) with specificity, globs | WP-202 |
| WP-204 | `sg-keys`: Ed25519, Argon2id passphrase encryption, keychain backends (Windows Credential Manager, macOS Keychain, Linux Secret Service + encrypted-file fallback), trust store with roles, install secret, fingerprints (03 § 7) | WP-201 |
| WP-205 | `sg-lock`: lock inputs/digest/sign/verify (03 § 8), waivers and overrides with expiry, debt file + fingerprints (04 § 9.3); treeHash/repo-id helpers (04 § 15, used by WP-207 and WP-301) | WP-203, WP-204 |
| WP-206 | `sg-rules`: rule metadata loader/validator (03 § 5, incl. `owns` waivability check, tombstones), embedded rulesets (current + 3 previous), launch-stable list mechanics, ruleset data loading (WP-104 outputs) | WP-202 |
| WP-207 | `sg-engine` skeleton: gate model, channel→gate, prerequisites, rule outcomes, finding statuses, two-step verdict incl. BLD rule, scope downgrade and reduced runs (04 § 1.6), handoff conditions (04 § 1.9), review results from `quality/audit/review.json` (04 § 1.7), grouping/evidenceHash/ranking (04 § 9), attempts, report writers (JSON, SARIF, JUnit, summary.md), sealed verdict record (04 § 8.1) | WP-201, WP-205, WP-206, WP-204 |
| WP-208 | `sg-cli` skeleton: command tree from spec 05 § 1, exit codes, `rule`, `version`, `doctor` (partial), CLI wiring for `keys` and `lock` | WP-207 |
| WP-209 | **Corpus harness**: fixture project layout (`corpus/<pack>/<RULE-ID>/{spec,holdout}/<name>/`), the `expected.json` format of § 4.1 item 3 (`{ rule, part?, kind, expect: [{ rule, part, failureClass }] }`; optional extra keys such as `groupKey` or an expected verdict may be added and are ignored by trace-check), `shipgate dev fixture <dir> --json` (05 § 1, the output trace-check reads), `xtask corpus --json` (runs every locked fixture through `dev fixture`, for the § 4 determinism check), `shipgate rule --list --json` registry export, golden-report comparison, `FIXTURES.lock` maintenance command for the orchestrator; `trace-check --wp WP-209` must pass on the harness's own fixtures; every later WP uses it | WP-207, WP-208 |

### Phase 3 — Static side and hooks
| WP | Goal | Depends |
|---|---|---|
| WP-301 | `sg-diff`: uses WP-205's treeHash/repo-id; diff bases and sensitive paths (04 § 5), output digests, rename detection | WP-205 |
| WP-302 | `sg-adapters` core: manifest loader (03 § 6), detection with priority, composition, file roles (04 § 7.1); adapters `static-html` and `next-app` (manifests, route discovery, traps) | WP-203 |
| WP-303 | `sg-analysis`: ast-grep-core integration + YAML detectors; oxc semantic model and module graph; scope `changed\|repo`; precise detectors from 04 § 13 | WP-302, WP-301 |
| WP-304 | Core rules AGT-001..011 (AGT-011 source part; its comparison pass is in WP-608), BLD-001..003 (cmd channel, diagnostic counting), SEC-050 diff secret scan (04 § 13) incl. the `history` part at adoption, command running for typecheck/lint/test Not here: AGT-005 (WP-801); AGT-001/002/007/008 hook slices (WP-306). | WP-303, WP-301, WP-207 |
| WP-305 | Command-policy evaluator (04 § 8.2) + built-in protected/deny lists (05 § 3.1–3.2) | WP-203 |
| WP-306 | `sg-hooks` Claude Code adapter: pre/post/stop/session/prompt, normalised events (incl. `fetch` events and the session fetch store writer for CQ-010, 03 § 15, 05 § 3.3), fail-closed, loop guard, brief injection; `hooks install\|check` | WP-305, WP-304, WP-307 |
| WP-307 | `brief` (04 § 7), including `--stage start`: launch definition of done per project kind, missing Operator inputs, foundation recipes | WP-206, WP-302 |
| WP-308 | `check` modes and time budgets (04 § 8), caching (04 § 16), `verify --detach`, `status --wait` | WP-304 |

### Phase 4 — Runtime: environment, crawl, HTML
| WP | Goal | Depends |
|---|---|---|
| WP-401 | `sg-toolchain`: manifest, download, verify, cache, mirrors, data snapshots; `fetch`, `doctor` | WP-102, WP-208 |
| WP-402 | `sg-env` supervisor + ports + health (04 § 4.1), Windows Job Objects / Unix process groups | WP-201 |
| WP-403 | Embedded PostgreSQL + SQLite lifecycle (04 § 4.2), template/reset, seed shape (03 § 3.4), seed contract; **`SessionProvider` interface** with `header` and `command` strategies (the `flow` strategy plugs in at WP-603) | WP-401, WP-402 |
| WP-404 | MySQL embedded lifecycle (04 § 4.2, 03 § 3.4; same template/reset contract as WP-403) | WP-403 |
| WP-405 | Front proxy: TLS per-run CA, origin mapping, mounts (04 § 2), host emulation (04 § 3) | WP-402 |
| WP-406 | Egress proxy + SMTP sink + fault injection (04 § 4.5–4.6) | WP-405, WP-403 |
| WP-407 | `sg-http` crawler, sampling, route groups, site graph (04 § 10) | WP-405, WP-408 |
| WP-408 | `sg-html`: DOM parsing, leak scan, soft-404, parse-back, error-leak patterns (04 § 11–12) | WP-201 |
| WP-409 | G3 build + artifact scan; BLD-004/005; SEC-005 (all parts: build artifacts, plus the same classification and `provider-pattern` scan applied to HTML and API responses in G4) | WP-402, WP-304, WP-407, WP-408 |
| WP-415 | **Runtime orchestration**: G4/G6 start order exactly as 04 § 4.2 (databases → platform prep → migrate → seed → SMTP/egress → front proxies → services → health → logins → snapshot), read-only stage, mutating-stage scheduler (G4 write-probe families → job runs → faults → G6 flows + keyboard replays → control click probe → load, with resets; 04 § 4.2 step 8), egress additions (exact-port `NO_PROXY`, SSRF canaries, `*.shipgate.test`, model-host stubs; 04 § 4.6), probe Host passthrough (04 § 2), missing-variable start probe and graceful stop (04 § 4.1), statement logging for DB-010, "no side effect" diff (04 § 15), JOB-002 execution stage, verdict scope (`SKIPPED(scope)`, 04 § 1.6) and handoffs (04 § 1.9), preview-pass restart/rebuild, `verify --changed` scoping (changed file → routes/flows via route→file map and import graph) | WP-403, WP-405, WP-406, WP-407, WP-409, WP-303 |
| WP-410 (L) | Pack web-delivery, HTTP/HTML parts: (a) RTE + URL (incl. RTE-015 2 MB limit, URL-012 syndication); (b) MET + SCH (incl. MET-011 placeholders, MET-012/013, SCH-011); (c) LNK + IDX + I18 + KW + WCF + CQ-001, CQ-003..007, CQ-009 + TRS-001..004 + WCF-008 (incl. I18-009 translation completeness, IDX-015 feeds, URL-013 versioned docs, MET-011 `social`/`scaffold-route` parts, URL-007 `slug-quality`). CQ-002 and CQ-008 go to WP-501; IDX-011, URL-011, LNK-006, LNK-007 and the edge parts go to WP-414; IDX-016 and the browser parts of MET-011/MET-012 go to WP-608; RTE-001's rendered-parity part to WP-608 Not here: RTE-001 and LNK-001 (WP-608), CQ-006 (WP-801), MET-011 `dead-anchor` and URL-006 `infinite-scroll` (WP-608). Also not here: RTE-013 (WP-607), RTE-014 browser support and RTE-017 (WP-608). | WP-407, WP-408, WP-406, WP-409, WP-415 |
| WP-411 (L) | Pack search-engines, HTTP/HTML parts: (a) SE-0xx + Bing/Yandex/Naver/Baidu/Seznam/Apple, (b) Google features SE-1xx incl. feature-table evaluation, facets, ecommerce SE-111..114, SE-126/127, SE-009; (c) local search LOC-001..003 against business facts. SE-122, SE-123, SE-124 and SE-106's viewport part move to WP-608; SE-008 to WP-414 | WP-410, WP-104 |
| WP-412 | Pack answer-engines (AEO-*; AEO-014 parts `ai-addressed` html side and `agent-parity`; its browser parts go to WP-608) Not here: AEO-012 (WP-801), AEO-014 `hidden-text` and the AEO-009 browser slice (WP-608). | WP-410, WP-414 |
| WP-413 (L) | Pack security, non-session parts (their edge parts, incl. SEC-015 and the edge parts of SEC-016/034, run through WP-414's edge pass): (a) SEC-001 (detector from WP-303), SEC-002, SEC-006, SEC-014, SEC-015, SEC-060, SEC-061, and the HTTP side (headers incl. the `isolation`/`trusted-types` parts, CORS, open redirect, error leakage, mixed content, source maps, SEC-004 egress); (b) exposure and injection: SEC-016, SEC-034, SEC-035, SEC-045, SEC-046 (SSRF canaries, 04 § 4.6), SEC-047 `reflected`; (c) WordPress SEC-070..073 Not here: SEC-003 (WP-607). Also SEC-075 (CSP strength; edge half WP-414). | WP-407, WP-406, WP-303, WP-409, WP-415 |
| WP-414 | Preview pass and edge pass (G8): SE-008 and the edge parts of URL-002, SEC-010, PRF-008, MET-005 `fetchers` and IDX-005 `preview-edge`; production launch check IDX-011 (bounded GET), URL-011 alias hosts with wildcard resolution, SEC-056 TLS, LNK-006 (opt-in), LNK-007, SEC-058 edge part, SEC-059 subdomain takeover, SEC-065 production test-mode payments, the CFG-009 edge part (existing-site safety net; CFG-001..009 otherwise in WP-203); SEC-066 CI hardening review. UX-022 is in WP-609. Also the SEC-075 and URL-014 edge halves. | WP-405, WP-409, WP-415 |

### Phase 5 — Content and programmatic
| WP | Goal | Depends |
|---|---|---|
| WP-501 | `sg-content`: MinHash/LSH, exact duplicates (CNT-005, CQ-002), claims (04 § 11), swap similarity CQ-008 (04 § 15) Also CQ-010 (copied third-party text; the fetch store writer is WP-306/WP-803). | WP-408 |
| WP-502 | `sg-programmatic` config and data: family config validation PCF-001..007 (03 § 3.5 required keys), field types, validation, quarantine, provenance, freshness, money/geo (DAT-001..012) | WP-203, WP-207 |
| WP-503 | Formatting (ICU4X, default formats 04 § 15), applyTemplate, inventory line schemas (03 § 13) + oracle, `inventory` command | WP-502 |
| WP-504 | Eligibility, cardinality, tuples, relations, hubs/pagination, skeleton identity, long-text markup (TPL/CNT/PLK, TPL-007); "which rows each rule sees" (programmatic § 4-0). CNT-009's browser part moves to WP-608 CNT-009: only part `raw` here; the rest is WP-608. Wires the programmatic indexation inputs (family `indexation`, released eligible pages, DAT-017 `noindex` rows) into the 04 § 15 *Indexable page* set that WP-410's rules read; until then that set is computed without programmatic families and WP-410's fixtures use non-programmatic pages. | WP-503, WP-501, WP-303, WP-407 |
| WP-505 | AI-text governance (DAT-013..016, aiText siblings, number detection), demand gating (DAT-017), KW-003, CNT-011/012 | WP-504 |
| WP-506 | Rollout (ROL-*) + `rollout` command; crawl efficiency (CRW-*), SE-005 | WP-504, WP-205, WP-414 |
| WP-507 | Live mode snapshot + parse-back comparisons (04 § 12 parse-back) | WP-503, WP-408 |
| WP-508 | **`sg-codegen`**: URL module, `safeJsonLd`, env module, inventory reader and row types for TypeScript first, then Python, PHP, Ruby, Go, C#, Java as Tier-2 adapters need them; `codegen` command (05 § 1) | WP-503, WP-302 |

### Phase 6 — Browser
| WP | Goal | Depends |
|---|---|---|
| WP-601 | `sidecar/` TypeScript package (Playwright runner protocol, axe, web-vitals, screenshots) + `sg-browser` client; browser routing and TLS trust (04 § 2 item 3, 04 § 6.1) | WP-401, WP-405 |
| WP-602 | Flows engine: step vocabulary (03 § 10 incl. `expectEgress`, `expectDownload`, `markPrice`), journeys, keyboard flag, locators, generators, email steps, `requires`, mutating stages via WP-415; the shared **control inventory** and click probe (dead-control definition 04 § 15) used by UX-006, MET-011 and PRF-002 `probe` | WP-601, WP-415 |
| WP-603 | Auth `flow` strategy on `SessionProvider`, TOTP, verify backdoor handling | WP-602 |
| WP-604 | Lighthouse runner + performance pack (PRF-001..019; PRF-020 is in WP-703), INP in flows, host calibration TR-111 (04 § 6.3), Lighthouse 13 audit names Not here: PRF-011 (WP-701). | WP-601, WP-602, WP-603 |
| WP-605 (L) | Accessibility pack: (a) A11-001..017 incl. `submitEmpty`, orientation, logged-in pages; (b) A11-018..029: keyboard replays, dark mode / forced colours, media, autocomplete, SPA announcements, help order, PDFs, skip link, context changes on focus/input, hover content; `mobile-nav` parts of A11-001/004 Also A11-030..033. | WP-601, WP-602, WP-603, WP-607 |
| WP-606 (L) | Privacy pack: (a) PRV-001..010 + third-party interception policy (04 § 6.1); (b) PRV-011..020: Consent Mode v2, PII in URLs, CCPA/GPC, consent persistence, cookie policy, deletion/export, EAA statement, AI Act disclosure, session-replay leaks, children/age gate; (c) PRV-021..028: EU withdrawal function, required legal pages and imprint content, order-button wording, review/prior-price notices, GPSR product safety info, price transparency and drip pricing, auto-renewal disclosure, notice at collection; PRV-003 `server-side`; US state opt-outs Includes PRV-022 parts `kr-ecommerce`, `jp-sct`, `cn-icp`, and `uk-consumer` (PRV-023/026). Also PRV-029..042 (market signals, provider identification, privacy-notice content, SMS consent, India, Australia, Brazil, IAB TCF, EU DSA, transfers, withdrawal information, regulated-product notices, marketing consent, user-content duties). | WP-601, WP-406, WP-602 |
| WP-607 (L) | (a) Session security probes SEC-011 (session cookies incl. `host-prefix`), SEC-013, SEC-017..033 (incl. SEC-021 `override-headers`), SEC-036..039, SEC-047 `stored`, SEC-054/055, SEC-057 server functions, SEC-058 web cache deception, SEC-062, SEC-063 payment-page scripts, SEC-064 session lifetime and admin MFA; (b) payments/webhooks/realtime/storage SEC-040..044, SEC-048, SEC-049; (c) testing pack TST-* (incl. TST-010 with `cancel` part, TST-011), RTE-013 Also SEC-003 (whole rule) and SEC-067. Also SEC-074 (property-level exposure) and SEC-065 (checkout-flow side of production payments). | WP-603, WP-415, WP-414 |
| WP-609 (L) | **ux pack** (spec/packs/ux.md): (a) UX-001 form outcomes with `expectEgress` (server and browser), UX-003/004 business facts; (b) UX-005/006 error pages and the control click probe, UX-012; (c) UX-007/008 cross-browser smoke and baseline features, UX-010 analytics and conversions; (d) UX-013..021: claims, testimonials and people, charged price, header/footer consistency, AI imagery, reset link, trust marks and logo walls, fake urgency/scarcity, affiliate disclosure. UX-009 visual collateral is in WP-801(b) Also UX-022 (edge check of `quality/approvals/launch-forms.json`). Also UX-023..027. | WP-602, WP-603, WP-406, WP-415, WP-414, WP-605, WP-606, WP-607 |
| WP-608 | Browser-side parts of other packs: RTE-001 rendered parity, RTE-014 mobile check support, SE-106 viewport part, SE-122, SE-123, SE-124, SE-401, CNT-009 computed-style part, AEO-014 `hidden-text` and the hidden-element side of `ai-addressed`, MET-011 `dead-anchor`, MET-012 lazy images, IDX-016; the AGT-011 comparison pass (04 § 2 item 6) Also RTE-001 (whole rule), LNK-001, CNT-009 (except part `raw`), MET-011 `dead-anchor`, URL-006 `infinite-scroll`, AEO-014 `hidden-text`, and the AEO-009/SE-109 browser slices. Also RTE-016's browser channel, RTE-017, and the SCH-006/SCH-010/TRS-002 browser channels. | WP-601, WP-410, WP-411, WP-504, WP-414, WP-606, WP-607, WP-609, WP-412 |

### Phase 7 — Data, architecture, resilience, ops, platforms
| WP | Goal | Depends |
|---|---|---|
| WP-701 (L) | (a) Contracts: OpenAPI/GraphQL loading, examples, released contracts, request generation and fuzzing (04 § 15), API-* (incl. API-009 races); (b) DB-* with SQL parser, DB-009 Supabase grants/functions, DB-010 query plans, DB-011 Firebase rules (+ emulator when available), DB-012 default credentials; (c) JOB-* Also PRF-011 (load stage). | WP-403, WP-303, WP-415, WP-602, WP-604 |
| WP-702 | Architecture pack (ARC-*, incl. ARC-013..015 design tokens, duplication, README) on the module graph, incl. strictness pointers | WP-303, WP-409, WP-705, WP-207 |
| WP-703 | Resilience (RES-*) and ops (OPS-*, incl. OPS-008..014 and PRF-020 field-data import: version pinning, env completeness and the missing-variable start probe, error-report PII, graceful stop) packs | WP-406, WP-415, WP-602, WP-414, WP-705, WP-701, WP-607, WP-609 |
| WP-704 | Supabase addon: schema prep DDL, managed PostgREST/Auth, gateway, external fallback (04 § 4.4) | WP-403, WP-405, WP-102 |
| WP-705 | Dependencies: OSV offline scan, licences, npm deprecation snapshot (SEC-051/052, ARC-007, AGT-009), SEC-053 supply chain (lockfile, registry, publish age from the registry snapshot, typosquats, install scripts) | WP-401, WP-303 |
| WP-706 | Contract- and flow-driven security probes (built once contracts and flows exist): SEC-007 (incl. write-route probes), SEC-030 `behaviour` fuzzing, SEC-036 `readOnly` mass assignment, SEC-045 injection probes on contract operations, SEC-046 SSRF replays of flow-recorded requests, SEC-060 GraphQL (contract SDL + account session), SEC-074 property-level exposure against contract response schemas | WP-701, WP-607, WP-413 |

### Phase 8 — Refactor, adoption, integrations
| WP | Goal | Depends |
|---|---|---|
| WP-801 (L) | (a) `sg-baseline` capture/compare and normalisers; (b) visual diff and UX-009 visual collateral; (c) G7 + refactor pack incl. REF-011/012 and `redirects.jsonl`, implied `--against` from `refactor.json` (04 § 1.6); (d) `baseline --from-remote` (writes `refactor.json`), REF-010 re-platforming (legacy URLs, `depth` and `old-origin` parts; edge parts via WP-414) and REF-013 service worker (`sw-cache` uses WP-607's logout) Also AGT-005, AEO-012, CQ-006 (they read `_main/routes.jsonl`) and REF-014. | WP-602, WP-410, WP-414, WP-607, WP-701, WP-412 |
| WP-802 | `init` (05 § 2), `init --new` with kind presets and templates (05 § 2.1), `verify --adopt`, `debt record\|add\|rotate\|show` | WP-205, WP-410, WP-307, WP-801 |
| WP-803 | Hosts: Codex, Cursor, OpenCode (generated plugin), Antigravity, git hooks; role-aware scopes; fetch recording per host where the host reports fetches (05 § 3.3) | WP-306, WP-101 |
| WP-804 | MCP server (`rmcp`) with async verify jobs | WP-308 |
| WP-805 | `break-glass`, `waiver add`, `override add`, `approve pages`, `conformance --adapter`, `migrate` | WP-205, WP-206, WP-209 |

### Phase 9 — Adapter breadth and corpus
| WP | Goal | Depends |
|---|---|---|
| WP-901..908 | Tier-1 adapters, one each: next-pages, vite-spa, tanstack-start, react-router, astro, nuxt, sveltekit, supabase-addon fixtures; each with corpus projects | WP-302, WP-303, WP-508 |
| WP-910..918 | Tier-2 adapters, one each: django, fastapi/flask, rails, laravel, wordpress, spring, aspnet, go-http, rust-http (structural rules, route discovery, traps, codegen targets) | WP-303, WP-103, WP-508 |
| WP-919 | Tier-3: generic-http and hosted-builder (remote mode, `remote` metadata defaults 04 § 15) | WP-407 |
| WP-920 (L) | Corpus completion and promotion, split by pack: ≥ 3 known-good projects (synthetic fixture apps count) per rule family and ≥ 1 known-bad fixture per failure class; an `xtask` check that every live rule ID in the spec has an owning WP, an implementation and corpus fixtures; promote the launch-stable list; false-positive report packaging | all pack WPs |

### Phase 10 — Productisation
| WP | Goal | Depends |
|---|---|---|
| WP-1001 | Licensing (`sg-licence`): offline signed licences, seats, CI tokens, grace period, licence-free commands; opt-in crash reports | WP-208 |
| WP-1002 | Release pipeline: cross-compilation targets, Authenticode, macOS notarization, minisign, SBOM, checksums, npm platform packages, `self-update`; check that no artifact is built with the `test-keys` feature | WP-208 |
| WP-1003 | Docs: Operator guide, agent quick reference, data inventory, THIRD_PARTY_NOTICES generation | most WPs |
| WP-1004 | Performance hardening: `check` < 10 s on large repos, 5,000-page verify < 30 min on a laptop | Phase 9 |
| WP-1005 | CI templates for GitHub Actions, GitLab, Bitbucket, Azure Pipelines, CircleCI incl. `baseline --ci` on the base branch (05 § 5) | WP-801, WP-1001 |

### Phase 11 — Dogfooding
| WP | Goal | Depends |
|---|---|---|
| WP-1101 | Run `init` + `verify --adopt` on **copies** of real projects. The passphrase steps (`keys init`, `lock`, `debt record`) are Operator actions: the orchestrator prepares them and asks for them all at once. (e.g. Aleef, GainLev OS, OmniSkipX, a Revenue Driven site, a plain HTML site); record false positives; fix or demote rules | Phase 10 |
| WP-1102 | Close-out: every launch-stable rule passes its corpus; all hosts verified; release candidate built and signed (or signing blocked only on Operator-held certificates) | WP-1101 |

### Section ownership (spec sections that no rule ID carries)
Rule IDs are owned in `trace/ownership.tsv`. The sections below define behaviour without rule IDs; the listed WP builds it and its card cites the section. `tools/trace/spec-lint.mjs` fails a section that no WP cites.

| Section | WP |
|---|---|
| 01 § 1 Principles, 01 § 2 Scope, 01 § 2.1 Surfaces, 01 § 3 Vocabulary | every WP card (preamble) |
| 01 § 5.1 Precedence, 01 § 5.2 Ownership | WP-206 (`owns` metadata), WP-207 (precedence in the verdict) |
| 01 § 5.3 Signed lock, 01 § 5.4 Waivers and overrides, 01 § 5.5 Debt | WP-205; commands in WP-805, WP-802 |
| 01 § 6 Policy and environment, 01 § 6.1 Tool requirements | WP-203; TR-00x rows in `trace/ownership.tsv` |
| 01 § 7 Modes, 01 § 8 Pipeline, 01 § 10 Repair loop and roles, 01 § 10.1 Repair loop | WP-207 (modes, gates, attempts), WP-308 (`check` modes) |
| 01 § 10.2 Roles | WP-306, WP-803 (role-aware hooks) |
| 01 § 9 Agent conduct, 01 § 9.1 Project commands, 01 § 11 Tool requirements for agent use | WP-304, WP-409; TR-1xx rows in `trace/ownership.tsv` |
| 02 § 1 Why adapters, 02 § 2 Coverage tiers, 02 § 3 What an adapter declares, 02 § 5 Built-in adapters, 02 § 6 Monorepos and platforms | WP-302 |
| 02 § 4 Source analysis engines | WP-303 |
| 02 § 7 Adding a stack | WP-805 (`conformance --adapter`), WP-1003 (guide) |
| 03 § 1 Conventions | WP-202 |
| 03 § 4 Auth and test accounts | WP-403 (`header`/`command`), WP-603 (`flow`, TOTP) |
| 03 § 9 Debt | WP-205 |
| 03 § 11 Refactor declaration, 03 § 12 Baselines | WP-801 |
| 03 § 15 Agent-side and state files, 03 § 17 Report | WP-207 |
| 03 § 18 Rollout state and indexing exports | WP-506 |
| 04 § 12 Parity, soft-404, leaks | WP-408 |
| 05 § 4 MCP server | WP-804 |
| 05 § 6 Versioning | WP-206 (embedded rulesets), WP-805 (`migrate`) |
| 05 § 7 Distribution and releases | WP-1002 |
| 05 § 8 Licensing, 05 § 9 Telemetry and privacy | WP-1001 |

### Acceptance tests for work packages without ledger slices
These WPs build machinery or deliverables that no rule ID or section carries. Each must pass the listed tests (names in junit, `wp_<id>__<name>`); `trace-check` requires them and `spec-lint` fails a WP that owns no slice, no section and no row here.

| WP | Tests | Evidence |
|---|---|---|
| WP-000 | `wp_000__workspace_builds_and_lints`, `wp_000__ci_runs_trace_gates` | workspace builds; fmt/clippy/deny clean; CI runs the § 4.1 pipeline |
| WP-103 | `wp_103__grammar_tiers_recorded` | `rules/grammar-tiers.json` lists every grammar with its tier cap and the embedding test result |
| WP-104 | `wp_104__named_ruleset_files_exist_and_parse`, `wp_104__feature_tables_have_source_dates` | every file named in WP-104 exists under `rules/`, parses, and carries `source` and `retrieved` fields |
| WP-901 | `wp_901__adapter_conformance` | `shipgate conformance --adapter next-pages` passes on ≥ 3 corpus projects |
| WP-902 | `wp_902__adapter_conformance` | `shipgate conformance --adapter vite-spa` passes on ≥ 3 corpus projects |
| WP-903 | `wp_903__adapter_conformance` | `shipgate conformance --adapter tanstack-start` passes on ≥ 3 corpus projects |
| WP-904 | `wp_904__adapter_conformance` | `shipgate conformance --adapter react-router` passes on ≥ 3 corpus projects |
| WP-905 | `wp_905__adapter_conformance` | `shipgate conformance --adapter astro` passes on ≥ 3 corpus projects |
| WP-906 | `wp_906__adapter_conformance` | `shipgate conformance --adapter nuxt` passes on ≥ 3 corpus projects |
| WP-907 | `wp_907__adapter_conformance` | `shipgate conformance --adapter sveltekit` passes on ≥ 3 corpus projects |
| WP-908 | `wp_908__adapter_conformance` | `shipgate conformance --adapter supabase-addon` passes on ≥ 3 corpus projects |
| WP-910 | `wp_910__adapter_conformance` | `shipgate conformance --adapter django` passes on ≥ 3 corpus projects |
| WP-911 | `wp_911__adapter_conformance` | `shipgate conformance --adapter fastapi-flask` passes on ≥ 3 corpus projects |
| WP-912 | `wp_912__adapter_conformance` | `shipgate conformance --adapter rails` passes on ≥ 3 corpus projects |
| WP-913 | `wp_913__adapter_conformance` | `shipgate conformance --adapter laravel` passes on ≥ 3 corpus projects |
| WP-914 | `wp_914__adapter_conformance` | `shipgate conformance --adapter wordpress` passes on ≥ 3 corpus projects |
| WP-915 | `wp_915__adapter_conformance` | `shipgate conformance --adapter spring` passes on ≥ 3 corpus projects |
| WP-916 | `wp_916__adapter_conformance` | `shipgate conformance --adapter aspnet` passes on ≥ 3 corpus projects |
| WP-917 | `wp_917__adapter_conformance` | `shipgate conformance --adapter go-http` passes on ≥ 3 corpus projects |
| WP-918 | `wp_918__adapter_conformance` | `shipgate conformance --adapter rust-http` passes on ≥ 3 corpus projects |
| WP-920 | `wp_920__every_rule_owned_implemented_and_covered` | `trace-check --all` exits 0 on the release tree |
| WP-1004 | `wp_1004__check_under_10s_on_5000_files`, `wp_1004__verify_5000_pages_under_30min` | timed on the WP-1004 fixture repos on the reference laptop |
| WP-1101 | `wp_1101__dogfood_results_recorded` | BUILD_STATE.md dogfood table: each project PASS or PASS with recorded debt; no open false positive on a stable rule |
| WP-1102 | `wp_1102__release_candidate_verified` | release artifacts built, checksummed, no `test-keys` feature (signing may be Operator-blocked) |

### Launch-stable list
The launch-stable list (spec 04 § 14) is decided at the end of the build, not guessed up front. It is every rule that:
1. passes its corpus at WP-920 (≥ 3 known-good projects with zero findings, ≥ 1 known-bad fixture detected per failure class and per part); and
2. was not demoted during dogfooding (WP-1101).

The orchestrator proposes the list in `BUILD_STATE.md` and the Operator approves it before WP-1102. Every other rule ships `experimental`.

## 6. Work package card (template the orchestrator gives each builder)

```
WP-<id> — <goal>
Spec: <files + sections>, rules <IDs>
Inputs: <crates/files it builds on>
Outputs: <crates/modules/files>
Acceptance:
  - cargo test -p <crate> passes; clippy clean; fmt clean
  - locked spec fixtures (fixture author) and holdouts (reviewer) detected; builder-added fixtures allowed
  - `node tools/trace/trace-check.mjs --wp WP-<id>` exits 0
  - golden report(s): <list> (byte-identical across two runs)
  - spec sections above behave exactly as written (reviewer verifies)
Out of scope: <explicit>
Report back: files changed, tests added, deviations (each with a spec/CHANGES.md entry), undeliverable slices (each in trace/deferred.tsv), open risks
```

## 7. Definition of done (v1.0)

1. Every rule in the spec is implemented: `node tools/trace/trace-check.mjs --all` exits 0 on the release tree and `trace/deferred.tsv` is empty; the launch-stable list (§ 5, "Launch-stable list") is `stable` with passing corpus; the rest are `experimental` with known-bad fixtures.
2. Tier-1 adapters: static-html, next-app, next-pages, vite-spa, tanstack-start, react-router, astro, nuxt, sveltekit, supabase addon. Tier-2 adapters listed in Phase 9. Tier-3 generic-http and hosted-builder.
3. All five agent hosts plus git hooks integrated; each row in spec 05 § 3.3 marked verified (or documented as reduced enforcement with reason).
4. Runs on Windows, macOS and Linux without Docker or global installs; `fetch` enables offline use.
5. `check` < 10 s on a 5,000-file repo; full `verify` of a 5,000-page fixture site < 30 min on a laptop.
6. Deterministic reports (golden tests), SARIF/JUnit output, MCP mode, detached verify.
7. Dogfood: each real project reaches `PASS` after fixes, or `PASS` with recorded debt, with no open false positives on stable rules.
8. Signed release artifacts produced (or blocked only on Operator-held signing certificates/accounts, recorded in `BUILD_STATE.md`).

## 8. Risks and fallbacks

| Risk | Fallback |
|---|---|
| Supabase Auth has no Windows/macOS builds | `external` platform mode (spec 04 § 4.4); record rules skipped |
| Portable MySQL/Postgres extensions missing | BLOCKED with list; `external` database |
| A host's hook API differs from the spec | Update spec 05 § 3.3 via `spec/CHANGES.md`; mark reduced enforcement; CI backstop |
| Template grammar immature | Regex sink fallback with tier cap (spec 02 § 4) |
| Lighthouse/Playwright version drift | Pin in toolchain manifest; upgrade only via release |
| Rule false positives in dogfooding | Demote to experimental via hotfix ruleset; fix detector; add known-good fixture |
| Code-signing certificates unavailable | Build unsigned artifacts, record as Operator-blocked in `BUILD_STATE.md` |

## 9. Known gaps handed to builders

The final readiness audit's remaining Minor items are not blockers. Builders resolve them inside the WP that touches them, recording each in `spec/CHANGES.md`. They are: exact wording of localised lists (WP-104); per-host payload field names (WP-101); grammar-specific detector tuning (WP-103/303); fixture-site sizes for performance targets (WP-1004).
