/**
 * One-time migration: adds payments, WhatsApp and session columns.
 * Run: pnpm --filter @workspace/db run migrate:payments
 */
import pg from "pg";
const { Pool } = pg;

let connectionString = process.env.DATABASE_URL!;
try {
  const u = new URL(connectionString);
  u.searchParams.delete("sslmode");
  connectionString = u.toString();
} catch {}

// Try without SSL for local Replit DB; fall back to no SSL options if server refuses
const pool = new Pool({ connectionString });

async function run() {
  const client = await pool.connect();
  try {
    console.log("Running payment/WhatsApp migration...");

    await client.query(`
      ALTER TABLE students
        ADD COLUMN IF NOT EXISTS expires_at       TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS payment_status   TEXT NOT NULL DEFAULT 'unpaid';
    `);
    console.log("✓ students: expires_at + payment_status columns added");

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
    console.log("✓ app_settings defaults ready");

    console.log("\nMigration complete ✅");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
