import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

const ADMIN_PIN = () => process.env.ADMIN_PIN || "JUPEB2024";

pool.query(`CREATE TABLE IF NOT EXISTS bug_reports (
  id SERIAL PRIMARY KEY,
  phone TEXT,
  full_name TEXT,
  description TEXT NOT NULL,
  image TEXT,
  page TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
)`).catch(() => {});

router.post("/bug-reports", async (req, res) => {
  const { phone, fullName, description, image, page } = req.body;
  if (!description?.trim()) return res.status(400).json({ error: "Description is required." });
  if (image && image.length > 2_000_000) return res.status(400).json({ error: "Image too large. Please use a smaller screenshot." });
  try {
    const r = await pool.query(
      "INSERT INTO bug_reports(phone, full_name, description, image, page) VALUES($1,$2,$3,$4,$5) RETURNING id",
      [phone?.trim() || null, fullName?.trim() || null, description.trim(), image || null, page?.trim() || null]
    );
    res.json({ success: true, id: r.rows[0].id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/bug-reports", async (req, res) => {
  if (req.headers["x-admin-pin"] !== ADMIN_PIN()) return res.status(401).json({ error: "Unauthorized" });
  const status = req.query.status as string | undefined;
  try {
    const q = status && status !== "all"
      ? "SELECT * FROM bug_reports WHERE status=$1 ORDER BY created_at DESC"
      : "SELECT * FROM bug_reports ORDER BY created_at DESC";
    const r = await pool.query(q, status && status !== "all" ? [status] : []);
    res.json(r.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/bug-reports/:id", async (req, res) => {
  if (req.headers["x-admin-pin"] !== ADMIN_PIN()) return res.status(401).json({ error: "Unauthorized" });
  const { status } = req.body;
  if (!["open", "resolved", "wont-fix"].includes(status)) return res.status(400).json({ error: "Invalid status" });
  try {
    await pool.query("UPDATE bug_reports SET status=$1 WHERE id=$2", [status, req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/bug-reports/:id", async (req, res) => {
  if (req.headers["x-admin-pin"] !== ADMIN_PIN()) return res.status(401).json({ error: "Unauthorized" });
  try {
    await pool.query("DELETE FROM bug_reports WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
