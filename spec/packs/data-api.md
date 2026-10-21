# Pack: data-api

> API contracts proven against real responses, and database changes proven safe on a disposable database. Applies to `api` surfaces and any service with a database.

---

## 1. Policy section

```jsonc
"data-api": {
  "contracts": [
    { "service": "api", "type": "openapi", "path": "quality/contracts/api.openapi.yaml" },
    { "service": "web", "type": "openapi", "path": "quality/contracts/web-routes.openapi.yaml" }
    // also: "graphql" (SDL), "trpc"/"rpc" (generated schema), "jsonschema"
  ],
  "examples": "quality/contracts/examples/",        // request/expectation files (03 § 14), Operator-owned
  "errorShape": { "$ref": "quality/contracts/error.schema.json" },
  "pagination": { "maxLimit": 100 },
  "idempotentPosts": ["/api/payments", "/api/orders"],
  "raceSensitive": [],                                // [{ example: "<examples id>", effect: { db, sql } | { egress: host } | { email: to } }] (API-009)
  "released": "quality/contracts/released/",          // layout and CHANGES.md: 03 § 14 (API-004)
  "db": {
    "database": "main",                                // id in verifyEnv.databases (engine, version, provider live there)
    "migrations": { "format": "sql-dir", "dir": "supabase/migrations" },   // or prisma|drizzle|django|rails|laravel|knex via the service's migrate command
    "exposedSchemas": ["public"],                      // e.g. Supabase PostgREST-exposed schemas
    "largeTables": ["events", "audit_log"],            // migration rules tighten on these
    "planRows": 10000,                                 // DB-010 checks plans only on largeTables seeded to at least this many rows
    "apiRoles": ["anon", "authenticated"],             // roles the API gateway (PostgREST) connects as (DB-009)
    "rpcPublic": [],                                   // SECURITY DEFINER functions intentionally executable by apiRoles
    "edgeFunctionsPublic": [],                         // Supabase Edge Functions deployed without JWT verification on purpose
    "approvedDestructive": [ { "file": "supabase/migrations/20261001_drop_legacy.sql", "sha256": "…" } ]
  },
  "firebase": {                                        // DB-011; rules files are read from firebase.json (else firestore.rules, storage.rules, database.rules.json at the repo root)
    "publicRead": [],                                  // match paths (as written in the rules file, e.g. "/products/{id}") whose read may be unconditional
    "seed": null,                                      // emulator export directory with seeded docs (no default; emulator part notConfigured without it)
    "owned": []                                        // [{ path: "invoices/{id}", ownerField: "uid" }] seeded collections and the field holding the owner's uid
  },
  "jobs": [ { "service": "worker", "name": "send-invoices", "schedule": "0 * * * *", "run": "pnpm job:send-invoices", "idempotencyKey": "invoice_id", "writes": ["invoice_emails"] } ]
}
```
Migrations are applied by the database lifecycle in 04 § 4 (never by vendor CLIs that need Docker).

---

## 2. API contracts — `API-*`

- **API-001** · P0 · contract, http — Every endpoint the service exposes is declared in a contract; every declared endpoint exists. Discovery = adapter routes ∪ contract ∪ requests observed during flows and sampled pages (network log); endpoints found only as strings in client bundles are W.
- **API-002** · P0 · contract, http — Responses to declared example requests and to contract-derived generated requests match the contract (status, headers, body schema), including error responses. Part `deprecation` (W): operations marked `deprecated` in the contract respond with a `Deprecation` header (RFC 9745) and, when the contract gives a sunset date (`x-sunset`), a matching `Sunset` header (RFC 8594).
- **API-003** · P0 · http — Status semantics: success 2xx; validation errors 400/422 with `errorShape`; missing resources 404; auth 401/403; conflicts 409; never 200 with an error body; never 500 for client mistakes. Part `retry-after` (W): every 429 observed (including SEC-025 rate-limit probes) carries `Retry-After` (503s: RES-007).
- **API-004** · P0 · contract, baseline — No breaking changes against the latest contract in `released/` (removed endpoints/fields, narrowed types, new required inputs, changed status codes) unless the contract's major version is bumped and the change is declared in `refactor.json` or the release notes file.
- **API-005** · P1 · contract, http — List endpoints are paginated; `limit` capped at `pagination.maxLimit`; requests above the cap are clamped or rejected, never unbounded.
- **API-006** · P1 · http — `idempotentPosts` accept an `Idempotency-Key`; repeating a request with the same key doesn't repeat the side effect.
- **API-007** · P1 · http — Request body size limits are enforced (oversized → 413).
- **API-008** · P1 · contract — Contract types are the source for client types (generated), not hand-copied.
- **API-009** · P1 · http — Race safety: for each `raceSensitive` entry, its example request (03 § 14) is sent 10 times concurrently with identical inputs and session (mutating stage, 04 § 4.2 step 8); the side effect happens exactly once: `effect.sql` (a scalar) increases by exactly 1, or exactly one request to `effect.egress` passes the egress proxy, or exactly one email to `effect.email` reaches the SMTP sink. Responses other than the winner are 2xx replays of the same result or 409/422/429. `remote: write`.

## 3. Database — `DB-*`

- **DB-001** · P0 · db — Migrations are the only path to schema changes: applying all migrations to an empty disposable database succeeds, and the resulting schema matches what the code expects (generated types/ORM models in sync).
- **DB-002** · P0† · diff, lock — Applied migrations are immutable: files already in the base branch never change; fixes are new migrations.
- **DB-003** · P1 · db — Safe-migration rules: indexes on `largeTables` created `CONCURRENTLY` (Postgres) / `ALGORITHM=INPLACE, LOCK=NONE` (MySQL); no column rename or drop in the same diff as code still referencing it (expand → migrate → contract); adding `NOT NULL` requires a default or a backfill step; no table-rewriting type changes on `largeTables`; data backfills in separate migrations from schema changes.
- **DB-004** · P0† · db — Row Level Security: every table in `exposedSchemas` has RLS enabled and at least one policy; write policies with `using (true)`/`with check (true)` are findings; views over protected tables don't bypass RLS (`security_invoker` or equivalent).
- **DB-005** · deprecated — tombstone; owned by CFG-004 (production targets) and the command policy (05 § 3.2).
- **DB-006** · P0 · db, lock — Destructive statements in migrations (`DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, `DELETE`/`UPDATE` without `WHERE`) require an entry in `db.approvedDestructive` with the file's SHA-256 (signed policy), never a marker inside the file.
- **DB-007** · P1 · db — Foreign keys have supporting indexes; new tables have a primary key.
- **DB-008** · P1 · ast — No N+1 patterns: a query call (adapter `queryApis`) inside a loop over the result of another query, in changed code. Adapters without `queryApis` → `noAdapterSupport`.
- **DB-009** · P0 · db, cfg — Postgres API exposure (after migrations, from the catalog): in `exposedSchemas`, every `SECURITY DEFINER` function sets `search_path` (`proconfig`), and `EXECUTE` on it is not held by any of `apiRoles` or `PUBLIC` unless the function is in `rpcPublic`; no view (or materialized view) references `auth.users`; materialized views and foreign tables (which can't carry RLS) aren't selectable by `apiRoles` (tables are owned by DB-004). Cfg part: Supabase Edge Functions verify JWTs — `supabase/config.toml` `[functions.<name>] verify_jwt = false` and `--no-verify-jwt` in deploy scripts or CI files are findings unless `<name>` is in `edgeFunctionsPublic`. Non-Postgres databases: `notApplicable`.
- **DB-010** · W · browser, db — Query plans on large tables: queries logged during G6 on the embedded instance (04 § 4.2: PostgreSQL `log_min_duration_statement = 0`; MySQL general log) that read a `largeTables` table holding ≥ `planRows` rows after seeding are re-run as `EXPLAIN` (after `ANALYZE`) with their logged parameters; a `Seq Scan` (MySQL `type: ALL`) on that table is a finding. Tables below `planRows`: `skipped(small-table)`.
- **DB-011** · P0† · cfg, db — Firebase security rules (Firestore, Storage, Realtime Database; files from `firebase.json`). Cfg part, on the parsed rules after inlining functions defined in the file and constant-folding `&&`/`||`/`!`: (a) no `allow` of `write`, `create`, `update` or `delete` that is unconditional or whose condition is `true`; (b) no such `read`, `get` or `list` except on a match path in `firebase.publicRead`; (c) no `match /{x=**}` directly under `match /databases/{database}/documents` (Storage: `match /b/{bucket}/o`) with an `allow` whose condition isn't `false`; (d) no write `allow` satisfied by every signed-in user — its atoms are only `true`, `request.auth != null` and `request.auth.uid != null`, with no comparison of `request.auth.uid` or `request.auth.token.*` against a path variable, `resource.data.*`, `request.resource.data.*` or a `get()`/`exists()` result. `database.rules.json`: the same on `.read`/`.write` values (`true`, `"true"`, `"auth != null"`, `"auth.uid != null"`); a root-level value other than `false` counts as (c). Db part (Firebase emulator from the managed toolchain where a build exists for the OS, else `skipped(no-emulator)` and listed; without `firebase.seed`/`owned`: `notConfigured`): with `seed` imported and every `verifyEnv.auth.accounts` id signed in to the Auth emulator as uid = id, through the rules-unit-testing library — for each seeded doc under an `owned` path, an unauthenticated context and every account whose uid ≠ the doc's `ownerField` are refused get, update and delete, and an unauthenticated create in that collection is refused; the owner's own get must succeed (else `notConfigured(owned)`). Other client-direct backends (dependencies `appwrite`, `pocketbase`, `convex`) → `noAdapterSupport`, listed in the report. Postgres/Supabase: DB-004, DB-009.
- **DB-012** · P0 · db, ast — No seeded credentials in production migrations: the migration files the deploy applies (`db.migrations.dir`, else the adapter's `migrations.dir`; never seed files such as `supabase/seed.sql` or adapter seed paths) insert no row into a ruleset `user-tables` table (`auth.users`, `users`, `user`, `accounts`, `auth_user`, `admin_users`, …) whose values include a string literal in a ruleset `password-columns` column, a literal matching a password-hash format (bcrypt `$2[aby]$`, `$argon2`, `$scrypt$`, `pbkdf2_sha256$`, …), a literal argument to `crypt()`, or an email literal matching the ruleset `default-emails` (`admin@example.com`, `test@…`, `@example.{com,org,net}`, …). SQL (`INSERT`, `COPY`, `MERGE`) is parsed for `sql-dir`; for ORM formats, create/insert calls (adapter `queryApis`) in migration files are read with ast.

## 4. Background jobs — `JOB-*`

- **JOB-001** · P1 · cfg, ast — Every scheduled or queued job is declared in `jobs` (adapter `jobDiscovery` patterns); undeclared jobs are findings.
- **JOB-002** · P1 · db — (Runtime part of `db`, evaluated in G4, 04 § 1.1.) Jobs are idempotent: running `run` twice in its own mutating stage (04 § 4.2 step 8) produces the same contents of the `writes` tables (03 § 14).
- **JOB-003** · P1 · ast — Jobs don't swallow failures (AGT-010 applies) and have a bounded retry policy.
