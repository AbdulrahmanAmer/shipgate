# Resolution — core-adapters-ux — pass B — round 08

Files: spec/01-core.md, spec/02-adapters.md, spec/packs/ux.md. Inputs: every `audit/rounds/08/xfile/from-*.md` request whose target is in these files (15 rows), plus `audit/rounds/07/passB-notes.md` (items 1–5 still hold; no request contradicts them). No request in `from-core-adapters-ux.md` (my own), `from-programmatic-search.md` or `from-security.md` targets my files (programmatic-search explicitly does not re-request the #21 01 half or the #37 ux half). Requests for BUILD_MAP / ownership.tsv / CHANGES / tools: none addressed to my files.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-algorithms#21 | 01 CFG-002 drop `snapshot`; CFG-001 sentence | rejected (already fixed) | 01-core.md:132, :133 | Pass A (consistency#21): CFG-001 reads "a live-mode programmatic family without `family.snapshot` is a CFG-001 finding (programmatic § 6 *live*)"; CFG-002 lists only `start` and `migrate`. |
| xfile-algorithms#62 | 01:218 seed contract | rejected (already fixed) | 01-core.md:218 | Reads "…or the seed contract when neither seed inputs, migrations nor the service's own files changed)" (pass A). |
| xfile-algorithms#66 | 01:133 `data-api.db.service` | rejected (already fixed) | 01-core.md:133 | Reads "`migrate` (for the service named by `data-api.db.service`, when the data-api pack is enabled and `data-api.db.migrations.format` isn't `sql-dir`)" (pass A). |
| xfile-algorithms#67 | 01:149 TR-007 SMTP sink | rejected (already fixed) | 01-core.md:149 | Reads "…and so is the SMTP sink unless `verifyEnv.smtp.enabled` is `false` (03 § 3.4)." (pass A). |
| xfile-algorithms#70 | 01:171 early stop | rejected (already fixed) | 01-core.md:171 | Reads "only CFG-001/008, licence and an invalid lock signature stop the whole run" (pass A). |
| xfile-algorithms#83 | ux.md:12 `egressStubs` comment | rejected (already fixed) | ux.md:12 | Already the consistency#83 text ("stub reply for every request to that host, server-side and in the browser, for the whole run (04 § 4.6; also model-provider hosts) …"), plus status/body types (pass A). |
| xfile-algorithms#84 | ux.md UX-024 channels | rejected (already fixed) | ux.md:66 | Reads "- **UX-024** · P1 · browser — Image rights register" (pass A). |
| xfile-algorithms#101 | 01:161 modes table | rejected (already fixed) | 01-core.md:161 | Reads "`PASS` / `FAIL` / `BLOCKED`, or `PARTIAL` when the run has a partial cause (04 § 1.6 step 2)" (pass A). |
| xfile-data-refactor-arch-aeo-ops-testing-resilience#10 | 01 TR-106 RDAP network bullet (OPS-016) | fixed | 01-core.md:260 | Inserted after "- declared hosts;" verbatim. Consistent with ops.md:45 (OPS-016: IANA bootstrap `https://data.iana.org/rdap/dns.json`, then the registry's RDAP service; read-only GETs; `edge.production: true`). |
| xfile-formats-integrations#1 | 02 § 3 example `fileRoles` | fixed | 02-adapters.md:42 | Now an ordered `[{ glob, role }]` array, matching 03:229 ("evaluated in array order, the first matching entry wins"). |
| xfile-formats-integrations#2 | 02 § 3 example `routes` / § 5 header | adapted | 02-adapters.md:69 | Example already matches 03:210–211 ids (`fs-app-router`, `app-router`); no change there. Optional pointer applied: § 5 column header "Route discovery (`routes.discover` id: 03 § 6 *Built-in ids*)". The column still describes the mechanism; ids live only in 03 (defined once). |
| xfile-formats-integrations#3 | ux.md UX-022 form key step index | fixed | ux.md:61 | Verbatim. 03:351 *Step index* exists under 03 § 10 Flows (heading 03:332) with the same 0-based / `<outer>.<inner>` definition. Note for the formats owner/orchestrator (not my file): 03:351 cites "the UX-022 form key (§ 14)"; UX-022 is in ux.md, so that pointer should read "(ux UX-022)". |
| xfile-formats-integrations#5 | 01 CFG-008 `.shipgate-version` | fixed | 01-core.md:139 | Verbatim. Matches 03:13 ("Content that is not a SemVer version after stripping → CFG-008"). |
| xfile-privacy-a11y-perf#X8 | ux.md UX-003 phones and e-mails (consistency#37 + PRV-038/PRV-042) | fixed | ux.md:36 | The consistency#37 half was already applied in pass A. New half applied verbatim: phones add `legal.dmcaAgent.phone` ("PRV-030, PRV-033 and PRV-042 require the last three on pages"); e-mails add `legal.euRepresentative.email`, `legal.ukRepresentative.email`, `legal.dmcaAgent.email` ("PRV-025, PRV-033, PRV-035, PRV-038 and PRV-042"). Checked against privacy.md:155 (PRV-038 requires the representative's `name`, `address`, `email` on the privacy page) and :170 (PRV-042 `dmca-agent` requires `email` or `phone`). Without this a compliant page got a P0 UX-003 `forbidden-value`. The three `legal.*` keys depend on xfile-privacy-a11y-perf#X4 landing in 03 § 14 (formats fixer; not present in 03 at the time of this pass — `grep -n "euRepresentative\|dmcaAgent" spec/03-formats.md` → no hit). |
| xfile-web-delivery#4 | ux.md UX-006 control click probe serves RTE-017 `button` | fixed | ux.md:39 | Verbatim. Matches web-delivery.md:153 RTE-017 part `button` ("observed in the control click probe, UX-006, 04 § 4.2 step 8 … records the `a[href]` targets the click added to the DOM"). |

Counts (15 rows): fixed 6, adapted 1, rejected (already fixed in pass A) 8, xfile 0.

## Ownership rows
None (no new rule IDs or parts in pass B).

## Ruleset data
None new.

## Policy keys added (key · type · default · file)
None. (UX-003 now reads `business.json` `legal.euRepresentative.email`, `legal.ukRepresentative.email`, `legal.dmcaAgent.email`, `legal.dmcaAgent.phone`; those keys are defined in 03 § 14 via xfile-privacy-a11y-perf#X4.)

## spec-lint (last three lines)
```
spec-lint: {"requirements":575,"rules":556,"toolRequirements":19,"rulesWithParts":201,"errors":0,"warnings":0}
  errors by check: none
  warnings by check: none
```
