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
  { id: "todos", label: "Todos" },
  { id: "insights", label: "Insights" },
  { id: "interpretacoes", label: "Interpretações" },
  { id: "criticas", label: "Críticas" },
  { id: "perguntas", label: "Perguntas" },
  { id: "citacoes", label: "Citações" },
];


function getCategory(dominantEmoji: string | null): EmojiReactionCategory | "default" {
  if (!dominantEmoji) return "default";
  const r = EMOJI_REACTIONS.find((e) => e.emoji === dominantEmoji);
  if (!r) return "default";
  return r.category as EmojiReactionCategory;
}

function getMarginPct(m: (typeof MOCK_MARGINS)[0], book: (typeof MOCK_BOOKS)[0] | undefined): number | null {
  if (m.percent !== undefined) return m.percent;
  if (m.page && book?.totalPages) return Math.min(99, Math.round((m.page / book.totalPages) * 100));
  if (m.chapter && book?.totalChapters) {
    const n = parseInt(String(m.chapter));
    if (!isNaN(n)) return Math.min(99, Math.round((n / book.totalChapters) * 100));
  }
  return null;
}

function EcoMap({ bookId, userPercent }: { bookId: number; userPercent: number }) {
  const [activeTab, setActiveTab] = useState<"emocional" | "social">("emocional");
  const [selectedBucket, setSelectedBucket] = useState<number | null>(null);

  const book = MOCK_BOOKS.find((b) => b.id === bookId);
  const bookMargins = MOCK_MARGINS.filter((m) => m.bookId === bookId);
  const allMargins = bookMargins
    .map((m) => ({ ...m, computedPct: getMarginPct(m, book) }))
    .filter((m) => m.computedPct !== null);

  const emoBuckets = Array.from({ length: 10 }, (_, i) => {
    const lo = i * 10;
    const hi = lo + 10;
    const inBucket = allMargins.filter((m) => (m.computedPct ?? 0) >= lo && (m.computedPct ?? 0) < hi);
    const emojiTotals: Record<string, number> = {};
    inBucket.forEach((m) => {
      Object.entries(m.reactions as Record<string, number>).forEach(([emoji, cnt]) => {
        emojiTotals[emoji] = (emojiTotals[emoji] || 0) + cnt;
      });
    });
    const dominant = Object.entries(emojiTotals).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
    const totalReactions = Object.values(emojiTotals).reduce((a, b) => a + b, 0);
    const category = getCategory(dominant);
    return { lo, hi, count: inBucket.length, totalReactions, dominant, category, comments: inBucket.reduce((s, m) => s + m.commentsCount, 0) };
  });

  const socBuckets = Array.from({ length: 10 }, (_, i) => {
    const lo = i * 10;
    const hi = lo + 10;
    const inBucket = allMargins.filter((m) => (m.computedPct ?? 0) >= lo && (m.computedPct ?? 0) < hi);
    return { lo, hi, ecos: inBucket.length, comments: inBucket.reduce((s, m) => s + m.commentsCount, 0) };
  });

  const emoMax = Math.max(...emoBuckets.map((b) => b.totalReactions), 1);
  const socMax = Math.max(...socBuckets.map((b) => b.ecos + b.comments), 1);
  const totalReaders = allMargins.length;

  const peakEmoBucket = emoBuckets.reduce((acc, b) => (b.totalReactions > acc.totalReactions ? b : acc), emoBuckets[0]);
  const peakSocBucket = socBuckets.reduce((acc, b) => ((b.ecos + b.comments) > (acc.ecos + acc.comments) ? b : acc), socBuckets[0]);
  const mostCommentedBucket = socBuckets.reduce((acc, b) => (b.comments > acc.comments ? b : acc), socBuckets[0]);
  const mostEcoadoBucket = socBuckets.reduce((acc, b) => (b.ecos > acc.ecos ? b : acc), socBuckets[0]);

  const selBucket = selectedBucket !== null ? emoBuckets[selectedBucket] : null;
  const selSocBucket = selectedBucket !== null ? socBuckets[selectedBucket] : null;

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

      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 bg-[#EBE6DB]/50 rounded-[10px] p-1">
        {([["emocional", "Emocional"], ["social", "Social"]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setSelectedBucket(null); }}
            className={`flex-1 font-sans text-[9px] font-light tracking-[0.08em] py-1.5 rounded-[8px] transition-all ${
              activeTab === id
                ? "bg-[#FAF8F3] text-[#454545] shadow-sm"
                : "text-[#454545]/45 hover:text-[#454545]/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Emocional chart */}
      {activeTab === "emocional" && (
        <>
          <div className="flex items-end gap-[3px] h-20 mb-1">
            {emoBuckets.map((b, i) => {
              const height = b.totalReactions > 0 ? Math.max((b.totalReactions / emoMax) * 100, 8) : 3;
              const isPeak = b.totalReactions === peakEmoBucket.totalReactions && b.totalReactions > 0;
              const isReached = b.lo < userPercent;
              const isCurrent = userPercent >= b.lo && userPercent < b.hi;
              const isSilent = b.totalReactions === 0;
              const isSelected = selectedBucket === i;
              const cfg = REACTION_CATEGORY_CONFIG[b.category];
              const barColor = isSilent ? "#EBE6DB" : isCurrent ? "#697962" : isReached ? cfg.color : `${cfg.color}70`;

              return (
                <button
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end h-full"
                  onClick={() => setSelectedBucket(selectedBucket === i ? null : i)}
                >
                  {isPeak && b.dominant && !isSelected && (
                    <div className="mb-0.5"><span className="text-[11px] leading-none">{b.dominant}</span></div>
                  )}
                  {isCurrent && !isPeak && !isSelected && (
                    <div className="mb-0.5"><span className="font-sans text-[6px] text-[#697962] whitespace-nowrap">você</span></div>
                  )}
                  {isSelected && b.dominant && (
                    <div className="mb-0.5"><span className="text-[11px] leading-none">{b.dominant}</span></div>
                  )}
                  <div
                    className="w-full rounded-t-[3px] transition-all"
                    style={{
                      height: `${height}%`,
                      backgroundColor: isSelected ? "#AE8F7D" : barColor,
                      minHeight: isSilent ? "3px" : "6px",
                      outline: isSelected ? "2px solid #AE8F7D" : "none",
                      outlineOffset: "1px",
                    }}
                  />
                </button>
              );
            })}
          </div>
          <div className="flex justify-between mb-3">
            <span className="font-sans font-light text-[7px] text-[#454545]/25">início</span>
            <span className="font-sans font-light text-[7px] text-[#454545]/25">final</span>
          </div>

          {/* Tooltip for selected bucket */}
          {selBucket && selSocBucket && (
            <div className="bg-[#454545] rounded-[10px] px-4 py-3 mb-3 text-[#FAF8F3]">
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-[8px] font-light tracking-[0.12em] uppercase text-[#FAF8F3]/60">
                  {selBucket.lo}–{selBucket.hi}% do livro
                </span>
                {selBucket.dominant && <span className="text-[16px]">{selBucket.dominant}</span>}
              </div>
              <div className="flex gap-4 text-[#FAF8F3]/80">
                <div>
                  <span className="font-serif italic text-[13px]">{selSocBucket.ecos}</span>
                  <span className="font-sans text-[8px] font-light ml-1 text-[#FAF8F3]/50">ecos</span>
                </div>
                <div>
                  <span className="font-serif italic text-[13px]">{selSocBucket.comments}</span>
                  <span className="font-sans text-[8px] font-light ml-1 text-[#FAF8F3]/50">comentários</span>
                </div>
                <div>
                  <span className="font-serif italic text-[13px]">{selBucket.totalReactions}</span>
                  <span className="font-sans text-[8px] font-light ml-1 text-[#FAF8F3]/50">reações</span>
                </div>
              </div>
            </div>
          )}
          {!selBucket && (
            <p className="font-sans font-light text-[8px] text-[#454545]/25 text-center mb-3">
              Toque em uma barra para ver detalhes
            </p>
          )}
        </>
      )}

      {/* Social chart */}
      {activeTab === "social" && (
        <>
          <div className="flex items-end gap-[3px] h-20 mb-1">
            {socBuckets.map((b, i) => {
              const total = b.ecos + b.comments;
              const height = total > 0 ? Math.max((total / socMax) * 100, 8) : 3;
              const isCurrent = userPercent >= b.lo && userPercent < b.hi;
              const isSelected = selectedBucket === i;
              const isSilent = total === 0;
              const barColor = isSilent ? "#EBE6DB" : isCurrent ? "#697962" : "#AE8F7D";

              return (
                <button
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end h-full"
                  onClick={() => setSelectedBucket(selectedBucket === i ? null : i)}
                >
                  {isCurrent && !isSelected && (
                    <div className="mb-0.5"><span className="font-sans text-[6px] text-[#697962] whitespace-nowrap">você</span></div>
                  )}
                  <div
                    className="w-full rounded-t-[3px] transition-all"
                    style={{
                      height: `${height}%`,
                      backgroundColor: isSelected ? "#454545" : `${barColor}${isSilent ? "" : "AA"}`,
                      minHeight: isSilent ? "3px" : "6px",
                    }}
                  />
                </button>
              );
            })}
          </div>
          <div className="flex justify-between mb-3">
            <span className="font-sans font-light text-[7px] text-[#454545]/25">início</span>
            <span className="font-sans font-light text-[7px] text-[#454545]/25">final</span>
          </div>

          {/* Social tooltip */}
          {selectedBucket !== null && selSocBucket && (
            <div className="bg-[#454545] rounded-[10px] px-4 py-3 mb-3 text-[#FAF8F3]">
              <span className="font-sans text-[8px] font-light tracking-[0.12em] uppercase text-[#FAF8F3]/60 block mb-1">
                {selSocBucket.lo}–{selSocBucket.hi}% do livro
              </span>
              <div className="flex gap-4 text-[#FAF8F3]/80">
                <div>
                  <span className="font-serif italic text-[13px]">{selSocBucket.ecos}</span>
                  <span className="font-sans text-[8px] font-light ml-1 text-[#FAF8F3]/50">ecos</span>
                </div>
                <div>
                  <span className="font-serif italic text-[13px]">{selSocBucket.comments}</span>
                  <span className="font-sans text-[8px] font-light ml-1 text-[#FAF8F3]/50">comentários</span>
                </div>
              </div>
            </div>
          )}
          {selectedBucket === null && (
            <p className="font-sans font-light text-[8px] text-[#454545]/25 text-center mb-3">
              Toque em uma barra para ver detalhes
            </p>
          )}
        </>
      )}

      {/* Insights automáticos */}
      <div className="space-y-2 mt-1">
        {peakEmoBucket.totalReactions > 0 && (
          <div
            className="rounded-[10px] px-3.5 py-2.5"
            style={{ backgroundColor: `${REACTION_CATEGORY_CONFIG[peakEmoBucket.category].color}18` }}
          >
            <p className="font-sans font-light text-[9px] text-[#454545]/70 leading-relaxed">
              <span className="mr-1">🔥</span>
              <strong>Pico emocional</strong>{" "}
              {peakEmoBucket.dominant && <span className="mx-0.5">{peakEmoBucket.dominant}</span>}
              entre {peakEmoBucket.lo}–{peakEmoBucket.hi}% do livro
            </p>
          </div>
        )}
        {mostCommentedBucket.comments > 0 && (
          <div className="bg-[#EBE6DB]/50 rounded-[10px] px-3.5 py-2.5">
            <p className="font-sans font-light text-[9px] text-[#454545]/70 leading-relaxed">
              <span className="mr-1">💬</span>
              <strong>Mais comentado</strong> entre {mostCommentedBucket.lo}–{mostCommentedBucket.hi}%
              {" "}· {mostCommentedBucket.comments} comentários
            </p>
          </div>
        )}
        {mostEcoadoBucket.ecos > 0 && mostEcoadoBucket.lo !== mostCommentedBucket.lo && (
          <div className="bg-[#EBE6DB]/50 rounded-[10px] px-3.5 py-2.5">
            <p className="font-sans font-light text-[9px] text-[#454545]/70 leading-relaxed">
              <span className="mr-1">✍</span>
              <strong>Mais ecoado</strong> entre {mostEcoadoBucket.lo}–{mostEcoadoBucket.hi}%
              {" "}· {mostEcoadoBucket.ecos} ecos
            </p>
          </div>
        )}
        {userPercent > 0 && peakSocBucket.ecos > 0 && userPercent < peakSocBucket.lo && (
          <div className="bg-[#EBE6DB]/30 border border-[#AE8F7D]/10 rounded-[10px] px-3.5 py-2.5">
            <p className="font-sans font-light text-[9px] text-[#454545]/55 leading-relaxed">
              <span className="mr-1">👤</span>
              Você está em {userPercent}% — o pico de atividade é em {peakSocBucket.lo}–{peakSocBucket.hi}%.
              Ainda há muito pela frente.
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
  const prog = progress.find((p) => p.bookId === bookId && p.userId === currentUser.id);
  const bookMargins = MOCK_MARGINS.filter((m) => m.bookId === bookId);

  const [activeTab, setActiveTab] = useState("todos");
  const [feedKey, setFeedKey] = useState(0);
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressMode, setProgressMode] = useState<"page" | "chapter">("page");
  const [pageInput, setPageInput] = useState(String(prog?.currentPage || ""));
  const [chapterInput, setChapterInput] = useState(prog?.currentChapter || "");

  if (!book) return null;

  const visibleMargins = bookMargins.filter((m) =>
    canUserSeeMargin(m, currentUser.spoilerPreference, prog)
  );
  const blockedCount = bookMargins.length - visibleMargins.length;

  const tabMargins: Record<string, typeof visibleMargins> = {
    todos: visibleMargins,
    insights: visibleMargins.filter((m) =>
      ["insight", "reaction", "personal_connection"].includes(m.postType)
    ),
    interpretacoes: visibleMargins.filter((m) =>
      ["theory", "symbolic_reading"].includes(m.postType)
    ),
    criticas: visibleMargins.filter((m) => m.postType === "critique"),
    perguntas: visibleMargins.filter((m) => m.postType === "question"),
    citacoes: visibleMargins.filter((m) => m.postType === "favorite_quote"),
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setFeedKey((k) => k + 1);
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

        {/* Sobre o livro */}
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

        {/* Content Filter Tabs + Feed */}
        <div>
          <div className="flex gap-1 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {TABS.map((tab) => {
              const count = tabMargins[tab.id]?.length ?? 0;
              return (
                <button
                  key={tab.id}
                  data-testid={`tab-${tab.id}`}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-shrink-0 font-sans text-[9px] font-light tracking-[0.12em] uppercase px-3 py-2 rounded-full border transition-all ${
                    activeTab === tab.id
                      ? "bg-[#AE8F7D] text-[#FAF8F3] border-transparent"
                      : "bg-transparent text-[#454545]/45 border-[#454545]/10 hover:border-[#AE8F7D]/25"
                  }`}
                >
                  {tab.label}{count > 0 ? ` · ${count}` : ""}
                </button>
              );
            })}
          </div>

          <div key={feedKey} className="space-y-3 feed-enter">
            {(tabMargins[activeTab] ?? []).length === 0 ? (
              <div className="text-center py-10 border border-dashed border-[#AE8F7D]/15 rounded-[14px]">
                <p className="font-serif italic text-[13px] text-[#454545]/35 mb-1">
                  Nenhuma margem nesta categoria ainda.
                </p>
                <p className="font-sans font-light text-[9px] text-[#454545]/25">
                  Seja o primeiro a registrar um pensamento aqui.
                </p>
              </div>
            ) : (
              (tabMargins[activeTab] ?? []).map((m) => (
                <MarginCard key={m.id} margin={m} />
              ))
            )}
          </div>
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
