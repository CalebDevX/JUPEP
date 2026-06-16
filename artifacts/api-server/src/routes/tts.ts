import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

export const YARNGPT_SPEAKERS = [
  "idera", "jide", "tolu", "emma", "zainab",
  "joke", "adaeze", "umar", "chisom", "remi",
  "amaka", "kemi", "ngozi", "kehinde", "taiwo",
];

export const YARNGPT_LANGUAGES = ["english", "yoruba", "igbo", "hausa", "pidgin"];

function getAI() {
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI API key not configured");
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  return new GoogleGenAI(
    baseUrl ? { apiKey, httpOptions: { apiVersion: "", baseUrl } } : { apiKey }
  );
}

async function callRailwayAPI(
  text: string,
  language: string,
  speaker: string,
  baseUrl: string,
): Promise<Buffer> {
  const url = `${baseUrl.replace(/\/$/, "")}/tts`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: text.trim(), speaker, language }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Voice service error (${res.status}): ${msg}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function callGeminiTTS(text: string): Promise<Buffer> {
  const ai = getAI();
  const result = await (ai.models as any).generateContent({
    model: "gemini-2.5-flash-preview-tts",
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
      },
    },
    contents: [{ parts: [{ text: text.substring(0, 4000) }] }],
  });

  const part = (result as any).candidates?.[0]?.content?.parts?.[0];
  const audioData: string | undefined = part?.inlineData?.data;
  const rawMime: string = part?.inlineData?.mimeType || "audio/L16;rate=24000";

  if (!audioData) throw new Error("No audio generated");

  const rateMatch = rawMime.match(/rate=(\d+)/);
  const sampleRate = rateMatch ? parseInt(rateMatch[1]) : 24000;
  const pcmBuf = Buffer.from(audioData, "base64");
  const numChannels = 1, bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const hdr = Buffer.alloc(44);
  hdr.write("RIFF", 0); hdr.writeUInt32LE(36 + pcmBuf.length, 4);
  hdr.write("WAVE", 8); hdr.write("fmt ", 12);
  hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20);
  hdr.writeUInt16LE(numChannels, 22); hdr.writeUInt32LE(sampleRate, 24);
  hdr.writeUInt32LE(byteRate, 28); hdr.writeUInt16LE(blockAlign, 32);
  hdr.writeUInt16LE(bitsPerSample, 34); hdr.write("data", 36);
  hdr.writeUInt32LE(pcmBuf.length, 40);
  return Buffer.concat([hdr, pcmBuf]);
}

router.get("/tts/speakers", (_req, res) => {
  res.json({ speakers: YARNGPT_SPEAKERS, languages: YARNGPT_LANGUAGES });
});

router.post("/tts", async (req, res) => {
  const {
    text,
    speaker = "idera",
    language = "english",
  }: { text?: string; speaker?: string; language?: string } = req.body;

  if (!text?.trim()) return res.status(400).json({ error: "Text is required." });
  if (text.length > 1500) return res.status(400).json({ error: "Text too long — keep it under 1500 characters." });

  const spk = YARNGPT_SPEAKERS.includes(speaker) ? speaker : "idera";
  const lang = YARNGPT_LANGUAGES.includes(language) ? language : "english";

  const railwayUrl = process.env.YARNGPT_URL;

  try {
    let audioBuffer: Buffer;

    if (railwayUrl) {
      console.info(`Using Railway YarnGPT at ${railwayUrl}`);
      audioBuffer = await callRailwayAPI(text, lang, spk, railwayUrl);
    } else {
      console.info("YARNGPT_URL not set — using built-in AI voice");
      audioBuffer = await callGeminiTTS(text);
    }

    res.set({
      "Content-Type": "audio/wav",
      "Content-Length": String(audioBuffer.byteLength),
      "Cache-Control": "no-store",
    });
    res.send(audioBuffer);
  } catch (err: any) {
    console.error("TTS error:", err.message);
    res.status(500).json({
      error: err.message || "Failed to generate audio.",
      code: "TTS_ERROR",
    });
  }
});

export default router;
