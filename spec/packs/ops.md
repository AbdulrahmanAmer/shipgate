# Pack: ops

> Logs, health, error reporting, email, configuration and process lifecycle, checked inside the verify environment. Production monitoring (uptime, real-user metrics) is a separate later product.

---

## 1. Policy section

```jsonc
"ops": {                                       // health endpoints = verifyEnv.health entries with endpoint: true
  "errorReporting": { "provider": "sentry", "dsnVar": "SENTRY_DSN" },    // or null
  "email": {
    "fromDomains": ["example.com"],
    "bulkSenders": ["newsletter@example.com"],
    "dnsCheck": true                                                  // SPF/DKIM/DMARC checked in the edge pass
  },
  "env": {
    "example": ".env.example",                                        // per service, relative to services[].path (OPS-010)
    "optional": []                                                    // vars in the example file the service may start without
  },
  "shutdownSec": 10                                                   // OPS-012
}
```

## 2. Rules — `OPS-*`

- **OPS-001** · P0 · http — Service logs captured during G4/G6 contain no secrets (classification of SEC-005), test-account passwords, session tokens, card numbers (Luhn-valid 13–19 digits) or full email addresses of test accounts.
- **OPS-002** · P1 · http — Health endpoints (`verifyEnv.health` with `endpoint: true`) return 200 when dependencies are up and a non-200 status when the database is down (shares fault injection with RES-001); they expose no secrets or versions of internal components.
- **OPS-003** · W · ast, cfg — An error-reporting integration is configured for each service and reads its DSN from the env module. In the verify environment its traffic is captured by the egress proxy and never sent; shipgate only checks that it is wired and that an injected server error produces a captured event.
- **OPS-004** · P1 · browser — Emails captured by the SMTP sink during flows: links are absolute and use the service's origin (never localhost or preview hosts in production mode); every HTML email has a plain-text part; sender domain ∈ `fromDomains`.
- **OPS-005** · P1 · browser — Bulk/marketing emails (from `bulkSenders`) include `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers and a visible unsubscribe link. Part `postal` (P1): their text part contains `business.json` `postalAddress` (or the first location's address), as CAN-SPAM requires.
- **OPS-006** · P1 · edge — With `dnsCheck`, each `fromDomains` entry publishes SPF, DKIM for each selector in `email.dkimSelectors` (no selectors declared → the DKIM part is W) and a DMARC policy (read-only DNS lookup in G8).
- **OPS-007** · P1 · http — Every response carries a request id in `x-request-id`, `request-id` or `traceparent`, and the same id appears in the service log line for that request.
- **OPS-008** · W · http — Denied probes are visible: each security probe answered 401, 403 or 429 (SEC-* authentication, authorization, CSRF and rate-limit probes) produces a service log line at level warn or higher (structured `level`/`severity` field, else a level token per adapter `loggerApis`) that contains the response's request id (OPS-007).
- **OPS-009** · P1 · cfg — Toolchain versions are pinned and agree: each service pins its runtime (e.g. `package.json` `engines.node` within one major, `.nvmrc`/`.node-version`, `.python-version` or `requires-python`, `.ruby-version`, `.tool-versions`/`mise.toml`) and its package manager exactly (`packageManager` field, or the lockfile's declared version); every runtime version found in those files, in the host config for `services[].host` (e.g. `netlify.toml` `NODE_VERSION`, Cloudflare Pages `NODE_VERSION`; Vercel reads `engines.node`) and in CI workflow files (e.g. `actions/setup-node` `node-version`, `setup-python` `python-version`; `*-version-file` inputs follow the file) resolves to the same major (exact when any source is exact). Version sources per runtime: ruleset `runtime-pins` table.
- **OPS-010** · P1 · cfg, http — Environment contract: every variable read by the service (the `architecture.<service>.envModule` when set, else adapter `envReadApis` call sites with literal names) appears in `env.example`; shipgate-injected variables (SEC-005 list) are exempt. Start probe (04 § 4.1, after BLD-005): the service started with its verify environment minus one variable, chosen by the PRNG seeded with the lock digest among the env-module variables (the variables read by the service, as above) that are not in `env.optional` and not shipgate-injected, exits non-zero within `verifyEnv.health.<service>.timeoutSec` and its output names the variable. Serving health 200 or hanging is a finding.
- **OPS-011** · P1 · http, browser — Error-reporting payloads are clean: events sent to the `errorReporting` provider's hosts during G4/G6 (server-side via the egress proxy, client-side as recorded browser requests), including those from injected errors (OPS-003), contain no secrets (SEC-005 classification), test-account passwords, session token values or test-account email addresses. Log contents are owned by OPS-001.
- **OPS-012** · W · http — Graceful shutdown: after `SIGTERM` the service exits within `shutdownSec` with code 0 or 143, and a request in flight when the signal was sent completes. On Windows (no `SIGTERM` for console processes): `skipped(platform)`.
- **OPS-013** · W · db — Scheduled jobs don't overlap: running a `data-api.jobs` entry's `run` twice concurrently (mutating stage, 04 § 4.2 step 8) yields the same `writes` table contents as one run (a lock, `SKIP LOCKED` or platform concurrency limit). Sequential idempotency is owned by JOB-002.
- **OPS-014** · W · browser — HTML emails captured by the SMTP sink during flows render for everyone: part `lang` — the root `<html>` has a non-empty `lang`; part `alt` — every `<img>` has an `alt` attribute (empty allowed); part `dark-logo` — the logo (first `<img>` whose `src`, `alt`, `class` or `id` contains `logo`, case-insensitive, else the first `<img>`; none → `notApplicable`), screenshotted alone in Chromium with `omitBackground`, fails when ≥ 10 % of its pixels have alpha < 0.5, the mean colour of its pixels with alpha ≥ 0.5 has a contrast ratio < 3:1 against `#121212`, and the `<img>`'s computed `background-color` is transparent (a dark transparent logo vanishes in dark-mode clients).
