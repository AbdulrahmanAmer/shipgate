# Resolution — security — pass B — round 07

Inputs: every request in `audit/rounds/07/xfile/from-*.md` whose target is `spec/packs/security.md`. Only `from-formats-integrations.md` has any: #7, #8, #9 (security half), #10. The other files mention SEC rules only in requests aimed at 03, 04 or BUILD_MAP (`from-core-adapters-ux` X1/X5, `from-web-delivery` #2, `from-algorithms` X6, `from-data-refactor-…` Y1). Those are not mine. Also applied: `passB-notes.md` items 1–4. Item 5 is the orchestrator's.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-formats-integrations#7 | SEC-067 `gate`/`email` cut point | rejected (already fixed) | security.md:156 | Pass A already applied this: "**Cut point:** the signup flow runs up to, not including, its first `openEmailLink` step (the whole flow when it has none); the new account's session = the cookies named in `auth.sessionCookies` in that browser context at the cut". The proposed clause "neither `openEmailLink` nor `expectEmail` → `notConfigured(flow email step)`" is rejected because it weakens the rule. `email` is "judged from the SMTP sink whatever the flow's steps", and a link flow without `openEmailLink` is already a blocking `missing-element` (see resolution-security-A consistency#70). |
| xfile-formats-integrations#8 | SEC-028 owner when there is no logout flow | adapted | security.md:109, :99, :156; xfile XB1 | Applied passB-notes item 3. No logout flow, or none with a non-null `account`, is now a blocking `missing-element` owned by `operator`, because flows are Operator-owned (01 § 5.2: `quality/flows/**` Operator / read / read). The same reasoning was applied to the two other builder-owned missing-flow outcomes in this file: SEC-018 (no flow fills a password-set input) and SEC-067 (no signup flow, and a signup flow with no `openEmailLink`). The Builder can't write either file. Precedent: privacy.md:132 "a missing flow is `missing-element` owned by `operator`". The finding stays blocking, so nothing is weakened. XB1 asks 04 § 1.2 to list these outcomes so they end in an operator handoff. |
| xfile-formats-integrations#9 | static part severities (security half) | rejected (already fixed) | security.md:106, :131, :161–163, :178 | Pass A split every input-dependent severity: `rate-limit-edge`, `requests-edge`, `licence-unknown`, `deprecated-unknown`, `age-unknown`, `version-unknown`, `unrated` (all static W). The token-lifetime parts became `notConfigured(auth.tokenTtlVar)`. A grep for conditional-severity phrasing (`otherwise W`, `W when`, `P0 with`, `→ W`) finds nothing. The 04 § 1.8 half is not in my files; it is already requested as from-security X5. |
| xfile-formats-integrations#10 | SEC-064 `idleVar`/`absoluteVar` unit | fixed | security.md:147 | Part `lifetime` now says: "`idleVar`/`absoluteVar` hold integer seconds (shared definitions *Lifetime variables*)". The probe value is written as `5` (seconds) to match. The policy comment at :47 and the shared definition at :63 already said this. |
| passB-notes#1 | page locale without a ruleset entry | rejected (not applicable) | — | security.md has no page-locale or per-locale ruleset text. A grep for `locale`, `reduced-environment`, `per-locale` and `` en` list `` finds no matches. |
| passB-notes#2 | indexable page / page locale defined only in 04 § 15 | rejected (not applicable) | — | security.md defines neither term. A grep for `ndexable` and `page locale` finds no matches. |
| passB-notes#3 | SEC-028 without a logout flow → operator | fixed | security.md:109 | See xfile-formats-integrations#8. |
| passB-notes#4 | Operator-owned sources: cite 03 § 8 only | rejected (not applicable) | security.md:155, :160 | No restatement to remove. The only uses of "Operator-owned" are about CI files (SEC-066) and debt entries (SEC-050 `history`). Neither is an oracle-source definition, and a grep for `oracle` and `lock input` finds no matches. |

## Ownership rows
None. No new rule IDs or parts.

## Ruleset data
None.

## Policy keys added (key · type · default · file)
None.

## Cross-file requests
`audit/rounds/07/xfile/from-security.md` § "Pass B additions": XB1 (04 § 1.2: add the missing-flow outcomes of SEC-018, SEC-028 and SEC-067 to the operator-owned list).

## spec-lint
```
spec-lint: {"requirements":549,"rules":530,"toolRequirements":19,"rulesWithParts":176,"errors":30,"warnings":67}
  errors by check: ownership=23 channel-infra=7
  warnings by check: ruleset-unsourced=64 ruleset-unnamed=3
```
Errors and warnings from security.md:
- `ownership`: SEC-074 and SEC-075. Expected, because their rows come from pass A and the orchestrator has not added them yet.
- `ruleset-unsourced`: `csp-bypass-hosts.json` and `sensitive-properties.json`. Expected until WP-104 lists them.

None of these come from this pass's edits. Every other error and warning belongs to other packs, which are being edited in parallel.
