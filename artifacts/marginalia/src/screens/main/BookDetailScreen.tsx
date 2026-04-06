import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { MOCK_BOOKS, MOCK_MARGINS } from "@/data/mockData";
import { MarginCard } from "@/components/cards/MarginCard";
import { BookCover } from "@/components/BookCover";
import { canUserSeeMargin } from "@/utils/spoiler";
import { SPOILER_PREFERENCES, EMOJI_REACTIONS, REACTION_CATEGORY_CONFIG } from "@/data/constants";
import type { EmojiReactionCategory } from "@/data/constants";

const TABS = [
  { id: "ecos", label: "Ecos" },
  { id: "theories", label: "Teorias" },
  { id: "critiques", label: "Críticas" },
  { id: "questions", label: "Perguntas" },
  { id: "sobre", label: "Sobre" },
  { id: "mine", label: "Meus" },
];

const ZONE_LABELS = [
  "Abertura",
  "Primeiros passos",
  "Aquecendo",
  "Tensão crescente",
  "Ponto de virada",
  "Conflito central",
  "Zona intensa",
  "Clímax",
  "Resolução",
  "Desfecho",
];

const ZONE_INSIGHTS: Record<number, string> = {
  0: "Leitores começam a se orientar",
  1: "A atmosfera do livro se instala",
  2: "Algo começa a prender a atenção",
  3: "Leitores começam a desacelerar aqui",
  4: "Primeiro grande impacto emocional",
  5: "Zona de tensão crescente",
  6: "Algo muda aqui",
  7: "Pico de reflexão coletiva",
  8: "Muitos leitores releram esse trecho",
  9: "Fechamento — mas alguns nunca largaram",
};

function getCategory(dominantEmoji: string | null): EmojiReactionCategory | "default" {
  if (!dominantEmoji) return "default";
  const r = EMOJI_REACTIONS.find((e) => e.emoji === dominantEmoji);
  if (!r) return "default";
  return r.category as EmojiReactionCategory;
}

function EcoMap({ bookId, userPercent }: { bookId: number; userPercent: number }) {
  const allMargins = MOCK_MARGINS.filter((m) => m.bookId === bookId && m.percent !== undefined);

  const buckets = Array.from({ length: 10 }, (_, i) => {
    const lo = i * 10;
    const hi = lo + 10;
    const marginsInBucket = allMargins.filter((m) => (m.percent ?? 0) >= lo && (m.percent ?? 0) < hi);
    const count = marginsInBucket.length;

    const emojiTotals: Record<string, number> = {};
    marginsInBucket.forEach((m) => {
      Object.entries(m.reactions as Record<string, number>).forEach(([emoji, cnt]) => {
        emojiTotals[emoji] = (emojiTotals[emoji] || 0) + cnt;
      });
    });
    const dominant = Object.entries(emojiTotals).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
    const category = getCategory(dominant);

    return { lo, hi, count, zoneIdx: i, dominant, category };
  });

  const max = Math.max(...buckets.map((b) => b.count), 1);
  const totalReaders = allMargins.length;
  const peakBucket = buckets.reduce((acc, b) => (b.count > acc.count ? b : acc), buckets[0]);
  const peakPercent = totalReaders > 0 ? Math.round((peakBucket.count / totalReaders) * 100) : 0;

  const categoriesPresent = [...new Set(buckets.filter((b) => b.count > 0 && b.category !== "default").map((b) => b.category))] as EmojiReactionCategory[];

  return (
    <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[14px] p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="font-sans text-[8px] font-light tracking-[0.2em] uppercase text-[#AE8F7D]">
          Ritmo de Leitura Coletivo
        </p>
        <p className="font-sans font-light text-[8px] text-[#454545]/30">{totalReaders} margens</p>
      </div>
      <p className="font-serif italic text-[12px] text-[#454545]/50 mb-4">
        Veja onde os leitores mais sentiram este livro
      </p>

      <div className="flex items-end gap-[3px] h-20 mb-1">
        {buckets.map((b, i) => {
          const height = b.count > 0 ? Math.max((b.count / max) * 100, 10) : 4;
          const isPeak = b.count === max && b.count > 0;
          const isReached = b.lo < userPercent;
          const isCurrent = userPercent >= b.lo && userPercent < b.hi;
          const isSilent = b.count === 0;
          const cfg = REACTION_CATEGORY_CONFIG[b.category];
          const barColor = isSilent
            ? "#EBE6DB"
            : isCurrent
            ? "#697962"
            : isReached
            ? cfg.color
            : `${cfg.color}88`;

          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end" style={{ height: "100%" }}>
              {isPeak && b.dominant && (
                <div className="mb-0.5">
                  <span className="text-[11px] leading-none">{b.dominant}</span>
                </div>
              )}
              {isCurrent && !isPeak && (
                <div className="mb-0.5">
                  <span className="font-sans text-[6px] text-[#697962] whitespace-nowrap">você</span>
                </div>
              )}
              <div
                className="w-full rounded-t-[3px] transition-all"
                style={{
                  height: `${height}%`,
                  backgroundColor: barColor,
                  minHeight: isSilent ? "3px" : "6px",
                }}
                title={`${ZONE_LABELS[i]}: ${b.count} margens${b.dominant ? ` · ${b.dominant}` : ""}`}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mb-4">
        <span className="font-sans font-light text-[7px] text-[#454545]/25">início</span>
        <span className="font-sans font-light text-[7px] text-[#454545]/25">final</span>
      </div>

      {/* Legend */}
      {categoriesPresent.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {categoriesPresent.map((cat) => {
            const cfg = REACTION_CATEGORY_CONFIG[cat];
            return (
              <div key={cat} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span className="font-sans font-light text-[7.5px] text-[#454545]/50">{cfg.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Insights */}
      <div className="space-y-2">
        {peakBucket.count > 0 && (
          <div
            className="rounded-[10px] px-3.5 py-2.5"
            style={{ backgroundColor: `${REACTION_CATEGORY_CONFIG[peakBucket.category].color}15` }}
          >
            <p className="font-sans font-light text-[9px] text-[#454545]/65 leading-relaxed">
              {peakBucket.dominant && <span className="mr-1 text-[11px]">{peakBucket.dominant}</span>}
              <strong>{peakPercent}% dos leitores</strong> sentiram mais forte entre{" "}
              {peakBucket.lo}–{peakBucket.hi}% — {ZONE_INSIGHTS[peakBucket.zoneIdx]}
            </p>
          </div>
        )}

        {userPercent < peakBucket.hi && peakBucket.count > 0 && (
          <div className="bg-[#EBE6DB]/40 border border-[#AE8F7D]/10 rounded-[10px] px-3.5 py-2.5">
            <p className="font-sans font-light text-[9px] text-[#454545]/55 leading-relaxed">
              Você ainda não chegou aqui — um dos pontos mais marcantes deste livro está pela frente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function BookDetailScreen() {
  const params = useParams<{ id: string }>();
  const bookId = parseInt(params.id || "1", 10);
  const { currentUser, progress, updateBookProgress } = useApp();

  const book = MOCK_BOOKS.find((b) => b.id === bookId);
  const prog = progress.find((p) => p.bookId === bookId && p.userId === "user_me");
  const bookMargins = MOCK_MARGINS.filter((m) => m.bookId === bookId);

  const [activeTab, setActiveTab] = useState("ecos");
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressMode, setProgressMode] = useState<"page" | "chapter">("page");
  const [pageInput, setPageInput] = useState(String(prog?.currentPage || ""));
  const [chapterInput, setChapterInput] = useState(prog?.currentChapter || "");

  if (!book) return null;

  const visibleMargins = bookMargins.filter((m) =>
    canUserSeeMargin(m, currentUser.spoilerPreference, prog)
  );
  const blockedCount = bookMargins.length - visibleMargins.length;

  const tabMargins = {
    ecos: visibleMargins,
    theories: visibleMargins.filter((m) => m.postType === "theory"),
    critiques: visibleMargins.filter((m) => m.postType === "critique"),
    questions: visibleMargins.filter((m) => m.postType === "question"),
    sobre: [],
    mine: bookMargins.filter((m) => m.userId === "user_me"),
  };

  const statusLabel = prog?.status === "reading" ? "Lendo"
    : prog?.status === "completed" ? "Concluído"
    : prog?.status === "wishlist" ? "Quero ler"
    : "Não iniciado";

  const applyProgress = () => {
    let percent = prog?.currentPercent || 0;
    let page = prog?.currentPage || 0;

    if (progressMode === "page" && book.totalPages) {
      page = Math.min(book.totalPages, Math.max(0, parseInt(pageInput) || 0));
      percent = Math.round((page / book.totalPages) * 100);
    } else if (progressMode === "chapter" && book.totalChapters) {
      const chapNum = parseInt(chapterInput) || 0;
      percent = Math.round((chapNum / book.totalChapters) * 100);
    }
    updateBookProgress(bookId, { currentPercent: percent, currentPage: page });
    setEditingProgress(false);
  };

  return (
    <div className="min-h-full bg-[#FAF8F3]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <Link href="/library">
          <button data-testid="button-back" className="text-[#454545]/40">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-serif italic text-[18px] text-[#3D3D3D] leading-tight truncate">{book.title}</h1>
          <p className="font-sans font-light text-[9px] tracking-[0.12em] uppercase text-[#454545]/40">{book.author}</p>
        </div>
      </div>

      <div className="px-5 pb-8 space-y-5">
        {/* Book cover + Progress */}
        <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[14px] p-5 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <BookCover title={book.title} bookColor={book.bookColor} size="lg" className="shadow-sm" />
            <div className="flex-1 min-w-0">
              <p className="font-sans font-light text-[8px] tracking-[0.14em] uppercase text-[#AE8F7D] mb-1">{statusLabel}</p>
              {prog?.status === "reading" && (
                <>
                  <div className="flex items-end gap-1.5 mb-1">
                    <span className="font-serif italic text-[34px] leading-none text-[#AE8F7D]">
                      {Math.round(prog.currentPercent)}
                    </span>
                    <span className="font-sans font-light text-sm text-[#454545]/40 mb-0.5">%</span>
                  </div>
                  {prog.currentPage > 0 && book.totalPages > 0 && (
                    <p className="font-sans font-light text-[9px] text-[#454545]/35 mb-1">
                      p. {prog.currentPage} de {book.totalPages}
                      {prog.currentChapter ? ` · cap. ${prog.currentChapter}` : ""}
                    </p>
                  )}
                  <div className="w-full h-[3px] bg-[#EBE6DB] rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-[#AE8F7D] rounded-full" style={{ width: `${prog.currentPercent}%` }} />
                  </div>
                </>
              )}
              <button
                onClick={() => setEditingProgress(!editingProgress)}
                className="font-sans text-[9px] font-light tracking-[0.1em] uppercase text-[#454545]/35 hover:text-[#AE8F7D] transition-colors"
              >
                {editingProgress ? "Cancelar" : "Atualizar progresso"}
              </button>
            </div>
          </div>

          {/* Smart Progress Editor */}
          {editingProgress && (
            <div className="mb-4 space-y-3 border-t border-[#AE8F7D]/10 pt-4">
              <div className="flex gap-2">
                {(["wishlist", "reading", "completed"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateBookProgress(bookId, { status: s })}
                    className={`flex-1 font-sans text-[9px] font-light tracking-[0.1em] py-1.5 rounded-full border transition-all ${
                      prog?.status === s
                        ? "bg-[#454545] text-[#FAF8F3] border-transparent"
                        : "text-[#454545]/50 border-[#454545]/12"
                    }`}
                  >
                    {s === "wishlist" ? "Quero ler" : s === "reading" ? "Lendo" : "Concluído"}
                  </button>
                ))}
              </div>

              {prog?.status === "reading" && (
                <>
                  <div>
                    <p className="font-sans text-[8px] font-light tracking-[0.14em] uppercase text-[#AE8F7D] mb-2">
                      Você está em:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      {[
                        { id: "page", label: book.totalPages > 0 ? `Página (de ${book.totalPages})` : "Página" },
                        { id: "chapter", label: book.totalChapters > 0 ? `Capítulo (de ${book.totalChapters})` : "Capítulo" },
                      ].map((m) => (
                        <button
                          key={m.id}
                          data-testid={`progress-mode-${m.id}`}
                          onClick={() => setProgressMode(m.id as typeof progressMode)}
                          className={`font-sans text-[8px] font-light py-2 rounded-[8px] border transition-all text-center ${
                            progressMode === m.id
                              ? "bg-[#454545] text-[#FAF8F3] border-transparent"
                              : "text-[#454545]/50 border-[#454545]/12"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {progressMode === "page" && (
                      <div>
                        <input
                          data-testid="input-progress-page"
                          type="number"
                          value={pageInput}
                          onChange={(e) => setPageInput(e.target.value)}
                          placeholder={`Página atual (máx. ${book.totalPages})`}
                          className="w-full font-serif italic text-[20px] text-[#AE8F7D] text-center bg-[#EBE6DB]/30 rounded-[8px] py-2 outline-none border border-[#AE8F7D]/15 focus:border-[#AE8F7D]/40"
                        />
                        {pageInput && book.totalPages > 0 && (
                          <p className="font-sans font-light text-[9px] text-[#454545]/45 mt-1 text-center">
                            p. {pageInput} de {book.totalPages} → <span className="text-[#AE8F7D]">{Math.round((parseInt(pageInput) / book.totalPages) * 100)}%</span>
                          </p>
                        )}
                      </div>
                    )}

                    {progressMode === "chapter" && (
                      <div>
                        <input
                          data-testid="input-progress-chapter"
                          type="text"
                          value={chapterInput}
                          onChange={(e) => setChapterInput(e.target.value)}
                          placeholder={book.totalChapters > 0 ? `Capítulo (de ${book.totalChapters})` : "Ex: IX ou 5"}
                          className="w-full font-serif italic text-[20px] text-[#AE8F7D] text-center bg-[#EBE6DB]/30 rounded-[8px] py-2 outline-none border border-[#AE8F7D]/15 focus:border-[#AE8F7D]/40"
                        />
                        {chapterInput && book.totalChapters > 0 && !isNaN(parseInt(chapterInput)) && (
                          <p className="font-sans font-light text-[9px] text-[#454545]/45 mt-1 text-center">
                            cap. {chapterInput} de {book.totalChapters} → <span className="text-[#AE8F7D]">{Math.round((parseInt(chapterInput) / book.totalChapters) * 100)}%</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    data-testid="button-save-progress"
                    onClick={applyProgress}
                    className="w-full bg-[#697962] text-[#FAF8F3] font-sans text-[10px] font-light tracking-[0.12em] uppercase py-3 rounded-[10px] hover:bg-[#697962]/90 transition-colors"
                  >
                    Salvar progresso
                  </button>
                </>
              )}
            </div>
          )}

          {/* Community Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Leitores", value: book.communityStats.activeReaders },
              { label: "Margens", value: book.communityStats.totalMargins },
              { label: "Debates", value: book.communityStats.debates },
              { label: "Salvos", value: book.communityStats.savedBy },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#EBE6DB]/40 rounded-[8px] py-2.5 text-center">
                <div className="font-serif text-[16px] text-[#3D3D3D]">{stat.value}</div>
                <div className="font-sans font-light text-[7px] tracking-[0.08em] uppercase text-[#454545]/35">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Eco Map */}
        <EcoMap bookId={bookId} userPercent={prog?.currentPercent ?? 0} />

        {/* Anti-Spoiler Banner */}
        {blockedCount > 0 && (
          <div data-testid="spoiler-banner" className="flex items-center gap-3 bg-[#EBE6DB]/40 border border-[#AE8F7D]/15 rounded-[12px] px-4 py-3">
            <Shield className="w-4 h-4 text-[#AE8F7D] flex-shrink-0" />
            <div className="flex-1">
              <p className="font-sans font-light text-[10px] text-[#454545]/60">
                {blockedCount} {blockedCount === 1 ? "conteúdo ocultado" : "conteúdos ocultados"} — seu ritmo está protegido
              </p>
              <p className="font-sans font-light text-[8px] text-[#AE8F7D] mt-0.5">
                {SPOILER_PREFERENCES.find((p) => p.id === currentUser.spoilerPreference)?.label}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div>
          <div className="flex gap-1 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {TABS.map((tab) => {
              const count = tabMargins[tab.id as keyof typeof tabMargins]?.length || 0;
              return (
                <button
                  key={tab.id}
                  data-testid={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 font-sans text-[9px] font-light tracking-[0.12em] uppercase px-3 py-2 rounded-full border transition-all ${
                    activeTab === tab.id
                      ? "bg-[#AE8F7D] text-[#FAF8F3] border-transparent"
                      : "bg-transparent text-[#454545]/45 border-[#454545]/10 hover:border-[#AE8F7D]/25"
                  }`}
                >
                  {tab.label} {tab.id !== "sobre" && count > 0 ? `· ${count}` : ""}
                </button>
              );
            })}
          </div>

          {/* "Sobre" tab */}
          {activeTab === "sobre" ? (
            <div className="space-y-4">
              <div className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[14px] p-5">
                <p className="font-sans text-[8px] font-light tracking-[0.2em] uppercase text-[#AE8F7D] mb-3">
                  Sobre o livro
                </p>
                <p className="font-serif italic text-[15px] text-[#3D3D3D] leading-relaxed mb-5">
                  {book.sinopse || book.description}
                </p>
                <div className="space-y-2.5 border-t border-[#454545]/5 pt-4">
                  {[
                    { label: "Autor", value: book.author },
                    { label: "Publicação", value: String(book.publishYear) },
                    { label: "Gênero", value: book.genres.join(", ") },
                    ...(book.totalPages > 0 ? [{ label: "Páginas", value: `${book.totalPages} páginas` }] : []),
                    ...(book.totalChapters > 0 ? [{ label: "Capítulos", value: `${book.totalChapters} capítulos` }] : []),
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-baseline">
                      <span className="font-sans font-light text-[9px] tracking-[0.1em] uppercase text-[#454545]/35">{label}</span>
                      <span className="font-sans font-light text-[11px] text-[#454545]/60">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {(tabMargins[activeTab as keyof typeof tabMargins] || []).length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#AE8F7D]/15 rounded-[14px]">
                  <p className="font-serif italic text-[13px] text-[#454545]/35 mb-1">
                    Nenhuma margem nesta categoria ainda.
                  </p>
                  <p className="font-sans font-light text-[9px] text-[#454545]/25">
                    Seja o primeiro a registrar um eco aqui.
                  </p>
                </div>
              ) : (
                (tabMargins[activeTab as keyof typeof tabMargins] || []).map((m) => (
                  <MarginCard key={m.id} margin={m} />
                ))
              )}
            </div>
          )}
        </div>

        {/* Add Margin CTA */}
        <div className="pt-2">
          <Link href="/nova-margem" data-testid="button-add-margin-book">
            <button className="w-full bg-[#454545] text-[#FAF8F3] font-sans font-light text-[11px] tracking-[0.12em] uppercase py-4 rounded-[10px] hover:bg-[#454545]/90 transition-colors">
              Adicionar margem a este livro
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
