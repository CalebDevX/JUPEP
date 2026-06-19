import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { questionsTable } from "./questions";
import { subjectsTable } from "./subjects";

export const wrongAnswersTable = pgTable("wrong_answers", {
  id: serial("id").primaryKey(),
  studentPhone: text("student_phone").notNull(),
  questionId: integer("question_id").notNull().references(() => questionsTable.id, { onDelete: "cascade" }),
  subjectId: integer("subject_id").notNull().references(() => subjectsTable.id),
  paper: text("paper").notNull(),
  selectedOption: text("selected_option"),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
  revisedAt: timestamp("revised_at"),
});

export type WrongAnswer = typeof wrongAnswersTable.$inferSelect;
