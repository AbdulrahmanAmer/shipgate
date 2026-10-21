# shipgate — 02 Adapters (stack support)

> Load when building or extending stack support, or when a rule's `ast`/`graph` channel must be implemented for a language.

---

## 1. Why adapters

Behaviour checks (`http`, `html`, `site`, `browser`, `contract`, `db`, `baseline`) work against any stack that serves HTTP. Source checks (`ast`, source `graph`) and framework traps need stack knowledge. An adapter supplies that knowledge declaratively; the core never hard-codes a framework.

## 2. Coverage tiers

| Tier | What works | Typical stacks |
|---|---|---|
| **1 — Full** | All behaviour checks + deep source analysis (types, imports, server/client boundaries, framework-specific traps) + codegen | TypeScript/JavaScript frameworks via `oxc` |
| **2 — Structural** | All behaviour checks + structural source rules via tree-sitter (`ast-grep`-style YAML rules), import graph, suppression patterns, framework traps for routing/404/metadata | Python, Ruby, PHP, Go, Java/Kotlin, C#, Rust web frameworks |
| **3 — Behaviour only** | All behaviour checks; source rules are `noAdapterSupport` | Anything else that serves HTTP |

Tiers map to coverage levels: Tier 1 = `full`, Tier 2 = `structural`, Tier 3 = `behaviour`. The report states each service's level and which rules could not be applied; `minCoverage` (policy) sets the minimum the Operator accepts. An adapter's tier is **earned** by passing its conformance suite (§ 7); the manifest only states `claimedTier`. A project-local adapter with no conformance result signed with the current lock, or with a failed one, has earned tier 3 (`behaviour`); its source rules are `noAdapterSupport`.

**Composition:** a service lists a primary adapter plus addons (`"adapters": ["next-app", "supabase"]`). Addons contribute rules, platform prep and codegen; the primary owns routing, commands and rendering semantics.

**Databases run locally:** PostgreSQL, MySQL and SQLite (embedded, from the managed toolchain). Anything else (MongoDB, Redis, queues, object storage) is `external` or stubbed by the project's own test configuration; rules that need it are `notConfigured(<engine>)` when absent.

## 3. What an adapter declares

Full field list and schema: `03-formats.md` § 6. Example:

```jsonc
{
  "id": "next-app",
  "claimedTier": 1,
  "role": "primary",
  "priority": 100,
  "detect": { "files": ["next.config.*"], "dependency": "next", "dirs": ["app"] },
  "language": ["oxc:typescript", "oxc:tsx"],      // oxc languages and/or tree-sitter grammar ids
  "templateLanguages": [],
  "defaults": { "commands": { "build": "next build", "start": "next start", "typecheck": "tsc --noEmit" } },
  "portBinding": "env:PORT",
  "envInlinedAtBuild": true,
  "routes": { "discover": "fs-app-router", "fileMap": "app-router" },
  "fileRoles": { "app/**/page.*": "route", "app/**/route.*": "api-handler", "app/**/layout.*": "layout" },
  "entryPoints": ["app/**/{page,layout,route,loading,error,not-found}.*", "middleware.*", "proxy.*", "next.config.*"],
  "config": { "trailingSlash": "next.config:trailingSlash", "basePath": "next.config:basePath", "i18n": "next.config:i18n" },
  "suppressions": ["@ts-ignore", "@ts-nocheck", "@ts-expect-error", "eslint-disable", "as any", "as unknown as"],
  "testMarkers": [".skip(", ".only(", ".todo(", "xit(", "test.fixme("],
  "serverOnlyMarkers": ["import 'server-only'", "**/*.server.ts"],
  "publicEnvPrefixes": ["NEXT_PUBLIC_"],
  "rules": "adapters/next-app/rules/",
  "codegen": ["url-module", "safe-json-ld", "env-module", "inventory-reader", "types-from-policy"]
  // remaining required fields: see 03 § 6
}
```

**Detection and selection.** `detect` matches when every key present matches: `files` — any glob matches a file under the service path; `dependency` — a direct dependency of the service manifest; `dirs` — every listed dir exists under the service path. Manifests declare `role: "primary" | "addon"` (03 § 6). `"adapters": ["auto"]` selects the highest-`priority` matching primary (ties fail CFG-002; no match → `generic-http`) plus every matching addon. An explicit list names its primary first (03 § 3.2); an addon in first position, or a second primary, fails CFG-002.

Adapter rules are written as ast-grep-compatible YAML structural patterns, so new rules and stacks don't require changing the Rust core. Built-in adapters ship with the binary; project-local adapters live in `quality/adapters/` (Operator-owned, locked).

## 4. Source analysis engines
- **Structural rules, every tier:** `ast-grep-core` on tree-sitter grammars (TypeScript/TSX/JS, Python, Ruby, PHP, Go, Java, Kotlin, C#, Rust, HTML, CSS). This is the engine for all YAML rules.
- **Semantic analysis, Tier 1 JS/TS:** `oxc` (parser, semantic model, module resolution with TS config paths) for the import graph, client/server boundaries, data-flow checks (04 § 13) and built-in Rust rules. Vue/Svelte/Astro: script blocks extracted and analysed with `oxc`.
- **Templates:** tree-sitter grammars for `vue`, `svelte`, `astro`, `embedded-template` (ERB/EJS), `twig`, `blade`, `jinja2` parse template markup so template-level rules (SEC-001 raw sinks, TPL-001) can run. Where a maintained grammar isn't available for a template language, the adapter uses declared regex sink patterns (`regexSinks`, 03 § 6) with stated precision. A service whose files include a template language that the adapter covers only through `regexSinks` has coverage level at most `structural`; template rules on those files report their declared precision in the finding.
- **Import graphs, Tier 2:** per-language resolvers (Python imports, Go packages, Ruby requires/Zeitwerk, PHP namespaces/Composer autoload, Java/Kotlin packages, C# namespaces).
- **SQL:** a SQL parser (PostgreSQL and MySQL dialects) for migrations and policies.
- Rules needing semantics declare `engine: oxc` in metadata and are `noAdapterSupport` outside Tier 1 JS/TS.

## 5. Built-in adapters — v1 targets

| Adapter | Tier | Route discovery | 404 / not-found mechanism | Metadata | Key traps: observable condition → guarded rule (`guards`, 03 § 5) |
|---|---|---|---|---|---|
| `static-html` (plain HTML/CSS/JS, static-site-generator output) | 1 | the files themselves | shipgate's built-in static server returns real 404s; host rules (`_redirects`, `vercel.json`, `netlify.toml`, `.htaccess`) are parsed and emulated | in the HTML files | a host rule rewriting `/*` or `/**` to an HTML file with status 200 → RTE-004; an HTML file without `<html lang>` → MET-007; two HTML files with the same `<title>` → MET-001 |
| `next-app` (Next.js App Router 15/16) | 1 | `app/` file system | `notFound()` before any `<Suspense>`; no `loading.tsx` in segments that 404 | `generateMetadata`, `metadataBase` | `notFound()` reachable after a `<Suspense>` boundary or in a segment with `loading.tsx` (streaming commits 200) → RTE-005; a dynamic segment with neither `export const dynamicParams = false` nor a param check that calls `notFound()` → RTE-006; a segment config export (`revalidate`, `dynamic`, `fetchCache`) whose value isn't a literal, or, with `cacheComponents: true`, any such export → BLD-004; `params`/`searchParams` members read without `await` or `use()` → RTE-006; `'use client'` as the first statement of a `page.*` file → RTE-002. `middleware.*` and `proxy.*` both count as entry points |
| `next-pages` (Next.js Pages Router) | 1 | `pages/` file system | `{ notFound: true }` from data functions | `next/head` | `router.asPath` used in a canonical or `og:url` value (it includes the query string) → URL-004; `getStaticPaths` returning `fallback: true` (a 200 shell for unknown params) → RTE-005 |
| `vite-spa` (React/Vue/Svelte SPA on Vite) | 1 | router config scan + declared routes | Server/host config (SPAs return 200 for everything by default) | Client-side only | a public route that is neither prerendered nor SSR → RTE-001; a host fallback rewrite of unknown URLs to `index.html` with 200 → RTE-004 |
| `tanstack-start` | 1 | route tree file | `notFound()` thrown in loaders | route `head()` | a loader `catch` that returns data or throws `notFound()` for a dependency error → RTE-007; a public route with `ssr: false` → RTE-002 |
| `react-router` (v7 framework mode / Remix) | 1 | route config | `throw data(null, { status: 404 })` / 404 Response in loaders | `meta` export | an `ErrorBoundary` that renders a thrown dependency error with status 200 → RTE-007 |
| `astro` | 1 | `src/pages/` | static: absent from `getStaticPaths`; on-demand: `return new Response(null, { status: 404 })` | layout `<head>` | `trailingSlash` not matching `build.format` (`always` needs `directory`, `never` needs `file`) → URL-001; `<h1>` or `<main>` text rendered only inside a `client:only` island → RTE-001 |
| `nuxt` | 1 | `pages/` | `throw createError({ statusCode: 404, fatal: true })` server-side | `useSeoMeta`, `useHead` | `ssr: false` globally or in a `routeRules` entry matching a public route → RTE-002; data for `<h1>`/`<main>` content fetched in `onMounted` → RTE-001 |
| `sveltekit` | 1 | `src/routes/` | `error(404)` in server `load` | `<svelte:head>` | `export const ssr = false` in a public route's `+page`/`+layout` file → RTE-002 |
| `supabase` (data platform) | 1 (db) | — | — | — | a table in `exposedSchemas` without RLS, or a write policy `using (true)`/`with check (true)` → DB-004; the service-role key in client code → SEC-005 |
| `django` | 2 | URLconf (`urls.py`) | `Http404` / `get_object_or_404` | templates | `DEBUG = True` in the production settings module → SEC-007; `ALLOWED_HOSTS` containing `'*'` → SEC-038 |
| `fastapi` / `flask` | 2 | decorators / OpenAPI | `HTTPException(404)` / `abort(404)` | — | a FastAPI route on a declared endpoint without `response_model` → API-002; `debug=True` or `FLASK_DEBUG=1` in the production config → SEC-007 |
| `rails` | 2 | `rails routes` output | `ActiveRecord::RecordNotFound` → 404 in production | views/helpers | `config.consider_all_requests_local = true` in `config/environments/production.rb` → SEC-007 |
| `laravel` | 2 | `php artisan route:list --json` | `abort(404)` / `findOrFail` | Blade | `APP_DEBUG=true` in the production environment → SEC-007 |
| `wordpress` | 2 | sitemap + crawl | theme/plugin dependent | SEO plugins | the theme and a plugin, or two plugins, both emitting `<title>`, description or canonical → RTE-008 |
| `spring` / `aspnet` / `go-http` / `rust-http` | 2 | annotations / attribute routing / router registration | framework-specific | templates | a debug error page enabled in the production profile (`server.error.include-stacktrace=always`, `ASPNETCORE_ENVIRONMENT=Development`, panic traces written to responses) → SEC-007 |
| `generic-http` | 3 | crawl + sitemap + declared routes | observed only | observed only | — |
| `hosted-builder` (Wix, Webflow, Duda, Squarespace, Shopify themes, hosted WordPress) | 3 (remote mode) | crawl + sitemap | observed only | observed only | behaviour only, reported with "fix in the builder's settings" hints: builder-generated duplicate metadata → RTE-008; client-rendered required content → RTE-001; unremovable script bloat → PRF-010 |

Tier-1 trap details live in the adapter rule files; the table is the index. Each trap's adapter rule (`<ADAPTER>-NNN`) declares `guards: [<ID>]` with the rule named after its arrow, and its finding is a source hint for that rule. Each trap rule is verified twice: the source rule catches it early, and the behaviour rule (status code, header, raw HTML) proves the outcome.

## 6. Monorepos and platforms
- Each service gets its own adapter, commands, port and surfaces.
- Cross-service rules (SEC-012 CORS between services, API-002/API-004 producer–consumer contracts) run in G4 with every local service of the policy started.
- Shared packages are analysed with the adapter of the language they're written in; their rules apply wherever they're imported.

## 7. Adding a stack
1. Write the adapter manifest (detection, commands, route discovery, suppression and test markers).
2. Add structural rules for its traps.
3. Add a fixture project to shipgate's own test suite with known-good and known-bad cases for every rule the adapter claims.
4. The adapter's tier is earned by passing that suite, not declared.
5. Windows: every default command must run without Unix tools (`windows` overrides in the manifest); the suite runs on Windows, macOS and Linux.
6. Project-local adapters earn their tier with `shipgate conformance --adapter <id>` against Operator-supplied fixtures; the result is signed with the lock.
