# Cross-file requests — from formats-integrations (03, 05) — round 08, pass A

## 1. spec/02-adapters.md — § 3 example manifest, `fileRoles`
Serves: concreteness-formats-integrations#24 (03 § 6 `fileRoles` is now an ordered array, first match wins, so 04 § 7.1 "the first matching pattern wins" is decidable).
Old text: `  "fileRoles": { "app/**/page.*": "route", "app/**/route.*": "api-handler", "app/**/layout.*": "layout" },`
New text: `  "fileRoles": [ { "glob": "app/**/page.*", "role": "route" }, { "glob": "app/**/route.*", "role": "api-handler" }, { "glob": "app/**/layout.*", "role": "layout" } ],`

## 2. spec/02-adapters.md — § 3 example manifest, `routes`
Serves: concreteness-formats-integrations#14 (03 § 6 *Built-in ids* now lists the ids). No text change needed: the example `"routes": { "discover": "fs-app-router", "fileMap": "app-router" }` matches the 03 list. Optional: in § 5 table header "Route discovery", append " (`routes.discover` id: 03 § 6 *Built-in ids*)".

## 3. spec/packs/ux.md — UX-022 form key
Serves: concreteness-formats-integrations#8, #23 (step index now defined once, 03 § 10 *Step index*; passB-notes 2 "defined once, pointers elsewhere").
Old text: `where `<step>` is the 0-based position of the submitting step in the flow's `steps` array (a step nested in `frame` or `popup` `steps` is written `<outer>.<inner>`, recursively)`
New text: `where `<step>` is the step index (03 § 10 *Step index*: 0-based, `<outer>.<inner>` for steps nested in `frame`/`popup`) of the submitting step`

## 4. spec/packs/resilience.md — RES-008 form key
Serves: concreteness-formats-integrations#23.
Old text: `(UX-022 definition: `<flow id>#<index of the submitting step>→<outcome>`)`
New text: `(UX-022 definition: `<flow id>#<step index>→<outcome>`, step index per 03 § 10)`

## 5. spec/01-core.md — CFG-008
Serves: concreteness-formats-integrations#25 (03 § 1 now says a `.shipgate-version` that is not a SemVer version is CFG-008).
Old text: `- **CFG-008** · P0† · cfg — `policy.verifier` range and `ruleset` match the running binary.`
New text: `- **CFG-008** · P0† · cfg — `policy.verifier` range and `ruleset` match the running binary, and `.shipgate-version` holds a SemVer version (03 § 1).`

## 6. SPEC.md — decision log row "Hosts" (orchestrator)
Serves: consistency#109.
Old text (SPEC.md:78): `| Hosts | One `hosts[]` registry (server, browser, essential, dependency flags) | Five overlapping allowlists |`
New text: `| Hosts | One `hosts[]` registry (`server`, `browser`, `essential` flags; `dependency` as a purpose) | Five overlapping allowlists |`

## 7. spec/packs/data-api.md — DB-001 `drift` example (information only)
Serves: concreteness-formats-integrations#16. 03 § 6 `schemaDriftCommand` now defines `{db.url}` (valid only in that command: the one database the service's `dbEnv` entry selects; `{db.<id>.url}` also accepted). The DB-001 example `prisma migrate diff --from-url {db.url} …` is therefore valid as written; no edit required unless the data-api fixer prefers to cite "03 § 6 `schemaDriftCommand`" after the example.

## Pass B additions (round 08)

## 8. spec/packs/programmatic.md — § 6 *live*, `commands.snapshot` sentence
Serves: xfile-programmatic-search#X7 (consistency#21). 03 § 3.2 `commands` no longer has a `snapshot` key (it had no run semantics anywhere in the spec; an unknown `commands` key is now CFG-001 like any other unknown key).
Old text: `a service `commands.snapshot` is never an oracle source (the Builder can write it).`
New text: `services have no `snapshot` command (03 § 3.2); only `family.snapshot` produces the live oracle.`
