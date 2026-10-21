# shipgate — 03 Formats

> Every file format, grammar and schema shipgate reads or writes. Each gets a published JSON Schema (draft 2020-12) in `schemas/` of the shipgate repo; this file is normative. Load when implementing any reader/writer.

---

## 1. Conventions

UTF-8, `\n`; real files are plain JSON (the `jsonc` blocks here are illustrative). Hashes `sha256:<hex>`; canonical JSON for hashing and signing: RFC 8785 (JCS). Timestamps RFC 3339 UTC; dates `YYYY-MM-DD` = end of day UTC. Paths repo-relative with `/`. Every JSON file whose top level is an object carries `formatVersion` (integer, starting at 1) and may carry `$schema` (shipgate writes it; readers validate against it when present), except `quality/policy.json`, which has `$schema` and `policyVersion`, and files whose format a third party defines, read as-is: `quality/data/crux/*.json`, merchant/agentic feeds, webhook fixtures (§ 14), released OpenAPI contracts, `package.json`/`tsconfig*.json`/lint configs. In an Operator-authored input file (§ 10 flows, § 14 files) an absent `formatVersion` means 1; files shipgate writes always carry it. Files whose top level would be an array are objects `{ $schema?, formatVersion, items: [ … ] }` (§ 15 `dependencies.json`, `waiver-requests.json`, `review.json`; § 19 toolchain manifest). JSONL, TXT, CSV/TSV, TOML, YAML, SQL and image files carry no version field; their format version is that of the enclosing directory's manifest or lock (or 1 where there is none). JSON files read for `protectedKeys` may be JSONC; `extends` chains (tsconfig) are resolved before evaluating pointers.

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
- `service` = a service `id` (§ 3.2). `name` = `[a-zA-Z_][a-zA-Z0-9_]*`. `literal` = one or more RFC 3986 `pchar` except `{`, `}`, `*`, compared after percent-decoding. `regex` = Rust `regex` crate syntax, implicitly anchored `^…$` to one segment; `}` inside it is written `\}`.
- `**` matches zero or more segments; `*` and `{name}` match exactly one non-empty segment. Method omitted = any method; `HEAD` requests match `GET` patterns.
- **Specificity** compares two patterns segment by segment from the left. At the first position where they differ: literal > constrained param > param > `*` > `**`. If all compared positions are equal, the longer pattern wins, then the pattern with an explicit method. Two patterns **tie** when this comparison can't order them **and** some path matches both; a tie fails validation (CFG-001/006). All pattern lists (surfaces, `indexRules`, `security.routes`, waivers) use specificity, never list order.
- Service omitted → the only service. Otherwise, among services whose `mount` is a prefix of the path and one of whose surface patterns matches it, the one with the longest `mount`; if none qualifies, or two remain, the pattern is invalid (CFG-001).

### 2.2 File globs
`globset` semantics; `/` separator; `**` crosses directories. A list matches a path when at least one non-`!` entry matches and no `!` entry matches (set semantics, never order). Matching is case-sensitive on every OS. On case-insensitive file systems, a path is first resolved to its on-disk casing (the casing `git ls-files` records for tracked files; otherwise the file system's canonical casing, and for a not-yet-existing file the canonical casing of its existing parent directories plus the name as given) and then matched.

### 2.3 Template tokens
`{field}`, `{brand}`, `{siteName}`, `{self}`, `{page}`. No expressions.

### 2.4 Command policy
```jsonc
"commandPolicy": { "deny": [ { "argv": ["git", "push", "*--force*"] } ], "allow": [] }
```
`argv` elements are token globs with `|` alternatives. The built-in deny list (05 § 3.2) always applies; policy may extend it, never shrink it. Evaluation: 04 § 8.2.
- **Matching.** A pattern matches a simple command (after 04 § 8.2 steps 1–2; argv[0] compared by basename without `.exe`/`.cmd`/`.ps1`) when its tokens match the argv tokens left to right, anchored at argv[0]; argv tokens after the last pattern token are allowed. A pattern token that is `*` alone matches zero or more whole tokens. Any other token is a glob over one token: `*` matches any characters within it, `[…]`/`[!…]` are character classes, `|` separates alternatives and `(a|b)` groups. Token matching is case-sensitive, except argv[0] on Windows.
- **Predicates.** A pattern may carry `when: "<predicate>"`; it then matches only when the predicate holds for that command too. Built-in predicates are defined in 05 § 3.2 (`prodHost`, `protectedTarget`, `writeApi`, `setsVerifierVar`); policy entries may use them.
- **`allow`** entries (same shape) apply only to policy `deny` entries: they carve exceptions out of the Operator's own additions and never out of built-ins.

---

## 3. Policy — `quality/policy.json`

### 3.1 Top level
| Key | Type | Default |
|---|---|---|
| `$schema`, `policyVersion` | | required |
| `verifier` | Cargo `semver::VersionReq` string (`"=1.4.2"`, `"^1.4"`) | required. `init` and `migrate` write `.shipgate-version` = the running binary's exact version, which must satisfy `verifier` (else exit 3, `verifier-range-mismatch`). CFG-008 compares the running binary with `verifier`, not with `.shipgate-version` |
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
| `ci` | `{ mainBaseline: "artifact"\|"commit" }` — where the base-branch job keeps `quality/baselines/_main/` (05 § 5) | `{ mainBaseline: "artifact" }` |

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
| `commands` | `{ install, build, start, typecheck, lint, test, coverage, migrate, snapshot }` (`coverage` writes an lcov/cobertura report, TST-011) each string or `{ run, shell, cwd }`. `shell`: `none` (default) \| `sh` \| `bash` \| `pwsh` \| `cmd`. Under `none` the string is split with POSIX shell-word rules (quotes and backslash escapes; no expansion, no operators: `\|`, `&&`, `\|\|`, `;`, `<`, `>` make it invalid, CFG-002), and argv[0] is resolved via `PATH` plus `node_modules/.bin` of the service path (`.cmd`/`.exe` resolution on Windows). Otherwise it runs as `sh -c`/`bash -c <string>`, `pwsh -NoProfile -Command <string>`, `cmd /d /s /c <string>`. `cwd` is relative to the service `path` (default `.`). A plain string = `{ run: <string>, shell: "none", cwd: "." }` | adapter defaults |
| `port` | `"{port}"` or integer | `"{port}"` |
| `env` | object; placeholders `{port}`, `{origin}`, `{db.<id>.url}`, `{smtp.port}`, `{supabase.url}`, `{supabase.anonKey}`, `{supabase.serviceKey}` | `{}` |
| `surfaces` | `{ public\|app\|api\|asset: pattern[] }` | proposed by `init` |
| `trailingSlash` | `"always"` \| `"never"` | adapter discovery |
| `pathCase` | `"lower"` (uppercase variants redirect) \| `"insensitive"` \| `"preserve"` | `"lower"` |
| `sanitizer` | `{ module, export }` approved HTML sanitizer for SEC-001 | `null` |
| `minCoverage` | `full\|structural\|behaviour` | `verifyEnv.minCoverage` |
| `writeScope` | glob[] | top-level |

### 3.3 Host registry — `hosts[]`
`{ host: "*.stripe.com", purposes: ["payments"], server: true, browser: true, essential: true }`. Shape: `{ host, purposes: string[] (≥ 1), server: false, browser: false, essential: false }` (defaults shown). `host` is a DNS name or `*.` + name; `*.` matches one or more labels and never the apex (`*.stripe.com` matches `js.stripe.com` and `a.b.stripe.com`, not `stripe.com`); matching is case-insensitive and ignores the port. A host matching several entries gets the union of their flags and purposes. Purposes: `payments`, `analytics`, `advertising`, `affiliate`, `ai` (model providers), `assets`, `fonts`, `maps`, `video`, `auth`, `email`, `search`, `support`, `monitoring`, `dependency`, `other`. One registry replaces separate allowlists: `server` → egress allowed (SEC-004); `browser` → real third-party loads allowed in the browser (04 § 6.1); `essential` → allowed before consent (privacy pack); a host is a fault-injection target (resilience, 04 § 4.5) iff `purposes` contains `dependency` (there is no `dependency` boolean). Asset hosts are `purposes: ["assets"], browser: true`.

### 3.4 VerifyEnv
| Key | Default |
|---|---|
| `minCoverage` | `"structural"` |
| `databases[]` `{ id, engine: postgres\|mysql\|sqlite, version, provider: embedded\|external, url?, extensions[] }` | `[]` |
| `dbEnv` `{ serviceId: { VAR: "{db.<id>.url}" } }` | `DATABASE_URL` for a single database; several databases and no `dbEnv` → CFG-001 |
| `seed` `{ <dbId>: { run: "<command>" } \| { sql: [glob] } }` — **seed inputs** = the files matched by `sql` globs, or the command string plus files it references under `quality/` and the migrations dir. `sql` files apply in path byte order | none |
| `platform` `{ supabase: { mode: "managed"\|"external", projectUrlVar?, anonKeyVar?, serviceKeyVar? } }` | none |
| `health` `{ serviceId: { url, timeoutSec: 120, intervalMs: 500, endpoint: false } }` (`endpoint: true` = a real health endpoint checked by OPS-002). `url`: a path on the service origin. Ready = the first response with status 200–399 (redirects not followed); with `endpoint: true`, only 200. Polling starts at `intervalMs`, doubles after each failed attempt up to 5,000 ms, and stops at `timeoutSec`; not ready by then → BLD-005 for that service | `url: "/"` |
| `auth` | § 4 |
| `smtp` `{ enabled }` | `true` when any flow uses email |
| `secretsFrom` | `quality/verify.env` |
| `timeBudgets` `{ check: 10, stop: 45, verify: 1800 }` (seconds) | as shown |
| `reduced` `{ allowed: bool, where: "ci" \| "anywhere" }` — permits reduced runs (G0–G3, verdict at most PARTIAL) when shipgate itself detects no browser or no free ports; `"ci"` additionally requires CI detection (04 § 15) | `{ allowed: false, where: "ci" }` |

**Waiver**: `{ rule, part?: string (default: every waivable part of the rule), scope: { kind: path|route|surface|family|service|package, pattern }, reason, approvedBy, expires: YYYY-MM-DD (required, ≤ 365 days after the signing lock's `createdAt`) }`. `pattern` by `kind`: `path` → file glob (§ 2.2); `route` → URL pattern (§ 2.1); `surface` → `public|app|api|asset`; `family` → programmatic family id; `service` → service id; `package` → `name` or `name@<semver range>`. CFG-001 rejects a waiver whose `rule`, or `part`, isn't waivable (01 § 5.4, 04 § 1.8). A waiver on a † rule covers only its waivable parts (e.g. RTE-010 `source-hint`, 04 § 1.8); a † rule without a waivable part can't be waived.

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
| privacy | `jurisdictions` | `legalPages`, `consent.banner`, `ccpa.gpcIndicator`, `accountData`, `audience.ageGate`, `digitalProductPaths` |
| architecture | per service: `layers` | `serverOnly`, `envModule`, `dataAccess`, `singletons`, `entryPoints`, `design.*` |
| data-api | `contracts` (when the service has an `api` surface) | `db`, `jobs`, `idempotentPosts`, `contracts[].clientTypes` |
| resilience | — | `degradable` |
| ops | — | `errorReporting`, `email.*` |
| testing | — | — |
| refactor | — | — |
| ux | — | `contactPath` |

Additional keys defined by v7.1+ text and not shown in older examples: web-delivery `retired: [{ path, successor? }]`, `contentParams: [{ pattern, param, mode: "canonical-clean"|"self-canonical" }]`, `pagination: [{ pattern, param, style: "query"|"path" }]`; programmatic families `lastmodField` (default `updatedAt`), `ymylReviewers: []`, hubs `paginatedDescriptionTemplate`; search-engines `facets.defaults: { param: value }`, `facets.routes: [pattern]` (no default; facet probe bases, search-engines § 3.3), `facets.indexable: [[param…]]` (absent = `[]`: no facet combination is indexable); web-delivery `siteAlternateName` (string, default `null`, SE-102); ops `email.dkimSelectors: []`; flows `requires: [host]`.

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
Credentials in `verify.env`: `SHIPGATE_ACCT_<ID>_EMAIL|_PASSWORD|_TOTP_SECRET|_TOKEN`, where `<ID>` = the account id upper-cased with every non-alphanumeric character replaced by `_` (`userA` → `USERA`, `sales-admin` → `SALES_ADMIN`); two ids mapping to the same `<ID>` → CFG-001.
- **Backdoor login.** With `strategy: "flow"` and `verifyBackdoor` set, shipgate logs each account in with one request to that route: JSON body `{ "account": "<id>", "email": "<SHIPGATE_ACCT_<ID>_EMAIL>", "role": "…", "tenant": "…" }`, header `X-Shipgate-Verify: 1`. The `Set-Cookie` headers of a 2xx response whose names are in `sessionCookies` form the session; any other response, or a 2xx without such a cookie → `BLOCKED(seed-contract)` (04 § 4.3). `_login.json` is then run only by flows that log in themselves.
- Without `verifyBackdoor`, `_login.json` runs once per account with `{account.*}` bound to that account (§ 10).

`verify.env`: `KEY=value` lines, `#` comments, no interpolation, git-ignored, never production values.

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
gates: []                      # required for rules with a db or contract channel: the gates their detectors run in (04 § 1.1), e.g. [G2, G6]
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
**Required:** `id`, `title`, `pack`, `severity` (`P0|P1|P2|W`), `channels` (04 § 1.1), `failureClasses` (04 § 9.1), `fix`, `since`; `sources` for `search-engines` rules; `gates` (non-empty, values `G0`…`G9`) for rules with a `db` or `contract` channel, rejected on other rules (04 § 1.1). **Defaults:** `parts: []`, `waivable: true`, `lifecycle: experimental`, `sources: []`, `surfaces: [public, app, api, asset]`, `appliesTo: { fileRoles: ["*"], adapters: ["*"], requires: [] }` (`fileRoles` from 04 § 7.1; `requires` = policy key paths that must exist for the rule to apply, else `notApplicable`), `scope: changed`, `remote` per 04 § 15, `profile: default`, `engine: builtin`, `optionalInputs: []` (entries are policy key paths such as `security.realtime.channels`, or `business.json:<key>`), `owns: []`, `groupKey` per 04 § 9.2 for the rule's first channel (entries are the § 9.2 component names: `routePattern`, `routeGroup`, `file`, `patternId`, `failureClass`, `family`, `field`, `package`, `advisory`, `endpoint`, `diffPath`, `path`, `command`, `service`, `checkId`, `metric`, `session`, `tool`, `target`), `tags: []`, `corpus: ["<pack>/<id lower-case>-*"]`. Parts inherit `waivable` from the rule unless they set it (W parts are always waivable, 04 § 1.8). Unknown keys are rejected.

**Detectors** are separate: ast-grep YAML files in `rules/<pack>/<ID>/detect/*.yml` (and adapter traps in `adapters/<id>/rules/*.yml`) carry `ruleId: <ID>`; builtin detectors are Rust modules registered under the rule id. Adapter trap ids `<ADAPTER>-NNN` declare `guards: [<ID>]`; their findings group under the guarded rule. Metadata validation rejects an `owns` relation where the owner is waivable and an owned rule is not.

---

## 6. Adapter manifest — `adapters/<id>/adapter.json`

**Common types.** `ApiRef` = `{ module?: string, call: string /* dotted callee path, e.g. "child_process.exec" */, args?: { <role>: <0-based index> } }`; a bare string is `{ call: <string> }`. `Marker` = a literal substring (a string containing `*` is a file glob instead). `Pointer` = `<config-file-id>:<JSON pointer>` (`tsconfig:/compilerOptions/strict`), where the config-file id is a key of `config` or one of `tsconfig`, `package`. Regexes are Rust `regex` syntax.

| Field | Type | Required | Default |
|---|---|---|---|
| `id` | `^[a-z][a-z0-9-]{0,31}$` | yes | — |
| `claimedTier` | `1\|2\|3` (02 § 2) | yes | — |
| `detect` | `{ files?: glob[], dependency?: string, dirs?: string[] }`; all given members must match | yes | — |
| `language` | string[]: `oxc:<lang>` and/or tree-sitter grammar ids | yes | — |
| `templateLanguages` | string[] from `vue`, `svelte`, `astro`, `embedded-template` (ERB/EJS), `twig`, `blade`, `jinja2` | | `[]` |
| `regexSinks` | `[{ templateLanguage, pattern: regex, precision: number 0–1 }]` for template languages with no maintained grammar; a service whose files include such a language has coverage level at most `structural`, and template rules on those files report the declared `precision` in the finding (02 § 4) | | `[]` |
| `defaults.commands` | the § 3.2 `commands` object | yes | — |
| `windows` | partial manifest whose keys override the others on Windows | | `{}` |
| `portBinding` | `env:<VAR>` \| `flag:<flag template with {port}>` \| `config` | yes | — |
| `envInlinedAtBuild` | bool | | `false` |
| `routes` | `{ discover: <built-in discoverer id>, fileMap?: <built-in file-map id> }` (ids of Rust modules shipped with shipgate, e.g. `fs-app-router`, `app-router`) | yes | — |
| `fileRoles` | `{ <glob>: <role, 04 § 7.1> }` | yes | — |
| `entryPoints` | glob[] (framework-required exports/files) | | `[]` |
| `config` | `{ <setting>: "<file-id>:<path>" }` readers | | `{}` |
| `suppressions`, `testMarkers` | string[] (literal substrings) | | `[]` |
| `testShuffle` | string (flag appended to `test` that randomises order) \| `null` | | `null` |
| `serverOnlyMarkers` | Marker[] | | `[]` |
| `publicEnvPrefixes` | string[] | | `[]` |
| `rawHtmlSinks`, `envReadApis`, `queryApis`, `loggerApis`, `clockApis`, `hashApis`, `sleepApis` (TST-004), `execApis`, `fsApis`, `pathGuardApis`, `evalApis`, `deserializeApis`, `validatorApis` (ARC-004, SEC-030, SEC-045), `passwordHashApis` (SEC-027: approved password hashers — bcrypt, scrypt, argon2, PBKDF2 and the framework's default password hasher), `redirectApis`, `modelToolApis` (SEC-062), `authGuardApis` (ARC-006, SEC-057, SEC-062), `searchHandlers` (IDX-012), `writeOperations` (which `queryApis`/`httpClientApis` calls are writes) | ApiRef[] | | `[]` |
| `httpClientApis` | `[ApiRef & { timeoutArg?: string, clientFactory?: bool }]`: `timeoutArg` = the argument role or option key that sets the request timeout (e.g. `fetch` `signal`, axios `timeout`, `requests` `timeout`); `clientFactory: true` = the call creates a client whose calls inherit `timeoutArg` when it is passed to the factory (RES-006; ARC-006, SEC-030 and `writeOperations` use only `call`) | | `[]` |
| `formatterApis`, `urlBuilderApis` | ApiRef[] (ARC-006 `formatting` / `url`; e.g. `Intl.NumberFormat`, `Intl.DateTimeFormat`, `toLocaleString`, date-fns `format`; `new URL`, `URLSearchParams`) | | `[]` |
| `destructiveMigrationApis` | ApiRef[] (DB-006, for migration formats whose `applyCommand` can't apply one file; e.g. Django `RemoveField`, `DeleteModel`; Rails `drop_table`, `remove_column`; knex `dropTable`, `dropColumn`) | | `[]` |
| `jobRetryArgs` | `[ApiRef & { arg: string, unboundedDefault: bool }]`: `arg` = the option key of a `jobDiscovery` registration that sets the retry count; `unboundedDefault: true` = omitting it retries without bound (JOB-003; e.g. BullMQ `attempts`, Celery `max_retries`, Sidekiq `retry`) | | `[]` |
| `testReport` | path, relative to the service, of the JUnit XML the `test` command writes \| `null` (TST-004 `order`) | | `null` |
| `modelApis` | `[ApiRef & { maxTokensArg: string }]` | | `[]` |
| `clientEntries` | glob[] (files that start client bundles) | | `[]` |
| `bundleManifest` | glob[] of build-output manifests mapping routes to chunks (e.g. `.next/app-build-manifest.json`) | | `[]` |
| `notFoundPatterns` | ast-grep pattern strings | | `[]` |
| `jobDiscovery` | ast-grep pattern strings for cron/queue registrations | | `[]` |
| `strictness` | Pointer[] that must be on for ARC-010 | | `[]` |
| `lintGates` | `[{ config: glob, pointer: JSON pointer }]` lint-rule severities that are quality gates (e.g. `{ "config": "eslint.config.*", "pointer": "/rules/no-explicit-any" }`); protected keys (05 § 3.1) | | `[]` |
| `diagnosticPatterns` | regex[] counting diagnostics in command output (debt occurrences) | | `[]` |
| `i18nCatalogs` | glob[] of message catalogues (MET-008, I18-009). Each glob contains exactly one `{locale}` placeholder matching one path segment or one file-name stem (`messages/{locale}.json`, `locales/{locale}/*.json`); the matched text is the catalogue's BCP 47 locale. A glob without exactly one `{locale}` → CFG-002 | | `[]` |
| `renderModes` | `[{ pattern?: ast-grep pattern over route files, mode: "ssr"\|"ssg"\|"isr"\|"csr" }]`, tried in order, the first match decides; the list ends with exactly one catch-all entry (no `pattern`; matches every route file) for the framework default (RTE-002; e.g. Next app router: first statement `'use client'` → `csr`, `export const dynamic = 'force-static'` → `ssg`, `export const revalidate = $N` → `isr`, catch-all `ssr`). A non-empty list whose last entry has a `pattern`, or with a catch-all before the last position → CFG-002 | | `[]` |
| `hydrationErrorPatterns` | regex[] over browser console messages (RTE-013 `hydration`; e.g. React `Hydration failed`, `Text content does not match`, `There was an error while hydrating`; Vue `Hydration .* mismatch`; Svelte `hydration_mismatch`) | | `[]` |
| `slugApis` | ApiRef[]: calls that generate slugs from text (URL-007 `recompute`; e.g. `slugify`, `@sindresorhus/slugify`, Django `slugify`, Rails `parameterize`) | | `[]` |
| `serverFunctions` | `[{ kind: "next-action"\|"sveltekit-action"\|"remix-action"\|"trpc"\|"orpc", discover: <built-in discoverer id>, invoke: { method, headers: { <name>: <template> }, body: "json-args"\|"form"\|"json" } }]` (SEC-057; e.g. Next: POST with a `Next-Action` header and a JSON argument array) | | `[]` |
| `sessionCookies` | `[{ name, decode: "plain"\|"base64-chunked"\|"jwt" }]` (SEC-037) | | `[]` |
| `defaultAliasHosts` | host patterns (§ 3.3) added to `aliasHosts`, e.g. `*.vercel.app` (URL-011) | | `[]` |
| `errorPageFingerprints` | Marker[] of framework default error pages (UX-005) | | `[]` |
| `redirectSources` | `[{ file: glob, reader: <built-in reader id> }]` (REF-011) | | `[]` |
| `priority` | integer; when several adapters detect, the highest wins; ties fail CFG-002 | yes | — |
| `role` | `"primary"` \| `"addon"`; `auto` selects the highest-`priority` matching primary plus every matching addon (02 § 3) | yes | — |
| `migrations` | `{ format: "sql-dir"\|"prisma"\|"drizzle"\|"knex"\|"rails"\|"django"\|"laravel"\|"other", dir: path, applyCommand?: string }`. `applyCommand` applies one migration file: a § 3.2 command string in which `{file}` is replaced by the file's path relative to the service (04 § 4.2 step 4, DB-003, DB-006); without `{file}` → CFG-002 | | `null` |
| `schemaDriftCommand` | string \| `null` | | `null` |
| `codegen` | ids from 05 § 1 `codegen` | | `[]` |
| `rules` | directory of adapter trap rules | | `adapters/<id>/rules/` |

Addons declare only what they add: for an addon, only `id`, `role`, `detect` and `priority` are required. Unknown keys are rejected.

Project-local adapters (`quality/adapters/`) earn a tier through `shipgate conformance --adapter <id>` against Operator-supplied fixtures; the result is signed with the lock.

---

## 7. Keys and trust

### 7.1 Key storage
- **Operator key:** Ed25519 private key encrypted with a key derived from the Operator's passphrase (Argon2id, m=64 MiB, t=3, p=1), stored as an OS keychain item (Windows Credential Manager, macOS Keychain, Linux Secret Service; on Linux without a secret service, an encrypted file in the user config dir). The passphrase is never stored or cached; every Operator command asks for it on an interactive terminal.
- **Install secret:** random 32 bytes in the keychain (no passphrase), used only for HMAC of sealed verdict records (04 § 8.1); same-user processes can read it, so CI is authoritative (04 § 8.1 honest limit).
- **CI key:** Ed25519 key in a CI secret (`SHIPGATE_CI_SIGNING_KEY`, base64 of the 32-byte seed), role `ci`.
- **Fingerprints:** `ed25519:` + lowercase hex SHA-256 of the 32-byte public key.
- **Encodings.** Private key at rest (keychain item value, or the Linux fallback file) and in `keys export`: JSON `{ formatVersion: 1, kdf: "argon2id", m: 65536, t: 3, p: 1, salt: base64(16 bytes), cipher: "xchacha20poly1305", nonce: base64(24 bytes), ciphertext: base64(32-byte seed ‖ 16-byte tag), fingerprint }`. Public keys (`pubkey`): base64 of the 32-byte key. All signatures in shipgate files: base64 of the 64-byte Ed25519 signature. base64 = RFC 4648 § 4, padded, everywhere in shipgate formats.
- Hardware-backed keys (FIDO2/Windows Hello/Touch ID) are a later option behind the same interface.

### 7.2 Trust store
A keychain item (not a plain file) holding `[{ fingerprint, role: "operator"|"ci", pubkey, addedAt: RFC 3339, label }]` (`pubkey` per § 7.1 encodings). Adding a key (`keys trust`) needs the passphrase of an already trusted Operator key, except for the very first key. `doctor` reports trust-store changes since the last run. In CI the trust store is the `SHIPGATE_TRUSTED_KEYS` setting (JSON of the same shape), never read from the repo.

Role permissions: `operator` signs locks, debt, waivers, overrides, baselines, break-glass; `ci` signs only `quality/baselines/_main/`.

### 7.3 User config — `<config dir>/shipgate/config.toml`
`<config dir>` = Rust `dirs::config_dir()` (`%APPDATA%`, `~/Library/Application Support`, `$XDG_CONFIG_HOME` else `~/.config`). `<state dir>` (§ 15) = `dirs::state_dir()`, else `dirs::data_local_dir()` (`%LOCALAPPDATA%`, `~/Library/Application Support`, `$XDG_STATE_HOME` else `~/.local/state`). Keys: `licence.path` (path), `telemetry.crashReports` (bool, default `false`), `mirror` (URL), `proxy` (URL), `cache.dir` (path), `update.channel` (`"stable"|"beta"`, default `"stable"`), `update.check` (bool, default `false`; no update network call when false). Unknown keys are a warning. No security-relevant trust is stored here; in particular, reduced mode can't be enabled here (only by the signed policy, § 3.4).

### 7.4 Backups
`keys export` writes the passphrase-encrypted private key to a file for a password manager, in the § 7.1 encoding; `keys import` restores it; every release imports every `formatVersion` an earlier release exported.

---

## 8. Lock — `quality/lock.json`

```json
{ "formatVersion": 1, "verifierMajor": 1, "ruleset": "2026.10",
  "inputs": [ { "path": "quality/policy.json", "sha256": "…" } ],
  "appliedMigrations": [ "supabase/migrations/20260101_init.sql" ],
  "digest": "sha256:…", "signedBy": "ed25519:<fp>", "signature": "base64…", "createdAt": "2026-10-21T10:00:00Z" }
```
- **Inputs (sorted):** `quality/policy.json`, `quality/data/**`, `quality/fixtures/**`, `quality/flows/**`, `quality/contracts/**`, `quality/adapters/**`, `quality/host/**`, `quality/rollout/**`, `quality/approvals/**`, `quality/baselines/**` **except `_main/`**, `quality/debt.json`, `quality/refactor.json`, the migration files listed in `appliedMigrations` (the set at lock time), the repo-relative host hook configuration files written by `hooks install` (05 § 3.3 Config column, including git hook files inside the repo; user-level files are checked by `doctor`, not locked), the protected JSON pointers of `protectedKeys` files (entries `{ path, pointer, sha256 }` where the hash is over the JCS of the pointed value), and the content between `<!-- shipgate -->` and `<!-- /shipgate -->` markers in `AGENTS.md`/`CLAUDE.md` (entries `{ path, section: "shipgate", sha256 }`). The lock also stores `verifyEnvSha256` (hash of `quality/verify.env`, not its content).
- **Digest:** SHA-256 over one line per input entry, the lines sorted by their bytes: `path\0<hex>\n` for files, `path#pointer\0<hex>\n` for protected keys, `path#section:shipgate\0<hex>\n` for marker sections, then (last, unsorted) `verify.env\0<verifyEnvSha256 hex>\n`. `<hex>` is the lowercase hex digest without the `sha256:` prefix; `digest` is written `sha256:<hex>`. **Signature:** Ed25519 (role `operator`) over the JCS of the object without `signature`.
- `_main/` is verified by its own `ci`-role signature. `verify.env` is not locked; its hash is tracked as a sensitive path (04 § 5).
- Merges to the base branch that only change `_main/` never invalidate the lock.

---

## 9. Debt — `quality/debt.json` (signed with the lock)

```jsonc
{ "formatVersion": 1, "recordedAt": "2026-10-21T10:00:00Z", "ruleset": "2026.10",
  "packs": ["web-delivery", "security"], "stableRules": ["SEC-001", "A11-005"], "notConfigured": [],   // 01 § 5.5 `debt add` admission
  "items": [
    { "fingerprint": "sha256:…", "rule": "SEC-001", "locationKey": "apps/web/lib/legacy.tsx#LegacyBanner#dangerouslySetInnerHTML#0", "occurrences": 1, "addedAt": "2026-10-21T10:00:00Z", "expires": "2027-01-15" },
    { "fingerprint": "sha256:…", "rule": "A11-005", "locationKey": "web:/blog/{slug}|color-contrast|.post-meta > span", "occurrences": 4, "addedAt": "2026-10-21T10:00:00Z", "expires": null },
    { "fingerprint": "sha256:…", "rule": "SEC-050", "part": "history", "locationKey": "config/old.env@3f2a1c9#aws-key#9b1e…", "occurrences": 1, "addedAt": "2026-10-21T10:00:00Z", "expires": null, "rotatedOn": null }
  ] }
```
Item shape: `{ fingerprint, rule, part (default "main"), locationKey, occurrences: int, addedAt: RFC 3339, reason?: string (required for items added by `debt add`), expires: YYYY-MM-DD | null, rotatedOn?: YYYY-MM-DD | null }`. Fingerprint = SHA-256 of JCS `{ rule, part, locationKey }`; `locationKey` is the 04 § 9.3 key, and the part (04 § 9.4) enters the fingerprint through `part`, so W debt and a P0 part never share a fingerprint. Items of `†` rules or `†` parts require `expires` ≤ `addedAt` + 90 days; `debt record` keeps `addedAt` and `expires` of items whose fingerprint already exists (re-recording never extends an expiry). Non-† parts of † rules (e.g. SEC-050 `history`, 04 § 1.8) follow their own metadata. `rotatedOn` (Operator-signed via `debt rotate`) clears a SEC-050 `history` item. Commands: `debt record` (initial/full), `debt add --reason` (only for rules that became stable, packs newly enabled, or inputs newly configured since the last record), `debt rotate`, `debt show`.

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
- `viewport`: `mobile` (390×844, DPR 3, touch, mobile UA) | `tablet` (820×1180, DPR 2, touch) | `desktop` (1366×768, DPR 1); default `desktop`. `orientation` (default `portrait`): `landscape` swaps width and height; `both` runs the flow once per orientation. The same names and sizes apply to refactor `visual.viewports`.
- `browsers`: subset of `chromium|firefox|webkit`, default `["chromium"]`. `mutates` default `true`; `account` default `null` (anonymous); `account` names an `auth.accounts` id.
- `persist` (default `false`): when `true`, the browser context's storage state at the end of the flow is reused by the next flow of the same `account` in file-name byte order; otherwise every flow starts with a fresh context holding only the account's session.

**Step encoding.** Each step is an object with exactly one action key (the Step column). Locator-only steps take the Locator (`{ "click": { "role": "button", "name": "Save" } }`); steps with extra fields nest the Locator under `target` (`{ "fill": { "target": { "label": "Email" }, "value": "{uniqueEmail}" } }`, `{ "press": { "key": "Enter", "target": … } }`); scalar steps take the scalar (`{ "goto": "/pricing" }`, `{ "measure": "inp" }`, `{ "openEmailLink": true }`). Optional on every step, next to the action key: `timeoutMs` (default 10000), `optional: false` (`true`: a failure is recorded as W evidence and the flow continues). `expectText.in` is a Locator (default: the page). `frame` is `{ target: Locator, steps }`; `popup` is `{ trigger: Locator, steps }`.

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
| `expectEmail` | `{ to, subjectContains, linkMatches?, attachment?: bool }` → `{email.link}`; with `attachment: true` the email must have ≥ 1 attachment (else the step fails), and the first attachment (MIME order) is captured to the run dir like an `expectDownload` file (PRV-016 `export`) |
| `openEmailLink` | uses `{email.link}` |
| `expectDownload` | `{ trigger: Locator, nameMatches?, contains?: [text] }`: the click produces a download, captured to the run dir (PRV-016 export) |
| `totp` | Locator |
| `stubNetwork` | `{ urlMatches, status, body }` (third-party hosts only) |
| `expectEgress` | `{ host, method?, pathMatches?, bodyContains? }`: since the previous step, a matching request was made either server-side (seen by the egress proxy) or from the browser (seen by browser interception), for example a form posting to a CRM, Formspree or HubSpot. Both paths answer with the stub declared for that host in `ux.egressStubs` (default `200 {}`), so nothing real is sent |
| `measure` | `"inp"`: records the flow's INP so far in the report; PRF-002 judges the final value at flow end |

Locator: `{ role, name }` | `{ label }` | `{ placeholder }` | `{ text }` | `{ testId }`. `_login.json` is the login flow.
- **Generators** (seeded by flow id + run id + occurrence index `n` within the flow): `{uniqueEmail}` = `sg-<first 12 hex of SHA-256(flowId, runId, n)>@verify.shipgate.test`, delivered to the SMTP sink; `{strongPassword}` = 20 characters with upper, lower, digit and symbol; `{uuid}` = v4.
- **Account tokens** read `verify.env` (§ 4): `{account.email}`, `{account.password}`, `{account.token}` refer to the flow's current account (its `account` field; in `_login.json`, the account being logged in); `{account.<id>.email|password|token}` refer to a named account. A token whose variable is unset → `notConfigured(verify.env:SHIPGATE_ACCT_<ID>_…)` for the flow. The `totp` step fills the current RFC 6238 code (SHA-1, 6 digits, 30 s) of the current account's `SHIPGATE_ACCT_<ID>_TOTP_SECRET` (base32).
- **Outcomes.** A step fails when its action throws, or its expectation is still false after `timeoutMs` of retrying (expect steps poll every 100 ms; `expectEmail` waits up to 30,000 ms). The first failing non-optional step ends the flow with one finding of the rule running the flow, class `flow-step-failed` (groupKey: flow id + step index), showing step, URL, expected and actual, plus a screenshot.
- **Locators** follow Playwright `getByRole`/`getByLabel`/`getByPlaceholder`/`getByText`/`getByTestId` with `exact: false` (case-insensitive substring, whitespace collapsed); more than one matching element is a step failure (strict mode). `testId` matches `data-testid`.
- All `*Matches`/`matches` values are Rust `regex`, unanchored. `expectUrl.equals` compares path + query with the service origin stripped. `expectApi`: `jsonPath` is RFC 9535; `equals` is JSON deep-equality with the first selected node (with no `jsonPath`, with the whole body); `status` an integer. `expectDb.equals` is an array of row arrays, compared in order, values as JSON scalars (numerics compared as numbers, timestamps as RFC 3339 strings). `{email.link}` = the first link in the matching email (HTML part, else text part) that matches `linkMatches` (default: the first link to a service origin); `to` accepts a literal address or an account token.

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
`kind`: `url-move`, `url-remove`, `markup`, `visual`, `text`, `metadata`, `api-field-added`, `api-field-removed` (+ `contractVersion`), `api-status`, `header`, `budget`, `schema`, `flow`. Fields per kind (`routes` = URL pattern, § 2.1; `endpoint` = `METHOD service:path` pattern; `selector` = CSS selector):

| `kind` | Fields | Covers (what the entry allows; everything else is still compared) |
|---|---|---|
| `url-move` | `{ from: pattern, to: pattern }` (same `{name}` params on both sides) | a route matching `from` is compared with the `to` URL bound to the same `{name}` values (REF-003, REF-010 (b), REF-011), not with itself under REF-002 |
| `url-remove` | `{ from: pattern }` | routes, redirect sources and same-origin image URLs matching `from` may answer 410 (REF-010 (c), REF-011, REF-014); REF-002 skips those routes |
| `markup` | `{ routes, selector }` | on matching routes, REF-002 also computes `mainText`, `mainTextHash` and `links[]` of the current page with the elements matching `selector` removed; each of these fields passes when the full or the reduced current value equals the baseline value. This covers content added inside `selector`; the baseline keeps no DOM, so content removed from such elements is not covered (declare it with `text`/`metadata`, or re-capture the baseline) |
| `visual` | `{ routes, maxDiffRatio: number 0–1, viewports?: [viewport] }` | REF-009 uses `maxDiffRatio` instead of refactor `visual.maxDiffRatio` for route groups whose pattern matches `routes` (only at `viewports` when given) |
| `text` | `{ routes, selector? }` (default: `<main>`) | on matching routes: without `selector`, `mainTextHash`/`mainText` differences are accepted (REF-002, REF-010 (a)); with `selector`, only when the `mainTextHash` of the current `<main>` with the `selector` matches removed (computed as in § 12) equals the baseline's (covers text added inside `selector`). REF-010 `depth` becomes W on covered URLs |
| `metadata` | `{ routes, fields: ("title"\|"description"\|"h1"\|"canonical"\|"robots"\|"jsonld")[] }` | the listed `routes.jsonl` fields may differ on matching routes (REF-002, REF-010 (a)) |
| `api-field-added` | `{ endpoint, jsonPath }` | REF-004 and API-004 accept that field being present in responses of `endpoint` |
| `api-field-removed` | `{ endpoint, jsonPath, contractVersion: semver }` | REF-004 and API-004 accept that field's removal only when the service's current contract has major version ≥ the major of `contractVersion` |
| `api-status` | `{ endpoint, from: int, to: int }` | REF-004 and API-004 accept status `to` where the baseline recorded `from` for `endpoint` |
| `header` | `{ routes, name, value?: regex }` (no `value` = any value, incl. removal) | on matching routes, response header `name` may differ or (without `value`) disappear, for REF-002 and REF-005 `security`; with `value`, the new value must match it |
| `budget` | `{ routeGroup, metric: "lcp"\|"cls"\|"tbt"\|"inp"\|"scriptBytes"\|"cssBytes"\|"p95", maxIncreaseRatio: number }` (for `p95`, `routeGroup` is the `budgets.json` `api` endpoint) | REF-005 `budget` for that route group and metric passes when the value ≤ baseline × (1 + `maxIncreaseRatio`), instead of baseline + `tolerance` |
| `schema` | `{ db, table, change: "column-added"\|"column-removed"\|"index"\|"policy" }` | REF-002 accepts, for that table of that database, differences in `db/schema.sql` of that kind (`column-added`/`column-removed`: column definitions; `index`: index definitions) or, for `policy`, in that table's `db/policies.json` entries |
| `flow` | `{ flow, steps?: int[] }` (default: every step) | REF-006 and REF-012 accept differences in that flow (in the listed steps only, when given) |

Every entry may carry `reason`. Unknown fields fail CFG-001. An entry that matches nothing in the baseline is a W finding (`unused-allowance`).

---

## 12. Baselines — `quality/baselines/<id>/`

```
manifest.json     { formatVersion, id, createdAt, commit, ruleset, verifierVersion, services, counts, masks, files: [{path, sha256}], visual: [{ routeGroup, url }], remote: { origin } | null, signedBy, signature }
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
- **Header subset** (`headersSubset`, `headers`): lower-cased names from the list `content-type`, `cache-control`, `location`, `vary`, `access-control-*`, `x-robots-tag`, `content-security-policy`, `strict-transport-security`, `set-cookie` (cookie values replaced by `⟦v⟧`, attributes kept), in that order; other headers dropped.
- **Body normalisation:** JSON bodies are parsed and re-serialised as JCS, with values at keys matching `(^id$|_id$|Id$|At$|_at$|token|nonce)` and strings shaped as RFC 3339 timestamps or UUIDs replaced by `⟦v⟧`; non-JSON bodies are stored as `sha256:<hex>` after the 04 § 15 fallback-body masking.
- **Units and shapes:** `budgets.json` lcp/tbt/inp/p95 in ms, cls unitless, `*Bytes` in bytes. `manifest.counts` and `_main/counts.json`: `{ routes: int, endpoints: int, flows: int, indexablePages: int }`. `cycles.json`: `[{ service, members: [file] (sorted) }]`, the import cycles at the base commit (ARC rules). Manifest `masks`: `{ "<route-group>": [CSS selector] }`, applied as the union with refactor `visual.masks`; viewport names per § 10. Manifest `visual`: one entry per route group with a screenshot, `url` = the URL captured for it (REF-009 re-captures that URL); `[]` for remote baselines.

A remote baseline (`baseline --from-remote <origin>`, REF-010) has the same layout. Its `routes.jsonl` is built from the union of the site's sitemaps, a capped read-only crawl (`crawl.remoteMaxUrls`), `quality/data/legacy-urls.txt` and declared redirect sources, and adds the fields `source: sitemap|crawl|legacy|redirect`, `mainWords` (word count of `<main>`, REF-010 `depth`) and `images[]` (absolute image URLs of the page, collected as refactor § 2 states; REF-014). It also has `serviceworkers.jsonl` `{ scriptURL, scope }`, recorded by loading `/` and the browser sample read-only in Chromium (REF-013). It has no `api`, `db` or `flows` files.
Signature over the manifest (which lists file hashes). `_main/` additionally holds `contracts/`, `counts.json` (routes, endpoints, flows, indexable pages), `cycles.json`; signed by a `ci` key. Absent `_main/` → rules needing it are `skipped(no-main)` with a warning; the Operator may create it locally with `baseline --id _main`.

---

## 13. Programmatic inventory and quarantine

`quality/generated/inventory/<family>.jsonl`, one JSON object per line with a `type` field:
- `page`: `{ type, family, rowId, locale, pathname, canonical, robots, title, description, h1, facts{field:{value,text,attr}}, tokens{name:text}, breadcrumbs[{name,url}], hub, related[paths], alternates{locale:url}, schema{types[], values{}}, lastmod (from the family's lastmodField), previousSlugs[], wave }`
  `attr` is the field's canonical machine value (programmatic TPL-003), which the app renders verbatim as `data-value`.
- `hub`: `{ type, hub, group, page, pages, pathname, canonical, robots, title, description, h1, items[paths], parent, lastmod }`
- `static`: `{ type, pathname, canonical, robots, lastmod? }` for declared static paths included in sitemaps.
- **Serialisation:** each line is the JCS serialisation of its object; lines are sorted by (`type`, `locale` (absent = empty string), `pathname`) in byte order; the file ends with `\n`. G2 compares files byte for byte; any difference is `stale`, with the first 20 differing `pathname`s as evidence.

G2 regenerates the inventory into `quality/out/inventory/` and compares: a committed inventory that differs from the data is an Operator-owned finding (`stale`). Agents may run `inventory` (licence-free); byte-identical output is not a violation. Quarantine: `quality/out/quarantine.jsonl`.

---

## 14. API examples, released contracts, ownership fixtures, jobs

- **Examples** — `quality/contracts/examples/<service>/*.json`: `{ id, request: { method, path, headers?, query?, body?, account? }, expect: { status, jsonPath?: { "$.x": value }, schemaRef? } }`.
- **Released contracts** — `quality/contracts/released/<service>/<semver>/openapi.json` or `openapi.yaml` (OpenAPI 3.0 or 3.1; exactly one per version, else CFG-006); "latest" = highest semver. Breaking-change declarations: `quality/contracts/released/<service>/CHANGES.md`, sections `## <semver>`, each with lines `- removed: <METHOD> <path>[ <jsonPath>]` or `- changed: <METHOD> <path>[ <jsonPath>]` (`path` as written in the OpenAPI `paths` key); other lines are ignored.
- **Ownership fixtures** — `quality/fixtures/ownership.json`: `{ "resources": [ { "pattern": "web:/api/invoices/{id}", "param": "id", "owners": { "userA": ["inv_1","inv_2"], "userB": ["inv_9"] }, "writeBody": { "amount": 1 } } ] }`. Without it, ids are harvested: for each `owner`-scoped pattern, the matching list endpoint (same path minus the last `{param}` segment, `GET`) is called as each account; ids are read from `$..id` (or the contract's id field) of the response. Write probes use `writeBody`, or a contract example body, else the write part is `notConfigured`.
- **Business facts** — `quality/data/business.json` (Operator-owned, signed with the lock): `{ name, legalName?, phones: [{ e164, label }], emails: [], locations: [{ id, name, address: { street, locality, region, postalCode, country }, geo?, phone, hours: [{ days: ["Mo"…], opens, closes }], pagePath, gbpUrl? }], prices: [{ id, label, amount, currency, kind?: "item"|"fee" (default item), feeType?: "mandatory"|"delivery"|"optional" (fees only; default mandatory; PRV-026 `drip`), recurring?: "month"|"year", providerId? }], ratings: [{ source, value, best?, count, asOf }], claims: [{ id, text, value?, source, evidence? }], testimonials: [{ text, author, source, consentedOn }], people: [{ name, role, pagePath? }], certifications: [{ name, issuer, evidence, validUntil? }], clients: [{ name, url? }], press: [{ name, url? }], manufacturers: [{ id, name, address, contact, country, euResponsible?: { name, address, contact } }], legal: { registerNumber?, vatId?, representative?, mailOrderNumber?, icpNumber?, psbNumber? }, offers: [{ id, label, endsAt }], postalAddress?, founded?, socialProfiles: [] }`. Value formats: `opens`/`closes` `HH:MM` 24 h in the location's local time; `days` from `Mo Tu We Th Fr Sa Su`; `amount` a decimal string in major units (`"19.90"`); `currency` ISO 4217; every `address` (incl. `manufacturers[].address` and `euResponsible.address`) has the `locations[].address` shape, `country` ISO 3166-1 alpha-2; `manufacturers[].contact` and `euResponsible.contact` an email address or absolute URL (PRV-025); `feeType` only on `kind: "fee"` entries (else CFG-001); `e164` E.164; `founded` `YYYY`; `socialProfiles` absolute URLs; `ratings.value` on the scale given by `best` (default 5); `asOf`, `consentedOn`, `validUntil` `YYYY-MM-DD`; `endsAt` RFC 3339. A missing key means "none of these exist", so UX-013/014/019 report any such content on the site as a blocking finding (04 § 1.2 facts-oracle rules).
`postalAddress` has the same shape as `locations[].address` and is compared with LOC-001's normalised containment (PRV-022 `imprint`, OPS-005 `postal`); `manufacturers[].address` and `euResponsible.address` are compared the same way (PRV-025). LOC-001/003, SCH-007 (matched by `pagePath`) and UX-003/004 compare rendered pages against this file.
- **Webhook fixtures** — the JSON file, or every `*.json` file of the directory (path byte order), at the route's `fixture` path (`security.routes`), which must lie under `quality/fixtures/webhooks/` (else CFG-001): raw provider event bodies (as the provider sends them). shipgate signs them with `secretVar` per the route's `scheme` for SEC-026/049 probes.
- **Merchant feed** — the file at search-engines `merchantFeed`: RSS 2.0/Atom with the `g:` namespace, or TSV with a header row. Fields read: `id`, `link`, `price`, `sale_price`, `sale_price_effective_date` (ISO 8601 interval `start/end`), `availability`, `gtin`, `item_group_id` (SE-113). A missing or unparsable file is a blocking `parse-error` finding owned by `operator`.
- **Payment-page scripts** — `quality/data/payment-scripts.json` (Operator-owned, locked): `{ formatVersion, scripts: [{ url, purpose, justification, approvedBy, integrity? }] }`. `url`: an absolute URL; `*` matches any characters except `/` and `.` within one host label or path segment, `**` matches the rest of the path; query and fragment are ignored; no wildcard → exact match. This is the PCI DSS 4.0.1 6.4.3 script inventory that SEC-063 reads.
- **Agentic feeds** — files at search-engines `agenticFeeds[].path`. The type is taken from the extension: `.json`/`.jsonl` (JSON), `.csv`/`.tsv` (delimited) or `.xml` (XML; items located by the XPath 1.0 `items` value of the kind's `agentic-feeds.json` mapping). A missing or unparsable file is a blocking `parse-error` finding owned by `operator`. Fields are read through the ruleset `agentic-feeds.json` mapping for the `kind`, or `fields` for `kind: "other"` (SE-114).
- **Field data** — `quality/data/crux/<host>.json` (Operator export, one per production host): a CrUX API `queryRecord` response or an array of them (PRF-020).
- **Dictionary** — `quality/data/dictionary.txt`: one word per line, UTF-8 (CQ-007).
- **Legacy URLs** — `quality/data/legacy-urls.txt` (Operator-owned): one absolute URL or path per line, `#` for comments. Typical sources are the old sitemap, a Search Console pages export or a backlink export. REF-010 reads it.
- **Page approvals** — `quality/approvals/pages-<n>.json` (written by `approve pages`): `{ formatVersion, paths: [], aiProvenance: { model?, promptVersion?, reviewedBy, reviewedAt }, disclosure: bool, expires, signedBy, signature }`. `<n>` = 1 + the highest existing number (1 when none). `paths`: URL patterns (§ 2.1). `disclosure`: `true` when the approved pages carry the AI-content disclosure (default `false`). `expires`: `YYYY-MM-DD`, required; an expired approval is ignored. `reviewedAt`: RFC 3339. The signature covers the JCS of all other fields, and `approve pages` re-locks, so approvals are also lock inputs (§ 8). CQ-006 accepts only approvals with a valid Operator signature.
- **Launch-form confirmations** — `quality/approvals/launch-forms.json` (Operator-written, a lock input through `quality/approvals/**`, § 8): `{ formatVersion, forms: [{ key, result: "arrived"|"failed", confirmedOn: YYYY-MM-DD, note?: string }] }`. `key` is the UX-022 form key `<flow id>#<index of the submitting step>→email:<to>|egress:<host>|db:<db>`; keys are unique (duplicates → CFG-001). The report lists every current form key without an entry (UX-022). `quality/audit/review.json` never substitutes for it (Auditor-written).
- **Jobs** — `data-api.jobs[]`: `{ service, name, schedule?, run: "<command>", idempotencyKey, writes: ["table", …] }`; JOB-002 runs `run` twice on one instance and compares `writes` tables.

---

## 15. Agent-side and state files

- **`quality/out/handoff.json`** (Verifier): `{ formatVersion, treeHash, verdict: "PASS"|"PARTIAL"|"FAIL"|"BLOCKED", reason: <04 § 1.9 reason: exhausted|operator-owned|budget|tool-error|reduced-environment|planned|break-glass|unverified-stop>, findings: [report finding objects (§ 17)], attempts: [{ evidenceHash, groupKey, attempts: int }], decisionsNeeded: [{ owner: "operator", kind: "missing-input"|"baseline"|"licence"|"budget"|"coverage"|"finding", input?, rule?, message }] }`. `kind: "budget"` appears only for `BLOCKED(budget)` gates owned by `operator` (04 § 8, DECISIONS D-001). Authoritative copy inside the sealed record.
- **`quality/out/break-glass.sig`** (Operator): `{ formatVersion, treeHash, expiresAt: RFC 3339, nonce: base64(16 bytes), reason, signedBy, signature }`; signature over the JCS of the object without `signature`.
- **`quality/proposals/dependencies.json`** (Builder): `{ formatVersion, items: [{ ecosystem: "npm"|"pypi"|"cargo"|"go"|"composer"|"rubygems"|"maven"|"nuget", name, version (exact, as resolved in the lockfile), reason, licence (SPDX expression), installScripts: bool }] }` (SEC-053 requires `installScripts: true` for every new package with install scripts); copied into the report; manifest/lockfile changes must match it on (`ecosystem`, `name`, `version`) (AGT-009).
- **`quality/proposals/waiver-requests.json`** (Builder/Auditor): `{ formatVersion, items: [{ rule, part?, scope (Waiver `scope`, § 3.4), reason, requestedBy, evidenceHash }] }`.
- **`quality/proposals/**`** (Planner): policy fragments, flows, contracts for Operator review.
- **`quality/audit/review.json`** (Auditor): `{ formatVersion, items: [{ rule, target, result: "pass"|"fail", note }] }`.
- **State dir** (`<state dir>/shipgate/<repo-id>/`, outside the repo; `<state dir>` per § 7.3): `attempts.json`, session snapshots, `verdicts/` (sealed records), `fetches/` (session fetch store, below).
- **Session fetch store** (Verifier; CQ-010): `<state dir>/shipgate/<repo-id>/fetches/<sessionId>.jsonl`, one line per document the agent fetched, written by the post-hook from `post-tool` events with `tool: "fetch"` (§ 16, 05 § 3.3): `{ url, host, kind: "web-fetch"|"web-search"|"browser", fetchedAt: RFC 3339, textHash: sha256:<hex of the stored text>, text }` (`kind` from the § 16 mapping). `host` = the URL's host lower-cased (`""` for search results without a URL). `text` = the text the host reported to the agent, NFC, capped at 200,000 characters per document (longer text truncated; `textHash` over the stored text). A document whose `textHash` already occurs in the session file is not written again. The store is capped at 50 MB per repo-id; when a write would exceed it, whole session files are deleted oldest `fetchedAt` first (never the current session's); each deletion appends `{ sessionId, evictedAt: RFC 3339, bytes }` to `fetches/evictions.jsonl`, and the next report lists it under `warnings` (`fetch-store-evicted`). The store never leaves the device (05 § 9). A session whose host reports no fetches (03 § 16 table) has no file.

---

## 16. Normalised hook events

Every host adapter maps its payload to: `{ host, event: "session-start"|"prompt"|"pre-tool"|"post-tool"|"stop", tool: "edit"|"write"|"shell"|"read"|"fetch"|"mcp"|"other", paths[], command?, prompt?, fetched?: [{ url, kind: "web-fetch"|"web-search"|"browser", text }], sessionId, stopRepeated: bool, role }`. `host` is a host id (05 § 3.3). `role` comes from the installed hook config (`hooks install --role builder|planner|auditor`). `paths` are made repo-relative (§ 1) and resolved per § 2.2; paths outside the repo are kept absolute. `fetched` is set only on `post-tool` events with `tool: "fetch"`; the post-hook appends each entry to the session fetch store (§ 15). `stopRepeated` is `false` where the table gives no source. The payload is read as JSON from stdin; git hooks have no payload. An unparseable payload, or a field the table names that is missing, makes the hook answer with the host's deny/block signal (pre-tool, stop) or a warning (other events), never a silent allow.

**Host mappings** (to be confirmed by WP-101, which updates this table and 05 § 3.3 statuses):

| Host | Events → `event` | Tool name → `tool` | `paths`, `command`, `prompt`, `fetched` | `sessionId`, `stopRepeated` |
|---|---|---|---|---|
| `claude-code` | `hook_event_name`: SessionStart → session-start; UserPromptSubmit → prompt; PreToolUse → pre-tool; PostToolUse → post-tool; Stop → stop | `tool_name`: `Edit`, `MultiEdit`, `NotebookEdit` → edit; `Write` → write; `Bash` → shell; `Read`, `Grep`, `Glob` → read; `WebFetch`, `WebSearch` → fetch; `mcp__*` → fetch when listed in ruleset `fetch-tools.json`, else mcp; else other | `paths` from `tool_input.file_path`, `tool_input.notebook_path`, `tool_input.edits[].file_path`; `command` = `tool_input.command`; `prompt` = `prompt`; `fetched`: WebFetch `{ url: tool_input.url, kind: "web-fetch", text: tool_response }`, WebSearch `{ url: "search:" + tool_input.query, kind: "web-search", text: tool_response }`, `fetch-tools.json` tools `kind: "browser"` | `session_id`; `stop_hook_active` |
| `codex` | SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop as for claude-code | `Bash` → shell; `apply_patch` → edit; else other | `paths` parsed from the patch headers `*** Add File:`, `*** Update File:`, `*** Delete File:`, `*** Move to:`; `command` = `tool_input.command`; no fetches reported | `session_id`; `stop_hook_active` |
| `cursor` | sessionStart → session-start; beforeSubmitPrompt → prompt; preToolUse, beforeShellExecution → pre-tool; afterFileEdit → post-tool; stop → stop | beforeShellExecution → shell; afterFileEdit → edit; preToolUse by `tool_name` as for claude-code | `paths` = `file_path`; `command` = `command`; `prompt` = `prompt`; no fetches reported | `conversation_id`; `loop_count > 0` |
| `opencode` | `tool.execute.before` → pre-tool; `tool.execute.after` → post-tool; `session.idle` → stop | `tool`: `edit`, `patch` → edit; `write` → write; `bash` → shell; `read`, `grep`, `glob`, `list` → read; `webfetch` → fetch; else other | the generated plugin writes `{ event, tool, args, output, sessionID }` to stdin: `paths` from `args.filePath`; `command` = `args.command`; `fetched`: `{ url: args.url, kind: "web-fetch", text: output }` | `sessionID`; `false` |
| `antigravity` | PreInvocation → prompt; PreToolUse → pre-tool; PostToolUse → post-tool; Stop → stop | `run_command` → shell; `edit_file`, `replace_file_content` → edit; `write_to_file` → write; `view_file` → read; `read_url_content`, `search_web` → fetch; else other | `paths` = `tool_input.TargetFile`; `command` = `tool_input.CommandLine`; `fetched`: `{ url: tool_input.Url, kind: "web-fetch", text: tool_response }` (`search_web`: `{ url: "search:" + tool_input.query, kind: "web-search", … }`) | `session_id`; `false` |
| `git` | `pre-commit` → pre-tool; `pre-push` → stop | pre-commit → write | `paths` = staged files (`git diff --cached --name-only -z`); no fetches | `git-<HEAD commit>`; `false` |

Ruleset `fetch-tools.json`: `[{ host: <host id>, tool: <regex over the tool name>, url: <JSON pointer into the tool input>, text: <JSON pointer into the tool response> }]` for MCP browser/fetch tools (e.g. Playwright or Chrome MCP navigate and page-text tools).

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
  "warnings": [], "waiversApplied": [], "overridesActive": [], "dependenciesAdded": [], "auditTargets": ["web:/blog/{slug}", "apps/web/app/page.tsx"], "handoff": null }
```
- **`auditTargets`:** up to 20 route-group ids and changed-file paths, drawn with the lock-digest PRNG (01 TR-103, label `audit-targets`) from their sorted union (all when fewer); the Auditor writes one `review.json` entry per target with `target` set to that value (01 § 10.2).
- **Vocabularies:** `mode`: `verify|check|adopt`; `owner`: `builder|operator`; finding `status` per 04 § 1.3; `gates[].status` per 04 § 1.4; `gates[].cache`: `hit` (result reused; only for the same environment hash, 04 § 16, DECISIONS D-002), `miss`, `off` (`--no-cache`); `debt.expiringSoon`: debt items and waivers whose `expires` is within 14 days of the run (01 § 5.4).
- **SARIF 2.1.0** (P0/P1 → error, P2 → warning, W → note) contains every finding; `debt`, `waived` and `experimental` findings carry `suppressions: [{ kind: "external", justification }]` (the debt fingerprint, waiver reason or "experimental").
- **JUnit:** one testcase per rule × service (`classname` = pack, `name` = `<rule> <service>`); `failure` when the rule has a `blocking` or `exhausted` finding; `skipped` for `notApplicable`, `noAdapterSupport` and `skipped(*)`; `error` for `notConfigured` and `blocked(*)`; otherwise passed.
- **`summary.md`:** verdict line, gate table, the first 20 findings by 04 § 9.4 ranking, the handoff reason if any.

---

## 18. Rollout state and indexing exports

- **`quality/rollout/<family>.json`** (Operator-signed with the lock): `{ formatVersion, family, waves: [ { index, rowIds[], releasedAt, evidence: { exportFile, exportSha256, indexRate, measuredAt } } ] }`. `rollout release` appends the next wave after checking ROL-003.
- **`quality/data/indexing/<family>.csv`** (Operator-provided Search Console export): columns `url,coverageState,lastCrawled`; a URL counts as indexed when `coverageState`, after trim and case-fold, is listed for the export's locale in ruleset `gsc-indexed-states.json` (`{ <locale>: [label] }`). The export's locale is the first one whose labels match the header row's state values; none matches → `notConfigured(indexing-export-locale)` for ROL-003.

## 19. Toolchain manifest (inside each shipgate release)

`{ formatVersion, items: [{ name, version, platform, url, sha256, size, licence, purpose, refresh?, unpackTo, requires: [] }] }`. `platform`: `windows-x64|windows-arm64|macos-arm64|macos-x64|linux-x64-gnu|linux-arm64-gnu|linux-x64-musl|linux-arm64-musl|any`. `purpose`: `tool|browser|database|grammar|data`. Data snapshots are entries with `purpose: "data"` and `refresh: "fetch"`: `fetch` downloads the current `snapshots.json` of the same release channel (signed with the vendor release key compiled into the binary, signature per § 7.1 encodings) and checks each snapshot's `sha256` against it. With a mirror (`SHIPGATE_MIRROR` or config `mirror`), every download URL becomes `<mirror>/<sha256 hex>/<basename(url)>`; the `sha256` check is unchanged. npm packages are fetched from the npm registry by exact version and integrity hash at `fetch` time, not shipped inside the release (05 § 8). The entries cover the data snapshots refreshed by `fetch` (OSV database; npm `deprecated` metadata for packages in the project's lockfiles only — other ecosystems' deprecation status is reported as unknown/W) for portable Node, Playwright + browsers, Lighthouse, axe-core, web-vitals, OSV-Scanner + database snapshot, PostgreSQL/MySQL (with `extensions[]`), PostgREST, Supabase Auth, Supabase schema DDL, tree-sitter grammars.
