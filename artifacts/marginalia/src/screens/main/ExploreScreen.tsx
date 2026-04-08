import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { MOCK_BOOKS, MOCK_MARGINS } from "@/data/mockData";
import { MarginCard } from "@/components/cards/MarginCard";
import { BookCover } from "@/components/BookCover";
import { useApp } from "@/context/AppContext";
import { useCommunityTrending, type CommunityBook } from "@/hooks/useCommunity";

interface GoogleBookResult {
  externalId: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string | null;
  publishYear: number | null;
  totalPages: number;
  genres: string[];
  language: string;
}

async function searchGoogleBooks(query: string): Promise<GoogleBookResult[]> {
  if (!query.trim()) return [];
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=8&printType=books`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).map((item: { id: string; volumeInfo: { title: string; authors?: string[]; description?: string; publishedDate?: string; pageCount?: number; categories?: string[]; imageLinks?: { thumbnail?: string }; language?: string } }) => {
      const v = item.volumeInfo;
      return {
        externalId: item.id,
        title: v.title ?? "Sem título",
        author: (v.authors ?? ["Autor desconhecido"]).join(", "),
        description: (v.description ?? "").slice(0, 200),
        coverUrl: v.imageLinks?.thumbnail?.replace("http://", "https://") ?? null,
        publishYear: v.publishedDate ? parseInt(v.publishedDate.slice(0, 4), 10) : null,
        totalPages: v.pageCount ?? 0,
        genres: v.categories ?? [],
        language: v.language ?? "",
      };
    });
  } catch {
    return [];
  }
}

const GENRE_MAIN = [
  "Literatura brasileira",
  "Romance literário",
  "Clássicos",
  "Filosofia",
  "Poesia",
];

const GENRE_ALL = [
  "Literatura brasileira",
  "Romance literário",
  "Clássicos",
  "Filosofia",
  "Poesia",
  "Realismo mágico",
  "Conto",
  "Ensaio",
  "Ficção contemporânea",
  "Drama",
  "Distopia",
  "Histórico",
  "Ficção científica",
  "Memória",
  "Terror",
];

export function ExploreScreen() {
  const { currentUser, isDark } = useApp();
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [genrePage, setGenrePage] = useState(0);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [genreFocused, setGenreFocused] = useState(false);
  const [googleResults, setGoogleResults] = useState<GoogleBookResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { books: communityTrending } = useCommunityTrending();
  const [communityGenreBooks, setCommunityGenreBooks] = useState<CommunityBook[]>([]);
  const [communityGenreLoading, setCommunityGenreLoading] = useState(false);
  const [communitySearchResults, setCommunitySearchResults] = useState<CommunityBook[]>([]);

  const selectGenre = (label: string) => {
    setSelectedGenre(label);
    setGenrePage(0);
    setGenreFocused(true);
    setShowAllGenres(false);
    setCommunityGenreBooks([]);
    setCommunityGenreLoading(true);
    fetch(`/api/community/books?genre=${encodeURIComponent(label)}&limit=20`)
      .then((r) => r.json())
      .then((d) => setCommunityGenreBooks(d.books ?? []))
      .catch(() => {})
      .finally(() => setCommunityGenreLoading(false));
  };

  const exitGenreFocus = () => {
    setGenreFocused(false);
    setSelectedGenre(null);
    setGenrePage(0);
    setCommunityGenreBooks([]);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setGoogleResults([]);
      setCommunitySearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const [googleRes, communityRes] = await Promise.all([
        searchGoogleBooks(query),
        fetch(`/api/community/books?search=${encodeURIComponent(query)}&limit=8`)
          .then((r) => r.json())
          .then((d) => (d.books ?? []) as CommunityBook[])
          .catch(() => [] as CommunityBook[]),
      ]);
      setGoogleResults(googleRes);
      setCommunitySearchResults(communityRes);
      setIsSearching(false);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const localResults = query.trim()
    ? MOCK_BOOKS.filter(
        (b) =>
          b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.author.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const hasSearchResults = localResults.length > 0 || googleResults.length > 0 || communitySearchResults.length > 0;

  const forYouBooks = MOCK_BOOKS.filter((b) =>
    b.genres.some((g) => currentUser.preferredGenres.includes(g))
  )
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, 4);

  const mostDiscussed = [...MOCK_BOOKS]
    .sort((a, b) => b.communityStats.debates - a.communityStats.debates)
    .slice(0, 4);
  void mostDiscussed;

  const trendingMargins = [...MOCK_MARGINS]
    .sort(
      (a, b) =>
        Object.values(b.reactions).reduce((x, y) => x + y, 0) -
        Object.values(a.reactions).reduce((x, y) => x + y, 0)
    )
    .slice(0, 3);

  /* ── Style helpers ─────────────────────────────────────────── */
  const cardStyle = {
    backgroundColor: isDark ? "#1E1A18" : "#F4EFE8",
    border: `1px solid ${isDark ? "rgba(215,198,182,0.18)" : "rgba(174,143,125,0.20)"}`,
    boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.40)" : "0 1px 6px rgba(69,69,69,0.06)",
  };
  const searchBarStyle = {
    backgroundColor: isDark ? "#201B17" : "rgba(235,230,219,0.75)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(174,143,125,0.14)"}`,
  };
  const dividerColor = isDark ? "rgba(174,143,125,0.18)" : "rgba(174,143,125,0.22)";
  const sectionLabel = { color: "var(--text-secondary)" } as const;
  const bookTitle = { color: "var(--text-primary)", fontWeight: 500 } as const;
  const authorText = { color: "var(--text-tertiary)" } as const;
  const metaText = { color: "var(--text-soft)" } as const;

  return (
    <div className="min-h-full" style={{ backgroundColor: isDark ? "#1C1916" : "#FAF8F3" }}>
      <div className="px-5 pt-10 pb-3">
        <h1 className="font-serif italic text-[28px] mb-1" style={{ color: "var(--text-primary)" }}>
          Explorar
        </h1>
        <p className="font-sans font-light text-[10px] mb-5 tracking-[0.04em]" style={{ color: "var(--text-tertiary)" }}>
          Descubra além do que você já conhece.
        </p>

        {/* Search bar */}
        <div className="flex items-center gap-3 rounded-[12px] px-4 py-3 mb-2" style={searchBarStyle}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-soft)" }} />
          <input
            data-testid="input-explore-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Livros, autores, trechos..."
            className="flex-1 bg-transparent font-sans font-light text-[13px] outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[9px]" style={{ color: "var(--text-soft)" }}>✕</button>
          )}
        </div>
      </div>

      <div className="px-5 pb-8 space-y-8">

        {/* ── Search Results ─────────────────────────────────────────── */}
        {query.trim() && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[8.5px] font-light tracking-[0.20em] uppercase" style={sectionLabel}>
                Resultados para &ldquo;{query}&rdquo;
              </span>
              {isSearching && <Loader2 className="w-3 h-3 text-[#AE8F7D]/60 animate-spin" />}
            </div>

            {localResults.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="font-sans font-light text-[8px] tracking-[0.14em] uppercase mb-2" style={metaText}>
                  Na comunidade
                </p>
                {localResults.map((book) => (
                  <Link key={book.id} href={`/book/${book.id}`} data-testid={`search-result-${book.id}`}>
                    <div className="rounded-[12px] p-4 flex items-center gap-3 transition-opacity active:opacity-70" style={cardStyle}>
                      <BookCover title={book.title} bookColor={book.bookColor} coverUrl={book.coverUrl} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-[15px] truncate" style={bookTitle}>{book.title}</p>
                        <p className="font-sans font-light text-[9px] tracking-[0.10em] uppercase mb-1" style={authorText}>{book.author}</p>
                        <p className="font-sans font-light text-[9px]" style={{ color: "#697962" }}>
                          {book.communityStats.totalMargins} posts · {book.communityStats.debates} debates
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {communitySearchResults.filter((cr) => !localResults.some((lr) => lr.title.toLowerCase() === cr.title.toLowerCase())).length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="font-sans font-light text-[8px] tracking-[0.14em] uppercase mb-2" style={metaText}>
                  Na comunidade
                </p>
                {communitySearchResults
                  .filter((cr) => !localResults.some((lr) => lr.title.toLowerCase() === cr.title.toLowerCase()))
                  .map((book) => (
                    <Link key={book.id} href={`/book/${book.id}`} data-testid={`search-community-${book.id}`}>
                      <div className="rounded-[12px] p-4 flex items-center gap-3 transition-opacity active:opacity-70" style={cardStyle}>
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="w-10 h-14 rounded-[5px] object-cover flex-shrink-0" style={{ backgroundColor: isDark ? "#302820" : "#EBE6DB" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-10 h-14 rounded-[5px] flex-shrink-0" style={{ backgroundColor: isDark ? "#302820" : "#EBE6DB" }} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-[15px] truncate" style={bookTitle}>{book.title}</p>
                          <p className="font-sans font-light text-[9px] tracking-[0.10em] uppercase mb-1" style={authorText}>{book.author}</p>
                          <p className="font-sans font-light text-[8px]" style={{ color: "#697962" }}>{book.marginCount} posts · {book.publicationYear ?? ""}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}

            {googleResults.length > 0 && (
              <div className="space-y-2">
                <p className="font-sans font-light text-[8px] tracking-[0.14em] uppercase mb-2" style={metaText}>
                  Descobertos fora do catálogo
                </p>
                {googleResults
                  .filter((gr) => !localResults.some((lr) => lr.title.toLowerCase() === gr.title.toLowerCase()) && !communitySearchResults.some((cr) => cr.title.toLowerCase() === gr.title.toLowerCase()))
                  .map((book) => (
                    <div
                      key={book.externalId}
                      className="rounded-[12px] p-4 flex items-center gap-3"
                      style={{ ...cardStyle, opacity: 0.8, borderStyle: "dashed" }}
                    >
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="w-10 h-14 rounded-[5px] object-cover flex-shrink-0" style={{ backgroundColor: isDark ? "#302820" : "#EBE6DB" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-10 h-14 rounded-[5px] flex-shrink-0" style={{ backgroundColor: isDark ? "#302820" : "#EBE6DB" }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-[15px] truncate" style={bookTitle}>{book.title}</p>
                        <p className="font-sans font-light text-[9px] tracking-[0.10em] uppercase mb-1" style={authorText}>{book.author}</p>
                        <p className="font-sans font-light text-[8px] text-[#AE8F7D]/60 italic">
                          Ainda não está no Marginalia
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {!isSearching && !hasSearchResults && (
              <p className="font-serif italic text-[13px] text-center py-6" style={{ color: "var(--text-soft)" }}>
                Nenhum resultado encontrado.
              </p>
            )}
          </section>
        )}

        {/* ── Para você ─────────────────────────────────────────────── */}
        {forYouBooks.length > 0 && !query && (
          <section data-testid="section-for-you">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-sans text-[8.5px] font-light tracking-[0.20em] uppercase" style={sectionLabel}>
                Para você
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: dividerColor }} />
            </div>
            <p className="font-sans font-light text-[9px] mb-3" style={{ color: "var(--text-soft)" }}>
              Baseado nos seus gêneros favoritos
            </p>
            <div className="grid grid-cols-2 gap-3">
              {forYouBooks.map((book) => (
                <Link key={book.id} href={`/book/${book.id}`} data-testid={`card-for-you-${book.id}`}>
                  <div className="rounded-[12px] overflow-hidden transition-opacity active:opacity-70" style={cardStyle}>
                    {/* Cover or color block */}
                    <div className="relative h-28 overflow-hidden">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: book.bookColor ?? "#BDAB9C", opacity: isDark ? 0.7 : 1 }} />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-serif text-[13px] leading-tight line-clamp-2 mb-0.5" style={bookTitle}>{book.title}</p>
                      <p className="font-sans font-light text-[8px] uppercase tracking-[0.10em] mb-1.5" style={authorText}>{book.author}</p>
                      <p className="font-sans font-light text-[8px]" style={{ color: "#697962" }}>
                        {book.communityStats.activeReaders} leitores ativos
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Em alta na comunidade ─────────────────────────────────── */}
        {!query && communityTrending.length > 0 && (
          <section data-testid="section-most-discussed">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-sans text-[8.5px] font-light tracking-[0.20em] uppercase" style={sectionLabel}>
                Em alta na comunidade
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: dividerColor }} />
            </div>
            <p className="font-sans font-light text-[9px] mb-3" style={{ color: "var(--text-soft)" }}>Os livros mais anotados agora</p>
            <div className="space-y-2">
              {communityTrending.slice(0, 6).map((book, idx) => (
                <Link key={book.id} href={`/book/${book.id}`} data-testid={`card-discussed-${book.id}`}>
                  <div className="rounded-[12px] p-4 flex items-center gap-4 transition-opacity active:opacity-70" style={cardStyle}>
                    {/* Rank */}
                    <span
                      className="font-serif italic text-[20px] w-7 flex-shrink-0 text-center"
                      style={{ color: idx === 0 ? "#AE8F7D" : "var(--text-soft)", fontWeight: idx === 0 ? 500 : 300 }}
                    >
                      {idx + 1}
                    </span>
                    {/* Cover */}
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-10 h-14 rounded-[5px] object-cover flex-shrink-0" style={{ backgroundColor: isDark ? "#302820" : "#EBE6DB" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-10 h-14 rounded-[5px] flex-shrink-0" style={{ backgroundColor: isDark ? "#302820" : "#EBE6DB" }} />
                    )}
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-[14px] truncate" style={bookTitle}>{book.title}</p>
                      <p className="font-sans font-light text-[8px] uppercase tracking-[0.10em] mb-1" style={authorText}>{book.author}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-light text-[8px]" style={{ color: "#697962" }}>{book.marginCount} posts</span>
                        {book.genres && (book.genres as string[]).length > 0 && (
                          <>
                            <span style={{ color: "rgba(174,143,125,0.35)" }}>·</span>
                            <span className="font-sans font-light text-[8px]" style={metaText}>{(book.genres as string[])[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Top badge for #1 */}
                    {idx === 0 && (
                      <span className="font-sans text-[7px] tracking-[0.12em] uppercase px-2 py-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: isDark ? "rgba(174,143,125,0.15)" : "rgba(174,143,125,0.12)", color: "#AE8F7D" }}>
                        #1
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Genre focused view ────────────────────────────────────── */}
        {!query && genreFocused && selectedGenre && (() => {
          const PAGE_SIZE = 6;
          const mockBooks = MOCK_BOOKS.filter((b) =>
            b.genres.some((g) =>
              g.toLowerCase().includes(selectedGenre.toLowerCase()) ||
              selectedGenre.toLowerCase().includes(g.toLowerCase())
            )
          );
          const communityTitles = new Set(communityGenreBooks.map((b) => b.title.toLowerCase()));
          const extraMockBooks = mockBooks.filter((b) => !communityTitles.has(b.title.toLowerCase()));
          type UnifiedBook = {
            id: string | number;
            title: string;
            author: string;
            coverUrl?: string | null;
            bookColor?: string;
            marginCount?: number;
            publicationYear?: number | null;
          };
          const allBooks: UnifiedBook[] = [
            ...communityGenreBooks.map((b) => ({
              id: b.id,
              title: b.title,
              author: b.author,
              coverUrl: b.coverUrl,
              bookColor: b.bookColor,
              marginCount: b.marginCount,
              publicationYear: b.publicationYear,
            })),
            ...extraMockBooks.map((b) => ({
              id: b.id,
              title: b.title,
              author: b.author,
              coverUrl: null as null,
              bookColor: b.bookColor,
              marginCount: b.marginCount,
              publicationYear: b.publicationYear,
            })),
          ];
          const totalPages = Math.max(1, Math.ceil(allBooks.length / PAGE_SIZE));
          const safePage = Math.min(genrePage, totalPages - 1);
          const pageBooks = allBooks.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

          return (
            <section data-testid="section-genres-trending" className="feed-enter">
              {/* Genre section header */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={exitGenreFocus}
                  className="transition-colors flex-shrink-0"
                  style={{ color: "var(--text-soft)" }}
                  aria-label="Voltar aos gêneros"
                >
                  ←
                </button>
                <span className="font-sans text-[8.5px] font-light tracking-[0.20em] uppercase flex-1" style={sectionLabel}>
                  Principais gêneros
                </span>
              </div>

              {/* Selected genre chip */}
              <div className="flex items-center justify-between rounded-[10px] py-3 px-4 mb-5"
                style={{
                  backgroundColor: isDark ? "rgba(174,143,125,0.10)" : "rgba(174,143,125,0.08)",
                  border: "1px solid rgba(174,143,125,0.28)",
                }}>
                <span className="font-sans font-light text-[14px]" style={{ color: "var(--text-primary)" }}>{selectedGenre}</span>
                <button
                  onClick={exitGenreFocus}
                  className="font-sans text-[8px] font-light hover:text-[#AE8F7D] transition-colors rounded-full px-2.5 py-1"
                  style={{ color: "var(--text-tertiary)", border: "1px solid rgba(174,143,125,0.30)" }}
                >
                  Trocar gênero
                </button>
              </div>

              {communityGenreLoading && (
                <div className="flex items-center justify-center py-8 gap-2">
                  <Loader2 className="w-4 h-4 text-[#AE8F7D]/50 animate-spin" />
                  <span className="font-sans font-light text-[10px]" style={{ color: "var(--text-soft)" }}>Buscando livros...</span>
                </div>
              )}

              {!communityGenreLoading && allBooks.length === 0 && (
                <p className="font-serif italic text-[13px] text-center py-6" style={{ color: "var(--text-soft)" }}>
                  Nenhum livro encontrado neste gênero ainda.
                </p>
              )}

              {!communityGenreLoading && allBooks.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-sans text-[8px] font-light tracking-[0.14em] uppercase text-[#AE8F7D]">
                      {allBooks.length} {allBooks.length === 1 ? "livro" : "livros"}
                    </p>
                    {totalPages > 1 && (
                      <p className="font-sans font-light text-[8px]" style={metaText}>
                        página {safePage + 1} de {totalPages}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 mb-5">
                    {pageBooks.map((book) => (
                      <Link key={`${book.id}`} href={`/book/${book.id}`} data-testid={`genre-book-${book.id}`}>
                        <div className="rounded-[12px] p-4 flex items-center gap-4 transition-opacity active:opacity-70" style={cardStyle}>
                          {book.coverUrl ? (
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-10 h-14 rounded-[5px] object-cover flex-shrink-0"
                              style={{ backgroundColor: isDark ? "#302820" : "#EBE6DB" }}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <div
                              className="w-10 h-14 rounded-[5px] flex-shrink-0"
                              style={{ backgroundColor: book.bookColor ?? (isDark ? "#302820" : "#EBE6DB") }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-[14px] truncate" style={bookTitle}>{book.title}</p>
                            <p className="font-sans font-light text-[8px] uppercase tracking-[0.10em] mb-1" style={authorText}>{book.author}</p>
                            <div className="flex items-center gap-2">
                              {(book.marginCount ?? 0) > 0 && (
                                <span className="font-sans font-light text-[8px]" style={{ color: "#697962" }}>{book.marginCount} posts</span>
                              )}
                              {book.publicationYear && (
                                <>
                                  <span style={{ color: "rgba(174,143,125,0.30)" }}>·</span>
                                  <span className="font-sans font-light text-[8px]" style={metaText}>{book.publicationYear}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setGenrePage((p) => Math.max(0, p - 1))}
                        disabled={safePage === 0}
                        className="font-sans text-[9px] font-light tracking-[0.1em] uppercase text-[#AE8F7D] disabled:opacity-30 border border-[#AE8F7D]/25 disabled:border-[#AE8F7D]/10 rounded-full px-4 py-2 hover:bg-[#AE8F7D]/5 disabled:cursor-not-allowed transition-all"
                      >
                        ← anterior
                      </button>
                      <div className="flex gap-1.5 items-center">
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setGenrePage(i)}
                            className={`rounded-full transition-all duration-200 ${
                              i === safePage
                                ? "w-4 h-1.5 bg-[#AE8F7D]"
                                : "w-1.5 h-1.5 bg-[#AE8F7D]/25 hover:bg-[#AE8F7D]/50"
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setGenrePage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={safePage === totalPages - 1}
                        className="font-sans text-[9px] font-light tracking-[0.1em] uppercase text-[#AE8F7D] disabled:opacity-30 border border-[#AE8F7D]/25 disabled:border-[#AE8F7D]/10 rounded-full px-4 py-2 hover:bg-[#AE8F7D]/5 disabled:cursor-not-allowed transition-all"
                      >
                        próxima →
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          );
        })()}

        {/* ── Principais gêneros — browse mode ─────────────────────── */}
        {!query && !genreFocused && (
          <section data-testid="section-genres-trending">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[8.5px] font-light tracking-[0.20em] uppercase" style={sectionLabel}>
                Principais gêneros
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: dividerColor }} />
              <button
                onClick={() => setShowAllGenres((v) => !v)}
                className="font-sans text-[8px] font-light hover:text-[#AE8F7D] transition-colors"
                style={{ color: "var(--text-soft)" }}
              >
                {showAllGenres ? "Ver menos" : "Ver todos"}
              </button>
            </div>
            <div className="space-y-0.5">
              {(showAllGenres ? GENRE_ALL : GENRE_MAIN).map((label) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => selectGenre(label)}
                  className="w-full flex items-center justify-between py-3 px-3 rounded-[10px] border border-transparent transition-all text-left"
                  style={{
                    ["--hover-bg" as string]: isDark ? "rgba(174,143,125,0.07)" : "rgba(235,230,219,0.65)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark ? "rgba(174,143,125,0.07)" : "rgba(235,230,219,0.65)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? "rgba(174,143,125,0.15)" : "rgba(174,143,125,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
                  }}
                >
                  <span className="font-sans font-light text-[13.5px]" style={{ color: "var(--text-primary)" }}>{label}</span>
                  <span className="text-[12px]" style={{ color: "var(--text-soft)" }}>›</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Em alta esta semana ───────────────────────────────────── */}
        {!query && (
          <section data-testid="section-trending">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-sans text-[8.5px] font-light tracking-[0.20em] uppercase" style={sectionLabel}>
                Em alta esta semana
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: dividerColor }} />
            </div>
            <p className="font-sans font-light text-[9px] mb-3" style={{ color: "var(--text-soft)" }}>
              Os posts mais reagidos da comunidade
            </p>
            <div className="space-y-3">
              {trendingMargins.map((m) => (
                <MarginCard key={m.id} margin={m} showBook />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
