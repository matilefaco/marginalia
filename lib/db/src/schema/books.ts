import { pgTable, text, serial, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const booksTable = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  progress: real("progress").notNull().default(0),
  currentPage: integer("current_page").notNull().default(0),
  totalPages: integer("total_pages").notNull(),
  annotations: integer("annotations").notNull().default(0),
  highlights: integer("highlights").notNull().default(0),
  debates: integer("debates").notNull().default(0),
  currentChapter: text("current_chapter").notNull().default("I"),
  status: text("status").notNull().default("reading"),
  heatmap: jsonb("heatmap").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBookSchema = createInsertSchema(booksTable).omit({ id: true, createdAt: true });
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof booksTable.$inferSelect;
