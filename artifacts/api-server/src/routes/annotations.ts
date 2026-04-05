import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, annotationsTable, repliesTable, booksTable } from "@workspace/db";
import { CreateAnnotationBody, GetAnnotationParams, AddReactionParams, AddReactionBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/annotations", async (req, res): Promise<void> => {
  const parsed = CreateAnnotationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, parsed.data.bookId));
  if (!book) {
    res.status(404).json({ error: "Book not found" });
    return;
  }

  const [annotation] = await db
    .insert(annotationsTable)
    .values({
      bookId: parsed.data.bookId,
      bookTitle: book.title,
      chapter: parsed.data.chapter,
      progressAt: parsed.data.progressAt,
      excerpt: parsed.data.excerpt,
      note: parsed.data.note ?? null,
      type: parsed.data.type,
      isPublic: parsed.data.isPublic,
      userId: "user_me",
      userName: "Você",
      userInitials: "VC",
      reactions: {},
      replyCount: 0,
    })
    .returning();

  await db
    .update(booksTable)
    .set({ annotations: book.annotations + 1 })
    .where(eq(booksTable.id, parsed.data.bookId));

  res.status(201).json(annotation);
});

router.get("/annotations/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetAnnotationParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [annotation] = await db
    .select()
    .from(annotationsTable)
    .where(eq(annotationsTable.id, params.data.id));

  if (!annotation) {
    res.status(404).json({ error: "Annotation not found" });
    return;
  }

  const replies = await db
    .select()
    .from(repliesTable)
    .where(eq(repliesTable.annotationId, params.data.id))
    .orderBy(repliesTable.createdAt);

  res.json({ annotation, replies });
});

router.post("/annotations/:id/reactions", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = AddReactionParams.safeParse({ id: parseInt(rawId, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = AddReactionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [annotation] = await db
    .select()
    .from(annotationsTable)
    .where(eq(annotationsTable.id, params.data.id));

  if (!annotation) {
    res.status(404).json({ error: "Annotation not found" });
    return;
  }

  const currentReactions = (annotation.reactions as Record<string, number>) || {};
  const reaction = body.data.reaction;
  currentReactions[reaction] = (currentReactions[reaction] || 0) + 1;

  const [updated] = await db
    .update(annotationsTable)
    .set({ reactions: currentReactions })
    .where(eq(annotationsTable.id, params.data.id))
    .returning();

  res.json(updated);
});

export default router;
