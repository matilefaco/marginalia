import { pgTable, text, serial, integer, real, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userBooksTable = pgTable(
  "user_books",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    bookId: integer("book_id").notNull(),
    status: text("status").notNull().default("wishlist"),
    currentPage: integer("current_page").notNull().default(0),
    currentChapter: text("current_chapter").notNull().default(""),
    currentPercent: real("current_percent").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("user_book_unique").on(table.userId, table.bookId)]
);

export const insertUserBookSchema = createInsertSchema(userBooksTable).omit({ id: true, updatedAt: true });
export type InsertUserBook = z.infer<typeof insertUserBookSchema>;
export type UserBook = typeof userBooksTable.$inferSelect;
