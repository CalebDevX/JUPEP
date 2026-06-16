# YarnGPT TTS Service

A FastAPI microservice that wraps [YarnGPT2](https://github.com/saheedniyi02/yarngpt) for Nigerian-accent text-to-speech. Deploy on Railway with a GPU instance.

## Deploy on Railway

### 1. Create a new Railway service

In the Railway dashboard:
- **New Project → Deploy from GitHub repo** (push this folder to its own repo, or a monorepo)
- Or use Railway CLI: `railway up` inside `services/yarngpt/`

### 2. Add a Volume (recommended)

Add a Railway Volume mounted at `/models` so the ~600 MB WavTokenizer checkpoint persists across deploys and doesn't re-download every time.

### 3. Select a GPU instance

Go to **Service → Settings → Instance Type** and pick a GPU instance (e.g. **L4** or **A10G**). YarnGPT needs a GPU for fast inference (~2–5 seconds per request). CPU-only will work but is very slow (~3–5 minutes).

### 4. Copy your Railway URL

Once deployed, Railway gives you a public URL like:
```
https://yarngpt-tts-production.up.railway.app
```

### 5. Set it as a secret in your JUPEB app

In your JUPEB Replit project → Secrets:
```
YARNGPT_URL = https://yarngpt-tts-production.up.railway.app
```

The JUPEB app will automatically use your Railway instance instead of the free HuggingFace Gradio space.

## API

### `GET /health`
Returns service status and device info.

### `GET /speakers`
Returns available speakers and languages.

### `POST /tts`
```json
{
  "text": "The election was won by Moshood Abiola…",
  "speaker": "idera",
  "language": "english"
}
```
Returns `audio/wav` binary.

## Available speakers
idera, jide, tolu, emma, zainab, joke, adaeze, umar, chisom, remi, amaka, kemi, ngozi, kehinde, taiwo

## Available languages
english, yoruba, igbo, hausa, pidgin
