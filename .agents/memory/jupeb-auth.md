---
name: JUPEB Auth System
description: Registration, login, auth guard, and student profile storage for JUPEB Prep
---

## Auth flow
- **Register**: `POST /api/auth/register` — validates access code from `access_codes` table, creates row in `students` table, returns `profile` JSON
- **Login**: `POST /api/auth/login` — looks up student by phone number, returns `profile` JSON
- Profile stored in `localStorage.jupeb_profile` as JSON

## Profile shape
```ts
{
  fullName: string;
  firstName: string;
  phone: string;
  email: string | null;
  subjects: string[];        // full names e.g. ["Economics", "Mathematics"]
  targetUniversity: string | null;
  targetGrade: "aaa1"|"aab1"|"bbb1"|"ccc1";
  accessCode: string;
}
```

## Auth guard (App.tsx)
`RequireAuth` component uses `useEffect` + `useLocation` to redirect to `/register` if `jupeb_profile` is absent. `/register` and `/login` are public routes outside the guard.

## Access codes
Seeded: `JUPEB2025` (500 uses), `DEMO001` (50 uses), `FOUNDER01` (20 uses).

## Logout
Both Shell.tsx logout handlers remove `jupeb_profile` (and other keys) then navigate to `/register`.

**Why:** Auth is phone-based (no passwords), profile is localStorage-first for offline use, backend is the source of truth for registration.

**How to apply:** Always read profile from `localStorage.jupeb_profile` (not `jupeb_display_name`). When adding new pages that need the student's name/subjects, parse `jupeb_profile`.
