import { Router } from "express";
import { db } from "@workspace/db";
import { quizSessionsTable, questionsTable, subjectsTable } from "@workspace/db";
import { eq, and, inArray, sql } from "drizzle-orm";

const router = Router();

const PAPER_LABELS: Record<string, string> = {
  "001": "1st In-Course Exam",
  "002": "1st Semester Exam",
  "003": "2nd In-Course Exam",
  "004": "2nd Semester Exam",
  "mock": "Full Mock (001–004)",
};

const GRADE_MAP = (pct: number) => {
  if (pct >= 70) return "A";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 45) return "D";
  if (pct >= 40) return "E";
  return "F";
};

function formatSession(session: any, questions: any[], subjectName: string | null) {
  return {
    id: session.id,
    subjectId: session.subjectId,
    subjectName,
    paper: session.paper,
    questionType: session.questionType,
    questions,
    status: session.status,
    score: session.score,
    totalMarks: session.totalMarks,
    timedMinutes: session.timedMinutes,
    createdAt: session.createdAt.toISOString(),
    completedAt: session.completedAt ? session.completedAt.toISOString() : null,
  };
}

// Returns question counts per subject × paper × type so the frontend
// can show which combos are available before the user tries to start.
router.get("/quiz/available", async (_req, res) => {
  try {
    const rows = await db
      .select({
        subjectId: questionsTable.subjectId,
        paper: questionsTable.paper,
        questionType: questionsTable.questionType,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(questionsTable)
      .groupBy(questionsTable.subjectId, questionsTable.paper, questionsTable.questionType);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

router.post("/quiz/start", async (req, res) => {
  try {
    const { subjectId, paper, questionType, year, questionCount = 20, timedMinutes, shuffle = true } = req.body;

    const conditions: any[] = [eq(questionsTable.subjectId, subjectId)];

    if (paper === "mock") {
      // Mock covers papers 001, 002, 003, 004 only (not jupeb final papers)
      conditions.push(inArray(questionsTable.paper, ["001", "002", "003", "004"]));
    } else {
      conditions.push(eq(questionsTable.paper, paper));
    }

    if (questionType !== "mixed") {
      conditions.push(eq(questionsTable.questionType, questionType));
    }
    if (year) conditions.push(eq(questionsTable.year, year));

    const allQuestions = await db
      .select()
      .from(questionsTable)
      .where(and(...conditions))
      .orderBy(shuffle ? sql`RANDOM()` : sql`id ASC`)
      .limit(questionCount);

    if (allQuestions.length === 0) {
      return res.status(400).json({ error: "No questions found for these filters" });
    }

    const questionIds = allQuestions.map(q => q.id);

    const [session] = await db.insert(quizSessionsTable).values({
      subjectId,
      paper,
      questionType,
      questionIds,
      status: "in_progress",
      timedMinutes: timedMinutes ?? (paper === "mock" ? 120 : questionType === "theory" ? 120 : 60),
    }).returning();

    const [subject] = await db.select({ name: subjectsTable.name }).from(subjectsTable).where(eq(subjectsTable.id, subjectId));

    const questions = allQuestions.map(q => ({
      ...q,
      subjectName: subject?.name ?? null,
      createdAt: q.createdAt.toISOString(),
    }));

    res.status(201).json(formatSession(session, questions, subject?.name ?? null));
  } catch (err) {
    res.status(500).json({ error: "Failed to start quiz" });
  }
});

router.get("/quiz/sessions", async (req, res) => {
  try {
    const sessions = await db
      .select({
        id: quizSessionsTable.id,
        subjectId: quizSessionsTable.subjectId,
        subjectName: subjectsTable.name,
        paper: quizSessionsTable.paper,
        questionType: quizSessionsTable.questionType,
        questionIds: quizSessionsTable.questionIds,
        status: quizSessionsTable.status,
        score: quizSessionsTable.score,
        totalMarks: quizSessionsTable.totalMarks,
        timedMinutes: quizSessionsTable.timedMinutes,
        createdAt: quizSessionsTable.createdAt,
        completedAt: quizSessionsTable.completedAt,
      })
      .from(quizSessionsTable)
      .leftJoin(subjectsTable, eq(quizSessionsTable.subjectId, subjectsTable.id))
      .orderBy(sql`${quizSessionsTable.createdAt} DESC`)
      .limit(20);

    res.json(sessions.map(s => ({
      ...s,
      questions: [],
      createdAt: s.createdAt.toISOString(),
      completedAt: s.completedAt ? s.completedAt.toISOString() : null,
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.get("/quiz/sessions/:sessionId", async (req, res) => {
  try {
    const id = parseInt(req.params.sessionId);
    const [session] = await db
      .select({
        id: quizSessionsTable.id,
        subjectId: quizSessionsTable.subjectId,
        subjectName: subjectsTable.name,
        paper: quizSessionsTable.paper,
        questionType: quizSessionsTable.questionType,
        questionIds: quizSessionsTable.questionIds,
        status: quizSessionsTable.status,
        score: quizSessionsTable.score,
        totalMarks: quizSessionsTable.totalMarks,
        timedMinutes: quizSessionsTable.timedMinutes,
        createdAt: quizSessionsTable.createdAt,
        completedAt: quizSessionsTable.completedAt,
      })
      .from(quizSessionsTable)
      .leftJoin(subjectsTable, eq(quizSessionsTable.subjectId, subjectsTable.id))
      .where(eq(quizSessionsTable.id, id));

    if (!session) return res.status(404).json({ error: "Session not found" });

    const questionIds = session.questionIds as number[];
    const questions = questionIds.length > 0
      ? await db.select().from(questionsTable).where(inArray(questionsTable.id, questionIds))
      : [];

    res.json(formatSession(session, questions.map(q => ({ ...q, subjectName: session.subjectName, createdAt: q.createdAt.toISOString() })), session.subjectName));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch session" });
  }
});

router.post("/quiz/sessions/:sessionId/submit", async (req, res) => {
  try {
    const id = parseInt(req.params.sessionId);
    const { answers } = req.body as { answers: { questionId: number; selectedOption?: string; theoryAnswer?: string }[] };

    const [session] = await db.select().from(quizSessionsTable).where(eq(quizSessionsTable.id, id));
    if (!session) return res.status(404).json({ error: "Session not found" });

    const questionIds = session.questionIds as number[];
    const questions = await db.select().from(questionsTable).where(inArray(questionsTable.id, questionIds));

    let score = 0;
    let totalMarks = 0;
    const questionResults: any[] = [];

    for (const q of questions) {
      const answer = answers.find(a => a.questionId === q.id);
      const qMarks = q.marks ?? 1;
      totalMarks += qMarks;

      if (q.questionType === "objective") {
        const isCorrect = answer?.selectedOption === q.correctOption;
        if (isCorrect) score += qMarks;
        questionResults.push({
          questionId: q.id,
          isCorrect,
          selectedOption: answer?.selectedOption ?? null,
          correctAnswer: q.correctOption,
          explanation: q.explanation,
        });
      } else {
        // Theory — no auto-mark, just show marking guide
        questionResults.push({
          questionId: q.id,
          isCorrect: false,
          selectedOption: answer?.theoryAnswer ?? null,
          correctAnswer: q.markingGuide ?? "See marking guide",
          explanation: q.explanation,
        });
      }
    }

    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    const grade = GRADE_MAP(percentage);

    const answerMap: Record<string, string> = {};
    for (const a of answers) {
      answerMap[a.questionId] = a.selectedOption ?? a.theoryAnswer ?? "";
    }

    await db.update(quizSessionsTable).set({
      status: "completed",
      score,
      totalMarks,
      percentage,
      answers: answerMap,
      completedAt: new Date(),
    }).where(eq(quizSessionsTable.id, id));

    const feedbackMap: Record<string, string> = {
      A: "Excellent! You are well prepared for this paper.",
      B: "Good performance. Keep revising to push for an A.",
      C: "Average. Focus on your weak areas and practice more past questions.",
      D: "Below average. Dedicate more time to studying this subject.",
      E: "Poor. Urgent revision needed — review the notes and try again.",
      F: "Very poor. Start from the basics and go through the study notes carefully.",
    };

    res.json({
      sessionId: id,
      score,
      totalMarks,
      percentage: Math.round(percentage * 10) / 10,
      grade,
      feedback: feedbackMap[grade] ?? "Keep studying!",
      questionResults,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});

export default router;
