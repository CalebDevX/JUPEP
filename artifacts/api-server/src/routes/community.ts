import { Router } from "express";
import { db } from "@workspace/db";
import {
  communitiesTable, communityMembersTable, communityPostsTable, postCommentsTable,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

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
      .set({ commentCount: db.$count(postCommentsTable, eq(postCommentsTable.postId, postId)) as any })
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

export default router;
