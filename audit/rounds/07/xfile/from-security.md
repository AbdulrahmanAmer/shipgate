# Cross-file requests from security — round 07 pass A

Each entry: target file · location · exact edit · finding served. Anchors are quoted text, not line numbers (other fixers are editing in parallel).

## X1 — 03-formats.md § 10: `logout` journey
- Location: the flow example line `"journey": "signup",        // login | signup | checkout | contact | deletion | export | withdrawal | cancel | other (default other)`
- Edit: `// login | signup | checkout | contact | deletion | export | withdrawal | cancel | other (default other)` → `// login | logout | signup | checkout | contact | deletion | export | withdrawal | cancel | other (default other)`
- And after "`_login.json` is the login flow." append: " Flows with `journey: \"logout\"` are the logout flows (SEC-028; they run as their `account`, after it has logged in)."
- Serves: concreteness-security#1, consistency#73.

## X2 — testing.md TST-010: require a logout flow
- Location: TST-010, after "when any flow has `journey: \"signup\"`, ≥ 1 flow has `journey: \"deletion\"`;"
- Edit: insert " when `auth.strategy` ≠ `\"none\"`, ≥ 1 flow has `journey: \"logout\"` and a non-null `account` (SEC-028 owns the finding when it is missing);"
- Serves: concreteness-security#1.

## X3 — 03-formats.md § 4 `tokenTtlVar` comment
- Location: `"tokenTtlVar": null                        // env var the app honours to shorten token lifetimes in verify; holds the lifetime as integer seconds (read by SEC-029, SEC-037 `expired`, SEC-044 expiry checks)`
- Edit: append " — also the format of `security.session.idleVar`/`absoluteVar` (security.md shared definitions *Lifetime variables*)". Text already matches security.md otherwise; no other change.
- Serves: concreteness-security#5, consistency#85 (03 side already applied by its fixer).

## X4 — 04-algorithms.md § 1.2 required-facts list: SEC-064 `maxima`
- Location: "**Required-facts rules (PRV-022 parts `imprint`, …; LOC-003 for `project.kinds` including `local-business`):**"
- Edit: insert "SEC-064 `maxima` when a non-`null` session-lifetime maximum applies and neither `security.session.<kind>Var` nor `<kind>Sec` gives a value; " before "LOC-003". And in the sentence listing the missing facts add "a missing `security.session.idleSec`/`absoluteSec`".
- Serves: concreteness-security#3.

## X5 — 04-algorithms.md § 1.8: static part severities
- Location: § 1.8 first paragraph, after "the detector that emits the finding …" sentence.
- Edit: append "A part's severity is static; an input-dependent downgrade is a separate part (e.g. SEC-025 `rate-limit` P1 / `rate-limit-edge` W, SEC-054 `requests` P1 / `requests-edge` W, SEC-052 `licence-unknown` W, `deprecated-unknown` W, SEC-053 `age-unknown` W, SEC-073 `version-unknown` W) or a `notConfigured` outcome naming the missing input (SEC-029 `expiry`, SEC-037 `expired`, SEC-044 `signed-url-expiry` without `auth.tokenTtlVar`)."
- Serves: consistency#84.

## X6 — 04-algorithms.md § 13: request-derived data flow
- Location: § 13 Static analysis precision, new bullet after the SEC-001 bullet.
- Edit: insert "- **Request-derived data flow** (SEC-003 `source`, SEC-027, SEC-045, SEC-062): from a `requestSources` call (03 § 6) or a route-handler parameter, through assignments in the function and one call level into same-module functions. For SEC-062 `output-sinks` the source is instead the return value of a `modelApis` call, followed the same way."
- Note: 03 § 6 `requestSources` is already applied (03-formats.md, adapter manifest table). security.md now cites "04 § 13 *Request-derived data flow*" in SEC-003, SEC-027, SEC-045.
- Serves: consistency#86.

## X7 — 04-algorithms.md § 15 reference time: SEC-015 is wall-clock
- Location: "Those that are time-based (SEC-056 certificate validity, SEC-059, IDX-011) use the wall clock."
- Edit: "(SEC-056 certificate validity, SEC-059, IDX-011)" → "(SEC-015 `Expires`, SEC-056 certificate validity, SEC-059, IDX-011)"
- Serves: consistency#92.

## X8 — 04-algorithms.md § 13 SEC-050 secret scan: env-value condition
- Location: "- **SEC-050 secret scan (diff):** … and literal values of non-public env vars from `verify.env` (part `env-value`) are P0†"
- Edit: "literal values of non-public env vars from `verify.env` (part `env-value`)" → "literal values of non-public `verify.env` variables that are secrets per SEC-005 (secret-like name with a value of ≥ 8 characters that is not purely digits nor `true`/`false`/`null`, or ≥ 16 characters with entropy ≥ 3.5 bits/char) (part `env-value`)"
- Serves: concreteness-security#10.

## X9 — 04-algorithms.md § 15 `remote` metadata (consistency#68, primary Location 04-algorithms.md)
- The fix lies wholly in 04 § 15 and 03 § 5 `parts`; apply it as written in consistency#68 if the 04/03 fixers have not. security.md needs no edit: every mutating SEC rule/part already says "(mutating stage, 04 § 4.2 step 8)", which the proposed 04 text keys on; SEC-047 `reflected` (`remote: read`) and SEC-072 (`remote: write`) keep their per-part statements, which need the 03 `parts[].remote` key.
- Serves: consistency#68.

## X10 — SEC-055 is now a "hidden" consumer (informational, 04 § 15 *Hidden content*)
- Location: "- **Hidden content** (CNT-009, SE-109, SE-123, AEO-014 and any rule that says \"hidden\" — …"
- Edit: "(CNT-009, SE-109, SE-123, AEO-014 and any rule" → "(CNT-009, SE-109, SE-123, AEO-014, SEC-055 honeypot fields (items 1–6, applied to form fields whatever their text) and any rule"
- Serves: consistency#89.

## Already applied by other fixers (verified in the current text; no request needed)
- consistency#71 — 03-formats.md `smtp` row: "`true` when any flow has an `expectEmail` or `openEmailLink` step, or SEC-025, SEC-038, SEC-039, SEC-054 or SEC-067 applies".
- consistency#74 — 04-algorithms.md § 4.2 step 8 list: "SEC-021 `override-headers` (repetitions of non-GET/H…".
- consistency#76 — data-api.md API-003 (c): "other-tenant requests answer 403 or 404 (whether access is refused at all: SEC-021/SEC-023)"; "Kinds (a) and (e) on SEC-030 fuzz requests are reported by SEC-030 `behaviour` only".
- consistency#79 — data-api.md API-007: "Operations whose request media type is not `application/…` are excluded".
- consistency#82 — 04-algorithms.md § 1.1: "one that reads the migrated database before the first probe (DB-001, DB-004, DB-009, DB-011 `emulator`, SEC-04…".
- consistency#83 — 04-algorithms.md § 4.4: "SEC-043/SEC-044 behaviour parts run only with `platform.supabase.mode: \"external\"` …".
- consistency#90 — 04-algorithms.md § 2: "SEC-059: DNS lookups and two GETs (https and http root) per listed host".

## Pass B additions (round 07)

### XB1 — spec/04-algorithms.md § 1.2, required-facts paragraph
- Old: "The same holds for the PRV-002/PRV-014, PRV-026 `total` and PRV-028 outcomes that their pack text says are owned by `operator`."
- New: "The same holds for the PRV-002/PRV-014, PRV-026 `total` and PRV-028 outcomes, and the missing-flow outcomes of SEC-018, SEC-028 and SEC-067 (flows are Operator-owned, 01 § 5.2), that their pack text says are owned by `operator`."
- Serves: passB-notes item 3 (SEC-028 no logout flow → operator handoff), xfile-formats-integrations#8; same reasoning applied to SEC-018 (no flow fills a password-set input) and SEC-067 (no signup flow; signup flow without `openEmailLink`).
