import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const accessCodesTable = pgTable("access_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  label: text("label").notNull().default(""),
  maxActivations: integer("max_activations").notNull().default(1),
  activationCount: integer("activation_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const deviceTokensTable = pgTable("device_tokens", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  codeId: integer("code_id").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastVerifiedAt: timestamp("last_verified_at").defaultNow().notNull(),
  isRevoked: boolean("is_revoked").notNull().default(false),
});

export type AccessCode = typeof accessCodesTable.$inferSelect;
export type DeviceToken = typeof deviceTokensTable.$inferSelect;
