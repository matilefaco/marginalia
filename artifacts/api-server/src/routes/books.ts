import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, booksTable, annotationsTable } from "@workspace/db";
import {
  GetBookParams,
  GetBookAnnotationsParams,
  GetBookCardsParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    language?: string;
    publisher?: string;
  };
}

function normalizeGoogleBook(item: GoogleBookItem) {
  const v = item.volumeInfo;
  const coverUrl = v.imageLinks?.thumbnail?.replace("http://", "https://") ??
    v.imageLinks?.smallThumbnail?.replace("http://", "https://") ?? null;

  const publishYear = v.publishedDate ? parseInt(v.publishedDate.slice(0, 4), 10) : null;

  const genres = (v.categories ?? []).map((c) => {
    const lower = c.toLowerCase();
    if (lower.includes("fiction")) return "Ficção contemporânea";
    if (lower.includes("poetry") || lower.includes("poesia")) return "Poesia";
    if (lower.includes("philosophy") || lower.includes("filosof")) return "Filosofia";
    if (lower.includes("history") || lower.includes("histor")) return "Histórico";
    if (lower.includes("science") || lower.includes("ciência")) return "Ficção científica";
    return c;
  });

  return {
    externalId: item.id,
    title: v.title,
    author: (v.authors ?? ["Autor desconhecido"]).join(", "),
    description: v.description?.slice(0, 300) ?? "",
    coverUrl,
    publishYear,
    totalPages: v.pageCount ?? 0,
    genres: genres.length > 0 ? genres : ["Literatura estrangeira"],
    language: v.language ?? "pt",
    publisher: v.publisher ?? null,
  };
}

router.get("/books/search", async (req, res): Promise<void> => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const lang = typeof req.query.lang === "string" ? req.query.lang : "";
  const maxResults = Math.min(parseInt(String(req.query.limit ?? "12"), 10), 20);

  if (!query) {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  try {
    const langRestrict = lang ? `&langRestrict=${lang}` : "";
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}${langRestrict}&maxResults=${maxResults}&printType=books`;

    const response = await fetch(url);
    if (!response.ok) {
      res.status(502).json({ error: "Google Books API unavailable" });
      return;
    }

    const data = (await response.json()) as { items?: GoogleBookItem[]; totalItems?: number };
    const items = (data.items ?? []).map(normalizeGoogleBook);

    res.json({ items, total: data.totalItems ?? 0, query });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from Google Books" });
  }
});

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
