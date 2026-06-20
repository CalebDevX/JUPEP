import { Router } from "express";
import { getAI } from "../lib/gemini-keys";

const router = Router();

export const YARNGPT_VOICES = [
  "Idera", "Emma", "Zainab", "Osagie", "Wura",
  "Jude", "Chinenye", "Tayo", "Regina", "Femi",
  "Adaora", "Umar", "Mary", "Nonso", "Remi", "Adam",
];

export const YARNGPT_LANGUAGES = ["english", "yoruba", "igbo", "hausa", "pidgin"];

async function callYarnGPTAPI(text: string, voice: string): Promise<{ buffer: Buffer; contentType: string }> {
  const apiKey = process.env.YARNGPT_API_KEY;
  if (!apiKey) throw new Error("YARNGPT_API_KEY is not configured");

  const res = await fetch("https://yarngpt.ai/api/v1/tts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: text.trim(), voice, response_format: "mp3" }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`YarnGPT API error (${res.status}): ${msg}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return { buffer, contentType: "audio/mpeg" };
}

async function callGeminiTTS(text: string): Promise<{ buffer: Buffer; contentType: string }> {
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
  return { buffer: Buffer.concat([hdr, pcmBuf]), contentType: "audio/wav" };
}

router.get("/tts/speakers", (_req, res) => {
  res.json({ speakers: YARNGPT_VOICES, languages: YARNGPT_LANGUAGES });
});

router.post("/tts", async (req, res) => {
  const {
    text,
    speaker,
    voice,
    language = "english",
  }: { text?: string; speaker?: string; voice?: string; language?: string } = req.body;

  if (!text?.trim()) return res.status(400).json({ error: "Text is required." });
  if (text.length > 2000) return res.status(400).json({ error: "Text too long — keep it under 2000 characters." });

  const requestedVoice = voice || speaker || "Idera";
  const resolvedVoice = YARNGPT_VOICES.find(
    v => v.toLowerCase() === requestedVoice.toLowerCase()
  ) ?? "Idera";

  try {
    let result: { buffer: Buffer; contentType: string };

    if (process.env.YARNGPT_API_KEY) {
      console.info(`Using YarnGPT API with voice: ${resolvedVoice}`);
      result = await callYarnGPTAPI(text, resolvedVoice);
    } else {
      console.info("YARNGPT_API_KEY not set — falling back to Gemini TTS");
      result = await callGeminiTTS(text);
    }

    res.set({
      "Content-Type": result.contentType,
      "Content-Length": String(result.buffer.byteLength),
      "Cache-Control": "no-store",
    });
    res.send(result.buffer);
  } catch (err: any) {
    console.error("TTS error:", err.message);
    res.status(500).json({
      error: err.message || "Failed to generate audio.",
      code: "TTS_ERROR",
    });
  }
});

export default router;
