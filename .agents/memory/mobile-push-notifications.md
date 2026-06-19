---
name: Push Notifications (Mobile)
description: How push notifications work in the JUPEB mobile app — token registration, personalized scheduling, and streak protection.
---

# Push Notifications

## Database
- `expo_push_token TEXT` column on `students` table (added via ALTER TABLE IF NOT EXISTS in notifications.ts)
- `push_notifications` table logs all admin broadcasts

## API endpoints
- `POST /api/notifications/register-token` — stores Expo push token (requires phone + sessionToken)
- `POST /api/notifications/send` — admin broadcast to all/activated/free students
- `POST /api/notifications/send-daily-challenge` — personalized per-student blast (rank-aware messages)
- `GET /api/student/rank?phone=&token=` — returns `{ rank, xp, streak, last_active, xpToNext, nextRank, totalStudents }`
- `GET /api/notifications/history` — admin log
- `GET /api/notifications/stats` — registered device counts

## Mobile scheduling (app/_layout.tsx)
`PushTokenRegistrar` component runs once per login:
1. Requests notification permissions
2. Gets Expo push token → registers with API
3. Calls `reschedulePersonalizedNotification(phone, sessionToken)`

`reschedulePersonalizedNotification`:
1. Fetches `/api/student/rank` for live rank data
2. Cancels any existing 9 AM and 10 PM scheduled notifications
3. Schedules **9 AM personalised daily challenge** (rank-aware message)
4. Checks `last_active` vs today's date:
   - If NOT practiced today → schedules **10 PM streak-protection** reminder
   - If practiced today → no 10 PM notification (student is safe)

## Message tiers (9 AM)
- Rank 1: "You're #1, [Name]! Keep your streak alive"
- Rank 2–3: "Only X XP from #N above you"
- Rank 4–10: "#N → #N-1 is X XP away"
- Rank 11–20: "Top 10 in sight — earn X XP"
- Rank 21–100: "Climb from #N — practice now"
- Unranked: "Appear on the leaderboard"

## Admin panel
Push Alerts tab at `/admin` (PIN: JUPEB2024):
- Stats (registered devices, activated, free)
- "Send Daily Challenge" button — triggers personalized blast
- Custom broadcast form (all/activated/free)
- Notification history log

**Why `EAS_NO_VCS=1`:** See eas-apk-build.md
