import { useParams, Link } from "wouter";
import { ArrowLeft, Lock } from "lucide-react";
import { useGetBook, useGetBookCards, getGetBookQueryKey } from "@workspace/api-client-react";
import { BookCover } from "@/components/BookCover";
import { AnnotationCard } from "@/components/AnnotationCard";

export default function BookHub() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "1", 10);

  const { data: book, isLoading } = useGetBook(id, {
    query: { enabled: !!id, queryKey: getGetBookQueryKey(id) },
  });
  const { data: cards } = useGetBookCards(id, {
    query: { enabled: !!id },
  });

  if (isLoading) {
    return (
      <div className="min-h-full bg-[#FAF8F3] px-5 py-8">
        <div className="h-48 bg-[#EBE6DB] rounded-[14px] animate-pulse mb-4" />
        <div className="h-32 bg-[#EBE6DB] rounded-[14px] animate-pulse" />
      </div>
    );
  }

  if (!book) return null;

  return (
    <div className="min-h-full bg-[#FAF8F3]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <Link href="/">
          <button data-testid="button-back" className="text-[#454545]/50 hover:text-[#454545] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif italic text-[18px] text-[#454545] leading-tight truncate">{book.title}</h1>
          <p className="font-sans font-light text-[9px] tracking-[0.12em] uppercase text-[#454545]/40">{book.author}</p>
        </div>
      </div>

      <div className="px-5 space-y-7 pb-8">
        {/* Progress */}
        <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[14px] p-5 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-20 rounded-[8px] overflow-hidden flex-shrink-0">
              <BookCover size="sm" />
            </div>
            <div className="flex-1">
              <div className="flex items-end gap-2 mb-2">
                <span className="font-serif italic text-[42px] leading-none text-[#AE8F7D]">
                  {Math.round(book.progress)}
                </span>
                <span className="font-sans font-light text-[14px] text-[#454545]/40 mb-1">%</span>
              </div>
              <div className="text-[9px] font-sans font-light tracking-[0.08em] text-[#454545]/35 uppercase">
                Pág. {book.currentPage} de {book.totalPages}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="w-full h-[3px] bg-[#EBE6DB] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#AE8F7D] rounded-full transition-all duration-700"
                style={{ width: `${book.progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Notas", value: book.annotations },
              { label: "Destaques", value: book.highlights },
              { label: "Debates", value: book.debates },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#EBE6DB]/40 rounded-[8px] p-3 text-center">
                <div className="font-serif text-[22px] text-[#454545]">{stat.value}</div>
                <div className="font-sans font-light text-[8px] tracking-[0.12em] uppercase text-[#454545]/40 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          <Link
            href={`/reader/${book.id}`}
            data-testid="button-continue-reading-hub"
            className="block w-full text-center bg-[#454545] text-[#FAF8F3] font-sans text-[11px] font-light tracking-[0.08em] py-3 rounded-[8px] hover:bg-[#454545]/90 transition-colors"
          >
            Continuar lendo
          </Link>
        </div>

        {/* Heatmap */}
        {book.heatmap && book.heatmap.length > 0 && (
          <section data-testid="section-heatmap">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Momentos do livro
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[14px] p-4">
              <div className="space-y-2">
                {book.heatmap.map((entry, i) => (
                  <div key={i} data-testid={`heatmap-chapter-${entry.chapter}`} className="flex items-center gap-3">
                    <span className="font-sans font-light text-[9px] tracking-[0.06em] text-[#454545]/40 w-6 flex-shrink-0">
                      {entry.chapter}
                    </span>
                    <div className="flex-1 relative h-4 flex items-center">
                      {entry.locked ? (
                        <div className="w-full h-[4px] rounded-full bg-[#454545]/15 filter blur-[0.5px]" />
                      ) : (
                        <div
                          className="h-[4px] rounded-full transition-all duration-500"
                          style={{
                            width: `${entry.intensity * 100}%`,
                            backgroundColor: "#AE8F7D",
                            opacity: 0.3 + entry.intensity * 0.7,
                          }}
                        />
                      )}
                    </div>
                    {entry.locked ? (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Lock className="w-2.5 h-2.5 text-[#454545]/25" />
                        <span className="font-sans font-light text-[8px] text-[#454545]/25">em breve</span>
                      </div>
                    ) : (
                      <span className="font-sans font-light text-[9px] text-[#454545]/30 flex-shrink-0 w-16 text-right truncate">
                        {entry.chapterTitle}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recent Annotations */}
        {book.recentAnnotations && book.recentAnnotations.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Insights recentes
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <div className="space-y-3">
              {book.recentAnnotations.map((a) => (
                <AnnotationCard key={a.id} annotation={a} />
              ))}
            </div>
          </section>
        )}

        {/* Shareable Cards */}
        {cards && cards.length > 0 && (
          <section data-testid="section-cards">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Cards do livro
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <div className="space-y-3">
              {cards.map((card) => (
                <ShareableCard key={card.id} card={card} bookTitle={book.title} bookAuthor={book.author} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ShareableCard({ card, bookTitle, bookAuthor }: {
  card: { id: number; type: string; title: string; content: string; excerpt?: string | null; chapter?: string | null; progressAt?: number | null; stats?: Record<string, number> | null };
  bookTitle: string;
  bookAuthor: string;
}) {
  return (
    <div
      data-testid={`card-shareable-${card.id}`}
      className="relative rounded-[14px] border border-[#AE8F7D]/20 p-5 overflow-hidden"
      style={{
        background: "#FAF8F3",
        backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.1) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
        boxShadow: "0 2px 16px rgba(69,69,69,0.05)",
      }}
    >
      {/* Dog-ear decoration */}
      <div className="absolute top-0 right-0 opacity-[0.06]">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <polygon points="0,0 40,0 40,40" fill="#AE8F7D" />
        </svg>
      </div>

      {/* Marginalia logo */}
      <div className="font-serif italic text-[9px] text-[#454545]/30 mb-3">Marginalia</div>

      {/* Type label */}
      <div className="font-sans text-[7px] font-light tracking-[0.18em] uppercase text-[#AE8F7D] mb-2">
        {card.title}
      </div>

      {card.type === "progress" && card.progressAt != null ? (
        <div className="mb-3">
          <div className="flex items-end gap-1 mb-2">
            <span className="font-serif italic text-[48px] leading-none text-[#AE8F7D]">
              {Math.round(card.progressAt)}
            </span>
            <span className="font-sans font-light text-sm text-[#454545]/40 mb-2">%</span>
          </div>
          <p className="font-serif text-[16px] text-[#454545] mb-2">{bookTitle}</p>
        </div>
      ) : card.type === "reaction" ? (
        <p className="font-serif italic text-[20px] text-[#454545] leading-tight mb-3">
          &ldquo;{card.content}&rdquo;
        </p>
      ) : card.type === "identity" ? (
        <p className="font-serif italic text-[16px] text-[#454545] leading-relaxed mb-3">
          &ldquo;{card.content}&rdquo;
        </p>
      ) : (
        <>
          {card.excerpt && (
            <p className="font-serif italic text-[13px] text-[#3D3D3D] leading-relaxed mb-2 border-l-2 border-[#AE8F7D]/50 pl-3">
              &ldquo;{card.excerpt}&rdquo;
            </p>
          )}
          {card.content && card.content !== card.excerpt && (
            <p className="font-serif text-[13px] text-[#454545]/70 leading-relaxed mb-2">{card.content}</p>
          )}
        </>
      )}

      {card.stats && Object.keys(card.stats).length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {Object.entries(card.stats).map(([label, value]) => (
            <div key={label} className="text-center">
              <div className="font-serif text-[18px] text-[#454545]">{value}</div>
              <div className="font-sans font-light text-[8px] tracking-[0.1em] uppercase text-[#454545]/35">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-[#454545]/8">
        <div>
          <div className="font-sans font-light text-[8px] tracking-[0.12em] uppercase text-[#454545]/35">{bookTitle}</div>
          <div className="font-serif italic text-[10px] text-[#454545]/50">{bookAuthor}</div>
        </div>
        <button
          data-testid={`button-share-card-${card.id}`}
          className="font-sans font-light text-[8px] tracking-[0.1em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/30 px-3 py-1.5 rounded-full hover:bg-[#AE8F7D]/5 transition-colors"
        >
          Compartilhar
        </button>
      </div>
    </div>
  );
}
