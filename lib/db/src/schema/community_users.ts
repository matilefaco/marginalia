import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const communityUsersTable = pgTable("community_users", {
  id: serial("id").primaryKey(),
  seedId: text("seed_id").unique().notNull(),
  username: text("username").unique().notNull(),
  fullName: text("full_name").notNull(),
  initials: text("initials").notNull(),
  bio: text("bio").notNull().default(""),
  city: text("city"),
  avatarColor: text("avatar_color").notNull().default("#BDAB9C"),
  readerTypeTitle: text("reader_type_title").notNull().default("Leitora livre"),
  readerTypeDescription: text("reader_type_description").notNull().default(""),
  readingSignature: text("reading_signature").notNull().default(""),
  preferredGenres: jsonb("preferred_genres").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCommunityUserSchema = createInsertSchema(communityUsersTable).omit({ id: true, createdAt: true });
export type InsertCommunityUser = z.infer<typeof insertCommunityUserSchema>;
export type CommunityUser = typeof communityUsersTable.$inferSelect;
