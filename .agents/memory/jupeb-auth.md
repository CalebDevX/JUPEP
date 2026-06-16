---
name: JUPEB Auth System
description: Registration, login, auth guard, session tokens, and student profile storage for JUPEB Prep
---

## Auth flow
- **Register**: `POST /api/auth/register` — validates access code, creates row in `students` table, generates UUID session token, returns `profile` JSON
- **Login**: `POST /api/auth/login` — looks up student by phone, regenerates session token (invalidates prior device), returns `profile` JSON
- **Verify**: `GET /api/auth/verify-session?phone=X` with `x-session-token: <token>` header — returns `{valid: bool}`
- Profile stored in `localStorage.jupeb_profile`; session token in `localStorage.jupeb_session_token`

## Profile shape
```ts
{
  fullName, firstName, phone, email: string|null,
  subjects: string[], targetUniversity: string|null,
  targetGrade: "aaa1"|"aab1"|"bbb1"|"ccc1",
  accessCode: string, expiresAt: string|null,
  sessionActive: bool, paymentStatus: "unpaid"|"paid",
  sessionToken: string,  // UUID — changes on every login
}
```

## 1-device-per-account
Each login generates a new `session_token` UUID, overwriting the previous one in the DB. `RequireAuth` in App.tsx calls `/api/auth/verify-session` on mount; if `valid: false` → auto sign-out, keeping only `jupeb_profile_picture`. Column added with `ALTER TABLE students ADD COLUMN IF NOT EXISTS session_token TEXT` (non-blocking, runs at startup in auth.ts).

## Auth guard (App.tsx)
`RequireAuth` redirects to `/auth` if `jupeb_profile` absent, then async-verifies the session token. Fail-open on network errors (so DB issues don't lock users out).

## Logout / Sign Out (Settings.tsx)
`handleLogout` → `localStorage.clear()` then restores only `jupeb_profile_picture`, redirects to `/auth`.
`handleClearData` → keeps profile, session token, picture, community membership — clears quiz cache only.

**Why:** Phone-based auth (no passwords), profile is localStorage-first; session token is the only way to enforce 1-device-at-a-time.
**How to apply:** Always read profile from `localStorage.jupeb_profile`. Store session token at all login/register sites in Auth.tsx.
