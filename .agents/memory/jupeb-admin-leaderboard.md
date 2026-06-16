---
name: Admin Panel & Leaderboard
description: Full admin panel structure, revenue model, anti-cheat, and leaderboard XP sync
---

## Admin Panel (/admin)
- PIN: `JUPEB2024` (hardcoded frontend + backend header `x-admin-pin`)
- 9 tabs: Overview, Students, Access Codes, Revenue, Questions, Anti-cheat, Announcements, Settings, Branding
- All backend routes under `/api/admin/*` in `artifacts/api-server/src/routes/admin.ts`

## Revenue Model
- Access codes have a `price` (₦) column on the `access_codes` table
- Revenue = `activation_count × price` per code
- View at admin Revenue tab or `GET /api/admin/revenue`

## Anti-cheat
- Quiz attempts logged in `quiz_attempts` table on every quiz result view
- Flagged if `time_spent_seconds < question_count × 4` (4s/question minimum)
- View in admin Anti-cheat tab, with filter for flagged-only

## Leaderboard
- Public at `/leaderboard`, data from `GET /api/leaderboard`
- Students table has `xp`, `streak`, `last_active` columns (server-side)
- XP synced from client to server via `POST /api/student/sync-progress` on every quiz result page load
- Client sends: phone, xp, streak, quizScore, subjectName, paperCode, questionCount, timeSpentSeconds
- Server takes MAX(server_xp, client_xp) — never decreases

## DB tables added
- `quiz_attempts` — audit log for every quiz completed
- `students.xp`, `students.streak`, `students.last_active`, `students.is_active` columns

**Why:** Revenue is code-based (offline payment → code issued), not payment gateway. Anti-cheat is advisory (flags don't block students). XP uses MAX merge to handle offline-first client state.

**How to apply:** When adding new quiz features, always fire `POST /api/student/sync-progress` after a quiz ends. Never delete quiz_attempts rows — they're an audit trail.
