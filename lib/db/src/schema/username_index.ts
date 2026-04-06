import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const usernameIndexTable = pgTable("username_index", {
  username: text("username").primaryKey(),
  email: text("email").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UsernameIndex = typeof usernameIndexTable.$inferSelect;
