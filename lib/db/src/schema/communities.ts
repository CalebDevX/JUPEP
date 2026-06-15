import { pgTable, serial, text, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

export const communityTypeEnum = pgEnum("community_type", ["tutorial_center", "study_group", "general"]);
export const memberStatusEnum = pgEnum("member_status", ["pending", "approved", "rejected"]);
export const memberRoleEnum = pgEnum("member_role", ["admin", "moderator", "member"]);

export const communitiesTable = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  type: communityTypeEnum("type").notNull().default("general"),
  coverColor: text("cover_color").notNull().default("#6d28d9"),
  coverEmoji: text("cover_emoji").notNull().default("📚"),
  whatsappNumber: text("whatsapp_number"),
  website: text("website"),
  verified: boolean("verified").notNull().default(false),
  requiresApproval: boolean("requires_approval").notNull().default(false),
  memberCount: integer("member_count").notNull().default(0),
  postCount: integer("post_count").notNull().default(0),
  adminName: text("admin_name").notNull().default("Admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityMembersTable = pgTable("community_members", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communitiesTable.id),
  displayName: text("display_name").notNull(),
  whatsappNumber: text("whatsapp_number").notNull(),
  role: memberRoleEnum("role").notNull().default("member"),
  status: memberStatusEnum("status").notNull().default("approved"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const communityPostsTable = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communitiesTable.id),
  memberId: integer("member_id").references(() => communityMembersTable.id),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  commentCount: integer("comment_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const postCommentsTable = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => communityPostsTable.id),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Community = typeof communitiesTable.$inferSelect;
export type CommunityMember = typeof communityMembersTable.$inferSelect;
export type CommunityPost = typeof communityPostsTable.$inferSelect;
export type PostComment = typeof postCommentsTable.$inferSelect;
