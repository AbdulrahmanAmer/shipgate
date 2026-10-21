# shipgate — position

Stage 0 (spec audit loop, `audit/README.md`). No build work until a round is GO. The Operator's rule (2026-10-21): **nothing is left open** — every finding fixed or rejected with a reason; Should-adds get added, not parked.

## 2026-10-21 — round 06 in progress
- Done: round-5 items closed (UX-020 `stock` → `ux.stockSources`; PRV-025 no-match → operator-owned blocking; AEO-014 hidden/AI-targeted text + agent parity; PRV-022 `kr-ecommerce`/`jp-sct`/`cn-icp` + `business.json` `legal.mailOrderNumber/icpNumber/psbNumber`; 04 § 1.2 required-facts rules).
- Done: `tools/trace/` — `spec-lint.mjs` (0 errors, 0 warnings), `spec-lint.test.mjs` (14/14 planted defects caught), `trace/ownership.tsv` (every rule + TR owned at rule/part/channel level), BUILD_MAP section-ownership table, 7 WP dependency fixes, API-004 channel → `contract`.
- In progress: concreteness audit, 8 auditor groups → `audit/rounds/06/concreteness-*.md`.
- Next: resolution.md for round 06 → apply fixes → add the 5 round-5 Should-adds (copied third-party text, production conversion check, `uk-consumer`, re-platforming image redirects, SaaS signup email verification) → consistency + coverage audits → round 07.
- Also to do before build: rewrite `ORCHESTRATOR_PROMPT.md` + `CLAUDE.md` (stale: wrong repo path `D:\shipgate`, "paste in new session", API financial note) and add the build-completeness gates (anti-skip) to BUILD_MAP § 4.
