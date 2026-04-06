import { pgTable, text, serial, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userMarginsTable = pgTable("user_margins", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  bookId: integer("book_id").notNull(),
  bookTitle: text("book_title").notNull(),
  bookAuthor: text("book_author").notNull().default(""),
  excerpt: text("excerpt").notNull(),
  commentary: text("commentary").notNull().default(""),
  postType: text("post_type").notNull().default("insight"),
  spoilerLevel: text("spoiler_level").notNull().default("none"),
  visibility: text("visibility").notNull().default("public"),
  referenceType: text("reference_type").notNull().default("none"),
  page: integer("page"),
  chapter: text("chapter"),
  reactions: jsonb("reactions").notNull().default({}),
  commentsCount: integer("comments_count").notNull().default(0),
  parentEcoId: integer("parent_eco_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserMarginSchema = createInsertSchema(userMarginsTable).omit({ id: true, createdAt: true, reactions: true, commentsCount: true });
export type InsertUserMargin = z.infer<typeof insertUserMarginSchema>;
export type UserMargin = typeof userMarginsTable.$inferSelect;
