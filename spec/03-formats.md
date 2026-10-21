# shipgate — 03 Formats

> Every file format, grammar and schema shipgate reads or writes. Each gets a published JSON Schema (draft 2020-12) in `schemas/` of the shipgate repo; this file is normative. Load when implementing any reader/writer.

---

## 1. Conventions

UTF-8, `\n`; real files are plain JSON (the `jsonc` blocks here are illustrative). Hashes `sha256:<hex>`; canonical JSON for hashing and signing: RFC 8785 (JCS). Timestamps RFC 3339 UTC; dates `YYYY-MM-DD` = end of day UTC. Paths repo-relative with `/`. Every JSON file whose top level is an object carries `formatVersion` (integer, starting at 1) and may carry `$schema` (readers ignore its value and always validate against shipgate's embedded schema for that file; shipgate writes `$schema` only into `quality/policy.json` and the `business.json` and flow templates it creates (05 § 2, § 2.1), with the value `https://schemas.shipgate.dev/<kind>/<version>.json`, `<kind>` = `policy`, `business` or `flow`, `<version>` = the file's `policyVersion`/`formatVersion`; every other file shipgate writes has no `$schema`), except `quality/policy.json`, which has `$schema` and `policyVersion`, and files whose format a third party defines, read as-is: `quality/data/crux/*.json`, merchant/agentic feeds, webhook fixtures (§ 14), released OpenAPI contracts, `package.json`/`tsconfig*.json`/lint configs. In an Operator-authored input file (§ 10 flows, § 14 files) an absent `formatVersion` means 1; files shipgate writes always carry it. Files whose top level would be an array are objects `{ $schema?, formatVersion, items: [ … ] }` (§ 15 `dependencies.json`, `waiver-requests.json`, `review.json`; § 19 toolchain manifest). JSONL, TXT, CSV/TSV, TOML, YAML, SQL and image files carry no version field; their format version is that of the enclosing directory's manifest or lock (or 1 where there is none). JSON files read for `protectedKeys` may be JSONC; `extends` chains (tsconfig) are resolved before evaluating pointers. Files inside a baseline directory (§ 12) other than `manifest.json` (`budgets.json`, `a11y.json`, `security.json`, `counts.json`, `cycles.json`, `db/policies.json`, `db/schema.sql`, the JSONL files) carry no `formatVersion`; their version is the manifest's `formatVersion`. This exempts `cycles.json` and `db/policies.json` from the array-to-`items` rule.

**File hashes.** Every file hash in this spec (lock inputs and `verifyEnvSha256`, § 8; baseline `files[].sha256`, § 12; `exportSha256`, § 18) is computed over the file bytes after removing a leading UTF-8 BOM and replacing each `\r\n` with `\n` when the file is text, and over the raw bytes otherwise. Text = extension in `.json .jsonc .jsonl .txt .md .mdx .csv .tsv .toml .yaml .yml .sql .js .mjs .cjs .ts .tsx .jsx .py .rb .php .prisma .env .xml .html .css .svg` or a file name with no extension; everything else (`.png`, `.sig`, `.zip`, …) is binary. Download checksums (toolchain manifest and `snapshots.json` `sha256`, § 19) are always over the raw bytes. So a lock signed on Linux stays valid on a Windows checkout with `core.autocrlf=true`.

**`.shipgate-version`** (repo root): the exact SemVer 2.0 version of the binary, e.g. `1.4.2`, followed by one `\n`; shipgate writes exactly these bytes, and readers (shipgate, the npm shim, CI templates) strip all leading and trailing whitespace before use. Content that is not a SemVer version after stripping → CFG-008.

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
- **Specificity** compares two patterns segment by segment from the left. At the first position where they differ: literal > constrained param > param > `*` > `**`. If all compared positions are equal, the longer pattern wins, then the pattern with an explicit method. Two constrained params have equal rank whatever their regexes. Two patterns **tie** when this comparison can't order them **and** they overlap; a tie fails validation (CFG-001/006). **Overlap** is decided structurally, never by regex intersection: the methods overlap (omitted or `*` overlaps every method; `HEAD` overlaps `GET`), the services are the same, and the segments can be aligned (`**` taking zero or more segments) so that every aligned pair overlaps — two literals iff equal after percent-decoding; a literal and a constrained param iff the regex matches the literal; two constrained params always (also with different regexes); a param or `*` with any one segment. Fixtures: `/p/{id:[0-9]+}` vs `/p/{slug:[a-z]+}` → tie (invalid); `/p/{id:[0-9]+}` vs `/p/new` → ordered (literal wins); `/p/{id:[0-9]+}/edit` vs `/p/{slug:[a-z]+}/view` → no overlap, valid. All pattern lists (surfaces, `indexRules`, `security.routes`, waivers) use specificity, never list order.
- Service omitted → the only service. Otherwise, among services whose `mount` is a prefix of the path and one of whose surface patterns matches it, the one with the longest `mount`; if none qualifies, or two remain, the pattern is invalid (CFG-001).

### 2.2 File globs
`globset` semantics, compiled with `literal_separator(true)`: `*` and `?` never match `/`, `**` matches across `/`, `{a,b}` alternation and `[…]` classes are supported, dotfiles match like any other file; `/` separator. A list matches a path when at least one non-`!` entry matches and no `!` entry matches (set semantics, never order). Matching is case-sensitive on every OS. On case-insensitive file systems, a path is first resolved to its on-disk casing (the casing `git ls-files` records for tracked files; otherwise the file system's canonical casing, and for a not-yet-existing file the canonical casing of its existing parent directories plus the name as given) and then matched.

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
| `$schema` | string URI, any value (shipgate validates against its embedded schema regardless; editors use it) | required |
| `policyVersion` | integer, currently `1`, with the semantics of `formatVersion` (`migrate` upgrades it) | required |
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
| `path` or `url` | repo path / remote URL | exactly one required; both set → CFG-001 |
| `adapters` | string[] (primary, then addons) | `["auto"]` |
| `origin` | https origin | required for `public` surfaces |
| `mount` | path prefix on the origin host | `"/"` |
| `previewUrl` | non-production deployed URL | `null` |
| `nonProduction` / `readOnlyProduction` | bool (remote) | `false` |
| `host` | `vercel\|netlify\|cloudflare-pages\|nginx\|apache\|none` | `none` |
| `commands` | `{ install, build, start, typecheck, lint, test, coverage, migrate, snapshot }` (`coverage` writes an lcov/cobertura report, TST-011) each string or `{ run, shell, cwd, timeoutSec }`. `timeoutSec` (integer, default 900): when a command runs longer, shipgate kills its process tree and records a builder-owned `command-failed` finding of the rule that runs the command (`typecheck` BLD-001, `lint` BLD-002, `test` BLD-003, `install`/`build`/`snapshot` BLD-004, `migrate` DB-001 `apply`, `coverage` TST-011), never `BLOCKED(budget)`. `timeoutSec` does not apply to `start`: a `start` process runs until the end of its stage or run and is then killed with its process tree; its readiness is bounded by `verifyEnv.health.<service>.timeoutSec` (§ 3.4), and a `start` process that exits before it is ready, or before shipgate stops it, is a builder-owned BLD-005 `command-failed` finding. `shell`: `none` (default) \| `sh` \| `bash` \| `pwsh` \| `cmd`. Under `none` the string is split with POSIX shell-word rules (quotes and backslash escapes; no expansion, no operators: `\|`, `&&`, `\|\|`, `;`, `<`, `>` make it invalid, CFG-002), and argv[0] is resolved via `PATH` plus `node_modules/.bin` of the service path (`.cmd`/`.exe` resolution on Windows). Otherwise it runs as `sh -c`/`bash -c <string>`, `pwsh -NoProfile -Command <string>`, `cmd /d /s /c <string>`. `cwd` is relative to the service `path` (default `.`). A plain string = `{ run: <string>, shell: "none", cwd: ".", timeoutSec: 900 }` | adapter defaults |
| `port` | `"{port}"` or integer | `"{port}"` |
| `env` | object; placeholders `{port}`, `{origin}`, `{db.<id>.url}`, `{smtp.port}`, `{supabase.url}`, `{supabase.anonKey}`, `{supabase.serviceKey}` | `{}` |
| `surfaces` | `{ public\|app\|api\|asset: pattern[] }` | proposed by `init` |
| `trailingSlash` | `"always"` \| `"never"` | adapter discovery; when the adapter reports none, `"never"` plus a report warning `trailing-slash-assumed` |
| `pathCase` | `"lower"` (uppercase variants redirect) \| `"insensitive"` \| `"preserve"` | `"lower"` |
| `sanitizer` | `{ module, export }` approved HTML sanitizer for SEC-001 | `null` |
| `minCoverage` | `full\|structural\|behaviour` | `verifyEnv.minCoverage` |
| `writeScope` | glob[] | top-level |

### 3.3 Host registry — `hosts[]`
`{ host: "*.stripe.com", purposes: ["payments"], server: true, browser: true, essential: true }`. Shape: `{ host, purposes: string[] (≥ 1), server: false, browser: false, essential: false, name?: string }` (defaults shown). `name` is the vendor's display name as the privacy notice names it (PRV-031 `processors`); no default. `host` is a DNS name or `*.` + name; `*.` matches one or more labels and never the apex (`*.stripe.com` matches `js.stripe.com` and `a.b.stripe.com`, not `stripe.com`); matching is case-insensitive and ignores the port. A host matching several entries gets the union of their flags and purposes. Purposes: `payments`, `analytics`, `advertising`, `affiliate`, `ai` (model providers), `assets`, `fonts`, `maps`, `video`, `auth`, `email`, `search`, `support`, `monitoring`, `dependency`, `other`. One registry replaces separate allowlists: `server` → egress allowed (SEC-004); `browser` → real third-party loads allowed in the browser (04 § 6.1); `essential` → allowed before consent (privacy pack); a host is a fault-injection target (resilience, 04 § 4.5) iff `purposes` contains `dependency` (there is no `dependency` boolean). Asset hosts are `purposes: ["assets"], browser: true`.

### 3.4 VerifyEnv
| Key | Default |
|---|---|
| `minCoverage` | `"structural"` |
| `databases[]` `{ id, engine: postgres\|mysql\|sqlite, version, provider: embedded\|external, url?, extensions[] }` | `[]` |
| `dbEnv` `{ serviceId: { VAR: "{db.<id>.url}" } }` | `DATABASE_URL` for a single database; several databases and no `dbEnv` → CFG-001 |
| `seed` `{ <dbId>: { run: "<command>" } \| { sql: [glob] } }` — **seed inputs** = the files matched by `sql` globs, or the command string plus files it references under `quality/` and the migrations dir. `sql` files apply in path byte order. Seed files under `quality/` are lock inputs (§ 8); a `run` seed and `sql` files elsewhere are not Operator-owned sources (§ 8 *Operator-owned sources*), so no rule may use the rows they write as an oracle | none |
| `platform` `{ supabase: { mode: "managed"\|"external", projectUrlVar?, anonKeyVar?, serviceKeyVar? } }` | none |
| `health` `{ serviceId: { url, timeoutSec: 120, intervalMs: 500, endpoint: false } }` (`endpoint: true` = a real health endpoint checked by OPS-002). `url`: a path on the service origin. Ready = the first response with status 200–399 (redirects not followed); with `endpoint: true`, only 200. Polling starts at `intervalMs`, doubles after each failed attempt up to 5,000 ms, and stops at `timeoutSec`; not ready by then → BLD-005 for that service | `url: "/"` |
| `auth` | § 4 |
| `smtp` `{ enabled }` (the SMTP sink, TR-007) | `true`. `false` is rejected (CFG-001) when any flow has an `expectEmail` or `openEmailLink` step, a UX-022 form key has an `email:` outcome, a `raceSensitive` entry has an `email` effect, the ops pack is enabled, or SEC-025, SEC-038, SEC-039, SEC-054, SEC-067, API-006 or JOB-002 applies |
| `secretsFrom` | `quality/verify.env` |
| `timeBudgets` `{ check: 10, stop: 45, verify: 1800 }` (seconds) | as shown |
| `reduced` `{ allowed: bool, where: "ci" \| "anywhere" }` — permits reduced runs (G0–G3, verdict at most PARTIAL) when shipgate itself detects no browser or no free ports; `"ci"` additionally requires CI detection (04 § 15) | `{ allowed: false, where: "ci" }` |

**Waiver**: `{ rule, part?: string (default: every waivable part of the rule), scope: { kind: path|route|surface|family|service|package, pattern }, reason, approvedBy, expires: YYYY-MM-DD (required, ≤ 365 days after the signing lock's `createdAt`) }`. `pattern` by `kind`: `path` → file glob (§ 2.2); `route` → URL pattern (§ 2.1); `surface` → `public|app|api|asset`; `family` → programmatic family id; `service` → service id; `package` → `name` or `name@<semver range>`. CFG-001 rejects a waiver whose `rule`, or `part`, isn't waivable (01 § 5.4, 04 § 1.8). A waiver on a † rule covers only its waivable parts (e.g. RTE-010 `source-hint`, 04 § 1.8); a † rule without a waivable part can't be waived.

### 3.5 Pack sections: required keys and defaults
Pack sections are shown in each pack file as examples. **Convention:** every value shown in a pack's example is that key's default, except keys listed below as required (no default; CFG-001/006 fail without them) and values that are obviously project-specific placeholders listed below as "no default". Enum values are the alternatives given in the example comments.

| Pack | Required keys | No default (must be set when used) |
|---|---|---|
| web-delivery | `brand`, `siteName`, `locales`, `defaultLocale` | `targets`, `staticPaths`, `retired`, `contentParams`, `pagination`, `indexRules`, `trustPages.editorialPolicy`, `trustPages.corrections`, `docs.versions` (`llmsTxt` defaults to `"required"` for `docs` projects, else `"optional"`) |
| search-engines | `engines` | `verification.*`, `facets.routes`, `facets.params`, `facets.defaults`, selectors, `merchantFeed`, `agenticFeeds`, `domainHistory`, `products.discontinued` |
| answer-engines | — | `organization.*`, `authors.*`, `questions`, `indexNow.keyPath` |
| programmatic | `dataAsOf`, `families[].id`, `.service`, `.routePattern`, `.dataset`, `.primaryEntityField`, `.fields`, `.localFacts`, `.titleTemplates`, `.descriptionTemplates`, `.h1Template`, `.schemaTypes`; `sources` | `hubs`, `demand`, `rollout`, `targetQueryTemplate`, `snapshot`; per source `rights` (missing: DAT-018 part `rights`, a required-facts finding, not CFG-001); per family `breadcrumbs`, `hub`, `staticFragments`, `retired`, `links` (absent = feature not used) |
| performance | — | `routes` overrides |
| accessibility | — | — |
| security | — | `routes` (else surface defaults), `authEndpoints`, `payments` (incl. `successPath`, `entitlement`), `oauth.clients`, `realtime`, `storage`, webhook-route `scheme`/`secretVar`/`fixture`; absent `cors.allowedOrigins` = `[]` |
| privacy | `jurisdictions` | `legalPages`, `consent.banner`, `ccpa.gpcIndicator`, `accountData`, `audience.ageGate`, `digitalProductPaths`, `dsa.ugcSelectors` |
| architecture | per service: `layers` | `serverOnly`, `envModule`, `dataAccess`, `singletons`, `entryPoints`, `design.*` |
| data-api | `contracts` (when the service has an `api` surface) | `db`, `jobs`, `idempotentPosts`, `contracts[].clientTypes` |
| resilience | — | `degradable` |
| ops | — | `errorReporting`, `email.*` |
| testing | — | — |
| refactor | — | — |
| ux | — | `contactPath`, `socialProofSources`, `stockSources` |

Additional keys defined by v7.1+ text and not shown in older examples: web-delivery `retired: [{ path, successor? }]`, `contentParams: [{ pattern, param, mode: "canonical-clean"|"self-canonical" }]`, `pagination: [{ pattern, param, style: "query"|"path" }]`; programmatic families `lastmodField` (default `updatedAt`), `ymylReviewers: []`, hubs `paginatedDescriptionTemplate`; search-engines `facets.defaults: { param: value }`, `facets.routes: [pattern]` (no default; facet probe bases, search-engines § 3.3), `facets.indexable: [[param…]]` (absent = `[]`: no facet combination is indexable); programmatic families `offerField` (string or `null`, default `null`, PCF-003); programmatic `sources.<id>.rights` (`"owned"`|`"licensed"`|`"public-domain"`|`"open:<SPDX id>"`|`"facts-only"`, no default), `.attribution` (string or `null`; the key is required for `licensed` and non-null for attribution-requiring `open:` licences), `.attributionFragment` (a `staticFragments` key, default `attribution-<id>`) (DAT-018); search-engines `sitewideLinkAllow: [host | { host, anchor }]` (§ 3.3 host grammar, default `[]`, SE-128); web-delivery `siteAlternateName` (string, default `null`, SE-102); ops `email.dkimSelectors: []`; flows `requires: [host]`.

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
  "tokenTtlVar": null                        // env var the app honours to shorten token lifetimes in verify; holds the lifetime as integer seconds (read by SEC-029, SEC-037 `expired`, SEC-044 expiry checks) — also the format of `security.session.idleVar`/`absoluteVar` (security shared definitions *Lifetime variables*)
}
```
**Keys and defaults.** Absent `auth` ≡ `{ "strategy": "none", "accounts": {} }`. `strategy` default `"none"`. `loginPath`: a path on the service origin, default `"/login"` — the login page that SEC-003, SEC-021, UX-018 and the web-delivery `app`-page row use. `flow`: a path under `quality/flows/`, default `"quality/flows/_login.json"`; with `strategy: "flow"`, a non-empty `accounts` and no `verifyBackdoor`, a missing `flow` file → CFG-001. `command` (strategy `command`) and `headerTemplate` (strategy `header`): default `null`, required for their strategy and rejected (CFG-001) under any other. `accounts`: `{ <id matching ^[a-z][A-Za-z0-9-]{0,31}$>: { role: string, tenant: string | null } }`, default `{}`; wherever a rule or step says "first account" or iterates accounts, the order is the ids' byte order. `sessionCookies`: string[], default `[]`; empty means every cookie set during the login (flow, backdoor response or `command` output) belongs to the session. `verifyBackdoor`: a URL pattern (§ 2.1) or `null` (default). `tokenTtlVar`: an env var name or `null` (default).

Credentials in `verify.env`: `SHIPGATE_ACCT_<ID>_EMAIL|_PASSWORD|_TOTP_SECRET|_TOKEN`, where `<ID>` = the account id upper-cased with every non-alphanumeric character replaced by `_` (`userA` → `USERA`, `sales-admin` → `SALES_ADMIN`); two ids mapping to the same `<ID>` → CFG-001.
- **Backdoor login.** With `strategy: "flow"` and `verifyBackdoor` set, shipgate logs each account in with one request to that route: JSON body `{ "account": "<id>", "email": "<SHIPGATE_ACCT_<ID>_EMAIL>", "role": "…", "tenant": "…" }`, header `X-Shipgate-Verify: 1`. The `Set-Cookie` headers of a 2xx response whose names are in `sessionCookies` form the session; any other response, or a 2xx without such a cookie → `BLOCKED(seed-contract)` (04 § 4.3). `_login.json` is then run only by flows that log in themselves.
- Without `verifyBackdoor`, `_login.json` runs once per account with `{account.*}` bound to that account (§ 10).
- **`strategy: "command"`:** `command` is a § 3.2 command value (cwd = repo root, `shell` default `none`, `timeoutSec` default 60), run once per account at 04 § 4.2 step 6 with env `SHIPGATE_ACCOUNT=<account id>` plus that account's `SHIPGATE_ACCT_<ID>_*` variables. stdout must be one JSON object `{ cookies?: [{ name, value, domain? (default: the service origin's host), path? (default "/") }], headers?: { <name>: <value> } }` with at least one of the two keys. Cookies are installed in the account's browser context and HTTP client; headers are sent on every request shipgate makes to a service origin as that account (browser requests by interception). Non-zero exit, timeout, unparsable output or neither key → `BLOCKED(seed-contract)` (04 § 4.3).
- **`strategy: "header"`:** `headerTemplate` is rendered per account (§ 10 account tokens) and split at the first `: ` into name and value; the header is added to every HTTP request and, by interception, every browser request shipgate makes to a service origin as that account; no cookies. A rendered value that is empty → `BLOCKED(seed-contract)`.
- **`strategy: "none"`:** `accounts` must be empty (else CFG-001); a flow with `account` ≠ `null` → `notConfigured(verifyEnv.auth.strategy)` for the rule running the flow (owner `operator`).

`verify.env`: `KEY=value` lines, `#` comments, no interpolation, git-ignored, never production values.

---

## 5. Rule metadata — `rules/<pack>/<ID>.yml` (inside shipgate)

```yaml
id: RTE-005
title: 404 is decided before the response is committed
pack: web-delivery
severity: P0
parts: []                      # [{ part, severity, waivable?, remote? }] — per-part severities (static: an input-dependent severity is two parts, 04 § 1.8); findings carry `part` (default main); `remote` defaults to the rule's
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
**Required:** `id`, `title`, `pack`, `severity` (`P0|P1|P2|W`), `channels` (04 § 1.1), `failureClasses` (04 § 9.1), `fix`, `since`; `sources` for `search-engines` rules; `gates` (non-empty, values `G0`…`G9`) for rules with a `db` or `contract` channel, rejected on other rules (04 § 1.1). **Defaults:** `parts: []`, `waivable: true`, `lifecycle: experimental`, `sources: []`, `surfaces: [public, app, api, asset]`, `appliesTo: { fileRoles: ["*"], adapters: ["*"], requires: [] }` (`fileRoles` from 04 § 7.1; `requires` = policy key paths that must exist for the rule to apply, else `notApplicable`), `scope: changed`, `remote` per 04 § 15, `profile: default`, `engine: builtin`, `optionalInputs: []` (entries are policy key paths such as `security.realtime.channels`, or `business.json:<key>`), `owns: []`, `groupKey` per 04 § 9.2 for the rule's first channel (entries are the § 9.2 component names: `routePattern`, `routeGroup`, `file`, `patternId`, `failureClass`, `family`, `field`, `package`, `advisory`, `endpoint`, `diffPath`, `path`, `command`, `service`, `checkId`, `metric`, `session`, `tool`, `target`, `migrationFile`, `table`, `locale`), `tags: []`, `corpus: ["<pack>/<id lower-case>-*"]`. Parts inherit `waivable` and `remote` from the rule unless they set them (W parts are always waivable, 04 § 1.8); a rule with a `remote: write` part runs that part only on targets that allow writes. Unknown keys are rejected.

**Detectors** are separate: ast-grep YAML files in `rules/<pack>/<ID>/detect/*.yml` (and adapter traps in `adapters/<id>/rules/*.yml`) carry `ruleId: <ID>`; builtin detectors are Rust modules registered under the rule id. Adapter trap ids `<ADAPTER>-NNN` declare `guards: [<ID>]`; their findings group under the guarded rule. Metadata validation rejects an `owns` relation where the owner is waivable and an owned rule is not.

---

## 6. Adapter manifest — `adapters/<id>/adapter.json`

**Common types.** `ApiRef` = `{ module?: string, call: string /* dotted callee path, e.g. "child_process.exec" */, args?: { <role>: <0-based index> | "<0-based index>.<key>" } }` (the `"<index>.<key>"` form names property `<key>` of an object-literal argument, e.g. `"1.timeZone"`); a bare string is `{ call: <string> }`. `Marker` = a literal substring (a string containing `*` is a file glob instead). `Pointer` = `<config-file-id>:<JSON pointer>` (`tsconfig:/compilerOptions/strict`), where the config-file id is a key of `config` or one of `tsconfig`, `package`. Regexes are Rust `regex` syntax.

**Built-in ids** (Rust modules shipped with shipgate; one per 02 § 5 built-in adapter, added by that adapter's WP; `shipgate doctor --adapters` lists the shipped set; any other id → CFG-002):
- `routes.discover`: `static-files` (static-html), `fs-app-router` (next-app), `fs-pages-router` (next-pages), `vite-router-scan` (vite-spa), `tanstack-route-tree`, `react-router-config`, `astro-pages`, `nuxt-pages`, `sveltekit-routes`, `django-urlconf`, `fastapi-openapi`, `flask-decorators`, `rails-routes`, `laravel-route-list`, `spring-annotations`, `aspnet-routing`, `go-http-registrations`, `rust-http-registrations`, `crawl-sitemap` (wordpress, generic-http, hosted-builder: routes from the sitemaps and the crawl), and `declared` (only the routes declared in policy `surfaces`, web-delivery `staticPaths` and programmatic `families`).
- `routes.fileMap` (file-system routers only): `static-files`, `app-router`, `pages-router`, `astro-pages`, `nuxt-pages`, `sveltekit-routes`, `tanstack-route-tree`.
- `bundleManifest[].reader`: `next-app-build-manifest` (`.next/app-build-manifest.json`), `next-build-manifest` (`.next/build-manifest.json`), `vite-manifest` (`<outDir>/.vite/manifest.json`), `webpack-stats` (webpack `stats.json`), `esbuild-metafile` (esbuild `metafile` JSON).
- `redirectSources[].reader`: `vercel-json` (`vercel.json` `redirects`), `netlify-toml` (`[[redirects]]`), `netlify-redirects` (`_redirects`, also Cloudflare Pages), `htaccess` (`Redirect`, `RedirectMatch`, `RewriteRule … [R=…]`), `nginx-conf` (`return 3xx` and `rewrite … redirect|permanent`), `next-config-redirects` (literal `redirects()` arrays in `next.config.*`).
- `serverFunctions[].discover`: `next-actions`, `sveltekit-actions`, `remix-actions`, `trpc-router`, `orpc-router`.

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
| `portBinding` | `env:<VAR>` \| `flag:<flag template with {port}>` \| `config`. `config`: the framework reads its port from a file shipgate must not rewrite, so the service must declare an integer `port` in policy (`port: "{port}"`, the default, with a `config` primary adapter → CFG-002); shipgate uses that integer and reports BLD-005 when the port is busy | yes | — |
| `envInlinedAtBuild` | bool | | `false` |
| `routes` | `{ discover: <built-in discoverer id>, fileMap?: <built-in file-map id> }` (*Built-in ids* above) | yes | — |
| `fileRoles` | `[{ glob, role: <role, 04 § 7.1> }]`, evaluated in array order, the first matching entry wins | yes | — |
| `entryPoints` | glob[] (framework-required exports/files) | | `[]` |
| `config` | `{ <setting>: "<file-id>:<path>" }` readers. Standard setting names (WCF-003 compares these with the policy when an adapter returns them): `trailingSlash` (`"always"`\|`"never"`), `basePath` (path prefix), `i18n.locales` (BCP 47 tags), `i18n.defaultLocale` (BCP 47 tag) | | `{}` |
| `suppressions`, `testMarkers` | string[] (literal substrings) | | `[]` |
| `testShuffle` | string (flag appended to `test` that randomises order) \| `null` | | `null` |
| `serverOnlyMarkers` | Marker[] | | `[]` |
| `publicEnvPrefixes` | string[] | | `[]` |
| `rawHtmlSinks`, `envReadApis`, `queryApis`, `loggerApis`, `clockApis`, `randomApis` (RTE-011 `random`; e.g. `Math.random`, `crypto.randomUUID`, `crypto.getRandomValues`, Python `random.*`, Ruby `rand`), `hashApis`, `sleepApis` (TST-004), `execApis`, `fsApis`, `pathGuardApis`, `evalApis`, `deserializeApis`, `validatorApis` (ARC-004, SEC-030, SEC-045), `passwordHashApis` (SEC-027: approved password hashers — bcrypt, scrypt, argon2, PBKDF2 and the framework's default password hasher), `redirectApis`, `modelToolApis` (SEC-062), `authGuardApis` (ARC-006, SEC-057, SEC-062), `dbClientApis` (ARC-006 `db-client`: calls that construct a database client, e.g. `new PrismaClient`, `createClient`, `new Pool`, `create_engine`; empty → `noAdapterSupport` for that singleton key), `searchHandlers` (IDX-012), `writeOperations` (which `queryApis`/`httpClientApis` calls are writes) | ApiRef[] | | `[]` |
| `httpClientApis` | `[ApiRef & { timeoutArg?: string, timeoutUnit?: "ms"\|"s", clientFactory?: bool }]`: `timeoutArg` = the argument role or option key that sets the request timeout (e.g. `fetch` `signal`, axios `timeout`, `requests` `timeout`); `timeoutUnit` = the unit of a literal value passed there (default `ms`; e.g. `s` for Python `requests`; RES-006 `bound`); `clientFactory: true` = the call creates a client whose calls inherit `timeoutArg` when it is passed to the factory (RES-006; ARC-006, SEC-030 and `writeOperations` use only `call`) | | `[]` |
| `formatterApis`, `urlBuilderApis` | ApiRef[] (ARC-006 `formatting` / `url`; e.g. `Intl.NumberFormat`, `Intl.DateTimeFormat`, `toLocaleString`, date-fns `format`; `new URL`, `URLSearchParams`). `formatterApis` entries declare the `args` roles `locale` (required for I18-006: an entry without it is `noAdapterSupport` there), and `timeZone` and `currency` where the API takes them (e.g. `Intl.DateTimeFormat`: `{ "locale": 0, "timeZone": "1.timeZone" }`; `Intl.NumberFormat`: `{ "locale": 0, "currency": "1.currency" }`) | | `[]` |
| `destructiveMigrationApis` | ApiRef[] (DB-006, for migration formats whose `applyCommand` can't apply one file; e.g. Django `RemoveField`, `DeleteModel`; Rails `drop_table`, `remove_column`; knex `dropTable`, `dropColumn`) | | `[]` |
| `jobRetryArgs` | `[ApiRef & { arg: string, unboundedDefault: bool }]`: `arg` = the option key of a `jobDiscovery` registration that sets the retry count; `unboundedDefault: true` = omitting it retries without bound (JOB-003; e.g. BullMQ `attempts`, Celery `max_retries`, Sidekiq `retry`) | | `[]` |
| `testReport` | path, relative to the service, of the JUnit XML the `test` command writes \| `null` (TST-004 `order`) | | `null` |
| `modelApis` | `[ApiRef & { maxTokensArg: string }]` | | `[]` |
| `clientEntries` | glob[] (files that start client bundles) | | `[]` |
| `bundleManifest` | `[{ glob, reader: <built-in reader id> }]`: build-output manifests (relative to the service path) and the reader that parses each (*Built-in ids* above). Every reader yields `{ routes: { <route pattern>: [asset URL path] }, sources: { <asset URL path>: [source path or package name] } }`: `routes` = the JS and CSS assets of each route's initial load (PRF-010); `sources` = the inputs of each emitted asset (ARC-002 `bundle`). Formats without a route map (`vite-manifest`, `webpack-stats`, `esbuild-metafile`) yield one route `/**` whose assets are the entry chunks (`isEntry`, `entrypoints`, `entryPoint`) with their static imports and CSS | | `[]` |
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
| `schemaDriftCommand` | a § 3.2 command value \| `null`, run after the migrations are applied (DB-001 `drift`), with `cwd` relative to the service path and the placeholders `{db.<id>.url}` and `{db.url}` (valid only here) = the URL of the one database the service's `dbEnv` entry selects (§ 3.4; `{db.url}` when that entry selects several → CFG-002); `timeoutSec` per § 3.2. Exit 0 = no drift; any other exit = drift (DB-001 `drift`, class `command-failed`, builder-owned) | | `null` |
| `codegen` | ids from 05 § 1 `codegen` | | `[]` |
| `codegenExt` | file extension without dot (`ts`, `py`, `php`) used for the generated files (05 § 1 Generators) | when `codegen` is non-empty (else CFG-002) | — |
| `requestSources` | ApiRef[]: calls whose return value is request-derived data (query, path params, body, headers, cookies; e.g. `req.query`, `request.json`, `searchParams.get`, `cookies().get`); with handler parameters, the sources of the request-derived data flow (04 § 13; SEC-003 `source`, SEC-027, SEC-045, SEC-062) | | `[]` |
| `matcherWidening` | `[{ from, to }]`: test-assertion matcher pairs (callee names) whose replacement `from` → `to` in a kept assertion is AGT-004 `transform` matcher widening (04 § 13); e.g. `{ "from": "toEqual", "to": "toBeTruthy" }`, `{ "from": "assertEqual", "to": "assertTrue" }` | | `[]` |
| `rules` | directory of adapter trap rules | | `adapters/<id>/rules/` |

Addons declare only what they add: for an addon, only `id`, `role`, `detect` and `priority` are required. Unknown keys are rejected.

Project-local adapters (`quality/adapters/`) earn a tier through `shipgate conformance --adapter <id> --fixtures <dir>` against Operator-supplied fixtures. **Conformance result:** `quality/conformance/<id>.json` (Operator-signed, protected by `quality/**`, committed so CI can check it) `{ formatVersion, adapter, claimedTier, adapterSha256, fixturesDir, fixturesSha256, ruleset, verifierVersion, passed: bool, failures: [{ fixture, rule, expected, actual }], createdAt, signedBy, signature }`. `adapterSha256` / `fixturesSha256` = SHA-256 over the § 8 digest lines (`path\0<hex>\n`, sorted) of every file under `quality/adapters/<id>/` / under `fixturesDir` (repo-relative); `signature` = Ed25519 (role `operator`) over the JCS of the object without `signature`. The result is valid (the adapter holds `claimedTier`) while `passed` is true, the signature verifies against the trust store, and `adapterSha256` and `fixturesSha256` equal the hashes of the current files; otherwise the adapter has earned tier 3 (02 § 2). `ruleset` and `verifierVersion` are informational. It carries its own signature and is not a lock input, so `conformance` doesn't re-lock (05 § 1) and the result isn't circular with the lock.

---

## 7. Keys and trust

### 7.1 Key storage
- **Operator key:** Ed25519 private key encrypted with a key derived from the Operator's passphrase (Argon2id, m=64 MiB, t=3, p=1), stored as an OS keychain item (Windows Credential Manager, macOS Keychain, Linux Secret Service; on Linux without a secret service, an encrypted file in the user config dir). The passphrase is never stored or cached; every Operator command asks for it on an interactive terminal.
- **Install secret:** random 32 bytes in the keychain (no passphrase), used only for HMAC of sealed verdict records (04 § 8.1); same-user processes can read it, so CI is authoritative (04 § 8.1 honest limit).
- **CI key:** Ed25519 key in a CI secret (`SHIPGATE_CI_SIGNING_KEY`, base64 of the 32-byte seed), role `ci`.
- **Fingerprints:** `ed25519:` + lowercase hex SHA-256 of the 32-byte public key.
- **Encodings.** Private key at rest (keychain item value, or the Linux fallback file) and in `keys export`: JSON `{ formatVersion: 1, kdf: "argon2id", m: 65536, t: 3, p: 1, salt: base64(16 bytes), cipher: "xchacha20poly1305", nonce: base64(24 bytes), ciphertext: base64(32-byte seed ‖ 16-byte tag), fingerprint }`. Public keys (`pubkey`): base64 of the 32-byte key. All signatures in shipgate files: base64 of the 64-byte Ed25519 signature. base64 = RFC 4648 § 4, padded, everywhere in shipgate formats.
- **Keychain items:** service `shipgate`; accounts `operator:<fingerprint>` (one per Operator key), `install-secret` and `trust-store` (§ 7.2). Linux fallback (no Secret Service), in `<config dir>/shipgate/` with file mode 0600: `operator-<fingerprint without the "ed25519:" prefix>.key.json`, `install-secret.bin` (the raw 32 bytes), `trust-store.json`. Later releases read these names unchanged.
- **Key selection:** with one Operator key in the keychain, Operator commands use it; with several, they sign with the key named by `--key <fingerprint>` (accepted by every Operator command, 05 § 1), and without `--key` exit 3 `ambiguous-key`.
- Hardware-backed keys (FIDO2/Windows Hello/Touch ID) are a later option behind the same interface.

### 7.2 Trust store
A keychain item (not a plain file) holding `[{ fingerprint, role: "operator"|"ci", pubkey, addedAt: RFC 3339, label }]` (`pubkey` per § 7.1 encodings). Adding a key (`keys trust`) needs the passphrase of an already trusted Operator key, except for the very first key. `doctor` reports trust-store changes since the last run. In CI the trust store is the `SHIPGATE_TRUSTED_KEYS` setting (JSON of the same shape), never read from the repo.

Role permissions: `operator` signs locks, debt, waivers, overrides, baselines, break-glass; `ci` signs only `quality/baselines/_main/`.

### 7.3 User config — `<config dir>/shipgate/config.toml`
`<config dir>` = Rust `dirs::config_dir()` (`%APPDATA%`, `~/Library/Application Support`, `$XDG_CONFIG_HOME` else `~/.config`). `<state dir>` (§ 15) = `dirs::state_dir()`, else `dirs::data_local_dir()` (`%LOCALAPPDATA%`, `~/Library/Application Support`, `$XDG_STATE_HOME` else `~/.local/state`). Keys: `licence.path` (path), `telemetry.crashReports` (bool, default `false`), `mirror` (URL), `proxy` (URL), `cache.dir` (path, default `<cache dir>/shipgate` with `<cache dir>` = `dirs::cache_dir()`: `%LOCALAPPDATA%`, `~/Library/Caches`, `$XDG_CACHE_HOME` else `~/.cache`; env `SHIPGATE_CACHE_DIR` overrides, 05 § 1; layout: `toolchain/<toolchain-manifest sha256 hex>/<unpackTo>` for unpacked toolchain entries (§ 19) and `downloads/<sha256 hex>` for verified downloads; it is the TR-001 user cache, protected by 05 § 3.1; gate results are not kept here but in `quality/out/cache/` (04 § 16)), `update.channel` (`"stable"|"beta"`, default `"stable"`), `update.check` (bool, default `false`; no update network call when false). Unknown keys are a warning. No security-relevant trust is stored here; in particular, reduced mode can't be enabled here (only by the signed policy, § 3.4).

### 7.4 Backups
`keys export` writes the passphrase-encrypted private key to a file for a password manager, in the § 7.1 encoding; `keys import` restores it; every release imports every `formatVersion` an earlier release exported.

---

## 8. Lock — `quality/lock.json`

```json
{ "formatVersion": 1, "verifierMajor": 1, "ruleset": "2026.10",
  "inputs": [ { "path": "quality/policy.json", "sha256": "sha256:…" } ],
  "appliedMigrations": [ "supabase/migrations/20260101_init.sql" ],
  "digest": "sha256:…", "signedBy": "ed25519:<fp>", "signature": "base64…", "createdAt": "2026-10-21T10:00:00Z" }
```
- **Inputs (sorted):** `quality/policy.json`, `quality/data/**`, the `verifyEnv.seed` files (§ 3.4) that lie under `quality/`, `quality/fixtures/**`, `quality/flows/**`, `quality/contracts/**`, `quality/adapters/**`, `quality/host/**`, `quality/rollout/**`, `quality/approvals/**`, `quality/baselines/**` **except `_main/`**, `quality/debt.json`, `quality/refactor.json`, the migration files listed in `appliedMigrations` (the set at lock time), the repo-relative host hook configuration files written by `hooks install` that git tracks (05 § 3.3 Config column, e.g. `.claude/settings.json`, `.husky/*`, `lefthook.yml`, a tracked `core.hooksPath` directory; untracked hook files such as `.git/hooks/*`, and user-level files, are not locked, because a CI checkout or second clone doesn't contain them, and are checked by `doctor` and `hooks check` instead), the protected JSON pointers of `protectedKeys` files (entries `{ path, pointer, sha256 }` where the hash is over the JCS of the pointed value), and the content between `<!-- shipgate -->` and `<!-- /shipgate -->` markers in `AGENTS.md`/`CLAUDE.md` (entries `{ path, section: "shipgate", sha256 }`). The lock also stores `verifyEnvSha256` (hash of `quality/verify.env` per § 1 *File hashes*, never its content; when the file does not exist, the hash of zero bytes, `sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`).
- **Entry formats:** `inputs[].sha256` is `sha256:<hex>`, hashed per § 1 *File hashes*. `appliedMigrations` = every file under each service's migrations dir (`data-api.db.migrations.dir` for the service named by `data-api.db.service`; for every other service, and without that key, the primary adapter's `migrations.dir`) present at lock time, repo-relative, sorted by bytes; a migration file added later is outside the lock until the next `lock` (it is the Builder's allowed write, 01 § 5.2). `verifierMajor` = the major component of the version of the binary that signed.
- **Operator-owned sources.** A file is an Operator-owned source — usable as an oracle against agent output (04 § 1.2 facts-oracle and required-facts rules, the programmatic oracle 04 § 11, UX-020 `stock` and `social-proof`, flows and contracts as oracles, TST-007) — only when it is a lock input under `quality/` or an `appliedMigrations` file. Rows in a seeded database are an Operator-owned source only when a seed file that is a lock input inserted them and no other statement (migration outside `appliedMigrations`, service start-up, the run itself) wrote them before the read (04 § 4.2 statement log). Not Operator-owned, and never an oracle: seed `sql` files outside `quality/` and `run` seeds (§ 3.4); migration files not in `appliedMigrations`; rows the services write; `merchantFeed` and `agenticFeeds[].path` files outside `quality/data/` (§ 14); programmatic `dataset`/`retired` files outside `quality/data/`; `testing.flows`, contract or fixture paths outside `quality/{flows,contracts,fixtures}/` (including `security.ownership` and data-api `firebase.seed`); `commands.snapshot` output, and programmatic live-mode `family.snapshot` rows that a lock-input seed file did not insert alone (the row rule above); anything the page, JSON-LD or app code states (e.g. a homepage `Organization` `telephone`). A rule that reads one of these as its expected value treats the page as having no source (UX-020: unmapped, blocking `forbidden-value`; programmatic dataset: CFG-001; programmatic live snapshot: one blocking `missing-element` per family owned by `operator`; TST-007: `schema-violation` owned by `operator`).
- **Digest:** SHA-256 over one line per input entry, the lines sorted by their bytes: `path\0<hex>\n` for files, `path#pointer\0<hex>\n` for protected keys, `path#section:shipgate\0<hex>\n` for marker sections, then (last, unsorted) `verify.env\0<verifyEnvSha256 hex>\n`. `<hex>` is the lowercase hex digest without the `sha256:` prefix; `digest` is written `sha256:<hex>`. **Signature:** Ed25519 (role `operator`) over the JCS of the object without `signature`.
- `_main/` is verified by its own `ci`-role signature. `verify.env` is locked by hash only: its content never enters the lock, but `verifyEnvSha256` is the digest's last line, so a changed (or newly created, or deleted) file makes the digest mismatch and needs a re-lock. Every machine that validates the lock, CI included, therefore needs a byte-identical `quality/verify.env` (CI: setting `SHIPGATE_VERIFY_ENV`, 05 § 5). The file is also a sensitive path (04 § 5).
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
Item shape: `{ fingerprint, rule, part (default "main"), locationKey, occurrences: int, addedAt: RFC 3339, reason?: string (required for items added by `debt add`), expires: YYYY-MM-DD | null, rotatedOn?: YYYY-MM-DD | null }`. Fingerprint = SHA-256 of JCS `{ rule, part, locationKey }`; `locationKey` is the 04 § 9.3 key, and the part (04 § 9.4) enters the fingerprint through `part`, so W debt and a P0 part never share a fingerprint. Items of `†` rules or `†` parts require `expires` ≤ `addedAt` + 90 days: `debt record` sets `expires` = record date + 90 days on new items of `†` rules/parts (`null` on others), and `debt add` requires `--expires` (≤ 90 days ahead) when any listed finding is of a `†` rule/part (else exit 3); `debt record` keeps `addedAt` and `expires` of items whose fingerprint already exists (re-recording never extends an expiry). Non-† parts of † rules (e.g. SEC-050 `history`, 04 § 1.8) follow their own metadata. `rotatedOn` (Operator-signed via `debt rotate`) clears a SEC-050 `history` item. Commands: `debt record` (initial/full), `debt add --reason` (only for rules that became stable, packs newly enabled, or inputs newly configured since the last record), `debt rotate`, `debt show`.

---

## 10. Flows — `quality/flows/*.json`

```jsonc
{ "id": "signup-to-first-invoice", "service": "web", "account": null,
  "viewport": "mobile", "orientation": "portrait", "browsers": ["chromium"], "persist": false, "mutates": true,   // orientation: portrait | landscape | both
  "journey": "signup",        // login | logout | signup | checkout | contact | deletion | export | withdrawal | cancel | other (default other)
  "keyboard": null,           // A11-019; null = true when `journey` or the flow id contains an entry of accessibility.keyboardFlows; else false
  "conversion": null,         // analytics event name this flow must send after consent (UX-010)
  "requires": [],             // third-party hosts the flow depends on (RES-004)
  "steps": [ … ] }
```
- **Keys.** Required: `id` and `steps` (non-empty). `id` = the file-name stem and matches `^[a-z0-9][a-z0-9-]{0,63}$`, except the reserved id `_login` (the login flow, `_login.json`). `service` defaults to the only service and is required when there are several. An `id` ≠ stem, a duplicate id, an empty `steps`, an unknown `service`, `account` or `journey`, a `requires` host matching no `hosts[]` entry, or any key not shown above → CFG-001. Within a stage (04 § 4.2), flows run in file-name byte order.
- `journey: "logout"` marks a logout flow: it ends its account's session and runs as its `account` (non-`null`), after that account has logged in (SEC-028; REF-013 `sw-cache` uses that logout). Flows are Operator-owned (`quality/flows/**`, 01 § 5.2), so a missing logout flow is a missing Operator input: SEC-028's blocking `missing-element` finding for it is owned by `operator`, never by the Builder.
- `viewport`: `mobile` (390×844, DPR 3, touch, mobile UA) | `tablet` (820×1180, DPR 2, touch) | `desktop` (1366×768, DPR 1); default `desktop`. `orientation` (default `portrait`): `landscape` swaps width and height; `both` runs the flow once per orientation. The same names and sizes apply to refactor `visual.viewports`.
- `browsers`: subset of `chromium|firefox|webkit`, default `["chromium"]`. `mutates` default `true`; `account` default `null` (anonymous); `account` names an `auth.accounts` id.
- `persist` (default `false`): when `true`, the browser context's storage state at the end of the flow is reused by the next flow of the same `account` in file-name byte order; otherwise every flow starts with a fresh context holding only the account's session.

**Step encoding.** Each step is an object with exactly one action key (the Step column). Locator-only steps take the Locator (`{ "click": { "role": "button", "name": "Save" } }`); steps with extra fields nest the Locator under `target` (`{ "fill": { "target": { "label": "Email" }, "value": "{uniqueEmail}" } }`, `{ "press": { "key": "Enter", "target": … } }`); scalar steps take the scalar (`{ "goto": "/pricing" }`, `{ "measure": "inp" }`, `{ "openEmailLink": true }`). Optional on every step, next to the action key: `timeoutMs` (default 10000; 30000 for `expectEmail`; an explicit value always wins), `optional: false` (`true`: a failure is recorded as W evidence and the flow continues). `expectText.in` is a Locator (default: the page). `frame` is `{ target: Locator, steps }`; `popup` is `{ trigger: Locator, steps }`.

**Step index:** the 0-based position of a step in the flow's top-level `steps` array, written as a decimal string (`"3"`); a step inside the `steps` of a `frame` or `popup` step is `<outer>.<inner>`, recursively, 0-based at each level (`"3.1"`, `"3.1.0"`). Every use of a step index — finding groupKeys (`flow-step-failed`, 04 § 9.2), `flows.jsonl` `index` (§ 12), refactor `flow.steps` (§ 11), the UX-022 form key (§ 14) — uses this string form.

| Step | Fields |
|---|---|
| `goto` | path or absolute URL on a service origin |
| `click`, `hover`, `dblclick`, `check`, `uncheck` | Locator |
| `fill` | Locator + `value` |
| `select` | Locator + `value` \| `label` |
| `press` | `key` (+ Locator) |
| `upload` | Locator + `file`: a path relative to `quality/fixtures/`; a path that resolves outside it → CFG-001 |
| `waitFor` | Locator \| `{ urlEquals }` \| `{ urlMatches }` (same comparison as `expectUrl.equals` / `.matches`, polled until `timeoutMs`) \| `{ network: "idle" }` (`idle` = no request in flight for 500 ms, Playwright `networkidle`) |
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
| `stubNetwork` | `{ urlMatches, status, body? }` (third-party hosts only): `status` an integer; `body` a string (sent as `text/plain; charset=utf-8`) or any other JSON value (sent as `application/json`), default `""` |
| `expectEgress` | `{ host, method?, pathMatches?, bodyContains? }`: since the previous step, a matching request was made either server-side (seen by the egress proxy) or from the browser (seen by browser interception), for example a form posting to a CRM, Formspree or HubSpot. Both paths answer with the stub declared for that host in `ux.egressStubs` (default `200 {}`), so nothing real is sent |
| `measure` | `"inp"`: records the flow's INP so far in the report; PRF-002 judges the final value at flow end |

Locator: `{ role, name }` | `{ label }` | `{ placeholder }` | `{ text }` | `{ testId }`. `_login.json` is the login flow.
- **Generators** (seeded by flow id + run id + occurrence index `n` within the flow): `{uniqueEmail}` = `sg-<first 12 hex of SHA-256(flowId, runId, n)>@verify.shipgate.test`, delivered to the SMTP sink; `{strongPassword}` = 20 characters with upper, lower, digit and symbol; `{uuid}` = v4.
- **Account tokens** read `verify.env` (§ 4): `{account.email}`, `{account.password}`, `{account.token}` refer to the flow's current account (its `account` field; in `_login.json`, the account being logged in); `{account.<id>.email|password|token}` refer to a named account. A token whose variable is unset → `notConfigured(verify.env:SHIPGATE_ACCT_<ID>_…)` for the flow. The `totp` step fills the current RFC 6238 code (SHA-1, 6 digits, 30 s) of the current account's `SHIPGATE_ACCT_<ID>_TOTP_SECRET` (base32).
- **Outcomes.** A step fails when its action throws, or its expectation is still false after `timeoutMs` of retrying (expect steps and `waitFor` poll every 100 ms). The first failing non-optional step ends the flow with one finding of the rule running the flow, class `flow-step-failed` (groupKey: flow id + step index, *Step index* above), showing step, URL, expected and actual, plus a screenshot.
- **Locators** follow Playwright `getByRole`/`getByLabel`/`getByPlaceholder`/`getByText`/`getByTestId` with `exact: false` (case-insensitive substring, whitespace collapsed); more than one matching element is a step failure (strict mode). `testId` matches `data-testid`.
- All `*Matches`/`matches` values are Rust `regex`, unanchored. `expectUrl.equals` compares path + query with the service origin stripped. `expectApi`: `jsonPath` is RFC 9535; `equals` is JSON deep-equality with the first selected node (with no `jsonPath`, with the whole body); `status` an integer. `expectDb.equals` is an array of row arrays, compared in order, values as JSON scalars (numerics compared as numbers, timestamps as RFC 3339 strings). `{email.link}` = the first link in the matching email (HTML part, else text part) that matches `linkMatches` (default: the first link to a service origin); `to` accepts a literal address or an account token.
- **Text comparison.** `expectText` (`contains`/`exact`), `expectEmail.subjectContains` and `expectDownload.contains` compare **case-sensitively** after Unicode NFC and whitespace collapse (each run of whitespace → one space, then trimmed) of both sides; `contains` = substring, `exact` = equality, `regex` = an unanchored Rust `regex` over the collapsed text. `expectDownload.contains` passes when every listed text occurs in the file decoded as UTF-8 for `.txt .csv .json .xml .html .md`, or in the extracted text layer for `.pdf`; `contains` on any other type → step failure `unsupported-download-type`. `nameMatches` is a regex over the suggested file name. Locator `name`/`text`/`label`/`placeholder` stay case-insensitive substrings (above).

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
`goal`: free-text string, display only; shipgate decides remote-baseline behaviour from the baseline's `manifest.remote` (§ 12), never from `goal` (`init --new` writes the text `"replatform"`). `baseline` must name a directory under `quality/baselines/` holding a validly signed `manifest.json` (else CFG-001).

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
| `api-status` | `{ endpoint, from: int, to: int }` | REF-004 accepts status `to` where the baseline recorded `from` for `endpoint`; API-004 (G2, no baseline) accepts `to` where the latest released contract (§ 14) documents `from` for `endpoint` |
| `header` | `{ routes, name, value?: regex }` (no `value` = any value, incl. removal) | on matching routes, response header `name` may differ or (without `value`) disappear, for REF-002 and REF-005 `security`; with `value`, the new value must match it |
| `budget` | `{ routeGroup, metric: "lcp"\|"cls"\|"tbt"\|"inp"\|"scriptBytes"\|"cssBytes"\|"p95", maxIncreaseRatio: number }` (for `p95`, `routeGroup` is the `budgets.json` `api` endpoint) | REF-005 `budget` for that route group and metric passes when the value ≤ baseline × (1 + `maxIncreaseRatio`), instead of baseline + `tolerance` |
| `schema` | `{ db, table, change: "column-added"\|"column-removed"\|"index"\|"policy" }` | REF-002 accepts, for that table of that database, differences in `db/schema.sql` of that kind (`column-added`/`column-removed`: column definitions; `index`: index definitions) or, for `policy`, in that table's `db/policies.json` entries |
| `flow` | `{ flow, steps?: string[] }` (§ 10 step indices; default: every step) | REF-006 and REF-012 accept differences in that flow (in the listed steps only, when given) |

Every entry may carry `reason`. Unknown fields fail CFG-001. An entry that matches nothing in the baseline is a W finding (`unused-allowance`).

---

## 12. Baselines — `quality/baselines/<id>/`

```
manifest.json     { formatVersion, id, createdAt, commit, ruleset, verifierVersion, services, counts, masks, files: [{path, sha256}], visual: [{ routeGroup, url }], remote: { origin } | null, signedBy, signature }
routes.jsonl      { pattern, url, status, location?, robots, canonical, title, description, h1, mainTextHash, mainText(≤20 KB), jsonld, links[], lastmod?, visibleUpdated?, kind: page|family|hub }
                  (mainTextHash is computed with `<time>` elements and detected dates removed, 04 § 15, so date-only edits don't count as content changes: AEO-012)
api.jsonl         { request: {method, url, headersSubset, body?}, status, headers(normalised), body(normalised), contractVersion }
db/schema.sql, db/policies.json
flows.jsonl       { flow, browser, steps: [{index: string (§ 10 step index), ok, url, texts[], api?, db?, emails[{to, subject, linkPaths[], textHash}], thirdParty[{host, event?}]}] }
redirects.jsonl   { source, status, location, from: host-config|retired|adapter }   (REF-011)
budgets.json      { routeGroup: { lcp, cls, tbt, inp, scriptBytes, cssBytes }, api: { endpoint: p95 } }
a11y.json         { url: [{ axeRule, selector, impact }] }
security.json     { url: { headers, cookies }, probes: [{ id, outcome }] }
visual/<route-group>/<viewport>.png  (+ masks in manifest)
```
- **Header subset** (`headersSubset`, `headers`): lower-cased names from the list `content-type`, `cache-control`, `location`, `vary`, `access-control-*`, `x-robots-tag`, `content-security-policy`, `strict-transport-security`, `set-cookie` (cookie values replaced by `⟦v⟧`, attributes kept), in that order; other headers dropped.
- **Body normalisation:** JSON bodies are parsed and re-serialised as JCS, with values at keys matching `(^id$|_id$|Id$|At$|_at$|token|nonce)` and strings shaped as RFC 3339 timestamps or UUIDs replaced by `⟦v⟧`; non-JSON bodies are stored as `sha256:<hex>` after the 04 § 15 fallback-body masking.
- **Units and shapes:** `budgets.json` lcp/tbt/inp/p95 in ms, cls unitless, `*Bytes` in bytes. `manifest.counts` and `_main/counts.json`: `{ routes: int, endpoints: int, flows: int, indexablePages: int }`. `cycles.json`: `[{ service, members: [file] (sorted) }]`, the import cycles at the base commit (ARC rules). Manifest `masks`: `{ "<route-group>": [CSS selector] }`, applied as the union with refactor `visual.masks`; viewport names per § 10. Manifest `visual`: one entry per route group with a screenshot, `url` = the URL captured for it (REF-009 re-captures that URL); `[]` for remote baselines. Manifest `id`: string, the baseline directory name; `commit`: the full 40-hex commit the baseline was recorded at, or `null` for a remote baseline; `services`: the sorted service ids recorded (`[]` for a remote baseline); `files[].path`: relative to the baseline directory, sorted by bytes, `sha256` per § 1 *File hashes*.
- **`security.json`:** every top-level key other than `probes` is an absolute URL; `headers` = `{ <lower-case name>: <value as received> }` for those of `strict-transport-security`, `content-security-policy`, `x-content-type-options`, `x-frame-options`, `referrer-policy`, `permissions-policy`, `cross-origin-opener-policy`, `cross-origin-resource-policy` that the response carries; `cookies` = `[{ name, secure: bool, httpOnly: bool, sameSite: "strict"|"lax"|"none"|null, path, maxAgeSec: int|null }]` from the response's `Set-Cookie` headers, sorted by `name` (values never stored); `probes[]` = `{ id: <rule id>#<part>, outcome: "pass"|"fail"|"skipped" }` per security probe of the run, sorted by `id`.
- **`db/schema.sql` and `db/policies.json`** are produced as refactor § 2 *Database* states. `db/policies.json` element types: `{ db: <database id>, schema, table, name, command: "all"|"select"|"insert"|"update"|"delete", roles: [string] (sorted by bytes), qual: string|null, withCheck: string|null }` — PostgreSQL row-level-security policies as `pg_policies` reports them (`qual`/`withCheck` = the expression texts with each whitespace run collapsed to one space); `[]` when no database has a policy (MySQL and SQLite have none).
- **`routes.jsonl` values** (from the raw HTTP response, as the G4 crawl fetches it; refactor § 1 normalisation tokens applied first): `url` the absolute requested URL; `status` the first response's status (redirects not followed); `location` the absolute resolved `Location` URL, or `null`; `robots` the lower-cased union of the `<meta name=robots>` and `X-Robots-Tag` directives, de-duplicated, sorted, comma-joined (`""` when none); `canonical` the absolute URL of `<link rel=canonical>`, else of a `Link: <…>; rel=canonical` header, else `""`; `title`, `description` (`<meta name=description>`), `h1` (the first `<h1>`) as NFKC, whitespace-collapsed text, `""` when absent; **normalised main text** = the text content of the first `<main>` (of `<body>` when there is no `<main>`), NFKC, whitespace-collapsed, with `<time>` elements and visible dates (04 § 15) removed; `mainTextHash` = `sha256:` of the full normalised main text; `mainText` = its first 20,480 UTF-8 bytes, cut back to a code-point boundary; `jsonld` the array of the page's parsed `application/ld+json` blocks in document order, each stored as its JCS string (unparsable blocks stored as `null`); `links[]` the absolute same-origin `a[href]` URLs without fragment, de-duplicated and sorted by bytes; `kind` per the programmatic inventory (`family`/`hub`), else `page`.
- **`flows.jsonl` step values:** `texts[]` = the NFC whitespace-collapsed text matched by each `expectText` of that step (`[]` for other steps); `api` = `{ status, body }` for an `expectApi` step, `body` normalised as in *Body normalisation*; `db` = the result rows of an `expectDb` step (§ 10 value rules); `thirdParty[].event` = the event name recognised by ruleset `analytics-vendors` or `ux.analyticsMatchers` (refactor § 2), absent otherwise.

A remote baseline (`baseline --from-remote <origin>`, REF-010) has the same layout. Its `routes.jsonl` is built from the union of the site's sitemaps, a capped read-only crawl (`crawl.remoteMaxUrls`), `quality/data/legacy-urls.txt` and declared redirect sources, and adds the fields `source: sitemap|crawl|legacy|redirect`, `mainWords` (word count of `<main>`, REF-010 `depth`) and `images[]` (absolute image URLs of the page, collected as refactor § 2 states; REF-014). It also has `serviceworkers.jsonl` `{ scriptURL, scope }`, recorded by loading `/` and the browser sample read-only in Chromium (REF-013). It has no `api`, `db`, `flows` or `redirects.jsonl` files (the old site's redirects can't be re-read: REF-011 is `notApplicable` against a remote baseline, and old-URL coverage is REF-010's).
Signature over the manifest (which lists file hashes). `_main/` additionally holds `contracts/`, `counts.json` (routes, endpoints, flows, indexable pages), `cycles.json`; signed by a `ci` key. Absent `_main/` → rules needing it are `skipped(no-main)` with a warning; the Operator may create it locally with `baseline --id _main`.

---

## 13. Programmatic inventory and quarantine

`quality/generated/inventory/<family>.jsonl`, one JSON object per line with a `type` field:
- `page`: `{ type, family, rowId, locale, pathname, canonical, robots, title, description, h1, facts{field:{value,text,attr}}, tokens{name:text}, breadcrumbs[{name,url}], hub, related[paths], alternates{locale:url}, schema{types[], values{"<@type>":{"<property>":value}}} (values: programmatic PCF-003), lastmod (from the family's lastmodField), previousSlugs[], wave }`
  `attr` is the field's canonical machine value (programmatic TPL-003), which the app renders verbatim as `data-value`.
- `hub`: `{ type, locale, hub, group, page, pages, pathname, canonical, robots, title, description, h1, items[paths], parent, lastmod? }`
  Hub `lastmod`: the greatest `lastmod` among the `page` lines in `items`; absent when `items` is empty (programmatic § 6 *Hub `lastmod`*).
- `static`: `{ type, pathname, canonical, robots, lastmod? }` for declared static paths included in sitemaps.
- **Serialisation:** each line is the JCS serialisation of its object; lines are sorted by (`type`, `locale` (absent = empty string), `pathname`) in byte order, then by `page` (absent = 0) numerically (query-style hub pages share a `pathname`); the file ends with `\n`. G2 compares files byte for byte; any difference is `stale`, with the first 20 differing `pathname`s as evidence.

G2 regenerates the inventory into `quality/out/inventory/` and compares: a committed inventory that differs from the data is an Operator-owned finding (`stale`). Agents may run `inventory` (licence-free); byte-identical output is not a violation. Quarantine: `quality/out/quarantine.jsonl`. The fixture pass (programmatic § 7) writes a separate inventory to `quality/out/fixtures/inventory/<family>.jsonl`; the app reads inventory files from the directory in `SHIPGATE_INVENTORY_DIR` when that variable is set, else from `quality/generated/inventory/`.

---

## 14. API examples, released contracts, ownership fixtures, jobs

- **Examples** — `quality/contracts/examples/<service>/*.json`: `{ id, request: { method, path, headers?, query?, body?, account? }, expect: { status, jsonPath?: { "$.x": value }, schemaRef? } }`. `schemaRef`: a JSON pointer written as a URI fragment (RFC 6901, e.g. `#/components/schemas/Post`) into the contract API-002 validates the service against; the response body must validate against that schema (API-002). Absent → the schema the contract declares for the request's operation, response status and media type.
- **Released contracts** — `quality/contracts/released/<service>/<semver>/openapi.json` or `openapi.yaml` (OpenAPI 3.0 or 3.1; exactly one per version, else CFG-006); "latest" = highest semver. Breaking-change declarations: `quality/contracts/released/<service>/CHANGES.md`, sections `## <semver>`, each with lines `- removed: <METHOD> <path>[ <jsonPath>]` or `- changed: <METHOD> <path>[ <jsonPath>]` (`path` as written in the OpenAPI `paths` key); other lines are ignored.
- **Ownership fixtures** — `quality/fixtures/ownership.json`: `{ "resources": [ { "pattern": "web:/api/invoices/{id}", "param": "id", "owners": { "userA": ["inv_1","inv_2"], "userB": ["inv_9"] }, "writeBody": { "amount": 1 } } ] }`. Without it, ids are harvested: for each `owner`-scoped pattern, the matching list endpoint (same path minus the last `{param}` segment, `GET`) is called as each account; ids are read from `$..id` (or the contract's id field) of the response. Write probes use `writeBody`, or a contract example body, else the write part is `notConfigured`.
- **Business facts** — `quality/data/business.json` (Operator-owned, signed with the lock): `{ name, legalName?, phones: [{ e164, label }], emails: [], locations: [{ id, name, address: { street, locality, region, postalCode, country }, geo?, phone, hours: [{ days: ["Mo"…], opens, closes }], pagePath, gbpUrl? }], prices: [{ id, label, amount, currency, kind?: "item"|"fee" (default item), feeType?: "mandatory"|"delivery"|"optional" (fees only; default mandatory; PRV-026 `drip`), recurring?: "month"|"year", providerId? }], ratings: [{ source, value, best?, count, asOf }], claims: [{ id, text, value?, source, evidence? }], testimonials: [{ text, author, source, consentedOn }], people: [{ name, role, pagePath? }], certifications: [{ name, issuer, evidence, validUntil? }], clients: [{ name, url? }], press: [{ name, url? }], manufacturers: [{ id, name, address, contact, country, euResponsible?: { name, address, contact } }], legal: { registerNumber?, vatId?, representative?, mailOrderNumber?, icpNumber?, psbNumber?, registeredOffice?, registerCountry?, host?: { name, address, phone }, publicationDirector?, cnpj?, grievanceOfficer?: { name, designation, email?, phone? }, dpo?: { name?, email }, abn? }, terms?: { returns?: { windowDays, free? }, refunds?: { processingDays }, warranty?: { months }, guarantee?: { days }, shipping?: [{ id, region, minDays, maxDays, free?, freeOver?: { amount, currency } }], trial?: { days, cardRequired }, cancellation?: { noticeDays, anytime? }, support?: { responseHours }, sla?: { uptimePercent } }, offers: [{ id, label, endsAt }], postalAddress?, founded?, socialProfiles: [] }`. Value formats: `opens`/`closes` `HH:MM` 24 h in the location's local time; `days` from `Mo Tu We Th Fr Sa Su`; `amount` a decimal string in major units (`"19.90"`); `currency` ISO 4217; every `address` (incl. `manufacturers[].address` and `euResponsible.address`) has the `locations[].address` shape, `country` ISO 3166-1 alpha-2; `manufacturers[].contact` and `euResponsible.contact` an email address or absolute URL (PRV-025); `feeType` only on `kind: "fee"` entries (else CFG-001); `e164` E.164; `founded` `YYYY`; `socialProfiles` absolute URLs; `ratings.value` on the scale given by `best` (default 5); `asOf`, `consentedOn`, `validUntil` `YYYY-MM-DD`; `endsAt` RFC 3339; `geo` = `{ lat: number (−90..90), lon: number (−180..180) }`; `locations[].phone` an E.164 string equal to an `e164` of `phones[]` (else CFG-001); `hours`: a day may appear in several entries (split shifts), a day in no entry is closed, `closes` earlier than `opens` means closing after midnight (the interval belongs to the opening day), `closes: "24:00"` means midnight; `claims[].value` a string or number, `claims[].source` and `testimonials[].source` non-empty free text, `claims[].evidence` and `certifications[].evidence` an absolute URL or a repo path; `clients[].url`, `press[].url` absolute URLs; `legal.registeredOffice` and `legal.host.address` have the `locations[].address` shape; `legal.registerCountry` is ISO 3166-1 alpha-2 or an ISO 3166-2 subdivision code (e.g. `GB-ENG`); `legal.host.phone` and `legal.grievanceOfficer.phone` are E.164; `legal.grievanceOfficer` needs `email` or `phone` (else CFG-001); `legal.dpo.email` and `legal.grievanceOfficer.email` are email addresses; the other `legal` values (`registerNumber`, `vatId`, `representative`, `mailOrderNumber`, `icpNumber`, `psbNumber`, `publicationDirector`, `cnpj`, `abn`, `host.name`, `grievanceOfficer.name`/`designation`, `dpo.name`) are non-empty strings, written as the page must show them (PRV-022, PRV-030, PRV-033, PRV-034, PRV-035); `terms` (UX-023): `windowDays`, `processingDays`, `months`, `days`, `minDays`, `maxDays`, `noticeDays`, `responseHours` non-negative integers, `minDays` ≤ `maxDays`, `free`, `cardRequired`, `anytime` booleans, `shipping[].id` unique, `shipping[].region` non-empty free text, `freeOver.amount`/`currency` as in `prices[]`, `sla.uptimePercent` a decimal string in 0–100 (`"99.9"`). `emails` entries are email addresses. Required: `name` (absent → CFG-001); every other key is optional: an absent list key is `[]` and an absent object key means none exist. Keys not shown in the shape above (other than `formatVersion`, `$schema`, § 1) → CFG-001. A missing key means "none of these exist", so UX-013/014/019/023 report any such content on the site as a blocking finding (04 § 1.2 facts-oracle rules).
`postalAddress` has the same shape as `locations[].address` and is compared with LOC-001's normalised containment (PRV-022 `imprint`, OPS-005 `postal`); `manufacturers[].address` and `euResponsible.address` are compared the same way (PRV-025), and so are `legal.registeredOffice` and `legal.host.address` (PRV-030). LOC-001/003, SCH-007 (matched by `pagePath`) and UX-003/004 compare rendered pages against this file.
- **Webhook fixtures** — the JSON file, or every `*.json` file of the directory (path byte order), at the route's `fixture` path (`security.routes`), which must lie under `quality/fixtures/webhooks/` (else CFG-001): raw provider event bodies (as the provider sends them). shipgate signs them with `secretVar` per the route's `scheme` for SEC-026/049 probes.
- **Merchant feed** — the file at search-engines `merchantFeed`: RSS 2.0/Atom with the `g:` namespace, or TSV with a header row. Fields read: `id`, `link`, `price`, `sale_price`, `sale_price_effective_date` (ISO 8601 interval `start/end`), `availability`, `gtin`, `item_group_id` (SE-113), and the `country` of each `shipping` value (`g:shipping/g:country` in XML; the first `:`-separated field of the TSV `shipping` column) (PRV-029). A missing or unparsable file is a blocking `parse-error` finding owned by `builder`, reassigned to `operator` only when the path lies outside the Builder's `writeScope` (04 § 15 *Owners of BLOCKED gates*; SE-113). Only a feed under `quality/data/` (a lock input) is an Operator-owned source (§ 8); elsewhere UX-020 `stock` must not use it as a `feed` source.
- **Payment-page scripts** — `quality/data/payment-scripts.json` (Operator-owned, locked): `{ formatVersion, scripts: [{ url, purpose, justification, approvedBy, integrity? }] }`. `url`: an absolute URL; `*` in the host matches any characters except `.` (one label); `*` in the path matches any characters except `/` (within one segment, dots allowed); `**` as the last path segment matches the rest of the path; fixtures: `https://cdn.example.com/*.js` matches `https://cdn.example.com/app.js`, not `https://a.cdn.example.com/app.js` nor `https://cdn.example.com/js/app.js`; query and fragment are ignored; no wildcard → exact match. This is the PCI DSS 4.0.1 6.4.3 script inventory that SEC-063 reads.
- **Image sources** — `quality/data/image-sources.json` (Operator-owned, locked; an Operator-owned source, § 8): `{ formatVersion: 1, images: [{ match, origin: "own"|"generated"|"licensed"|"cc"|"free-stock", licence, evidence, attribution? }] }`. `match`: a § 2.2 glob over the image URL's host and path (no scheme, no query, e.g. `example.com/img/**`), or `sha256:<64 lowercase hex>` equal to the SHA-256 of the image response body; the first matching entry applies. `licence` a non-empty string; `evidence` an absolute URL; `attribution` a non-empty string. UX-024 reads it.
- **Agentic feeds** — files at search-engines `agenticFeeds[].path`. The type is taken from the extension: `.json`/`.jsonl` (JSON), `.csv`/`.tsv` (delimited) or `.xml` (XML; items located by the XPath 1.0 `items` value of the kind's `agentic-feeds.json` mapping). A missing or unparsable file is a blocking `parse-error` finding owned as for the merchant feed (SE-114). Fields are read through the ruleset `agentic-feeds.json` mapping for the `kind`, or `fields` for `kind: "other"` (SE-114).
- **Field data** — `quality/data/crux/<host>.json` (Operator export, one per production host): a CrUX API `queryRecord` response or an array of them (PRF-020).
- **Dictionary** — `quality/data/dictionary.txt`: one word per line, UTF-8 (CQ-007).
- **Legacy URLs** — `quality/data/legacy-urls.txt` (Operator-owned): one absolute URL or path per line, `#` for comments. Typical sources are the old sitemap, a Search Console pages export or a backlink export. REF-010 reads it.
- **Page approvals** — `quality/approvals/pages-<n>.json` (written by `approve pages`): `{ formatVersion, paths: [], aiProvenance: { model?, promptVersion?, reviewedBy, reviewedAt }, disclosure: bool, expires, signedBy, signature }`. `<n>` = 1 + the highest existing number (1 when none). `paths`: URL patterns (§ 2.1). `disclosure`: `true` when the approved pages carry the AI-content disclosure (default `false`). `expires`: `YYYY-MM-DD`, required; an expired approval is ignored. `reviewedAt`: RFC 3339. The signature covers the JCS of all other fields, and `approve pages` re-locks, so approvals are also lock inputs (§ 8). CQ-006 accepts only approvals with a valid Operator signature.
- **Launch-form confirmations** — `quality/approvals/launch-forms.json` (Operator-written, a lock input through `quality/approvals/**`, § 8): `{ formatVersion, forms: [{ key, result: "arrived"|"failed", confirmedOn: YYYY-MM-DD, note?: string }] }`. `key` is the UX-022 form key `<flow id>#<step index>→<outcome>` (step index of the submitting step per § 10; `<outcome>` is exactly one of `email:<to>`, `egress:<host>`, `db:<db>`); keys are unique (duplicates → CFG-001). The report lists every current form key without an entry (UX-022). `quality/audit/review.json` never substitutes for it (Auditor-written).
- **Jobs** — `data-api.jobs[]`: `{ service, name, schedule?, run: "<command>", writes: ["table", …] }`; JOB-002 runs `run` twice on one instance and compares `writes` tables.

---

## 15. Agent-side and state files

- **`quality/out/handoff.json`** (Verifier): `{ formatVersion, treeHash, verdict: "PASS"|"PARTIAL"|"FAIL"|"BLOCKED", reason: <04 § 1.9 reason: exhausted|operator-owned|budget|tool-error|reduced-environment|planned|break-glass|unverified-stop>, findings: [report finding objects (§ 17)], attempts: [{ evidenceHash, groupKey, attempts: int }], decisionsNeeded: [{ owner: "operator", kind: "missing-input"|"baseline"|"licence"|"budget"|"coverage"|"finding"|"environment"|"lock", input?, rule?, message }] }`. `kind: "environment"` = an operator-owned `BLOCKED` environment cause (toolchain, ports, database engine, `seed-contract`; 04 § 15 *Owners of BLOCKED gates*); `kind: "lock"` = an unsigned, mismatched or untrusted lock (01 § 5.3). `kind: "budget"` appears only for `BLOCKED(budget)` gates owned by `operator` (04 § 8, DECISIONS D-001). Authoritative copy inside the sealed record.
- **`quality/out/break-glass.sig`** (Operator): `{ formatVersion, treeHash, expiresAt: RFC 3339, nonce: base64(16 bytes), reason, signedBy, signature }`; signature over the JCS of the object without `signature`.
- **`quality/proposals/dependencies.json`** (Builder): `{ formatVersion, items: [{ ecosystem: "npm"|"pypi"|"cargo"|"go"|"composer"|"rubygems"|"maven"|"nuget", name, version (exact, as resolved in the lockfile), reason, licence (SPDX expression), installScripts: bool }] }` (SEC-053 requires `installScripts: true` for every new package with install scripts); copied into the report; manifest/lockfile changes must match it on (`ecosystem`, `name`, `version`) (AGT-009).
- **`quality/proposals/waiver-requests.json`** (Builder/Auditor): `{ formatVersion, items: [{ rule, part?, scope (Waiver `scope`, § 3.4), reason, requestedBy, evidenceHash }] }`.
- **`quality/proposals/**`** (Planner): policy fragments, flows, contracts for Operator review.
- **`quality/audit/review.json`** (Auditor): `{ formatVersion, items: [{ rule, target, result: "pass"|"fail", note }] }`.
- **State dir** (`<state dir>/shipgate/<repo-id>/`, outside the repo; `<state dir>` per § 7.3; `<repo-id>` per 04 § 15 *repo-id*; each worktree gets its own id): `attempts.json`, session snapshots, `verdicts/` (sealed records), `fetches/` (session fetch store, below).
- **Session fetch store** (Verifier; CQ-010): `<state dir>/shipgate/<repo-id>/fetches/<sessionId>.jsonl`, one line per document the agent fetched, written by the post-hook from `post-tool` events with `tool: "fetch"` (§ 16, 05 § 3.3): `{ url, host, kind: "web-fetch"|"web-search"|"browser", fetchedAt: RFC 3339, textHash: sha256:<hex of the stored text>, text }` (`kind` from the § 16 mapping). `host` = the URL's host lower-cased (`""` for search results without a URL). `text` = the text the host reported to the agent, NFC, capped at 200,000 characters per document (longer text truncated; `textHash` over the stored text). A document whose `textHash` already occurs in the session file is not written again. The store is capped at 50 MB per repo-id; when a write would exceed it, whole session files are deleted oldest `fetchedAt` first (never the current session's); each deletion appends `{ sessionId, evictedAt: RFC 3339, bytes }` to `fetches/evictions.jsonl`, and the next report lists it under `warnings` (`fetch-store-evicted`). The store never leaves the device (05 § 9). A session whose host reports no fetches (03 § 16 table) has no file.

---

## 16. Normalised hook events

Every host adapter maps its payload to: `{ host, event: "session-start"|"prompt"|"pre-tool"|"post-tool"|"stop", tool: "edit"|"write"|"shell"|"read"|"fetch"|"mcp"|"other", paths[], command?, prompt?, fetched?: [{ url, kind: "web-fetch"|"web-search"|"browser", text }], sessionId, stopRepeated: bool, role }`. `host` is a host id (05 § 3.3). `role` comes from the installed hook config (`hooks install --role builder|planner|auditor`). `paths` are made repo-relative (§ 1) and resolved per § 2.2; paths outside the repo are kept absolute. `fetched` is set only on `post-tool` events with `tool: "fetch"`; the post-hook appends each entry to the session fetch store (§ 15). `stopRepeated` is `false` where the table gives no source; it is informational (logged in the session summary): the stop loop guard (04 § 8.1) counts blocked stops itself and never trusts it. The payload is read as JSON from stdin; git hooks have no payload. An unparseable payload, or a field the table names that is missing, makes the hook answer with the host's deny/block signal (pre-tool, stop) or a warning (other events), never a silent allow.

**Host mappings** (to be confirmed by WP-101, which updates this table and 05 § 3.3 statuses):

| Host | Events → `event` | Tool name → `tool` | `paths`, `command`, `prompt`, `fetched` | `sessionId`, `stopRepeated` |
|---|---|---|---|---|
| `claude-code` | `hook_event_name`: SessionStart → session-start; UserPromptSubmit → prompt; PreToolUse → pre-tool; PostToolUse → post-tool; Stop → stop | `tool_name`: `Edit`, `MultiEdit`, `NotebookEdit` → edit; `Write` → write; `Bash` → shell; `Read`, `Grep`, `Glob` → read; `WebFetch`, `WebSearch` → fetch; `mcp__*` → fetch when listed in ruleset `fetch-tools.json`, else mcp; else other | `paths` from `tool_input.file_path`, `tool_input.notebook_path`, `tool_input.edits[].file_path`, and for `Grep`/`Glob` `tool_input.path`; `command` = `tool_input.command`; `prompt` = `prompt`; `fetched`: WebFetch `{ url: tool_input.url, kind: "web-fetch", text: tool_response }`, WebSearch `{ url: "search:" + tool_input.query, kind: "web-search", text: tool_response }`, `fetch-tools.json` tools `kind: "browser"` | `session_id`; `stop_hook_active` |
| `codex` | SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Stop as for claude-code | `Bash` → shell; `apply_patch` → edit; else other | `paths` parsed from the patch headers `*** Add File:`, `*** Update File:`, `*** Delete File:`, `*** Move to:`; `command` = `tool_input.command`; no fetches reported | `session_id`; `stop_hook_active` |
| `cursor` | sessionStart → session-start; beforeSubmitPrompt → prompt; preToolUse, beforeShellExecution → pre-tool; afterFileEdit → post-tool; stop → stop | beforeShellExecution → shell; afterFileEdit → edit; preToolUse by `tool_name` as for claude-code | `paths` = `file_path`; `command` = `command`; `prompt` = `prompt`; no fetches reported | `conversation_id`; `loop_count > 0` |
| `opencode` | `tool.execute.before` → pre-tool; `tool.execute.after` → post-tool; `session.idle` → stop | `tool`: `edit`, `patch` → edit; `write` → write; `bash` → shell; `read`, `grep`, `glob`, `list` → read; `webfetch` → fetch; else other | the generated plugin writes `{ event, tool, args, output, sessionID }` to stdin: `paths` from `args.filePath`; `command` = `args.command`; `fetched`: `{ url: args.url, kind: "web-fetch", text: output }` | `sessionID`; `false` |
| `antigravity` | PreInvocation → prompt; PreToolUse → pre-tool; PostToolUse → post-tool; Stop → stop | `run_command` → shell; `edit_file`, `replace_file_content` → edit; `write_to_file` → write; `view_file` → read; `read_url_content`, `search_web` → fetch; else other | `paths` = `tool_input.TargetFile`; `command` = `tool_input.CommandLine`; `fetched`: `{ url: tool_input.Url, kind: "web-fetch", text: tool_response }` (`search_web`: `{ url: "search:" + tool_input.query, kind: "web-search", … }`) | `session_id`; `false` |
| `git` | `pre-commit` → pre-tool; `pre-push` → stop | pre-commit → write | `paths` = staged files (`git diff --cached --name-only -z`); no fetches | `git-<HEAD commit>`; `false` |

Ruleset `fetch-tools.json`: `[{ host: <host id>, tool: <regex over the tool name>, url: <JSON pointer into the tool input>, text: <JSON pointer into the tool response> }]` for MCP browser/fetch tools (e.g. Playwright or Chrome MCP navigate and page-text tools).

**Hook output** (what `shipgate check --hook` writes back; `<text>` = the message, UTF-8, ≤ 8,000 characters, truncated with `…`). WP-101 confirms each row against the current host version and records the exact bytes; a host row whose three columns aren't all confirmed is reported as "reduced enforcement" (05 § 3.3). Every row has a conformance test that feeds a recorded host payload and asserts the exact stdout bytes and exit code.

| Host | Allow | Deny (pre-tool) / block (stop) | Context (session-start, prompt, post-tool) |
|---|---|---|---|
| `claude-code` | exit 0, stdout `{}` | pre-tool: exit 0, stdout `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"<text>"}}`; stop: exit 0, stdout `{"decision":"block","reason":"<text>"}` | exit 0, stdout `{"hookSpecificOutput":{"hookEventName":"<SessionStart\|UserPromptSubmit\|PostToolUse>","additionalContext":"<text>"}}` |
| `codex` | exit 0, stdout `{}` | as `claude-code` (`permissionDecision: "deny"`; stop `decision: "block"`) | as `claude-code` (`additionalContext`) |
| `cursor` | exit 0, stdout `{"permission":"allow"}` (pre events), `{}` otherwise | pre-tool: stdout `{"permission":"deny","agent_message":"<text>"}`; stop: stdout `{"followup_message":"<text>"}` | `{"agent_message":"<text>"}` where the event accepts it; otherwise none |
| `opencode` | the generated plugin returns normally | `tool.execute.before`: the plugin throws `Error("<text>")`; `session.idle`: the plugin sends `<text>` as a message through the SDK client | message through the SDK client |
| `antigravity` | exit 0, stdout `{}` | stdout `{"decision":"deny","reason":"<text>"}` | PreInvocation: stdout `{"additionalContext":"<text>"}` |
| `git` | exit 0 | exit 1, `<text>` on stderr | — (stderr only) |

---

## 17. Report — `quality/out/report.json` (+ SARIF, JUnit, summary.md)

```jsonc
{ "formatVersion": 1, "specVersion": "7.6.0", "ruleset": "2026.10", "verifierVersion": "1.0.0",
  "mode": "verify", "profile": "default", "treeHash": "sha256:…", "verdict": "FAIL",
  "lock": { "valid": true, "signedBy": "ed25519:…", "digest": "sha256:…" },
  "services": [{ "id": "web", "adapters": ["next-app","supabase"], "coverage": "full", "framework": "next@16.0.1" }],
  "coverage": { "web": { "applied": 230, "notApplicable": 41, "noAdapterSupport": 0, "skipped": 3, "notConfigured": 1, "blocked": 0, "experimental": 6,
                         "rules": [ { "id": "SEC-043", "outcome": "notConfigured", "input": "security.realtime.channels" } ] } },
  "gates": [{ "id": "G4", "status": "FAIL", "durationMs": 81234, "log": "quality/out/logs/G4.txt", "cache": "miss" }],
  "findings": [{ "rule": "SEC-021", "part": "main", "severity": "P0", "status": "blocking", "gate": "G4", "channel": "http",
    "failureClass": "access-allowed", "count": 3, "absorbed": [],
    "groupKey": "web:/api/invoices/{id}|access-allowed",
    "examples": [{ "target": "GET web:/api/invoices/inv_123 as anonymous", "expected": "401|403", "actual": "200 + body",
                   "file": "apps/web/app/api/invoices/[id]/route.ts" }],
    "fixLocation": "apps/web/app/api/invoices/[id]/route.ts", "owner": "builder",
    "fix": "Call the auth guard before reading data in every handler under a protected route.", "evidenceHash": "sha256:…" }],
  "debt": { "total": 41, "matched": 41, "new": 0, "expiringSoon": [] },
  "warnings": [], "waiversApplied": [], "overridesActive": [], "dependenciesAdded": [], "auditTargets": ["web:/blog/{slug}", "apps/web/app/page.tsx"], "handoff": null }
```
- **Finding fields:** `part` string (default `main`, 04 § 1.8); `failureClass` from 04 § 9.1; `channel` the channel (04 § 1.1) whose detector emitted it; `absorbed` the rule ids (or `RULE#part`) whose findings merged into this one under 04 § 9.4 *Dedupe*, sorted by bytes, `[]` when none. **`warnings`:** `[{ code: kebab-case string, message, rule?, path? }]`, sorted by (`code`, `path`) (codes used in this spec: `pack-disabled`, `fetch-store-evicted`, `unused-allowance`, `trailing-slash-assumed`, `host-directive-unsupported`, `foreign-output`, `generated-file-not-ignored`, `build-modified-tracked-file`). **`coverage.<service>`:** one count per 04 § 1.2 outcome (`applied`, `notApplicable`, `noAdapterSupport`, `skipped`, `notConfigured`, `blocked`), plus `experimental` = the number of `rules` entries with `experimental: true`; `rules` lists every rule evaluated for that service, sorted by `id` (bytes), one `{ id, outcome, reason?, input?, experimental?: true }` each: `outcome` one of the six outcomes; `reason` (the text inside the parentheses, e.g. `no-main`, `prerequisite: G6`) present for `skipped` and `blocked` only; `input` for `notConfigured` only; `experimental: true` when the rule's lifecycle or an `experimental-on` override makes its findings `experimental`. The six counts are the counts of `rules` entries by `outcome`. **`debt.expiringSoon`:** `[{ kind: "debt"|"waiver", rule, part (`null` for a waiver without `part`), expires }]`, sorted by (`expires`, `rule`). **`handoff`:** `null`, or `{ reason, decisionsNeeded }` as in `handoff.json` (§ 15). **`waiversApplied`:** `[{ rule, part, scope, expires, findings: int }]`. **`overridesActive`:** `[{ rule, state, expires, fpReport? }]`. **`dependenciesAdded`:** the `items` of `quality/proposals/dependencies.json` (§ 15).
- **`auditTargets`:** up to 20 route-group ids and changed-file paths, drawn with the lock-digest PRNG (04 § 15, stream id `audit-targets`, candidate key = the route-group id or the changed-file path) from their union (all when fewer); the Auditor writes one `review.json` entry per (applicable `review`-channel rule, target) pair, with `rule` = that rule id and `target` = that value (01 § 10.2). `auditTargets` also lists, after the drawn ones and outside the 20, every LOC-004 target `<location id>@<engine>` and every DAT-018 target `source:<id>`; the Auditor answers each of these for that rule only.
- **Output files:** `verify` and `check` (outside hook mode) always write `quality/out/report.json`, `quality/out/report.sarif`, `quality/out/report.junit.xml` and `quality/out/summary.md`; `--format` selects only what is printed to stdout.
- **Vocabularies:** `mode`: `verify|check|adopt`; `owner`: `builder|operator`; finding `status` per 04 § 1.3; `gates[].status` per 04 § 1.4; `gates[].cache`: `hit` (result reused; only for the same environment hash, 04 § 16, DECISIONS D-002), `miss`, `off` (`--no-cache`); `debt.expiringSoon`: debt items and waivers whose `expires` is within 14 days of the run (01 § 5.4).
- **SARIF 2.1.0** (P0/P1 → error, P2 → warning, W → note) contains every finding; `debt`, `waived` and `experimental` findings carry `suppressions: [{ kind: "external", justification }]` (the debt fingerprint, waiver reason or "experimental"). One `result` per finding: `ruleId` = rule id; `level` per the severity map; `message.text` = `<examples[0].actual> — <fix>`; `locations[0].physicalLocation.artifactLocation.uri` = `fixLocation`, else `examples[0].file`; with neither, `locations[0].logicalLocations[0].name` = `examples[0].target`; no `region`; `partialFingerprints.shipgateEvidenceHash` = `evidenceHash`; `properties` = `{ part, groupKey, owner, gate, status }`. One run: `runs[0].tool.driver` = `{ name: "shipgate", version: <verifierVersion>, rules: [{ id, shortDescription: { text: <rule title> }, help: { text: <rule fix> }, defaultConfiguration: { level: <severity map> } }] }` with one `rules` entry per rule that has a finding, sorted by `id`; no `informationUri`.
- **JUnit:** one testcase per rule × service (`classname` = pack, `name` = `<rule> <service>`); `failure` when the rule has a `blocking` or `exhausted` finding; `skipped` for `notApplicable`, `noAdapterSupport` and `skipped(*)`; `error` for `notConfigured` and `blocked(*)`; otherwise passed. A `failure` element has `message` = the first failing finding's `groupKey` and body = its first example as `target`, `expected` and `actual` lines.
- **`summary.md`:** verdict line, gate table, the first 20 findings by 04 § 9.4 ranking, the handoff reason if any.

---

## 18. Rollout state and indexing exports

- **`quality/rollout/<family>.json`** (Operator-signed with the lock): `{ formatVersion, family, waves: [ { index, rowIds[], releasedAt, evidence: { exportFile, exportSha256, indexRate, measuredAt } } ] }`. `rollout release` appends the next wave after checking ROL-003.
- **`quality/data/indexing/<family>.csv`** (Operator-provided Search Console export): columns `url,coverageState,lastCrawled`; a URL counts as indexed when `coverageState`, after trim and case-fold, is listed for the export's locale in ruleset `gsc-indexed-states.json` (`{ <locale>: [label] }`). The header row must be exactly `url,coverageState,lastCrawled` (names case-insensitive; extra columns after these ignored), else a blocking `parse-error` finding of ROL-003 owned by `operator`. The export's locale is the first locale, in `gsc-indexed-states.json` key order, for which at least one row's `coverageState` (trimmed, case-folded) is listed; when no row's state is listed for any locale → `notConfigured(indexing-export-locale)` for ROL-003.

## 19. Toolchain manifest (inside each shipgate release)

`{ formatVersion, items: [{ name, version, platform, url, sha256, size, licence, purpose, refresh?, unpackTo, requires: [] }] }`. `platform`: `windows-x64|windows-arm64|macos-arm64|macos-x64|linux-x64-gnu|linux-arm64-gnu|linux-x64-musl|linux-arm64-musl|any`. `purpose`: `tool|browser|database|grammar|data`. Data snapshots are entries with `purpose: "data"` and `refresh: "fetch"`: `fetch` downloads the current `snapshots.json` of the same release channel (signed with the vendor release key compiled into the binary, signature per § 7.1 encodings) and checks each snapshot's `sha256` against it. **`snapshots.json`:** `{ formatVersion, release: <verifier version>, channel: "stable"|"beta", items: [{ name, version, url, sha256, size }], signature }`; `signature` = base64 Ed25519 (vendor release key) over the JCS of the object without `signature`. A bad signature, or a `release` ≠ the running binary's version → `fetch` exits 3 and no snapshot is replaced. **Archives:** by the URL's extension — `.zip`, `.tar.gz`, `.tar.xz`, otherwise a single file stored as is; `unpackTo` is a relative path under `<cache.dir>/toolchain/<toolchain-manifest sha256 hex>/` (§ 7.3); an archive entry that would unpack outside it (absolute path, `..`, symlink escaping) rejects the whole download. `size` = bytes of the download. With a mirror (`SHIPGATE_MIRROR` or config `mirror`), every download URL becomes `<mirror>/<sha256 hex>/<basename(url)>`; the `sha256` check is unchanged. npm packages are fetched from the npm registry by exact version and integrity hash at `fetch` time, not shipped inside the release (05 § 8). The entries cover the data snapshots refreshed by `fetch` (OSV database; npm `deprecated` metadata for packages in the project's lockfiles only — other ecosystems' deprecation status is reported as unknown/W) for portable Node, Playwright + browsers, Lighthouse, axe-core, web-vitals, OSV-Scanner + database snapshot, PostgreSQL/MySQL (with `extensions[]`), PostgREST, Supabase Auth, Supabase schema DDL, the Firebase emulator suite with its JRE (for the platforms where a build exists; DB-011 `emulator`), tree-sitter grammars.
