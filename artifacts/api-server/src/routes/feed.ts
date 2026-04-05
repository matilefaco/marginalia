import { Router, type IRouter } from "express";
import { eq, ne } from "drizzle-orm";
import { db, booksTable, annotationsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/feed", async (_req, res): Promise<void> => {
  const allBooks = await db.select().from(booksTable).orderBy(booksTable.createdAt);
  const currentReading = allBooks.find((b) => b.status === "reading") || null;

  let currentReadingWithHeatmap = null;
  if (currentReading) {
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

    currentReadingWithHeatmap = { ...currentReading, heatmap: heatmapWithLock, recentAnnotations };
  }

  const echoes = await db
    .select()
    .from(annotationsTable)
    .where(eq(annotationsTable.isPublic, true))
    .orderBy(annotationsTable.createdAt)
    .limit(8);

  const discover = allBooks
    .filter((b) => b.status !== "reading" || (currentReading && b.id !== currentReading.id))
    .slice(0, 6);

  res.json({
    currentReading: currentReadingWithHeatmap,
    echoes,
    discover,
  });
});

router.get("/explore", async (_req, res): Promise<void> => {
  const trending = await db
    .select()
    .from(annotationsTable)
    .where(eq(annotationsTable.isPublic, true))
    .orderBy(annotationsTable.createdAt)
    .limit(10);

  const books = await db.select().from(booksTable);

  const readers = [
    {
      id: "user_ana",
      name: "Ana Clara",
      initials: "AC",
      bio: "Leitora compulsiva e anotadora de margens",
      booksRead: 47,
      totalAnnotations: 312,
      totalHighlights: 89,
      identityPhrase: "Você habita os livros que lê.",
      recentExcerpts: trending.slice(0, 2),
    },
    {
      id: "user_rafael",
      name: "Rafael M.",
      initials: "RM",
      bio: "Escritor em formação, leitor de sempre",
      booksRead: 28,
      totalAnnotations: 178,
      totalHighlights: 54,
      identityPhrase: "Você questiona o que os outros aceitam.",
      recentExcerpts: trending.slice(2, 4),
    },
    {
      id: "user_julia",
      name: "Julia S.",
      initials: "JS",
      bio: "Professora de literatura, apaixonada por Clarice",
      booksRead: 103,
      totalAnnotations: 891,
      totalHighlights: 234,
      identityPhrase: "Você encontra o universal no particular.",
      recentExcerpts: trending.slice(4, 6),
    },
  ];

  res.json({
    trending,
    readers,
    emergingBooks: books.slice(0, 4),
  });
});

export default router;
