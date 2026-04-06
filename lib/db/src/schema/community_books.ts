import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const communityBooksTable = pgTable("community_books", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").unique(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description").notNull().default(""),
  coverUrl: text("cover_url"),
  publisher: text("publisher"),
  publicationYear: integer("publication_year"),
  totalPages: integer("total_pages").notNull().default(0),
  language: text("language").notNull().default("pt"),
  genres: jsonb("genres").notNull().default([]),
  marginCount: integer("margin_count").notNull().default(0),
  reactionCount: integer("reaction_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCommunityBookSchema = createInsertSchema(communityBooksTable).omit({ id: true, createdAt: true });
export type InsertCommunityBook = z.infer<typeof insertCommunityBookSchema>;
export type CommunityBook = typeof communityBooksTable.$inferSelect;
