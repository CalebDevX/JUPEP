---
name: Gemini TTS
description: How to use Gemini 2.5 Flash TTS endpoint correctly, including format quirks
---

## Rule
Use model `gemini-2.5-flash-preview-tts` with `responseModalities: ["AUDIO"]` and a `speechConfig`. Contents must **omit the `role` field** — just `{ parts: [{ text }] }`.

**Why:** Gemini TTS models return 400 "Model tried to generate text" if the contents include `role: "user"`.

## PCM → WAV conversion
The API returns `audio/L16;codec=pcm;rate=24000` (raw 16-bit PCM). Browsers cannot play this directly. Always add a 44-byte WAV header on the server before base64-encoding and sending to the client.

## How to apply
- TTS route: `POST /api/ai/tts` in `artifacts/api-server/src/routes/ai.ts`
- Frontend: `useReadAloud` hook in `artifacts/jupeb-prep/src/hooks/useReadAloud.ts` calls `/api/ai/tts`, decodes base64 → Blob → Object URL → `<Audio>`.
- Available voices: Kore (warm), Aoede (natural), Charon (crisp), Puck (bright)
- Fallback: if server TTS fails, hook falls back to browser Web Speech API (en-NG works on Android Chrome with Google TTS engine)
