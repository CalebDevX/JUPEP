import { Router } from "express";
import { db } from "@workspace/db";
import { quizSessionsTable, questionsTable, subjectsTable, wrongAnswersTable, EXAM_TYPE_PAPERS, EXAM_TYPE_LABELS, type ExamType } from "@workspace/db";
import { eq, and, inArray, sql } from "drizzle-orm";

const router = Router();

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
    examType: session.examType,
    examTypeLabel: EXAM_TYPE_LABELS[session.examType as ExamType] ?? session.examType ?? session.paper,
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

// Returns question counts per subject × examType × questionType
router.get("/quiz/available", async (_req, res) => {
  try {
    const rows = await db
      .select({
        subjectId: questionsTable.subjectId,
        paper: questionsTable.paper,
        examType: questionsTable.examType,
        questionType: questionsTable.questionType,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(questionsTable)
      .groupBy(questionsTable.subjectId, questionsTable.paper, questionsTable.examType, questionsTable.questionType);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

router.post("/quiz/start", async (req, res) => {
  try {
    const {
      subjectId,
      examType,         // preferred: "first_incourse" | "first_semester" | "second_incourse" | "mock" | "final_jupeb"
      paper,            // legacy fallback
      questionType,
      year,
      questionCount = 20,
      timedMinutes,
      shuffle = true,
    } = req.body;

    // Resolve the exam type — support both new (examType) and legacy (paper) params
    const resolvedExamType: string = examType ?? paper ?? "first_incourse";
    const conditions: any[] = [eq(questionsTable.subjectId, subjectId)];

    // Filter by examType if stored on questions (new data), else fall back to paper-based filtering
    const examPapers = EXAM_TYPE_PAPERS[resolvedExamType as ExamType];
    if (examPapers) {
      // Use examType field for precise filtering (new questions have this set)
      // Also fall back to paper-based filter for legacy questions
      conditions.push(
        sql`(${questionsTable.examType} = ${resolvedExamType} OR (${questionsTable.examType} IS NULL AND ${questionsTable.paper} = ANY(ARRAY[${sql.raw(examPapers.map(p => `'${p}'`).join(","))}])))`
      );
    } else {
      conditions.push(eq(questionsTable.paper, resolvedExamType));
    }

    if (questionType && questionType !== "mixed") {
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

    // Derive a legacy paper value for the sessions table
    const sessionPaper = examPapers?.[0] ?? resolvedExamType;
    const isBroadExam = resolvedExamType === "mock" || resolvedExamType === "final_jupeb";
    const defaultMinutes = isBroadExam ? 120 : questionType === "theory" ? 120 : 60;

    const [session] = await db.insert(quizSessionsTable).values({
      subjectId,
      paper: sessionPaper,
      examType: resolvedExamType,
      questionType: questionType ?? "objective",
      questionIds,
      status: "in_progress",
      timedMinutes: timedMinutes ?? defaultMinutes,
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
    if (isNaN(id)) return res.status(400).json({ error: "Invalid sessionId" });
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
    if (isNaN(id)) return res.status(400).json({ error: "Invalid sessionId" });
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

    // Record wrong answers for the Wrong Answers Bank
    const phone = (req.body as any).phone as string | undefined;
    if (phone) {
      const wrongOnes = questionResults.filter(r => !r.isCorrect && r.selectedOption);
      if (wrongOnes.length > 0) {
        const wrongQuestions = questions.filter(q =>
          wrongOnes.some(w => w.questionId === q.id)
        );
        await db.insert(wrongAnswersTable).values(
          wrongQuestions.map(q => ({
            studentPhone: phone,
            questionId: q.id,
            subjectId: q.subjectId,
            paper: q.paper,
            selectedOption: answerMap[q.id] ?? null,
          }))
        ).onConflictDoNothing();
      }
    }

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
