---
name: Payments and WhatsApp Architecture
description: Paystack payment gateway + WhatsApp notification queue + session expiry system
---

## Paystack Integration
- Backend routes at `/api/payment/initialize`, `/api/payment/verify/:reference`, `/api/payment/webhook`, `/api/payment/config`
- `PAYSTACK_SECRET_KEY` env secret required (request via `requestEnvVar`)
- On successful payment: sets `students.expires_at` to `session_end_date` + 23:59:59 UTC, `payment_status='paid'`
- Queues WhatsApp confirmation notification automatically
- Session price stored in `app_settings` key `session_price` (in kobo), default 500000 (₦5,000)

## Session Expiry
- `session_end_date` stored in `app_settings` table, default `2026-08-31`
- Students table has `expires_at TIMESTAMPTZ` and `payment_status TEXT DEFAULT 'unpaid'`
- Login response includes `expiresAt`, `sessionActive`, `paymentStatus` fields
- Frontend: `App.tsx` checks `profile.expiresAt` in `RequireAuth`; shows `<SessionExpiredGate />` if expired
- Subscribe page at `/subscribe`, payment callback at `/payment/callback`

## WhatsApp Bot (Queue-based)
- `@whiskeysockets/baileys` blocked by Replit package firewall — bot runs externally
- DB tables: `wa_notifications` (queue), `wa_bot_state` (single row id=1)
- Bot reports QR to `POST /api/bot/report-qr` (auth: `x-bot-secret` header = `BOT_SECRET` env)
- Bot reports connected to `POST /api/bot/report-connected`, disconnected to `POST /api/bot/report-disconnected`
- Bot polls `GET /api/bot/pending-messages` every 10s and sends notifications
- Bot marks sent/failed via `PATCH /api/bot/notifications/:id`
- Admin panel polls `/api/bot/status` every 5s (WhatsApp tab)
- QR code displayed via qrserver.com API: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=<encoded>`
- QR expires after 60 seconds

## Admin Panel
- WhatsApp tab: bot status, QR display, broadcast to active/expired students, notification log
- Settings tab: session price (₦ input with kobo conversion) + session end date pickers
- Session settings saved to `app_settings` DB table via `/api/settings` (key `session_price`, `session_end_date`)

## DB Schema
- `payments(id, phone, student_name, amount, reference, status, channel, paid_at, created_at)`
- `wa_notifications(id, phone, message, status, created_at, sent_at)`
- `wa_bot_state(id PRIMARY KEY DEFAULT 1, status, qr_code, qr_expires_at, phone_number, updated_at)`
- `app_settings(key TEXT PRIMARY KEY, value TEXT)` — also stores timer settings via settings.ts

**Why:** `baileys` is blocked by Replit firewall (403 from package-firewall.replit.local). Queue-based approach decouples the bot from the platform.

**How to apply:** To add a new notification trigger, INSERT into `wa_notifications` with `status='pending'`. The bot will pick it up within 10 seconds of next poll cycle.
