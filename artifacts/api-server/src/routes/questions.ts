import { Router } from "express";
import { db } from "@workspace/db";
import { questionsTable, subjectsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

router.get("/questions", async (req, res) => {
  try {
    const { subjectId, paper, questionType, year, limit = "50", offset = "0" } = req.query;
    const conditions: any[] = [];
    if (subjectId) conditions.push(eq(questionsTable.subjectId, parseInt(subjectId as string)));
    if (paper) conditions.push(eq(questionsTable.paper, paper as string));
    if (questionType) conditions.push(eq(questionsTable.questionType, questionType as string));
    if (year) conditions.push(eq(questionsTable.year, parseInt(year as string)));

    const query = db
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
    const { subjectId, paper, year, questionType, questionText, options, correctOption, explanation, markingGuide, marks } = req.body;
    const [question] = await db.insert(questionsTable).values({
      subjectId, paper, year, questionType, questionText, options, correctOption, explanation, markingGuide, marks: marks ?? 1,
    }).returning();
    const [subject] = await db.select({ name: subjectsTable.name }).from(subjectsTable).where(eq(subjectsTable.id, subjectId));
    res.status(201).json({ ...question, subjectName: subject?.name ?? null, createdAt: question.createdAt.toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to create question" });
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
