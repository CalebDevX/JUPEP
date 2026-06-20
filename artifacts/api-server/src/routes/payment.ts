import { Router } from "express";
import { pool } from "@workspace/db";
import crypto from "crypto";

const router = Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const SESSION_END = process.env.SESSION_END_DATE || "2026-08-31";

// ── Initialize payment ────────────────────────────────────────────────────────
router.post("/payment/initialize", async (req, res) => {
  const { phone, email, amount } = req.body;
  if (!phone?.trim()) return res.status(400).json({ error: "Phone number required." });
  if (!PAYSTACK_SECRET) return res.status(503).json({ error: "Payment not configured yet." });

  try {
    const studentResult = await pool.query(
      "SELECT full_name, email FROM students WHERE phone=$1",
      [phone.trim()]
    );
    if (!studentResult.rows.length) {
      return res.status(404).json({ error: "No account found. Please register first." });
    }
    const student = studentResult.rows[0];
    const payEmail = email || student.email || `${phone.replace(/\D/g, "")}@jupeb.app`;
    const payAmount = amount || (await getSessionPrice()) || 100000; // fallback ₦1000 in kobo

    const reference = `JUPEB-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: payEmail,
        amount: payAmount,
        reference,
        metadata: { phone: phone.trim(), student_name: student.full_name },
        callback_url: `${process.env.APP_URL || ""}/payment/callback`,
      }),
    });

    const data = await paystackRes.json() as any;
    if (!data.status) return res.status(400).json({ error: data.message || "Payment init failed." });

    await pool.query(
      "INSERT INTO payments(phone, student_name, amount, reference, status) VALUES($1,$2,$3,$4,'pending')",
      [phone.trim(), student.full_name, payAmount, reference]
    );

    res.json({ success: true, authorizationUrl: data.data.authorization_url, reference });
  } catch (err: any) {
    console.error("Payment init error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Verify payment ────────────────────────────────────────────────────────────
router.get("/payment/verify/:reference", async (req, res) => {
  const { reference } = req.params;
  if (!PAYSTACK_SECRET) return res.status(503).json({ error: "Payment not configured." });

  try {
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });
    const data = await paystackRes.json() as any;

    if (!data.status || data.data?.status !== "success") {
      return res.status(400).json({ error: "Payment not successful.", status: data.data?.status });
    }

    const meta = data.data.metadata || {};
    const phone = meta.phone || data.data.customer?.phone;

    await activateStudent(phone, reference, data.data.amount, data.data.channel);

    const sessionEnd = await getSessionEnd();
    const expiresAt = new Date(sessionEnd + "T23:59:59Z").toISOString();
    res.json({ success: true, message: `Payment verified. Access granted until ${new Date(sessionEnd).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}.`, expiresAt });
  } catch (err: any) {
    console.error("Verify error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Paystack webhook ──────────────────────────────────────────────────────────
router.post("/payment/webhook", async (req, res) => {
  const signature = req.headers["x-paystack-signature"] as string;
  const body = JSON.stringify(req.body);
  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(body).digest("hex");

  if (hash !== signature) return res.status(400).json({ error: "Invalid signature." });

  res.sendStatus(200); // Ack first

  const event = req.body;
  if (event.event === "charge.success") {
    const data = event.data;
    const phone = data.metadata?.phone || data.customer?.phone;
    if (phone) {
      await activateStudent(phone, data.reference, data.amount, data.channel).catch(console.error);
    }
  }
});

// ── Check payment status for a student ────────────────────────────────────────
router.get("/payment/status/:phone", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT expires_at, payment_status FROM students WHERE phone=$1",
      [req.params.phone]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Student not found." });
    const s = result.rows[0];
    const expiresAt = s.expires_at ? new Date(s.expires_at) : null;
    const isActive = expiresAt ? expiresAt > new Date() : false;
    res.json({ isActive, expiresAt: s.expires_at, paymentStatus: s.payment_status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Get session price ─────────────────────────────────────────────────────────
router.get("/payment/config", async (_req, res) => {
  try {
    const price = await getSessionPrice();
    const sessionEnd = await getSessionEnd();
    res.json({ price, sessionEnd, currency: "NGN", configured: !!PAYSTACK_SECRET });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
async function getSessionPrice(): Promise<number> {
  try {
    const r = await pool.query("SELECT value FROM app_settings WHERE key='session_price'");
    return r.rows.length ? parseInt(r.rows[0].value) : 100000; // ₦1000 in kobo
  } catch {
    return 100000;
  }
}

async function getSessionEnd(): Promise<string> {
  try {
    const r = await pool.query("SELECT value FROM app_settings WHERE key='session_end_date'");
    return r.rows.length ? r.rows[0].value : SESSION_END;
  } catch {
    return SESSION_END;
  }
}

async function activateStudent(phone: string, reference: string, amount: number, channel: string) {
  if (!phone) return;
  const sessionEnd = await getSessionEnd();
  const expiresAt = new Date(sessionEnd + "T23:59:59Z");

  await pool.query(
    `UPDATE students SET
       expires_at=$1,
       payment_status='paid'
     WHERE phone=$2`,
    [expiresAt, phone.trim()]
  );
  await pool.query(
    "UPDATE payments SET status='success', channel=$1, paid_at=NOW() WHERE reference=$2",
    [channel || "card", reference]
  );

  // Queue WhatsApp confirmation message
  try {
    await pool.query(
      "INSERT INTO wa_notifications(phone, message, status) VALUES($1,$2,'pending')",
      [
        phone.trim(),
        `✅ *Payment Confirmed!*\n\nWelcome to JUPEB Prep 🎓\n\nYour access is now active until *${new Date(sessionEnd).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}*.\n\nVisit the platform to start studying:\n${process.env.APP_URL || ""}\n\n_Good luck with your exams! 💪_`,
      ]
    );
  } catch { /* non-fatal */ }
}

export default router;
