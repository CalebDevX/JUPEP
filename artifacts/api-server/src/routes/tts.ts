import { Router } from "express";

const router = Router();

const SPACE = "https://saheedniyi-yarngpt.hf.space";

export const YARNGPT_SPEAKERS = [
  "idera", "jide", "tolu", "emma", "zainab",
  "joke", "adaeze", "umar", "chisom", "remi",
  "amaka", "kemi", "ngozi", "kehinde", "taiwo",
];

export const YARNGPT_LANGUAGES = ["english", "yoruba", "igbo", "hausa", "pidgin"];

function randomHash(len = 12) {
  return Math.random().toString(36).substring(2, 2 + len);
}

async function callGradioNewAPI(text: string, language: string, speaker: string): Promise<Buffer> {
  const joinRes = await fetch(`${SPACE}/call/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: [text.trim(), language, speaker] }),
    signal: AbortSignal.timeout(20000),
  });

  if (!joinRes.ok) throw new Error(`Gradio join failed (${joinRes.status})`);
  const { event_id } = await joinRes.json() as { event_id: string };
  if (!event_id) throw new Error("No event_id from Gradio");

  const sseRes = await fetch(`${SPACE}/call/predict/${event_id}`, {
    signal: AbortSignal.timeout(120000),
  });
  if (!sseRes.ok) throw new Error(`Gradio SSE failed (${sseRes.status})`);

  return await parseGradioSSE(sseRes);
}

async function callGradioQueueAPI(text: string, language: string, speaker: string): Promise<Buffer> {
  const sessionHash = randomHash();

  const joinRes = await fetch(`${SPACE}/queue/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [text.trim(), language, speaker],
      fn_index: 0,
      session_hash: sessionHash,
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!joinRes.ok) throw new Error(`Queue join failed (${joinRes.status})`);

  const sseRes = await fetch(`${SPACE}/queue/data?session_hash=${sessionHash}`, {
    signal: AbortSignal.timeout(120000),
  });
  if (!sseRes.ok) throw new Error(`Queue SSE failed (${sseRes.status})`);

  return await parseGradioSSE(sseRes);
}

async function parseGradioSSE(sseRes: Response): Promise<Buffer> {
  const reader = sseRes.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let audioUrl: string | null = null;
  let b64Audio: string | null = null;

  outer: while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (!raw || raw === "null") continue;

      let event: any;
      try { event = JSON.parse(raw); } catch { continue; }

      const msg: string = event.msg ?? event.status ?? "";

      if (msg === "process_completed" || msg === "complete") {
        const output = event.output?.data?.[0] ?? event.data?.[0];
        if (output?.url) {
          audioUrl = output.url.startsWith("http")
            ? output.url
            : `${SPACE}${output.url}`;
        } else if (output?.path) {
          audioUrl = `${SPACE}/file=${output.path}`;
        } else if (output?.name) {
          audioUrl = `${SPACE}/file=${output.name}`;
        } else if (typeof output === "string" && output.startsWith("data:audio")) {
          b64Audio = output.split(",")[1];
        }
        break outer;
      }

      if (msg === "queue_full") throw new Error("YarnGPT is busy — please try again in a moment.");
      if (msg === "error") throw new Error(event.output?.error ?? "YarnGPT error");
    }
  }
  reader.cancel().catch(() => {});

  if (b64Audio) return Buffer.from(b64Audio, "base64");

  if (!audioUrl) throw new Error("No audio in YarnGPT response");

  const audioRes = await fetch(audioUrl, { signal: AbortSignal.timeout(30000) });
  if (!audioRes.ok) throw new Error(`Audio download failed (${audioRes.status})`);
  return Buffer.from(await audioRes.arrayBuffer());
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

  try {
    let audioBuffer: Buffer;
    try {
      audioBuffer = await callGradioNewAPI(text, lang, spk);
    } catch (e1: any) {
      console.warn("YarnGPT new API failed, trying queue API:", e1.message);
      audioBuffer = await callGradioQueueAPI(text, lang, spk);
    }

    res.set({
      "Content-Type": "audio/wav",
      "Content-Length": String(audioBuffer.byteLength),
      "Cache-Control": "no-store",
    });
    res.send(audioBuffer);
  } catch (err: any) {
    console.error("YarnGPT TTS error:", err.message);
    const isBusy = err.message?.toLowerCase().includes("busy");
    res.status(isBusy ? 503 : 500).json({
      error: err.message || "Failed to generate audio.",
      code: isBusy ? "MODEL_LOADING" : "TTS_ERROR",
    });
  }
});

export default router;
