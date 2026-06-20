# JUPEB Prep

AI-powered exam prep platform for UNILAG School of Foundation Studies students targeting 16 points in JUPEB.

## Run & Operate

- API Server workflow — runs the backend on port 3000 (build + start)
- Start application workflow — runs the React web frontend on port 5000
- Expo Mobile workflow — runs the Expo mobile app on port 8000
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only, hangs on external DBs)
- Required env: `DATABASE_URL` — Postgres connection string

## Domains

- Backend (Railway): `https://edu.achek.com.ng`
- Frontend (production): `https://prep.achek.com.ng`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (port 3000 in dev, Railway in prod)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod, drizzle-zod
- Web: React 19 + Vite + Tailwind CSS 4 + Wouter routing
- Mobile: React Native + Expo SDK 56
- AI: Google Gemini (via Replit AI integration — `AI_INTEGRATIONS_GEMINI_API_KEY`)
- Build: esbuild (API), Vite (web)

## Where things live

- `artifacts/api-server/` — Express API backend, all routes under `/api`
- `artifacts/jupeb-prep/` — React web app (student-facing + admin)
- `artifacts/jupeb-mobile/` — Expo mobile app
- `artifacts/whatsapp-bot/` — Baileys-based WhatsApp bot
- `lib/db/` — Drizzle schema (source of truth for DB shape)
- `lib/api-spec/` — OpenAPI spec, Orval codegen config
- DB schema: `lib/db/src/schema/`
- API routes: `artifacts/api-server/src/routes/`
- Theme/colors: `artifacts/jupeb-mobile/constants/colors.ts`, `artifacts/jupeb-prep/src/index.css`

## Architecture decisions

- Web frontend API calls: `import.meta.env.VITE_API_URL || ""` as base — empty string in dev (Vite proxies `/api` → localhost:3000), set to `https://edu.achek.com.ng` in production deployment
- Mobile API URL: persisted in AsyncStorage (`jupeb_api_url_v1`), defaults to `https://edu.achek.com.ng`. Configurable via Profile → App Settings → API Server URL (no rebuild needed)
- Auth: custom phone/password + Google OAuth; session token rotates on every login (kicks old device)
- Gemini keys: round-robin rotation via `artifacts/api-server/src/lib/gemini-keys.ts`; extra keys stored in `settings.json`
- CORS: `artifacts/api-server/src/app.ts` allows `prep.achek.com.ng`, `edu.achek.com.ng`, `*.replit.dev`, `localhost`

## Product

- AI-powered notes, quizzes (objective + theory), flashcards, voice teacher
- Community forums, leaderboard, XP/streak tracking
- WhatsApp bot for registration and community
- Admin panel (PIN: JUPEB2024) at `/admin`
- Paystack payment integration for access code activation

## User preferences

- No Replit branding in UI — fully branded as "JUPEB Prep" / achek.com.ng
- `APP_URL` env var = `https://prep.achek.com.ng` (used in WhatsApp notification messages)

## Gotchas

- `drizzle-kit push` hangs when DATABASE_URL points to external Aiven DB — use raw `pg` queries for migrations instead
- Gemini TTS: raw PCM (audio/L16) must be wrapped in WAV header before sending to browser
- `chunk.text` / `response.text` are getter properties (not methods) in @google/genai ≥1.x
- Mobile Expo runs on port 8000 (not 8080 — conflicts with another service)
- `settings.json` in the api-server working directory stores admin-configurable values (Gemini keys, Google OAuth client ID, etc.)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
