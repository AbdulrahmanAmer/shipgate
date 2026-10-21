# Resolution — orchestrator — pass B — round 07

Late cross-file requests (filed during pass B) and orchestrator-owned items.

| Finding | Req | Outcome | Where | Note |
|---|---|---|---|---|
| xfile-security#XB1 | SEC-018, SEC-028, SEC-067 | fixed | 04 § 1.2 required-facts list | missing Operator flows end in an operator handoff |
| xfile-algorithms#X7 | TR-103 | rejected | 01:252 | TR-103 no longer defines a PRNG or value streams; 04 § 15 is the only definition |
| xfile-algorithms#X8 | `web-delivery.leakIgnore` | rejected | web-delivery.md:27 | declared in the pack policy block with default `[]` (03 § 3.5 convention: shown values are defaults); no 03 entry needed |
| xfile-programmatic-search#X11 | merchant feed cite | rejected | — | cosmetic; 03 § 8 *Operator-owned sources* already governs the feed |
| xfile-programmatic-search#X12 | `legal.registeredOffice`, `legal.host` | fixed | 03 § 14 (formats pass B, privacy X4) | verified present |
| ownership rows (pass A, 48 rows) | new rules + slices | fixed | trace/ownership.tsv | RTE-016/017, URL-014, I18-010, CRW-004, SE-128, LOC-004, DAT-018, UX-023/024, RES-008, PRV-029..037, A11-030, SEC-074/075 + part/channel slices; stranded parts given part rows (DAT-006 served/omitted, DAT-018 attribution, SE-002 rendered-resources, SE-501 parity) |
| consistency#61 | `search-agents.json` user agents | fixed | BUILD_MAP WP-104 Round-6 named files | shape `{ token, engine, userAgent }`, every SE-002/RTE-010 engine token |
| ruleset sourcing | 26 new files | fixed | BUILD_MAP WP-104 "Round-7 named files" | |
| lint | `image-sources`, `launch-forms` are Operator data files; "ruleset lookup" false positive | fixed | tools/trace/spec-lint.mjs | |
| WP-502 deps | DAT-018 review channel | fixed | BUILD_MAP WP-502 + WP-207 | |
| concreteness-privacy-a11y-perf#8 | PRV-018 | fixed | privacy.md:96; 04 § 4.2 step 8 lists PRV-018 | xfile X1 applied in pass B |
| concreteness-web-delivery#3 | HTTP sample | fixed | 04:378 *HTTP sample* / *browser-sampled pages* | xfile §1 applied in pass B |
| consistency#131 | CRW-001 owner | fixed | trace/ownership.tsv CRW-001 note | slow-host skip comes from WP-604 via the run context |
| coverage-real-use#3 | UX-023 | fixed | ux.md:60–63; 04 § 1.2 lists UX-023 part `minimum` | xfile X4/X9 applied |
| coverage-real-use#17 | UX-001 `mobile` | fixed | ux.md:33; 04 § 1.2 lists UX-001 part `mobile` | xfile X4 applied |
