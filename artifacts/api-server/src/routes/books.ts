import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, booksTable, annotationsTable } from "@workspace/db";
import {
  GetBookParams,
  GetBookAnnotationsParams,
  GetBookCardsParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/books", async (_req, res): Promise<void> => {
  const books = await db.select().from(booksTable).orderBy(booksTable.createdAt);
  res.json(books);
});

router.get("/books/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetBookParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, params.data.id));
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  const recentAnnotations = await db
    .select()
    .from(annotationsTable)
    .where(eq(annotationsTable.bookId, params.data.id))
    .orderBy(annotationsTable.createdAt)
    .limit(5);

  const heatmap = (book.heatmap as Array<{ chapter: number; chapterTitle: string; intensity: number; annotationCount: number }>) || [];
  const progress = book.progress;

  const heatmapWithLock = heatmap.map((h) => ({
    ...h,
    locked: h.chapter / heatmap.length * 100 > progress,
  }));

  res.json({
    ...book,
    heatmap: heatmapWithLock,
    recentAnnotations,
  });
});

router.get("/books/:id/annotations", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetBookAnnotationsParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const annotations = await db
    .select()
    .from(annotationsTable)
    .where(eq(annotationsTable.bookId, params.data.id))
    .orderBy(annotationsTable.createdAt);

  res.json(annotations);
});

router.get("/books/:id/cards", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetBookCardsParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, params.data.id));
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  const annotations = await db
    .select()
    .from(annotationsTable)
    .where(eq(annotationsTable.bookId, params.data.id))
    .limit(3);

  const cards = [
    {
      id: 1,
      bookId: params.data.id,
      type: "moment",
      title: "Momento mais intenso até agora",
      content: annotations[0]?.excerpt || "O texto aguarda o seu gesto.",
      excerpt: annotations[0]?.excerpt || null,
      chapter: annotations[0]?.chapter || null,
      progressAt: annotations[0]?.progressAt || null,
      stats: {},
    },
    {
      id: 2,
      bookId: params.data.id,
      type: "progress",
      title: "Minha Leitura",
      content: `${Math.round(book.progress)}% concluído`,
      excerpt: null,
      chapter: book.currentChapter,
      progressAt: book.progress,
      stats: {
        Notas: book.annotations,
        Destaques: book.highlights,
        Debates: book.debates,
      },
    },
    {
      id: 3,
      bookId: params.data.id,
      type: "identity",
      title: "Meu Perfil de Leitor",
      content: "Você marca mais momentos de silêncio e perda.",
      excerpt: null,
      chapter: null,
      progressAt: null,
      stats: { Anotações: book.annotations },
    },
    ...(annotations[1]
      ? [
          {
            id: 4,
            bookId: params.data.id,
            type: "insight",
            title: "Insight",
            content: annotations[1].note || annotations[1].excerpt,
            excerpt: annotations[1].excerpt,
            chapter: annotations[1].chapter,
            progressAt: annotations[1].progressAt,
            stats: {},
          },
        ]
      : []),
    {
      id: 5,
      bookId: params.data.id,
      type: "reaction",
      title: "Reação",
      content: "Esse trecho me fez parar e fechar o livro por alguns minutos.",
      excerpt: null,
      chapter: book.currentChapter,
      progressAt: book.progress,
      stats: {},
    },
  ];

  res.json(cards);
});

export default router;
