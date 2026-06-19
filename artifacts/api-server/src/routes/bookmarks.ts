import { Router } from "express";
import { db } from "@workspace/db";
import { bookmarksTable, questionsTable, notesTable, subjectsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

// GET /api/bookmarks?phone=...&type=question|note
router.get("/bookmarks", async (req, res) => {
  const { phone, type } = req.query as Record<string, string>;
  if (!phone) return res.status(400).json({ error: "phone required" });

  try {
    const conditions: any[] = [eq(bookmarksTable.studentPhone, phone)];
    if (type) conditions.push(eq(bookmarksTable.itemType, type));

    const bookmarks = await db
      .select()
      .from(bookmarksTable)
      .where(and(...conditions))
      .orderBy(desc(bookmarksTable.createdAt));

    // Enrich with actual item data
    const enriched = await Promise.all(
      bookmarks.map(async (bm) => {
        if (bm.itemType === "question") {
          const [q] = await db
            .select({
              id: questionsTable.id,
              questionText: questionsTable.questionText,
              options: questionsTable.options,
              correctOption: questionsTable.correctOption,
              explanation: questionsTable.explanation,
              paper: questionsTable.paper,
              subjectName: subjectsTable.name,
            })
            .from(questionsTable)
            .innerJoin(subjectsTable, eq(questionsTable.subjectId, subjectsTable.id))
            .where(eq(questionsTable.id, parseInt(bm.itemId)));
          return { ...bm, item: q || null };
        } else {
          const [n] = await db
            .select({ id: notesTable.id, title: notesTable.title, paper: notesTable.paper, subjectId: notesTable.subjectId })
            .from(notesTable)
            .where(eq(notesTable.id, parseInt(bm.itemId)));
          return { ...bm, item: n || null };
        }
      })
    );

    res.json(enriched.filter(b => b.item !== null));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// POST /api/bookmarks/toggle
router.post("/bookmarks/toggle", async (req, res) => {
  const { phone, itemType, itemId } = req.body as { phone: string; itemType: string; itemId: string };
  if (!phone || !itemType || !itemId) return res.status(400).json({ error: "phone, itemType, itemId required" });

  try {
    const [existing] = await db
      .select()
      .from(bookmarksTable)
      .where(
        and(
          eq(bookmarksTable.studentPhone, phone),
          eq(bookmarksTable.itemType, itemType),
          eq(bookmarksTable.itemId, String(itemId)),
        )
      );

    if (existing) {
      await db.delete(bookmarksTable).where(eq(bookmarksTable.id, existing.id));
      res.json({ bookmarked: false });
    } else {
      await db.insert(bookmarksTable).values({ studentPhone: phone, itemType, itemId: String(itemId) });
      res.json({ bookmarked: true });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
});

// GET /api/bookmarks/check?phone=...&itemType=...&itemId=...
router.get("/bookmarks/check", async (req, res) => {
  const { phone, itemType, itemId } = req.query as Record<string, string>;
  if (!phone || !itemType || !itemId) return res.status(400).json({ error: "params required" });

  try {
    const [existing] = await db
      .select({ id: bookmarksTable.id })
      .from(bookmarksTable)
      .where(
        and(
          eq(bookmarksTable.studentPhone, phone),
          eq(bookmarksTable.itemType, itemType),
          eq(bookmarksTable.itemId, itemId),
        )
      );
    res.json({ bookmarked: !!existing });
  } catch (err) {
    res.status(500).json({ error: "Failed to check bookmark" });
  }
});

export default router;
