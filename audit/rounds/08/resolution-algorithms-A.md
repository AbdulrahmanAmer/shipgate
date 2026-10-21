# Resolution — algorithms — pass A — round 08

Inputs: all 33 rows of `concreteness-algorithms.md`, and the 52 rows of `consistency.md` numbered 20 and above whose Location names `spec/04-algorithms.md` (key `consistency#<row>`). Line numbers are those of `spec/04-algorithms.md` after this pass. Settled decisions applied: round-07 passB-notes #1–#5, DECISIONS D-001…D-005. Cross-file edits: `xfile/from-algorithms.md`.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-algorithms#1 | Cache key | fixed | 04:552, :555 | JCS key with `gate`, `input`, `scope`, `profile`, `against`, `adopt`. `--family` dropped from the scope selectors because it is a `brief` flag, not a `verify` flag (05 § 1). `against` includes the implied baseline and the SHA-256 of `manifest.json`. The definition-of-done run's keys always have `scope: "full"` |
| concreteness-algorithms#2 | groupKey string | adapted | 04:352, :375 | Serialisation added. Changes from the proposal: the part is a final `\|#<part>` component, because route-group ids already contain `#<hex>` (§ 10); a `\|` inside a value is written `%7C`; the service prefix is added only when no component is service-qualified, so the 03 § 17 example `web:/api/invoices/{id}\|access-allowed` still holds; `locale` renders as `locale:<tag>`. locationKeys use the same rules |
| concreteness-algorithms#3 | `owns` merge | fixed | 04:377 | The merge key ignores the part; the merged finding keeps the owner's part. Findings of rules not in `owns` never merge. 04:375 now says parts never merge "except by `owns`" |
| concreteness-algorithms#4 | `owns` merge severity | fixed | 04:377 | A finding is absorbed only into an owner finding of equal or higher severity; an absorbed blocking finding makes the owner finding blocking |
| concreteness-algorithms#5 | BLOCKED gate owner | fixed | 04:547 | |
| concreteness-algorithms#6 | Subset runs | fixed | 04:63; xfile 05 § 1 | Infrastructure-only runs for G3, § 4.2 steps 1–7 and the crawl |
| concreteness-algorithms#7 | `verify --changed` | fixed | 04:302; xfile 05 § 1 | The default from the row is kept: G5 runs for changed families |
| concreteness-algorithms#8 | Diff base | adapted | 04:248, :545; xfile 03 § 3.1 | Every `verify` diffs against the merge-base. Change from the proposal: the git-ignored sensitive paths can't be in a merge-base diff, so they are compared against the session snapshot when the `verify` runs in a hook session, and not compared otherwise. `blocked(no-base)` (owner `operator`) added to *Owners of BLOCKED gates*. The "Known limit" bullet was updated to match |
| concreteness-algorithms#9 | HTTP client | adapted | 04:265 | Added `contract` requests, ALPN for HTTP/2, "a second failure is the outcome", the per-run CA for local origins and the toolchain root store for remote ones; "unless a rule states otherwise" keeps probe-specific user agents and headers |
| concreteness-algorithms#10 | Path clustering | fixed | 04:393 | |
| concreteness-algorithms#11 | HTTP sample | fixed | 04:394 | |
| concreteness-algorithms#12 | Host directives | adapted | 04:174 | "Unsupported" is defined as "shipgate doesn't emulate it". Changes from the proposal: vercel `permanent: false` → 307; `headers` entry shape; a `rewrites` destination that is an absolute URL is unsupported; netlify.toml `[[redirects]]`/`[[headers]]` syntax and its unsupported keys added; status 200 = rewrite in `_redirects`. The trailing "…" was removed from the ignored-directives list, which is now a definition plus examples |
| concreteness-algorithms#13 | Dead control | fixed | 04:501 | |
| concreteness-algorithms#14 | `scope: changed` | fixed | 04:456 | |
| concreteness-algorithms#15 | Same-function data flow | fixed | 04:440 | AGT-003 and DB-008 now cite it, and so does RTE-010 `source-hint` (#33). It is marked as distinct from the request-derived flow |
| concreteness-algorithms#16 | API-002 requests | adapted | 04:516 | `auth.accounts` is a JSON object (03 § 4; consistency#110), so "file order" was replaced by the byte order of account ids (the *primary account*). The *other tenant's account* is defined as the first account in byte order whose `tenant` differs |
| concreteness-algorithms#17 | Fuzz values | adapted | 04:517 | The proposal said both "first in schema order" and "PRNG lowest rank"; the 10,240-character string goes to the PRNG-ranked string property (candidate key = JSON Pointer), which keeps "seeded by the lock digest". The `sg_unknown` mutation is sent only when the schema forbids additional properties: SEC-030 expects 400/422 only for *invalid* input, and an extra property is valid under a schema that allows it |
| concreteness-algorithms#18 | brief missing inputs | adapted | 04:287 | (c) is keyed on the baseline manifest's `remote`, not `goal`, because 03:386 makes `goal` display-only. (f) uses `hosts[]` purpose `analytics` (PRV-031's *fired processors*), because `privacy.analytics.processors` doesn't exist. (d) names the journeys from 03 § 10 |
| concreteness-algorithms#19 | generated.json | fixed | 04:312; xfile 03 § 6 | New adapter key `generatedPatterns` (Operator decision as flagged; the default is the built-in list plus `[]`) |
| concreteness-algorithms#20 | evidenceHash `actual` | fixed | 04:376 | |
| concreteness-algorithms#21 | Environment hash | adapted | 04:554 | `{dbdir}` is generalised to `{tmpdir}` for every per-run temp directory (including `SHIPGATE_INVENTORY_DIR`); ports are replaced wherever they occur in a value. Refines D-002 without reopening it |
| concreteness-algorithms#22 | external database | fixed | 04:197; xfile 03 § 3.4 | New key `databases[].migrateExternal` (Operator decision as flagged; default `false`) |
| concreteness-algorithms#23 | Verdict step 1 | fixed | 04:75, :117 | The step-1 parenthetical now also names a builder-owned `NOT_CONFIGURED` gate |
| concreteness-algorithms#24 | Stratum id | fixed | 04:475 | |
| concreteness-algorithms#25 | Crawl robots.txt | adapted | 04:390, :391 | Adds the `robots` limit. Merged with consistency#54: a robots drop makes the crawl incomplete unless the URL is also disallowed for Googlebot |
| concreteness-algorithms#26 | Reference time | fixed | 04:477 | |
| concreteness-algorithms#27 | treeHash per-file | fixed | 04:474 | Cites 03 § 1 *File hashes* (the row said "03 § 0"; the section is § 1 Conventions). The line format now says "SHA-256 of the file" |
| concreteness-algorithms#28 | Break-glass | fixed | 04:317 | |
| concreteness-algorithms#29 | Start order | fixed | 04:202 | |
| concreteness-algorithms#30 | Extensions | fixed | 04:198 | |
| concreteness-algorithms#31 | Stage grouping | adapted | 04:206 | Also treats items joined by "and" as one stage (`SEC-045 \`traversal\` (non-GET) and \`ssti\``) |
| concreteness-algorithms#32 | Launch list cut | fixed | 04:285 | |
| concreteness-algorithms#33 | RTE-010 source hint | adapted | 04:453 | Adds `\|\|` conditions and cites `requestSources` (03 § 6) and *Same-function data flow*. The `analyticsModules` type is undefined in security.md:37, so the text says "the modules listed in" rather than "files matched by" |
| consistency#21 | live-mode snapshot | fixed (04 half) | 04:423; xfile | The `commands.snapshot` source is removed in 04; the programmatic and 01 halves are in xfile |
| consistency#22 | sensitive paths `.env*` | fixed | 04:247 | |
| consistency#24 | OPS-006 `dkim` part | xfile | — | The fix is ops.md only (04 § 1.8 is just cited) |
| consistency#25 | TST-006 part | xfile | — | testing.md only |
| consistency#28 | SEC-037 `expired` stage | fixed (04 half) | 04:209; xfile | |
| consistency#29 | SEC-060 remote | xfile | — | security.md only |
| consistency#32 | SEC-032 upload flow | fixed (04 half) | 04:35; xfile | |
| consistency#38 | PRV-023/027 | xfile | — | privacy.md only; the 04 list entry for PRV-023 came via consistency#79 |
| consistency#39 | PRV-037 `notice` | xfile | — | privacy.md only |
| consistency#42 | RES-008 required facts | fixed (04 half) | 04:35; xfile | |
| consistency#43 | RES-008 stage order | fixed (04 half) | 04:214; xfile | |
| consistency#44 | remote fault stages | adapted | 04:230; xfile | RES-007 (a fault-stage rule, resilience.md:27) added to the skipped list |
| consistency#45 | RES-001 dependency faults | xfile | — | resilience.md and web-delivery.md only |
| consistency#46 | URL-011 wildcard | adapted | 04:508, :35; xfile | Also added URL-011 to the § 1.2 required-facts list, so the "§ 1.2 required-facts rules" citation resolves |
| consistency#48 | Indexable item 5 exception | fixed | 04:487 | |
| consistency#49 | No-entry severity | fixed | 04:490 | Consistent with passB-notes #1: the check still runs, is never a skip, and is owned by `operator`; only the status follows § 1.3 for W rules |
| consistency#50 | URL-014 skip reason | xfile | — | web-delivery.md only |
| consistency#51 | WP-504 / indexable item 3 | xfile (orchestrator) | — | BUILD_MAP only (passB-notes #5); listed in xfile, no fixer request |
| consistency#52 | hub pagination | adapted | 04:485; xfile | The hub key is `pagination.style: "query"` (programmatic.md:106), not `style` |
| consistency#53 | discontinued products | fixed (04 half) | 04:484; xfile | |
| consistency#54 | complete crawl vs CRW-004 | adapted | 04:391; xfile | Merged with concreteness#25; "discovered only through nofollow links" and "disallowed for Googlebot" are written as two separate exemptions |
| consistency#60 | fixture pass ownership | xfile (orchestrator) | — | BUILD_MAP / ownership.tsv only |
| consistency#62 | seed contract owner | fixed (04 half) | 04:219; xfile | |
| consistency#64 | REF-010 edge sample | fixed (04 half) | 04:145; xfile | |
| consistency#65 | SEC-065 WP order | xfile (orchestrator) | — | ownership.tsv / BUILD_MAP only |
| consistency#66 | `data-api.db.service` | fixed (04 half) | 04:200; xfile | |
| consistency#67 | SMTP sink presence | xfile | — | 03 and 01 only |
| consistency#68 | page locale without web-delivery | fixed | 04:488 | |
| consistency#70 | early stop and Builder work first | fixed (04 half) | 04:69; xfile | |
| consistency#71 | OPS-001/SEC-074 channels | xfile | — | ops.md and security.md only |
| consistency#72 | SEC-045 `ssti` marker | xfile | — | security.md only (04:208 already lists `ssti`) |
| consistency#73 | fault-stage contents | fixed | 04:228 | |
| consistency#74 | OPS-010 probe stage | fixed | 04:193, :214 | The § 4.2 step 8 summary sentence also lists the probe before the preview pass |
| consistency#75 | per-browser mutating flows | adapted | 04:214 | Uses `testing.crossBrowser.browsers` only when TST-008 selects the flow (`crossBrowser.enabled` plus `flows`, testing.md:30) |
| consistency#76 | SEC-012 OPTIONS remote | xfile | — | security.md only |
| consistency#79 | § 1.2 privacy list | fixed | 04:35 | |
| consistency#83 | `ux.egressStubs` comment | xfile | — | ux.md only |
| consistency#84 | UX-024 channels | xfile | — | ux.md only |
| consistency#86 | soft-404 lookup | xfile | — | web-delivery.md only; 04:432 and :489 already define the lookup |
| consistency#91 | RES-008 `db` channel | xfile | — | resilience.md only |
| consistency#92 | I18-010 channels | xfile | — | web-delivery.md only |
| consistency#94 | `_main` row IDX-003 | fixed | 04:21 | |
| consistency#95 | indexable item 3 hubs | fixed | 04:483 | |
| consistency#96 | CNT-006 channel | xfile | — | programmatic.md only |
| consistency#97 | SE-202/SE-403 page language | xfile | — | search-engines.md only |
| consistency#99 | hub locale | fixed (04 half) | 04:488; xfile | |
| consistency#101 | modes table | xfile | — | 01 only |
| consistency#103 | coverage counts | xfile | — | 03 only |
| consistency#104 | warning codes | xfile | — | 03 only |
| consistency#105 | repo-id | xfile | — | 03 only (04:476 *repo-id* is the definition 03 should cite) |
| consistency#106 | groupKey components | xfile | — | 03 only; 04 § 9.2 *Serialisation* renders `locale` as `locale:<tag>` |
| consistency#112 | licence handoff | xfile | — | 05 only |

## Ownership rows
None. This pass adds no rule IDs and no parts.

## Ruleset data
None.

## Policy keys added (key · type · default · file)
- `verifyEnv.databases[].migrateExternal` · bool · `false` · spec/03-formats.md § 3.4 (via xfile; used in 04 § 4.2 step 1a). Operator decision flagged by the auditor. The alternative is never migrating external databases.
- Adapter manifest key `generatedPatterns` (not policy) · glob[] · `[]` · spec/03-formats.md § 6 (via xfile; used in 04 § 8.1). Operator decision flagged by the auditor. The alternative is the built-in list only.

## spec-lint
```
spec-lint: {"requirements":575,"rules":556,"toolRequirements":19,"rulesWithParts":201,"errors":27,"warnings":67}
  errors by check: ownership=27
  warnings by check: ruleset-unsourced=64 ruleset-unnamed=3
```
None of the errors or warnings points to `spec/04-algorithms.md` (`grep -c 04-algorithms` over the output = 0). All 27 are `ownership` errors for new rule IDs from other fixers (e.g. AEO-015, PRV-038…042, SE-010/011, SEC-076…079, UX-025…027, URL-015, MET-014, I18-011, TPL-008) and an AGT-011 `part:behaviour` row. These are expected until the orchestrator adds the ownership rows.
