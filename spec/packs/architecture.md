# Pack: architecture

> Keeps agent-written code inside the structure the Operator chose: layers, boundaries, server/client separation, one implementation per concern, controlled dependencies. These rules are what stop a codebase from degrading across many agent sessions.

---

## 1. Policy section

Sections are per service (a Python API and a Next.js web app have different structures); the adapter supplies language idioms (what an "import", an "env read" or an "HTTP client" is).

```jsonc
"architecture": { "web": {
  "layers": [
    { "name": "ui",       "paths": ["apps/web/components/**", "apps/web/app/**"], "mayImport": ["domain", "shared"] },
    { "name": "domain",   "paths": ["packages/domain/**"],                         "mayImport": ["shared"] },
    { "name": "data",     "paths": ["packages/data/**"],                           "mayImport": ["domain", "shared"] },
    { "name": "shared",   "paths": ["packages/shared/**"],                         "mayImport": [] }
  ],
  "serverOnly": ["packages/data/**", "apps/web/lib/server/**"],      // must never reach a client bundle
  "envModule": "apps/web/lib/env.ts",                                // the only place env vars are read
  "dataAccess": { "entities": { "invoice": "packages/data/invoices.ts", "user": "packages/data/users.ts" } },
  "singletons": {                                                    // one implementation per concern
    "url": "apps/web/lib/url.ts", "http-client": "packages/shared/http.ts",
    "formatting": "packages/shared/format.ts", "auth-guard": "apps/web/lib/server/auth.ts"
  },
  "dependencies": {
    "allow": null,                                                   // null = any, else allowlist
    "deny": ["moment", "request"],
    "oneOf": [["date-fns", "dayjs", "luxon"], ["axios", "ky", "got"]]  // at most one per group
  },
  "entryPoints": [],                                                 // extra files/exports that are used by the framework, not imports
  "limits": { "maxFileLines": 400, "maxFunctionLines": 80, "maxCognitiveComplexity": 15 },   // warnings
  "design": {                                                        // absent = ARC-013 notApplicable
    "tokens": ["packages/ui/tokens/**", "apps/web/tailwind.config.*"],   // files where raw design values may live
    "primitives": { "Button": { "module": "packages/ui/button.tsx", "element": "button" } }  // element = native tag it wraps
  },
  "readme": "README.md"                                              // relative to the service path, else repo root (ARC-015)
} }
```
`design.tokens` and `design.primitives` are project-specific (no default).

---

## 2. Rules — `ARC-*`

- **ARC-001** · P1 · graph — Imports respect `layers[].mayImport`; a file outside every layer is a finding. Files counted: source files of the service's adapter languages with role `component`, `route`, `layout`, `api-handler` or `source` (04 § 7.1), excluding tests (adapter `testMarkers`), `codegen[]` outputs and files marked `@generated`. A file matching several layers belongs to the first in declared order. A file may always import files of its own layer and files outside the project (packages); a `mayImport` entry that names no declared layer fails CFG-001. Counted imports: static imports (including `import type`), `export … from` re-exports, `require()` and dynamic `import()` with a literal specifier. An import, from a layer file, of a project file outside every layer is a violation unless the target is in the importing file's own layer (the target itself is also a "no layer" finding).
- **ARC-002** · P0 · graph, build — `serverOnly` modules (DB clients, admin SDKs) are never reachable from a client entry point (a file matching adapter `clientEntries`) through the file import graph — transitive; type-only imports excluded; dynamic `import()` with a literal specifier included — and never appear in built client assets. The graph finding (`forbidden-value`) shows the shortest import path from the entry point to the `serverOnly` file. Part `bundle` (build): a client asset whose source map (or the adapter `bundleManifest`) lists a source path matching `serverOnly`, or that contains a string from an adapter `serverOnlyMarkers` entry, is a finding; no source maps and no `bundleManifest`: part `bundle` is `noAdapterSupport`, and the graph part still applies. Secret values themselves are owned by SEC-005.
- **ARC-003** · P1 · graph — No new import cycles. Cycles = strongly connected components (≥ 2 files) of the file import graph, type-only imports excluded. A finding (`cycle`) is each component that is not a subset of a component in `_main/cycles.json` or of a debt entry (one finding per component, listing its new files). No `_main`: `skipped(no-main)`.
- **ARC-004** · P1 · ast — Files counted: as ARC-001, excluding files of role `config` (04 § 7.1). Environment variables are read only in `envModule`: an adapter `envReadApis` call outside `envModule` is a finding. Part `schema`: every env read in `envModule` is an argument (directly, or as a member of the object passed) to an adapter `validatorApis` call (e.g. zod `parse`, `createEnv`, `envalid.cleanEnv`, pydantic `BaseSettings`) executed at module top level. No `envModule`: `notConfigured(envModule)`.
- **ARC-005** · P1 · ast — Data for an entity is read/written only through its `dataAccess` module. A `queryApis` call belongs to entity `e` when the value of its `entity` role (03 § 6 `queryApis` `args`: `"<n>"` = the literal or identifier text at argument n, `"callee:<n>"` = the n-th segment, 0-based, of the dotted callee path, e.g. `prisma.invoice.findMany` → `callee:1`) equals `e`, `e`+`s`, `e`+`es` or PascalCase(`e`), case-insensitively; a call with no `entity` role or no value belongs to no entity. Such a call outside `dataAccess.entities[e]` is a finding (`forbidden-value`, the call and the entity). Without `dataAccess`: this check is `notConfigured(dataAccess)`. Part `ui-query` (P1): a `queryApis` call in a file of role `component`, `route`, `layout` or `api-handler` is always a finding (`forbidden-value`), with or without `dataAccess`.
- **ARC-006** · P1 · ast — Concerns in `singletons` have one implementation: calls to the adapter-declared API family outside the singleton module are findings (04 § 13). Singleton keys and their API families: `http-client` → `httpClientApis`, `auth-guard` → `authGuardApis`, `db-client` → `dbClientApis` (calls that construct a database client, e.g. `new PrismaClient`, `createClient`, `new Pool`, `create_engine`; adapters with an empty list: `noAdapterSupport` for that key), `formatting` → `formatterApis`, `url` → `urlBuilderApis`. Other keys fail CFG-001. `queryApis` calls are owned by ARC-005, not by `db-client`.
- **ARC-007** · P1 · deps — Dependencies, judged on the direct dependencies of the service's manifest(s): `dependencies`, `devDependencies`, `peerDependencies` and `optionalDependencies` (npm), or the equivalent sections of the ecosystem's manifest; lockfile-only transitive packages are not judged. A finding (`forbidden-value`, showing the manifest path and section) is: a package named in `deny`; a second package of one `oneOf` group; with `allow` set, a package not in `allow`. Runs in G1 whenever the diff changes a manifest or lockfile, and on every full run.
- **ARC-008** · P1 · diff, graph, deps — No dead code introduced: files, exports and dependencies added in the diff that nothing uses, excluding adapter entry points and `architecture.<service>.entryPoints` (04 § 13). A file is used when a static import, `require`, `export … from` or literal dynamic `import()` in another non-test file of the repository names it; an export is used when named in such a statement, or when the statement is a namespace import or `export *` of its file; imports from test files (role `test`) do not count. A dependency is used when its package name is imported by a non-test file or referenced as in part `repo-deps`. Failure class `orphan` (the file, export or dependency). Part `repo-deps` (W, `scope: repo`): manifest dependencies that nothing in the repo imports, excluding packages referenced from config files, `package.json` scripts/bins, `@types/*` matching a used package, and adapter entry points.
- **ARC-009** · P1 · ast — No hardcoded environment-specific values: string literals matched by the 04 § 13 ARC-009 patterns (absolute URLs, hostnames with a Public Suffix List suffix, SEC-050 `provider-pattern` key patterns, UUIDs), outside `envModule`, `design.tokens` files, files of role `config` (04 § 7.1) and tests, excluding the 04 § 13 namespaces and `hosts` registry hosts. A literal that SEC-050 also reports (diff secret scan) is reported by SEC-050 only.
- **ARC-010** · P0 · cfg — Type strictness per language is on and unchanged (TypeScript `strict` + `noUncheckedIndexedAccess`; mypy/pyright strict for typed Python). Strictness is read from adapter `strictness[]` pointers (adapters without them: `noAdapterSupport`). When a pointer is off on the diff base too, the finding is owned by `operator` (enable it, or `debt record` at onboarding). A diff that turns a pointer off, removes it or adds a weakening override (e.g. `// @ts-nocheck`, a whole-file `# type: ignore`, a per-file `strict: false`) is reported only by AGT-001 (protected keys, 05 § 3.1) and AGT-003 (suppressions); ARC-010 reports only the state at the diff base.
- **ARC-011** · W · ast — Files over `maxFileLines` or functions over `maxFunctionLines` in the diff. File length = number of `\n`-separated lines. Function length = lines from the first to the last line of its tree-sitter function, method or arrow-function node, inclusive, comments and blank lines counted; each nested function is judged on its own. Part `cognitive`: changed functions whose cognitive complexity (SonarSource definition: +1 per break in linear flow, + nesting level for nested structures) exceeds `maxCognitiveComplexity`.
- **ARC-012** · W · review — Error handling follows one convention per layer; handlers map domain errors to declared HTTP errors (behaviour owned by API-003; swallowing by AGT-010).
- **ARC-013** · P1 · ast — Design tokens are used: with `design.tokens` declared, added or modified lines in `style`, `component`, `route` and `layout` files outside `design.tokens` globs and tests contain no raw colour literals (hex `#rgb[a]`/`#rrggbb[aa]`, `rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()`, `color()`), no Tailwind arbitrary values (`<utility>-[…]` except a bare `var(--…)`), and no `px` literals other than `0`/`1px` for `font-size`, margin/padding/gap/inset properties, nor numeric `z-index` literals — in CSS declarations, inline style objects and class strings (`class`/`className` attributes and the ruleset `classNameFunctions`: `cn`, `clsx`, `cva`, `tw`, …). Part `primitive-bypass` (W): a changed file renders a native `element` of a `design.primitives` entry with a `class`/`className`/`style` attribute without importing that primitive's `module`.
- **ARC-014** · W · ast — No copy-paste: a run of ≥ 50 tokens in added lines (tree-sitter tokens; identifiers → `$id`, literals → `$lit`) that also occurs elsewhere in the repo, outside tests and generated files (adapter `codegen[]` outputs, files marked `@generated` or `DO NOT EDIT`). Rolling hash over 50-token windows; overlapping matches merge into one finding per pair of locations.
- **ARC-015** · W · cfg — The README (`readme`) documents how to work on the service: for each of `install`, `build`, `start` and `test` in the resolved `services[].commands` (policy or adapter defaults), the exact command string appears in a code span or code block, and the env example file (`ops.env.example`, default `.env.example`) is mentioned by name.
