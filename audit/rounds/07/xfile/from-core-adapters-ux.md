# Cross-file requests — from core-adapters-ux (01-core, 02-adapters, ux) — round 07 pass A

Each request: target file · location · exact edit · finding served. The "page locale" and "indexable" definitions are assumed to land in 04 § 15 (algorithms fixer); ux.md and 01 now cite "04 § 15 page locale" / "04 § 15 indexable".

## To 04-algorithms.md

X1. **04 § 15 *Lock-digest PRNG*** — append: "Value streams (SEC-030 fuzz values, probe nonces) are defined in 01 TR-103; the ChaCha8/Fisher–Yates procedure is gone." Serves concreteness-core-adapters-ux#4, consistency#107. (01 TR-103 now points here for selections and holds only the value-stream formula.)

X2. **04 § 1.6 step 2** (partial-run list) — insert after "- a run with any timing rule `skipped(slow-host)` (TR-111);": "- a run where a facts-oracle rule (UX-003, UX-013, UX-014, UX-019, UX-020, UX-023) or UX-021 used the `en` fallback of per-locale ruleset data for a page locale (ux § 3 *Page locale and per-locale data*);". Serves concreteness-core-adapters-ux#9.

X3. **04 § 1.9 `reduced-environment` row** — replace the condition with: "Reduced run; run with `skipped(slow-host)` timing rules when the signed policy has `verifyEnv.reduced` allowing reduced runs; or run with an unsupported page locale (ux § 3) — whose base verdict is `PASS` and whose only partial causes (§ 1.6 step 2) are these: not `check`, `--changed`, `--gate`, `--pack`, `--service` or `--adopt`, no planned services skipped, nothing `skipped(incomplete-crawl)` or `skipped(host-unsupported)`". Serves consistency#24 (01 TR-111 now says the slow-host handoff exists only with `verifyEnv.reduced`) and concreteness-core-adapters-ux#9.

X4. **04 § 1.2 facts-oracle list** — add "UX-023 part `claims`, UX-024 part `register`" (content kinds: commercial terms, unregistered images). **Required-facts list** — add "UX-023 part `minimum` (`terms.returns.windowDays`), UX-001 part `mobile` (mobile flow coverage of form keys)". Serves coverage-real-use#3, #17, #18. Note: UX-024 `register` was proposed as required-facts (operator-owned); adapted to facts-oracle (builder-owned) so adding an image can't earn an operator handoff.

X5. **04 § 1.5 prerequisites table, G8 row** — "G0 (UX-022: also G6)". Serves consistency#11 (ux.md UX-022 now says `blocked(prerequisite: G6)` when G6 did not run or is BLOCKED). SEC-065's part of that row belongs to the security/orchestrator side.

X6. **04 § 7 `brief`** — stage-start list add "the required pages with rule ids (TR-112)"; Output add "`business.json` excerpts for files with role `route`, `layout`, `component` and for `**/*.{md,mdx,markdoc}` outside `quality/` and the repo root: every key present (03 § 14), at most 40 lines, arrays cut in file order with the count of omitted entries (TR-112)". Serves consistency#108, concreteness-core-adapters-ux#5.

X7. **04 § 4.6** — add "G1 test commands get the proxy variables; the egress proxy starts before G1 when TST-004 applies (reduced runs: `skipped(reduced)`)". Serves consistency#114 (01 § 8 G1 row now cites 04 § 4.6 for this). Same text as the consistency row; skip if the algorithms fixer already applied it.

X8. **04 § 4.2 steps 5–6** — 03 § 8 *Operator-owned sources* relies on "04 § 4.2 statement log" to prove seeded rows weren't written by other statements, but statement logging is on only in step 4 and during G6. Add to step 5: "Statement logging stays on through steps 5 and 6, so 03 § 8 *Operator-owned sources* can attribute every row write (UX-020 *valid db source*)." Serves consistency#13.

## To 03-formats.md

X9. **03 § 14 Business facts** — add key `terms?: { returns?: { windowDays, free? }, refunds?: { processingDays }, warranty?: { months }, guarantee?: { days }, shipping?: [{ id, region, minDays, maxDays, free?, freeOver?: { amount, currency } }], trial?: { days, cardRequired }, cancellation?: { noticeDays, anytime? }, support?: { responseHours }, sla?: { uptimePercent } }`; value formats: day/hour/month counts non-negative integers, `uptimePercent` a decimal string, `freeOver.amount`/`currency` as `prices[]`; read by UX-023. Serves coverage-real-use#3.

X10. **03 § 14** — add entry: "**Image sources** — `quality/data/image-sources.json` (Operator-owned, locked): `{ formatVersion: 1, images: [{ match, origin: "own"|"generated"|"licensed"|"cc"|"free-stock", licence, evidence: url, attribution? }] }`; `match` a host+path glob (no scheme, no query) or `sha256:<64 hex>`; first match wins (UX-024)." Serves coverage-real-use#18.

X11. **03 § 17 report** — add `coverage.unsupportedLocales: [{ locale, rules: [ruleId] }]` (page locales served by the `en` fallback of per-locale ruleset data, ux § 3). Serves concreteness-core-adapters-ux#9.

X12. **03 § 17 `auditTargets` (03:500)** — replace "drawn with the lock-digest PRNG (01 TR-103, label `audit-targets`) from their sorted union (all when fewer); the Auditor writes one `review.json` entry per target with `target` set to that value" with "drawn with the lock-digest PRNG (04 § 15, stream id `audit-targets`) from their union (all when fewer); the Auditor writes one `review.json` entry per (applicable `review`-channel rule, target) pair, `rule` = that rule id, `target` = that value (01 § 10.2)". Serves consistency#125, concreteness-core-adapters-ux#4.

X13. **03 § 6 (adapter manifest) and 03:251** — add: "**Conformance result** — `quality/generated/conformance/<id>.json` (Verifier on Operator command): `{ formatVersion: 1, adapter, adapterSha256, fixturesSha256, ruleset, verifierVersion, passed, failures: [], signedBy, signature }`, Ed25519 signature (role `operator`) over the JCS without `signature`. `adapterSha256` = digest of `quality/adapters/<id>/**` (03 § 8 digest rules), `fixturesSha256` = same over the `--fixtures` dir. Valid while both digests match the current files; not tied to the lock (02 § 2)." and replace 03:251 "the result is signed with the lock" with "the result is the conformance file above". Serves consistency#110. Adapted from the consistency row's `<state dir>` location to `quality/generated/` so CI sees the same result as the local machine; if the 03 fixer keeps `<state dir>`, 02 § 2/§ 7 still read correctly (they cite "03 § 6").

X14. **03 § 9 debt** — "`debt record` sets `expires` = record date + 90 days for † rules/parts (else `null`); `debt add` requires `--expires` for them". Serves consistency#120 (01 § 5.5 now states it and cites 03 § 9). Skip if the 03 fixer already applied it.

## To 05-integrations.md

X15. **05 § 3.1 built-in protected paths** — add "shipgate's cache directory `<cache dir>/shipgate/**` (or user config `cache.dir`)". Serves consistency#103 (01 TR-001 now calls the cache dir a protected path, 05 § 3.1). Skip if the 05 fixer already applied it.

## To spec/packs/refactor.md

X16. **REF-009** — append: "UX-009 does not run in such runs (it is `notApplicable` when a signed `quality/refactor.json` exists or `--against` is given)." Serves consistency#111.

## To spec/packs/search-engines.md

X17. **LOC-001 Ownership sentence** — replace "LOC-001 `owns` `UX-003#phones` when this section applies" with "LOC-001 `owns` `UX-003#phones` on indexable pages (04 § 15 indexable) when this section applies; on other public pages UX-003 checks phone numbers". Serves concreteness-core-adapters-ux#8.

## To spec/packs/privacy.md

X18. **PRV-026 part `total`** — where it cites ruleset `payment-amounts.json`, add "(shape and matching: ux § 3)". Serves concreteness-core-adapters-ux#19.
