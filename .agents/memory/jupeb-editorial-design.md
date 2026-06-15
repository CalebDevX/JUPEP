---
name: JUPEB Editorial Design System
description: Editorial typography-first design direction chosen by user; Fraunces serif + CSS utilities
---

The app uses an **editorial / dark academic** visual direction (confirmed by user).

**Font setup:**
- Fraunces variable serif (ital + opsz + wght 100-900) is already imported in `index.css` line 1 via Google Fonts
- Tailwind `font-serif` maps to `--app-font-serif: 'Fraunces', Georgia, serif`
- Use `font-serif font-light` or `font-serif font-normal` for display headings (lighter weights look best in Fraunces)
- Italic variant (`italic` or `font-serif italic`) is expressive — use for names/callouts

**CSS utility classes** (defined at end of `index.css`):
- `.ed-label` — 10px, uppercase, tracked, low-opacity label for section headings
- `.ed-display` — Fraunces light, tight tracking, 1.08 line-height for hero display text
- `.ed-stat` — Fraunces light for large numeric/stat callouts
- `.ed-rule` — horizontal-rule section divider with centered text

**Image keys in localStorage:**
- `jupeb_bot_image` — custom LexBot/bot avatar image (set from Admin → Branding tab)
- `jupeb_profile_picture` — user profile photo (set from Settings page)

**Component patterns:**
- `UserAvatar` in Shell.tsx — renders profile pic or gradient initial, accepts size sm/md/lg
- `BotAvatar` in Chat.tsx — renders bot image or Sparkles icon, accepts size sm/md/lg
- `UserBubbleAvatar` in Chat.tsx — renders user pic in message bubbles

**Admin Branding tab:**
- Route: `/admin` → PIN: JUPEB2024 → tab "🎨 Branding"
- Uploads bot image (base64, max 2MB) to localStorage `jupeb_bot_image`
- Live preview shows chat header + message bubble with the image

**Dashboard hero:**
- Uses `.ed-display` at ~3.5rem for large "Good [time], [FirstName]." heading
- Italic Fraunces for first name in amber tint
- Ed-label date line: "Monday, June 15 · JUPEB Law Prep"
- Right-aligned "AAA+1 / 16 Points" callout using `.ed-stat`

**Why:** User confirmed editorial direction — "serif fonts, magazine feel". Fraunces was already in the CSS import so no new dependency needed.
