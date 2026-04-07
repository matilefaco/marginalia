import { useGetFeed } from "@workspace/api-client-react";
import { Link } from "wouter";
import { LogoMark } from "@/components/LogoMark";
import { AnnotationCard } from "@/components/AnnotationCard";
import { BookCover } from "@/components/BookCover";

export default function Home() {
  const { data: feed, isLoading } = useGetFeed();

  return (
    <div className="min-h-full bg-[#FAF8F3]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-8 pb-4">
        <div className="flex items-center gap-2">
          <LogoMark className="w-7 h-8" />
          <span className="font-serif italic text-lg text-[#454545]">Marginalia</span>
        </div>
        <span className="font-sans text-[10px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
          Leia junto
        </span>
      </div>

      <div className="px-5 pb-6 space-y-8">
        {/* Block 1: Continue Lendo */}
        {isLoading ? (
          <div className="rounded-[14px] bg-[#EBE6DB] h-36 animate-pulse" />
        ) : feed?.currentReading ? (
          <section data-testid="section-current-reading">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Lendo agora
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <div className="bg-[#FAF8F3] rounded-[14px] border border-[#AE8F7D]/15 shadow-sm p-5">
              <div className="flex gap-3 items-start mb-4">
                <div className="w-10 h-12 rounded flex-shrink-0">
                  <BookCover size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-[18px] text-[#454545] leading-tight mb-0.5">
                    {feed.currentReading.title}
                  </h2>
                  <p className="font-sans font-light text-[10px] tracking-[0.12em] uppercase text-[#454545]/45">
                    {feed.currentReading.author}
                  </p>
                </div>
              </div>

              <div className="mb-1">
                <div className="w-full h-[3px] bg-[#EBE6DB] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#AE8F7D] rounded-full transition-all duration-700"
                    style={{ width: `${feed.currentReading.progress}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-sans font-light text-[9px] tracking-[0.08em] text-[#454545]/35">
                  {Math.round(feed.currentReading.progress)}% · Pág. {feed.currentReading.currentPage} · {feed.currentReading.annotations} anotações
                </span>
                <span className="font-sans font-light text-[9px] tracking-[0.08em] text-[#454545]/35">
                  Cap. {feed.currentReading.currentChapter}
                </span>
              </div>

              <Link
                href={`/reader/${feed.currentReading.id}`}
                data-testid="button-continue-reading"
                className="block w-full text-center bg-[#454545] text-[#FAF8F3] font-sans text-[11px] font-light tracking-[0.08em] py-3 rounded-[8px] hover:bg-[#454545]/90 transition-colors"
              >
                Continuar lendo
              </Link>
            </div>
          </section>
        ) : null}

        {/* Block 2: Ecos do Seu Momento */}
        <section data-testid="section-echoes">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Respostas do seu momento
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <p className="font-sans font-light text-[9px] tracking-[0.08em] text-[#454545]/40 mb-3">
            Apenas do que você já leu — sem spoilers
          </p>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-[#EBE6DB] rounded-[12px] animate-pulse" />
              ))}
            </div>
          ) : feed?.echoes.length === 0 ? (
            <p className="font-serif italic text-sm text-[#454545]/40 text-center py-6">
              Nenhuma resposta ainda. O texto aguarda o seu gesto.
            </p>
          ) : (
            <div className="space-y-3">
              {feed?.echoes.map((annotation) => (
                <AnnotationCard key={annotation.id} annotation={annotation} />
              ))}
            </div>
          )}
        </section>

        {/* Block 3: Descobrir */}
        {feed?.discover && feed.discover.length > 0 && (
          <section data-testid="section-discover">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Descobrir
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {feed.discover.map((book) => (
                <Link
                  key={book.id}
                  href={`/book/${book.id}`}
                  data-testid={`card-discover-book-${book.id}`}
                  className="flex-shrink-0 w-32"
                >
                  <div className="w-32 h-40 rounded-[10px] border border-[#AE8F7D]/15 mb-2 overflow-hidden">
                    <BookCover />
                  </div>
                  <p className="font-serif text-[13px] text-[#454545] leading-tight">{book.title}</p>
                  <p className="font-sans font-light text-[9px] tracking-[0.08em] uppercase text-[#454545]/40 mt-0.5">
                    {book.author}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
