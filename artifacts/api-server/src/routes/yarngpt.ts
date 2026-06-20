import { Router } from "express";
import { YARNGPT_VOICES, YARNGPT_LANGUAGES } from "./tts";

const router = Router();

const YARNGPT_API_URL = "https://yarngpt.ai/api/v1/tts";

router.get("/yarngpt/speakers", (_req, res) => {
  res.json({ speakers: YARNGPT_VOICES, languages: YARNGPT_LANGUAGES });
});

router.post("/yarngpt/tts", async (req, res) => {
  const apiKey = process.env.YARNGPT_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "YARNGPT_API_KEY is not configured" });
  }

  const { text, voice = "Idera", response_format = "mp3" } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ error: "Text is required." });
  }

  const resolvedVoice = YARNGPT_VOICES.find(
    v => v.toLowerCase() === (voice as string).toLowerCase()
  ) ?? "Idera";

  try {
    const resp = await fetch(YARNGPT_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: text.trim(), voice: resolvedVoice, response_format }),
      signal: AbortSignal.timeout(60000),
    });

    if (!resp.ok) {
      const msg = await resp.text().catch(() => resp.statusText);
      throw new Error(`YarnGPT API error (${resp.status}): ${msg}`);
    }

    const buffer = Buffer.from(await resp.arrayBuffer());
    const contentType = response_format === "wav" ? "audio/wav" : "audio/mpeg";

    res.set({
      "Content-Type": contentType,
      "Content-Length": String(buffer.byteLength),
      "Cache-Control": "no-store",
    });
    res.send(buffer);
  } catch (e: any) {
    console.error("YarnGPT TTS error:", e.message);
    return res.status(500).json({ error: e.message || "Failed to generate TTS" });
  }
});

export default router;
