import { Router } from "express";

const router = Router();

// Lazy import so build failures are isolated
async function loadCourses() {
  const { allCourses } = await import("../../../crs003-textbook/src/data/index");
  return allCourses as any[];
}

// GET /textbook/courses — list of all courses with chapter summaries (no heavy section content)
router.get("/textbook/courses", async (_req, res) => {
  try {
    const courses = await loadCourses();
    res.json(
      courses.map((c: any) => ({
        id: c.id ?? c.code?.toLowerCase().replace(/\s+/g, ""),
        code: c.code,
        title: c.title,
        semester: c.semester,
        units: c.units ?? 3,
        description: c.description,
        objectives: c.objectives ?? [],
        chapters: (c.chapters ?? []).map((ch: any) => ({
          id: ch.id,
          number: ch.number,
          title: ch.title,
          summary: ch.summary,
          sectionCount: (ch.sections ?? []).length,
          keyTermCount: (ch.keyTerms ?? []).length,
        })),
      }))
    );
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load textbook data", detail: err?.message });
  }
});

// GET /textbook/courses/:courseId/chapters/:chapterId — full chapter content
router.get("/textbook/courses/:courseId/chapters/:chapterId", async (req, res) => {
  try {
    const courses = await loadCourses();
    const course = courses.find(
      (c: any) =>
        (c.id ?? c.code?.toLowerCase().replace(/\s+/g, "")) === req.params.courseId
    );
    if (!course) return res.status(404).json({ error: "Course not found" });
    const chapter = (course.chapters ?? []).find(
      (ch: any) => ch.id === req.params.chapterId
    );
    if (!chapter) return res.status(404).json({ error: "Chapter not found" });
    res.json(chapter);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to load chapter", detail: err?.message });
  }
});

export default router;
