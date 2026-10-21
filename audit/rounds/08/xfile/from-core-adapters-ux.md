# Cross-file requests — from core-adapters-ux — round 08 pass A

Requests marked *(also in the owner's pass-A inputs)* repeat a consistency row whose Location already names the target file; apply once, reject as "already fixed" if done. Requests for `BUILD_MAP.md`, `trace/ownership.tsv` and `spec/CHANGES.md` are not here (07 passB-notes item 5); they are in `resolution-core-adapters-ux-A.md` under Ownership rows / Ruleset data.

## spec/03-formats.md

1. **§ 6 adapter manifest field table** — serves concreteness-core-adapters-ux#22. Insert after the `errorPageFingerprints` row:
   `| \`builderAssets\` | glob[] of host+path (03 § 2.1 glob syntax, without scheme or query) whose scripts the hosted builder injects and the Builder can't remove; a PRF-010 JavaScript-bytes finding on such scripts gets the hint "set in the builder" (02 § 5 \`hosted-builder\`) | | \`[]\` |`
2. **§ 14 Business facts shape** — serves coverage-visibility#8 (new UX-027). Replace `ratings: [{ source, value, best?, count, asOf }]` with `ratings: [{ source, value, best?, count, asOf, incentive? }]`, and `testimonials: [{ text, author, source, consentedOn }]` with `testimonials: [{ text, author, source, consentedOn, incentive? }]`. In the value-format list, after "`asOf`, `consentedOn`, `validUntil` `YYYY-MM-DD`;" insert: "`incentive` (UX-027) `\"none\"` or a non-empty array of distinct values from `\"discount\"`, `\"payment\"`, `\"free-product\"`, `\"other\"`, no default (an absent value is the UX-027 `declared` finding, not CFG-001);".
3. **§ 3.5 "no default" table, ux row** — serves consistency#82 *(also in the owner's pass-A inputs)* and the new key `ux.trackingIds` (coverage-real-use#1). Replace `| ux | — | \`contactPath\` |` with `| ux | — | \`contactPath\`, \`socialProofSources\`, \`stockSources\`, \`trackingIds\` |`.
4. **§ 3.4 `smtp.enabled` default (03:109)** — consistency#67 *(also in the owner's pass-A inputs)*: default → "`true`. `false` is rejected (CFG-001) when any flow has an `expectEmail` or `openEmailLink` step, a UX-022 form key has an `email:` outcome, a `raceSensitive` entry has an `email` effect, the ops pack is enabled, or SEC-025, SEC-038, SEC-039, SEC-054, SEC-067, API-006 or JOB-002 applies". (01 TR-007 now reads "…and so is the SMTP sink unless `verifyEnv.smtp.enabled` is `false` (03 § 3.4)".)
5. **§ 8 lock inputs (03:298)** — consistency#66 *(also in the owner's pass-A inputs)*: "every file under each service's migrations dir (`data-api.db.migrations.dir` for the `data-api.db.service` service, else the primary adapter's `migrations.dir`)". (01 CFG-002 now names `data-api.db.service`.)
6. **§ 19 toolchain list (03:551)** — consistency#113 *(also in the owner's pass-A inputs)*: after "Supabase schema DDL," add "the Firebase emulator suite with its JRE (where a build exists for the platform; DB-011 `emulator`),". (01 TR-001 now lists it.)

## spec/04-algorithms.md

7. **§ 1.2 required-facts rules list** — serves concreteness-core-adapters-ux#3 and the new UX-025/UX-027. In the rule list, replace "UX-001 part `mobile`;" with "UX-001 part `mobile`; UX-025 part `declared`; UX-027 part `declared`;". In the parenthesised examples, replace "a form key or `checkout`/`signup` journey without a mobile flow" with "a form identity (UX-001) or `checkout`/`signup` journey without a mobile flow, an analytics or advertising `hosts[]` entry without a `ux.trackingIds` entry, a `testimonials[]`/`ratings[]` entry without `incentive`".
8. **§ 1.2 facts-oracle rules list** — serves coverage-real-use#1. Replace "UX-024 part `register`," with "UX-024 part `register`, UX-025 part `static`,". (UX-013 is already listed; its new part `regulated` is covered by that entry.)
9. **§ 4.2 step 8 stage order (04:203)** — consistency#43 *(also in the owner's pass-A inputs)*: as the consistency row's 04 clause.
10. **§ 4.2 after step 6 (04:208)** — consistency#62 *(also in the owner's pass-A inputs)*: as the consistency row's 04 clause. (01:218 now reads "…or the seed contract when neither seed inputs, migrations nor the service's own files changed)".)
11. **§ 1.5 early stop (04:67)** — consistency#70 *(also in the owner's pass-A inputs)*: as the consistency row's 04 clause. (01:171 now says "an invalid lock signature".)
12. **§ 4 step 4 (04:189)** — consistency#66 *(also in the owner's pass-A inputs)*: "…applied natively for `sql-dir`, otherwise the `migrate` command of the service named by `data-api.db.service`."
13. **§ 11 live-mode snapshot (04:406)** — consistency#21 *(also in the owner's pass-A inputs)*: "`commands.snapshot` or `family.snapshot { db, sql }` → JSONL." → "`family.snapshot { db, sql }` → JSONL (ownership and no-source outcome: programmatic § 6 *live*)." (01 CFG-002 no longer lists a `snapshot` command; CFG-001 now rejects a live-mode family without `family.snapshot`.)

## spec/05-integrations.md

14. **§ 2.1 launch checks (05:116)** — consistency#108: "…runs the launch checks (IDX-011, URL-011, SEC-065, UX-022, REF-010) against…". (01 CFG-009 updated.)
15. **PreToolUse matcher (05:157)** — consistency#111: "(`Edit|Write|MultiEdit|NotebookEdit|Bash|Read|Grep|Glob`)", and the pre-hook denies `read` events on `quality/verify.env`. (01 § 5.2 table updated to say so.)

## spec/packs/programmatic.md

16. **§ 6 `live` (programmatic.md:257)** — consistency#21 *(also in the owner's pass-A inputs)*: as the consistency row's programmatic clause, but the no-`family.snapshot` case is CFG-001 (01 CFG-001 now says "a live-mode programmatic family without `family.snapshot` is a CFG-001 finding (programmatic § 6 *live*)"); keep the blocking `missing-element` (owner `operator`) for a snapshot that isn't an Operator-owned source. Delete any mention of `commands.snapshot`.

## spec/packs/search-engines.md

17. **LOC-001 `phones` (search-engines.md:130)** — consistency#37: replace "or in a `tel:` link equals a `business.json` `phones[].e164` or `locations[].phone`." with "or in a `tel:` link equals a `business.json` `phones[].e164`, `locations[].phone`, `legal.host.phone` or `legal.grievanceOfficer.phone`." (UX-003 `phones` updated the same way.)

## spec/packs/web-delivery.md

18. **URL-011 (web-delivery.md:162)** — consistency#89 *(also in the owner's pass-A inputs)*: replace "Alias hosts (with `edge.production: true`)" with "Alias hosts (with `project.stage: \"live\"` and `edge.production: true`, otherwise `notApplicable`)".
19. **IDX-012 (web-delivery.md, IDX-012)** — serves coverage-real-use#4 (new UX-026). Append: "Whether search works (results, empty state) is UX-026 (ux)."

## spec/packs/privacy.md

20. **PRV-037 `notice` (privacy.md:132)** — consistency#39 *(also in the owner's pass-A inputs)*: replace "(G6 mutating flow). Part `terms`" with "(G6 mutating flow; mutating stage, 04 § 4.2 step 8; `remote: write`). Part `terms`".

## spec/packs/ops.md

21. **ops.md:24** — consistency#23 *(also in the owner's pass-A inputs)*: replace `unknown values fail CFG-001` with ``unknown values are a CFG-006 `schema-violation` (ruleset-id value)``.

## spec/packs/resilience.md

22. **RES-008 (resilience.md:28)** — consistency#43 *(also in the owner's pass-A inputs)*: after the first sentence insert "Form keys are the G6 UX-001 result of the same run (as UX-022): when G6 did not run or is `BLOCKED`, RES-008 is `blocked(prerequisite: G6)` and never passes on an empty key list."

## spec/packs/data-api.md

23. **`data-api.db` (data-api.md after line 24)** — consistency#66 *(also in the owner's pass-A inputs)*: add `    "service": "api",                                  // the service whose database and migrations these are; required when several services exist (CFG-006), else the only service`.
