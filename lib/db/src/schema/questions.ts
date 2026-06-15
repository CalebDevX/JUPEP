import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { subjectsTable } from "./subjects";

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull().references(() => subjectsTable.id),
  paper: text("paper").notNull(), // "001", "002", "003", "004"
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
