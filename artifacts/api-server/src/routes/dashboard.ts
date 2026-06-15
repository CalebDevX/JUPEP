import { Router } from "express";
import { db } from "@workspace/db";
import { questionsTable, notesTable, quizSessionsTable, subjectsTable } from "@workspace/db";
import { eq, sql, avg, count, desc, and } from "drizzle-orm";

const router = Router();

const PAPER_LABELS: Record<string, string> = {
  "001": "1st Incourse",
  "002": "1st Semester Exam",
  "003": "2nd Incourse",
  "004": "Mock Exam",
};

router.get("/dashboard/summary", async (req, res) => {
  try {
    const [{ totalQuestions }] = await db.select({ totalQuestions: count() }).from(questionsTable);
    const [{ totalNotes }] = await db.select({ totalNotes: count() }).from(notesTable);
    const [{ totalQuizzes }] = await db.select({ totalQuizzes: count() }).from(quizSessionsTable).where(eq(quizSessionsTable.status, "completed"));
    const [{ avgScore }] = await db.select({ avgScore: avg(quizSessionsTable.percentage) }).from(quizSessionsTable).where(eq(quizSessionsTable.status, "completed"));

    const [lastQuiz] = await db.select({ percentage: quizSessionsTable.percentage }).from(quizSessionsTable).where(eq(quizSessionsTable.status, "completed")).orderBy(desc(quizSessionsTable.completedAt)).limit(1);

    const subjects = await db.select().from(subjectsTable);
    const subjectBreakdown = await Promise.all(subjects.map(async (s) => {
      const [{ qCount }] = await db.select({ qCount: count() }).from(questionsTable).where(eq(questionsTable.subjectId, s.id));
      const [{ nCount }] = await db.select({ nCount: count() }).from(notesTable).where(eq(notesTable.subjectId, s.id));
      return { subjectName: s.name, questionCount: Number(qCount), noteCount: Number(nCount), color: s.color };
    }));

    const papers = ["001", "002", "003", "004"];
    const paperBreakdown = await Promise.all(papers.map(async (p) => {
      const [{ qCount }] = await db.select({ qCount: count() }).from(questionsTable).where(eq(questionsTable.paper, p));
      return { paper: p, paperLabel: PAPER_LABELS[p], questionCount: Number(qCount) };
    }));

    res.json({
      totalQuestions: Number(totalQuestions),
      totalNotes: Number(totalNotes),
      totalQuizzes: Number(totalQuizzes),
      averageScore: avgScore ? Math.round(Number(avgScore) * 10) / 10 : 0,
      recentScore: lastQuiz?.percentage ?? null,
      subjectBreakdown,
      paperBreakdown,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

router.get("/dashboard/recent-activity", async (req, res) => {
  try {
    const recentQuizzes = await db
      .select({
        id: quizSessionsTable.id,
        subjectName: subjectsTable.name,
        paper: quizSessionsTable.paper,
        questionType: quizSessionsTable.questionType,
        percentage: quizSessionsTable.percentage,
        score: quizSessionsTable.score,
        totalMarks: quizSessionsTable.totalMarks,
        completedAt: quizSessionsTable.completedAt,
      })
      .from(quizSessionsTable)
      .leftJoin(subjectsTable, eq(quizSessionsTable.subjectId, subjectsTable.id))
      .where(eq(quizSessionsTable.status, "completed"))
      .orderBy(desc(quizSessionsTable.completedAt))
      .limit(10);

    const activity = recentQuizzes.map(q => ({
      id: q.id,
      type: "quiz_completed",
      description: `${q.subjectName ?? "Unknown"} — ${PAPER_LABELS[q.paper] ?? q.paper} (${q.questionType})`,
      score: q.percentage,
      grade: (() => {
        const p = q.percentage ?? 0;
        if (p >= 70) return "A";
        if (p >= 60) return "B";
        if (p >= 50) return "C";
        if (p >= 45) return "D";
        if (p >= 40) return "E";
        return "F";
      })(),
      createdAt: q.completedAt ? q.completedAt.toISOString() : new Date().toISOString(),
    }));

    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
});

router.get("/progress", async (req, res) => {
  try {
    const subjects = await db.select().from(subjectsTable);

    const subjectProgress = await Promise.all(subjects.map(async (s) => {
      const sessions = await db.select().from(quizSessionsTable).where(eq(quizSessionsTable.subjectId, s.id));
      const completed = sessions.filter(ses => ses.status === "completed");
      const totalAnswered = completed.reduce((acc, ses) => acc + (ses.questionIds as number[]).length, 0);
      const avgPct = completed.length > 0
        ? completed.reduce((acc, ses) => acc + (ses.percentage ?? 0), 0) / completed.length
        : 0;
      return {
        subjectId: s.id,
        subjectName: s.name,
        averageScore: Math.round(avgPct * 10) / 10,
        quizzesTaken: completed.length,
        questionsAnswered: totalAnswered,
      };
    }));

    const papers = ["001", "002", "003", "004"];
    const paperProgress = await Promise.all(papers.map(async (p) => {
      const sessions = await db.select().from(quizSessionsTable).where(eq(quizSessionsTable.paper, p));
      const completed = sessions.filter(s => s.status === "completed");
      const avgPct = completed.length > 0
        ? completed.reduce((acc, s) => acc + (s.percentage ?? 0), 0) / completed.length
        : 0;
      return {
        paper: p,
        paperLabel: PAPER_LABELS[p],
        averageScore: Math.round(avgPct * 10) / 10,
        quizzesTaken: completed.length,
      };
    }));

    const [allSessions] = await db.select({ total: count() }).from(quizSessionsTable).where(eq(quizSessionsTable.status, "completed"));
    const [avgAll] = await db.select({ avg: avg(quizSessionsTable.percentage) }).from(quizSessionsTable).where(eq(quizSessionsTable.status, "completed"));

    const totalAnswered = (await db.select().from(quizSessionsTable).where(eq(quizSessionsTable.status, "completed")))
      .reduce((acc, s) => acc + (s.questionIds as number[]).length, 0);

    res.json({
      totalQuizzes: Number(allSessions.total),
      averageScore: avgAll.avg ? Math.round(Number(avgAll.avg) * 10) / 10 : 0,
      subjectProgress,
      paperProgress,
      streakDays: 0,
      totalQuestionsAnswered: totalAnswered,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

router.get("/daily-challenge", async (req, res) => {
  try {
    const [{ total }] = await db.select({ total: count() }).from(questionsTable).where(eq(questionsTable.questionType, "objective"));
    const totalCount = Number(total);
    if (totalCount === 0) return res.status(404).json({ error: "No questions available" });

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const idx = parseInt(today) % totalCount;

    const [question] = await db
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
        marks: questionsTable.marks,
      })
      .from(questionsTable)
      .leftJoin(subjectsTable, eq(questionsTable.subjectId, subjectsTable.id))
      .where(eq(questionsTable.questionType, "objective"))
      .orderBy(questionsTable.id)
      .limit(1)
      .offset(idx);

    if (!question) return res.status(404).json({ error: "No question found" });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch daily challenge" });
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    const topSessions = await db
      .select({
        id: quizSessionsTable.id,
        subjectName: subjectsTable.name,
        paper: quizSessionsTable.paper,
        questionType: quizSessionsTable.questionType,
        score: quizSessionsTable.score,
        totalMarks: quizSessionsTable.totalMarks,
        percentage: quizSessionsTable.percentage,
        completedAt: quizSessionsTable.completedAt,
      })
      .from(quizSessionsTable)
      .leftJoin(subjectsTable, eq(quizSessionsTable.subjectId, subjectsTable.id))
      .where(and(eq(quizSessionsTable.status, "completed"), sql`${quizSessionsTable.percentage} IS NOT NULL`))
      .orderBy(desc(quizSessionsTable.percentage))
      .limit(20);

    const results = topSessions.map((s, i) => ({
      rank: i + 1,
      subjectName: s.subjectName ?? "Unknown",
      paper: s.paper,
      paperLabel: PAPER_LABELS[s.paper] ?? s.paper,
      questionType: s.questionType,
      score: s.score,
      totalMarks: s.totalMarks,
      percentage: s.percentage,
      completedAt: s.completedAt ? s.completedAt.toISOString() : null,
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
