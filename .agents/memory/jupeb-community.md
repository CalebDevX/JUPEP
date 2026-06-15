---
name: JUPEB Community Feature
description: Community page schema, API routes, frontend, seeded data, and guest join flow
---

# Community Feature

## Schema (lib/db/src/schema/communities.ts)
Four tables: `communities`, `community_members`, `community_posts`, `post_comments`. Enums: `community_type` (tutorial_center|study_group|general), `member_status` (pending|approved|rejected), `member_role` (admin|moderator|member).

## API Routes (artifacts/api-server/src/routes/community.ts)
- GET /api/communities — list all
- GET /api/communities/:slug — detail with posts + members
- POST /api/communities/:slug/join — {displayName, whatsappNumber}; status is "pending" if requiresApproval
- POST /api/communities/:slug/posts — {authorName, content}
- GET /api/communities/:slug/posts/:id/comments
- POST /api/communities/:slug/posts/:id/comments — {authorName, content}
- POST /api/communities/:slug/posts/:id/like

## Seeded Communities
1. Benzene Tutorials (tutorial_center, verified, requiresApproval=true, +2348012345678, benzenetutorials.org)
2. 16 Points Gang (study_group, open)
3. JUPEB Scholars Hub (general, open) — has 4 starter posts seeded
4. UNILAG Aspirants 2026 (study_group, open)
5. Law & Arts Tutorial Kings (tutorial_center, verified, requiresApproval=true)

## Guest UX
No user auth — users enter displayName + whatsappNumber to join. Name stored in `localStorage("jupeb_community_name")`. Shown in header, clearable with X button.

**Why:** App has no auth system yet; WhatsApp number collected for admin contact on approval.
