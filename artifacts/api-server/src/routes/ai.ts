import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { db } from "@workspace/db";
import { notesTable, subjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function getAI() {
  const apiKey =
    process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI API key not configured");

  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  return new GoogleGenAI(
    baseUrl
      ? { apiKey, httpOptions: { apiVersion: "", baseUrl } }
      : { apiKey }
  );
}

function buildSystemPrompt(studentName?: string, studentSubjects?: string[]): string {
  const nameClause = studentName
    ? `The student's name is ${studentName}. Address them by name occasionally (not every message) to make it personal and warm.`
    : "";
  const subjectClause = studentSubjects?.length
    ? `The student is preparing for: **${studentSubjects.join(", ")}**. Focus your explanations, examples, and exam tips on these subjects.`
    : "The student is a JUPEB candidate preparing for their Foundation Studies exams.";

  return `You are LexBot, the official AI study assistant for JUPEB Prep — Nigeria's smartest exam preparation platform for Foundation Studies students targeting Direct Entry admission into top universities.

${nameClause}
${subjectClause}

JUPEB Exam Structure (always use these labels):
- Paper 001 → First In-Course Test
- Paper 002 → First Semester Exam
- Paper 003 → Second In-Course Test
- Paper 004 → Pre-Final Mock Exam
- Final JUPEB → The main JUPEB examination

Grading & Points:
- A = 5 points, B = 4 points, C = 3 points, D = 2 points, E = 1 point
- AAA+1 = 16 points (Medicine, Law, Pharmacy)
- AAB+1 = 15 points (Engineering, Economics)
- BBB+1 = 12 points (Sciences, Social Sciences)

Your personality:
- Warm, encouraging, supportive — like a brilliant senior student who genuinely wants you to succeed
- Academic and precise when explaining concepts
- Use Nigerian educational context and examples where relevant
- Motivate students toward their target grade
- Keep responses clear, well-structured, and exam-focused

Your capabilities:
- Explain complex topics in simple, memorable ways
- Provide exam tips and answering techniques for each paper type
- Help with past questions and model answers
- Generate mnemonics and memory aids
- Give feedback on student answers
- Create concise revision summaries
- Explain concepts across ALL JUPEB subjects (Arts, Sciences, Commercial, Social Sciences)

Response format:
- Clear headings where appropriate (use ## and ###)
- Bullet points for lists
- **Bold** for key terms and definitions
- Examples from Nigerian/West African context
- End with an encouraging note tailored to the student

Remember: Every Nigerian student deserves excellent academic support. Make every interaction count — you could be the difference between a C and an A!`;
}

router.post("/ai/chat", async (req, res) => {
  try {
    const { message, history = [], studentName, studentSubjects } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const ai = getAI();

    const contents = [
      ...history.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      config: { systemInstruction: buildSystemPrompt(studentName, studentSubjects) },
      contents,
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error("AI chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err?.message || "AI request failed" });
    } else {
      res.write(`data: ${JSON.stringify({ error: err?.message || "AI request failed" })}\n\n`);
      res.end();
    }
  }
});

router.post("/ai/generate-notes", async (req, res) => {
  try {
    const { subjectId, paper, topic, syllabus, studentName, studentSubjects } = req.body;
    if (!subjectId || !paper || !topic) {
      return res.status(400).json({ error: "subjectId, paper, and topic are required" });
    }

    const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, subjectId));
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    const paperLabels: Record<string, string> = {
      "001": "1st Incourse",
      "002": "1st Semester Exam",
      "003": "2nd Incourse",
      "004": "Mock Exam",
    };

    const ai = getAI();

    const prompt = `Generate comprehensive, academically detailed JUPEB lecture notes for the following:

Subject: ${subject.name} (${subject.code})
Paper: ${paper} — ${paperLabels[paper] || paper}
Topic: ${topic}
${syllabus ? `Syllabus/Content Outline:\n${syllabus}` : ""}

Requirements for the notes:
1. Write at university foundation level (JUPEB standard)
2. Include: Introduction, Key Definitions, Main Content with sub-sections, Examples, Analysis, Summary, Exam Focus Points
3. Use Nigerian/West African context and examples where relevant
4. Reference scholarly concepts, theories, and notable works/figures
5. Include potential exam questions and model answers at the end
6. Format with markdown: ## for sections, ### for sub-sections, **bold** for key terms, bullet points for lists
7. Minimum 800 words — be thorough and academically rigorous
8. End with "🎯 Exam Tips" section with 3-5 specific tips for scoring in this area

Make these notes so comprehensive that a student reading them would be fully prepared for any JUPEB question on this topic.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: { systemInstruction: buildSystemPrompt(studentName, studentSubjects) },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const content = response.text;
    if (!content) throw new Error("AI returned empty content");

    const [note] = await db.insert(notesTable).values({
      subjectId,
      paper,
      title: topic,
      content,
      tags: ["ai-generated", subject.code.toLowerCase(), paper],
    }).returning();

    res.status(201).json({
      ...note,
      subjectName: subject.name,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    });
  } catch (err: any) {
    console.error("Note generation error:", err);
    res.status(500).json({ error: err?.message || "Failed to generate notes" });
  }
});

router.post("/ai/explain-question", async (req, res) => {
  try {
    const { questionText, options, correctAnswer, subject, studentName, studentSubjects } = req.body;
    if (!questionText) return res.status(400).json({ error: "questionText is required" });

    const ai = getAI();

    const prompt = `A JUPEB student needs help understanding this exam question:

Question: ${questionText}
${options ? `Options:\n${options.map((o: string, i: number) => `${String.fromCharCode(65 + i)}. ${o}`).join("\n")}` : ""}
${correctAnswer ? `Correct Answer: ${correctAnswer}` : ""}
Subject: ${subject || "JUPEB"}

Please:
1. Explain WHY the correct answer is right
2. Explain why the other options are wrong (if applicable)
3. Give the underlying concept or principle being tested
4. Provide a memory tip to remember this for the exam
5. Give one related example

Keep it clear and educational.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: { systemInstruction: buildSystemPrompt(studentName, studentSubjects) },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    res.json({ explanation: response.text });
  } catch (err: any) {
    console.error("Explain question error:", err);
    res.status(500).json({ error: err?.message || "Failed to explain question" });
  }
});

router.post("/ai/learn-from-source", async (req, res) => {
  try {
    const { type, content, fileBase64, fileMimeType, title, subject } = req.body;
    if (!type) return res.status(400).json({ error: "type is required" });

    const ai = getAI();

    const noteTitle = title || (type === "youtube" ? "YouTube Video Notes" : type === "website" ? "Website Notes" : type === "file" ? "Uploaded Document Notes" : "Notes from Text");

    const generatePrompt = `You are an expert JUPEB academic tutor. Generate comprehensive, well-structured study notes from the content provided below.

${subject ? `Subject context: ${subject}` : "Identify the most relevant JUPEB subject(s): Literature-in-English, Government, or CRS."}
Note title: ${noteTitle}

Requirements:
1. Write at JUPEB foundation level — academically rigorous and exam-focused
2. Structure: ## Introduction, ## Key Concepts, ## Main Content (with ### subsections), ## Summary, ## Exam Focus Points
3. Use **bold** for key terms, bullet points for lists, numbered lists for steps/sequences
4. Include Nigerian/West African context where relevant
5. End with a "🎯 Exam Tips" section with 3-5 exam-ready tips
6. Minimum 600 words — be thorough
7. If the content is a video/lecture, extract the key teaching points and structure them as lecture notes

Generate the notes now:`;

    let parts: any[] = [];

    if (type === "youtube") {
      if (!content) return res.status(400).json({ error: "YouTube URL is required" });
      const ytMatch = content.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (!ytMatch) return res.status(400).json({ error: "Invalid YouTube URL" });

      parts = [
        { fileData: { mimeType: "video/mp4", fileUri: content.trim() } },
        { text: generatePrompt },
      ];
    } else if (type === "website") {
      if (!content) return res.status(400).json({ error: "URL is required" });
      let pageText = "";
      try {
        const response = await fetch(content.trim(), {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; JUPEBBot/1.0)" },
          signal: AbortSignal.timeout(10000),
        });
        const html = await response.text();
        pageText = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 40000);
      } catch (e: any) {
        return res.status(400).json({ error: `Could not fetch URL: ${e?.message || "Network error"}` });
      }
      if (!pageText.trim()) return res.status(400).json({ error: "No readable text found at that URL" });
      parts = [{ text: `${generatePrompt}\n\n--- WEBSITE CONTENT ---\n${pageText}` }];
    } else if (type === "text") {
      if (!content?.trim()) return res.status(400).json({ error: "Text content is required" });
      parts = [{ text: `${generatePrompt}\n\n--- TEXT CONTENT ---\n${content.trim()}` }];
    } else if (type === "file") {
      if (!fileBase64 || !fileMimeType) return res.status(400).json({ error: "fileBase64 and fileMimeType are required" });
      parts = [
        { inlineData: { data: fileBase64, mimeType: fileMimeType } },
        { text: generatePrompt },
      ];
    } else {
      return res.status(400).json({ error: "type must be youtube, website, text, or file" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
    });

    const generatedContent = response.text;
    if (!generatedContent) throw new Error("AI returned empty content");

    res.json({ title: noteTitle, content: generatedContent, type });
  } catch (err: any) {
    console.error("Learn from source error:", err);
    res.status(500).json({ error: err?.message || "Failed to generate notes from source" });
  }
});

router.post("/ai/tts", async (req, res) => {
  try {
    const { text, voice = "Kore" } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "text is required" });

    const ai = getAI();
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      config: {
        responseModalities: ["AUDIO"] as any,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
        } as any,
      },
      contents: [{ parts: [{ text: text.substring(0, 4000) }] }],
    });

    const part = (result as any).candidates?.[0]?.content?.parts?.[0];
    const audioData: string | undefined = part?.inlineData?.data;
    const rawMime: string = part?.inlineData?.mimeType || "audio/wav";

    if (!audioData) return res.status(500).json({ error: "No audio generated" });

    const rateMatch = rawMime.match(/rate=(\d+)/);
    const sampleRate = rateMatch ? parseInt(rateMatch[1]) : 24000;
    const pcmBuf = Buffer.from(audioData, "base64");
    const numChannels = 1, bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const wavHeader = Buffer.alloc(44);
    wavHeader.write("RIFF", 0); wavHeader.writeUInt32LE(36 + pcmBuf.length, 4);
    wavHeader.write("WAVE", 8); wavHeader.write("fmt ", 12);
    wavHeader.writeUInt32LE(16, 16); wavHeader.writeUInt16LE(1, 20);
    wavHeader.writeUInt16LE(numChannels, 22); wavHeader.writeUInt32LE(sampleRate, 24);
    wavHeader.writeUInt32LE(byteRate, 28); wavHeader.writeUInt16LE(blockAlign, 32);
    wavHeader.writeUInt16LE(bitsPerSample, 34); wavHeader.write("data", 36);
    wavHeader.writeUInt32LE(pcmBuf.length, 40);
    const wavBase64 = Buffer.concat([wavHeader, pcmBuf]).toString("base64");

    res.json({ audio: wavBase64, mimeType: "audio/wav" });
  } catch (err: any) {
    console.error("TTS error:", err);
    res.status(500).json({ error: err?.message || "TTS generation failed" });
  }
});

router.post("/ai/quiz-from-note", async (req, res) => {
  try {
    const { content, subject, count = 5, studentName, studentSubjects } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "content is required" });

    const ai = getAI();
    const prompt = `Based on the following study notes, generate exactly ${Math.min(count, 10)} multiple-choice quiz questions to test a student's understanding. Each question must be exam-style (JUPEB standard).

Return ONLY a valid JSON array (no markdown, no explanation) in this exact format:
[
  {
    "question": "...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correct": "A",
    "explanation": "..."
  }
]

${subject ? `Subject: ${subject}` : ""}

STUDY NOTES:
${content.substring(0, 6000)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: { systemInstruction: buildSystemPrompt(studentName, studentSubjects) },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const raw = response.text || "";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(500).json({ error: "Could not parse quiz response" });

    const quiz = JSON.parse(jsonMatch[0]);
    res.json({ quiz });
  } catch (err: any) {
    console.error("Quiz generation error:", err);
    res.status(500).json({ error: err?.message || "Quiz generation failed" });
  }
});

router.post("/ai/save-generated-note", async (req, res) => {
  try {
    const { subjectId, paper, title, content, tags } = req.body;
    if (!subjectId || !paper || !title || !content) {
      return res.status(400).json({ error: "subjectId, paper, title, and content are required" });
    }
    const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, parseInt(subjectId)));
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    const [note] = await db.insert(notesTable).values({
      subjectId: parseInt(subjectId),
      paper,
      title,
      content,
      tags: tags || ["ai-generated", "learn-from-source"],
    }).returning();

    res.status(201).json({
      ...note,
      subjectName: subject.name,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    });
  } catch (err: any) {
    console.error("Save note error:", err);
    res.status(500).json({ error: err?.message || "Failed to save note" });
  }
});

export default router;
