import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const referralsTable = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerPhone: text("referrer_phone").notNull(),
  refereePhone: text("referee_phone"),
  code: text("code").notNull().unique(),
  status: text("status").notNull().default("pending"), // "pending" | "completed"
  rewardDays: integer("reward_days").notNull().default(7),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type Referral = typeof referralsTable.$inferSelect;
