/**
 * CRS Textbook Notes Seeder
 * Seeds all 39 chapters from the CRS003 textbook into the notes table.
 * Run: pnpm --filter @workspace/api-server exec tsx src/seed-crs-textbook-notes.ts
 */

import { db, pool, notesTable, subjectsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { crs001 } from "../../../artifacts/crs003-textbook/src/data/crs001";
import { crs002 } from "../../../artifacts/crs003-textbook/src/data/crs002";
import { crs003 } from "../../../artifacts/crs003-textbook/src/data/crs003";
import { crs004 } from "../../../artifacts/crs003-textbook/src/data/crs004";

const CRS_SUBJECT_ID = 9;

interface Section {
  heading: string;
  content: string;
}

interface KeyTerm {
  term: string;
  definition: string;
}

interface Chapter {
  id: string;
  number: number;
  title: string;
  sections: Section[];
  summary: string;
  keyTerms: KeyTerm[];
  practiceQuestions: string[];
}

function buildContent(chapter: Chapter): string {
  const parts: string[] = [];

  // Sections
  for (const section of chapter.sections) {
    parts.push(`## ${section.heading}\n\n${section.content}`);
  }

  // Divider
  parts.push("---");

  // Chapter Summary
  parts.push(`## Chapter Summary\n\n${chapter.summary}`);

  // Key Terms
  if (chapter.keyTerms && chapter.keyTerms.length > 0) {
    const termsText = chapter.keyTerms
      .map((kt) => `**${kt.term}** — ${kt.definition}`)
      .join("\n\n");
    parts.push(`## Key Terms\n\n${termsText}`);
  }

  // Practice Questions
  if (chapter.practiceQuestions && chapter.practiceQuestions.length > 0) {
    const questionsText = chapter.practiceQuestions
      .map((q, i) => `${i + 1}. ${q}`)
      .join("\n\n");
    parts.push(`## Practice Questions\n\n${questionsText}`);
  }

  return parts.join("\n\n");
}

async function seedCourse(
  chapters: Chapter[],
  paper: "001" | "002" | "003" | "004",
  courseCode: string
) {
  let inserted = 0;
  let skipped = 0;

  for (const chapter of chapters) {
    const title = `Ch. ${chapter.number}: ${chapter.title}`;

    const existing = await db
      .select({ id: notesTable.id })
      .from(notesTable)
      .where(
        and(
          eq(notesTable.subjectId, CRS_SUBJECT_ID),
          eq(notesTable.title, title)
        )
      );

    if (existing.length > 0) {
      console.log(`  ⏭️  Skipping (exists): ${title}`);
      skipped++;
      continue;
    }

    const content = buildContent(chapter);
    const tags = ["lecture-note", "crs", courseCode.toLowerCase()];

    await db.insert(notesTable).values({
      subjectId: CRS_SUBJECT_ID,
      paper,
      title,
      content,
      tags,
    });

    console.log(`  ✅ Inserted: ${title} (${content.length} chars)`);
    inserted++;
  }

  return { inserted, skipped };
}

async function run() {
  console.log("📖 CRS Textbook Notes Seeder");
  console.log("=".repeat(60));

  const subjects = await db
    .select()
    .from(subjectsTable)
    .where(eq(subjectsTable.id, CRS_SUBJECT_ID));
  console.log(
    `Subject: ${subjects[0]?.name ?? "NOT FOUND"} (id=${CRS_SUBJECT_ID})\n`
  );

  const courses = [
    { data: crs001, paper: "001" as const, code: "CRS001" },
    { data: crs002, paper: "002" as const, code: "CRS002" },
    { data: crs003, paper: "003" as const, code: "CRS003" },
    { data: crs004, paper: "004" as const, code: "CRS004" },
  ];

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const course of courses) {
    console.log(`\n📚 ${course.data.code}: ${course.data.title}`);
    console.log(
      `   Chapters: ${(course.data.chapters as Chapter[]).length}, Paper: ${course.paper}`
    );
    console.log("-".repeat(50));

    const { inserted, skipped } = await seedCourse(
      course.data.chapters as Chapter[],
      course.paper,
      course.code
    );
    totalInserted += inserted;
    totalSkipped += skipped;
  }

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Inserted: ${totalInserted}`);
  console.log(`⏭️  Skipped:  ${totalSkipped}`);
  console.log(`📚 Total:    ${totalInserted + totalSkipped} chapters`);

  await pool.end();
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
