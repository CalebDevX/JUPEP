---
name: PostgreSQL DB Setup
description: How the JUPEB app connects to and initializes its PostgreSQL database
---

## Rule
The database is **Replit-managed PostgreSQL** — it does NOT support SSL.

**Why:** When SSL was forced (`ssl: { rejectUnauthorized: false }`), the server rejected with "The server does not support SSL connections". Connecting without SSL (bare `connectionString`) works.

**How to apply:**
- Raw migration scripts: use `new Pool({ connectionString })` — no `ssl` option
- lib/db (`@workspace/db`) has `ssl: { rejectUnauthorized: false }` but it still connects — pg may silently fall back; don't copy that pattern for scripts
- Run raw migrations with: `node -e "..."` using the pnpm-store pg binary: `require('/home/runner/workspace/node_modules/.pnpm/pg@8.20.0/node_modules/pg')`

## Schema notes
- `students` table is **not in the drizzle schema** — created by raw SQL (migration script or manually)
- drizzle-kit push **hangs indefinitely** — use raw `pool.query()` scripts instead
- All other tables are in `lib/db/src/schema/index.ts` and should be created via raw SQL migration

## Table creation order (FK dependencies)
1. Enums (community_type, member_status, member_role)
2. students, subjects
3. questions (→ subjects), notes (→ subjects), quiz_sessions (→ subjects)
4. access_codes, device_tokens, payments, announcements
5. communities → community_members → community_posts → post_comments
6. wa_notifications, wa_bot_state, app_settings, otp_codes, push_notifications
7. conversations, messages (→ conversations)
8. wrong_answers (→ questions, subjects), bookmarks, referrals

## New feature tables added (June 2026)
- `wrong_answers` — tracks incorrect quiz answers per student
- `bookmarks` — saves questions/notes per student
- `referrals` — referral codes with status + reward_days
