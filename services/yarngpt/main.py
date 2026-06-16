import os
import io
import sys
import torch
import torchaudio
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from contextlib import asynccontextmanager

sys.path.insert(0, "/app/yarngpt")
from yarngpt.audiotokenizer import AudioTokenizerV2
from transformers import AutoModelForCausalLM

MODEL_DIR = os.getenv("MODEL_DIR", "/models")
TOKENIZER_PATH = "saheedniyi/YarnGPT2"
WAV_CONFIG = os.path.join(MODEL_DIR, "wavtokenizer.yaml")
WAV_CHECKPOINT = os.path.join(MODEL_DIR, "wavtokenizer.ckpt")

SPEAKERS = [
    "idera", "jide", "tolu", "emma", "zainab",
    "joke", "adaeze", "umar", "chisom", "remi",
    "amaka", "kemi", "ngozi", "kehinde", "taiwo",
]
LANGUAGES = ["english", "yoruba", "igbo", "hausa", "pidgin"]

audio_tokenizer = None
model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global audio_tokenizer, model
    print("Loading YarnGPT models…")
    audio_tokenizer = AudioTokenizerV2(TOKENIZER_PATH, WAV_CHECKPOINT, WAV_CONFIG)
    model = AutoModelForCausalLM.from_pretrained(
        TOKENIZER_PATH, torch_dtype="auto"
    ).to(audio_tokenizer.device)
    print(f"Models loaded on {audio_tokenizer.device}")
    yield
    print("Shutting down.")


app = FastAPI(title="YarnGPT TTS Service", lifespan=lifespan)


class TTSRequest(BaseModel):
    text: str
    speaker: str = "idera"
    language: str = "english"


@app.get("/health")
def health():
    return {
        "ok": True,
        "model_loaded": model is not None,
        "device": str(audio_tokenizer.device) if audio_tokenizer else None,
    }


@app.get("/speakers")
def speakers():
    return {"speakers": SPEAKERS, "languages": LANGUAGES}


@app.post("/tts")
async def tts(req: TTSRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text is required")
    if len(req.text) > 1500:
        raise HTTPException(status_code=400, detail="text too long — max 1500 characters")
    if model is None or audio_tokenizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")

    speaker = req.speaker if req.speaker in SPEAKERS else "idera"
    language = req.language if req.language in LANGUAGES else "english"

    try:
        prompt = audio_tokenizer.create_prompt(
            req.text.strip(), lang=language, speaker_name=speaker
        )
        input_ids = audio_tokenizer.tokenize_prompt(prompt)

        with torch.no_grad():
            output = model.generate(
                input_ids=input_ids,
                temperature=0.1,
                repetition_penalty=1.1,
                max_length=4000,
            )

        codes = audio_tokenizer.get_codes(output)
        audio = audio_tokenizer.get_audio(codes)

        buf = io.BytesIO()
        torchaudio.save(buf, audio, sample_rate=24000, format="wav")
        buf.seek(0)

        return Response(
            content=buf.read(),
            media_type="audio/wav",
            headers={"Cache-Control": "no-store"},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
