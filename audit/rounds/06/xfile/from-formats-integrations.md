# Cross-file requests — from formats-integrations (03, 05) — round 06, pass A

## 1. spec/01-core.md — § 7 Modes table, row "Operator commands" (l.162)
Serves: concreteness-formats-integrations #41 (single Operator-command list).
Old text (Modes column):
`` `init`, `lock`, `debt record\|add`, `waiver add`, `override add`, `keys`, `hooks install`, `baseline`, `codegen`, `rollout release`, `break-glass`, `approve pages` (`inventory` is licence-free and may be run by anyone) ``
New text:
`` the commands denied by 05 § 3.2 "shipgate Operator verbs" (incl. `debt rotate`, `conformance`, `migrate`; `keys show`, `init --draft`, `migrate --check`, `codegen --check` and `inventory` may be run by anyone) ``

## 2. spec/packs/resilience.md — policy example comment (l.10)
Serves: concreteness-formats-integrations #9 (the `dependency` boolean of `hosts[]` is removed; 03 § 3.3 now says a host is a fault-injection target iff `purposes` contains `dependency`, matching 04 § 4.5).
Old text: `// HTTP dependencies = hosts[] entries with dependency: true; databases = verifyEnv.databases`
New text: `// HTTP dependencies = hosts[] entries whose purposes contain "dependency" (03 § 3.3); databases = verifyEnv.databases`

## 3. spec/packs/web-delivery.md — CQ-010 (coverage-r05-carryover #1), information only
The xfile parts for CQ-010 are written: 03 § 15 "Session fetch store" (`<state dir>/shipgate/<repo-id>/fetches/<sessionId>.jsonl`, `{ url, host, fetchedAt, textHash, text }`, 200,000 characters per document, 50 MB per repo-id, oldest sessions evicted first), 03 § 16 (`tool: "fetch"`, `fetched[]`, per-host mapping table), 05 § 3.3 (post-hook recording; no store → `skipped(no-fetch-store)`), 05 § 3.1 (the state dir is protected, so an agent can't delete the store to reach the skip). If CQ-010's text says "user state dir `fetches/<repo-id>/<session-id>.jsonl`", please change it to "the session fetch store (03 § 15)" so both name the same path. No other edit needed.

---

# Pass B additions (formats-integrations, round 06)

## 4. CONFLICT for the orchestrator — fault-injection marker on `hosts[]` (no edit by this group)
Two pass-A fixers asked for opposite markers. formats-integrations (03 § 3.3, already applied; request §2 above to resilience.md) uses **`purposes` contains `"dependency"`**, which is what 04 § 4.5 says today (`hosts` registry (`purpose: "dependency"`)). data-refactor-arch… asked for the opposite: X3 (04 § 4.5 → `entries with dependency: true`) and X9 (remove `dependency` from the 03 § 3.3 purpose list). Pass B rejected X9: both are decidable and neither is stricter, and the purpose form already matches 04 and 03. **If the algorithms fixer applied data-refactor X3 in pass B, revert that half** so 04 § 4.5 reads: `Dependencies come from the `hosts` registry (entries whose `purposes` contain `"dependency"`, 03 § 3.3) and databases.` In resilience.md l.10, apply request §2 above (not the `dependency: true` comment).

## 5. spec/packs/ux.md — UX-022, `launch-forms.json` shape (typo)
Old: `"result": "arrived" | "failed"\| "failed"`
New: `"result": "arrived" | "failed"`
Serves: consistency with 03 § 14 *Launch-form confirmations* (written this pass, from core-adapters-ux C9).

## 6. spec/packs/refactor.md — REF-009 viewports
Old: `viewports `mobile` = 390×844 @2x and `desktop` = 1366×768 @1x`
New: `viewports `mobile` and `desktop` as defined in 03 § 10 (mobile 390×844, DPR 3; desktop 1366×768, DPR 1)`
Serves: 03 § 10 says flow viewport names and sizes are shared with refactor `visual.viewports`; REF-009 states DPR 2 for `mobile`, 03 § 10 states DPR 3. One definition.
