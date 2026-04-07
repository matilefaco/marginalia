import { useState, useEffect, useCallback } from "react";

export interface CommunityBook {
  id: number;
  externalId: string | null;
  title: string;
  author: string;
  description: string;
  coverUrl: string | null;
  publisher: string | null;
  publicationYear: number | null;
  totalPages: number;
  language: string;
  genres: string[];
  marginCount: number;
  reactionCount: number;
  createdAt: string;
}

export interface CommunityMargin {
  id: number;
  userSeedId: string;
  userName: string;
  userInitials: string;
  userAvatarColor: string;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl: string | null;
  excerpt: string;
  commentary: string;
  postType: string;
  referenceType: string;
  referencePage: number | null;
  referenceChapter: string | null;
  spoilerLevel: string;
  visibility: string;
  reactions: Record<string, number>;
  commentsCount: number;
  createdAt: string;
}

export interface CommunityReply {
  id: number;
  marginId: number;
  userSeedId: string;
  userName: string;
  userInitials: string;
  userAvatarColor: string;
  body: string;
  parentReplyId: number | null;
  reactions: Record<string, number>;
  createdAt: string;
}

const API_BASE = "/api";

async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export function useCommunityBooks(genre?: string, search?: string, page = 1, limit = 8) {
  const [books, setBooks] = useState<CommunityBook[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (genre) params.set("genre", genre);
    if (search) params.set("search", search);
    const data = await get<{ books: CommunityBook[]; total: number }>(`/community/books?${params}`);
    if (data) {
      setBooks(data.books);
      setTotal(data.total);
    }
    setLoading(false);
  }, [genre, search, page, limit]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { books, total, loading, refetch: fetch_ };
}

export function useCommunityTrending() {
  const [books, setBooks] = useState<CommunityBook[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    get<{ books: CommunityBook[] }>("/community/books/trending").then((data) => {
      if (data) setBooks(data.books);
      setLoading(false);
    });
  }, []);

  return { books, loading };
}

export function useCommunityFeed(page = 1, limit = 10) {
  const [margins, setMargins] = useState<CommunityMargin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    get<{ margins: CommunityMargin[] }>(`/community/feed?page=${page}&limit=${limit}`).then((data) => {
      if (data) setMargins(data.margins);
      setLoading(false);
    });
  }, [page, limit]);

  return { margins, loading };
}

export function useCommunityMargins(bookId?: number, page = 1, limit = 10) {
  const [margins, setMargins] = useState<CommunityMargin[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    get<{ margins: CommunityMargin[] }>(`/community/margins?bookId=${bookId}&page=${page}&limit=${limit}`).then((data) => {
      if (data) setMargins(data.margins);
      setLoading(false);
    });
  }, [bookId, page, limit]);

  return { margins, loading };
}

export function useCommunityReplies(marginId?: number) {
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!marginId) return;
    setLoading(true);
    get<{ replies: CommunityReply[] }>(`/community/margins/${marginId}/replies`).then((data) => {
      if (data) setReplies(data.replies);
      setLoading(false);
    });
  }, [marginId]);

  return { replies, loading };
}

export function formatCommunityMarginAge(createdAt: string): string {
  const now = Date.now();
  const then = new Date(createdAt).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 604800)}sem`;
}

export function useCommunityMargin(id: number | null) {
  const [margin, setMargin] = useState<CommunityMargin | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    get<{ margin: CommunityMargin }>(`/community/margins/${id}`).then((data) => {
      if (data) setMargin(data.margin);
      else setNotFound(true);
      setLoading(false);
    });
  }, [id]);

  return { margin, loading, notFound };
}

export function totalReactions(reactions: Record<string, number>): number {
  return Object.values(reactions).reduce((a, b) => a + b, 0);
}
