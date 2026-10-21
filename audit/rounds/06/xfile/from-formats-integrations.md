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
