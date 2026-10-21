# shipgate — 05 Integrations, CLI and product

> CLI surface, onboarding, protected/deny lists, agent-host hooks, MCP, CI, versioning, releases, licensing, telemetry. Load when building the CLI shell, installers, hooks or release tooling.

---

## 1. CLI surface

Global flags: `--repo`, `--service <id>` (repeatable), `--format text|json|sarif`, `--quiet`, `--no-color`, `--no-cache`.
Precedence: flags > `SHIPGATE_*` env > `quality/policy.json` > user config > built-in defaults. This order applies **to operational settings only**: output format and paths, cache, mirror, proxy, licence path, update channel, `--no-cache` and `--detach`.
- Flags and env vars can never override a signed policy key, such as budgets, coverage, thresholds, packs or reduced mode.
- `--gate`, `--pack`, `--service` and `--changed` only narrow the scope, so those runs are partial (04 § 1.6).

| Command | Who | Purpose / key flags |
|---|---|---|
| `init` | Operator | Onboarding (§ 2); `--new --kind <kinds>` for projects built from scratch (§ 2.1); `--draft` writes `quality/proposals/policy.json` without signing (Planner-safe) |
| `doctor` | anyone | Toolchain, hooks (incl. per-host enforcement level), keys, trust-store changes, lock, licence, system libraries; `--bundle` |
| `fetch` | anyone | Pre-download toolchain and offline databases; `--all-browsers` |
| `brief` | agents | `--paths --routes --service --surface --family --kind --tags`, `--stage start` (04 § 7) |
| `check` | hooks | `--hook pre\|post\|stop\|session\|prompt --host <id>` |
| `verify` | agents, CI | `--changed`, `--against <baseline>`, `--gate`, `--pack`, `--service`, `--profile default\|nightly`, `--resume` (04 § 15), `--detach`, `--adopt` (onboarding: NOT_CONFIGURED becomes warning). `--changed`, `--gate`, `--pack`, `--service` and `--adopt` are partial runs. They report FAIL or BLOCKED as is, turn PASS into PARTIAL, and never seal a PASS (04 § 1.6) |
| `version` | anyone (licence-free) | Binary version, ruleset versions embedded, toolchain manifest hash |
| `status` | agents | Latest result for the current tree; `--wait [--timeout <s>]`, `--job <id>` |
| `rule <ID>` | anyone | One rule's text and fix hint |
| `inventory` | anyone (licence-free) | Build programmatic inventories |
| `codegen` | Operator | Types/helpers into `quality/generated/` |
| `approve pages` | Operator | Signs `quality/approvals/pages-<n>.json` for bulk page additions (CQ-006, 03 § 14) |
| `baseline` | Operator; `--ci` in CI | Record a baseline; `--id`; `--from-remote <origin>` records a read-only URL inventory of a live site before it is rebuilt or re-platformed and writes a signed `refactor.json` pointing at it (REF-010, 03 § 12, 04 § 1.6); `--ci` signs `_main` with the CI key (no TTY; requires CI detection + `SHIPGATE_CI_SIGNING_KEY`) |
| `debt record` / `debt add --reason` / `debt show` | Operator / Operator / anyone | Debt ratchet |
| `debt rotate <fingerprint> --on <date>` | Operator | Attests that a secret found in git history (SEC-050 `history`) was rotated. Sets the signed `rotatedOn`, which clears the item |
| `lock` | Operator | Recompute and sign the lock |
| `keys init\|trust\|export\|import\|show` | Operator | Keys and trust store (03 § 7) |
| `hooks install\|check` | Operator / anyone | `--host <id> --role builder\|planner\|auditor` |
| `waiver add`, `override add` | Operator | Signed with the lock |
| `break-glass` | Operator | One-stop pass for a tree hash (signed, expiring) |
| `conformance --adapter <id>` | Operator | Earn a tier for a project-local adapter |
| `rollout status\|release` | anyone / Operator | Staged publication of programmatic families (ROL-*); `release` checks wave age and index rate from the indexing export |
| `mcp` | hosts | MCP server (§ 4) |
| `migrate` | Operator; `--check` anyone | Upgrade formats/ruleset; regenerates `.shipgate-version` |
| `report-fp <hash>` | anyone | Redacted false-positive repro |
| `self-update` | anyone | Within the pinned range; `--channel` |

**Exit codes:** 0 PASS, 1 FAIL, 2 BLOCKED, 3 tool error, 4 PARTIAL. Hook mode follows host protocols (§ 3.3).

**Operator commands** (those marked Operator, except `--draft`/`--ci` variants) require the Operator passphrase on an interactive terminal (03 § 7.1) and are denied by the pre-hook in agent sessions. Pseudo-terminal wrappers (`script`, `winpty`, `expect`) don't help an agent because the passphrase is never stored anywhere it can read.

---

## 2. Onboarding — `shipgate init`

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
2. Write a preset policy for the kinds with `project.stage: "new"`, packs enabled per kind (e.g. `docs` → `llmsTxt: "required"`; `ecommerce` → merchant listing features, the withdrawal function for EU consumers; `local-business` → local search), and planned services (CFG-009). Also write templates for `quality/data/business.json` (local-business, ecommerce, marketing) and for flows per journey (contact form, signup/login, checkout).
3. `keys init` if no Operator key exists, then `fetch`.
4. If it replaces a site: run `baseline --from-remote <old origin>` now, before anything changes, and ask for `legacy-urls.txt` sources. That command writes and signs `quality/refactor.json` with the remote baseline (`goal: "replatform"`), so every `verify` runs G7 and REF-010/011/013 (04 § 1.6).
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
- CI: `.github/workflows/**`, `.gitlab-ci.yml`, `bitbucket-pipelines.yml`, `azure-pipelines.yml`, `.circleci/**`.
- Built-in protected JSON keys: `tsconfig*.json` `/compilerOptions/strict`, `/compilerOptions/noUncheckedIndexedAccess`, `/compilerOptions/noImplicitAny`; lint configs' rule severities for rules the adapter marks as quality gates; `package.json` `/scripts/<name>` for `test`, `lint`, `typecheck`, `build`, `coverage`, and every script named in `services[].commands`.

### 3.2 Built-in denied commands (argv patterns; 04 § 8.2 resolves indirection)
- **Git:** `git push * --force*|-f|--force-with-lease`, `git * --no-verify`, `git commit * -n`, `git filter-branch`, `git filter-repo`, `git reset --hard origin/*`, `git push * :<base branch>`, `git update-ref -d`.
- **Deploy/infra:** `vercel * --prod*`, `vercel deploy --prod`, `netlify deploy * --prod*`, `fly deploy`, `firebase deploy`, `wrangler deploy|publish`, `terraform apply|destroy`, `pulumi up|destroy`, `kubectl apply|delete|edit|scale|rollout`, `helm install|upgrade|uninstall`, `aws * (create|delete|put|update)-*`, `gcloud * (create|delete|deploy|update)`, `az * (create|delete|update)`.
- **Databases:** `supabase db push`, `supabase db reset --linked`, `supabase link`, `prisma migrate deploy`, `psql|mysql` with a host matching `production.hosts`.
- **Publishing:** `npm|pnpm|yarn|bun publish`, `cargo publish`, `gh release create`, `twine upload`.
- **Secrets/billing:** `gh secret set|delete`, `vercel env add|rm`, `netlify env:set`, `stripe * --live`, `doppler secrets set`.
- **Hosted builders and CMS against production:** `wp` (WP-CLI) with `--url`/`--path` resolving to `production.hosts`. Requests via `curl|wget|Invoke-WebRequest|Invoke-RestMethod|http` to the publish/write APIs of hosted builders listed in the ruleset (Duda, Webflow, Wix, Squarespace, Shopify Admin, WordPress REST `POST|PUT|DELETE /wp-json/` on production hosts). Hosted services are edited only on a `nonProduction` staging site.
- **Indexing pings:** requests to IndexNow endpoints, the Google Indexing API, `/ping?sitemap=`.
- **Hook tampering:** writes to protected paths via shell (`>`, `tee`, `sed -i`, `Set-Content`, `Out-File`, `cp|mv|rm` targeting protected paths).
- **Verifier environment tampering:** commands that set or export `SHIPGATE_*`, `CI`, `GITHUB_ACTIONS`, `GITLAB_CI`, `BUILDKITE`, `CIRCLECI`, `TF_BUILD` or `BITBUCKET_BUILD_NUMBER` (`VAR=… cmd`, `export`, `set`, `$env:VAR=`, `setx`, `env VAR=…`) in agent sessions.
- **shipgate Operator verbs:** `shipgate (init|lock|baseline|debt record|debt add|waiver|override|keys|hooks install|break-glass|conformance|migrate|rollout release|codegen|approve)` without `--draft`/`--check`.

### 3.3 Host matrix
`hooks install --host <id> --role <role>` writes the host config; the hook command is `shipgate check --hook <event> --host <id>`; payloads are normalised (03 § 16). Each row carries the verification status of the host's hook API; verifying every row against the current host version is the **first host work package** of the build. Until verified, a host is reported as "reduced enforcement".

| Host | Config | Events used | Block signal | Context | Status |
|---|---|---|---|---|---|
| Claude Code | `.claude/settings.json` | SessionStart, UserPromptSubmit, PreToolUse (`Edit\|Write\|MultiEdit\|NotebookEdit\|Bash`), PostToolUse, Stop | PreToolUse JSON `permissionDecision: "deny"` (exit 2 fallback); Stop `decision: "block"` | `additionalContext` | docs-confirmed 2026-10; default timeout 60 s; `stop_hook_active` loop flag |
| Codex | `.codex/hooks.json` (trusted projects; `features.hooks`) | SessionStart, UserPromptSubmit, PreToolUse (`^Bash$`, `apply_patch`), PostToolUse, Stop | JSON `permissionDecision: "deny"` | `additionalContext` | docs-confirmed 2026-10; user must trust hooks via `/hooks`; errors/timeouts don't block (host fail-open); Windows via `commandWindows`; nested exec coverage on Desktop reported incomplete |
| Cursor | `.cursor/hooks.json` (`version: 1`) | sessionStart, beforeSubmitPrompt, preToolUse, beforeShellExecution, afterFileEdit, stop | `permission: "deny"`; `failClosed: true` | `agent_message`; stop `followup_message` | docs-confirmed 2026-10; ≤ 5 auto follow-ups; cloud agents skip sessionStart/beforeSubmitPrompt/stop |
| OpenCode | generated plugin in the project plugin directory (name per current OpenCode version) | `tool.execute.before`, `tool.execute.after`, `session.idle` | throw in `tool.execute.before` | message via SDK client | needs verification of plugin directory and idle follow-up behaviour |
| Antigravity | `.agents/hooks.json` | PreToolUse (`run_command\|edit_file\|write_to_file\|…`), PostToolUse, PreInvocation, Stop | `deny` decision | PreInvocation | docs-confirmed 2026-10; default timeout 30 s |
| Other / none | git `pre-commit` + `pre-push` | commit, push | non-zero exit | — | reduced enforcement; CI authoritative |

**Invariants:** pre-hooks never need the toolchain or network; shipgate converts its own crashes/timeouts into the host's explicit deny where possible; the stop hook only reads the sealed verdict record (04 § 8.1) and answers in < 2 s; stop budget = min(policy, host timeout − 5 s).

**Roles:** the installed role decides the write scope (Builder: `writeScope` + new migrations + `quality/proposals/**`; Planner: `quality/proposals/**` + `roles.planner`; Auditor: `quality/audit/**` + `quality/proposals/waiver-requests.json` + `roles.auditor`). Different roles in parallel sessions use separate worktrees or separate host profiles.

---

## 4. MCP server

Tools: `brief`, `check`, `rule`, `status`, `verify_start` (job id), `verify_result`. Resources: `report://latest`, `rule://<ID>`. Long runs are asynchronous.

---

## 5. CI

Templates for GitHub Actions, GitLab CI, Bitbucket Pipelines, Azure Pipelines, CircleCI:
- Install the pinned version (`.shipgate-version`); restore toolchain cache (key = toolchain manifest hash); `fetch`.
- PRs: `verify --no-cache`; upload SARIF, JUnit, `summary.md` comment.
- Settings: `SHIPGATE_LICENCE` (licence file), `SHIPGATE_TRUSTED_KEYS` (trust store JSON), `SHIPGATE_CI_SIGNING_KEY` (base branch jobs only).
- Base branch: `verify --no-cache`, then `baseline --ci --id _main`, committed or stored as an artifact (Operator choice).
- Cloud agent sandboxes without browsers/ports: only when the signed policy sets `verifyEnv.reduced.allowed` (03 § 3.4), shipgate runs G0–G3. A base PASS becomes `PARTIAL` with a `reduced-environment` handoff, which allows the agent to stop. A base FAIL or BLOCKED stays as it is (04 § 1.6, § 1.9). CI is authoritative.

---

## 6. Versioning

- `policy.verifier` (semver range) is the source of truth; `.shipgate-version` (exact version for the npm shim) is generated from it.
- Rulesets `YYYY.MM` (hotfixes `YYYY.MM.N`) fix rule texts, severities, thresholds, lifecycles. The binary embeds the current and 3 previous rulesets. New/changed rules ship `experimental` and are adopted by bumping `ruleset` (`migrate --check` shows the impact; `debt add` absorbs new findings).
- Formats carry `formatVersion`; `migrate` upgrades and the Operator re-signs.
- A per-rule changelog ships with every release.

---

## 7. Distribution and releases

- Targets: Windows x64/arm64, macOS arm64/x64, Linux x64/arm64 (glibc, musl).
- GitHub Releases (signed archives, SHA-256, SBOM) and npm platform packages with provenance; cargo later.
- Signing: Authenticode, macOS Developer ID + notarization, minisign for Linux.
- `self-update` verifies signatures, stays within the pinned range, keeps the previous binary for rollback.
- Toolchain manifest per release (03 § 19).

---

## 8. Licensing (closed / commercial)

- Offline Ed25519-signed licence file: `{ customer, seats, expires, features[], ciTokens: [{ id, label, expires }] }`. Seats count interactive users (by OS account hash, stored locally). A **CI token** is an id listed in the licence; CI presents the licence file plus `SHIPGATE_CI_TOKEN=<id>`, allowing unlimited CI runs for that customer without seats.
- Licence-free: `rule`, `doctor`, `fetch`, `inventory`, `migrate --check`, `version`, `status`.
- Expiry: 14-day grace with warnings, then `verify`/`check` → `BLOCKED (licence)`; never a silent pass.
- Compiled-in dependencies must be permissive (MIT, Apache-2.0, BSD, ISC, Zlib, Unicode-3.0, PostgreSQL), enforced by `cargo deny`. Runtime-fetched tools come from official sources, not redistributed; axe-core (MPL-2.0) used unmodified with notice. `THIRD_PARTY_NOTICES` in every release.

---

## 9. Telemetry and privacy

No telemetry. Nothing leaves the device except toolchain/database downloads, optional update checks, edge-pass requests the Operator configured, and `report-fp` packages the user sends. Opt-in crash reports only. A published data inventory lists every file written and every network destination.
