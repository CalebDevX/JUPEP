import { Router } from "express";
import { pool, db } from "@workspace/db";
import { accessCodesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ADMIN_PIN = process.env.ADMIN_PIN || "JUPEB2024";
const router = Router();

function adminAuth(req: any, res: any, next: any) {
  const pin = req.headers["x-admin-pin"] || req.query.pin;
  if (pin !== ADMIN_PIN) return res.status(401).json({ error: "Unauthorized" });
  next();
}

router.get("/admin/overview", adminAuth, async (_req, res) => {
  try {
    const [students, questions, notes, codesRes, revenueRes, topRes, flagRes] = await Promise.all([
      pool.query("SELECT COUNT(*) AS count FROM students"),
      pool.query("SELECT COUNT(*) AS count FROM questions"),
      pool.query("SELECT COUNT(*) AS count FROM notes"),
      pool.query("SELECT COUNT(*) AS count, SUM(CASE WHEN is_active THEN 1 ELSE 0 END) AS active FROM access_codes"),
      pool.query("SELECT COALESCE(SUM(activation_count * price),0) AS total FROM access_codes"),
      pool.query("SELECT full_name, xp, streak FROM students ORDER BY xp DESC LIMIT 1"),
      pool.query("SELECT COUNT(*) AS count FROM quiz_attempts WHERE is_flagged=true"),
    ]);
    res.json({
      totalStudents: parseInt(students.rows[0].count),
      totalQuestions: parseInt(questions.rows[0].count),
      totalNotes: parseInt(notes.rows[0].count),
      totalCodes: parseInt(codesRes.rows[0].count),
      activeCodes: parseInt(codesRes.rows[0].active || "0"),
      totalRevenue: parseInt(revenueRes.rows[0].total),
      topStudent: topRes.rows[0] || null,
      flaggedAttempts: parseInt(flagRes.rows[0].count),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/students", adminAuth, async (req, res) => {
  try {
    const search = req.query.search as string || "";
    const query = search
      ? "SELECT * FROM students WHERE full_name ILIKE $1 OR phone ILIKE $1 ORDER BY created_at DESC"
      : "SELECT * FROM students ORDER BY created_at DESC";
    const result = await pool.query(query, search ? [`%${search}%`] : []);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/admin/students/:id", adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    await pool.query("UPDATE students SET is_active=$1 WHERE id=$2", [isActive, req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/access-codes", adminAuth, async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT *, (activation_count * price) AS revenue_generated FROM access_codes ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/admin/access-codes", adminAuth, async (req, res) => {
  try {
    const { code, label, maxActivations = 100, price = 0, expiresAt } = req.body;
    if (!code?.trim() || !label?.trim()) {
      return res.status(400).json({ error: "Code and label are required." });
    }
    const expiresAtVal = expiresAt ? new Date(expiresAt) : null;
    await pool.query(
      "INSERT INTO access_codes(code,label,max_activations,price,is_active,expires_at) VALUES($1,$2,$3,$4,true,$5)",
      [code.trim().toUpperCase(), label.trim(), maxActivations, price, expiresAtVal]
    );
    res.json({ success: true });
  } catch (err: any) {
    if (err.code === "23505") return res.status(400).json({ error: "This access code already exists." });
    res.status(500).json({ error: err.message });
  }
});

router.patch("/admin/access-codes/:id", adminAuth, async (req, res) => {
  try {
    const { isActive, price, label, maxActivations } = req.body;
    await pool.query(
      `UPDATE access_codes SET
        is_active=COALESCE($1,is_active),
        price=COALESCE($2,price),
        label=COALESCE($3,label),
        max_activations=COALESCE($4,max_activations)
       WHERE id=$5`,
      [isActive ?? null, price ?? null, label ?? null, maxActivations ?? null, req.params.id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/admin/access-codes/:id", adminAuth, async (req, res) => {
  try {
    const check = await pool.query("SELECT activation_count FROM access_codes WHERE id=$1", [req.params.id]);
    if (!check.rows.length) return res.status(404).json({ error: "Code not found." });
    if (check.rows[0].activation_count > 0) {
      return res.status(400).json({ error: "Cannot delete a code that has already been activated." });
    }
    await pool.query("DELETE FROM access_codes WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/revenue", adminAuth, async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT code, label, price, activation_count, max_activations, (activation_count*price) AS revenue FROM access_codes ORDER BY revenue DESC"
    );
    const total = result.rows.reduce((s: number, r: any) => s + parseInt(r.revenue || 0), 0);
    const paidActivations = result.rows.reduce((s: number, r: any) => s + (r.price > 0 ? parseInt(r.activation_count) : 0), 0);
    res.json({ codes: result.rows, total, paidActivations });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/admin/quiz-attempts", adminAuth, async (req, res) => {
  try {
    const flaggedOnly = req.query.flagged === "1";
    const query = flaggedOnly
      ? "SELECT * FROM quiz_attempts WHERE is_flagged=true ORDER BY created_at DESC LIMIT 200"
      : "SELECT * FROM quiz_attempts ORDER BY created_at DESC LIMIT 200";
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
