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
| **3 — Behaviour only** | All behaviour checks; source rules report `rulesNoAdapterSupport` | Anything else that serves HTTP |

Tiers map to coverage levels: Tier 1 = `full`, Tier 2 = `structural`, Tier 3 = `behaviour`. The report states each service's level and which rules could not be applied; `minCoverage` (policy) sets the minimum the Operator accepts. An adapter's tier is **earned** by passing its conformance suite (§ 7); the manifest only states `claimedTier`.

**Composition:** a service lists a primary adapter plus addons (`"adapters": ["next-app", "supabase"]`). Addons contribute rules, platform prep and codegen; the primary owns routing, commands and rendering semantics.

**Databases run locally:** PostgreSQL, MySQL and SQLite (embedded, from the managed toolchain). Anything else (MongoDB, Redis, queues, object storage) is `external` or stubbed by the project's own test configuration; rules that need it report `NOT_CONFIGURED` when absent.

## 3. What an adapter declares

Full field list and schema: `03-formats.md` § 6. Example:

```jsonc
{
  "id": "next-app",
  "claimedTier": 1,
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

Adapter rules are written as ast-grep-compatible YAML structural patterns, so new rules and stacks don't require changing the Rust core. Built-in adapters ship with the binary; project-local adapters live in `quality/adapters/` (Operator-owned, locked).

## 4. Source analysis engines
- **Structural rules, every tier:** `ast-grep-core` on tree-sitter grammars (TypeScript/TSX/JS, Python, Ruby, PHP, Go, Java, Kotlin, C#, Rust, HTML, CSS). This is the engine for all YAML rules.
- **Semantic analysis, Tier 1 JS/TS:** `oxc` (parser, semantic model, module resolution with TS config paths) for the import graph, client/server boundaries, data-flow checks (04 § 13) and built-in Rust rules. Vue/Svelte/Astro: script blocks extracted and analysed with `oxc`.
- **Templates:** tree-sitter grammars for `vue`, `svelte`, `astro`, `embedded-template` (ERB/EJS), `twig`, `blade`, `jinja2` parse template markup so template-level rules (SEC-001 raw sinks, TPL-001, PRF-005) can run. Where a maintained grammar isn't available for a template language, the adapter uses declared regex sink patterns with stated precision, and that adapter's tier is capped at 2 for those rules.
- **Import graphs, Tier 2:** per-language resolvers (Python imports, Go packages, Ruby requires/Zeitwerk, PHP namespaces/Composer autoload, Java/Kotlin packages, C# namespaces).
- **SQL:** a SQL parser (PostgreSQL and MySQL dialects) for migrations and policies.
- Rules needing semantics declare `engine: oxc` in metadata and are `noAdapterSupport` outside Tier 1 JS/TS.

## 5. Built-in adapters — v1 targets

| Adapter | Tier | Route discovery | 404 / not-found mechanism | Metadata | Key traps (rules) |
|---|---|---|---|---|---|
| `static-html` (plain HTML/CSS/JS, static-site-generator output) | 1 | the files themselves | shipgate's built-in static server returns real 404s; host rules (`_redirects`, `vercel.json`, `netlify.toml`, `.htaccess`) are parsed and emulated | in the HTML files | Host fallback rewrites turning unknown URLs into 200; missing `<html lang>`; duplicate titles across copied pages |
| `next-app` (Next.js App Router 15/16) | 1 | `app/` file system | `notFound()` before any `<Suspense>`; no `loading.tsx` in segments that 404 | `generateMetadata`, `metadataBase` | Streaming after `loading.tsx` turns 404 into 200 + noindex; `dynamicParams` default `true` leaves the URL space open; `revalidate` must be a literal; Cache Components change segment config behaviour; `params` is a Promise; middleware renamed `proxy.ts` in 16; `'use client'` on page files |
| `next-pages` (Next.js Pages Router) | 1 | `pages/` file system | `{ notFound: true }` from data functions | `next/head` | `router.asPath` includes the query string; `fallback: true` serves a 200 shell |
| `vite-spa` (React/Vue/Svelte SPA on Vite) | 1 | router config scan + declared routes | Server/host config (SPAs return 200 for everything by default) | Client-side only | Public surface must be prerendered/SSR or it fails RTE-001; host fallback rewrites turn unknown URLs into 200 soft-404s |
| `tanstack-start` | 1 | route tree file | `notFound()` thrown in loaders | route `head()` | Loader errors must map to 5xx; check SSR is enabled for public routes |
| `react-router` (v7 framework mode / Remix) | 1 | route config | `throw data(null, { status: 404 })` / 404 Response in loaders | `meta` export | Error boundaries rendering 200 |
| `astro` | 1 | `src/pages/` | static: absent from `getStaticPaths`; on-demand: `return new Response(null, { status: 404 })` | layout `<head>` | `trailingSlash` vs `build.format` mismatch; client islands holding required content |
| `nuxt` | 1 | `pages/` | `throw createError({ statusCode: 404, fatal: true })` server-side | `useSeoMeta`, `useHead` | `ssr: false`; data fetched in `onMounted` |
| `sveltekit` | 1 | `src/routes/` | `error(404)` in server `load` | `<svelte:head>` | `export const ssr = false` on public routes |
| `supabase` (data platform) | 1 (db) | — | — | — | RLS disabled on exposed tables; service-role key in client code; policies `using (true)` on writes |
| `django` | 2 | URLconf (`urls.py`) | `Http404` / `get_object_or_404` | templates | `DEBUG=True` leaking tracebacks; `ALLOWED_HOSTS='*'` |
| `fastapi` / `flask` | 2 | decorators / OpenAPI | `HTTPException(404)` / `abort(404)` | — | Missing response models; debug mode |
| `rails` | 2 | `rails routes` output | `ActiveRecord::RecordNotFound` → 404 in production | views/helpers | `config.consider_all_requests_local` in production |
| `laravel` | 2 | `php artisan route:list --json` | `abort(404)` / `findOrFail` | Blade | `APP_DEBUG=true` |
| `wordpress` | 2 | sitemap + crawl | theme/plugin dependent | SEO plugins | Duplicate metadata owners (theme + plugin) |
| `spring` / `aspnet` / `go-http` / `rust-http` | 2 | annotations / attribute routing / router registration | framework-specific | templates | Debug error pages in production |
| `generic-http` | 3 | crawl + sitemap + declared routes | observed only | observed only | — |
| `hosted-builder` (Wix, Webflow, Duda, Squarespace, Shopify themes, hosted WordPress) | 3 (remote mode) | crawl + sitemap | observed only | observed only | Builder-generated duplicate metadata, client-rendered content, unremovable script bloat — reported with "fix in the builder's settings" hints |

Tier-1 trap details live in the adapter rule files; the table is the index. Each trap rule is verified twice: the source rule catches it early, and the behaviour rule (status code, header, raw HTML) proves the outcome.

## 6. Monorepos and platforms
- Each service gets its own adapter, commands, port and surfaces.
- Cross-service checks (CORS between web and API, auth propagation, contract compatibility between producer and consumer) run in G4 with all services up.
- Shared packages are analysed with the adapter of the language they're written in; their rules apply wherever they're imported.

## 7. Adding a stack
1. Write the adapter manifest (detection, commands, route discovery, suppression and test markers).
2. Add structural rules for its traps.
3. Add a fixture project to shipgate's own test suite with known-good and known-bad cases for every rule the adapter claims.
4. The adapter's tier is earned by passing that suite, not declared.
5. Windows: every default command must run without Unix tools (`windows` overrides in the manifest); the suite runs on Windows, macOS and Linux.
6. Project-local adapters earn their tier with `shipgate conformance --adapter <id>` against Operator-supplied fixtures; the result is signed with the lock.
