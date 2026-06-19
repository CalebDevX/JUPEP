import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const bookmarksTable = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  studentPhone: text("student_phone").notNull(),
  itemType: text("item_type").notNull(), // "question" | "note"
  itemId: text("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Bookmark = typeof bookmarksTable.$inferSelect;
