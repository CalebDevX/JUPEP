import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { db } from "@workspace/db";
import { notesTable, subjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");
  return new GoogleGenAI({ apiKey });
}

const JUPEB_SYSTEM_PROMPT = `You are LexBot, the official AI study assistant for JUPEB Law Prep — a smart exam preparation platform for UNILAG School of Foundation Studies students targeting 16 points (AAA+1) for Law admission.

You specialise in:
- Literature-in-English (JUPEB LIT 001–004)
- Government (JUPEB GOV 001–004)
- Christian Religious Studies (JUPEB CRS 001–004)

Your personality:
- Warm, encouraging, and supportive — like a brilliant senior student who genuinely wants you to succeed
- Academic and precise when explaining concepts
- Use Nigerian educational context and examples where relevant
- Always motivate students toward their 16-point goal
- Keep responses clear, well-structured, and exam-focused

Your capabilities:
- Explain complex topics in simple terms
- Provide exam tips and techniques
- Help with past questions and marking guides
- Generate mnemonics and memory aids
- Give feedback on student answers
- Explain literary devices, government concepts, CRS passages

Format your responses with:
- Clear headings where appropriate
- Bullet points for lists
- Bold for key terms
- Examples from Nigerian/West African context
- Encouraging sign-offs

Remember: Every student you help is one step closer to UNILAG Law. Make every interaction count!`;

router.post("/ai/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const ai = getGemini();
    
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
      model: "gemini-1.5-flash",
      config: { systemInstruction: JUPEB_SYSTEM_PROMPT },
      contents,
    });

    for await (const chunk of stream) {
      const text = chunk.text();
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
    const { subjectId, paper, topic, syllabus } = req.body;
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

    const ai = getGemini();

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
      model: "gemini-1.5-flash",
      config: { systemInstruction: JUPEB_SYSTEM_PROMPT },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const content = response.text();
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
    const { questionText, options, correctAnswer, subject } = req.body;
    if (!questionText) return res.status(400).json({ error: "questionText is required" });

    const ai = getGemini();

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
      model: "gemini-1.5-flash",
      config: { systemInstruction: JUPEB_SYSTEM_PROMPT },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    res.json({ explanation: response.text() });
  } catch (err: any) {
    console.error("Explain question error:", err);
    res.status(500).json({ error: err?.message || "Failed to explain question" });
  }
});

router.post("/ai/learn-from-source", async (req, res) => {
  try {
    const { type, content, fileBase64, fileMimeType, title, subject } = req.body;
    if (!type) return res.status(400).json({ error: "type is required" });

    const ai = getGemini();

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
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts }],
    });

    const generatedContent = response.text();
    if (!generatedContent) throw new Error("AI returned empty content");

    res.json({ title: noteTitle, content: generatedContent, type });
  } catch (err: any) {
    console.error("Learn from source error:", err);
    res.status(500).json({ error: err?.message || "Failed to generate notes from source" });
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
