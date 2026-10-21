# shipgate — 03 Formats

> Every file format, grammar and schema shipgate reads or writes. Each gets a published JSON Schema (draft 2020-12) in `schemas/` of the shipgate repo; this file is normative. Load when implementing any reader/writer.

---

## 1. Conventions

UTF-8, `\n`; real files are plain JSON (the `jsonc` blocks here are illustrative). Hashes `sha256:<hex>`; canonical JSON for hashing and signing: RFC 8785 (JCS). Timestamps RFC 3339 UTC; dates `YYYY-MM-DD` = end of day UTC. Paths repo-relative with `/`. Every file has `$schema` and `formatVersion`. JSON files read for `protectedKeys` may be JSONC; `extends` chains (tsconfig) are resolved before evaluating pointers.

---

## 2. Grammars

### 2.1 URL patterns
```
pattern   = [ method " " ] [ service ":" ] path
method    = "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "WS" | "*"
path      = "/" | ( "/" segment )+ [ "/" ]
segment   = literal | "{" name [ ":" regex ] "}" | "*" | "**"
```
- `**` must be a whole segment (`/search/**`, not `/search**`). `WS` = WebSocket upgrade on that path.
- Matching on the decoded path; case per service `pathCase`; trailing slash per service policy; no query.
- Specificity: more literal segments > constrained params > params > `*` > `**`; ties fail validation. All pattern lists (surfaces, `indexRules`, `security.routes`, waivers) use specificity, never list order.
- Service omitted → the only service, else the service whose `mount` and surfaces contain the path.

### 2.2 File globs
`globset` semantics; `/` separator; `**` crosses directories; case-insensitive on Windows/macOS; `!` excludes.

### 2.3 Template tokens
`{field}`, `{brand}`, `{siteName}`, `{self}`, `{page}`. No expressions.

### 2.4 Command policy
```jsonc
"commandPolicy": { "deny": [ { "argv": ["git", "push", "*--force*"] } ], "allow": [] }
```
`argv` elements are token globs with `|` alternatives. The built-in deny list (05 § 3.2) always applies; policy may extend it, never shrink it. Evaluation: 04 § 8.2.

---

## 3. Policy — `quality/policy.json`

### 3.1 Top level
| Key | Type | Default |
|---|---|---|
| `$schema`, `policyVersion` | | required |
| `verifier` | semver range (`"=1.4.2"`) | required; `.shipgate-version` is generated from it by `init`/`migrate` |
| `ruleset` | `"YYYY.MM"` or `"YYYY.MM.N"` | required |
| `project` | `{ name, kinds[], stage: "new"\|"live" }`. `kinds`: `marketing`, `local-business`, `saas`, `pseo`, `api`, `docs`, `ecommerce`, `news`, `ymyl` | `name` and `kinds` required; `stage` defaults to `"live"` (CFG-009) |
| `baseBranch` | string | `"main"` |
| `services[]` | Service | ≥ 1 |
| `hosts[]` | Host | `[]` |
| `verifyEnv` | VerifyEnv | see below |
| `crawl` | `{ maxUrls: 200000, remoteMaxUrls: 3000, ttfbMs: 500 }` | as shown |
| `edge` | `{ production: false, bypassHeaderVar: null }` | as shown |
| `packs` | object; a pack is enabled iff its key exists | `{}` |
| `writeScope` | glob[] | `[]` |
| `roles` | `{ planner: glob[], auditor: glob[] }` extra write scopes | `{}` |
| `protected` | glob[] (added to built-ins) | `[]` |
| `protectedKeys` | `{ file: jsonPointer[] }` (added to built-ins) | `{}` |
| `commandPolicy` | § 2.4 | `{}` |
| `ruleOverrides[]` | `{ rule, state: "off"\|"warn"\|"experimental-on", reason, expires, fpReport? }` | `[]` |
| `waivers[]` | Waiver | `[]` |
| `production` | `{ origins[], hosts[], keyPrefixes[] }` | `{}` |

### 3.2 Service
| Key | Type | Default |
|---|---|---|
| `id` | `^[a-z][a-z0-9-]{0,31}$` | required |
| `path` or `url` | repo path / remote URL | one required |
| `adapters` | string[] (primary, then addons) | `["auto"]` |
| `origin` | https origin | required for `public` surfaces |
| `mount` | path prefix on the origin host | `"/"` |
| `previewUrl` | non-production deployed URL | `null` |
| `nonProduction` / `readOnlyProduction` | bool (remote) | `false` |
| `host` | `vercel\|netlify\|cloudflare-pages\|nginx\|apache\|none` | `none` |
| `commands` | `{ install, build, start, typecheck, lint, test, coverage, migrate, snapshot }` (`coverage` writes an lcov/cobertura report, TST-011) each string or `{ run, shell, cwd }` | adapter defaults |
| `port` | `"{port}"` or integer | `"{port}"` |
| `env` | object; placeholders `{port}`, `{origin}`, `{db.<id>.url}`, `{smtp.port}`, `{supabase.url}`, `{supabase.anonKey}`, `{supabase.serviceKey}` | `{}` |
| `surfaces` | `{ public\|app\|api\|asset: pattern[] }` | proposed by `init` |
| `trailingSlash` | `"always"` \| `"never"` | adapter discovery |
| `pathCase` | `"lower"` (uppercase variants redirect) \| `"insensitive"` \| `"preserve"` | `"lower"` |
| `sanitizer` | `{ module, export }` approved HTML sanitizer for SEC-001 | `null` |
| `minCoverage` | `full\|structural\|behaviour` | `verifyEnv.minCoverage` |
| `writeScope` | glob[] | top-level |

### 3.3 Host registry — `hosts[]`
`{ host: "*.stripe.com", purposes: ["payments"], server: true, browser: true, essential: true, dependency: false }`. Purposes: `payments`, `analytics`, `advertising`, `affiliate`, `ai` (model providers), `assets`, `fonts`, `maps`, `video`, `auth`, `email`, `search`, `support`, `monitoring`, `dependency`, `other`. One registry replaces separate allowlists: `server` → egress allowed (SEC-004); `browser` → real third-party loads allowed in the browser (04 § 6.1); `essential` → allowed before consent (privacy pack); `dependency` → fault-injection target (resilience). Asset hosts are `purposes: ["assets"], browser: true`.

### 3.4 VerifyEnv
| Key | Default |
|---|---|
| `minCoverage` | `"structural"` |
| `databases[]` `{ id, engine: postgres\|mysql\|sqlite, version, provider: embedded\|external, url?, extensions[] }` | `[]` |
| `dbEnv` `{ serviceId: { VAR: "{db.<id>.url}" } }` | `DATABASE_URL` for a single database |
| `seed` `{ <dbId>: { run: "<command>" } \| { sql: [glob] } }` — **seed inputs** = the files matched by `sql` globs, or the command string plus files it references under `quality/` and the migrations dir | none |
| `platform` `{ supabase: { mode: "managed"\|"external", projectUrlVar?, anonKeyVar?, serviceKeyVar? } }` | none |
| `health` `{ serviceId: { url, timeoutSec: 120, intervalMs: 500, endpoint: false } }` (`endpoint: true` = a real health endpoint checked by OPS-002) | `/` |
| `auth` | § 4 |
| `smtp` `{ enabled }` | `true` when any flow uses email |
| `secretsFrom` | `quality/verify.env` |
| `timeBudgets` `{ check: 10, stop: 45, verify: 1800 }` | as shown |
| `reduced` `{ allowed: bool, where: "ci" \| "anywhere" }` — permits reduced runs (G0–G3, verdict at most PARTIAL) when shipgate itself detects no browser or no free ports; `"ci"` additionally requires CI detection (04 § 15) | `{ allowed: false, where: "ci" }` |

**Waiver**: `{ rule, scope: { kind: path|route|surface|family|service|package, pattern }, reason, approvedBy, expires }`.

### 3.5 Pack sections: required keys and defaults
Pack sections are shown in each pack file as examples. **Convention:** every value shown in a pack's example is that key's default, except keys listed below as required (no default; CFG-001/006 fail without them) and values that are obviously project-specific placeholders listed below as "no default". Enum values are the alternatives given in the example comments.

| Pack | Required keys | No default (must be set when used) |
|---|---|---|
| web-delivery | `brand`, `siteName`, `locales`, `defaultLocale` | `targets`, `staticPaths`, `retired`, `contentParams`, `pagination`, `indexRules`, `trustPages.editorialPolicy`, `trustPages.corrections`, `docs.versions` (`llmsTxt` defaults to `"required"` for `docs` projects, else `"optional"`) |
| search-engines | `engines` | `verification.*`, `facets.*`, selectors, `merchantFeed`, `agenticFeeds`, `domainHistory`, `products.discontinued` |
| answer-engines | — | `organization.*`, `authors.*`, `questions`, `indexNow.keyPath` |
| programmatic | `dataAsOf`, `families[].id`, `.service`, `.routePattern`, `.dataset`, `.primaryEntityField`, `.fields`, `.localFacts`, `.titleTemplates`, `.descriptionTemplates`, `.h1Template`, `.schemaTypes`; `sources` | `hubs`, `demand`, `rollout`, `targetQueryTemplate`, `snapshot`; per family `breadcrumbs`, `hub`, `staticFragments`, `retired`, `links` (absent = feature not used) |
| performance | — | `routes` overrides |
| accessibility | — | — |
| security | — | `routes` (else surface defaults), `authEndpoints`, `cors.allowedOrigins`, `payments` (incl. `successPath`, `entitlement`), `realtime`, `storage`, webhook-route `scheme`/`secretVar`/`fixture` |
| privacy | `jurisdictions` | `legalPages`, `consent.banner`, `ccpa.gpcIndicator`, `accountData`, `audience.ageGate` |
| architecture | per service: `layers` | `serverOnly`, `envModule`, `dataAccess`, `singletons`, `entryPoints`, `design.*` |
| data-api | `contracts` (when the service has an `api` surface) | `db`, `jobs`, `idempotentPosts` |
| resilience | — | `degradable` |
| ops | — | `errorReporting`, `email.*` |
| testing | — | — |
| refactor | — | — |
| ux | — | `contactPath` |

Additional keys defined by v7.1+ text and not shown in older examples: web-delivery `retired: [{ path, successor? }]`, `contentParams: [{ pattern, param, mode: "canonical-clean"|"self-canonical" }]`, `pagination: [{ pattern, param, style: "query"|"path" }]`; programmatic families `lastmodField` (default `updatedAt`), `ymylReviewers: []`, hubs `paginatedDescriptionTemplate`; search-engines `facets.defaults: { param: value }`; ops `email.dkimSelectors: []`; flows `requires: [host]`.

---

## 4. Auth and test accounts — `verifyEnv.auth`

```jsonc
"auth": {
  "loginPath": "/login",
  "strategy": "flow",                        // flow | command | header | none
  "flow": "quality/flows/_login.json",
  "command": null,                           // prints {"cookies":[{name,value,domain,path}],"headers":{…}} for SHIPGATE_ACCOUNT
  "headerTemplate": null,                    // "Authorization: Bearer {account.token}"
  "accounts": { "userA": { "role": "member", "tenant": "t1" }, "userB": { "role": "member", "tenant": "t2" }, "admin": { "role": "admin", "tenant": "t1" } },
  "sessionCookies": ["sb-access-token", "session"],
  "verifyBackdoor": null,                    // URL pattern of a test-login route, e.g. "POST web:/__verify/login"
  "tokenTtlVar": null                        // env var the app honours to shorten token lifetimes in verify (SEC-029/044 expiry checks)
}
```
Credentials in `verify.env`: `SHIPGATE_ACCT_<ID>_EMAIL|_PASSWORD|_TOTP_SECRET|_TOKEN`. `verify.env`: `KEY=value` lines, `#` comments, no interpolation, git-ignored, never production values.

---

## 5. Rule metadata — `rules/<pack>/<ID>.yml` (inside shipgate)

```yaml
id: RTE-005
title: 404 is decided before the response is committed
pack: web-delivery
severity: P0
parts: []                      # [{ part, severity, waivable? }] — per-part severities; findings carry `part` (default main) (04 § 1.8)
waivable: true                 # false = †
lifecycle: stable              # experimental | stable | deprecated (deprecated ids are kept as tombstones: never in brief or coverage)
sources: []                    # documentation URLs the rule is based on (required for search-engines rules)
since: "2026.10"
channels: [ast, http]          # gates derive from channels (04 § 1.1)
surfaces: [public, app]
appliesTo: { fileRoles: [route], adapters: ["*"], requires: [] }
scope: changed                 # changed | repo (ast/graph rules)
remote: read                   # read | write | none — what remote/readOnlyProduction targets allow
profile: default               # default | nightly
engine: ast-grep               # ast-grep | oxc | builtin
failureClasses: [status-mismatch]
optionalInputs: []             # inputs whose absence gives skipped instead of notConfigured
owns: []                       # rule ids or "RULE#part" (owning one part of another rule, e.g. LOC-001 owns "UX-003#phones")
groupKey: [routePattern, failureClass]
fix: "Resolve the record before any Suspense boundary; remove loading.tsx from this segment."
tags: [seo, status, nextjs]
corpus: ["web-delivery/rte-005-*"]
```
**Detectors** are separate: ast-grep YAML files in `rules/<pack>/<ID>/detect/*.yml` (and adapter traps in `adapters/<id>/rules/*.yml`) carry `ruleId: <ID>`; builtin detectors are Rust modules registered under the rule id. Adapter trap ids `<ADAPTER>-NNN` declare `guards: [<ID>]`; their findings group under the guarded rule. Metadata validation rejects an `owns` relation where the owner is waivable and an owned rule is not.

---

## 6. Adapter manifest — `adapters/<id>/adapter.json`

Fields: `id`, `claimedTier`, `detect`, `language` (oxc languages and/or tree-sitter grammar ids), `templateLanguages` (tree-sitter grammars: `vue`, `svelte`, `astro`, `embedded-template` (ERB/EJS), `twig`, `blade`, `jinja2`; where no maintained grammar exists, `regexSinks` with declared precision and a max tier of 2 for that template language), `defaults.commands`, `windows` overrides, `portBinding` (`env:PORT` | `flag:--port {port}` | `config`), `envInlinedAtBuild` (bool), `routes.discover`, `routes.fileMap`, `fileRoles` (glob → role), `entryPoints` (framework-required exports/files), `config` readers, `suppressions[]`, `testMarkers[]`, `testShuffle`, `rawHtmlSinks[]`, `publicEnvPrefixes[]`, `envReadApis[]`, `queryApis[]`, `httpClientApis[]`, `loggerApis[]`, `clockApis[]`, `hashApis[]`, `serverOnlyMarkers[]`, `clientEntries`, `bundleManifest`, `notFoundPatterns[]`, `jobDiscovery` (patterns for cron/queue registrations), `strictness[]` (config pointers that must be on for ARC-010, e.g. `tsconfig:/compilerOptions/strict`), `sleepApis[]` (TST-004), `diagnosticPatterns[]` (regexes counting diagnostics in command output, for debt occurrences), `i18nCatalogs[]` (globs of message catalogues for MET-008), `execApis[]`, `fsApis[]`, `pathGuardApis[]`, `evalApis[]`, `deserializeApis[]`, `queryApis[]`, `validatorApis[]` (SEC-045), `redirectApis[]`, `modelApis[{ call, maxTokensArg }]`, `modelToolApis[]` (SEC-062), `authGuardApis[]` (ARC-006, SEC-057, SEC-062), `serverFunctions[{ kind: "next-action"|"sveltekit-action"|"remix-action"|"trpc"|"orpc", discover, invoke }]` (SEC-057: `discover` finds them, e.g. `'use server'` exports or `.next/server/server-reference-manifest.json`; `invoke` is the request template, e.g. Next: POST with a `Next-Action` header and a JSON argument array), `writeOperations[]` (which `queryApis`/`httpClientApis` calls are writes), `sessionCookies[{ name, decode: "plain"|"base64-chunked"|"jwt" }]` (SEC-037 finds tokens inside cookies), `defaultAliasHosts[]` (platform default hosts added to `aliasHosts`, e.g. `*.vercel.app`, for URL-011), `searchHandlers[]` (IDX-012), `errorPageFingerprints[]` (framework default error pages, UX-005), `redirectSources[]` (where the stack keeps redirects: config files, middleware tables; REF-011), `priority` (integer; when several adapters detect, the highest wins; ties fail CFG-002), `migrations` `{ format, dir, applyCommand }`, `schemaDriftCommand`, `codegen[]`, `rules` dir. Addons declare only what they add.

Project-local adapters (`quality/adapters/`) earn a tier through `shipgate conformance --adapter <id>` against Operator-supplied fixtures; the result is signed with the lock.

---

## 7. Keys and trust

### 7.1 Key storage
- **Operator key:** Ed25519 private key encrypted with a key derived from the Operator's passphrase (Argon2id, m=64 MiB, t=3, p=1), stored as an OS keychain item (Windows Credential Manager, macOS Keychain, Linux Secret Service; on Linux without a secret service, an encrypted file in the user config dir). The passphrase is never stored or cached; every Operator command asks for it on an interactive terminal.
- **Install secret:** random 32 bytes in the keychain (no passphrase), used only for HMAC of sealed verdict records (04 § 8.1); same-user processes can read it, so CI is authoritative (04 § 8.1 honest limit).
- **CI key:** Ed25519 key in a CI secret (`SHIPGATE_CI_SIGNING_KEY`, base64 of the 32-byte seed), role `ci`.
- **Fingerprints:** `ed25519:` + lowercase hex SHA-256 of the 32-byte public key.
- Hardware-backed keys (FIDO2/Windows Hello/Touch ID) are a later option behind the same interface.

### 7.2 Trust store
A keychain item (not a plain file) holding `[{ fingerprint, role: "operator"|"ci", pubkey, addedAt, label }]`. Adding a key (`keys trust`) needs the passphrase of an already trusted Operator key, except for the very first key. `doctor` reports trust-store changes since the last run. In CI the trust store is the `SHIPGATE_TRUSTED_KEYS` setting (JSON of the same shape), never read from the repo.

Role permissions: `operator` signs locks, debt, waivers, overrides, baselines, break-glass; `ci` signs only `quality/baselines/_main/`.

### 7.3 User config — `<config dir>/shipgate/config.toml`
Keys: `licence.path`, `telemetry.crashReports` (false), `mirror`, `proxy`, `cache.dir`, `update.channel`. No security-relevant trust is stored here; in particular, reduced mode can't be enabled here (only by the signed policy, § 3.4).

### 7.4 Backups
`keys export` writes the passphrase-encrypted private key to a file for a password manager; `keys import` restores it.

---

## 8. Lock — `quality/lock.json`

```json
{ "formatVersion": 1, "verifierMajor": 1, "ruleset": "2026.10",
  "inputs": [ { "path": "quality/policy.json", "sha256": "…" } ],
  "appliedMigrations": [ "supabase/migrations/20260101_init.sql" ],
  "digest": "sha256:…", "signedBy": "ed25519:<fp>", "signature": "base64…", "createdAt": "2026-10-21T10:00:00Z" }
```
- **Inputs (sorted):** `quality/policy.json`, `quality/data/**`, `quality/fixtures/**`, `quality/flows/**`, `quality/contracts/**`, `quality/adapters/**`, `quality/host/**`, `quality/rollout/**`, `quality/approvals/**`, `quality/baselines/**` **except `_main/`**, `quality/debt.json`, `quality/refactor.json`, the migration files listed in `appliedMigrations` (the set at lock time), host hook configuration files written by `hooks install`, the protected JSON pointers of `protectedKeys` files (entries `{ path, pointer, sha256 }` where the hash is over the JCS of the pointed value), and the content between `<!-- shipgate -->` and `<!-- /shipgate -->` markers in `AGENTS.md`/`CLAUDE.md` (entries `{ path, section: "shipgate", sha256 }`). The lock also stores `verifyEnvSha256` (hash of `quality/verify.env`, not its content).
- **Digest:** SHA-256 over `path\0sha256\n` lines. **Signature:** Ed25519 (role `operator`) over the JCS of the object without `signature`.
- `_main/` is verified by its own `ci`-role signature. `verify.env` is not locked; its hash is tracked as a sensitive path (04 § 5).
- Merges to the base branch that only change `_main/` never invalidate the lock.

---

## 9. Debt — `quality/debt.json` (signed with the lock)

```json
{ "formatVersion": 1, "recordedAt": "2026-10-21T10:00:00Z", "ruleset": "2026.10",
  "items": [
    { "fingerprint": "sha256:…", "rule": "SEC-001", "locationKey": "apps/web/lib/legacy.tsx#LegacyBanner#dangerouslySetInnerHTML#0", "occurrences": 1, "expires": "2027-01-15" },
    { "fingerprint": "sha256:…", "rule": "A11-005", "locationKey": "web:/blog/{slug}|color-contrast|.post-meta > span", "occurrences": 4, "expires": null },
    { "fingerprint": "sha256:…", "rule": "SEC-050", "part": "history", "locationKey": "config/old.env@3f2a1c9#aws-key#9b1e…", "occurrences": 1, "expires": null, "rotatedOn": null }
  ] }
```
Fingerprint = SHA-256 of JCS `{ rule, locationKey }` (keys: 04 § 9.3). Items of `†` rules or `†` parts require `expires` ≤ 90 days; non-† parts of † rules (e.g. SEC-050 `history`, 04 § 1.8) follow their own metadata. `rotatedOn` (Operator-signed via `debt rotate`) clears a SEC-050 `history` item. Commands: `debt record` (initial/full), `debt add --reason` (only for rules that became stable, packs newly enabled, or inputs newly configured since the last record), `debt rotate`, `debt show`.

---

## 10. Flows — `quality/flows/*.json`

```jsonc
{ "id": "signup-to-first-invoice", "service": "web", "account": null,
  "viewport": "mobile", "orientation": "portrait", "browsers": ["chromium"], "persist": false, "mutates": true,   // orientation: portrait | landscape | both
  "journey": "signup",        // login | signup | checkout | contact | deletion | export | withdrawal | cancel | other (default other)
  "keyboard": null,           // A11-019; null = true when `journey` or the flow id contains an entry of accessibility.keyboardFlows; else false
  "conversion": null,         // analytics event name this flow must send after consent (UX-010)
  "requires": [],             // third-party hosts the flow depends on (RES-004)
  "steps": [ … ] }
```
| Step | Fields |
|---|---|
| `goto` | path or absolute URL on a service origin |
| `click`, `hover`, `dblclick`, `check`, `uncheck` | Locator |
| `fill` | Locator + `value` |
| `select` | Locator + `value` \| `label` |
| `press` | `key` (+ Locator) |
| `upload` | Locator + `file` (under `quality/fixtures/`) |
| `waitFor` | Locator \| `{ url }` \| `{ network: "idle" }` |
| `frame`, `popup` | nested `steps` |
| `submitEmpty` | Locator of a form: submits with no input (A11-003 error association) |
| `markAmount` | Locator + `field` name: declares which input/param carries a price/amount (SEC-041 tamper probe) |
| `markPrice` | Locator + `priceId`: declares which `business.json` price the flow selects, so UX-015 compares the amount charged with it |
| `expectUrl` | `{ equals \| matches }` |
| `expectText` | `{ text, in?, mode: contains\|exact\|regex }` |
| `expectVisible`, `expectHidden` | Locator |
| `expectApi` | `{ method, path, status, jsonPath?, equals? }` with the flow's session |
| `expectDb` | `{ db, sql, equals }` read-only |
| `expectEmail` | `{ to, subjectContains, linkMatches? }` → `{email.link}` |
| `openEmailLink` | uses `{email.link}` |
| `expectDownload` | `{ trigger: Locator, nameMatches?, contains?: [text] }`: the click produces a download, captured to the run dir (PRV-016 export) |
| `totp` | Locator |
| `stubNetwork` | `{ urlMatches, status, body }` (third-party hosts only) |
| `expectEgress` | `{ host, method?, pathMatches?, bodyContains? }`: since the previous step, a matching request was made either server-side (seen by the egress proxy) or from the browser (seen by browser interception), for example a form posting to a CRM, Formspree or HubSpot. Both paths answer with the stub declared for that host in `ux.egressStubs` (default `200 {}`), so nothing real is sent |
| `measure` | `"inp"` |

Locator: `{ role, name }` | `{ label }` | `{ placeholder }` | `{ text }` | `{ testId }`. Generators: `{uniqueEmail}`, `{strongPassword}`, `{uuid}`, `{account.<id>.email}` (seeded by flow id + run id). `_login.json` is the login flow.

---

## 11. Refactor declaration — `quality/refactor.json`

```jsonc
{ "formatVersion": 1, "baseline": "2026-10-21-pre-app-router", "goal": "Migrate /blog to App Router",
  "allowedChanges": [
    { "kind": "url-move", "from": "web:/blog/category/{slug}", "to": "web:/blog/topics/{slug}" },
    { "kind": "markup", "routes": "web:/blog/**", "selector": "footer" },
    { "kind": "visual", "routes": "web:/blog/**", "maxDiffRatio": 0.02 },
    { "kind": "api-field-added", "endpoint": "GET api:/posts", "jsonPath": "$.items[*].readingTime" } ] }
```
`kind`: `url-move`, `url-remove`, `markup`, `visual`, `text`, `metadata`, `api-field-added`, `api-field-removed` (+ `contractVersion`), `api-status`, `header`, `budget`, `schema`, `flow`.

---

## 12. Baselines — `quality/baselines/<id>/`

```
manifest.json     { id, createdAt, commit, ruleset, verifierVersion, services, counts, files: [{path, sha256}], remote: { origin } | null, signedBy, signature }
routes.jsonl      { pattern, url, status, location?, robots, canonical, title, description, h1, mainTextHash, mainText(≤20 KB), jsonld, links[], lastmod?, visibleUpdated?, kind: page|family|hub }
                  (mainTextHash is computed with `<time>` elements and detected dates removed, 04 § 15, so date-only edits don't count as content changes: AEO-012)
api.jsonl         { request: {method, url, headersSubset, body?}, status, headers(normalised), body(normalised), contractVersion }
db/schema.sql, db/policies.json
flows.jsonl       { flow, browser, steps: [{index, ok, url, texts[], api?, db?, emails[{to, subject, linkPaths[], textHash}], thirdParty[{host, event?}]}] }
redirects.jsonl   { source, status, location, from: host-config|retired|adapter }   (REF-011)
budgets.json      { routeGroup: { lcp, cls, tbt, inp, scriptBytes, cssBytes }, api: { endpoint: p95 } }
a11y.json         { url: [{ axeRule, selector, impact }] }
security.json     { url: { headers, cookies }, probes: [{ id, outcome }] }
visual/<route-group>/<viewport>.png  (+ masks in manifest)
```
A remote baseline (`baseline --from-remote <origin>`, REF-010) has the same layout. Its `routes.jsonl` is built from the union of the site's sitemaps, a capped read-only crawl (`crawl.remoteMaxUrls`), `quality/data/legacy-urls.txt` and declared redirect sources, and adds the fields `source: sitemap|crawl|legacy|redirect` and `mainWords` (word count of `<main>`, REF-010 `depth`). It also has `serviceworkers.jsonl` `{ scriptURL, scope }`, recorded by loading `/` and the browser sample read-only in Chromium (REF-013). It has no `api`, `db` or `flows` files.
Signature over the manifest (which lists file hashes). `_main/` additionally holds `contracts/`, `counts.json` (routes, endpoints, flows, indexable pages), `cycles.json`; signed by a `ci` key. Absent `_main/` → rules needing it are `skipped(no-main)` with a warning; the Operator may create it locally with `baseline --id _main`.

---

## 13. Programmatic inventory and quarantine

`quality/generated/inventory/<family>.jsonl`, one JSON object per line with a `type` field:
- `page`: `{ type, family, rowId, locale, pathname, canonical, robots, title, description, h1, facts{field:{value,text}}, tokens{name:text}, breadcrumbs[{name,url}], hub, related[paths], alternates{locale:url}, schema{types[], values{}}, lastmod (from the family's lastmodField), previousSlugs[], wave }`
- `hub`: `{ type, hub, group, page, pages, pathname, canonical, robots, title, description, h1, items[paths], parent, lastmod }`
- `static`: `{ type, pathname, canonical, robots, lastmod? }` for declared static paths included in sitemaps. G2 regenerates the inventory into `quality/out/inventory/` and compares: a committed inventory that differs from the data is an Operator-owned finding (`stale`). Agents may run `inventory` (licence-free); byte-identical output is not a violation. Quarantine: `quality/out/quarantine.jsonl`.

---

## 14. API examples, released contracts, ownership fixtures, jobs

- **Examples** — `quality/contracts/examples/<service>/*.json`: `{ id, request: { method, path, headers?, query?, body?, account? }, expect: { status, jsonPath?: { "$.x": value }, schemaRef? } }`.
- **Released contracts** — `quality/contracts/released/<service>/<semver>/<file>`; "latest" = highest semver. Breaking-change declarations: `quality/contracts/released/<service>/CHANGES.md` entries `## <semver>` listing removed/changed paths.
- **Ownership fixtures** — `quality/fixtures/ownership.json`: `{ "resources": [ { "pattern": "web:/api/invoices/{id}", "param": "id", "owners": { "userA": ["inv_1","inv_2"], "userB": ["inv_9"] }, "writeBody": { "amount": 1 } } ] }`. Without it, ids are harvested: for each `owner`-scoped pattern, the matching list endpoint (same path minus the last `{param}` segment, `GET`) is called as each account; ids are read from `$..id` (or the contract's id field) of the response. Write probes use `writeBody`, or a contract example body, else the write part is `notConfigured`.
- **Business facts** — `quality/data/business.json` (Operator-owned, signed with the lock): `{ name, legalName?, phones: [{ e164, label }], emails: [], locations: [{ id, name, address: { street, locality, region, postalCode, country }, geo?, phone, hours: [{ days: ["Mo"…], opens, closes }], pagePath, gbpUrl? }], prices: [{ id, label, amount, currency, kind?: "item"|"fee" (default item), recurring?: "month"|"year", providerId? }], ratings: [{ source, value, count, asOf }], claims: [{ id, text, value?, source, evidence? }], testimonials: [{ text, author, source, consentedOn }], people: [{ name, role, pagePath? }], certifications: [{ name, issuer, evidence, validUntil? }], clients: [{ name, url? }], press: [{ name, url? }], manufacturers: [{ id, name, address, contact, country, euResponsible?: { name, address, contact } }], legal: { registerNumber?, vatId?, representative?, mailOrderNumber?, icpNumber?, psbNumber? }, offers: [{ id, label, endsAt }], postalAddress?, founded?, socialProfiles: [] }`. A missing key means "none of these exist", so UX-013/014/019 report any such content on the site as a blocking finding (04 § 1.2 facts-oracle rules).
`postalAddress` has the same shape as `locations[].address` and is compared with LOC-001's normalised containment (PRV-022 `imprint`, OPS-005 `postal`). LOC-001/003, SCH-007 (matched by `pagePath`) and UX-003/004 compare rendered pages against this file.
- **Webhook fixtures** — `quality/fixtures/webhooks/<route-id>/*.json`: raw provider event bodies (as the provider sends them). shipgate signs them with `secretVar` per the route's `scheme` for SEC-026/049 probes.
- **Merchant feed** — the file at search-engines `merchantFeed`: RSS 2.0/Atom with the `g:` namespace, or TSV with a header row. Fields read: `id`, `link`, `price`, `sale_price`, `availability`, `gtin`, `item_group_id` (SE-113).
- **Payment-page scripts** — `quality/data/payment-scripts.json` (Operator-owned, locked): `{ formatVersion, scripts: [{ url (exact URL or URL pattern), purpose, justification, approvedBy, integrity? }] }`. This is the PCI DSS 4.0.1 6.4.3 script inventory that SEC-063 reads.
- **Agentic feeds** — files at search-engines `agenticFeeds[].path`. The type is taken from the extension: `.json`/`.jsonl` (JSON) or `.csv`/`.tsv` (delimited). Fields are read through the ruleset `agentic-feeds.json` mapping for the `kind`, or `fields` for `kind: "other"` (SE-114).
- **Field data** — `quality/data/crux/<host>.json` (Operator export, one per production host): a CrUX API `queryRecord` response or an array of them (PRF-020).
- **Dictionary** — `quality/data/dictionary.txt`: one word per line, UTF-8 (CQ-007).
- **Legacy URLs** — `quality/data/legacy-urls.txt` (Operator-owned): one absolute URL or path per line, `#` for comments. Typical sources are the old sitemap, a Search Console pages export or a backlink export. REF-010 reads it.
- **Page approvals** — `quality/approvals/pages-<n>.json` (written by `approve pages`): `{ paths: [], aiProvenance: { model?, promptVersion?, reviewedBy, reviewedAt }, disclosure: bool, expires, signedBy, signature }`. The signature covers the JCS of all other fields, and `approve pages` re-locks, so approvals are also lock inputs (§ 8). CQ-006 accepts only approvals with a valid Operator signature.
- **Jobs** — `data-api.jobs[]`: `{ service, name, schedule?, run: "<command>", idempotencyKey, writes: ["table", …] }`; JOB-002 runs `run` twice on one instance and compares `writes` tables.

---

## 15. Agent-side and state files

- **`quality/out/handoff.json`** (Verifier): `{ treeHash, verdict, reason, findings[], attempts[], decisionsNeeded[] }`. Authoritative copy inside the sealed record.
- **`quality/out/break-glass.sig`** (Operator): `{ treeHash, expiresAt, nonce, signedBy, signature }`.
- **`quality/proposals/dependencies.json`** (Builder): `[{ name, version, reason, licence, installScripts: bool }]` (SEC-053 requires `installScripts: true` for every new package with install scripts); copied into the report; manifest/lockfile changes must match it (AGT-009).
- **`quality/proposals/waiver-requests.json`** (Builder/Auditor): `[{ rule, scope, reason, requestedBy, evidenceHash }]`.
- **`quality/proposals/**`** (Planner): policy fragments, flows, contracts for Operator review.
- **`quality/audit/review.json`** (Auditor): `[{ rule, target, result: "pass"|"fail", note }]`.
- **State dir** (`<state dir>/shipgate/<repo-id>/`, outside the repo): `attempts.json`, session snapshots, `verdicts/` (sealed records).

---

## 16. Normalised hook events

Every host adapter maps its payload to: `{ host, event: "session-start"|"prompt"|"pre-tool"|"post-tool"|"stop", tool: "edit"|"write"|"shell"|"read"|"mcp"|"other", paths[], command?, prompt?, sessionId, stopRepeated: bool, role }`. `role` comes from the installed hook config (`hooks install --role builder|planner|auditor`). Host-specific mappings live in the host adapters (05 § 3).

---

## 17. Report — `quality/out/report.json` (+ SARIF, JUnit, summary.md)

```jsonc
{ "formatVersion": 1, "specVersion": "7.4.0", "ruleset": "2026.10", "verifierVersion": "1.0.0",
  "mode": "verify", "profile": "default", "treeHash": "sha256:…", "verdict": "FAIL",
  "lock": { "valid": true, "signedBy": "ed25519:…", "digest": "sha256:…" },
  "services": [{ "id": "web", "adapters": ["next-app","supabase"], "coverage": "full", "framework": "next@16.0.1" }],
  "coverage": { "web": { "applied": 230, "notApplicable": 41, "noAdapterSupport": 0, "skipped": 3, "notConfigured": 1, "experimental": 6,
                         "rules": [ { "id": "SEC-043", "outcome": "notConfigured", "input": "security.realtime.channels" } ] } },
  "gates": [{ "id": "G4", "status": "FAIL", "durationMs": 81234, "log": "quality/out/logs/G4.txt", "cache": "miss" }],
  "findings": [{ "rule": "SEC-021", "severity": "P0", "status": "blocking", "gate": "G4", "count": 3,
    "groupKey": "web:/api/invoices/{id}|access-allowed",
    "examples": [{ "target": "GET web:/api/invoices/inv_123 as anonymous", "expected": "401|403", "actual": "200 + body",
                   "file": "apps/web/app/api/invoices/[id]/route.ts" }],
    "fixLocation": "apps/web/app/api/invoices/[id]/route.ts", "owner": "builder",
    "fix": "Call the auth guard before reading data in every handler under a protected route.", "evidenceHash": "sha256:…" }],
  "debt": { "total": 41, "matched": 41, "new": 0, "expiringSoon": [] },
  "warnings": [], "waiversApplied": [], "overridesActive": [], "dependenciesAdded": [], "handoff": null }
```
SARIF 2.1.0 (P0/P1 → error, P2 → warning, W → note), JUnit (one testcase per rule), `summary.md` for PR comments.

---

## 18. Rollout state and indexing exports

- **`quality/rollout/<family>.json`** (Operator-signed with the lock): `{ formatVersion, family, waves: [ { index, rowIds[], releasedAt, evidence: { exportFile, exportSha256, indexRate, measuredAt } } ] }`. `rollout release` appends the next wave after checking ROL-003.
- **`quality/data/indexing/<family>.csv`** (Operator-provided Search Console export): columns `url,coverageState,lastCrawled`; a URL counts as indexed when `coverageState` is one of the export's "indexed" states. Locale-specific state labels are mapped in the ruleset.

## 19. Toolchain manifest (inside each shipgate release)

`[{ name, version, platform, url, sha256, size, licence, purpose, unpackTo, requires: [] }]` plus data snapshots refreshed by `fetch` (OSV database; npm `deprecated` metadata for packages in the project's lockfiles only — other ecosystems' deprecation status is reported as unknown/W) for portable Node, Playwright + browsers, Lighthouse, axe-core, web-vitals, OSV-Scanner + database snapshot, PostgreSQL/MySQL (with `extensions[]`), PostgREST, Supabase Auth, Supabase schema DDL, tree-sitter grammars. npm packages are vendored tarballs with integrity hashes. Mirrors via `SHIPGATE_MIRROR`.
