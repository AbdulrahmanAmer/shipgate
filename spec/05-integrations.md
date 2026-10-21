# shipgate — 05 Integrations, CLI and product

> CLI surface, onboarding, protected/deny lists, agent-host hooks, MCP, CI, versioning, releases, licensing, telemetry. Load when building the CLI shell, installers, hooks or release tooling.

---

## 1. CLI surface

Global flags: `--repo`, `--service <id>` (repeatable), `--format text|json|sarif`, `--quiet`, `--no-color`, `--no-cache`.
Precedence for **operational settings** (output format, colour, cache, mirror, proxy, licence path, update channel and check): flags > env > user config (03 § 7.3) > built-in defaults. Env names: `SHIPGATE_FORMAT` (`text|json|sarif`), `SHIPGATE_NO_COLOR` (`1`; `NO_COLOR` is honoured too), `SHIPGATE_NO_CACHE` (`1`), `SHIPGATE_CACHE_DIR`, `SHIPGATE_MIRROR`, `SHIPGATE_PROXY`, `SHIPGATE_LICENCE` (path to the licence file), `SHIPGATE_UPDATE_CHANNEL` (`stable|beta`). `quality/policy.json` holds no operational settings. Other `SHIPGATE_*` variables are inputs, not settings: `SHIPGATE_TRUSTED_KEYS`, `SHIPGATE_CI_SIGNING_KEY`, `SHIPGATE_CI_TOKEN` (CI, § 5, § 8), `SHIPGATE_ACCOUNT` and `SHIPGATE_ACCT_*` (verify env, 03 § 4).
- Flags and env vars can never override a signed policy key, such as budgets, coverage, thresholds, packs or reduced mode.
- `--gate`, `--pack`, `--service` and `--changed` only narrow the scope, so those runs are partial (04 § 1.6).
- **Flag values.** List-valued flags (`--paths`, `--routes`, `--tags`, `--gate`, `--pack`, `--service`, `--family`, `--surface`, `--fingerprint`) are repeatable, one value per occurrence, never comma-split. `--gate` takes `G0`…`G9`; `--pack` a pack key; `--surface` `public|app|api|asset`; `--against` a baseline id (a directory name under `quality/baselines/`). `status --timeout` defaults to 600 (seconds).
- **`check`.** `--hook` values map to 03 § 16 events: `session` → `session-start`, `prompt` → `prompt`, `pre` → `pre-tool`, `post` → `post-tool`, `stop` → `stop`. Without `--hook`, `check [--paths <p>]…` (role `builder`) is the MCP `check` (§ 4): post-mode findings (04 § 8) for the given paths, default the files changed against the base (04 § 5), report mode `check`, exit codes as `verify`.

| Command | Who | Purpose / key flags |
|---|---|---|
| `init` | Operator | Onboarding (§ 2); `--new --kind <kinds>` for projects built from scratch (§ 2.1); `--draft` writes `quality/proposals/policy.json` without signing (Planner-safe) |
| `doctor` | anyone | Toolchain, hooks (incl. per-host enforcement level), keys, trust-store changes, lock, licence, system libraries; `--bundle` |
| `fetch` | anyone | Pre-download toolchain and offline databases; `--all-browsers` |
| `brief` | agents | `--paths --routes --service --surface --family --kind --tags`, `--stage start` (04 § 7) |
| `check` | hooks; without `--hook` agents | `--hook pre\|post\|stop\|session\|prompt --host <id> [--role <r>]`; `--paths <p>…` without `--hook` (post-mode findings, above) |
| `verify` | agents, CI | `--changed`, `--against <baseline>`, `--gate`, `--pack`, `--service`, `--profile default\|nightly`, `--resume` (04 § 15), `--detach`, `--adopt` (onboarding: NOT_CONFIGURED becomes warning). `--changed`, `--gate`, `--pack`, `--service` and `--adopt` are partial runs. They report FAIL or BLOCKED as is, turn PASS into PARTIAL, and never seal a PASS (04 § 1.6) |
| `version` | anyone (licence-free) | Binary version, ruleset versions embedded, toolchain manifest hash |
| `status` | agents | Latest result for the current tree; `--wait [--timeout <s>]`, `--job <id>` |
| `rule <ID>` | anyone | One rule's text and fix hint |
| `inventory` | anyone (licence-free) | Build programmatic inventories |
| `codegen` | Operator; `--check` anyone | Types/helpers into `quality/generated/` (generators below) |
| `approve pages` | Operator | Signs `quality/approvals/pages-<n>.json` for bulk page additions (CQ-006, 03 § 14) |
| `baseline` | Operator; `--ci` in CI | Record a baseline; `--id`; `--from-remote <origin>` records a read-only URL inventory of a live site before it is rebuilt or re-platformed and writes a signed `refactor.json` pointing at it (REF-010, 03 § 12, 04 § 1.6); `--ci` signs `_main` with the CI key (no TTY; requires CI detection + `SHIPGATE_CI_SIGNING_KEY`) |
| `debt record` / `debt add --reason` / `debt show` | Operator / Operator / anyone | Debt ratchet |
| `debt rotate <fingerprint> --on <date>` | Operator | Attests that a secret found in git history (SEC-050 `history`) was rotated. Sets the signed `rotatedOn`, which clears the item |
| `lock` | Operator | Recompute and sign the lock |
| `keys init\|trust\|export\|import` / `keys show` | Operator / anyone | Keys and trust store (03 § 7); `show` prints public keys and fingerprints only |
| `hooks install\|check` | Operator / anyone | `--host <id> --role builder\|planner\|auditor` |
| `waiver add`, `override add` | Operator | Signed with the lock |
| `break-glass` | Operator | One-stop pass for a tree hash (signed, expiring) |
| `conformance --adapter <id>` | Operator | Earn a tier for a project-local adapter |
| `rollout status\|release` | anyone / Operator | Staged publication of programmatic families (ROL-*); `release` checks wave age and index rate from the indexing export |
| `mcp` | hosts | MCP server (§ 4) |
| `migrate` | Operator; `--check` anyone | Upgrade formats/ruleset; rewrites `.shipgate-version` with the running binary's exact version (03 § 3.1 `verifier`) |
| `report-fp <evidenceHash>` | anyone | Redacted false-positive repro (below) |
| `self-update` | anyone | Within the pinned range; `--channel stable\|beta` (default: the `update.channel` setting) |

**Re-locking.** These commands recompute and sign `quality/lock.json` (03 § 8) within the same passphrase entry after writing their output: `hooks install`, `waiver add`, `override add`, `approve pages`, `debt record|add|rotate`, `baseline` (not `--ci`), `rollout release`, `migrate`. `init` signs the lock at its own `lock` steps (§ 2, § 2.1); the sub-steps inside `init` don't re-lock separately. These sign without re-locking, because their output is not a lock input: `break-glass` (`quality/out/break-glass.sig`), `conformance` (`quality/conformance/<id>.json`, 03 § 6), `keys init|trust|export|import`, `baseline --ci` (`_main`, CI role). `codegen` signs nothing. `lock` is the same operation run alone; it is a no-op when the lock is current. A re-lock that fails (e.g. CFG-001/006 on the policy) leaves the command's output written and exits 3, so the next `lock` makes the failure visible.

**Key selection:** every Operator command accepts `--key <fingerprint>` (03 § 7.1; required when the keychain holds several Operator keys).

**Operator command arguments** (dates `YYYY-MM-DD`; durations `<n>m` or `<n>h`):

| Command | Arguments |
|---|---|
| `waiver add` | `--rule <ID>[#<part>] --scope <kind>:<pattern> --reason <text> --expires <date> [--approved-by <name>]` (default: the signing key's trust-store `label`); limits per 03 § 3.4 |
| `override add` | `--rule <ID> --state off\|warn\|experimental-on --reason <text> --expires <date> [--fp-report <hash>]`; limits per 04 § 14 |
| `break-glass` | `[--tree <hash>]` (default: the current tree hash) `--expires-in <duration ≤ 24h> --reason <text>`; writes `quality/out/break-glass.sig` (03 § 15) |
| `approve pages` | `--paths <urlPattern>… --reviewed-by <name> [--model <id>] [--prompt-version <v>] [--disclosure] --expires <date>` |
| `keys trust` | `--pubkey <base64> --role operator\|ci --label <text>`; `keys show [--ci]` (with `--ci` and CI detection, prints the public key of `SHIPGATE_CI_SIGNING_KEY`, for `keys trust --role ci`) |
| `keys export` / `keys import` | `--out <file>` / `--in <file>` (03 § 7.4) |
| `debt add` | `--fingerprint <fp>… --reason <text> [--expires <date>]` (absorbs the listed current findings, 03 § 9; `--expires` ≤ 90 days ahead is required when a listed finding is of a `†` rule or part, else exit 3) |
| `conformance` | `--adapter <id> --fixtures <dir>` |
| `rollout release` | `<family>` |
| `baseline` | `[--id <id>]` (default `YYYY-MM-DD-<short commit>`), `[--from-remote <origin>]`, `[--ci]` |
| `hooks install` | `--host <id>` (repeatable; default: every detected host) `[--role builder\|planner\|auditor]` (default `builder`) |

**Generators** (`codegen`, selected by the adapters' `codegen[]`; `<ext>` = the service's primary adapter `codegenExt`, 03 § 6). Output directory `<out>`: `quality/generated/` when exactly one service has adapters with non-empty `codegen`; with several, `quality/generated/<service id>/` per service, except family types, which stay at `quality/generated/types/<family>.<ext>` (each family belongs to one service, whose `<ext>` applies; programmatic DAT-001 `types`). `url-module` → `<out>urls.<ext>` (typed builders for every declared route pattern); `safe-json-ld` → `json-ld.<ext>` (serialiser escaping `<`, `>`, `&`, U+2028, U+2029); `env-module` → `env.<ext>` (typed accessors for the variables the env module declares, server/public split); `inventory-reader` → `inventory.<ext>` (typed reader of 03 § 13 lines); `types-from-policy` → `types/<family>.<ext>` per programmatic family and `types/business.<ext>` (03 § 14). Output is deterministic (sorted keys and declarations, no timestamps). All generator file names (`json-ld.<ext>`, `env.<ext>`, `inventory.<ext>`, `types/business.<ext>`) are relative to `<out>`. Staleness: family types are checked by DAT-001 `types`; `codegen --check` (anyone, licence-free, writes nothing) exits 1 when any committed generated file differs from regenerated output.

**`report-fp <evidenceHash>`** writes `quality/out/fp-<first 12 hex of the hash>.json`: `{ formatVersion, finding: <report finding object, 03 § 17>, ruleset, verifierVersion, adapters: [id], element?: <for `html`/`http`/`browser` channels, the matched element's outerHTML capped at 2,048 bytes> }`. **`doctor --bundle`** writes `quality/out/doctor-bundle.zip` holding the `doctor` JSON, `report.json`, `policy.json`, `lock.json` and tool versions. **Redaction** (both): absolute paths → repo-relative (outside the repo → `⟦path⟧`); hosts of `production.origins` and `production.hosts` → `⟦prod⟧`; `verify.env` values and strings matching a SEC-050 provider pattern → `⟦secret⟧`; no source files, no keychain, config-dir or state-dir content. An `evidenceHash` not in the latest report → exit 3.

**Exit codes:** 0 PASS, 1 FAIL, 2 BLOCKED, 3 tool error, 4 PARTIAL — for `verify` and `check` outside hook mode. Hook mode follows host protocols (§ 3.3). Other commands:
- `verify --detach`: 0 once the job has started (job id on stdout).
- `status`: the code of the latest verdict for the current tree; 5 when there is none; 6 when `--wait` times out.
- `doctor`, `migrate --check`, `hooks check`, `codegen --check`: 0 OK, 1 problems found / changes pending.
- `debt add` with a refused finding (01 § 5.5): 2.
- Every other command: 0 success, 3 error (incl. unknown rule id, wrong passphrase, missing TTY, `already-initialised`, `verifier-range-mismatch`).
- Licence `BLOCKED (licence)` (§ 8): 2, for every licensed command.

**Operator commands** are exactly those denied by § 3.2 "shipgate Operator verbs" (the single source; 01 § 7 refers to it). They require the Operator passphrase on an interactive terminal (03 § 7.1) and are denied by the pre-hook in agent sessions. Pseudo-terminal wrappers (`script`, `winpty`, `expect`) don't help an agent because the passphrase is never stored anywhere it can read.

---

## 2. Onboarding — `shipgate init`

If `quality/policy.json` exists, `init` (with or without `--new`) changes nothing and exits 3 (`already-initialised`; use `migrate`, or `init --draft`, which writes only `quality/proposals/policy.json`).

1. Detect services/adapters (workspace-aware: pnpm/npm/yarn workspaces, Turborepo, Nx, Lerna, multi-module Python/Go/PHP).
2. Read framework config: routes, locales, trailing slash, base path, ports, host files; propose surfaces, `security.routes`, `writeScope`, `roles`, `layers`, `envModule`, `hosts` (from dependencies and config).
3. Ask the Operator only shape-deciding questions (origins, kinds, packs, minCoverage, auth strategy, databases, edge settings).
4. `keys init` if no Operator key exists (passphrase chosen here).
5. Write `quality/policy.json`, `quality/verify.env.example`, `.gitignore` entries (`quality/out/`, `quality/verify.env`), `.shipgate-version`.
6. `fetch`.
7. `hooks install` for detected hosts (role `builder` by default).
8. `lock` (signs policy and hook configs).
9. `verify --adopt`: runs every gate whose inputs exist; `NOT_CONFIGURED` becomes a warning list of what to configure.
10. `debt record`, then `lock` again (signs the debt).
11. Print the CI snippet for the detected provider and the list of unconfigured inputs.

### 2.1 New projects — `shipgate init --new --kind <kinds>`
1. Ask: project name, kinds (`marketing`, `local-business`, `saas`, `pseo`, `api`, `docs`, `ecommerce`, `news`, `ymyl`), target stack (adapter id), origin(s), jurisdictions, and whether it **replaces an existing site**.
2. Write a preset policy for the kinds with `project.stage: "new"`, packs per the table below, and planned services (CFG-009). Required pack keys (03 § 3.5) that the answers don't supply are left out and listed as unconfigured inputs, so `lock` fails CFG-001/006 until the Operator sets them.

   | Kinds | Packs and preset values |
   |---|---|
   | every kind | `web-delivery`, `search-engines`, `answer-engines`, `ux`, `security`, `privacy`, `accessibility`, `performance`, `architecture`, `resilience`, `ops`, `testing` |
   | `pseo` | + `programmatic` |
   | `saas`, `api` | + `data-api` |
   | `docs` | web-delivery `llmsTxt: "required"` |
   | `ecommerce` | search-engines `features` contains `product`, `merchant-listing`, `review-snippet`; privacy `jurisdictions` gains `eu-consumer` when the answers include `eu-gdpr`, `eu-eaa`, `de` or `at`, `uk-consumer` when they include `uk-gdpr` (order-button wording, price indication, drip pricing: PRV-023, PRV-026), `br-consumer` when they include `br-lgpd` (PRV-035), `au-consumer` when they include `au-privacy` (PRV-034, PRV-026) and `in-ecommerce` when they include `in-dpdp` (PRV-033) |
   | `local-business` | search-engines `features` contains `local-business`; the `business.json` template has one `locations[]` entry (LOC-*) |
   | replaces a site (step 4) | + `refactor` |

   Every kind gets the search-engines pack-default `features` list (03 § 3.5), which already contains the entries named above; the rows say which entries `init --new` never removes. The Operator may remove packs or `features` entries before the first `lock`. On every run, each pack this table presets for `project.kinds` that the policy doesn't enable is listed in the report's `warnings` as `pack-disabled`, so no pack is off silently. Also write templates for `quality/data/business.json` (local-business, ecommerce, marketing) and for flows per journey (contact form, signup/login, checkout).
3. `keys init` if no Operator key exists, then `fetch`.
4. If it replaces a site: run `baseline --from-remote <old origin>` now, before anything changes, and ask for `legacy-urls.txt` sources. That command writes and signs `quality/refactor.json` with the remote baseline (`goal: "replatform"`), so every `verify` runs G7 and REF-010/013/014 (REF-011 is `notApplicable` against a remote baseline, 03 § 12; 04 § 1.6). Inside `init --new`, `baseline --from-remote` does not re-lock (the policy may still fail CFG-001/006, step 2); `refactor.json` and the baseline enter the first `lock` of step 5.
5. `hooks install` and `lock` (§ 2 steps 7–8).
6. The agent's first session receives `brief --stage start` (04 § 7). While planned services exist, every `verify` is at most PARTIAL. A base PASS gives a `planned` handoff (04 § 1.9), so the agent can stop between milestones. Once every planned service exists, a full PASS is possible before launch.
7. **Launch:** the Operator sets `project.stage: "live"` and re-locks. The next full `verify` runs the launch checks (IDX-011, URL-011, REF-010) against `production.origins` once DNS points there.

---

## 3. Protection lists and agent-host hooks

### 3.1 Built-in protected paths (always, plus `policy.protected`)
- `quality/**`, except each role's own write area (`quality/proposals/**` for Builder/Planner, `quality/audit/**` for Auditor) and Verifier outputs written by shipgate itself.
- `.shipgate-version`, `.gitignore`, `.gitattributes`, `.git/**` (incl. `info/exclude`, `hooks/**`), `.husky/**`, `.pre-commit-config.yaml`, `lefthook.yml`.
- Agent-host configs, project and local variants: `.claude/**` (incl. `settings.json`, `settings.local.json`), `.codex/**`, `.cursor/**`, `.opencode/**`, `.agents/**`, `.gemini/**`, `.windsurf/**`, `AGENTS.md`/`CLAUDE.md` sections marked `<!-- shipgate -->`.
- User-level host configs (outside the repo): `~/.claude/settings.json`, `~/.codex/**`, `~/.cursor/hooks.json`, `~/.gemini/config/hooks.json`, `~/.config/opencode/**`.
- shipgate's own user directories (outside the repo): `<config dir>/shipgate/**`, `<state dir>/shipgate/**` (03 § 7.3, § 15: sealed verdicts, attempts, session snapshots, the session fetch store) and the toolchain cache `cache.dir/**` (default `<cache dir>/shipgate/**`, 03 § 7.3), so an agent can't delete the toolchain to turn G4/G6 into an operator-owned `BLOCKED`. Only shipgate writes there.
- CI: `.github/workflows/**`, `.gitlab-ci.yml`, `bitbucket-pipelines.yml`, `azure-pipelines.yml`, `.circleci/**`.
- Built-in protected JSON keys: `tsconfig*.json` `/compilerOptions/strict`, `/compilerOptions/noUncheckedIndexedAccess`, `/compilerOptions/noImplicitAny`; the JSON pointers in the adapters' `lintGates[]` and `strictness[]` (03 § 6) — for JS/TS config files (`eslint.config.*`, `.eslintrc.*`) pointers are evaluated on the exported object's literal AST, and a config whose export isn't a literal object is protected as a whole file; in every `package.json` under a service `path` and at the repo root, `/scripts/<name>` for `test`, `lint`, `typecheck`, `build`, `coverage`, and every script named in `services[].commands`.

### 3.2 Built-in denied commands (argv patterns; 04 § 8.2 resolves indirection)
**Notation:** each entry is a 03 § 2.4 `argv` pattern written space-separated (`*` alone = zero or more tokens; `a|b` alternatives and `(a|b)` groups within a token; `[!-]` character classes); `when: <predicate>` adds a condition. `{baseBranch}` is policy `baseBranch`. For `git`, config-key tokens (the value after `-c`, the `--config-env=` value, the key argument of `git config`) are compared case-insensitively. A short-flag-cluster alternative is always written as two alternatives, `-X*` (X first in the cluster) and `-[!-]*X*` (X later), because `[!-]` consumes one character. Fail-closed: a cluster with an attached value (`-mnote`) can match; agents pass values as separate tokens. Conformance fixtures that must be denied: `git push -f`, `git push -uf origin main`, `git push -d origin x`, `git commit -n`, `git commit -nm x`, `git commit -anm x`, `git branch -D main` (with `baseBranch` `main`); that must pass: `git push -u origin x`, `git commit -m x`, `git branch -d feature`.

**Predicates:**
- `prodHost` — a `-h`/`--host`/`--url`/`--path` argument, a connection URI argument, or a `PGHOST`/`MYSQL_HOST` assignment on the command resolves to a host matching `production.hosts` or the host of a `production.origins` entry (host patterns per 03 § 3.3).
- `protectedTarget` — an output redirection target (`>`, `>>`, `2>`, `*>`, `| tee`), or a path argument of `tee`, `sed -i`, `perl -i`, `truncate`, `dd of=`, `Set-Content`, `Add-Content`, `Out-File`, `New-Item`, `Copy-Item`, `Move-Item`, `Remove-Item`, `Rename-Item`, `cp`, `mv`, `rm`, `ln`, `install`, `rsync`, `chmod`, `touch`, `git checkout|restore -- <path>`, resolves (03 § 2.2 casing) to a protected path (§ 3.1) outside the session role's write scope.
- `writeApi` — the request's method and URL (from `-X`/`--request`, `-d`/`--data*`/`-F`/`--json` implying POST, wget `--method`/`--post-data`/`--post-file`, `-Method`, `-Body`; httpie's method token; otherwise `GET`) match an entry of ruleset `write-apis.json` (`[{ vendor, host: <host pattern, 03 § 3.3>, methods: [METHOD], pathPattern?: <Rust regex over the path>, productionOnly: bool }]`); `productionOnly` entries match only when the URL's host also satisfies `prodHost`. The file lists the hosted-builder publish/write APIs (Duda, Webflow, Wix, Squarespace, Shopify Admin, WordPress REST `POST|PUT|PATCH|DELETE /wp-json/`), the IndexNow endpoints (`api.indexnow.org`, `www.bing.com/indexnow`, `yandex.com/indexnow`, `searchadvisor.naver.com/indexnow`, `search.seznam.cz/indexnow`), `indexing.googleapis.com`, and any URL whose path is `/ping` with a `sitemap=` query parameter.
- `setsVerifierVar` — the command sets, exports or unsets (`VAR=… cmd`, `export`, `unset`, `set`, `$env:VAR=`, `Remove-Item Env:`, `setx`, `env VAR=…`, `env -u VAR`) a variable named `SHIPGATE_*`, `CI`, `GITHUB_ACTIONS`, `GITLAB_CI`, `BUILDKITE`, `CIRCLECI`, `TF_BUILD`, `BITBUCKET_BUILD_NUMBER`, `HUSKY`, `HUSKY_SKIP_HOOKS`, `LEFTHOOK`, `LEFTHOOK_EXCLUDE`, `SKIP` (pre-commit), `PRE_COMMIT_ALLOW_NO_CONFIG`, `GIT_CONFIG_PARAMETERS`, `GIT_CONFIG_COUNT`, `GIT_CONFIG_KEY_*`, `GIT_CONFIG_VALUE_*`, `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_SYSTEM`, `GIT_CONFIG_NOSYSTEM` or `GIT_DIR`.

**Entries:**
- **Git:** `git * push * --force*|--force-with-lease*|--mirror|--delete|--prune|-f*|-[!-]*f*|-d*|-[!-]*d*|+*|:*` (forced, mirrored or deleting pushes, including `+` and `:` refspecs) · `git * --no-verify` · `git * -c core.hooksPath=*` · `git * -ccore.hooksPath=*` · `git * --config-env=core.hooksPath=*` · `git * commit * -n*|-[!-]*n*` (any short-flag cluster containing `n`) · `git * config * core.hooksPath` · `git * filter-branch` · `git * filter-repo` · `git * reset * --hard * origin/*` · `git * update-ref * -d` · `git * branch * -D*|-[!-]*D*|--delete * {baseBranch}`.
- **Deploy/infra:** `vercel * --prod*` · `netlify deploy * --prod*` · `fly deploy` · `flyctl deploy` · `firebase deploy` · `wrangler deploy|publish` · `wrangler pages deploy` · `terraform apply|destroy` · `pulumi up|destroy` · `kubectl apply|delete|edit|scale|rollout|patch|replace` · `helm install|upgrade|uninstall` · `aws * (create|delete|put|update)-*` · `gcloud * create|delete|deploy|update` · `az * create|delete|update`.
- **Databases:** `supabase db push` · `supabase db reset * --linked` · `supabase link` · `prisma migrate deploy` · `psql|mysql|mariadb|pg_restore when: prodHost`.
- **Publishing:** `npm|pnpm|yarn|bun publish` · `cargo publish` · `gh release create` · `twine upload`.
- **Secrets/billing:** `gh secret set|delete` · `vercel env add|rm` · `netlify env:set|env:unset` · `stripe * --live` · `doppler secrets set|delete`.
- **Hosted builders and CMS against production:** `wp when: prodHost` (WP-CLI). `curl|wget|Invoke-WebRequest|Invoke-RestMethod|iwr|irm|http|https|xh when: writeApi`. Hosted services are edited only on a `nonProduction` staging site.
- **Indexing pings:** covered by `writeApi` (IndexNow, Google Indexing API, `/ping?sitemap=`), including `GET` pings.
- **Hook tampering:** `* when: protectedTarget`.
- **Verifier environment tampering:** `* when: setsVerifierVar`, in agent sessions.
- **shipgate Operator verbs:** `shipgate init|lock|baseline|waiver|override|break-glass|conformance|migrate|codegen|approve` · `shipgate debt record|add|rotate` · `shipgate keys init|trust|export|import` · `shipgate hooks install` · `shipgate rollout release` — except `init --draft`, `migrate --check`, `codegen --check` and `baseline --ci` (which additionally requires CI detection, 04 § 15). This list is the single definition of "Operator command" (§ 1).

### 3.3 Host matrix
Host ids: `claude-code`, `codex`, `cursor`, `opencode`, `antigravity`, `git` (also used by 03 § 16 `host`). `hooks install --host <id> --role <role>` writes the host config; the hook command is `shipgate check --hook <event> --host <id>` (`pre`→`pre-tool`, `post`→`post-tool`, `session`→`session-start`, `prompt`→`prompt`, `stop`→`stop`, § 1); payloads (JSON on stdin) are normalised per the 03 § 16 mapping table. **Fetch recording:** on `post-tool` events with `tool: "fetch"` (web fetches, web searches and the browser/fetch MCP tools of ruleset `fetch-tools.json`), the post-hook appends each `fetched[]` document to the session fetch store (03 § 15), which CQ-010 reads; hosts whose row in 03 § 16 reports no fetches produce no store, and CQ-010 is then `skipped(no-fetch-store)`. Each row carries the verification status of the host's hook API; verifying every row against the current host version is the **first host work package** of the build. Until verified, a host is reported as "reduced enforcement".

| Host | Config | Events used | Block signal | Context | Status |
|---|---|---|---|---|---|
| Claude Code | `.claude/settings.json` | SessionStart, UserPromptSubmit, PreToolUse (`Edit\|Write\|MultiEdit\|NotebookEdit\|Bash`), PostToolUse (`Edit\|Write\|MultiEdit\|NotebookEdit\|Bash\|WebFetch\|WebSearch\|mcp__.*`), Stop | PreToolUse JSON `permissionDecision: "deny"` (exit 2 fallback); Stop `decision: "block"` | `additionalContext` | docs-confirmed 2026-10; default timeout 60 s; `stop_hook_active` loop flag |
| Codex | `.codex/hooks.json` (trusted projects; `features.hooks`) | SessionStart, UserPromptSubmit, PreToolUse (`^Bash$`, `apply_patch`), PostToolUse, Stop | JSON `permissionDecision: "deny"` | `additionalContext` | docs-confirmed 2026-10; user must trust hooks via `/hooks`; errors/timeouts don't block (host fail-open); Windows via `commandWindows`; nested exec coverage on Desktop reported incomplete |
| Cursor | `.cursor/hooks.json` (`version: 1`) | sessionStart, beforeSubmitPrompt, preToolUse, beforeShellExecution, afterFileEdit, stop | `permission: "deny"`; `failClosed: true` | `agent_message`; stop `followup_message` | docs-confirmed 2026-10; ≤ 5 auto follow-ups; cloud agents skip sessionStart/beforeSubmitPrompt/stop |
| OpenCode | generated plugin in the project plugin directory (name per current OpenCode version) | `tool.execute.before`, `tool.execute.after`, `session.idle` | throw in `tool.execute.before` | message via SDK client | needs verification of plugin directory and idle follow-up behaviour |
| Antigravity | `.agents/hooks.json` | PreToolUse (`run_command\|edit_file\|replace_file_content\|write_to_file`), PostToolUse (the same plus `view_file\|read_url_content\|search_web`), PreInvocation, Stop — tool names to be confirmed by WP-101 | `deny` decision | PreInvocation | docs-confirmed 2026-10; default timeout 30 s |
| Other / none (`git`) | git `pre-commit` + `pre-push`, written to the directory named by `git config core.hooksPath` (else `.git/hooks/`); with husky or lefthook, the shipgate command is added to `.husky/pre-commit` / `.husky/pre-push` or to `lefthook.yml` (all protected, § 3.1) | commit, push | non-zero exit | — | reduced enforcement; CI authoritative |

**Installed entries.** Per event in the Events column, `hooks install` writes one entry: command `shipgate check --hook <pre|post|stop|session|prompt> --host <id> --role <role>` (binary resolved as `shipgate` on `PATH`; the npm shim installs the same name), the matcher shown in the Events column, and, where the host config has a timeout field, `pre` 5 s, `post` `timeBudgets.check` + 5 s, `stop` `timeBudgets.stop` + 5 s, `session`/`prompt` 10 s, each capped at the host's maximum and rounded up to whole seconds. Output envelopes per host: 03 § 16 *Hook output*. `hooks install` merges into the existing file: entries whose command starts with `shipgate check --hook` are replaced in place, every other entry and key is kept, and a second run leaves the file byte-identical (idempotent). `hooks check` exits 1, printing one line per problem, when an expected entry is missing or differs, when a hook config file's hash differs from its lock entry (03 § 8; e.g. a changed `--role`), or when a higher-precedence host file (user-level or `*.local` variant) holds a hook for the same event and matcher that allows, overrides or disables it.

**Invariants:** pre-hooks never need the toolchain or network; shipgate converts its own crashes/timeouts into the host's explicit deny where possible; the stop hook only reads the sealed verdict record (04 § 8.1) and answers in < 2 s; stop budget = min(policy, host timeout − 5 s).

**Roles:** the installed role decides the write scope (Builder: `writeScope` + new migrations + `quality/proposals/**`; Planner: `quality/proposals/**` + `roles.planner`; Auditor: `quality/audit/**` + `quality/proposals/waiver-requests.json` + `roles.auditor`). Different roles in parallel sessions use separate worktrees or separate host profiles.

---

## 4. MCP server

Transport: stdio (`shipgate mcp`). Long runs are asynchronous. Every tool returns a text block plus the JSON shown as structured content; errors are MCP tool errors with `{ code, message }` (`code` = the § 1 exit code).

| Tool | Input | Output |
|---|---|---|
| `brief` | `{ paths?: string[], routes?: string[], service?, surface?, family?, kind?, tags?: string[], stage?: "start" }` | the brief text and its JSON (04 § 7) |
| `check` | `{ paths: string[] }` | the `post`-mode findings for those paths (04 § 8; no hook payload is involved, `role` = the installed role or `builder`) |
| `rule` | `{ id }` | `{ id, text, fix, severity, parts }` |
| `status` | `{ job?: string }` | `{ state: "none"\|"running"\|"done", verdict?, treeHash, summary? }` |
| `verify_start` | `{ changed?: bool, gate?: string[], pack?: string[], service?: string[], profile?: "default"\|"nightly" }` | `{ jobId }` (as `verify --detach`; narrowing inputs make the run partial, § 1) |
| `verify_result` | `{ jobId, waitSec?: int 0–50 (default 0; any other value → tool error, code 3) }` | `{ state: "running"\|"done", verdict?, reportUri?: "report://latest" (present when `state` is `done`) }` |

Resources: `report://latest` = the 03 § 17 JSON for the current tree; `rule://<ID>` = the rule's markdown. MCP never exposes Operator commands, and the stop decision stays with the stop hook (04 § 8.1).

---

## 5. CI

Templates for GitHub Actions, GitLab CI, Bitbucket Pipelines, Azure Pipelines, CircleCI:
- Install the pinned version: step 1 runs `npm install -g shipgate@<content of .shipgate-version>` (§ 7); restore the toolchain cache `cache.dir` (03 § 7.3; key = toolchain manifest hash); `fetch`.
- PRs: `verify --no-cache`; upload SARIF, JUnit, `summary.md` comment.
- Settings: `SHIPGATE_LICENCE` (licence file), `SHIPGATE_TRUSTED_KEYS` (trust store JSON), `SHIPGATE_CI_SIGNING_KEY` (base branch jobs only).
- Base branch: `verify --no-cache`, then `baseline --ci --id _main`, kept per policy `ci.mainBaseline` (03 § 3.1):
  - `"artifact"` (default): the base-branch job uploads `quality/baselines/_main/` as CI artifact `shipgate-main`. PR templates download the latest successful `shipgate-main` of `baseBranch` into `quality/baselines/_main/` before `verify`; shipgate verifies its `ci` signature (03 § 7.2). None available → rules needing it are `skipped(no-main)` (03 § 12).
  - `"commit"`: the base-branch job commits `quality/baselines/_main/` with message `shipgate: update _main baseline [skip ci]` (such commits never invalidate the lock, 03 § 8).
- Cloud agent sandboxes without browsers/ports: only when the signed policy sets `verifyEnv.reduced.allowed` (03 § 3.4), shipgate runs G0–G3. A base PASS becomes `PARTIAL` with a `reduced-environment` handoff, which allows the agent to stop. A base FAIL or BLOCKED stays as it is (04 § 1.6, § 1.9). CI is authoritative.

---

## 6. Versioning

- `policy.verifier` (Cargo `semver::VersionReq`) is the source of truth; `.shipgate-version` (exact version for the npm shim and CI install) is the exact version of the binary that ran `init`/`migrate`, which must satisfy `verifier` (03 § 3.1).
- Rulesets `YYYY.MM` (hotfixes `YYYY.MM.N`) fix rule texts, severities, thresholds, lifecycles. The binary embeds the current and 3 previous rulesets. New/changed rules ship `experimental` and are adopted by bumping `ruleset` (`migrate --check` shows the impact; `debt add` absorbs new findings).
- Formats carry `formatVersion`; `migrate` upgrades and the Operator re-signs.
- A per-rule changelog ships with every release.

---

## 7. Distribution and releases

- Targets: Windows x64/arm64, macOS arm64/x64, Linux x64/arm64 (glibc, musl).
- GitHub Releases (signed archives, SHA-256, SBOM) and npm platform packages with provenance; cargo later.
- Signing: Authenticode, macOS Developer ID + notarization, minisign for Linux.
- `self-update` verifies signatures, stays within the pinned range, keeps the previous binary for rollback.
- **npm:** meta package `shipgate` (the shim) with optional dependencies `@shipgate/cli-<platform>` for each 03 § 19 platform id except `any`; the shim runs the binary of the exact version in `.shipgate-version`.
- **Release assets:** `shipgate-<version>-<platform>.zip` (Windows) or `.tar.gz` (others), `SHA256SUMS`, `SHA256SUMS.minisig`, `sbom.cdx.json` (CycloneDX 1.5). Release host: GitHub Releases of the vendor repository (above).
- **`self-update` source:** `<release index>/<channel>/latest.json` = `{ version, assets: [{ platform, url, sha256 }], signature }`, `signature` = Ed25519 by the vendor release key compiled into the binary (03 § 19) over the JCS of the object without `signature`; the index URL is a compile-time constant, rewritten to `<mirror>/…` when a mirror is set. On every platform it verifies that signature and the asset's `sha256` (Authenticode/notarization are additionally checked by the OS where it applies), refuses a version outside policy `verifier`, and keeps the previous binary as `shipgate.prev` (`shipgate.prev.exe` on Windows).
- Toolchain manifest per release (03 § 19).

---

## 8. Licensing (closed / commercial)

- Offline licence file (path: `SHIPGATE_LICENCE`, else config `licence.path`, else `<config dir>/shipgate/licence.json`): `{ formatVersion: 1, customer, seats: int, expires: YYYY-MM-DD, features: string[], ciTokens: [{ id, label, expires: YYYY-MM-DD }], signature }`. `signature` = Ed25519 (base64, 03 § 7.1) over the JCS of the object without `signature`, verified against the vendor public keys compiled into the binary. v1 defines one feature, `core`, which every licensed command requires; unknown features are ignored (a later release may gate packs or commands on new feature names; a command needing an unlisted feature → `BLOCKED (licence)`).
- **Seats** count interactive users: the binary records, per machine, a salted hash of the OS account in `<state dir>/shipgate/seats.json` and warns when more than `seats` distinct hashes used it in the last 30 days. Seats never block.
- A **CI token** is an id listed in the licence; CI presents the licence file plus `SHIPGATE_CI_TOKEN=<id>`, allowing unlimited CI runs for that customer without seats. A CI token is valid only with CI detection (04 § 15), while the licence itself is valid (including its 14-day grace) **and** before the token's own `expires`. `ciTokens[].id` matches `^[A-Za-z0-9_-]{16,64}$`.
- **`seats.json`:** `{ formatVersion, salt: base64(16 bytes, generated once), users: [{ hash: lowercase hex SHA-256(salt ‖ UTF-8 OS account name), lastSeen: RFC 3339 }] }`.
- Licence-free: `rule`, `doctor`, `fetch`, `inventory`, `migrate --check`, `codegen --check`, `version`, `status`, `keys show`.
- **Expiry and absence:** after `expires`, a 14-day grace with a warning on every command. No valid licence (missing file, bad signature, past grace, CI token invalid) → every licensed command exits 2 `BLOCKED (licence)`; never a silent pass:
  - `verify` writes the report and an `operator-owned` handoff (04 § 1.9; `decisionsNeeded` kind `licence`), sealed as usual.
  - `check --hook pre` keeps enforcing § 3.1 and § 3.2 (protection is never licence-gated) and injects the licence warning; `check --hook post` runs no rules and injects the warning; `check --hook stop` allows the stop only with that handoff for the current tree (otherwise it asks the agent to run `verify`, which writes it).
  - `brief` and `mcp` print the warning and exit 2.
- Compiled-in dependencies must be permissive (MIT, Apache-2.0, BSD, ISC, Zlib, Unicode-3.0, PostgreSQL), enforced by `cargo deny`. Runtime-fetched tools come from official sources, not redistributed; axe-core (MPL-2.0) used unmodified with notice. `THIRD_PARTY_NOTICES` in every release.

---

## 9. Telemetry and privacy

No telemetry. Nothing leaves the device except toolchain/database downloads, update checks when config `update.check` is `true` (default `false`, 03 § 7.3), edge-pass requests the Operator configured, external link checks (LNK-006/007, TR-106), browser loads of `hosts[]` entries with `browser: true` (04 § 6.1), and `report-fp` packages the user sends. Opt-in crash reports only (`telemetry.crashReports`). The session fetch store (03 § 15) holds copies of text agents fetched; it stays in the user state dir and is never sent anywhere. A published data inventory lists every file written and every network destination.
