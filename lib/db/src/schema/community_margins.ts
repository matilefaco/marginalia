import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const communityMarginsTable = pgTable("community_margins", {
  id: serial("id").primaryKey(),
  userSeedId: text("user_seed_id").notNull(),
  userName: text("user_name").notNull(),
  userInitials: text("user_initials").notNull(),
  userAvatarColor: text("user_avatar_color").notNull().default("#BDAB9C"),
  bookId: integer("book_id").notNull(),
  bookTitle: text("book_title").notNull(),
  bookAuthor: text("book_author").notNull(),
  bookCoverUrl: text("book_cover_url"),
  excerpt: text("excerpt").notNull(),
  commentary: text("commentary").notNull(),
  postType: text("post_type").notNull().default("insight"),
  referenceType: text("reference_type").notNull().default("none"),
  referencePage: integer("reference_page"),
  referenceChapter: text("reference_chapter"),
  spoilerLevel: text("spoiler_level").notNull().default("none"),
  visibility: text("visibility").notNull().default("public"),
  reactions: jsonb("reactions").notNull().default({}),
  commentsCount: integer("comments_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCommunityMarginSchema = createInsertSchema(communityMarginsTable).omit({ id: true, createdAt: true });
export type InsertCommunityMargin = z.infer<typeof insertCommunityMarginSchema>;
export type CommunityMargin = typeof communityMarginsTable.$inferSelect;
