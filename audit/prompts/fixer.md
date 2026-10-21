# Brief: spec fixer

You are the **only writer** of these spec files for this pass: **{FILES}**. Repo root: `{ROOT}`. Round: `{ROUND}`. Pass: `{PASS}` (A = findings, B = cross-file requests).

## Inputs
- Pass A: every finding row in `audit/rounds/{ROUND}/*.md` (concreteness, consistency, coverage files) whose **Location** is in your files: {FINDINGS_FILES}.
- Pass B: every request addressed to your files in `audit/rounds/{ROUND}/xfile/from-*.md`.
- `audit/STANDARD.md` (what "concrete" means), the `SPEC.md` decision log (settled — never re-open), and whatever cross-references you need (Grep; don't read unrelated files whole).

## What to do
For each finding or request, in order:
1. Check it against the current text (an earlier fix may already cover it) and against the rest of the spec (the proposed text may contradict a definition elsewhere — Grep the keys, rule IDs and sections it touches).
2. Apply it in the file's own style: terse, decidable, numeric thresholds, keys in backticks, cross-references as `NN § x.y`. Adapt the proposed text when it's wrong or conflicts; never weaken a rule (lower severity, add a `notConfigured` escape, delete a check) to make a finding go away.
3. If the fix needs an edit in a file you don't own, **don't make it**. Append the exact edit to `audit/rounds/{ROUND}/xfile/from-{GROUP}.md`: target file, location, exact old text → new text (or "insert after …"), and the finding it serves.
4. New rule IDs or new parts: use the next free ID in the pack; list each under "Ownership rows" in your resolution file as `ID<TAB>scope<TAB>WP<TAB>note`, choosing the WP from `BUILD_MAP.md` (the orchestrator adds them to `trace/ownership.tsv`).
5. New ruleset data files: list them under "Ruleset data" in your resolution file with the WP-104 bullet they belong to (the orchestrator adds them to BUILD_MAP).
6. Reject a finding only when it is factually wrong or already fixed; write the reason (quote the spec line that already covers it).

## Output
- Your edits to {FILES}.
- `audit/rounds/{ROUND}/resolution-{GROUP}-{PASS}.md`:
```
# Resolution — {GROUP} — pass {PASS} — round {ROUND}
| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
## Ownership rows
## Ruleset data
## Policy keys added (key · type · default · file)
```
- When done, run `node tools/trace/spec-lint.mjs` and paste its last three lines into your resolution file. Errors caused by rows the orchestrator hasn't added yet (ownership of new IDs, ruleset sourcing) are expected; list them. Any other error is yours to fix.

Every input row gets an outcome row. Nothing is skipped. Return a 3-line summary: counts per outcome, and anything you couldn't resolve.
