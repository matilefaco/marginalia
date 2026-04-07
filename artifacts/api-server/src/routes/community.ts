import { Router, type IRouter } from "express";
import { eq, desc, ilike, sql, inArray } from "drizzle-orm";
import {
  db,
  communityBooksTable,
  communityMarginsTable,
  communityRepliesTable,
  communityUsersTable,
} from "@workspace/db";

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
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    language?: string;
    publisher?: string;
  };
}

function normalizeGoogleBook(item: GoogleBookItem) {
  const v = item.volumeInfo;
  const coverUrl =
    v.imageLinks?.thumbnail?.replace("http://", "https://") ??
    v.imageLinks?.smallThumbnail?.replace("http://", "https://") ??
    null;
  const publishYear = v.publishedDate ? parseInt(v.publishedDate.slice(0, 4), 10) : null;
  return {
    externalId: item.id,
    title: v.title,
    author: (v.authors ?? ["Autor desconhecido"]).join(", "),
    description: v.description?.slice(0, 400) ?? "",
    coverUrl,
    publishYear: isNaN(publishYear!) ? null : publishYear,
    totalPages: v.pageCount ?? 0,
    genres: v.categories ?? ["Literatura"],
    language: v.language ?? "pt",
    publisher: v.publisher ?? null,
  };
}

const GENRE_QUERIES: Record<string, string> = {
  "Literatura brasileira": "literatura brasileira romances",
  "Romance literário": "romance literario contemporaneo",
  Clássicos: "classicos da literatura universal",
  Filosofia: "filosofia existencialismo",
  Poesia: "poesia brasileira contemporanea",
  "Ficção contemporânea": "ficcao contemporanea bestseller",
  Drama: "drama teatro literatura",
  "Não ficção": "nao ficção ensaio contemporaneo",
  Ensaio: "ensaio intelectual critica",
  Biografia: "biografia memorias",
  "Literatura estrangeira": "world literature modern classics",
  "Ficção científica": "science fiction dystopia",
  Fantasia: "fantasy epica aventura",
  Terror: "horror terror suspense",
};

router.get("/community/books", async (req, res): Promise<void> => {
  const genre = typeof req.query.genre === "string" ? req.query.genre : "";
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const limit = Math.min(20, parseInt(String(req.query.limit ?? "8"), 10));
  const offset = (page - 1) * limit;

  try {
    let query = db.select().from(communityBooksTable);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(communityBooksTable);

    if (search) {
      const pattern = `%${search}%`;
      const condition = sql`${communityBooksTable.title} ilike ${pattern} or ${communityBooksTable.author} ilike ${pattern}`;
      query = query.where(condition) as typeof query;
      countQuery = countQuery.where(condition) as typeof countQuery;
    } else if (genre) {
      const condition = sql`${communityBooksTable.genres}::text ilike ${"%" + genre + "%"}`;
      query = query.where(condition) as typeof query;
      countQuery = countQuery.where(condition) as typeof countQuery;
    }

    const [countResult, books] = await Promise.all([
      countQuery,
      query.orderBy(desc(communityBooksTable.marginCount)).limit(limit).offset(offset),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    if (books.length < limit && (genre || search)) {
      try {
        const q = search || GENRE_QUERIES[genre] || genre;
        const lang = genre.includes("estrangeira") || genre.includes("científica") ? "" : "&langRestrict=pt";
        const gbUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}${lang}&maxResults=12&printType=books&orderBy=relevance`;
        const gbRes = await fetch(gbUrl);
        if (gbRes.ok) {
          const gbData = (await gbRes.json()) as { items?: GoogleBookItem[] };
          const newBooks = (gbData.items ?? []).map(normalizeGoogleBook).filter((b) => b.title && b.author);
          for (const book of newBooks) {
            try {
              await db
                .insert(communityBooksTable)
                .values({ ...book, genres: [genre || "Literatura"] } as never)
                .onConflictDoNothing();
            } catch {}
          }
          const refreshed = await db
            .select()
            .from(communityBooksTable)
            .where(sql`${communityBooksTable.genres}::text ilike ${"%" + (genre || search) + "%"}`)
            .orderBy(desc(communityBooksTable.marginCount))
            .limit(limit)
            .offset(offset);
          res.json({ books: refreshed, total: Math.max(total, refreshed.length), page, limit });
          return;
        }
      } catch {}
    }

    res.json({ books, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar livros" });
  }
});

router.get("/community/books/trending", async (_req, res): Promise<void> => {
  const books = await db
    .select()
    .from(communityBooksTable)
    .orderBy(desc(communityBooksTable.marginCount))
    .limit(10);
  res.json({ books });
});

router.get("/community/books/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
  const [book] = await db.select().from(communityBooksTable).where(eq(communityBooksTable.id, id));
  if (!book) { res.status(404).json({ error: "Livro não encontrado" }); return; }
  res.json({ book });
});

router.get("/community/margins", async (req, res): Promise<void> => {
  const bookId = req.query.bookId ? parseInt(String(req.query.bookId), 10) : null;
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const limit = Math.min(20, parseInt(String(req.query.limit ?? "10"), 10));
  const offset = (page - 1) * limit;

  let query = db.select().from(communityMarginsTable);
  if (bookId && !isNaN(bookId)) {
    query = query.where(eq(communityMarginsTable.bookId, bookId)) as typeof query;
  }

  const margins = await query.orderBy(desc(communityMarginsTable.createdAt)).limit(limit).offset(offset);
  res.json({ margins, page, limit });
});

router.get("/community/margins/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
  const [margin] = await db.select().from(communityMarginsTable).where(eq(communityMarginsTable.id, id));
  if (!margin) { res.status(404).json({ error: "Margem não encontrada" }); return; }
  res.json({ margin });
});

router.get("/community/margins/:id/replies", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }
  const replies = await db
    .select()
    .from(communityRepliesTable)
    .where(eq(communityRepliesTable.marginId, id))
    .orderBy(communityRepliesTable.createdAt);
  res.json({ replies });
});

router.get("/community/feed", async (req, res): Promise<void> => {
  const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
  const limit = Math.min(20, parseInt(String(req.query.limit ?? "10"), 10));
  const offset = (page - 1) * limit;

  const margins = await db
    .select()
    .from(communityMarginsTable)
    .orderBy(desc(communityMarginsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({ margins, page, limit });
});

router.get("/community/users", async (_req, res): Promise<void> => {
  const users = await db.select().from(communityUsersTable).orderBy(communityUsersTable.fullName);
  res.json({ users });
});

router.get("/community/users/:seedId", async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(communityUsersTable)
    .where(eq(communityUsersTable.seedId, req.params.seedId));
  if (!user) { res.status(404).json({ error: "Usuário não encontrado" }); return; }

  const margins = await db
    .select()
    .from(communityMarginsTable)
    .where(eq(communityMarginsTable.userSeedId, req.params.seedId))
    .orderBy(desc(communityMarginsTable.createdAt))
    .limit(10);

  res.json({ user, margins });
});

export default router;
