import { Router } from "express";
import { db } from "@workspace/db";
import { questionsTable, subjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAI } from "../lib/gemini-keys";

const router = Router();

function safeGetAI() {
  try { return getAI(); } catch { return null; }
}

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const vals: string[] = [];
      let cur = "", inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQ = !inQ; }
        else if (ch === "," && !inQ) { vals.push(cur.trim()); cur = ""; }
        else { cur += ch; }
      }
      vals.push(cur.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = (vals[i] ?? "").replace(/^"|"$/g, ""); });
      return obj;
    });
}

function rowToQuestion(row: Record<string, string>) {
  const subjectId = parseInt(row.subjectId ?? row.subject_id ?? "0");
  const year = parseInt(row.year ?? new Date().getFullYear().toString());
  const marks = parseInt(row.marks ?? "1");
  const questionType = (row.questionType ?? row.question_type ?? "objective").toLowerCase();
  const paper = row.paper ?? "001";
  const questionText = row.questionText ?? row.question_text ?? row.question ?? "";

  let options: string[] | undefined;
  if (questionType === "objective") {
    if (row.options) {
      try { options = JSON.parse(row.options); } catch { options = undefined; }
    } else {
      const opts = [row.optionA ?? row.option_a, row.optionB ?? row.option_b,
                    row.optionC ?? row.option_c, row.optionD ?? row.option_d]
        .filter(Boolean) as string[];
      if (opts.length) options = opts;
    }
  }

  return {
    subjectId,
    paper,
    year,
    questionType,
    questionText,
    options: options ?? null,
    correctOption: row.correctOption ?? row.correct_option ?? null,
    explanation: row.explanation ?? null,
    markingGuide: row.markingGuide ?? row.marking_guide ?? null,
    marks: isNaN(marks) ? 1 : marks,
  };
}

async function generateExplanation(
  ai: GoogleGenAI,
  q: ReturnType<typeof rowToQuestion>,
  subjectName: string
): Promise<string> {
  const prompt = `You are an academic JUPEB exam expert. Write a clear, concise academic explanation for this ${subjectName} question.

Question: ${q.questionText}
${q.options ? `Options:\nA. ${q.options[0]}\nB. ${q.options[1]}\nC. ${q.options[2]}\nD. ${q.options[3]}` : ""}
${q.correctOption ? `Correct Answer: ${q.correctOption}` : ""}

Write a focused 2-4 sentence academic explanation of why the answer is correct, covering the key concept tested. Be precise and educational.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 512 },
  });
  return response.text ?? "";
}

router.post("/questions/bulk", async (req, res) => {
  try {
    const { questions: rawQuestions, csvData, autoExplain = false, adminPin } = req.body;

    if (adminPin !== "JUPEB2024") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    let rows: Record<string, string>[] = [];
    if (csvData && typeof csvData === "string") {
      rows = parseCSV(csvData);
    } else if (Array.isArray(rawQuestions)) {
      rows = rawQuestions;
    } else {
      return res.status(400).json({ error: "Provide questions array or csvData string" });
    }

    if (rows.length === 0) {
      return res.status(400).json({ error: "No questions found in the data" });
    }
    if (rows.length > 500) {
      return res.status(400).json({ error: "Maximum 500 questions per upload" });
    }

    const ai = autoExplain ? safeGetAI() : null;

    const subjects = await db.select().from(subjectsTable);
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

    const inserted: number[] = [];
    const errors: { row: number; error: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const q = rowToQuestion(rows[i]);
        if (!q.subjectId || !subjectMap.has(q.subjectId)) {
          errors.push({ row: i + 1, error: `Subject ID ${q.subjectId} not found` });
          continue;
        }
        if (!q.questionText.trim()) {
          errors.push({ row: i + 1, error: "Question text is empty" });
          continue;
        }

        if (autoExplain && ai && !q.explanation) {
          try {
            const subjectName = subjectMap.get(q.subjectId) ?? "Unknown Subject";
            q.explanation = await generateExplanation(ai, q, subjectName);
          } catch {
            // Non-fatal — proceed without explanation
          }
        }

        const [saved] = await db.insert(questionsTable).values({
          subjectId: q.subjectId,
          paper: q.paper,
          year: q.year,
          questionType: q.questionType,
          questionText: q.questionText,
          options: q.options as string[] | null | undefined,
          correctOption: q.correctOption,
          explanation: q.explanation,
          markingGuide: q.markingGuide,
          marks: q.marks,
        }).returning({ id: questionsTable.id });
        inserted.push(saved.id);
      } catch (err: any) {
        errors.push({ row: i + 1, error: err?.message ?? "Insert failed" });
      }
    }

    res.status(201).json({
      inserted: inserted.length,
      failed: errors.length,
      total: rows.length,
      insertedIds: inserted,
      errors: errors.slice(0, 20),
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Bulk upload failed" });
  }
});

router.get("/questions/bulk/template", (_req, res) => {
  const header = "subjectId,paper,year,questionType,questionText,optionA,optionB,optionC,optionD,correctOption,explanation,marks";
  const example1 = `1,001,2024,objective,"Which of the following best defines 'sovereignty'?","Absolute power of the people","Supreme authority of the state","Power of the military","Authority of the judiciary",B,"Sovereignty refers to the supreme and independent authority of a state to govern itself without external interference.",1`;
  const example2 = `1,004,2024,theory,"Discuss the concept of separation of powers as applied in Nigeria's constitution.",,,,,"Separation of powers divides government authority among legislative executive and judicial branches to prevent tyranny.",10`;
  const csv = [header, example1, example2].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="questions_template.csv"');
  res.send(csv);
});

export default router;
