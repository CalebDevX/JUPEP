import { Router } from "express";

const router = Router();

router.post("/api/tts", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Text is required." });
  }

  if (text.length > 1500) {
    return res.status(400).json({ error: "Text too long. Please keep it under 1500 characters." });
  }

  const hfToken = process.env.HUGGINGFACE_TOKEN;
  if (!hfToken) {
    return res.status(503).json({
      error: "Voice AI not configured. Please add your HUGGINGFACE_TOKEN to environment secrets.",
      code: "NO_HF_TOKEN",
    });
  }

  try {
    let audioBuffer: ArrayBuffer | null = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      const response = await fetch(
        "https://api-inference.huggingface.co/models/saheedniyi/YarnGPT2",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
            "Accept": "audio/flac, audio/wav, audio/*",
          },
          body: JSON.stringify({ inputs: text.trim() }),
        }
      );

      if (response.status === 503) {
        const errBody = await response.json().catch(() => ({})) as any;
        const waitTime = errBody?.estimated_time ? Math.min(errBody.estimated_time * 1000, 20000) : 8000;
        if (attempts < maxAttempts) {
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }
        return res.status(503).json({ error: "Voice model is warming up — please try again in a moment.", code: "MODEL_LOADING" });
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => "Unknown error");
        return res.status(502).json({ error: `Voice service error: ${errText}` });
      }

      audioBuffer = await response.arrayBuffer();
      break;
    }

    if (!audioBuffer) {
      return res.status(500).json({ error: "Failed to generate audio." });
    }

    const contentType = "audio/flac";
    res.set({
      "Content-Type": contentType,
      "Content-Length": audioBuffer.byteLength.toString(),
      "Cache-Control": "no-store",
    });
    res.send(Buffer.from(audioBuffer));
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal error generating audio." });
  }
});

export default router;
