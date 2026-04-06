import { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "wouter";
import { MOCK_BOOKS, MOCK_USERS, MOCK_MARGINS } from "@/data/mockData";
import { MarginCard } from "@/components/cards/MarginCard";
import { useApp } from "@/context/AppContext";

const GENRE_TRENDING = [
  { label: "Literatura brasileira", count: 412, delta: "+18%", trend: "tendência" },
  { label: "Romance literário", count: 889, delta: "+7%", trend: "" },
  { label: "Clássicos", count: 634, delta: "+12%", trend: "" },
  { label: "Filosofia", count: 287, delta: "+31%", trend: "em alta" },
  { label: "Poesia", count: 201, delta: "+22%", trend: "" },
];

export function ExploreScreen() {
  const { currentUser } = useApp();
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const searchResults = query.trim()
    ? MOCK_BOOKS.filter(
        (b) =>
          b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.author.toLowerCase().includes(query.toLowerCase())
      )
    : [];

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

  const compatibleReaders = MOCK_USERS.filter((u) => u.id !== "user_me")
    .sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));

  return (
    <div className="min-h-full bg-[#FAF8F3]">
      <div className="px-5 pt-10 pb-3">
        <h1 className="font-serif italic text-[28px] text-[#3D3D3D] mb-1">Explorar</h1>
        <p className="font-sans font-light text-[10px] text-[#454545]/40 mb-5 tracking-[0.04em]">
          Descubra além do que você já conhece.
        </p>

        <div className="flex items-center gap-3 bg-[#EBE6DB]/70 rounded-[12px] px-4 py-3 mb-2 border border-[#AE8F7D]/10">
          <Search className="w-4 h-4 text-[#454545]/35 flex-shrink-0" />
          <input
            data-testid="input-explore-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Livros, autores, trechos..."
            className="flex-1 bg-transparent font-sans font-light text-[13px] text-[#454545] placeholder:text-[#454545]/30 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[#454545]/30 text-xs">✕</button>
          )}
        </div>
      </div>

      <div className="px-5 pb-8 space-y-8">
        {/* Search Results */}
        {searchResults.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Resultados para &ldquo;{query}&rdquo;
              </span>
            </div>
            <div className="space-y-2">
              {searchResults.map((book) => (
                <Link key={book.id} href={`/book/${book.id}`} data-testid={`search-result-${book.id}`}>
                  <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[12px] p-4 flex items-center gap-3 hover:border-[#AE8F7D]/35 transition-colors">
                    <div className="w-10 h-14 rounded-[5px] bg-[#EBE6DB] flex-shrink-0" />
                    <div>
                      <p className="font-serif text-[15px] text-[#3D3D3D]">{book.title}</p>
                      <p className="font-sans font-light text-[9px] tracking-[0.08em] uppercase text-[#454545]/40 mb-1">{book.author}</p>
                      <p className="font-sans font-light text-[9px] text-[#697962]">
                        {book.communityStats.totalMargins} margens · {book.communityStats.debates} debates
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
            <p className="font-sans font-light text-[9px] text-[#454545]/40 mb-3">
              Baseado nos seus gêneros favoritos
            </p>
            <div className="grid grid-cols-2 gap-3">
              {forYouBooks.map((book) => (
                <Link key={book.id} href={`/book/${book.id}`} data-testid={`card-for-you-${book.id}`}>
                  <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[12px] overflow-hidden hover:border-[#AE8F7D]/35 transition-colors">
                    <div className="h-24 bg-gradient-to-b from-[#EBE6DB] to-[#BDAB9C]/40" />
                    <div className="p-3">
                      <p className="font-serif text-[13px] text-[#3D3D3D] leading-tight line-clamp-2 mb-0.5">{book.title}</p>
                      <p className="font-sans font-light text-[8px] uppercase tracking-[0.08em] text-[#454545]/40 mb-1.5">{book.author}</p>
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

        {/* Most Discussed */}
        {!query && (
          <section data-testid="section-most-discussed">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Livros mais discutidos
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <div className="space-y-2">
              {mostDiscussed.map((book, idx) => (
                <Link key={book.id} href={`/book/${book.id}`} data-testid={`card-discussed-${book.id}`}>
                  <div className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] p-4 flex items-center gap-4 hover:border-[#AE8F7D]/30 transition-colors">
                    <span className="font-serif italic text-[22px] text-[#AE8F7D]/40 w-6 flex-shrink-0 text-center">
                      {idx + 1}
                    </span>
                    <div className="w-10 h-14 rounded-[5px] bg-[#EBE6DB] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-[14px] text-[#3D3D3D] truncate">{book.title}</p>
                      <p className="font-sans font-light text-[8px] uppercase tracking-[0.08em] text-[#454545]/40 mb-1">{book.author}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-light text-[8px] text-[#697962]">
                          {book.communityStats.debates} debates
                        </span>
                        <span className="text-[#AE8F7D]/25">·</span>
                        <span className="font-sans font-light text-[8px] text-[#454545]/35">
                          {book.communityStats.totalMargins} margens
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Genres in High */}
        {!query && (
          <section data-testid="section-genres-trending">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Gêneros em alta
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
              {selectedGenre && (
                <button
                  onClick={() => setSelectedGenre(null)}
                  className="font-sans text-[8px] font-light text-[#454545]/40 hover:text-[#AE8F7D] transition-colors"
                >
                  Ver todos
                </button>
              )}
            </div>
            <div className="space-y-1">
              {GENRE_TRENDING.map((genre) => {
                const isSelected = selectedGenre === genre.label;
                return (
                  <button
                    type="button"
                    key={genre.label}
                    onClick={() => setSelectedGenre(isSelected ? null : genre.label)}
                    className={`w-full flex items-center justify-between py-2.5 px-3 rounded-[10px] border transition-all text-left ${
                      isSelected
                        ? "bg-[#AE8F7D]/10 border-[#AE8F7D]/30"
                        : "border-transparent hover:bg-[#EBE6DB]/60 hover:border-[#AE8F7D]/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-sans font-light text-[13px] transition-colors ${
                        isSelected ? "text-[#3D3D3D]" : "text-[#454545]/70"
                      }`}>{genre.label}</span>
                      {genre.trend && (
                        <span className="font-sans font-light text-[8px] text-[#697962] bg-[#697962]/10 rounded-full px-2 py-0.5">
                          {genre.trend}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-sans font-light text-[9px] text-[#454545]/30">{genre.count} margens</span>
                      <span className={`font-sans font-light text-[9px] ${isSelected ? "text-[#AE8F7D]" : "text-[#697962]"}`}>
                        {genre.delta}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Books by selected genre */}
            {selectedGenre && (() => {
              const genreBooks = MOCK_BOOKS.filter((b) =>
                b.genres.some((g) => g.toLowerCase().includes(selectedGenre.toLowerCase()) || selectedGenre.toLowerCase().includes(g.toLowerCase()))
              );
              return (
                <div className="mt-4 feed-enter">
                  <p className="font-sans text-[8px] font-light tracking-[0.14em] uppercase text-[#AE8F7D] mb-3">
                    Livros em {selectedGenre}
                  </p>
                  {genreBooks.length === 0 ? (
                    <p className="font-serif italic text-[13px] text-[#454545]/35 text-center py-4">
                      Nenhum livro encontrado neste gênero ainda.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {genreBooks.map((book) => (
                        <Link key={book.id} href={`/book/${book.id}`}>
                          <div className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] p-4 flex items-center gap-4 hover:border-[#AE8F7D]/30 transition-colors">
                            <div
                              className="w-10 h-14 rounded-[5px] flex-shrink-0"
                              style={{ backgroundColor: book.bookColor }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-serif text-[14px] text-[#3D3D3D] truncate">{book.title}</p>
                              <p className="font-sans font-light text-[8px] uppercase tracking-[0.08em] text-[#454545]/40 mb-1">{book.author}</p>
                              <div className="flex items-center gap-2">
                                <span className="font-sans font-light text-[8px] text-[#697962]">
                                  {book.communityStats.activeReaders} leitores
                                </span>
                                <span className="text-[#AE8F7D]/25">·</span>
                                <span className="font-sans font-light text-[8px] text-[#454545]/35">
                                  {book.communityStats.totalMargins} margens
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
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
            <p className="font-sans font-light text-[9px] text-[#454545]/40 mb-3">
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
            <p className="font-sans font-light text-[9px] text-[#454545]/40 mb-3">
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
                        <div className="font-sans font-light text-[9px] text-[#454545]/40">{reader.username} · {reader.city}</div>
                      </div>
                      {reader.compatibilityScore && (
                        <div className="text-right flex-shrink-0">
                          <div className="font-serif text-[20px] text-[#AE8F7D] leading-none">{reader.compatibilityScore}%</div>
                          <div className="font-sans font-light text-[7px] tracking-[0.1em] uppercase text-[#454545]/30">compatível</div>
                        </div>
                      )}
                    </div>
                    <p className="font-serif italic text-[11px] text-[#AE8F7D]">&ldquo;{reader.readingSignature}&rdquo;</p>
                    {reader.bio && (
                      <p className="font-sans font-light text-[10px] text-[#454545]/45 mt-1.5 line-clamp-2">{reader.bio}</p>
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
