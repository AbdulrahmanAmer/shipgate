# Cross-file requests from web-delivery — round 08 — pass A

Each entry: target file · location · exact edit · finding served. Before writing, the target files were grepped: the 04 sides of consistency#44, #46, #49, #52, #53, #94 and the 02 side of consistency#88 are already applied by their own fixers and are not repeated. Entries 1–2 are rows that are also in the target fixer's own pass-A findings; apply only if not already applied.

## 1. spec/packs/resilience.md:28 (RES-008 area) — remote services
- Serves: consistency#44 (also in the resilience fixer's findings).
- Old: `Remote services: only with `nonProduction: true`; `remote: write`.`
- New: `Remote services: `skipped(remote)` (04 § 4.5); `remote: write`.`
- web-delivery side applied: RTE-007 now says remote fault stages are `skipped(remote)` and lists the URLs not faulted (web-delivery.md:137).

## 2. spec/packs/resilience.md:21, :17 — RES-001 dependency faults
- Serves: consistency#45 (also in the resilience fixer's findings).
- RES-001: "Database unavailable, API surface (pages: RTE-007)." → "Dependency unavailable, API surface (pages: RTE-007)."; "is re-sent in the database-down fault stage (04 § 4.5)" → "is re-sent in each 04 § 4.5 fault stage other than `delayed` (database stopped; each `dependency` host refused or answering 503)"; "(the request does not depend on the database)" → "(the request does not depend on the faulted dependency)".
- resilience.md:17: "RES-001 needs a database (`verifyEnv.databases`)" → "RES-001 needs a database or a dependency host".
- web-delivery side applied: RTE-007 "(04 § 4.5: database stopped, upstream refused or answering 503)" (web-delivery.md:137).

## 3. spec/04-algorithms.md § 1.2 (line 35) — required-facts list
- Serves: consistency#47 (TRS-001) and consistency#46 (URL-011; check — the list already mentions "URL-011 for an alias-host wildcard no concrete …", keep that).
- Insert into the **Required-facts rules** parenthesised list, after "LOC-003 for `project.kinds` including `local-business`": `; TRS-001 contact match (no `business.json` `phones`/`emails`)`.
- web-delivery side applied: TRS-001 (web-delivery.md:302) now names `business.json` `phones[].e164`/`emails[]` as the only oracle and raises a blocking `missing-element` owned by `operator` when they are absent.

## 4. spec/packs/ux.md:37 (UX-006) — control click probe also serves RTE-017 `button`
- Serves: consistency#93.
- Old: `It runs whenever UX-001, UX-006, MET-011 `dead-anchor` or PRF-002 `probe` applies;`
- New: `It runs whenever UX-001, UX-006, MET-011 `dead-anchor`, RTE-017 `button` or PRF-002 `probe` applies; before the reload that follows a click, it records the `a[href]` targets the click added to the DOM (RTE-017 `button`);`
- web-delivery side applied: RTE-017 part `button` names the probe and the recorded observation (web-delivery.md:153).

## 5. spec/04-algorithms.md § 2 item 2 (line 133) — front proxy forwards geo headers
- Serves: coverage-visibility#3 (new I18-011, part `geo`).
- Old: `The exception is probe requests that shipgate itself marks with an internal header, which the proxy strips; for those it passes the probe's own `Host`, `X-Forwarded-Host` and the SEC-021 `override-headers` (including `X-Forwarded-For`/`X-Real-IP`) through unchanged`
- New: `The exception is probe requests that shipgate itself marks with an internal header, which the proxy strips; for those it passes the probe's own `Host`, `X-Forwarded-Host`, the SEC-021 `override-headers` (including `X-Forwarded-For`/`X-Real-IP`) and the I18-011 country headers (ruleset `geo-headers.json` `headers`) through unchanged`

## 6. spec/04-algorithms.md § 2 item 5 (edge pass request list, lines 135–150)
- Serves: coverage-visibility#4 (MET-014), coverage-real-use#5 (URL-015), concreteness-web-delivery#12 (MET-005 part rename).
- In the first bullet replace "GET for the social preview fetcher user agents on the homepage (MET-005 `fetchers` part, which compares `og:*` values from the body)" with "GET for the social preview fetcher user agents on the homepage (MET-005 `fetchers-edge` part, which compares `og:*` values from the body)".
- Insert after the "SE-008 and AEO-008 user-agent checks" bullet:
  `- MET-014 parts `indexable` and `resolve`: the media set of the homepage and the first 5 URLs of the edge sample, at most 50 requests per origin;`
  `- URL-015: each http→https, apex↔www and URL-011 alias-host homepage probe repeated once with the campaign query (at most 2 + the number of alias hosts requests per origin);`
