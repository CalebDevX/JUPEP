import { Router } from "express";
import { db } from "@workspace/db";
import {
  communitiesTable, communityMembersTable, communityPostsTable, postCommentsTable,
} from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";

const router = Router();

router.get("/communities", async (req, res) => {
  try {
    const communities = await db.select().from(communitiesTable).orderBy(desc(communitiesTable.memberCount));
    res.json(communities);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch communities" });
  }
});

router.get("/communities/:slug", async (req, res) => {
  try {
    const [community] = await db.select().from(communitiesTable).where(eq(communitiesTable.slug, req.params.slug));
    if (!community) return res.status(404).json({ error: "Community not found" });

    const posts = await db.select().from(communityPostsTable)
      .where(eq(communityPostsTable.communityId, community.id))
      .orderBy(desc(communityPostsTable.createdAt))
      .limit(50);

    const members = await db.select().from(communityMembersTable)
      .where(and(eq(communityMembersTable.communityId, community.id), eq(communityMembersTable.status, "approved")))
      .orderBy(communityMembersTable.joinedAt)
      .limit(20);

    res.json({ ...community, posts, members });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch community" });
  }
});

router.get("/communities/:slug/posts/:postId/comments", async (req, res) => {
  try {
    const comments = await db.select().from(postCommentsTable)
      .where(eq(postCommentsTable.postId, parseInt(req.params.postId)))
      .orderBy(postCommentsTable.createdAt);
    res.json(comments);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch comments" });
  }
});

router.post("/communities/:slug/join", async (req, res) => {
  try {
    const { displayName, whatsappNumber } = req.body;
    if (!displayName?.trim() || !whatsappNumber?.trim()) {
      return res.status(400).json({ error: "Display name and WhatsApp number are required" });
    }

    const [community] = await db.select().from(communitiesTable).where(eq(communitiesTable.slug, req.params.slug));
    if (!community) return res.status(404).json({ error: "Community not found" });

    const status = community.requiresApproval ? "pending" : "approved";
    const [member] = await db.insert(communityMembersTable).values({
      communityId: community.id,
      displayName: displayName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      role: "member",
      status,
    }).returning();

    if (status === "approved") {
      await db.update(communitiesTable)
        .set({ memberCount: community.memberCount + 1 })
        .where(eq(communitiesTable.id, community.id));
    }

    res.status(201).json({ member, status, requiresApproval: community.requiresApproval });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to join community" });
  }
});

router.post("/communities/:slug/posts", async (req, res) => {
  try {
    const { authorName, content } = req.body;
    if (!authorName?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "Author name and content are required" });
    }

    const [community] = await db.select().from(communitiesTable).where(eq(communitiesTable.slug, req.params.slug));
    if (!community) return res.status(404).json({ error: "Community not found" });

    const [post] = await db.insert(communityPostsTable).values({
      communityId: community.id,
      authorName: authorName.trim(),
      content: content.trim(),
    }).returning();

    await db.update(communitiesTable)
      .set({ postCount: community.postCount + 1 })
      .where(eq(communitiesTable.id, community.id));

    res.status(201).json(post);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create post" });
  }
});

router.post("/communities/:slug/posts/:postId/comments", async (req, res) => {
  try {
    const { authorName, content } = req.body;
    if (!authorName?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "Author name and content are required" });
    }

    const postId = parseInt(req.params.postId);
    const [comment] = await db.insert(postCommentsTable).values({
      postId,
      authorName: authorName.trim(),
      content: content.trim(),
    }).returning();

    await db.update(communityPostsTable)
      .set({ commentCount: sql`${communityPostsTable.commentCount} + 1` })
      .where(eq(communityPostsTable.id, postId));

    res.status(201).json(comment);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to add comment" });
  }
});

router.post("/communities/:slug/posts/:postId/like", async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const [post] = await db.select().from(communityPostsTable).where(eq(communityPostsTable.id, postId));
    if (!post) return res.status(404).json({ error: "Post not found" });

    const [updated] = await db.update(communityPostsTable)
      .set({ likeCount: post.likeCount + 1 })
      .where(eq(communityPostsTable.id, postId))
      .returning();

    res.json({ likeCount: updated.likeCount });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to like post" });
  }
});

// ── Admin: pending member management ────────────────────────────────────────

const ADMIN_PIN = process.env.ADMIN_PIN || "JUPEB2024";

function requireAdminPin(req: any, res: any): boolean {
  const pin = req.headers["x-admin-pin"] || req.query.adminPin;
  if (pin !== ADMIN_PIN) { res.status(401).json({ error: "Unauthorized" }); return false; }
  return true;
}

router.get("/communities/pending-members", async (req, res) => {
  if (!requireAdminPin(req, res)) return;
  try {
    const rows = await db
      .select({
        id: communityMembersTable.id,
        communityId: communityMembersTable.communityId,
        displayName: communityMembersTable.displayName,
        whatsappNumber: communityMembersTable.whatsappNumber,
        role: communityMembersTable.role,
        status: communityMembersTable.status,
        joinedAt: communityMembersTable.joinedAt,
        communityName: communitiesTable.name,
        communitySlug: communitiesTable.slug,
      })
      .from(communityMembersTable)
      .innerJoin(communitiesTable, eq(communityMembersTable.communityId, communitiesTable.id))
      .where(eq(communityMembersTable.status, "pending"))
      .orderBy(desc(communityMembersTable.joinedAt));
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/communities/:slug/members/:memberId/approve", async (req, res) => {
  if (!requireAdminPin(req, res)) return;
  try {
    const memberId = parseInt(req.params.memberId);
    const [member] = await db.select().from(communityMembersTable).where(eq(communityMembersTable.id, memberId));
    if (!member) return res.status(404).json({ error: "Member not found" });

    await db.update(communityMembersTable)
      .set({ status: "approved" })
      .where(eq(communityMembersTable.id, memberId));

    // Increment member count
    await db.update(communitiesTable)
      .set({ memberCount: sql`${communitiesTable.memberCount} + 1` })
      .where(eq(communitiesTable.id, member.communityId));

    res.json({ success: true, message: "Member approved" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/communities/:slug/members/:memberId", async (req, res) => {
  if (!requireAdminPin(req, res)) return;
  try {
    const memberId = parseInt(req.params.memberId);
    await db.delete(communityMembersTable).where(eq(communityMembersTable.id, memberId));
    res.json({ success: true, message: "Member removed" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Bot endpoint — auto-join community by phone number (called by WhatsApp bot)
router.post("/community/bot-join", async (req, res) => {
  const botSecret = req.headers["x-bot-secret"];
  if (botSecret !== (process.env.BOT_SECRET ?? "jupeb-bot-secret")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const { phone, communityId } = req.body;
    if (!phone?.trim() || !communityId) {
      return res.status(400).json({ error: "phone and communityId are required" });
    }

    const [community] = await db.select().from(communitiesTable).where(eq(communitiesTable.id, Number(communityId)));
    if (!community) return res.status(404).json({ error: "Community not found" });

    const status = community.requiresApproval ? "pending" : "approved";
    const [member] = await db.insert(communityMembersTable).values({
      communityId: community.id,
      displayName: phone.trim(),
      whatsappNumber: phone.trim(),
      role: "member",
      status,
    }).returning();

    if (status === "approved") {
      await db.update(communitiesTable)
        .set({ memberCount: community.memberCount + 1 })
        .where(eq(communitiesTable.id, community.id));
    }

    res.status(201).json({ success: true, member, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to join community" });
  }
});

export default router;
