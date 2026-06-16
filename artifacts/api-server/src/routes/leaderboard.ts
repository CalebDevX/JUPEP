import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string || "50"), 100);
    const result = await pool.query(
      `SELECT full_name, subjects, target_grade, target_university, xp, streak, last_active
       FROM students WHERE is_active=true
       ORDER BY xp DESC, streak DESC
       LIMIT $1`,
      [limit]
    );
    const rows = result.rows.map((s: any, i: number) => ({ ...s, rank: i + 1 }));
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/student/sync-progress", async (req, res) => {
  const {
    phone, xp, streak,
    quizScore, subjectName, paperCode, questionCount, timeSpentSeconds,
  } = req.body;
  if (!phone?.trim()) return res.status(400).json({ error: "Phone is required." });

  try {
    await pool.query(
      `UPDATE students SET
         xp = GREATEST(COALESCE(xp,0), $1),
         streak = GREATEST(COALESCE(streak,0), $2),
         last_active = CURRENT_DATE
       WHERE phone=$3`,
      [xp || 0, streak || 0, phone.trim()]
    );

    if (quizScore !== undefined && questionCount > 0) {
      const minExpected = questionCount * 4;
      const isFlagged = typeof timeSpentSeconds === "number" && timeSpentSeconds < minExpected;
      const flagReason = isFlagged
        ? `Completed ${questionCount} questions in ${timeSpentSeconds}s — minimum expected ${minExpected}s`
        : null;

      const nameRes = await pool.query("SELECT full_name FROM students WHERE phone=$1", [phone.trim()]);
      const studentName = nameRes.rows[0]?.full_name || "Unknown";

      await pool.query(
        `INSERT INTO quiz_attempts
           (student_phone, student_name, subject_name, paper_code, question_count, score, percentage, time_spent_seconds, is_flagged, flag_reason)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          phone.trim(), studentName, subjectName || null, paperCode || null,
          questionCount, quizScore, (quizScore / questionCount) * 100,
          timeSpentSeconds || 0, isFlagged, flagReason,
        ]
      );
    }

    res.json({ success: true });
  } catch (err: any) {
    console.error("Sync progress error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
