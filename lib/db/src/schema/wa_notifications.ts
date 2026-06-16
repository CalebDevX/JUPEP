import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const waNotificationsTable = pgTable("wa_notifications", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"), // pending | sent | failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sentAt: timestamp("sent_at"),
});

export const waBotStateTable = pgTable("wa_bot_state", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("disconnected"), // disconnected | connecting | connected
  qrCode: text("qr_code"),
  qrExpiresAt: timestamp("qr_expires_at"),
  phoneNumber: text("phone_number"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type WaNotification = typeof waNotificationsTable.$inferSelect;
export type WaBotState = typeof waBotStateTable.$inferSelect;
