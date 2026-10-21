# Round 07 pass B — orchestrator decisions every fixer applies

1. **Page locale with no ruleset entry:** 04 § 15 (algorithms fixer) is normative — the check still runs with the `en` list and raises one blocking `missing-element` finding per (rule, locale), owned by `operator`; never a skip, never a `reduced-environment` handoff. Any pack or 01 text that says otherwise (e.g. "PARTIAL with a `reduced-environment` handoff") is changed to cite "04 § 15 page locale".
2. **Indexable page** and **page locale** are defined once, in 04 § 15. Packs keep a pointer, never a second definition.
3. **SEC-028 with no logout flow:** flows live in Operator-owned `quality/flows/`, so a missing `journey: "logout"` flow is a blocking `missing-element` finding owned by `operator` (handoff), not a builder finding.
4. **Operator-owned sources:** 03 § 8 *Operator-owned sources* is the single definition; rules cite it instead of restating what counts as Operator-owned.
5. Requests targeting `spec/CHANGES.md`, `BUILD_MAP.md`, `trace/ownership.tsv` or `tools/` are the orchestrator's — skip them.
