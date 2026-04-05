import { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "wouter";
import { MOCK_BOOKS, MOCK_USERS, MOCK_COLLECTIONS, MOCK_MARGINS } from "@/data/mockData";
import { MarginCard } from "@/components/cards/MarginCard";

export function ExploreScreen() {
  const [query, setQuery] = useState("");

  const searchResults = query.trim()
    ? MOCK_BOOKS.filter(
        (b) =>
          b.title.toLowerCase().includes(query.toLowerCase()) ||
          b.author.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const trending = [...MOCK_MARGINS]
    .sort(
      (a, b) =>
        Object.values(b.reactions).reduce((x, y) => x + y, 0) -
        Object.values(a.reactions).reduce((x, y) => x + y, 0)
    )
    .slice(0, 4);

  const trendingBooks = [...MOCK_BOOKS].sort((a, b) => b.trendingScore - a.trendingScore).slice(0, 4);
  const compatibleReaders = MOCK_USERS.filter((u) => u.id !== "user_me").sort(
    (a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0)
  );

  return (
    <div className="min-h-full bg-[#FAF8F3]">
      <div className="px-5 pt-8 pb-2">
        <h1 className="font-serif italic text-[26px] text-[#454545] mb-5">Explorar</h1>

        <div className="flex items-center gap-3 bg-[#EBE6DB]/70 rounded-[10px] px-4 py-3 mb-6 border border-[#AE8F7D]/10">
          <Search className="w-4 h-4 text-[#454545]/30 flex-shrink-0" />
          <input
            data-testid="input-explore-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Livros, autores, trechos, leitores..."
            className="flex-1 bg-transparent font-sans font-light text-[12px] text-[#454545] placeholder:text-[#454545]/30 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[#454545]/30 text-[11px]">✕</button>
          )}
        </div>
      </div>

      <div className="px-5 pb-8 space-y-8">
        {/* Search Results */}
        {searchResults.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Resultados
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <div className="space-y-2">
              {searchResults.map((book) => (
                <Link key={book.id} href={`/book/${book.id}`} data-testid={`search-result-${book.id}`}>
                  <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[12px] p-4 flex items-center gap-3 hover:border-[#AE8F7D]/30 transition-colors">
                    <div className="w-10 h-14 rounded-[4px] bg-[#EBE6DB] flex-shrink-0" />
                    <div>
                      <p className="font-serif text-[14px] text-[#454545]">{book.title}</p>
                      <p className="font-sans font-light text-[9px] tracking-[0.08em] uppercase text-[#454545]/40">{book.author}</p>
                      <p className="font-sans font-light text-[9px] text-[#697962] mt-0.5">
                        {book.communityStats.totalMargins} margens
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Collections */}
        <section data-testid="section-collections">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Coleções editoriais
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <div className="space-y-2">
            {MOCK_COLLECTIONS.map((col) => (
              <div
                key={col.id}
                data-testid={`card-collection-${col.id}`}
                className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[12px] p-4 hover:border-[#AE8F7D]/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-[6px] bg-[#697962]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px]">✦</span>
                  </div>
                  <div>
                    <p className="font-serif text-[14px] text-[#454545] mb-0.5">{col.title}</p>
                    <p className="font-sans font-light text-[10px] text-[#454545]/45">{col.description}</p>
                    <p className="font-sans font-light text-[9px] text-[#697962] mt-1">
                      {col.marginIds.length} margens
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trending Margins */}
        <section data-testid="section-trending">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Em alta esta semana
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <div className="space-y-3">
            {trending.map((m) => (
              <MarginCard key={m.id} margin={m} showBook />
            ))}
          </div>
        </section>

        {/* Books in Discussion */}
        <section data-testid="section-trending-books">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Livros em debate
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {trendingBooks.map((book) => (
              <Link key={book.id} href={`/book/${book.id}`} data-testid={`card-explore-book-${book.id}`}>
                <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[12px] overflow-hidden hover:border-[#AE8F7D]/30 transition-colors">
                  <div className="h-24 bg-[#EBE6DB]" />
                  <div className="p-3">
                    <p className="font-serif text-[12px] text-[#454545] leading-tight line-clamp-2 mb-0.5">{book.title}</p>
                    <p className="font-sans font-light text-[8px] uppercase tracking-[0.08em] text-[#454545]/40 mb-1.5">{book.author}</p>
                    <p className="font-sans font-light text-[8px] text-[#697962]">
                      {book.communityStats.totalMargins} margens · {book.communityStats.debates} debates
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Compatible Readers */}
        <section data-testid="section-compatible-readers">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Leitores como você
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <div className="space-y-2">
            {compatibleReaders.map((reader) => (
              <div key={reader.id} data-testid={`card-reader-${reader.id}`}
                className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[12px] p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#697962] flex items-center justify-center flex-shrink-0">
                    <span className="font-sans text-[11px] text-[#FAF8F3]">{reader.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-serif text-[14px] text-[#454545]">{reader.name}</div>
                    <div className="font-sans font-light text-[9px] text-[#454545]/40 truncate">{reader.username}</div>
                  </div>
                  {reader.compatibilityScore && (
                    <div className="text-right flex-shrink-0">
                      <div className="font-serif text-[18px] text-[#AE8F7D]">{reader.compatibilityScore}%</div>
                      <div className="font-sans font-light text-[7px] tracking-[0.08em] uppercase text-[#454545]/30">compatível</div>
                    </div>
                  )}
                </div>
                <div className="mt-2 pt-2 border-t border-[#454545]/5">
                  <p className="font-serif italic text-[11px] text-[#AE8F7D]">{reader.readingSignature}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
