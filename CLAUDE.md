# shipgate — CLAUDE.md

## STOP — READ THIS BEFORE DOING ANYTHING

**shipgate is NOT ready to build yet.** Round-5 audits (the last ones run before this session cut off) came back defective. You must fix the 4 items below and re-run both audits until both return **GO** before any build work starts.

| Audit | Result | Open items |
|-------|--------|------------|
| Consistency (round 5) | **NO-GO** | 2 Majors |
| Coverage (round 5) | **COVERAGE INCOMPLETE** | 2 Must-adds |

**Do NOT start WP-000 or any Phase work until both audits pass.**

---

You are continuing work on **shipgate**, a closed-source Rust verifier that gates AI-agent-built websites/apps so they thrive in search engines, AI answer engines and real use.

## Current state

| Item | Status |
|------|--------|
| Spec version | **v7.4** (`SPEC.md`, `spec/01-core.md` … `spec/05-integrations.md`, `spec/packs/*.md` — 15 packs) |
| Rule count | 521 rule definitions, 0 duplicates, 0 dangling references |
| Build plan | `BUILD_MAP.md`: phases 0–11, work packages WP-000 … WP-1102 |
| Orchestrator prompt | `ORCHESTRATOR_PROMPT.md` — paste as the first message in a new `D:\shipgate` session |
| Consistency audit (round 5) | **NO-GO** — 2 Majors remaining |
| Coverage audit (round 5) | **COVERAGE INCOMPLETE** — 2 Must-adds remaining |

## Where to resume

**Open a new Claude Code CLI session in `D:\shipgate` and paste `ORCHESTRATOR_PROMPT.md` as your first message.**

Then run the remaining fixes below, and once both audits return GO, tell the user exactly: *"everything is ready to be moved to D and a full session can start there."*

## Remaining fixes (from round-5 audits)

### Consistency audit — 2 Majors (both one-line edits)

**Major 1 — `ux.md` UX-020 part `stock`:** `Offer.inventoryLevel` is agent-written, so an agent can pass by writing "only 3 left" next to `inventoryLevel: 3`. Compare only against Operator-owned sources (merchant feed, programmatic dataset field). A stock phrase with no Operator source → blocking finding, whether or not the page has an `Offer`.

**Major 2 — `privacy.md` PRV-025:** physical-product pages with no matching `business.json` `manufacturers[]` entry give `notConfigured` (a warning on a P1 rule). Change it to a blocking finding owned by the Operator so the agent gets a handoff instead of a PASS.

### Coverage audit — 2 Must-adds

**M1 — Hidden / AI-targeted text cloaking:** add a rule checking indexable pages for (a) hidden text (browser computed-style check, exempting disclosure widgets), (b) AI-addressed text in hidden elements, HTML comments, alt/aria-label or JSON-LD strings (ruleset phrase list per locale), and (c) different content served to Bingbot vs AI search/user-fetch user agents (run RTE-010 skeleton comparison per `ai-agents.json` token and Bingbot).

**M2 — Asian-market seller identity notices:** extend `privacy.jurisdictions` with `kr-ecommerce`, `jp-sct`, `cn-icp`; extend `business.json` `legal` with `mailOrderNumber` and `icpNumber`; add PRV-022-style checks (footer or required page contains the values) for Korea E-Commerce Act Art. 10, Japan Act on Specified Commercial Transactions Art. 11, China ICP filing number shown on homepage linked to MIIT.

### Recommended should-adds (optional, go into `spec/CHANGES.md` if you don't add them now)
- Copied third-party text detection (≥ ~30 words matching pages fetched during the session)
- Production conversion check at launch (one real test submission per UX-001 form)
- `uk-consumer` jurisdiction for order-button wording and VAT-inclusive prices
- Re-platforming image URL redirection
- SaaS signup email-verification probe

## Key design decisions already made (don't re-open)

- **Verdict model:** two-step — base verdict over gates that ran, then scope downgrade turns a clean PASS into PARTIAL for narrow runs; FAIL/BLOCKED never hidden (`spec/04-algorithms.md` §1.6).
- **Reduced mode:** only via signed policy `verifyEnv.reduced` + shipgate-detected missing browser/ports. Agents can't self-grant it.
- **Part severities:** rules carry `parts: [{part, severity, waivable?}]`; findings carry `part` (default `main`) (`spec/03-formats.md` §5).
- **Stock rule (TPL-004/TCL-004):** `data-section` subtrees detached and hashed separately; unreviewed `aiText` counts as absent (`spec/04-algorithms.md` §11).
- **Re-platforming / new projects:** `init --new` writes a signed `refactor.json` with the remote baseline; builds from scratch stay PARTIAL until launch (`spec/01-core.md` CFG-009, `spec/05-integrations.md` §2.1).
- **Performance calibration:** one median Lighthouse `benchmarkIndex` per run at G4 start; below `performance.minBenchmarkIndex` timing rules are `skipped(slow-host)` and the run becomes PARTIAL (`spec/01-core.md` TR-111).
- **AI crawlers:** `ai-agents.json` ruleset file; search/user-fetch agents allowed unless `aiVisibility: false`; training agents per Operator choice.
- **Third-party / AI fetches always stubbed** when named in `expectEgress` or `ux.egressStubs` — nothing reaches real CRM/form/payment hosts during verification.

## Files that matter

```
SPEC.md                  # index, decision log, history
BUILD_MAP.md             # phases, WPs, Definition of Done
ORCHESTRATOR_PROMPT.md   # first message for a new session
spec/01-core.md          # principles, rule model, TR requirements
spec/02-adapters.md      # coverage tiers, adapter manifest
spec/03-formats.md       # policy, flows, lock, debt, report formats
spec/04-algorithms.md    # verdict, gates, Handoffs, algorithms
spec/05-integrations.md  # CLI, hooks, MCP, CI
spec/packs/*.md          # 15 packs: web-delivery, search-engines, answer-engines, programmatic,
                         # ux, security, privacy, accessibility, performance, architecture,
                         # data-api, resilience, ops, testing, refactor
spec/CHANGES.md          # spec amendments discovered while building (create if missing)
BUILD_STATE.md           # live progress ledger (orchestrator-owned; create if missing)
DECISIONS.md             # decisions taken during the build
session/                 # exported OpenCode transcripts (JSON)
  opencode-session.json  # this session's full transcript (5.5 MB)
```

## Environment setup (Windows-first, no Docker)

1. Move `C:\Users\DELL\OneDrive\Desktop\shipgate` → `D:\shipgate` (out of OneDrive).
2. Install:
   - Rust via `rustup` (stable MSVC toolchain)
   - Visual Studio Build Tools — C++ workload
   - `git`
   - Node.js LTS (only for the browser sidecar; end users never need it)
3. Optional: `agent-os init` in `D:\shipgate` so progress is tracked between sessions.
4. CI targets: windows-latest, macos-latest, ubuntu-latest.

## How to hand off between sessions

1. Persist state: `BUILD_STATE.md` (WP status, evidence, risks), `DECISIONS.md`, `spec/CHANGES.md`.
2. Keep context small — sub-agents read files, you hold plan/state/verification.
3. If your context gets heavy, write state files, then continue from them in a fresh session using `ORCHESTRATOR_PROMPT.md`.

## Financial note

Switching from API usage to Claude Code CLI subscription: the session transcript is exported at `session/opencode-session.json`. Your spec work is all on disk under `shipgate/` — nothing is trapped in API context. The build runs locally with `cargo`, so once the spec is GO there are no further API costs for building shipgate itself.
