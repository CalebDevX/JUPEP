import { Router } from "express";
import { db } from "@workspace/db";
import { wrongAnswersTable, questionsTable, subjectsTable } from "@workspace/db";
import { eq, and, isNull, desc } from "drizzle-orm";
import { requireAuth } from "../lib/session-auth";

const router = Router();

// GET /api/student/wrong-answers?phone=...&subjectId=...&paper=...&limit=...&offset=...
router.get("/student/wrong-answers", requireAuth, async (req, res) => {
  const { phone, subjectId, paper } = req.query as Record<string, string>;
  const limit = Math.min(parseInt(req.query.limit as string || "30"), 100);
  const offset = Math.max(0, parseInt(req.query.offset as string || "0"));
  if (!phone) return res.status(400).json({ error: "phone required" });

  try {
    let query = db
      .select({
        id: wrongAnswersTable.id,
        questionId: wrongAnswersTable.questionId,
        subjectId: wrongAnswersTable.subjectId,
        paper: wrongAnswersTable.paper,
        selectedOption: wrongAnswersTable.selectedOption,
        attemptedAt: wrongAnswersTable.attemptedAt,
        revisedAt: wrongAnswersTable.revisedAt,
        questionText: questionsTable.questionText,
        options: questionsTable.options,
        correctOption: questionsTable.correctOption,
        explanation: questionsTable.explanation,
        subjectName: subjectsTable.name,
      })
      .from(wrongAnswersTable)
      .innerJoin(questionsTable, eq(wrongAnswersTable.questionId, questionsTable.id))
      .innerJoin(subjectsTable, eq(wrongAnswersTable.subjectId, subjectsTable.id))
      .where(
        and(
          eq(wrongAnswersTable.studentPhone, phone),
          isNull(wrongAnswersTable.revisedAt),
          ...(subjectId ? [eq(wrongAnswersTable.subjectId, parseInt(subjectId))] : []),
          ...(paper ? [eq(wrongAnswersTable.paper, paper)] : []),
        )
      )
      .orderBy(desc(wrongAnswersTable.attemptedAt))
      .limit(limit)
      .offset(offset) as any;

    const rows = await query;
    res.json({ items: rows, hasMore: rows.length === limit, offset, limit });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch wrong answers" });
  }
});

// POST /api/student/wrong-answers/:questionId/mark-revised
router.post("/student/wrong-answers/:questionId/mark-revised", requireAuth, async (req, res) => {
  const { phone } = req.body as { phone: string };
  const questionId = parseInt(req.params.questionId);
  if (!phone) return res.status(400).json({ error: "phone required" });

  try {
    await db
      .update(wrongAnswersTable)
      .set({ revisedAt: new Date() })
      .where(
        and(
          eq(wrongAnswersTable.studentPhone, phone),
          eq(wrongAnswersTable.questionId, questionId),
          isNull(wrongAnswersTable.revisedAt),
        )
      );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark revised" });
  }
});

// GET /api/student/wrong-answers/stats?phone=...
router.get("/student/wrong-answers/stats", requireAuth, async (req, res) => {
  const { phone } = req.query as { phone: string };
  if (!phone) return res.status(400).json({ error: "phone required" });

  try {
    const all = await db
      .select({
        subjectId: wrongAnswersTable.subjectId,
        paper: wrongAnswersTable.paper,
        revisedAt: wrongAnswersTable.revisedAt,
        subjectName: subjectsTable.name,
      })
      .from(wrongAnswersTable)
      .innerJoin(subjectsTable, eq(wrongAnswersTable.subjectId, subjectsTable.id))
      .where(eq(wrongAnswersTable.studentPhone, phone));

    const total = all.length;
    const pending = all.filter(r => !r.revisedAt).length;
    const revised = all.filter(r => r.revisedAt).length;

    const bySubject: Record<string, { name: string; pending: number; revised: number }> = {};
    for (const r of all) {
      const key = String(r.subjectId);
      if (!bySubject[key]) bySubject[key] = { name: r.subjectName, pending: 0, revised: 0 };
      if (r.revisedAt) bySubject[key].revised++;
      else bySubject[key].pending++;
    }

    res.json({ total, pending, revised, bySubject });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
