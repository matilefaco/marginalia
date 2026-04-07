import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { MOCK_BOOKS, MOCK_USERS, MOCK_MARGINS } from "@/data/mockData";
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
  const { currentUser } = useApp();
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [genreBooksLimit, setGenreBooksLimit] = useState(8);
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
    setGenreBooksLimit(8);
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
    setGenreBooksLimit(8);
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

  // "For you" — books matching user's preferred genres, not already in library
  const forYouBooks = MOCK_BOOKS.filter((b) =>
    b.genres.some((g) => currentUser.preferredGenres.includes(g))
  )
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, 4);

  // Most discussed
  const mostDiscussed = [...MOCK_BOOKS]
    .sort((a, b) => b.communityStats.debates - a.communityStats.debates)
    .slice(0, 4);

  // Trending margins (most reactions)
  const trendingMargins = [...MOCK_MARGINS]
    .sort(
      (a, b) =>
        Object.values(b.reactions).reduce((x, y) => x + y, 0) -
        Object.values(a.reactions).reduce((x, y) => x + y, 0)
    )
    .slice(0, 3);

  const compatibleReaders = MOCK_USERS.filter((u) => u.id !== currentUser.id)
    .sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));

  return (
    <div className="min-h-full bg-[#FAF8F3]">
      <div className="px-5 pt-10 pb-3">
        <h1 className="font-serif italic text-[28px] text-[#3D3D3D] mb-1">Explorar</h1>
        <p className="font-sans font-light text-[10px] text-[#2A2A2A]/40 mb-5 tracking-[0.04em]">
          Descubra além do que você já conhece.
        </p>

        <div className="flex items-center gap-3 bg-[#EBE6DB]/70 rounded-[12px] px-4 py-3 mb-2 border border-[#AE8F7D]/10">
          <Search className="w-4 h-4 text-[#2A2A2A]/35 flex-shrink-0" />
          <input
            data-testid="input-explore-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Livros, autores, trechos..."
            className="flex-1 bg-transparent font-sans font-light text-[13px] text-[#2A2A2A] placeholder:text-[#2A2A2A]/30 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[#2A2A2A]/30 text-xs">✕</button>
          )}
        </div>
      </div>

      <div className="px-5 pb-8 space-y-8">
        {/* Search Results */}
        {query.trim() && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Resultados para &ldquo;{query}&rdquo;
              </span>
              {isSearching && <Loader2 className="w-3 h-3 text-[#AE8F7D]/60 animate-spin" />}
            </div>

            {/* Local results (Marginalia catalog) */}
            {localResults.length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="font-sans font-light text-[8px] tracking-[0.12em] uppercase text-[#2A2A2A]/35 mb-2">
                  Na comunidade
                </p>
                {localResults.map((book) => (
                  <Link key={book.id} href={`/book/${book.id}`} data-testid={`search-result-${book.id}`}>
                    <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[12px] p-4 flex items-center gap-3 hover:border-[#AE8F7D]/35 transition-colors">
                      <BookCover title={book.title} bookColor={book.bookColor} coverUrl={book.coverUrl} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-[15px] text-[#3D3D3D] truncate">{book.title}</p>
                        <p className="font-sans font-light text-[9px] tracking-[0.08em] uppercase text-[#2A2A2A]/40 mb-1">{book.author}</p>
                        <p className="font-sans font-light text-[9px] text-[#697962]">
                          {book.communityStats.totalMargins} margens · {book.communityStats.debates} debates
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Community catalog results */}
            {communitySearchResults.filter((cr) => !localResults.some((lr) => lr.title.toLowerCase() === cr.title.toLowerCase())).length > 0 && (
              <div className="space-y-2 mb-4">
                <p className="font-sans font-light text-[8px] tracking-[0.12em] uppercase text-[#2A2A2A]/35 mb-2">
                  Na comunidade
                </p>
                {communitySearchResults
                  .filter((cr) => !localResults.some((lr) => lr.title.toLowerCase() === cr.title.toLowerCase()))
                  .map((book) => (
                    <Link key={book.id} href={`/book/${book.id}`} data-testid={`search-community-${book.id}`}>
                      <div className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] p-4 flex items-center gap-3 hover:border-[#AE8F7D]/35 active:opacity-75 transition-all">
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="w-10 h-14 rounded-[5px] object-cover flex-shrink-0 bg-[#EBE6DB]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-10 h-14 rounded-[5px] bg-[#EBE6DB] flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-[15px] text-[#3D3D3D] truncate">{book.title}</p>
                          <p className="font-sans font-light text-[9px] tracking-[0.08em] uppercase text-[#2A2A2A]/40 mb-1">{book.author}</p>
                          <p className="font-sans font-light text-[8px] text-[#697962]">{book.marginCount} margens · {book.publicationYear ?? ""}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}

            {/* Google Books results — discovery only, not yet in catalog */}
            {googleResults.length > 0 && (
              <div className="space-y-2">
                <p className="font-sans font-light text-[8px] tracking-[0.12em] uppercase text-[#2A2A2A]/35 mb-2">
                  Descobertos fora do catálogo
                </p>
                {googleResults
                  .filter((gr) => !localResults.some((lr) => lr.title.toLowerCase() === gr.title.toLowerCase()) && !communitySearchResults.some((cr) => cr.title.toLowerCase() === gr.title.toLowerCase()))
                  .map((book) => (
                    <div
                      key={book.externalId}
                      className="bg-[#FAF8F3] border border-dashed border-[#AE8F7D]/20 rounded-[12px] p-4 flex items-center gap-3 opacity-80"
                    >
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-10 h-14 rounded-[5px] object-cover flex-shrink-0 bg-[#EBE6DB]"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-10 h-14 rounded-[5px] bg-[#EBE6DB] flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-[15px] text-[#3D3D3D] truncate">{book.title}</p>
                        <p className="font-sans font-light text-[9px] tracking-[0.08em] uppercase text-[#2A2A2A]/40 mb-1">{book.author}</p>
                        <p className="font-sans font-light text-[8px] text-[#AE8F7D]/60 italic">
                          Ainda não está no Marginalia
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {!isSearching && !hasSearchResults && (
              <p className="font-serif italic text-[13px] text-[#2A2A2A]/35 text-center py-6">
                Nenhum resultado encontrado.
              </p>
            )}
          </section>
        )}

        {/* For You */}
        {forYouBooks.length > 0 && !query && (
          <section data-testid="section-for-you">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Para você
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40 mb-3">
              Baseado nos seus gêneros favoritos
            </p>
            <div className="grid grid-cols-2 gap-3">
              {forYouBooks.map((book) => (
                <Link key={book.id} href={`/book/${book.id}`} data-testid={`card-for-you-${book.id}`}>
                  <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[12px] overflow-hidden hover:border-[#AE8F7D]/35 transition-colors">
                    <div className="h-24 bg-gradient-to-b from-[#EBE6DB] to-[#BDAB9C]/40" />
                    <div className="p-3">
                      <p className="font-serif text-[13px] text-[#3D3D3D] leading-tight line-clamp-2 mb-0.5">{book.title}</p>
                      <p className="font-sans font-light text-[8px] uppercase tracking-[0.08em] text-[#2A2A2A]/40 mb-1.5">{book.author}</p>
                      <p className="font-sans font-light text-[8px] text-[#697962]">
                        {book.communityStats.activeReaders} leitores ativos
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Community trending books */}
        {!query && communityTrending.length > 0 && (
          <section data-testid="section-most-discussed">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Em alta na comunidade
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40 mb-3">Os livros mais anotados agora</p>
            <div className="space-y-2">
              {communityTrending.slice(0, 6).map((book, idx) => (
                <Link key={book.id} href={`/book/${book.id}`} data-testid={`card-discussed-${book.id}`}>
                  <div className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] p-4 flex items-center gap-4 hover:border-[#AE8F7D]/30 active:opacity-75 transition-all">
                    <span className="font-serif italic text-[22px] text-[#AE8F7D]/40 w-6 flex-shrink-0 text-center">{idx + 1}</span>
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-10 h-14 rounded-[5px] object-cover flex-shrink-0 bg-[#EBE6DB]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-10 h-14 rounded-[5px] bg-[#EBE6DB] flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-[14px] text-[#3D3D3D] truncate">{book.title}</p>
                      <p className="font-sans font-light text-[8px] uppercase tracking-[0.08em] text-[#2A2A2A]/40 mb-1">{book.author}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-light text-[8px] text-[#697962]">{book.marginCount} ecos</span>
                        {book.genres && book.genres.length > 0 && (
                          <>
                            <span className="text-[#AE8F7D]/25">·</span>
                            <span className="font-sans font-light text-[8px] text-[#2A2A2A]/35">{(book.genres as string[])[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Principais gêneros — focused mode */}
        {!query && genreFocused && selectedGenre && (() => {
          const allGenreBooks = MOCK_BOOKS.filter((b) =>
            b.genres.some((g) =>
              g.toLowerCase().includes(selectedGenre.toLowerCase()) ||
              selectedGenre.toLowerCase().includes(g.toLowerCase())
            )
          );
          const visibleBooks = allGenreBooks.slice(0, genreBooksLimit);
          const hasMore = allGenreBooks.length > genreBooksLimit;
          return (
            <section data-testid="section-genres-trending" className="feed-enter">
              {/* Genre header in focus mode */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={exitGenreFocus}
                  className="text-[#2A2A2A]/40 hover:text-[#AE8F7D] transition-colors flex-shrink-0"
                  aria-label="Voltar aos gêneros"
                >
                  ←
                </button>
                <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D] flex-1">
                  Principais gêneros
                </span>
              </div>

              {/* Selected genre chip */}
              <div className="flex items-center justify-between bg-[#AE8F7D]/10 border border-[#AE8F7D]/30 rounded-[10px] py-3 px-4 mb-4">
                <span className="font-sans font-light text-[14px] text-[#3D3D3D]">{selectedGenre}</span>
                <button
                  onClick={exitGenreFocus}
                  className="font-sans text-[8px] font-light text-[#AE8F7D]/70 hover:text-[#AE8F7D] transition-colors border border-[#AE8F7D]/30 rounded-full px-2.5 py-1"
                >
                  Trocar gênero
                </button>
              </div>

              {/* Books list */}
              <div className="flex items-center justify-between mb-3">
                <p className="font-sans text-[8px] font-light tracking-[0.14em] uppercase text-[#AE8F7D]">
                  Livros em {selectedGenre}
                </p>
                <p className="font-sans font-light text-[8px] text-[#2A2A2A]/30">
                  {allGenreBooks.length} {allGenreBooks.length === 1 ? "livro" : "livros"}
                </p>
              </div>

              {communityGenreLoading && (
                <div className="flex items-center justify-center py-6 gap-2">
                  <Loader2 className="w-4 h-4 text-[#AE8F7D]/50 animate-spin" />
                  <span className="font-sans font-light text-[10px] text-[#2A2A2A]/30">Buscando livros...</span>
                </div>
              )}

              {!communityGenreLoading && communityGenreBooks.length > 0 && (
                <div className="space-y-2 mb-4">
                  {communityGenreBooks.map((book) => (
                    <Link key={book.id} href={`/book/${book.id}`} data-testid={`genre-community-book-${book.id}`}>
                      <div className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] p-4 flex items-center gap-4 hover:border-[#AE8F7D]/30 active:opacity-75 transition-all">
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="w-10 h-14 rounded-[5px] object-cover flex-shrink-0 bg-[#EBE6DB]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-10 h-14 rounded-[5px] bg-[#EBE6DB] flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-[14px] text-[#3D3D3D] truncate">{book.title}</p>
                          <p className="font-sans font-light text-[8px] uppercase tracking-[0.08em] text-[#2A2A2A]/40 mb-1">{book.author}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-light text-[8px] text-[#697962]">{book.marginCount} ecos</span>
                            {book.publicationYear && (<><span className="text-[#AE8F7D]/25">·</span><span className="font-sans font-light text-[8px] text-[#2A2A2A]/30">{book.publicationYear}</span></>)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {!communityGenreLoading && communityGenreBooks.length === 0 && allGenreBooks.length === 0 && (
                <p className="font-serif italic text-[13px] text-[#2A2A2A]/35 text-center py-6">
                  Nenhum livro encontrado neste gênero ainda.
                </p>
              )}

              {allGenreBooks.length > 0 && (
                <>
                  {communityGenreBooks.length > 0 && (
                    <p className="font-sans font-light text-[8px] uppercase tracking-[0.14em] text-[#AE8F7D]/60 mb-2">Também em Marginalia</p>
                  )}
                  <div className="space-y-2">
                    {visibleBooks.map((book) => (
                      <Link key={book.id} href={`/book/${book.id}`}>
                        <div className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] p-4 flex items-center gap-4 hover:border-[#AE8F7D]/30 transition-colors">
                          <div
                            className="w-10 h-14 rounded-[5px] flex-shrink-0"
                            style={{ backgroundColor: book.bookColor }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-[14px] text-[#3D3D3D] truncate">{book.title}</p>
                            <p className="font-sans font-light text-[8px] uppercase tracking-[0.08em] text-[#2A2A2A]/40 mb-1">{book.author}</p>
                            <div className="flex items-center gap-2">
                              <span className="font-sans font-light text-[8px] text-[#697962]">
                                {book.communityStats.activeReaders} leitores
                              </span>
                              <span className="text-[#AE8F7D]/25">·</span>
                              <span className="font-sans font-light text-[8px] text-[#2A2A2A]/35">
                                {book.communityStats.totalMargins} margens
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {hasMore && (
                    <button
                      type="button"
                      onClick={() => setGenreBooksLimit((l) => l + 8)}
                      className="w-full mt-3 py-2.5 border border-dashed border-[#AE8F7D]/30 rounded-[10px] font-sans font-light text-[10px] tracking-[0.1em] text-[#AE8F7D] hover:bg-[#AE8F7D]/5 transition-colors"
                    >
                      Carregar mais · {allGenreBooks.length - genreBooksLimit} restantes
                    </button>
                  )}
                  {!hasMore && allGenreBooks.length > 0 && (
                    <p className="font-sans font-light text-[9px] text-[#2A2A2A]/30 text-center mt-3">
                      Todos os livros deste gênero
                    </p>
                  )}
                </>
              )}
            </section>
          );
        })()}

        {/* Principais gêneros — browse mode */}
        {!query && !genreFocused && (
          <section data-testid="section-genres-trending">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Principais gêneros
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
              <button
                onClick={() => setShowAllGenres((v) => !v)}
                className="font-sans text-[8px] font-light text-[#2A2A2A]/40 hover:text-[#AE8F7D] transition-colors"
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
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-[10px] border border-transparent hover:bg-[#EBE6DB]/60 hover:border-[#AE8F7D]/10 transition-all text-left"
                >
                  <span className="font-sans font-light text-[13px] text-[#2A2A2A]/70">{label}</span>
                  <span className="text-[#2A2A2A]/20 text-[10px]">›</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Trending Margins */}
        {!query && (
          <section data-testid="section-trending">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Margens em alta esta semana
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40 mb-3">
              As mais reagidas da comunidade
            </p>
            <div className="space-y-3">
              {trendingMargins.map((m) => (
                <MarginCard key={m.id} margin={m} showBook />
              ))}
            </div>
          </section>
        )}

        {/* Compatible Readers */}
        {!query && (
          <section data-testid="section-compatible-readers">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Leitores parecidos com você
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40 mb-3">
              Calculado por gêneros, livros e estilo de leitura
            </p>
            <div className="space-y-2">
              {compatibleReaders.map((reader) => (
                <Link key={reader.id} href={`/user/${reader.id}`}>
                  <div
                    data-testid={`card-reader-${reader.id}`}
                    className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] p-4 hover:border-[#AE8F7D]/30 transition-colors active:opacity-80"
                  >
                    <div className="flex items-center gap-3 mb-2.5">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: reader.avatarColor || "#697962" }}
                      >
                        <span className="font-sans text-[11px] text-[#FAF8F3]">{reader.initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-serif text-[14px] text-[#3D3D3D]">{reader.name}</div>
                        <div className="font-sans font-light text-[9px] text-[#2A2A2A]/40">{reader.username} · {reader.city}</div>
                      </div>
                      {reader.compatibilityScore && (
                        <div className="text-right flex-shrink-0">
                          <div className="font-serif text-[20px] text-[#AE8F7D] leading-none">{reader.compatibilityScore}%</div>
                          <div className="font-sans font-light text-[7px] tracking-[0.1em] uppercase text-[#2A2A2A]/30">compatível</div>
                        </div>
                      )}
                    </div>
                    <p className="font-serif italic text-[11px] text-[#AE8F7D]">&ldquo;{reader.readingSignature}&rdquo;</p>
                    {reader.bio && (
                      <p className="font-sans font-light text-[10px] text-[#2A2A2A]/45 mt-1.5 line-clamp-2">{reader.bio}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
