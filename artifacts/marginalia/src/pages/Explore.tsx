import { Search } from "lucide-react";
import { useGetExplore } from "@workspace/api-client-react";
import { AnnotationCard } from "@/components/AnnotationCard";
import { BookCover } from "@/components/BookCover";
import { Link } from "wouter";

export default function Explore() {
  const { data: explore, isLoading } = useGetExplore();

  return (
    <div className="min-h-full bg-[#FAF8F3]">
      <div className="px-5 pt-8 pb-2">
        <h1 className="font-serif italic text-[24px] text-[#454545] mb-5">Explorar</h1>

        {/* Search */}
        <div className="flex items-center gap-3 bg-[#EBE6DB] rounded-[10px] px-4 py-3 mb-6 border border-[#AE8F7D]/15">
          <Search className="w-4 h-4 text-[#454545]/30 flex-shrink-0" />
          <input
            data-testid="input-search"
            type="search"
            placeholder="Buscar livros, trechos, leitores..."
            className="flex-1 bg-transparent font-sans font-light text-[12px] text-[#454545] placeholder:text-[#454545]/35 outline-none"
          />
        </div>
      </div>

      <div className="px-5 pb-8 space-y-8">
        {/* Trending */}
        <section data-testid="section-trending">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Em alta esta semana
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-[#EBE6DB] rounded-[12px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {explore?.trending.slice(0, 4).map((annotation) => (
                <AnnotationCard key={annotation.id} annotation={annotation} showBook />
              ))}
            </div>
          )}
        </section>

        {/* Readers */}
        <section data-testid="section-readers">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Leitores como você
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[#EBE6DB] rounded-[12px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {explore?.readers.map((reader) => (
                <div
                  key={reader.id}
                  data-testid={`card-reader-${reader.id}`}
                  className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[12px] p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-[#697962] flex items-center justify-center flex-shrink-0">
                      <span className="font-sans text-[11px] font-light text-[#FAF8F3]">{reader.initials}</span>
                    </div>
                    <div>
                      <div className="font-serif text-[14px] text-[#454545]">{reader.name}</div>
                      {reader.bio && (
                        <div className="font-sans font-light text-[9px] text-[#454545]/45">{reader.bio}</div>
                      )}
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-serif text-[16px] text-[#454545]">{reader.booksRead}</div>
                      <div className="font-sans font-light text-[8px] tracking-[0.08em] uppercase text-[#454545]/35">Livros</div>
                    </div>
                  </div>
                  <div className="border-t border-[#454545]/6 pt-2">
                    <p className="font-serif italic text-[11px] text-[#AE8F7D]">{reader.identityPhrase}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Emerging Books */}
        <section data-testid="section-emerging-books">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Livros emergentes
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-[#EBE6DB] rounded-[12px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {explore?.emergingBooks.map((book) => (
                <Link key={book.id} href={`/book/${book.id}`} data-testid={`card-book-${book.id}`}>
                  <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[12px] overflow-hidden">
                    <div className="h-28">
                      <BookCover />
                    </div>
                    <div className="p-3">
                      <p className="font-serif text-[13px] text-[#454545] leading-tight mb-0.5">{book.title}</p>
                      <p className="font-sans font-light text-[9px] tracking-[0.06em] uppercase text-[#454545]/40">{book.author}</p>
                      <div className="mt-2 w-full h-[2px] bg-[#EBE6DB] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#AE8F7D]/60 rounded-full"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
