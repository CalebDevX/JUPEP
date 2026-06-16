---
name: JUPEB Community Feature
description: Community page schema, API routes, frontend, seeded data, join flow, and admin management
---

# Community Feature

## Schema
Four tables: `communities`, `community_members`, `community_posts`, `post_comments`.
Enums: `community_type` (tutorial_center|study_group|general), `member_status` (pending|approved|rejected), `member_role` (admin|moderator|member).

## API Routes (artifacts/api-server/src/routes/community.ts)
### Public
- GET /api/communities — list all
- GET /api/communities/:slug — detail with posts + members
- POST /api/communities/:slug/join — {displayName, whatsappNumber}; status is "pending" if requiresApproval
- POST /api/communities/:slug/posts — {authorName, content}
- GET/POST /api/communities/:slug/posts/:id/comments
- POST /api/communities/:slug/posts/:id/like

### Admin (require `x-admin-pin` header or `?adminPin=` query)
- GET /api/communities/pending-members — all pending join requests across all communities
- POST /api/communities/:slug/members/:id/approve — approve + increment memberCount via `sql` template literal
- DELETE /api/communities/:slug/members/:id — reject/remove

## Frontend UX (Community.tsx)
- `joinedCommunities` state: `Record<slug, displayName>` loaded from `localStorage.jupeb_joined_communities`
- After joining an open community → saved to localStorage, auto-navigates into CommunityView, `JoinModal` closes
- `CommunityCard` shows green "✓ Enter Community" button when slug is in `joinedCommunities`
- `JoinModal.onJoined` signature: `(name: string, slug: string) => void`
- `CommunityView` gets `myName` from `joinedCommunities[slug] || myName`

## Admin Tab (Admin.tsx)
"Communities" tab (9th tab) — shows pending join requests with Approve/Reject buttons. Fetches from `/api/communities/pending-members` with `x-admin-pin` header.

## Seeded Communities
1. Benzene Tutorials (tutorial_center, verified, requiresApproval=true)
2. 16 Points Gang (study_group, open)
3. JUPEB Scholars Hub (general, open) — 4 starter posts
4. UNILAG Aspirants 2026 (study_group, open)
5. Law & Arts Tutorial Kings (tutorial_center, verified, requiresApproval=true)

**Why:** WhatsApp number collected for admin approval flow; no app-level auth on community so guest name is the identity.
**How to apply:** When adding community features, always update `jupeb_joined_communities` in localStorage so the green "Enter" state persists across refreshes.
