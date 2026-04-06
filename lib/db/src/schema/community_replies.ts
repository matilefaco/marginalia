import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const communityRepliesTable = pgTable("community_replies", {
  id: serial("id").primaryKey(),
  marginId: integer("margin_id").notNull(),
  userSeedId: text("user_seed_id").notNull(),
  userName: text("user_name").notNull(),
  userInitials: text("user_initials").notNull(),
  userAvatarColor: text("user_avatar_color").notNull().default("#BDAB9C"),
  body: text("body").notNull(),
  parentReplyId: integer("parent_reply_id"),
  reactions: jsonb("reactions").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCommunityReplySchema = createInsertSchema(communityRepliesTable).omit({ id: true, createdAt: true });
export type InsertCommunityReply = z.infer<typeof insertCommunityReplySchema>;
export type CommunityReply = typeof communityRepliesTable.$inferSelect;
