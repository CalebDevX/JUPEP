import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  studentName: text("student_name"),
  amount: integer("amount").notNull(),
  reference: text("reference").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending | success | failed
  channel: text("channel"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Payment = typeof paymentsTable.$inferSelect;
