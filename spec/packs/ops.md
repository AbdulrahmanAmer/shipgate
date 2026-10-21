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
`errorReporting.provider` is a key of ruleset `error-reporting-providers.json` (`{ "<provider>": { hosts: [hostPattern], sdkPackages: [] } }`: sentry, bugsnag, rollbar, honeybadger, datadog, newrelic, posthog); unknown values fail CFG-001. Provider hosts = that entry's `hosts` ∪ `hosts[]` entries with purpose `monitoring`. With `errorReporting: null`: OPS-003 and OPS-011 are `notApplicable`.

## 2. Rules — `OPS-*`

- **OPS-001** · P0 · http — Service logs captured during G4/G6 contain no secrets (classification of SEC-005), test-account passwords, session tokens, card numbers (Luhn-valid 13–19 digits) or full email addresses of test accounts.
- **OPS-002** · P1 · http — Health endpoints (`verifyEnv.health` with `endpoint: true`) return 200 when dependencies are up and a non-200 status when the database is down (shares fault injection with RES-001). The health response body contains no SEC-005 secret value, no JSON key (any depth) named `version`, `versions`, `commit`, `gitSha` or `build` except at the top level, and no database engine name or lockfile package name followed within 20 characters by `\d+\.\d+`.
- **OPS-003** · W · ast, cfg, http — An error-reporting integration is configured for each service (a provider `sdkPackages` entry is a dependency of the service) and reads its DSN (`dsnVar`) from the env module. In the verify environment its traffic is captured by the egress proxy and never sent. Part `event` (http): a request sent while the database-down fault (04 § 4.5) is active that answers 5xx is followed within 10 s by a request to a provider host recorded by the egress proxy.
- **OPS-004** · P1 · browser — Emails captured by the SMTP sink during flows: links are absolute and use the service's origin (never localhost or preview hosts in production mode); every HTML email has a plain-text part; sender domain ∈ `fromDomains`.
- **OPS-005** · P1 · browser — Bulk/marketing emails (from `bulkSenders`) include `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers, the HTML part has an `<a href>` whose text, after NFKC, case-fold and whitespace collapse, contains a ruleset `unsubscribe-labels.json` entry for the email's `lang` (else `en`), and the text part contains a URL. Part `postal` (P1): their text part contains `business.json` `postalAddress` (or the first location's address), as CAN-SPAM requires.
- **OPS-006** · P1 · edge — With `dnsCheck`, for each `fromDomains` entry (read-only DNS lookups in G8): part `spf`: exactly one TXT record at the domain starting `v=spf1`; part `dkim`: for each selector in `email.dkimSelectors`, a TXT record at `<selector>._domainkey.<domain>` containing `p=` with a non-empty value (no selectors declared → part `dkim` is a W finding asking the Operator to declare them); part `dmarc`: a TXT record at `_dmarc.<domain>` starting `v=DMARC1` with a `p=` tag.
- **OPS-007** · P1 · http — Every response from a service process (not host-emulation static files) to a G4 HTTP probe carries a request id in `x-request-id`, `request-id` or `traceparent` (the id is its trace-id field), and the same id appears in the service log line for that request.
- **OPS-008** · W · http — Denied probes are visible: each security probe answered 401, 403 or 429 (SEC-* authentication, authorization, CSRF and rate-limit probes) produces a service log line at level warn or higher (structured `level`/`severity` field, else a level token per adapter `loggerApis`) that contains the response's request id (OPS-007).
- **OPS-009** · P1 · cfg — Toolchain versions are pinned and agree: each service pins its runtime (e.g. `package.json` `engines.node` within one major, `.nvmrc`/`.node-version`, `.python-version` or `requires-python`, `.ruby-version`, `.tool-versions`/`mise.toml`) and its package manager exactly (`packageManager` field, or the lockfile's declared version); every runtime version found in those files, in the host config for `services[].host` (e.g. `netlify.toml` `NODE_VERSION`, Cloudflare Pages `NODE_VERSION`; Vercel reads `engines.node`) and in CI workflow files (e.g. `actions/setup-node` `node-version`, `setup-python` `python-version`; `*-version-file` inputs follow the file) resolves to the same major; when any source pins an exact version, every other source is that exact version or a range containing it. Version sources per runtime: ruleset `runtime-pins` table.
- **OPS-010** · P1 · cfg, http — Environment contract: every variable read by the service (the `architecture.<service>.envModule` when set, else adapter `envReadApis` call sites with literal names) appears in `env.example`; shipgate-injected variables (SEC-005 list) are exempt. Start probe (04 § 4.1, after BLD-005): the service started with its verify environment minus one variable, chosen by the PRNG seeded with the lock digest among the env-module variables (the variables read by the service, as above) that are not in `env.optional` and not shipgate-injected, exits non-zero within `verifyEnv.health.<service>.timeoutSec` and its output names the variable. Exit 0, health 200, or no exit within the timeout is a finding (`runtime-error`). No eligible variable: the start probe is `notApplicable`.
- **OPS-011** · P1 · http, browser — Error-reporting payloads are clean: events sent to the `errorReporting` provider's hosts during G4/G6 (server-side via the egress proxy, client-side as recorded browser requests), including those from injected errors (OPS-003), contain no secrets (SEC-005 classification), test-account passwords, session token values or test-account email addresses. Log contents are owned by OPS-001.
- **OPS-012** · W · http — Graceful shutdown: after `SIGTERM` the service exits within `shutdownSec` with code 0 or 143, and a request in flight when the signal was sent completes. On Windows (no `SIGTERM` for console processes): `skipped(platform)`.
- **OPS-013** · W · db — Scheduled jobs don't overlap: after a `data-api.jobs` entry's `run` executes twice concurrently on one fresh instance (mutating stage, 04 § 4.2 step 8), its `writes` table contents equal those after a single run on another fresh instance (04 § 15 "No side effect" row hashing, restricted to `writes`), and the concurrent pair produces no more captured emails or egress requests than the single run (a lock, `SKIP LOCKED` or platform concurrency limit). Sequential idempotency is owned by JOB-002.
- **OPS-014** · W · browser — HTML emails captured by the SMTP sink during flows render for everyone: part `lang` — the root `<html>` has a non-empty `lang`; part `alt` — every `<img>` has an `alt` attribute (empty allowed); part `dark-logo` — the logo (first `<img>` whose `src`, `alt`, `class` or `id` contains `logo`, case-insensitive, else the first `<img>`; none → `notApplicable`), screenshotted alone in Chromium with `omitBackground`, fails when ≥ 10 % of its pixels have alpha < 0.5, the mean colour of its pixels with alpha ≥ 0.5 has a contrast ratio < 3:1 against `#121212`, and the `<img>`'s computed `background-color` is transparent (a dark transparent logo vanishes in dark-mode clients).
