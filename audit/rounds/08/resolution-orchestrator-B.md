# Resolution — orchestrator — pass B — round 08

| Finding | Req | Outcome | Where | Note |
|---|---|---|---|---|
| consistency#33 | WP-413 goal vs ledger | fixed | BUILD_MAP WP-413 note | SEC-003 not here; SEC-075 here |
| consistency#34 | WP-413 deps | adapted | new WP-706 (phase 7) owns SEC-007/045/046/060 | adding WP-603/WP-701 to WP-413 would depend on later phases (spec-lint wp-graph); the contract/flow probes moved to WP-706 instead |
| consistency#35 | WP-607 deps | adapted | WP-706 owns SEC-030/036/074 | same reason as #34 |
| consistency#36 | WP-703 deps | fixed | WP-703 + WP-701, WP-607, WP-609 | |
| consistency#41 | WP-609 cross-pack detectors | fixed | WP-609 + WP-605, WP-606, WP-607 | |
| consistency#51 | indexable set wiring | fixed | WP-504 goal note | |
| consistency#57 | search-agents shape | fixed | BUILD_MAP WP-104: `variant` added | |
| consistency#59 | CRW-001 edge slice order | fixed | ownership CRW-001 channel:edge → WP-506; WP-506 + WP-414 | |
| consistency#65 | SEC-065 needs flows | fixed | ownership SEC-065 → WP-607; WP-607 + WP-414 | |
| consistency#78 | WP-607/WP-414 goals | fixed | goal notes | |
| consistency#85 | WP-605/606/609 goals | fixed | goal notes | |
| consistency#87 | lingua in WP-102 | fixed | WP-102 goal | |
| consistency#90 | WP-608/WP-410 goals | fixed | goal notes | |
| consistency#109 | decision log hosts | fixed | SPEC.md decision log | |
| xfile-algorithms (Pass B additions) | TR-103 nonce | fixed | 01-core TR-103 | |
| xfile-formats-integrations §8 | programmatic snapshot sentence | fixed | programmatic.md § 6 | |
| algorithms B open item | carousel next-slide control | fixed | accessibility.md `carousel-controls.json` gains `next` labels | |
