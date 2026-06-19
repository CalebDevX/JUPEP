import { Router } from "express";
import { db } from "@workspace/db";
import { wrongAnswersTable, questionsTable, subjectsTable } from "@workspace/db";
import { eq, and, isNull, desc } from "drizzle-orm";

const router = Router();

// GET /api/student/wrong-answers?phone=...&subjectId=...&paper=...
router.get("/student/wrong-answers", async (req, res) => {
  const { phone, subjectId, paper } = req.query as Record<string, string>;
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
      .orderBy(desc(wrongAnswersTable.attemptedAt)) as any;

    const rows = await query;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch wrong answers" });
  }
});

// POST /api/student/wrong-answers/:questionId/mark-revised
router.post("/student/wrong-answers/:questionId/mark-revised", async (req, res) => {
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
router.get("/student/wrong-answers/stats", async (req, res) => {
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
