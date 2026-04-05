import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";
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
  { id: "mine", label: "Meus registros" },
];

export function BookDetailScreen() {
  const params = useParams<{ id: string }>();
  const bookId = parseInt(params.id || "1", 10);
  const { currentUser, progress, updateBookProgress } = useApp();

  const book = MOCK_BOOKS.find((b) => b.id === bookId);
  const prog = progress.find((p) => p.bookId === bookId && p.userId === "user_me");
  const bookMargins = MOCK_MARGINS.filter((m) => m.bookId === bookId);

  const [activeTab, setActiveTab] = useState("ecos");
  const [editingProgress, setEditingProgress] = useState(false);
  const [progressInput, setProgressInput] = useState(String(prog?.currentPercent || 0));

  if (!book) return null;

  const progressMap = Object.fromEntries(progress.map((p) => [p.bookId, p]));

  const visibleMargins = bookMargins.filter((m) =>
    canUserSeeMargin(m, currentUser.spoilerPreference, prog)
  );
  const blockedCount = bookMargins.length - visibleMargins.length;

  const tabMargins = {
    ecos: visibleMargins,
    theories: visibleMargins.filter((m) => m.postType === "theory"),
    critiques: visibleMargins.filter((m) => m.postType === "critique"),
    questions: visibleMargins.filter((m) => m.postType === "question"),
    mine: bookMargins.filter((m) => m.userId === "user_me"),
  };

  const statusLabel = prog?.status === "reading" ? "Lendo"
    : prog?.status === "completed" ? "Concluído"
    : prog?.status === "wishlist" ? "Quero ler"
    : "Não iniciado";

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
          <h1 className="font-serif italic text-[18px] text-[#454545] leading-tight truncate">{book.title}</h1>
          <p className="font-sans font-light text-[9px] tracking-[0.12em] uppercase text-[#454545]/40">{book.author}</p>
        </div>
      </div>

      <div className="px-5 pb-8 space-y-6">
        {/* Book Info + Progress */}
        <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[14px] p-5 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-20 rounded-[8px] bg-[#EBE6DB] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-sans font-light text-[8px] tracking-[0.14em] uppercase text-[#AE8F7D] mb-1">
                {statusLabel}
              </p>
              {prog?.status === "reading" && (
                <>
                  <div className="flex items-end gap-1.5 mb-1">
                    <span className="font-serif italic text-[36px] leading-none text-[#AE8F7D]">
                      {Math.round(prog.currentPercent)}
                    </span>
                    <span className="font-sans font-light text-sm text-[#454545]/40 mb-0.5">%</span>
                  </div>
                  <div className="w-full h-[3px] bg-[#EBE6DB] rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-[#AE8F7D] rounded-full"
                      style={{ width: `${prog.currentPercent}%` }}
                    />
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

          {editingProgress && (
            <div className="mb-4 space-y-2">
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
                <div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={parseInt(progressInput) || 0}
                    onChange={(e) => {
                      setProgressInput(e.target.value);
                      updateBookProgress(bookId, { currentPercent: parseInt(e.target.value) });
                    }}
                    className="w-full accent-[#AE8F7D]"
                  />
                  <div className="flex justify-between">
                    <span className="font-sans font-light text-[8px] text-[#454545]/30">0%</span>
                    <span className="font-sans font-light text-[8px] text-[#AE8F7D]">{progressInput}%</span>
                    <span className="font-sans font-light text-[8px] text-[#454545]/30">100%</span>
                  </div>
                </div>
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
                <div className="font-serif text-[16px] text-[#454545]">{stat.value}</div>
                <div className="font-sans font-light text-[7px] tracking-[0.08em] uppercase text-[#454545]/35">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Anti-Spoiler Banner */}
        {blockedCount > 0 && (
          <div
            data-testid="spoiler-banner"
            className="flex items-center gap-3 bg-[#EBE6DB]/40 border border-[#AE8F7D]/15 rounded-[12px] px-4 py-3"
          >
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
                  {tab.label} {count > 0 && `· ${count}`}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {(tabMargins[activeTab as keyof typeof tabMargins] || []).length === 0 ? (
              <div className="text-center py-8">
                <p className="font-serif italic text-[13px] text-[#454545]/35">
                  Nenhuma margem nesta categoria ainda.
                </p>
              </div>
            ) : (
              (tabMargins[activeTab as keyof typeof tabMargins] || []).map((m) => (
                <MarginCard key={m.id} margin={m} />
              ))
            )}
          </div>
        </div>

        {/* Add Margin CTA */}
        <div className="pt-2">
          <Link href="/nova-margem" data-testid="button-add-margin-book">
            <button className="w-full bg-[#AE8F7D] text-[#FAF8F3] font-sans font-light text-[11px] tracking-[0.12em] uppercase py-4 rounded-[10px] hover:bg-[#AE8F7D]/90 transition-colors">
              Adicionar margem a este livro
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
