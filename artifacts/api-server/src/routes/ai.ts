import { Router } from "express";
import { db, pool } from "@workspace/db";
import { notesTable, subjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAI } from "../lib/gemini-keys";

const router = Router();

// ── Chat history table ────────────────────────────────────────────────────────
pool.query(`CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT,
  source_ref TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)`).catch(() => {});
pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_phone ON chat_messages(phone)`).catch(() => {});

// ── GET chat history ──────────────────────────────────────────────────────────
router.get("/ai/chat-history", async (req, res) => {
  try {
    const { phone, limit = "60" } = req.query as Record<string, string>;
    if (!phone?.trim()) return res.status(400).json({ error: "phone is required" });
    const rows = await pool.query(
      "SELECT id, role, content, source_type, source_ref, created_at FROM chat_messages WHERE phone=$1 ORDER BY created_at ASC LIMIT $2",
      [phone.trim(), parseInt(limit)]
    );
    res.json(rows.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE chat history ───────────────────────────────────────────────────────
router.delete("/ai/chat-history", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone?.trim()) return res.status(400).json({ error: "phone is required" });
    await pool.query("DELETE FROM chat_messages WHERE phone=$1", [phone.trim()]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

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
- Paper 004 → 2nd Semester Exam
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
    const { message, history = [], studentName, studentSubjects, phone, stream: wantsStream = true, sourceType, sourceRef } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const ai = getAI();

    const contents = [
      ...history.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    // Save user message to DB (fire-and-forget)
    if (phone?.trim()) {
      pool.query(
        "INSERT INTO chat_messages(phone, role, content, source_type, source_ref) VALUES($1,'user',$2,$3,$4)",
        [phone.trim(), message, sourceType || null, sourceRef || null]
      ).catch(() => {});
    }

    // Non-streaming mode: return plain JSON (for mobile clients)
    if (wantsStream === false) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: { systemInstruction: buildSystemPrompt(studentName, studentSubjects) },
        contents,
      });
      const reply = response.text || "";
      if (phone?.trim()) {
        pool.query(
          "INSERT INTO chat_messages(phone, role, content) VALUES($1,'assistant',$2)",
          [phone.trim(), reply]
        ).catch(() => {});
      }
      return res.json({ reply });
    }

    // Streaming mode (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      config: { systemInstruction: buildSystemPrompt(studentName, studentSubjects) },
      contents,
    });

    let fullReply = "";
    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullReply += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    if (phone?.trim() && fullReply) {
      pool.query(
        "INSERT INTO chat_messages(phone, role, content) VALUES($1,'assistant',$2)",
        [phone.trim(), fullReply]
      ).catch(() => {});
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
      "004": "2nd Semester",
    };

    const ai = getAI();

    const subjectGuidance: Record<string, string> = {
      "LIT": `For Literature topics:
  - Name ALL major authors, playwrights, poets, novelists relevant to this topic with birth/death years
  - For drama/theatre: trace from Ancient Greece (Thespis, Aeschylus, Sophocles, Euripides, Aristophanes) through Shakespeare, Ibsen, Chekhov, Brecht, Soyinka, Osofisan etc.
  - For any text: give plot summary, all major characters with roles, ALL themes, literary devices used, critical interpretations
  - Quote exact lines or passages where possible
  - Include Aristotle's Poetics definitions (catharsis, mimesis, hamartia, hubris, peripeteia, anagnorisis) where relevant
  - Cover Nigerian/African literature: Chinua Achebe, Wole Soyinka, Ngugi wa Thiong'o, J.P. Clark, Ola Rotimi, Ben Okri
  - Include at least one critical/scholarly perspective per major point`,

      "GOV": `For Government topics:
  - Cite specific sections/chapters of the Nigerian 1999 Constitution where relevant
  - Include key dates: colonial period (1914 Amalgamation, 1960 Independence, 1963 Republic, 1966 coup, 1979/1999 constitutions)
  - Name specific politicians, military leaders, and their roles
  - Compare Nigeria's system to at least one other country's (UK, USA, etc.)
  - Include landmark Supreme Court cases or constitutional crises where applicable
  - Define political science terms with precision`,

      "CRS": `For CRS topics:
  - Cite specific Bible passages (book, chapter:verse) for every major claim
  - Include Old Testament historical context AND New Testament fulfillment where relevant
  - Name specific biblical figures, prophets, apostles, their roles and key actions
  - Include Church history: early Church fathers, Councils (Nicaea 325AD, Chalcedon 451AD), Reformation figures (Luther, Calvin, Zwingli)
  - Cover Christian ethics, moral theology, and their application to Nigerian/African society
  - Distinguish between Catholic, Protestant, and Pentecostal perspectives where relevant`,
    };

    const subCode = subject.code.replace(/[0-9]/g, '').toUpperCase();
    const specificGuidance = subjectGuidance[subCode] || "";

    const prompt = `Generate ENCYCLOPEDIC, deeply scholarly JUPEB lecture notes for the following:

Subject: ${subject.name} (${subject.code})
Paper: ${paper} — ${paperLabels[paper] || paper}
Topic: ${topic}
${syllabus ? `Syllabus/Content Outline:\n${syllabus}` : ""}

${specificGuidance}

MANDATORY REQUIREMENTS — every single one must be met:

**LENGTH & DEPTH:**
- Minimum 2,000 words — closer to 2,500 is better
- Cover ALL aspects of this topic, not just the basics
- If writing about any historical topic, include specific dates, names, and events
- If writing about any concept, include origins, development, key thinkers, and modern relevance
- Do NOT summarise — explain everything in detail

**REQUIRED STRUCTURE (include ALL sections):**
## Introduction
- Historical/contextual background with specific dates
- Why this topic matters for JUPEB

## Key Definitions
- Minimum 8 key terms, each with a full paragraph explanation
- **Bold** every key term

## Historical Development & Origins
- Chronological timeline of how this topic evolved
- Specific dates, names, events — NO vague statements like "ancient times"

## Key Figures & Their Contributions
- Name at minimum 5 specific people (scholars, writers, leaders, biblical figures, etc.)
- For each: who they were, when they lived, what they contributed, why it matters

## Main Content
### [Sub-section 1 — specific heading]
### [Sub-section 2 — specific heading]
### [Sub-section 3 — specific heading]
(Use at least 4 sub-sections with detailed content in each)

## Analysis & Critical Perspectives
- At least 2 different schools of thought or interpretations
- Compare and contrast these perspectives

## Nigerian/African Context
- How this topic connects to Nigeria, West Africa, or African experience
- Local examples, Nigerian figures, or Nigerian case studies

## Summary
- Comprehensive bullet-point recap of ALL major points

## Practice Examination Questions
**Short Answer (5 marks each):**
1. [Question with model answer — minimum 3 sentences]
2. [Question with model answer — minimum 3 sentences]
3. [Question with model answer — minimum 3 sentences]

**Essay Questions (20–25 marks each):**
1. [Essay question with outline of key points to include]
2. [Essay question with outline of key points to include]

## 🎯 Exam Tips
- 5 specific, actionable tips for this exact topic
- Include common mistakes students make on this topic
- Note any specific facts examiners frequently test

**FORMATTING:**
- **Bold** ALL key terms, names, dates, and important concepts throughout
- Use numbered lists for processes or sequences
- Use bullet points for features, characteristics, or lists
- Use > blockquotes for important quotes or definitions

Write these notes as if you are the most knowledgeable professor of this subject teaching the brightest students. Leave nothing out. A student who reads these notes thoroughly should be able to answer ANY JUPEB question on this topic with confidence.`;

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

// ── YarnGPT TTS (Nigerian voice) ──────────────────────────────────────────────
router.post("/ai/yarngpt-tts", async (req, res) => {
  try {
    const { text, voice = "idera" } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "text is required" });

    const apiKey = process.env.YARNGPT_API_KEY;
    if (!apiKey) return res.status(503).json({ error: "YarnGPT not configured" });

    // YarnGPT via HuggingFace Inference API
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/ylacombe/YarnGPT",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept": "audio/wav",
        },
        body: JSON.stringify({ inputs: text.trim().slice(0, 1000), parameters: { voice } }),
      }
    );

    if (!hfRes.ok) {
      const errText = await hfRes.text().catch(() => "");
      // Fall back to Gemini TTS on failure
      console.warn("YarnGPT failed, falling back to Gemini TTS:", errText.slice(0, 200));

      const ai = getAI();
      const ttsRes = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
        },
        contents: [{ role: "user", parts: [{ text: text.trim().slice(0, 800) }] }],
      });

      const audioData = ttsRes.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!audioData?.data) return res.status(500).json({ error: "TTS generation failed" });

      const pcmBuf = Buffer.from(audioData.data, "base64");
      const sampleRate = 24000; const numChannels = 1; const bitsPerSample = 16;
      const wavHeader = Buffer.alloc(44);
      wavHeader.write("RIFF", 0); wavHeader.writeUInt32LE(36 + pcmBuf.length, 4);
      wavHeader.write("WAVE", 8); wavHeader.write("fmt ", 12);
      wavHeader.writeUInt32LE(16, 16); wavHeader.writeUInt16LE(1, 20);
      wavHeader.writeUInt16LE(numChannels, 22); wavHeader.writeUInt32LE(sampleRate, 24);
      wavHeader.writeUInt32LE(sampleRate * numChannels * bitsPerSample / 8, 28);
      wavHeader.writeUInt16LE(numChannels * bitsPerSample / 8, 32);
      wavHeader.writeUInt16LE(bitsPerSample, 34); wavHeader.write("data", 36);
      wavHeader.writeUInt32LE(pcmBuf.length, 40);
      return res.json({ audio: Buffer.concat([wavHeader, pcmBuf]).toString("base64"), mimeType: "audio/wav", voice: "gemini-fallback" });
    }

    // YarnGPT returned audio — forward it as base64
    const audioBuf = Buffer.from(await hfRes.arrayBuffer());
    res.json({ audio: audioBuf.toString("base64"), mimeType: "audio/wav", voice });
  } catch (err: any) {
    console.error("YarnGPT TTS error:", err);
    res.status(500).json({ error: err?.message || "TTS generation failed" });
  }
});

router.post("/ai/explain", async (req, res) => {
  try {
    const { topic, context, studentName, studentSubjects } = req.body;
    if (!topic?.trim()) return res.status(400).json({ error: "topic is required" });

    const ai = getAI();
    const prompt = context
      ? `${context}\n\nTopic: ${topic.trim()}`
      : `Explain the following topic clearly for a JUPEB Foundation Studies student:\n\nTopic: ${topic.trim()}\n\nGive a 2-3 paragraph explanation that is warm, clear, and exam-focused.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: { systemInstruction: buildSystemPrompt(studentName, studentSubjects) },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    res.json({ explanation: response.text });
  } catch (err: any) {
    console.error("AI explain error:", err);
    res.status(500).json({ error: err?.message || "Failed to generate explanation" });
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
