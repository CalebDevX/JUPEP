import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { subjectsTable } from "./subjects";

export const EXAM_TYPES = [
  "first_incourse",
  "first_semester",
  "second_incourse",
  "mock",
  "final_jupeb",
] as const;

export type ExamType = (typeof EXAM_TYPES)[number];

export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  first_incourse:  "1st In-Course Exam",
  first_semester:  "1st Semester Exam",
  second_incourse: "2nd In-Course Exam",
  mock:            "Mock Exam",
  final_jupeb:     "Final JUPEB Exam",
};

// Papers 001 & 002 are taught in the first half (1st In-Course period).
// Papers 003 & 004 are taught in the second half (2nd In-Course period).
export const EXAM_TYPE_PAPERS: Record<ExamType, string[]> = {
  first_incourse:  ["001", "002"],
  first_semester:  ["001", "002"],
  second_incourse: ["003", "004"],
  mock:            ["001", "002", "003", "004"],
  final_jupeb:     ["001", "002", "003", "004"],
};

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull().references(() => subjectsTable.id),
  paper: text("paper").notNull(), // "001" | "002" | "003" | "004" — content topic unit
  examType: text("exam_type"), // ExamType — which exam this question appeared in
  year: integer("year").notNull(),
  questionType: text("question_type").notNull(), // "objective" | "theory"
  questionText: text("question_text").notNull(),
  options: jsonb("options").$type<string[]>(),
  correctOption: text("correct_option"),
  explanation: text("explanation"),
  markingGuide: text("marking_guide"),
  marks: integer("marks").default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({ id: true, createdAt: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questionsTable.$inferSelect;
