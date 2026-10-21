# Decisions

Decisions taken during the spec audit and the build. Settled product decisions are in the `SPEC.md` decision log; these are the orchestrator's calls within it. Newest last.

## 2026-10-21 — round 06

- **D-001 Budget exhaustion (04 § 8).** Adopt the auditor's default (concreteness-algorithms #3): unfinished gates are `BLOCKED(budget)` owned by `operator` only when no earlier run on the same lock finished those gates within budget; otherwise they're owned by `builder` (the app got slower). Why: an operator-owned budget block gives a handoff, so a slow app would let an agent stop with G4–G9 unrun. Consistent with the decision-log principle that agents can't self-grant reduced verification.
- **D-002 Cache keys and the definition-of-done run (04 § 15–16).** Adopt the auditor's default (concreteness-algorithms #32): environment hash = SHA-256 of JCS of OS, arch, verify-env hash, resolved service env (secrets hashed), browser and database engine versions and CI detection; the definition-of-done run is any `verify` without a partial cause; a sealed PASS is never built from cached gate results of a different environment hash.
- **D-003 CSRF and SameSite (SEC-024).** Adopt the auditor's default (concreteness-security #16): requests whose session cookie is `SameSite=Strict`, or `Lax` for non-GET requests, are judged by the browser's cookie withholding, plus the Origin/`Sec-Fetch-Site` replay; header-auth sessions are excluded. Source: OWASP CSRF Prevention Cheat Sheet.
- **D-004 Session lifetime maxima (SEC-064).** Adopt the auditor's default (concreteness-security #31): ruleset `session-lifetimes.json` per project kind, defaults from NIST SP 800-63B-4; strictest over `project.kinds`; the Operator may set stricter values in `security.session`.
- **D-005 Operator questions.** None of D-001…D-004 contradicts the decision log, so per ORCHESTRATOR_PROMPT's decision policy they are the orchestrator's to take, not the Operator's.
