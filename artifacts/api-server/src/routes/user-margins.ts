import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, userMarginsTable } from "@workspace/db";

const router: IRouter = Router();

/* GET /api/user-margins/:userId — load all margins for a user */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const rows = await db
      .select()
      .from(userMarginsTable)
      .where(eq(userMarginsTable.userId, userId))
      .orderBy(desc(userMarginsTable.createdAt));
    res.json(rows);
  } catch (e) {
    console.error("[user-margins] GET error:", e);
    res.status(500).json({ error: "Failed to load margins" });
  }
});

/* POST /api/user-margins — create a new margin */
router.post("/", async (req, res) => {
  try {
    const {
      userId,
      bookId,
      bookTitle,
      bookAuthor,
      excerpt,
      commentary,
      postType,
      spoilerLevel,
      visibility,
      referenceType,
      page,
      chapter,
      parentEcoId,
    } = req.body as {
      userId: string;
      bookId: number;
      bookTitle: string;
      bookAuthor?: string;
      excerpt: string;
      commentary?: string;
      postType?: string;
      spoilerLevel?: string;
      visibility?: string;
      referenceType?: string;
      page?: number;
      chapter?: string;
      parentEcoId?: number;
    };

    if (!userId || !bookId || !excerpt) {
      return res.status(400).json({ error: "userId, bookId and excerpt are required" });
    }

    const [created] = await db
      .insert(userMarginsTable)
      .values({
        userId,
        bookId,
        bookTitle,
        bookAuthor: bookAuthor ?? "",
        excerpt,
        commentary: commentary ?? "",
        postType: postType ?? "insight",
        spoilerLevel: spoilerLevel ?? "none",
        visibility: visibility ?? "public",
        referenceType: referenceType ?? "none",
        page: page ?? null,
        chapter: chapter ?? null,
        parentEcoId: parentEcoId ?? null,
        reactions: {},
        commentsCount: 0,
      })
      .returning();

    res.json(created);
  } catch (e) {
    console.error("[user-margins] POST error:", e);
    res.status(500).json({ error: "Failed to save margin" });
  }
});

/* DELETE /api/user-margins/:id */
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(userMarginsTable).where(eq(userMarginsTable.id, id));
    res.json({ ok: true });
  } catch (e) {
    console.error("[user-margins] DELETE error:", e);
    res.status(500).json({ error: "Failed to delete margin" });
  }
});

export default router;
