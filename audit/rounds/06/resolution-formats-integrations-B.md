# Resolution — formats-integrations — pass B — round 06

Inputs: every request in `audit/rounds/06/xfile/from-*.md` (8 files) whose target is `spec/03-formats.md` or `spec/05-integrations.md`. 26 requests. Skipped as orchestrator-owned or other-file targets: algorithms X1–X5, X7, X8 (CHANGES.md); core-adapters-ux C1–C4; data-refactor X1–X4, X11, X12; formats-integrations §1–§3 (this group's own outgoing requests); privacy X5, X7, X8; programmatic X1, X2, X4–X6, X8, X10, X11; security X1–X3, X6; web-delivery X2–X5, X9. 05 needed no new edit: its only request (web-delivery X8) was already applied in pass A.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-formats-integrations#X1 | algorithms X6 — 03 § 5 metadata key `gates` | fixed | 03:174, 03:189 | YAML line as proposed. Also in the **Required** paragraph: `gates` is non-empty, values `G0`…`G9`, required for rules with a `db`/`contract` channel and rejected on other rules, so it matches 04 § 1.1 ("metadata validation rejects a `db` or `contract` rule without `gates`"). |
| xfile-formats-integrations#X2 | core-adapters-ux C5 — 03 § 17 `auditTargets` | fixed | 03:498, 03:500 | Example and definition as proposed; "(all when fewer)" added to match 01 § 10.2 ("fewer when the union is smaller"). |
| xfile-formats-integrations#X3 | core-adapters-ux C6 — 03 § 6 `role` | fixed | 03:243, 03:249 | Row placed after `priority`; addon required set now `id`, `role`, `detect`, `priority`. Matches 02 § 3 (`role: "primary" \| "addon"`). |
| xfile-formats-integrations#X4 | core-adapters-ux C7 — 03 § 6 `regexSinks` | fixed | 03:206 | Uses the same wording as 02 § 4 (coverage at most `structural`, findings report `precision`). |
| xfile-formats-integrations#X5 | core-adapters-ux C8 — `prices[].amount` format | rejected (already fixed) | 03:434 | Pass A already defines it: "Value formats: … `amount` a decimal string in major units (`"19.90"`); `currency` ISO 4217". Repeating it inside the shape would only add a second copy. |
| xfile-formats-integrations#X6 | core-adapters-ux C9 — launch-form confirmations | adapted | 03:444 | Bullet added after *Page approvals*. Shape written in the section's notation (`formatVersion` instead of literal `1`). Duplicate keys → CFG-001 added. Outcome semantics (missing entry, `failed`, future `confirmedOn` → blocking operator-owned) stay in UX-022, which the bullet cites. Typo in UX-022's shape (`"failed"\| "failed"`) sent via xfile §5. |
| xfile-formats-integrations#X7 | data-refactor X6 — 03 § 11 `kind` table | adapted | 03:372–388 | Pass A's table already had a stricter field set for each kind (`url-move` same params, `header.value`, `visual.viewports`, `schema` per table and change type, relative `budget`), so I kept those fields rather than taking the proposed looser ones (`schema: { migrations }`, absolute `budget.max`, `url-remove.routes`). Added the proposal's real gap: a **Covers** column saying which rule each kind relaxes and how (REF-002 points to it), plus "Unknown fields fail CFG-001". Decidability: the baseline stores no DOM, so `markup` and `text`-with-`selector` cover only content **added** inside `selector` (the full or reduced current value must equal the baseline). This is stated in the row, not hidden. I didn't list REF-003 under `text`/`metadata` because REF-003 has no allowedChanges exception. |
| xfile-formats-integrations#X8 | data-refactor X7 — 03 § 6 new adapter fields | fixed | 03:219–224, 03:244 | `httpClientApis` moved to its own row with `timeoutArg`/`clientFactory`; `formatterApis`, `urlBuilderApis`, `destructiveMigrationApis`, `jobRetryArgs`, `testReport` added. Field names checked against RES-006, ARC-006, DB-006, JOB-003, TST-004. Also made `migrations.applyCommand` decidable for DB-006 / 04 § 4.2 step 4 ("one invocation per file"): it must contain `{file}`, else CFG-002. |
| xfile-formats-integrations#X9 | data-refactor X8 — 03 § 12 manifest `visual[]`, remote `images[]` | fixed | 03:395, 03:409, 03:411 | As proposed, plus a definition of manifest `visual` (one entry per screenshotted route group; `[]` for remote baselines). `images[]` points to refactor § 2 for how it's collected, so there's one definition. |
| xfile-formats-integrations#X10 | data-refactor X9 — drop `dependency` from 03 § 3.3 purposes | rejected (conflict) | 03:94 | Conflicts with pass A (formats-integrations #9), which made the fault-injection marker "`purposes` contains `dependency`" and removed the boolean. Both versions are decidable and neither is stricter. I kept the one that matches 04 § 4.5, which now reads "entries whose `purposes` contain `dependency`, 03 § 3.3". The orchestrator note is in xfile §4 (resilience.md l.10 comment still says `dependency: true`; xfile §2 from pass A fixes it). |
| xfile-formats-integrations#X11 | data-refactor X10 — 03 § 3.5 `contracts[].clientTypes` | fixed | 03:127 | |
| xfile-formats-integrations#X12 | privacy X1 — 03 § 3.5 `digitalProductPaths` | fixed | 03:125 | |
| xfile-formats-integrations#X13 | privacy X2 — `expectEmail.attachment` | adapted | 03:343 | Added: with `attachment: true`, an email with no attachment fails the step; "first" = MIME order. |
| xfile-formats-integrations#X14 | privacy X3 — manufacturer address/contact shapes | adapted | 03:434, 03:435 | Shape and `country` were already defined in pass A ("every `address` (incl. `manufacturers[].address` and `euResponsible.address`) has the `locations[].address` shape"). Added the missing parts: `contact` is an email or absolute URL, and both manufacturer addresses use LOC-001 containment. |
| xfile-formats-integrations#X15 | privacy X4 — `prices[].feeType` | fixed | 03:434 | Also: `feeType` on a non-fee entry → CFG-001. |
| xfile-formats-integrations#X16 | privacy X6 — `measure` step | fixed | 03:349 | Matches PRF-002 ("A `measure: "inp"` step records the value at that step"). |
| xfile-formats-integrations#X17 | programmatic X3 — inventory `facts.attr` | fixed | 03:419–420 | Matches programmatic l.173 (TPL-003 canonical machine value). |
| xfile-formats-integrations#X18 | programmatic X7a — merchant feed fields + missing file | fixed | 03:437 | Matches SE-113. |
| xfile-formats-integrations#X19 | programmatic X7b — agentic feeds `.xml` | adapted | 03:439 | Wording changed to "the XPath 1.0 `items` value of the kind's `agentic-feeds.json` mapping" because "ruleset `items`" made spec-lint read `items` as a ruleset file. Missing/unparsable → operator-owned `parse-error`, as in SE-114. |
| xfile-formats-integrations#X20 | programmatic X9 — 03 § 3.5 additional keys | adapted | 03:134 | `facets.routes` (no default) and `siteAlternateName` (default `null`) as proposed. `facets.indexable`: absent = `[]` (no combination indexable), which is the strict reading of search-engines § 3.3 and matches its example. |
| xfile-formats-integrations#X21 | security X4 — `validatorApis` refs + `passwordHashApis` | fixed | 03:219 | `validatorApis` also cites ARC-004 (its other user). |
| xfile-formats-integrations#X22 | security X5 — webhook fixture path | adapted | 03:436 | security.md's `fixture` holds a full path (`quality/fixtures/webhooks/stripe.json`), so the bullet now reads "at the route's `fixture` path, which must lie under `quality/fixtures/webhooks/` (else CFG-001)"; directory files are read in path byte order. |
| xfile-formats-integrations#X23 | web-delivery X1 — `i18nCatalogs` `{locale}`, `renderModes`, `hydrationErrorPatterns`, `slugApis` | adapted | 03:233–236 | Written as table rows (pass A changed § 6 to a table). Added CFG-002 for a glob without exactly one `{locale}`. The `renderModes` catch-all is an entry **without** `pattern` and must come last (an ast-grep pattern can't express "anything"). |
| xfile-formats-integrations#X24 | web-delivery X6 — 03 § 15 session fetch store | adapted | 03:458 | Pass A already wrote the store (path, shape, 200,000-char and 50 MB caps, oldest-first eviction). Added now: `kind: "web-fetch"\|"web-search"\|"browser"` per line, and evictions recorded in `fetches/evictions.jsonl` and reported as warning `fetch-store-evicted`. I used a separate log rather than `attempts.json`, whose shape is not defined. Pass A's `text` = "text the host reported" is kept: the host's text is what the agent saw, so it is the right oracle for copying. |
| xfile-formats-integrations#X25 | web-delivery X7 — 03 § 16 `fetch` events | adapted | 03:464, 03:470–474 | Pass A had `tool: "fetch"` and `fetched?: [{ url, text }]`. I kept the array (stricter than the proposed single `fetch?` object, because one call can return several documents), added `kind`, and filled `kind` in the claude-code, opencode and antigravity mapping rows. |
| xfile-formats-integrations#X26 | web-delivery X8 — 05 § 3.3 fetch recording, § 3.1 state dir protected | rejected (already fixed) | 05:119, 05:145 | Pass A already has both. 05:119: "shipgate's own user directories … `<state dir>/shipgate/**` (… the session fetch store). Only shipgate writes there." 05:145: "**Fetch recording:** on `post-tool` events with `tool: "fetch"` … hosts whose row in 03 § 16 reports no fetches produce no store, and CQ-010 is then `skipped(no-fetch-store)`." I did not take the proposal's "unverified host counts as no fetch events": it would drop real recordings, which is weaker. |

## Ownership rows
None. No new rule IDs or parts.

## Ruleset data
None new. (`agentic-feeds.json` and `fetch-tools.json` were already listed.)

## Policy keys added (key · type · default · file)
- `privacy.digitalProductPaths` · URL pattern[] · no default · 03 § 3.5 (the key was defined by privacy.md)
- `data-api.contracts[].clientTypes` · `{ command, output }` · no default · 03 § 3.5 (the key was defined by data-api.md)
- `search-engines.facets.routes` · URL pattern[] · no default · 03 § 3.5
- `search-engines.facets.indexable` · `[[param]]` · absent = `[]` · 03 § 3.5
- `web-delivery.siteAlternateName` · string \| null · `null` · 03 § 3.5
- Rule metadata (not policy): `gates` · gate id[] · required for `db`/`contract` rules · 03 § 5
- Adapter manifest (not policy): `role` (required), `passwordHashApis`, `httpClientApis[].timeoutArg`/`clientFactory`, `formatterApis`, `urlBuilderApis`, `destructiveMigrationApis`, `jobRetryArgs`, `testReport`, `renderModes`, `hydrationErrorPatterns`, `slugApis`; `migrations.applyCommand` must contain `{file}` · 03 § 6
- Operator files (not policy): flow step `expectEmail.attachment` · bool · `false`; `business.json` `prices[].feeType` · enum · `mandatory`; `quality/approvals/launch-forms.json` · 03 § 10, § 14

## Cross-file notes appended (xfile/from-formats-integrations.md §4–§6)
- §4: orchestrator note on the `hosts[]` dependency-marker conflict (04 § 4.5 already uses the purpose form; resilience.md l.10 still needs pass-A xfile §2).
- §5: ux.md UX-022 shape typo.
- §6: refactor.md REF-009 mobile DPR (2) vs 03 § 10 (3).

## spec-lint (last three lines)
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":142,"errors":0,"warnings":0}
  errors by check: none
  warnings by check: none
```
