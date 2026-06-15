import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("info"),
  emoji: text("emoji").notNull().default("📢"),
  authorName: text("author_name").notNull().default("Admin"),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Announcement = typeof announcementsTable.$inferSelect;
