import { Router } from "express";
import { db } from "@workspace/db";
import { announcementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

const ADMIN_PIN = "JUPEB2024";

router.get("/announcements", async (req, res) => {
  try {
    const rows = await db.select().from(announcementsTable)
      .orderBy(desc(announcementsTable.isPinned), desc(announcementsTable.createdAt))
      .limit(20);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch announcements" });
  }
});

router.post("/announcements", async (req, res) => {
  try {
    const { title, content, type, emoji, authorName, isPinned, adminPin } = req.body;
    if (adminPin !== ADMIN_PIN) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    const [row] = await db.insert(announcementsTable).values({
      title: title.trim(),
      content: content.trim(),
      type: type || "info",
      emoji: emoji || "📢",
      authorName: authorName?.trim() || "Admin",
      isPinned: !!isPinned,
    }).returning();
    res.status(201).json(row);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create announcement" });
  }
});

router.delete("/announcements/:id", async (req, res) => {
  try {
    const { adminPin } = req.body;
    if (adminPin !== ADMIN_PIN) return res.status(403).json({ error: "Unauthorized" });
    await db.delete(announcementsTable).where(eq(announcementsTable.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete announcement" });
  }
});

export default router;
