import { Router } from "express";
import { db, pool } from "@workspace/db";
import { questionsTable, subjectsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";


const router = Router();

router.get("/questions", async (req, res) => {
  try {
    const { subjectId, paper, examType, questionType, year, limit = "50", offset = "0" } = req.query;
    const conditions: any[] = [];
    if (subjectId) conditions.push(eq(questionsTable.subjectId, parseInt(subjectId as string)));
    if (paper) conditions.push(eq(questionsTable.paper, paper as string));
    if (examType) conditions.push(eq(questionsTable.examType, examType as string));
    if (questionType) conditions.push(eq(questionsTable.questionType, questionType as string));
    if (year) conditions.push(eq(questionsTable.year, parseInt(year as string)));

    const query = db
      .select({
        id: questionsTable.id,
        subjectId: questionsTable.subjectId,
        subjectName: subjectsTable.name,
        paper: questionsTable.paper,
        examType: questionsTable.examType,
        year: questionsTable.year,
        questionType: questionsTable.questionType,
        questionText: questionsTable.questionText,
        options: questionsTable.options,
        correctOption: questionsTable.correctOption,
        explanation: questionsTable.explanation,
        markingGuide: questionsTable.markingGuide,
        marks: questionsTable.marks,
        createdAt: questionsTable.createdAt,
      })
      .from(questionsTable)
      .leftJoin(subjectsTable, eq(questionsTable.subjectId, subjectsTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string))
      .orderBy(questionsTable.year, questionsTable.paper, questionsTable.id);

    const questions = await query;
    res.json(questions.map(q => ({
      ...q,
      createdAt: q.createdAt.toISOString(),
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

router.post("/questions", async (req, res) => {
  try {
    const { subjectId, paper, examType, year, questionType, questionText, options, correctOption, explanation, markingGuide, marks } = req.body;
    const [question] = await db.insert(questionsTable).values({
      subjectId, paper, examType, year, questionType, questionText, options, correctOption, explanation, markingGuide, marks: marks ?? 1,
    }).returning();
    const [subject] = await db.select({ name: subjectsTable.name }).from(subjectsTable).where(eq(subjectsTable.id, subjectId));
    res.status(201).json({ ...question, subjectName: subject?.name ?? null, createdAt: question.createdAt.toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to create question" });
  }
});

// GET /api/questions/past-papers — distinct year/paper combinations with counts
router.get("/questions/past-papers", async (req, res) => {
  try {
    const { subjectId } = req.query;
    const params: any[] = [];
    let whereClause = "WHERE q.year IS NOT NULL";
    if (subjectId) {
      params.push(parseInt(subjectId as string));
      whereClause += ` AND q.subject_id = $${params.length}`;
    }
    const result = await pool.query(
      `SELECT
         q.subject_id        AS "subjectId",
         s.name              AS "subjectName",
         s.code              AS "subjectCode",
         s.color             AS "subjectColor",
         q.paper,
         q.year,
         COUNT(*)::int       AS count,
         SUM(CASE WHEN q.question_type = 'objective' THEN 1 ELSE 0 END)::int AS "objectiveCount",
         SUM(CASE WHEN q.question_type = 'theory'    THEN 1 ELSE 0 END)::int AS "theoryCount"
       FROM questions q
       LEFT JOIN subjects s ON s.id = q.subject_id
       ${whereClause}
       GROUP BY q.subject_id, s.name, s.code, s.color, q.paper, q.year
       ORDER BY q.year DESC, q.paper`,
      params
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch past papers" });
  }
});

router.get("/questions/:questionId", async (req, res) => {
  try {
    const id = parseInt(req.params.questionId);
    const [q] = await db
      .select({
        id: questionsTable.id,
        subjectId: questionsTable.subjectId,
        subjectName: subjectsTable.name,
        paper: questionsTable.paper,
        year: questionsTable.year,
        questionType: questionsTable.questionType,
        questionText: questionsTable.questionText,
        options: questionsTable.options,
        correctOption: questionsTable.correctOption,
        explanation: questionsTable.explanation,
        markingGuide: questionsTable.markingGuide,
        marks: questionsTable.marks,
        createdAt: questionsTable.createdAt,
      })
      .from(questionsTable)
      .leftJoin(subjectsTable, eq(questionsTable.subjectId, subjectsTable.id))
      .where(eq(questionsTable.id, id));
    if (!q) return res.status(404).json({ error: "Question not found" });
    res.json({ ...q, createdAt: q.createdAt.toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch question" });
  }
});

router.patch("/questions/:questionId", async (req, res) => {
  try {
    const id = parseInt(req.params.questionId);
    const { questionText, options, correctOption, explanation, markingGuide, marks } = req.body;
    const updates: any = {};
    if (questionText !== undefined) updates.questionText = questionText;
    if (options !== undefined) updates.options = options;
    if (correctOption !== undefined) updates.correctOption = correctOption;
    if (explanation !== undefined) updates.explanation = explanation;
    if (markingGuide !== undefined) updates.markingGuide = markingGuide;
    if (marks !== undefined) updates.marks = marks;
    const [updated] = await db.update(questionsTable).set(updates).where(eq(questionsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Question not found" });
    const [subject] = await db.select({ name: subjectsTable.name }).from(subjectsTable).where(eq(subjectsTable.id, updated.subjectId));
    res.json({ ...updated, subjectName: subject?.name ?? null, createdAt: updated.createdAt.toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to update question" });
  }
});

router.delete("/questions/:questionId", async (req, res) => {
  try {
    const id = parseInt(req.params.questionId);
    await db.delete(questionsTable).where(eq(questionsTable.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete question" });
  }
});

export default router;
