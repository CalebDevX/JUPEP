import { Router } from "express";
import { db } from "@workspace/db";
import { notesTable, subjectsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

router.get("/notes", async (req, res) => {
  try {
    const { subjectId, paper } = req.query;
    const conditions: any[] = [];
    if (subjectId) conditions.push(eq(notesTable.subjectId, parseInt(subjectId as string)));
    if (paper) conditions.push(eq(notesTable.paper, paper as string));

    const notes = await db
      .select({
        id: notesTable.id,
        subjectId: notesTable.subjectId,
        subjectName: subjectsTable.name,
        paper: notesTable.paper,
        title: notesTable.title,
        content: notesTable.content,
        tags: notesTable.tags,
        createdAt: notesTable.createdAt,
        updatedAt: notesTable.updatedAt,
      })
      .from(notesTable)
      .leftJoin(subjectsTable, eq(notesTable.subjectId, subjectsTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(notesTable.subjectId, notesTable.paper, notesTable.createdAt);

    res.json(notes.map(n => ({ ...n, createdAt: n.createdAt.toISOString(), updatedAt: n.updatedAt.toISOString() })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

router.post("/notes", async (req, res) => {
  try {
    const { subjectId, paper, title, content, tags } = req.body;
    const [note] = await db.insert(notesTable).values({ subjectId, paper, title, content, tags }).returning();
    const [subject] = await db.select({ name: subjectsTable.name }).from(subjectsTable).where(eq(subjectsTable.id, subjectId));
    res.status(201).json({ ...note, subjectName: subject?.name ?? null, createdAt: note.createdAt.toISOString(), updatedAt: note.updatedAt.toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to create note" });
  }
});

router.get("/notes/:noteId", async (req, res) => {
  try {
    const id = parseInt(req.params.noteId);
    const [n] = await db
      .select({
        id: notesTable.id,
        subjectId: notesTable.subjectId,
        subjectName: subjectsTable.name,
        paper: notesTable.paper,
        title: notesTable.title,
        content: notesTable.content,
        tags: notesTable.tags,
        createdAt: notesTable.createdAt,
        updatedAt: notesTable.updatedAt,
      })
      .from(notesTable)
      .leftJoin(subjectsTable, eq(notesTable.subjectId, subjectsTable.id))
      .where(eq(notesTable.id, id));
    if (!n) return res.status(404).json({ error: "Note not found" });
    res.json({ ...n, createdAt: n.createdAt.toISOString(), updatedAt: n.updatedAt.toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch note" });
  }
});

router.patch("/notes/:noteId", async (req, res) => {
  try {
    const id = parseInt(req.params.noteId);
    const { title, content, tags } = req.body;
    const updates: any = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (tags !== undefined) updates.tags = tags;
    const [updated] = await db.update(notesTable).set(updates).where(eq(notesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Note not found" });
    const [subject] = await db.select({ name: subjectsTable.name }).from(subjectsTable).where(eq(subjectsTable.id, updated.subjectId));
    res.json({ ...updated, subjectName: subject?.name ?? null, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to update note" });
  }
});

router.delete("/notes/:noteId", async (req, res) => {
  try {
    const id = parseInt(req.params.noteId);
    await db.delete(notesTable).where(eq(notesTable.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
