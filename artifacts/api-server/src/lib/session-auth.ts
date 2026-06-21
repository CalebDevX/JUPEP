import { pool } from "@workspace/db";
import type { Request, Response, NextFunction } from "express";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const phone = ((req.query.phone || req.body?.phone) as string)?.trim();
  const token = (req.headers["x-session-token"] as string)?.trim();
  if (!phone || !token) {
    return res.status(401).json({ error: "Authentication required." });
  }
  try {
    const r = await pool.query("SELECT session_token FROM students WHERE phone=$1", [phone]);
    if (!r.rows.length || r.rows[0].session_token !== token) {
      return res.status(401).json({ error: "Invalid session. Please log in again." });
    }
    next();
  } catch {
    return res.status(500).json({ error: "Auth check failed." });
  }
}
