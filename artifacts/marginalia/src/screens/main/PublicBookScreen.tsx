import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, BookOpen, Users, MessageSquare } from "lucide-react";
import { MOCK_BOOKS, MOCK_MARGINS } from "@/data/mockData";
import { REACTION_CATEGORY_CONFIG, EMOJI_REACTIONS } from "@/data/constants";
import type { EmojiReactionCategory } from "@/data/constants";

/* ── color helpers ── */
function getCategory(dominant: string | null): EmojiReactionCategory | "default" {
  if (!dominant) return "default";
  const r = EMOJI_REACTIONS.find(e => e.emoji === dominant);
  return r ? (r.category as EmojiReactionCategory) : "default";
}

function getMarginPct(m: typeof MOCK_MARGINS[0], book: typeof MOCK_BOOKS[0] | undefined): number | null {
  if (m.percent !== undefined) return m.percent;
  if (m.page && book?.totalPages) return Math.min(99, Math.round((m.page / book.totalPages) * 100));
  if (m.chapter && book?.totalChapters) {
    const n = parseInt(String(m.chapter));
    if (!isNaN(n)) return Math.min(99, Math.round((n / book.totalChapters) * 100));
  }
  return null;
}

/* ── Public Heatmap (no user progress, shows collective data only) ── */
function PublicHeatmap({ bookId }: { bookId: number }) {
  const [selectedBucket, setSelectedBucket] = useState<number | null>(null);
  const book        = MOCK_BOOKS.find(b => b.id === bookId);
  const bookMargins = MOCK_MARGINS.filter(m => m.bookId === bookId);
  const allMargins  = bookMargins
    .map(m => ({ ...m, computedPct: getMarginPct(m, book) }))
    .filter(m => m.computedPct !== null);

  const buckets = Array.from({ length: 10 }, (_, i) => {
    const lo = i * 10, hi = lo + 10;
    const inBucket = allMargins.filter(m => (m.computedPct ?? 0) >= lo && (m.computedPct ?? 0) < hi);
    const emojiTotals: Record<string, number> = {};
    inBucket.forEach(m => {
      Object.entries(m.reactions as Record<string,number>).forEach(([emoji, cnt]) => {
        emojiTotals[emoji] = (emojiTotals[emoji] || 0) + cnt;
      });
    });
    const dominant    = Object.entries(emojiTotals).sort(([,a],[,b]) => b-a)[0]?.[0] ?? null;
    const totalReact  = Object.values(emojiTotals).reduce((a,b) => a+b, 0);
    const category    = getCategory(dominant);
    return { lo, hi, count: inBucket.length, totalReactions: totalReact, dominant, category };
  });

  const emoMax     = Math.max(...buckets.map(b => b.totalReactions), 1);
  const peakBucket = buckets.reduce((acc, b) => b.totalReactions > acc.totalReactions ? b : acc, buckets[0]);

  if (allMargins.length === 0) return null;

  return (
    <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[14px] p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="font-sans text-[8px] font-light tracking-[0.2em] uppercase text-[#AE8F7D]">Ritmo de Leitura Coletivo</p>
        <p className="font-sans font-light text-[8px] text-[#2A2A2A]/30">{allMargins.length} posts</p>
      </div>
      <p className="font-serif italic text-[13px] text-[#2A2A2A]/50 mb-4">
        Onde os leitores mais sentiram este livro
      </p>

      <div className="flex items-end gap-[3px] h-20 mb-1">
        {buckets.map((b, i) => {
          const height   = b.totalReactions > 0 ? Math.max((b.totalReactions / emoMax) * 100, 8) : 3;
          const isPeak   = b.totalReactions === peakBucket.totalReactions && b.totalReactions > 0;
          const isSilent = b.totalReactions === 0;
          const isSelected = selectedBucket === i;
          const cfg      = REACTION_CATEGORY_CONFIG[b.category];
          const barColor = isSilent ? "#EBE6DB" : `${cfg.color}80`;
          return (
            <button key={i} className="flex-1 flex flex-col items-center justify-end h-full"
              onClick={() => setSelectedBucket(selectedBucket === i ? null : i)}>
              {isPeak && b.dominant && !isSelected && (
                <div className="mb-0.5"><span className="text-[11px] leading-none">{b.dominant}</span></div>
              )}
              {isSelected && b.dominant && (
                <div className="mb-0.5"><span className="text-[11px] leading-none">{b.dominant}</span></div>
              )}
              <div className="w-full rounded-t-[3px] transition-all"
                style={{ height:`${height}%`, backgroundColor: isSelected ? "#AE8F7D" : barColor,
                  minHeight: isSilent ? "3px" : "6px",
                  outline: isSelected ? "2px solid #AE8F7D" : "none", outlineOffset:"1px" }} />
            </button>
          );
        })}
      </div>
      <div className="flex justify-between mb-3">
        <span className="font-sans font-light text-[7px] text-[#2A2A2A]/25">início</span>
        <span className="font-sans font-light text-[7px] text-[#2A2A2A]/25">final</span>
      </div>

      {selectedBucket !== null && (
        <div className="bg-[#2A2A2A] rounded-[10px] px-4 py-3 mb-3 text-[#FAF8F3]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-sans text-[8px] font-light tracking-[0.12em] uppercase text-[#FAF8F3]/60">
              {buckets[selectedBucket].lo}–{buckets[selectedBucket].hi}% do livro
            </span>
            {buckets[selectedBucket].dominant && <span className="text-[16px]">{buckets[selectedBucket].dominant}</span>}
          </div>
          <div className="flex gap-4 text-[#FAF8F3]/80">
            <div>
              <span className="font-serif italic text-[13px]">{buckets[selectedBucket].count}</span>
              <span className="font-sans text-[8px] font-light ml-1 text-[#FAF8F3]/50">posts</span>
            </div>
            <div>
              <span className="font-serif italic text-[13px]">{buckets[selectedBucket].totalReactions}</span>
              <span className="font-sans text-[8px] font-light ml-1 text-[#FAF8F3]/50">reações</span>
            </div>
          </div>
        </div>
      )}
      {selectedBucket === null && (
        <p className="font-sans font-light text-[8px] text-[#2A2A2A]/25 text-center mb-3">
          Toque em uma barra para ver o que os leitores sentiram
        </p>
      )}

      {/* insight */}
      {peakBucket.totalReactions > 0 && (
        <div className="rounded-[10px] px-3.5 py-2.5" style={{ backgroundColor:`${REACTION_CATEGORY_CONFIG[peakBucket.category].color}18` }}>
          <p className="font-sans font-light text-[9px] text-[#2A2A2A]/70 leading-relaxed">
            <span className="mr-1">🔥</span>
            <strong>Pico emocional</strong>{" "}
            {peakBucket.dominant && <span className="mx-0.5">{peakBucket.dominant}</span>}
            entre {peakBucket.lo}–{peakBucket.hi}% do livro
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Featured Margins (3 highlights, no spoilers) ── */
function FeaturedMargins({ bookId }: { bookId: number }) {
  const margins = MOCK_MARGINS
    .filter(m => m.bookId === bookId && m.spoilerLevel === "none")
    .sort((a, b) => {
      const rA = Object.values(a.reactions as Record<string,number>).reduce((x,y)=>x+y,0);
      const rB = Object.values(b.reactions as Record<string,number>).reduce((x,y)=>x+y,0);
      return rB - rA;
    })
    .slice(0, 3);

  if (margins.length === 0) return null;

  return (
    <div>
      <p className="font-sans text-[8px] font-light tracking-[0.2em] uppercase text-[#AE8F7D] mb-3">
        Destaques da comunidade
      </p>
      <div className="space-y-3">
        {margins.map(m => {
          const totalReactions = Object.values(m.reactions as Record<string,number>).reduce((a,b)=>a+b,0);
          const topEmojis = Object.entries(m.reactions as Record<string,number>)
            .filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1]).slice(0,2);
          return (
            <div key={m.id} className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] p-4">
              <p className="font-serif italic text-[14px] text-[#2A2A2A] leading-[1.7] mb-3 line-clamp-3">
                "{m.excerpt}"
              </p>
              {m.commentary && (
                <p className="font-sans font-light text-[11px] text-[#2A2A2A]/55 leading-relaxed mb-3 line-clamp-2">
                  {m.commentary}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[#FAF8F3] text-[7px]"
                    style={{ backgroundColor: "#AE8F7D" }}>
                    {m.userInitials}
                  </div>
                  <span className="font-sans font-light text-[10px] text-[#AE8F7D]">{m.userName}</span>
                </div>
                {topEmojis.length > 0 && (
                  <div className="flex gap-1">
                    {topEmojis.map(([emoji, count]) => (
                      <span key={emoji} className="font-sans text-[10px] text-[#2A2A2A]/40">
                        {emoji} {count}
                      </span>
                    ))}
                    {totalReactions > 0 && <span className="font-sans text-[9px] text-[#2A2A2A]/25 ml-1">respostas</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Book cover placeholder ── */
function PublicBookCover({ title, bookColor }: { title: string; bookColor?: string }) {
  const bg = bookColor || "#AE8F7D";
  const initial = title.charAt(0).toUpperCase();
  return (
    <div className="rounded-[10px] shadow-md flex flex-col items-center justify-center"
      style={{ width:80, height:118, backgroundColor: bg, flexShrink:0 }}>
      <span className="font-serif italic text-[28px] text-[#FAF8F3]/80 leading-none">{initial}</span>
    </div>
  );
}

/* ── Main Screen ── */
export function PublicBookScreen() {
  const params = useParams<{ id: string }>();
  const bookId = parseInt(params.id || "0", 10);
  const book   = MOCK_BOOKS.find(b => b.id === bookId);
  /* Use pre-computed communityStats for the display numbers */
  const totalReaders   = book?.communityStats.activeReaders  ?? 0;
  const totalMargins   = book?.communityStats.totalMargins    ?? 0;
  const totalReactions = book?.communityStats.debates         ?? 0;

  if (!book) {
    return (
      <div className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col">
        <div className="flex items-center gap-3 px-5 pt-8 pb-4">
          <Link href="/" className="text-[#2A2A2A]/40">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <p className="font-serif italic text-[32px] text-[#AE8F7D]/40 mb-4">Livro não encontrado</p>
          <p className="font-sans font-light text-[11px] text-[#2A2A2A]/35 mb-8">
            Este livro ainda não está no catálogo do Marginalia.
          </p>
          <Link href="/"
            className="font-sans font-light text-[10px] tracking-[0.14em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/30 rounded-full px-5 py-2.5 hover:bg-[#AE8F7D]/5 transition-colors">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#EBE6DB]">
      {/* Top bar */}
      <div className="bg-[#FAF8F3] border-b border-[#AE8F7D]/10 px-5 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/" className="flex items-center gap-2 text-[#2A2A2A]/40 hover:text-[#2A2A2A]/70 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="font-serif italic text-[15px] text-[#AE8F7D]/70">marginalia</span>
        <Link href="/"
          className="font-sans text-[9px] tracking-[0.14em] uppercase text-[#FAF8F3] bg-[#2A2A2A] rounded-full px-3 py-1.5 hover:bg-[#3A3A3A] transition-colors">
          Entrar
        </Link>
      </div>

      <div className="px-5 pt-6 pb-28 space-y-5 max-w-md mx-auto">
        {/* Book header */}
        <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[16px] p-5">
          <div className="flex gap-4 mb-4">
            <PublicBookCover title={book.title} bookColor={book.bookColor} />
            <div className="flex-1 min-w-0">
              <h1 className="font-serif italic text-[20px] text-[#2A2A2A] leading-tight mb-1">{book.title}</h1>
              <p className="font-sans font-light text-[10px] tracking-[0.12em] uppercase text-[#2A2A2A]/45 mb-3">{book.author}</p>
              {book.genres && book.genres.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {book.genres.slice(0,3).map(g => (
                    <span key={g} className="font-sans text-[8px] tracking-[0.1em] uppercase text-[#697962] border border-[#697962]/25 rounded-full px-2 py-0.5">{g}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-4">
                {[
                  { icon: <Users className="w-3 h-3" />, val: totalReaders, label: "leitores" },
                  { icon: <MessageSquare className="w-3 h-3" />, val: totalMargins, label: "posts" },
                  { icon: <BookOpen className="w-3 h-3" />, val: totalReactions, label: "reações" },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 text-[#2A2A2A]/40">
                    {s.icon}
                    <span className="font-serif italic text-[13px] text-[#2A2A2A]/60">{s.val}</span>
                    <span className="font-sans font-light text-[8px] text-[#2A2A2A]/30">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {book.sinopse && (
            <p className="font-sans font-light text-[12px] text-[#2A2A2A]/60 leading-relaxed line-clamp-4">
              {book.sinopse}
            </p>
          )}
        </div>

        {/* Community stats bar */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: totalReaders, label: "Leitores ativos" },
            { val: totalMargins, label: "Posts escritos" },
            { val: totalReactions, label: "Reações totais" },
          ].map(s => (
            <div key={s.label} className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] p-3 text-center">
              <span className="font-serif italic text-[22px] text-[#AE8F7D] block">{s.val}</span>
              <span className="font-sans font-light text-[8px] text-[#2A2A2A]/40 tracking-[0.08em] leading-tight block mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <PublicHeatmap bookId={bookId} />

        {/* Featured margins */}
        <FeaturedMargins bookId={bookId} />
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#FAF8F3]/95 border-t border-[#AE8F7D]/15" style={{ backdropFilter:"blur(12px)" }}>
        <div className="max-w-md mx-auto px-5 py-4">
          <p className="font-serif italic text-[14px] text-[#2A2A2A]/70 text-center mb-3">
            Entre para deixar seu post neste livro
          </p>
          <div className="flex gap-2">
            <Link href="/"
              className="flex-1 text-center font-sans text-[10px] tracking-[0.16em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/30 rounded-full py-3 hover:bg-[#AE8F7D]/5 transition-colors">
              Entrar
            </Link>
            <Link href="/"
              className="flex-1 text-center font-sans text-[10px] tracking-[0.16em] uppercase text-[#FAF8F3] bg-[#2A2A2A] rounded-full py-3 hover:bg-[#3A3A3A] transition-colors">
              Criar conta grátis
            </Link>
          </div>
          <p className="font-sans font-light text-[8px] text-[#2A2A2A]/25 text-center mt-2.5 tracking-[0.06em]">
            Descubra onde este livro pulsa. Faça parte da leitura coletiva.
          </p>
        </div>
      </div>
    </div>
  );
}
