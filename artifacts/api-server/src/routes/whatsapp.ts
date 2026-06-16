import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();
const BOT_SECRET = process.env.BOT_SECRET || "jupeb-bot-secret-change-me";
const ADMIN_PIN = process.env.ADMIN_PIN || "JUPEB2024";

function adminAuth(req: any, res: any, next: any) {
  const pin = req.headers["x-admin-pin"] || req.query.pin;
  if (pin !== ADMIN_PIN) return res.status(401).json({ error: "Unauthorized" });
  next();
}

function botAuth(req: any, res: any, next: any) {
  const secret = req.headers["x-bot-secret"] || req.query.secret;
  if (secret !== BOT_SECRET) return res.status(401).json({ error: "Unauthorized" });
  next();
}

// ── Admin: get bot status ─────────────────────────────────────────────────────
router.get("/bot/status", adminAuth, async (_req, res) => {
  try {
    await ensureBotStateRow();
    const r = await pool.query("SELECT * FROM wa_bot_state WHERE id=1");
    const state = r.rows[0];
    const now = new Date();
    // QR expires check
    if (state.qr_code && state.qr_expires_at && new Date(state.qr_expires_at) < now) {
      state.qr_code = null;
    }
    // Pairing code expires check
    if (state.pairing_code && state.pairing_code_expires_at && new Date(state.pairing_code_expires_at) < now) {
      state.pairing_code = null;
    }
    res.json({
      status: state.status,
      qrCode: state.qr_code || null,
      phoneNumber: state.phone_number || null,
      pairingPhone: state.pairing_phone || null,
      pairingCode: state.pairing_code || null,
      updatedAt: state.updated_at,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: request phone-number pairing ───────────────────────────────────────
router.post("/bot/request-pairing", adminAuth, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "phone required." });
    // Sanitise: digits only
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) return res.status(400).json({ error: "Invalid phone number." });
    await ensureBotStateRow();
    await pool.query(
      "UPDATE wa_bot_state SET pairing_phone=$1, pairing_code=NULL, pairing_code_expires_at=NULL, updated_at=NOW() WHERE id=1",
      [digits]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: clear pairing request ──────────────────────────────────────────────
router.post("/bot/clear-pairing", adminAuth, async (_req, res) => {
  try {
    await ensureBotStateRow();
    await pool.query(
      "UPDATE wa_bot_state SET pairing_phone=NULL, pairing_code=NULL, pairing_code_expires_at=NULL, updated_at=NOW() WHERE id=1"
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: disconnect bot ─────────────────────────────────────────────────────
router.post("/bot/disconnect", adminAuth, async (_req, res) => {
  try {
    await pool.query(
      "UPDATE wa_bot_state SET status='disconnected', qr_code=NULL, phone_number=NULL, updated_at=NOW() WHERE id=1"
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: get notification queue ─────────────────────────────────────────────
router.get("/bot/notifications", adminAuth, async (req, res) => {
  try {
    const status = req.query.status as string;
    const query = status
      ? "SELECT * FROM wa_notifications WHERE status=$1 ORDER BY created_at DESC LIMIT 100"
      : "SELECT * FROM wa_notifications ORDER BY created_at DESC LIMIT 100";
    const r = await pool.query(query, status ? [status] : []);
    res.json(r.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: queue a notification ───────────────────────────────────────────────
router.post("/bot/notify", adminAuth, async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) return res.status(400).json({ error: "Phone and message required." });
    await pool.query(
      "INSERT INTO wa_notifications(phone, message, status) VALUES($1,$2,'pending')",
      [phone.trim(), message.trim()]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: broadcast to all active students ───────────────────────────────────
router.post("/bot/broadcast", adminAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required." });

    const students = await pool.query(
      "SELECT phone FROM students WHERE phone IS NOT NULL AND phone!='' AND (expires_at IS NULL OR expires_at > NOW())"
    );

    if (!students.rows.length) return res.json({ success: true, queued: 0 });

    const values = students.rows
      .map((_: any, i: number) => `($${i * 2 + 1},$${i * 2 + 2},'pending')`)
      .join(",");
    const params = students.rows.flatMap((s: any) => [s.phone, message.trim()]);

    await pool.query(
      `INSERT INTO wa_notifications(phone, message, status) VALUES ${values}`,
      params
    );

    res.json({ success: true, queued: students.rows.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: broadcast to expired students ──────────────────────────────────────
router.post("/bot/broadcast-expired", adminAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required." });

    const students = await pool.query(
      "SELECT phone FROM students WHERE phone IS NOT NULL AND expires_at IS NOT NULL AND expires_at < NOW()"
    );
    if (!students.rows.length) return res.json({ success: true, queued: 0 });

    const values = students.rows
      .map((_: any, i: number) => `($${i * 2 + 1},$${i * 2 + 2},'pending')`)
      .join(",");
    const params = students.rows.flatMap((s: any) => [s.phone, message.trim()]);

    await pool.query(
      `INSERT INTO wa_notifications(phone, message, status) VALUES ${values}`,
      params
    );

    res.json({ success: true, queued: students.rows.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── BOT: get pending pairing phone ────────────────────────────────────────────
router.get("/bot/pending-pairing", botAuth, async (_req, res) => {
  try {
    await ensureBotStateRow();
    const r = await pool.query("SELECT pairing_phone FROM wa_bot_state WHERE id=1");
    res.json({ pairingPhone: r.rows[0]?.pairing_phone || null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── BOT: report pairing code ──────────────────────────────────────────────────
router.post("/bot/report-pairing-code", botAuth, async (req, res) => {
  try {
    const { pairingCode } = req.body;
    if (!pairingCode) return res.status(400).json({ error: "pairingCode required." });
    await ensureBotStateRow();
    const expiresAt = new Date(Date.now() + 5 * 60_000); // valid 5 minutes
    await pool.query(
      "UPDATE wa_bot_state SET pairing_code=$1, pairing_code_expires_at=$2, updated_at=NOW() WHERE id=1",
      [pairingCode, expiresAt]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── BOT: report QR code ────────────────────────────────────────────────────── 
router.post("/bot/report-qr", botAuth, async (req, res) => {
  try {
    const { qrCode } = req.body;
    if (!qrCode) return res.status(400).json({ error: "qrCode required." });
    await ensureBotStateRow();
    const expiresAt = new Date(Date.now() + 60_000); // QR valid 60s
    await pool.query(
      "UPDATE wa_bot_state SET status='connecting', qr_code=$1, qr_expires_at=$2, updated_at=NOW() WHERE id=1",
      [qrCode, expiresAt]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── BOT: report connected ─────────────────────────────────────────────────────
router.post("/bot/report-connected", botAuth, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    await ensureBotStateRow();
    await pool.query(
      "UPDATE wa_bot_state SET status='connected', qr_code=NULL, phone_number=$1, updated_at=NOW() WHERE id=1",
      [phoneNumber || null]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── BOT: report disconnected ──────────────────────────────────────────────────
router.post("/bot/report-disconnected", botAuth, async (_req, res) => {
  try {
    await ensureBotStateRow();
    await pool.query(
      "UPDATE wa_bot_state SET status='disconnected', qr_code=NULL, updated_at=NOW() WHERE id=1"
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── BOT: fetch pending notifications ─────────────────────────────────────────
router.get("/bot/pending-messages", botAuth, async (_req, res) => {
  try {
    const r = await pool.query(
      "SELECT id, phone, message FROM wa_notifications WHERE status='pending' ORDER BY created_at ASC LIMIT 50"
    );
    res.json(r.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── BOT: mark notification sent/failed ───────────────────────────────────────
router.patch("/bot/notifications/:id", botAuth, async (req, res) => {
  try {
    const { status } = req.body; // "sent" | "failed"
    if (!["sent", "failed"].includes(status)) return res.status(400).json({ error: "Invalid status." });
    await pool.query(
      "UPDATE wa_notifications SET status=$1, sent_at=NOW() WHERE id=$2",
      [status, req.params.id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function ensureBotStateRow() {
  await pool.query(
    "INSERT INTO wa_bot_state(id, status) VALUES(1,'disconnected') ON CONFLICT(id) DO NOTHING"
  );
}

export default router;
