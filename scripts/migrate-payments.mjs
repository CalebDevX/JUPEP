/**
 * Migration: adds payments, WhatsApp notification tables and
 * session-expiry columns to the students table.
 * Run: node --loader ts-node/esm scripts/migrate-payments.mjs
 *  OR: pnpm --filter @workspace/db run migrate:payments
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);

let Pool;
try {
  ({ Pool } = require("pg"));
} catch {
  // Try from workspace node_modules
  ({ Pool } = require("/home/runner/workspace/node_modules/pg"));
}

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) { console.error("DATABASE_URL is not set"); process.exit(1); }

const url = new URL(rawUrl);
url.searchParams.delete("sslmode");

const pool = new Pool({ connectionString: url.toString(), ssl: { rejectUnauthorized: false } });

async function run() {
  const client = await pool.connect();
  try {
    console.log("Running payment/WhatsApp migration...");

    await client.query(`
      ALTER TABLE students
        ADD COLUMN IF NOT EXISTS expires_at       TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS payment_status   TEXT NOT NULL DEFAULT 'unpaid';
    `);
    console.log("✓ students table updated (expires_at, payment_status)");

    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id             SERIAL PRIMARY KEY,
        phone          TEXT NOT NULL,
        student_name   TEXT,
        amount         INTEGER NOT NULL,
        reference      TEXT NOT NULL UNIQUE,
        status         TEXT NOT NULL DEFAULT 'pending',
        channel        TEXT,
        paid_at        TIMESTAMPTZ,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log("✓ payments table ready");

    await client.query(`
      CREATE TABLE IF NOT EXISTS wa_notifications (
        id         SERIAL PRIMARY KEY,
        phone      TEXT NOT NULL,
        message    TEXT NOT NULL,
        status     TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        sent_at    TIMESTAMPTZ
      );
    `);
    console.log("✓ wa_notifications table ready");

    await client.query(`
      CREATE TABLE IF NOT EXISTS wa_bot_state (
        id             INTEGER PRIMARY KEY DEFAULT 1,
        status         TEXT NOT NULL DEFAULT 'disconnected',
        qr_code        TEXT,
        qr_expires_at  TIMESTAMPTZ,
        phone_number   TEXT,
        updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      INSERT INTO wa_bot_state(id, status) VALUES(1,'disconnected') ON CONFLICT(id) DO NOTHING;
    `);
    console.log("✓ wa_bot_state table ready");

    await client.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      INSERT INTO app_settings(key, value) VALUES
        ('session_price',    '500000'),
        ('session_end_date', '2026-08-31')
      ON CONFLICT(key) DO NOTHING;
    `);
    console.log("✓ app_settings + defaults ready");

    console.log("\nMigration complete ✅");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
