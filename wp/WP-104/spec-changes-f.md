# WP-104 part f — spec problems found (foundation recipes, `rules/recipes/*.json`)

Each item: the spec line, what was observed, the change proposed. The orchestrator decides; nothing here was worked around silently.

## 1. `formatVersion` in recipe files vs "no `formatVersion` in `rules/**`"
- Spec: 04 § 7 (*foundation recipes*) defines `recipes/<adapter id>.json` as `{ formatVersion, recipes: [...] }`. 03 § 1 exempts "ruleset data files inside shipgate (`rules/**`)" from carrying `formatVersion`, and `wp/WP-104/BRIEF.md` says "no `formatVersion`".
- Observed: the two statements contradict for exactly this file family. The part-f instruction was to keep `formatVersion: 1` (04 § 7 names it), and all 19 files carry it.
- Proposal: keep it (a reader that checks it can reject a future incompatible shape) and add one sentence to 03 § 1: "the `recipes/*.json` ruleset files are the exception: they carry `formatVersion`". The alternative is to delete `formatVersion` from the 04 § 7 shape; the files then need that key removed.

## 2. RTE-004 "Retired path → 410" cannot be produced by a static host's redirect file
- Spec: RTE-004 table row "Retired path, no successor … 410"; adapters `static-html` and `vite-spa` rely on host rule files (02 § 5: `_redirects`, `vercel.json`, `netlify.toml`, `.htaccess` are "parsed and emulated").
- Observed (static-html/vite-spa author, from the Netlify and Cloudflare Pages docs): Cloudflare Pages `_redirects` allows only 301/302/303/307/308 and 200; the Netlify docs list 301, 302, 404 and 200 and are silent on 410. A 410 therefore needs a small edge function (Netlify) or Pages middleware (Cloudflare), or an nginx/Apache rule when self-hosting.
- Proposal: in 02 § 5 `static-html` row, say that retired paths on those two hosts are served by an edge function/middleware that shipgate cannot read from `_redirects`; shipgate's emulation can only observe the 410 over HTTP (RTE-004 `status`), not from the file.

## 3. IDX-005 and the sitemap response of Django
- Spec: IDX-005 "Production … none of these [noindex, `Disallow: /`, no sitemap]".
- Observed (Django 6.x `django.contrib.sitemaps`): the built-in sitemap view adds `X-Robots-Tag: noindex, noodp, noarchive` to every sitemap response. A strict reading of "production sends no noindex signal on any URL" flags it, although a noindex on the sitemap file itself is harmless and conventional.
- Proposal: IDX-005 production half: "applies to HTML documents and robots.txt; `X-Robots-Tag` on sitemap XML files is ignored". The Django recipe removes the header in production to satisfy the strict reading, which costs a line of code and may be unnecessary.

## 4. Version labels in 02 § 5 are stale for several adapters
- Spec: 02 § 5 names "React Router v7 framework mode / Remix", "Next.js App Router 15/16", "Django" (unversioned) and the task text lists Spring Boot 3, Rails 8, Laravel 12.
- Observed on 2026-10-22 (npm/PyPI/Maven latest at the time of writing, see the provenance fragments): React Router `latest` is v8 (v7.18 on the `version-7` tag), Django 6.x has a built-in CSP middleware (`django.middleware.csp`), Spring Boot 4.x / Spring Security 7.x are current documentation, Next.js 16.4, Nuxt 4.6, TanStack Start 1.169. The recipes target the current major and say which older major they also fit.
- Proposal: 02 § 5 should name the supported majors per adapter in one place (the adapter manifests), not in prose; recipe `title`s then do not need a version.

## 5. SEC-016 vs a blanket `Cache-Control: public` on HTML
- Spec: PRF-008 HTML rule only bounds `max-age`; SEC-016 makes any shared-cacheable response (`public`, `s-maxage`, or `max-age > 0` without `private`/`no-store`) with `Set-Cookie` a P0 finding.
- Observed: frameworks that set a session or CSRF cookie on anonymous HTML (Django `csrftoken`, Laravel, Rails) turn a recipe that sends `public, max-age=0, must-revalidate` into a SEC-016 hit on those pages (the Django and FastAPI authors hit this). The recipes therefore emit `private, max-age=0, must-revalidate`/`no-cache` whenever a response sets a cookie.
- Proposal: PRF-008 HTML text should recommend `no-cache` or `max-age=0, must-revalidate` and not `public`, so a reader does not copy the combination SEC-016 forbids.

## 6. SEC-024 marks anonymous forms `notApplicable`, but the contact form still needs cross-site protection
- Spec: SEC-024 "anonymous requests — login, signup, public forms — are `notApplicable` here; SEC-025 and SEC-055 own them".
- Observed: SEC-055 (bot protection) does not require any origin check, so a public form can pass every rule while being postable cross-site. The recipes add an Origin / Sec-Fetch-Site check (or the framework CSRF token) anyway, because UX-001/RES-008 replays post to the endpoint and a cross-site form post is still an abuse path.
- Proposal: none required; noted so the orchestrator knows the recipes go beyond the rules on purpose.

## 7. Next.js 16.4.2: `notFound()` and thrown errors in a request-time page return the right status with an empty client-render shell
- Spec: UX-005 requires the 404 response to each RTE-004 Unknown-URL probe and RTE-006 probe URL, and each 5xx HTML response from fault injection, to contain a `<nav>` and an `<a>` to the mount root in the HTML; RTE-005/RTE-007 only judge the status line.
- Observed (Next.js 16.4.2, `next build && next start`, Node 24, Windows 11, Turbopack; a minimal app with only `layout.tsx`, `not-found.tsx` and one page; reproduced in the full recipe app and with the layout, proxy, error.tsx and global-error.tsx removed one at a time, and with browser-like `Accept`/`User-Agent`): a page that calls `notFound()` (sync, after `await params`, after a timer, `force-dynamic` or not, with or without `generateStaticParams`) answers 404 but its HTML body is the `__next_error__` shell; the not-found tree exists only in the RSC payload and is drawn by the browser. A database error thrown in a page answers 500 with the same shell. Unmatched URLs (root `not-found.tsx`) and params rejected by `export const dynamicParams = false` + `generateStaticParams()` return the full HTML 404 with the site chrome. No error was logged by the server. A `--webpack` build was attempted twice and did not finish within 15 minutes (BLOCKED, so the webpack/Turbopack difference is not known). Not tested: Linux, other Next minors.
- Proposal: UX-005 on the `next-app` adapter would fail on every dynamic 404 and 5xx until Next changes or a workaround exists. Options for the orchestrator: (a) keep the rule strict and let the recipe say so (it does, with the measured facts); (b) add an adapter trap row to 02 § 5 `next-app`: "`notFound()` / thrown error in a request-time page → empty HTML shell (UX-005); closed sets use `dynamicParams = false`"; (c) have UX-005 accept the RSC payload (`self.__next_f`) as carrying the elements, which is weaker than what a crawler sees. Not decided here.
- Note on next-pages: the Pages Router recipes were built and probed on the same Next 16.4.2: `getServerSideProps` `notFound: true` and `pages/404.tsx` return 404 with the full HTML (nav and home link present), `res.statusCode = 410` works, nonces are on every script. One recipe error was found and fixed by that run: reading the nonce in `_document` does not stop Next from prerendering pages (the build output showed them static, HTML without nonce, so `strict-dynamic` would block every script); `_app.getInitialProps` is now part of the recipe and the build shows every route dynamic.

## 8. PRF-008 "content-hashed" test does not match ASP.NET fingerprints
- Spec: PRF-008 identifies hashed assets by the adapter build manifest or the name pattern `[.-][a-f0-9]{8,}\.`.
- Observed (ASP.NET Core 9/10 `MapStaticAssets`): file names carry a 10-character base36 fingerprint (`site.j1gj83w5d9.js`), which the hex pattern does not match, and the header it sends is `max-age=31536000, immutable` without `public` (the recipe adds `public`).
- Proposal: the `aspnet` adapter must read the static-asset manifest (`*.staticwebassets.endpoints.json`) for PRF-008, or the pattern becomes `[.-][a-z0-9]{8,}\.`; decide in 02 § 5.

## 9. Framework majors moved past the spec's labels (affects adapter manifests, not the rules)
- Laravel: `composer create-project` gave 13.x; the recipe was run on 12.70 and 13.38. Failed CSRF is 419 on both; Laravel 13 lets a request with `Sec-Fetch-Site: same-origin` through without a token.
- SvelteKit 3 and Astro 7 are current; the recipes target them and say what differs on SvelteKit 2 / Astro 5 (from memory, not run).
- Spring Boot 4.1 / Security 7.1: the recipe ran on 3.5.16 and 4.1.1; `server.error.*` is deprecated in favour of `spring.web.error.*` (both set).

## UNPROVEN (recipe id + what was not run)
Everything below is what the part-f runs did NOT exercise. Each other behaviour of a recipe was run as listed in the report; the proven set per adapter is in the report and in the scratch harnesses.
- all 19 adapters: nobody ran shipgate itself against the recipes; the `check-recipes` token checks are necessary conditions only. Real TLS/HSTS behind a proxy and the Google tag with a real tag ID were not run anywhere.
- `next-app` / all recipes: Linux, and any Next minor other than 16.4.2, were not run (see item 7). `next-app/health-endpoint`, `robots-sitemap`, `form-handler` ran on 16.4.2; `error-pages` ran and the shell finding stands. A `--webpack` build hung twice (BLOCKED).
- `next-pages` / all recipes: production mode ran on 16.4.2; the preview-mode (non-production) variant and DB-down variant were run for `next-app` only.
- `static-html`, `vite-spa` / headers, error-pages, robots-sitemap: the generated `_headers` files were inspected but never served by Netlify or Cloudflare Pages; no Vite build ran (esbuild would not install: BLOCKED, obstacle `spawn esbuild.exe ENOENT`, unblock: a machine where esbuild installs). `@prerenderer/rollup-plugin` output shape and `build.modulePreload: false` under `strict-dynamic` were not run. The 410 edge function / Pages middleware were not run.
- `tanstack-start`, `react-router` / headers, error-pages, health-endpoint, robots-sitemap, form-handler, consent-loader: type-checked only (tsc), never run on a server or in a browser; `react-router typegen` failed (`ERR_PACKAGE_IMPORT_NOT_DEFINED`), so route types were shimmed. TanStack `getGlobalStartContext()` nonce plumbing and `setResponseHeader` before `next()` are read from source, not run.
- `nuxt` / all recipes: parsed only; Nitro/nuxt-security behaviour (merge, ordering, static files getting `X-Robots-Tag`) not run.
- `astro`, `sveltekit`: run on the Node adapter only; `_headers` output not served by a host; adapter-static and Cloudflare/Vercel runtimes, Turnstile, `ORIGIN`/proxy setups and the SvelteKit 2 / Astro 5 variants not run.
- `django`, `fastapi`, `flask`, `rails`: run on SQLite/locmem stand-ins; real Postgres, real SMTP (451 on RCPT), multi-worker rate limits and proxy settings not run. `rails` ran on a minimal Propshaft app, not a stock `rails new`.
- `rust-http`: compiled and ran against an unreachable Postgres only; no live Postgres, no success path to a real webhook.
- `spring`, `aspnet`: ran on H2 / Sqlite; SQL Server and Postgres, Gradle, Java 17, distributed rate limiting, Turnstile not run. On ASP.NET the rate limiter counts CSRF-rejected posts (left as is).
- `laravel`, `wordpress`, `go-http`: ran on `php -S`/Go net/http, not behind php-fpm or TLS. WordPress: DB-down with the SQLite drop-in shows the drop-in's own page (the core `db-error.php` path was proven separately against a closed MySQL port); `wp_mail` stubbed (no real SMTP); the 502 for a failed mail is the default `wp_die` page without `<nav>`. Laravel/Go delivery tested against a local webhook only.
- `consent-loader` of `astro`, `sveltekit`, `react-router` (repackaged as module/component code): Astro and SvelteKit were run in headless Chrome; the `react-router` version was only type-checked.
