import { pgTable, serial, text, integer, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { subjectsTable } from "./subjects";

export const quizSessionsTable = pgTable("quiz_sessions", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull().references(() => subjectsTable.id),
  paper: text("paper").notNull(),
  examType: text("exam_type"), // "first_incourse" | "first_semester" | "second_incourse" | "mock" | "final_jupeb"
  questionType: text("question_type").notNull(),
  questionIds: jsonb("question_ids").$type<number[]>().notNull(),
  status: text("status").notNull().default("in_progress"), // "in_progress" | "completed"
  score: integer("score"),
  totalMarks: integer("total_marks"),
  percentage: real("percentage"),
  timedMinutes: integer("timed_minutes"),
  answers: jsonb("answers").$type<Record<string, string>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertQuizSessionSchema = createInsertSchema(quizSessionsTable).omit({ id: true, createdAt: true });
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type QuizSession = typeof quizSessionsTable.$inferSelect;
