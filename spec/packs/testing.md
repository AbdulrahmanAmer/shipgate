# Pack: testing

> Operator-owned declarative flows run by the Verifier itself (agents can't weaken them), the project's own test suite, honest agent tests, optional cross-browser runs and mutation sampling. Test evasion is AGT-004 (core). Flow file format: `03-formats.md` § 10.

---

## 1. Policy section

```jsonc
"testing": {
  "flows": "quality/flows/",
  "requireTestsFor": ["route", "api-handler"],     // file roles whose changes need test changes
  "projectTests": true,                            // run services[].commands.test in G1 (BLD-003)
  "crossBrowser": { "enabled": false, "browsers": ["firefox", "webkit"], "flows": ["*"] },
  "mutation": { "enabled": false, "sample": 30 },
  "criticalRoutes": [],                            // URL patterns each visited by ≥ 1 flow (TST-010)
  "coverage": { "report": null, "changedLinesMin": 0.7 }   // report: lcov/cobertura path; null = auto-detect (TST-011)
}
```

## 2. Rules — `TST-*`

- **TST-001** · P0 · browser — Every declared flow passes in the verify environment with assertions on observable outcomes (URL, visible text, API/DB/email state), not just absence of errors.
- **TST-002** · P0 · browser — Flows with `persist: true` re-check their final assertions after a reload.
- **TST-003** · P1 · diff — Changes to files whose role is in `requireTestsFor` come with test changes that import or exercise them (route→file map + test import graph), or the finding is waived.
- **TST-004** · P1 · cmd, ast — Honest tests (pass/fail of the project's own tests is BLD-003). Part `order` (P1 · cmd): the tests run a second time, with the adapter `testShuffle` flag when declared, else in the same order. Per-test outcomes come from the JUnit XML the adapter test command writes (adapter `testReport` path; else whole-command exit codes). A test that passes in one run and fails in the other is a finding. Part `sleep` (P1 · ast): test files added or modified in the diff call no adapter `sleepApis` with a numeric-literal argument. Part `egress` (W · cmd): the egress proxy recorded a request to a host outside the verify environment during either run.
- **TST-005** · W · review — Tests assert behaviour through public interfaces rather than private implementation details.
- **TST-006** · P1 · cmd — With `mutation.enabled` (profile `nightly`): the Verifier draws `mutation.sample` mutants with the lock-digest PRNG from (changed line × applicable operator) pairs and reruns `commands.test` for each. Operators: `==`↔`!=`, `<`↔`>=`, `>`↔`<=`, `&&`↔`||`, `true`↔`false`, removal of a unary `!`, integer literal n → n+1, deletion of an expression-statement call. Mutants that fail to build are replaced by the next draw; a mutant that leaves all tests passing is a finding, unless no test imports the mutated file (then W).
- **TST-007** · P0 · cfg — Flows, fixtures and contracts used as oracles are Operator-owned and signed; agents propose new ones in `quality/proposals/`.
- **TST-008** · P1 · browser — Cross-browser: with `crossBrowser.enabled`, the listed flows also pass in Firefox and WebKit.
- **TST-009** · P1 · browser — Every flow step on `app` surfaces has zero uncaught errors from origin scripts and zero failed same-origin requests (flow steps on `public` surfaces are owned by RTE-013; errors from non-origin scripts are excluded, 04 § 6.1).
- **TST-010** · P1 · cfg, browser — Critical journeys have flows: each `security.authEndpoints` entry is requested during ≥ 1 flow (browser network log); with `security.payments`, ≥ 1 flow has `journey: "checkout"` and a `markAmount` step (which also feeds SEC-041); when any flow has `journey: "signup"`, ≥ 1 flow has `journey: "deletion"`; each `criticalRoutes` pattern is matched by a `goto` or `expectUrl` step of ≥ 1 flow (cfg part). Part `cancel` (P1 · cfg, browser): with `security.payments.recurring: true`, ≥ 1 flow has `journey: "cancel"` (it passes under TST-001); when additionally `privacy.jurisdictions` contains `"de"` (BGB § 312k), every public page has an `<a>` or `button` whose accessible name equals, after NFKC, case-fold and whitespace collapse, a ruleset `cancel-labels.json` entry for the page locale (fallback `ll-CC` → `ll`) ("Verträge hier kündigen", …), and an `<a>` of that kind answers 200. The withdrawal flow is owned by PRV-021 `flow`. Form coverage is owned by UX-001.
- **TST-011** · P2 · cmd — Changed-line coverage: when `services[].commands.coverage` is set, it runs in G1. Before it runs, shipgate deletes `coverage.report` (else every auto-detect candidate: `coverage/lcov.info`, `lcov.info`, `coverage/cobertura-coverage.xml`, `coverage.xml` under the service path); afterwards only a report that run produced is read (`coverage.report`, else the first candidate present), as lcov or Cobertura XML; of the diff's added or modified lines that the report lists as executable, in files whose role is in `requireTestsFor`, the share with a hit count > 0 is ≥ `coverage.changedLinesMin`. No `commands.coverage`: `skipped(no-coverage)`; no such executable changed lines: `notApplicable`; a missing report after the command ran: finding.

Flows reach the verify environment through the browser routing in 04 § 2; `submitEmpty` and `markAmount` steps (03 § 10) feed A11-003 and SEC-041.
