# JUPEB Prep

AI-powered exam preparation platform for UNILAG School of Foundation Studies students targeting 16 points in JUPEB.

**Live URLs**
- Web app: [prep.achek.com.ng](https://prep.achek.com.ng)
- API backend: [edu.achek.com.ng](https://edu.achek.com.ng)

---

## What it does

- AI-generated notes, quizzes (objective + theory), and flashcards per subject
- Voice teacher with Nigerian-accent audio (YarnGPT)
- Past questions database with timed exam mode
- Community forums with leaderboard and XP/streak tracking
- WhatsApp bot for registration and broadcast messages
- Paystack payment integration for access code activation
- Admin panel at `/admin` (PIN: `JUPEB2024`)

---

## Project structure

This is a **pnpm monorepo**. Everything lives under two top-level folders:

```
artifacts/
  api-server/       Express 5 API backend — all routes under /api
  jupeb-prep/       React web app (students + admin panel)
  jupeb-mobile/     Expo (React Native) Android/iOS app
  whatsapp-bot/     Baileys WhatsApp bot
  crs003-textbook/  CRS 003 standalone textbook web app

lib/
  db/               Drizzle ORM schema — source of truth for DB shape
  api-spec/         OpenAPI spec + Orval codegen config
  api-zod/          Shared Zod validation schemas
  api-client-react/ Shared React Query hooks (web + mobile)
  integrations-gemini-ai/  Gemini AI wrapper (batching, image)
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20, TypeScript 5.9 |
| Monorepo | pnpm workspaces |
| API | Express 5, Pino logging |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod, drizzle-zod |
| Web frontend | React 19, Vite, Tailwind CSS 4, Wouter |
| Mobile | React Native, Expo SDK 56 |
| AI | Google Gemini (`@google/genai`) |
| Voice | YarnGPT (Nigerian-accent TTS) |
| Payments | Paystack |
| Build | esbuild (API), Vite (web) |

---

## Running locally (Replit)

Three workflows run in parallel:

| Workflow | What it does | Port |
|---|---|---|
| **API Server** | Builds + starts the Express backend | 3000 |
| **Start application** | Starts the React web dev server | 5000 |
| **Expo Mobile** | Starts Expo in web mode | 8000 |

The web app proxies all `/api` requests to `localhost:3000` in development, so you only need to open port 5000.

### Other useful commands

```bash
# Install all workspace dependencies
pnpm install

# Typecheck everything
pnpm run typecheck

# Build all packages
pnpm run build

# Push DB schema changes (dev only — hangs on external DBs)
pnpm --filter @workspace/db run push
```

---

## Environment variables & secrets

| Name | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | Secret | PostgreSQL connection string |
| `AI_INTEGRATIONS_GEMINI_API_KEY` | Auto (Replit) | Google Gemini AI |
| `PAYSTACK_SECRET_KEY` | Secret | Paystack payments |
| `YARNGPT_API_KEY` | Secret | Nigerian-accent TTS |
| `BOT_SECRET` | Env var | WhatsApp bot auth |
| `APP_URL` | Env var | Used in WhatsApp notification links |

Additional Gemini API keys (for round-robin rotation when one hits its quota) are managed in the **Admin panel → Settings → Gemini AI Keys**.

---

## Architecture decisions

**API routing**
All API endpoints are mounted under `/api` on the Express server. Mobile and web clients must use the `/api` prefix — e.g. `https://edu.achek.com.ng/api/auth/register`.

**Web API base URL**
`import.meta.env.VITE_API_URL || ""` — empty string in dev (Vite proxies `/api` to port 3000), set to `https://edu.achek.com.ng` in production.

**Mobile API URL**
Defaults to `https://edu.achek.com.ng`. Stored in AsyncStorage (`jupeb_api_url_v1`). Changeable at runtime via Profile → App Settings → API Server URL — no rebuild needed.

**Auth**
Custom phone + password system. Google OAuth supported. Session token rotates on every login, kicking any previously logged-in device.

**Gemini key rotation**
Multiple Gemini API keys stored as a JSON array in `artifacts/api-server/settings.json` under `gemini_api_keys`. The server rotates through them round-robin on every AI request. The Replit environment key (`AI_INTEGRATIONS_GEMINI_API_KEY`) is always prepended as the first key.

**CORS**
Allows `prep.achek.com.ng`, `edu.achek.com.ng`, `*.replit.dev`, and `localhost`.

---

## Database

PostgreSQL managed by Replit. Schema defined with Drizzle ORM in `lib/db/src/schema/`. The `students` table is managed via raw SQL (not in the Drizzle schema).

To apply schema changes, use raw `pg` queries — `drizzle-kit push` hangs when pointing at the external Aiven database.

---

## Building the Android APK

Builds run on Expo's EAS cloud servers. From the Replit shell:

```bash
cd artifacts/jupeb-mobile && \
  EAS_NO_VCS=1 EXPO_TOKEN="$EXPO_TOKEN" \
  $(which eas) build --platform android --profile preview --non-interactive --no-wait
```

- `preview` profile → direct-download **APK** (sideloading / testing)
- `production` profile → **AAB** (Play Store submission)
- Build status and download link: [expo.dev/accounts/achek-team/projects/jupeb-mobile](https://expo.dev/accounts/achek-team/projects/jupeb-mobile)

`EXPO_TOKEN` is stored as a Replit secret and available automatically as `$EXPO_TOKEN`.

---

## Admin panel

Available at `/admin` on the web app. PIN: `JUPEB2024`

Tabs: Students · Questions · Access Codes · Announcements · Communities · Leaderboard · Textbook · WhatsApp Bot · Settings

Settings tab lets you configure: Gemini API key pool, session price, session end date, exam timer durations, APK download URL, and Google OAuth client ID.

---

## Paper labels

| Code | Exam |
|---|---|
| 001 | 1st In-Course |
| 002 | 1st Semester |
| 003 | 2nd In-Course |
| 004 | 2nd Semester |
| mock | Mock Exam (combines 001–004) |
| jupeb | JUPEB Final |
