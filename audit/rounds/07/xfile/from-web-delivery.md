# Cross-file requests from web-delivery — round 07 — pass A

Each entry: target file · location · exact edit · finding served. Rows already applied by the target file's own fixer in pass A (checked before writing) are not repeated here.

## 1. spec/04-algorithms.md § 10 — HTTP sample definition
- Serves: concreteness-web-delivery#3.
- Location: insert after the `- **Sampling** (above 50,000 indexable pages …` bullet.
- Insert:
  `- **HTTP sample** and **browser-sampled pages** (the only definitions; every rule saying "HTTP sample (04 § 10)" or "browser-sampled" uses them). The HTTP sample is the set of crawled `public`-surface URLs answering 200 `text/html` kept by the Sampling rule above (all of them when the run is local and there are at most 50,000 indexable pages). Browser-sampled pages are the picks of the Sampling rule's browser stratum (min(3, group size) per route group, plus the always-included pages).`

## 2. spec/04-algorithms.md § 15 — Fallback body `{n}`
- Serves: concreteness-web-delivery#10 (TR-103 determinism of probes).
- Old: ``Fallback body (SEC-034):** the response to a random non-existent path `/sg-{n}<ext>`,``
- New: ``Fallback body (SEC-034):** the response to the non-existent path `/sg-{n}<ext>` (`{n}` = the first 8 hex characters of SHA-256(lock digest ‖ `0x00` ‖ `sg-probe`); the same `{n}` as the RTE-004 Unknown-URL probe),``

## 3. spec/04-algorithms.md § 12 — Leak scan exemption
- Serves: concreteness-web-delivery#27 (C10: agent-written exemption).
- Old: `` `data-shipgate-ignore="leaks"` excludes an element and is reported as W.``
- New: ``Elements are excluded only when matched by a selector of `web-delivery.leakIgnore` (CSS selectors, signed policy, default `[]`); each excluded element is reported as W. The attribute `data-shipgate-ignore` has no effect.``

## 4. spec/03-formats.md § 6 — `randomApis` and formatter argument roles
- Serves: concreteness-web-delivery#16 (RTE-011 part `random`, I18-006).
- Old: ```loggerApis`, `clockApis`, `hashApis` ``
- New: ``` `loggerApis`, `clockApis`, `randomApis` (RTE-011 `random`: e.g. `Math.random`, `crypto.randomUUID`, `crypto.getRandomValues`, Python `random.*`, Ruby `rand`), `hashApis` ```
- Old (row): ``| `formatterApis`, `urlBuilderApis` | ApiRef[] (ARC-006 `formatting` / `url`; e.g. `Intl.NumberFormat`, `Intl.DateTimeFormat`, `toLocaleString`, date-fns `format`; `new URL`, `URLSearchParams`) |``
- New (row): ``| `formatterApis`, `urlBuilderApis` | ApiRef[] (ARC-006 `formatting` / `url`; e.g. `Intl.NumberFormat`, `Intl.DateTimeFormat`, `toLocaleString`, date-fns `format`; `new URL`, `URLSearchParams`). `formatterApis` entries declare the `args` roles `locale` (required for I18-006; an entry without it is `noAdapterSupport` there), `timeZone` and `currency` where the API takes them (e.g. `Intl.DateTimeFormat`: `{ locale: 0 }`, `timeZone` as the option key of argument 1) |``

## 5. spec/03-formats.md § 6 — standard `config` setting names (WCF-003)
- Serves: concreteness-web-delivery#5 (WCF-003 now compares named settings).
- Old: ``| `config` | `{ <setting>: "<file-id>:<path>" }` readers |``
- New: ``| `config` | `{ <setting>: "<file-id>:<path>" }` readers. Standard setting names (WCF-003 compares these with the policy when an adapter returns them): `trailingSlash` (`"always"`\|`"never"`), `basePath` (path prefix), `i18n.locales` (BCP 47 tags), `i18n.defaultLocale` |``

## 6. spec/04-algorithms.md § 2 item 5 — URL-014 edge probes
- Serves: coverage-visibility#4 (new URL-014, edge part).
- Location: in item 5's request list, after the `GET for the social preview fetcher user agents on the homepage (MET-005 `fetchers` part, …)` clause.
- Insert: ``; with `edge.production: true`, GET for the URL-014 path variants of `/` on each `production.origins` entry (at most 8 requests per origin, redirects not followed)``
