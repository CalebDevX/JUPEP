---
name: Aiven PostgreSQL SSL Fix
description: How to connect to the Aiven-hosted Postgres DB — sslmode in URL overrides pool ssl options in pg v8+, drizzle-kit push hangs
---

## The Rule

To connect to the Aiven DB, you must strip `sslmode` from the DATABASE_URL **and** set `ssl: { rejectUnauthorized: false }` explicitly in the Pool config. Neither alone is sufficient in pg v8+.

```ts
let connectionString = process.env.DATABASE_URL;
try {
  const u = new URL(connectionString);
  u.searchParams.delete("sslmode");
  connectionString = u.toString();
} catch {}
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
```

Apply the same URL stripping in `drizzle.config.ts` for the `dbCredentials.url`.

**Why:** The Aiven DATABASE_URL contains `sslmode=require`. In pg v8+, `sslmode=require` is treated as `sslmode=verify-full` (validates the cert). Aiven uses a self-signed cert, so cert validation fails. Setting `ssl: { rejectUnauthorized: false }` in the Pool config is overridden by the URL's sslmode unless you remove it from the URL first.

**How to apply:** Always strip sslmode before creating any Pool (runtime in `lib/db/src/index.ts`) and in `lib/db/drizzle.config.ts`.

## drizzle-kit push hangs

`pnpm --filter @workspace/db run push` hangs indefinitely during "Pulling schema from database..." even with the SSL fix applied in drizzle.config.ts. Do NOT wait for it.

**Workaround:** Use a raw Node.js migration script with the working pool to `CREATE TABLE IF NOT EXISTS` for each table, and `CREATE TYPE` (without IF NOT EXISTS — PG doesn't support that) for enum types.

## Pool warm-up latency

The pool takes ~800ms to establish its first SSL connection after server start. Early requests may see failures during warm-up. This is normal and self-resolves.
