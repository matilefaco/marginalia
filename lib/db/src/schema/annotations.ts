import { pgTable, text, serial, integer, real, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const annotationsTable = pgTable("annotations", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull(),
  bookTitle: text("book_title").notNull(),
  chapter: text("chapter").notNull(),
  progressAt: real("progress_at").notNull(),
  excerpt: text("excerpt").notNull(),
  note: text("note"),
  type: text("type").notNull().default("highlight"),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  userInitials: text("user_initials").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  reactions: jsonb("reactions").notNull().default({}),
  replyCount: integer("reply_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAnnotationSchema = createInsertSchema(annotationsTable).omit({ id: true, createdAt: true });
export type InsertAnnotation = z.infer<typeof insertAnnotationSchema>;
export type Annotation = typeof annotationsTable.$inferSelect;
