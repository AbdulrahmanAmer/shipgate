# Concreteness standard: when a requirement is buildable

A requirement (rule, rule part, tool requirement, or a section that defines behaviour) is **concrete** when a builder who has only the spec can implement it, and a test author who has only the spec can write a known-good and a known-bad fixture for it, **without inventing anything**. Two builders reading it independently must produce implementations that agree on every fixture.

Every rule is checked against all nine criteria. A failed criterion is a finding.

| # | Criterion | The requirement states… | Typical defect |
|---|---|---|---|
| C1 | Applicability | exactly when it applies: surfaces, packs, `project.kinds`, jurisdictions, stage, config presence, which pages/responses/files are in scope (sampled? every? per route group?) | "on relevant pages", "where appropriate" |
| C2 | Inputs exist | every policy key, `business.json`/data field, ruleset data file, adapter field and flow step it reads, and each one is **defined** elsewhere (key in a policy block or 03 with type and default; ruleset file in BUILD_MAP WP-104/102; field in 03 § 14) | key used but never declared; ruleset file never sourced |
| C3 | Decision procedure | what is observed (which response, DOM, file, request), how it is normalised, and the exact pass/fail condition, with numeric thresholds and units | "fast", "thin", "similar", "properly", "etc." / "…" in a normative list that isn't a ruleset file |
| C4 | Missing-input outcome | the outcome for each absent input: `notApplicable`, `notConfigured(input)`, `skipped(reason)`, or a blocking finding (04 § 1.2 facts-oracle / required-facts rules) | silent; or `notConfigured` where an agent could use it to escape |
| C5 | Parts | every separately-severable check is a named part with its own severity (and channel when it differs), so ownership, waivers and fixtures can address it | two checks with different severities in one sentence, no part names |
| C6 | Failure class and evidence | which 04 § 9.1 failure class(es) it emits and what the finding shows (URL, selector, expected/actual) | class not inferable |
| C7 | Boundaries | overlaps with neighbouring rules resolved by an explicit owner ("owned by X", `owns`) — no behaviour checked twice with different outcomes, none checked by nobody | two rules judging the same thing differently |
| C8 | Gate and stage | channels map to gates (04 § 1.1); write/mutating probes marked (04 § 4.2 step 8); `remote: read|write|none` where remote services are possible; profile (`default|nightly`) when not default | a write probe not in the mutating stage |
| C9 | Testable | a one-line known-bad fixture and known-good fixture follow directly from the text | can't say what a failing page looks like |

## Severity of a finding

- **Blocker** — a builder must invent semantics or architecture to implement it, or an agent can use the gap to fake PASS, skip work, or stop early.
- **Major** — two reasonable builders would build different behaviour; or an input/ruleset/key is undefined; or a fixture can't be written.
- **Minor** — wording that is ambiguous on its face but has one obviously intended reading.

**Nothing is left open.** Every finding of every severity is either fixed in the spec (with a `spec/CHANGES.md` entry) or rejected with a written reason in the round's `resolution.md`. A round is closed only when both lists account for every finding.
