import { Router } from "express";
import { db } from "@workspace/db";
import { subjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/subjects", async (req, res) => {
  try {
    const subjects = await db.select().from(subjectsTable).orderBy(subjectsTable.name);
    res.json(subjects.map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      description: s.description,
      paperCount: s.paperCount,
      color: s.color,
    })));
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch subjects", detail: err?.message });
  }
});

router.get("/subjects/:subjectId", async (req, res) => {
  try {
    const id = parseInt(req.params.subjectId);
    const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, id));
    if (!subject) return res.status(404).json({ error: "Subject not found" });
    res.json({ id: subject.id, name: subject.name, code: subject.code, description: subject.description, paperCount: subject.paperCount, color: subject.color });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subject" });
  }
});

export default router;
