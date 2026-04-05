import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Shield, BookOpen } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { MOCK_BOOKS, MOCK_MARGINS } from "@/data/mockData";
import { MarginCard } from "@/components/cards/MarginCard";
import { canUserSeeMargin } from "@/utils/spoiler";
import { SPOILER_PREFERENCES } from "@/data/constants";

const TABS = [
  { id: "ecos", label: "Ecos" },
  { id: "theories", label: "Teorias" },
  { id: "critiques", label: "Críticas" },
  { id: "questions", label: "Perguntas" },
  { id: "sobre", label: "Sobre" },
  { id: "mine", label: "Meus" },
];

function EcoMap({ bookId }: { bookId: number }) {
  const allMargins = MOCK_MARGINS.filter((m) => m.bookId === bookId && m.percent !== undefined);
  const buckets = Array.from({ length: 10 }, (_, i) => {
    const lo = i * 10;
    const hi = lo + 10;
    const count = allMargins.filter((m) => (m.percent ?? 0) >= lo && (m.percent ?? 0) < hi).length;
    return { lo, hi, count };
  });
  const max = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[14px] p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="font-sans text-[8px] font-light tracking-[0.2em] uppercase text-[#AE8F7D]">
          Mapa de Ecos
        </p>
        <p className="font-sans font-light text-[8px] text-[#454545]/25">{allMargins.length} margens mapeadas</p>
      </div>
      <p className="font-serif italic text-[11px] text-[#454545]/40 mb-4">
        Veja onde os leitores mais sentiram este livro.
      </p>

      <div className="flex items-end gap-1 h-14 mb-2">
        {buckets.map((b, i) => {
          const height = b.count > 0 ? Math.max((b.count / max) * 100, 12) : 4;
          const isPeak = b.count === max && b.count > 0;
          return (
            <div
              key={i}
              className="flex-1 rounded-t-[3px] transition-all relative group"
              style={{
                height: `${height}%`,
                backgroundColor: isPeak ? "#AE8F7D" : b.count > 0 ? "#BDAB9C" : "#EBE6DB",
                minHeight: "4px",
              }}
              title={`${b.lo}–${b.hi}%: ${b.count} margens`}
            >
              {isPeak && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 hidden group-hover:block">
                  <span className="font-sans text-[7px] text-[#AE8F7D] whitespace-nowrap bg-[#FAF8F3] px-1 rounded">
                    pico
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        <span className="font-sans font-light text-[7px] text-[#454545]/25">início</span>
        <span className="font-sans font-light text-[7px] text-[#454545]/25">final</span>
      </div>

      {max > 0 && (
        <div className="mt-3 pt-3 border-t border-[#454545]/5">
          {buckets
            .filter((b) => b.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 1)
            .map((b) => (
              <p key={b.lo} className="font-sans font-light text-[9px] text-[#697962]">
                ✦ Pico de reações entre {b.lo}–{b.hi}% do livro — {b.count} leitores pararam aqui
              </p>
            ))}
        </div>
      )}
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
  const [progressMode, setProgressMode] = useState<"page" | "chapter" | "percent">("percent");
  const [pageInput, setPageInput] = useState(String(prog?.currentPage || ""));
  const [chapterInput, setChapterInput] = useState(prog?.currentChapter || "");
  const [percentInput, setPercentInput] = useState(String(Math.round(prog?.currentPercent || 0)));

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

    if (progressMode === "percent") {
      percent = Math.min(100, Math.max(0, parseInt(percentInput) || 0));
      page = book.totalPages ? Math.round((percent / 100) * book.totalPages) : page;
    } else if (progressMode === "page" && book.totalPages) {
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
            <div className="w-16 h-22 rounded-[8px] bg-gradient-to-b from-[#EBE6DB] to-[#BDAB9C]/50 flex-shrink-0 shadow-sm" style={{ height: 88 }}>
              <div className="w-full h-full rounded-[8px] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#AE8F7D]/50" />
              </div>
            </div>
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
                      Informar progresso por
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 mb-3">
                      {[
                        { id: "percent", label: "%" },
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

                    {progressMode === "percent" && (
                      <div>
                        <input
                          data-testid="input-progress-percent"
                          type="range"
                          min={0}
                          max={100}
                          value={parseInt(percentInput) || 0}
                          onChange={(e) => setPercentInput(e.target.value)}
                          className="w-full accent-[#AE8F7D] mb-1"
                        />
                        <div className="flex justify-between">
                          <span className="font-sans font-light text-[8px] text-[#454545]/30">0%</span>
                          <span className="font-sans font-light text-[10px] text-[#AE8F7D] font-medium">{percentInput}%</span>
                          <span className="font-sans font-light text-[8px] text-[#454545]/30">100%</span>
                        </div>
                        {book.totalPages > 0 && (
                          <p className="font-sans font-light text-[8px] text-[#454545]/35 mt-1 text-center">
                            ≈ p. {Math.round((parseInt(percentInput) / 100) * book.totalPages)} de {book.totalPages}
                          </p>
                        )}
                      </div>
                    )}

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
        <EcoMap bookId={bookId} />

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
