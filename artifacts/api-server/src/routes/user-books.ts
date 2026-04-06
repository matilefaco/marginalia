import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, userBooksTable } from "@workspace/db";

const router: IRouter = Router();

/* GET /api/user-books/:userId — load all books for a user */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const rows = await db
      .select()
      .from(userBooksTable)
      .where(eq(userBooksTable.userId, userId));
    res.json(rows);
  } catch (e) {
    console.error("[user-books] GET error:", e);
    res.status(500).json({ error: "Failed to load books" });
  }
});

/* PUT /api/user-books/:userId/:bookId — upsert progress */
router.put("/:userId/:bookId", async (req, res) => {
  try {
    const { userId, bookId } = req.params;
    const bid = parseInt(bookId);
    const { status, currentPage, currentChapter, currentPercent } = req.body as {
      status?: string;
      currentPage?: number;
      currentChapter?: string;
      currentPercent?: number;
    };

    await db
      .insert(userBooksTable)
      .values({
        userId,
        bookId: bid,
        status: status ?? "wishlist",
        currentPage: currentPage ?? 0,
        currentChapter: currentChapter ?? "",
        currentPercent: currentPercent ?? 0,
      })
      .onConflictDoUpdate({
        target: [userBooksTable.userId, userBooksTable.bookId],
        set: {
          ...(status !== undefined && { status }),
          ...(currentPage !== undefined && { currentPage }),
          ...(currentChapter !== undefined && { currentChapter }),
          ...(currentPercent !== undefined && { currentPercent }),
          updatedAt: new Date(),
        },
      });

    const [updated] = await db
      .select()
      .from(userBooksTable)
      .where(and(eq(userBooksTable.userId, userId), eq(userBooksTable.bookId, bid)));

    res.json(updated);
  } catch (e) {
    console.error("[user-books] PUT error:", e);
    res.status(500).json({ error: "Failed to save progress" });
  }
});

/* DELETE /api/user-books/:userId/:bookId */
router.delete("/:userId/:bookId", async (req, res) => {
  try {
    const { userId, bookId } = req.params;
    await db
      .delete(userBooksTable)
      .where(
        and(
          eq(userBooksTable.userId, userId),
          eq(userBooksTable.bookId, parseInt(bookId))
        )
      );
    res.json({ ok: true });
  } catch (e) {
    console.error("[user-books] DELETE error:", e);
    res.status(500).json({ error: "Failed to delete book progress" });
  }
});

export default router;
