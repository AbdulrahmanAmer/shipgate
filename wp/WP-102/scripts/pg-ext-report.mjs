// Per PostgreSQL major: which commonly migrated extensions are present on every platform, which are missing where.
import { readFileSync } from "node:fs";
const m = JSON.parse(readFileSync(process.argv[2], "utf8"));
const common = ["plpgsql", "pgcrypto", "uuid-ossp", "pg_stat_statements", "citext", "pg_trgm", "hstore", "ltree", "unaccent", "btree_gin", "btree_gist", "fuzzystrmatch", "tablefunc", "postgres_fdw", "intarray", "cube", "earthdistance", "vector", "postgis", "pg_cron", "pg_graphql", "pgsodium", "pg_net", "pgjwt", "pg_jsonschema", "supabase_vault", "plv8", "timescaledb", "pg_partman", "pgaudit"];
const pg = m.items.filter((i) => i.name === "postgresql");
for (const major of [15, 16, 17, 18]) {
  const rows = pg.filter((i) => i.unpackTo === `postgresql/${major}`);
  const missing = {};
  for (const e of common) {
    const lacking = rows.filter((r) => !r.extensions.includes(e)).map((r) => r.platform);
    if (lacking.length) missing[e] = lacking.length === rows.length ? "ALL" : lacking.join(",");
  }
  const all = new Set(rows.flatMap((r) => r.extensions));
  const inEvery = [...all].filter((e) => rows.every((r) => r.extensions.includes(e)));
  console.log(`PG${major} ${rows[0].version}: ${rows.length} platforms; extensions in every build: ${inEvery.length}; union ${all.size}`);
  console.log("  common-but-missing:", JSON.stringify(missing));
  console.log("  not in every build:", JSON.stringify([...all].filter((e) => !inEvery.includes(e))));
}
