import { Router } from "express";

const router = Router();

// Proxy to YarnGPT service for speakers list
router.get("/yarngpt/speakers", async (_req, res) => {
  const baseUrl = process.env.YARNGPT_URL;
  if (!baseUrl) {
    return res.status(500).json({ error: "YARNGPT_URL not configured" });
  }
  try {
    const resp = await fetch(`${baseUrl.replace(/\/$/, "")}/speakers`);
    const data = await resp.json();
    return res.json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to fetch speakers" });
  }
});

// Proxy to YarnGPT TTS endpoint
router.post("/yarngpt/tts", async (req, res) => {
  const baseUrl = process.env.YARNGPT_URL;
  if (!baseUrl) {
    return res.status(500).json({ error: "YARNGPT_URL not configured" });
  }
  try {
    const resp = await fetch(`${baseUrl.replace(/\/$/, "")}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(`YarnGPT TTS error ${resp.status}: ${msg}`);
    }
    const buffer = Buffer.from(await resp.arrayBuffer());
    res.set({
      "Content-Type": "audio/wav",
      "Content-Length": String(buffer.byteLength),
      "Cache-Control": "no-store",
    });
    res.send(buffer);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || "Failed to generate TTS" });
  }
});

export default router;
