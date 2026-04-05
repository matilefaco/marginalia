import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, booksTable, annotationsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/users/me", async (_req, res): Promise<void> => {
  const allAnnotations = await db
    .select()
    .from(annotationsTable)
    .orderBy(annotationsTable.createdAt)
    .limit(5);

  res.json({
    id: "user_me",
    name: "Leitor",
    initials: "LT",
    bio: "Leitor compulsivo de margens e anotações.",
    booksRead: 12,
    totalAnnotations: 37,
    totalHighlights: 18,
    identityPhrase: "Você marca mais momentos de silêncio e perda.",
    recentExcerpts: allAnnotations,
  });
});

router.get("/users/me/reading", async (_req, res): Promise<void> => {
  const allBooks = await db.select().from(booksTable);
  const currentReading = allBooks.find((b) => b.status === "reading") || allBooks[0];

  if (!currentReading) {
    res.status(404).json({ error: "No current reading found" });
    return;
  }

  const recentAnnotations = await db
    .select()
    .from(annotationsTable)
    .where(eq(annotationsTable.bookId, currentReading.id))
    .limit(5);

  const heatmap = (currentReading.heatmap as Array<{ chapter: number; chapterTitle: string; intensity: number; annotationCount: number }>) || [];
  const progress = currentReading.progress;
  const heatmapWithLock = heatmap.map((h) => ({
    ...h,
    locked: h.chapter / heatmap.length * 100 > progress,
  }));

  res.json({ ...currentReading, heatmap: heatmapWithLock, recentAnnotations });
});

export default router;
