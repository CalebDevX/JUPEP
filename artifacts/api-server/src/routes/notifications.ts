import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();
const ADMIN_PIN = process.env.ADMIN_PIN || "JUPEB2024";

function adminAuth(req: any, res: any, next: any) {
  const pin = req.headers["x-admin-pin"] || req.query.pin;
  if (pin !== ADMIN_PIN) return res.status(401).json({ error: "Unauthorized" });
  next();
}

// Ensure required columns exist
pool.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS expo_push_token TEXT`).catch(() => {});
pool.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS payment_status TEXT`).catch(() => {});
// Push notification log table
pool.query(`
  CREATE TABLE IF NOT EXISTS push_notifications (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    target TEXT NOT NULL DEFAULT 'all',
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(() => {});

// ── Register push token ────────────────────────────────────────────────────────
router.post("/notifications/register-token", async (req, res) => {
  const { phone, token: sessionToken, pushToken } = req.body;
  if (!phone?.trim() || !sessionToken?.trim() || !pushToken?.trim()) {
    return res.status(400).json({ error: "phone, token, and pushToken are required." });
  }
  try {
    const r = await pool.query("SELECT session_token FROM students WHERE phone=$1", [phone.trim()]);
    if (!r.rows.length) return res.status(404).json({ error: "Student not found." });
    if (r.rows[0].session_token !== sessionToken) return res.status(401).json({ error: "Invalid session." });
    await pool.query("UPDATE students SET expo_push_token=$1 WHERE phone=$2", [pushToken.trim(), phone.trim()]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Send push notification (admin) ────────────────────────────────────────────
router.post("/notifications/send", adminAuth, async (req, res) => {
  const { title, body, target = "all" } = req.body;
  if (!title?.trim() || !body?.trim()) {
    return res.status(400).json({ error: "title and body are required." });
  }

  try {
    // Fetch tokens based on target
    let tokenQuery = "SELECT expo_push_token FROM students WHERE expo_push_token IS NOT NULL AND expo_push_token != ''";
    if (target === "activated") {
      tokenQuery += " AND (access_code_used IS NOT NULL AND access_code_used != 'FREE_TRIAL' OR payment_status='paid')";
    } else if (target === "free") {
      tokenQuery += " AND (access_code_used IS NULL OR access_code_used = 'FREE_TRIAL') AND (payment_status IS NULL OR payment_status != 'paid')";
    }

    const tokenResult = await pool.query(tokenQuery);
    const tokens: string[] = tokenResult.rows.map((r: any) => r.expo_push_token).filter(Boolean);

    if (tokens.length === 0) {
      return res.json({ success: true, sent: 0, failed: 0, message: "No devices registered for push." });
    }

    // Send via Expo Push API in batches of 100
    const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
    const chunks: string[][] = [];
    for (let i = 0; i < tokens.length; i += 100) chunks.push(tokens.slice(i, i + 100));

    let sentCount = 0;
    let failedCount = 0;

    for (const chunk of chunks) {
      const messages = chunk.map((to) => ({ to, title: title.trim(), body: body.trim(), sound: "default" }));
      try {
        const response = await fetch(EXPO_PUSH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(messages),
        });
        const data = await response.json();
        if (data.data) {
          for (const ticket of data.data) {
            if (ticket.status === "ok") sentCount++;
            else failedCount++;
          }
        }
      } catch {
        failedCount += chunk.length;
      }
    }

    // Log it
    await pool.query(
      "INSERT INTO push_notifications (title, body, target, sent_count, failed_count) VALUES ($1,$2,$3,$4,$5)",
      [title.trim(), body.trim(), target, sentCount, failedCount]
    ).catch(() => {});

    res.json({ success: true, sent: sentCount, failed: failedCount, total: tokens.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get notification history (admin) ─────────────────────────────────────────
router.get("/notifications/history", adminAuth, async (_req, res) => {
  try {
    const r = await pool.query(
      "SELECT * FROM push_notifications ORDER BY created_at DESC LIMIT 50"
    );
    res.json(r.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get registered device count (admin) ──────────────────────────────────────
router.get("/notifications/stats", adminAuth, async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT
        COUNT(*)::int AS total,
        COUNT(expo_push_token)::int AS registered,
        COUNT(CASE WHEN (access_code_used IS NOT NULL AND access_code_used != 'FREE_TRIAL') OR payment_status='paid' THEN 1 END)::int AS activated
       FROM students WHERE expo_push_token IS NOT NULL AND expo_push_token != ''`
    );
    res.json(r.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
