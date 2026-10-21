# Pack: architecture

> Keeps agent-written code inside the structure the Operator chose: layers, boundaries, server/client separation, one implementation per concern, controlled dependencies. These rules are what stop a codebase from degrading across many agent sessions.

---

## 1. Policy section

Sections are per service (a Python API and a Next.js web app have different structures); the adapter supplies language idioms (what an "import", an "env read" or an "HTTP client" is).

```jsonc
"architecture": { "web": {
  "layers": [
    { "name": "ui",       "paths": ["apps/web/components/**", "apps/web/app/**"], "mayImport": ["domain", "shared", "data-client"] },
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

- **ARC-001** · P1 · graph — Imports respect `layers[].mayImport`; a file outside every layer is a finding. Files counted: source files of the service's adapter languages with role `component`, `route`, `layout`, `api-handler` or `source` (04 § 7.1), excluding tests (adapter `testMarkers`), `codegen[]` outputs and files marked `@generated`. A file matching several layers belongs to the first in declared order.
- **ARC-002** · P0 · graph, build — `serverOnly` modules (DB clients, admin SDKs) are never imported from client entry points (adapter `clientEntries`) and never appear in built client assets. Part `bundle` (build): a client asset whose source map (or the adapter `bundleManifest`) lists a source path matching `serverOnly`, or that contains a string from an adapter `serverOnlyMarkers` entry, is a finding; no source maps and no `bundleManifest`: part `bundle` is `noAdapterSupport`, and the graph part still applies. Secret values themselves are owned by SEC-005.
- **ARC-003** · P1 · graph — No new import cycles. Cycles = strongly connected components (≥ 2 files) of the file import graph, type-only imports excluded. A finding (`cycle`) is each component that is not a subset of a component in `_main/cycles.json` or of a debt entry (one finding per component, listing its new files). No `_main`: `skipped(no-main)`.
- **ARC-004** · P1 · ast — Environment variables are read only in `envModule`: an adapter `envReadApis` call outside `envModule` is a finding. Part `schema`: every env read in `envModule` is an argument (directly, or as a member of the object passed) to an adapter `validatorApis` call (e.g. zod `parse`, `createEnv`, `envalid.cleanEnv`, pydantic `BaseSettings`) executed at module top level. No `envModule`: `notConfigured(envModule)`.
- **ARC-005** · P1 · ast — Data for an entity is read/written only through its `dataAccess` module. A `queryApis` call belongs to entity `e` when its first string-literal argument or model identifier equals `e`, `e`+`s`, `e`+`es` or PascalCase(`e`), case-insensitively; such a call outside `dataAccess.entities[e]` is a finding. A `queryApis` call in a file of role `component`, `route`, `layout` or `api-handler` is always a finding.
- **ARC-006** · P1 · ast — Concerns in `singletons` have one implementation: calls to the adapter-declared API family outside the singleton module are findings (04 § 13). Singleton keys and their API families: `http-client` → `httpClientApis`, `auth-guard` → `authGuardApis`, `db-client` → `queryApis`, `formatting` → `formatterApis`, `url` → `urlBuilderApis`. Other keys fail CFG-001.
- **ARC-007** · P1 · deps — Dependencies: nothing from `deny`; at most one package from each `oneOf` group; `allow` enforced when set.
- **ARC-008** · P1 · diff, graph, deps — No dead code introduced: files, exports and dependencies added in the diff that nothing uses, excluding adapter entry points and `architecture.<service>.entryPoints` (04 § 13). Part `repo-deps` (W, `scope: repo`): manifest dependencies that nothing in the repo imports, excluding packages referenced from config files, `package.json` scripts/bins, `@types/*` matching a used package, and adapter entry points.
- **ARC-009** · P1 · ast — No hardcoded environment-specific values: string literals matched by the 04 § 13 ARC-009 patterns (absolute URLs, hostnames with a Public Suffix List suffix, SEC-050 `provider-pattern` key patterns, UUIDs), outside the env/config module and tests, excluding the 04 § 13 namespaces and `hosts` registry hosts. A literal that SEC-050 also reports (diff secret scan) is reported by SEC-050 only.
- **ARC-010** · P0 · cfg — Type strictness per language is on and unchanged (TypeScript `strict` + `noUncheckedIndexedAccess`; mypy/pyright strict for typed Python). Strictness is read from adapter `strictness[]` pointers (adapters without them: `noAdapterSupport`). When a pointer is off on the diff base too, the finding is owned by `operator` (enable it, or `debt record` at onboarding). When the diff turns it off, removes it or adds a weakening override (e.g. `// @ts-nocheck`, a whole-file `# type: ignore`, a per-file `strict: false`), it is owned by `builder`.
- **ARC-011** · W · ast — Files over `maxFileLines` or functions over `maxFunctionLines` in the diff. Part `cognitive`: changed functions whose cognitive complexity (SonarSource definition: +1 per break in linear flow, + nesting level for nested structures) exceeds `maxCognitiveComplexity`.
- **ARC-012** · W · review — Error handling follows one convention per layer; handlers map domain errors to declared HTTP errors (behaviour owned by API-003; swallowing by AGT-010).
- **ARC-013** · P1 · ast — Design tokens are used: with `design.tokens` declared, added or modified lines in `style`, `component`, `route` and `layout` files outside `design.tokens` globs and tests contain no raw colour literals (hex `#rgb[a]`/`#rrggbb[aa]`, `rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()`, `color()`), no Tailwind arbitrary values (`<utility>-[…]` except a bare `var(--…)`), and no `px` literals other than `0`/`1px` for `font-size`, margin/padding/gap/inset properties, nor numeric `z-index` literals — in CSS declarations, inline style objects and class strings (`class`/`className` attributes and the ruleset `classNameFunctions`: `cn`, `clsx`, `cva`, `tw`, …). Part `primitive-bypass` (W): a changed file renders a native `element` of a `design.primitives` entry with a `class`/`className`/`style` attribute without importing that primitive's `module`.
- **ARC-014** · W · ast — No copy-paste: a run of ≥ 50 tokens in added lines (tree-sitter tokens; identifiers → `$id`, literals → `$lit`) that also occurs elsewhere in the repo, outside tests and generated files (adapter `codegen[]` outputs, files marked `@generated` or `DO NOT EDIT`). Rolling hash over 50-token windows; overlapping matches merge into one finding per pair of locations.
- **ARC-015** · W · cfg — The README (`readme`) documents how to work on the service: for each of `install`, `build`, `start` and `test` in the resolved `services[].commands` (policy or adapter defaults), the exact command string appears in a code span or code block, and the env example file (`ops.env.example`, default `.env.example`) is mentioned by name.
