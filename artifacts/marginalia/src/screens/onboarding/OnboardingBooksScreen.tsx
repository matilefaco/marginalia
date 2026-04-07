import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MOCK_BOOKS } from "@/data/mockData";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  onComplete: () => void;
  onBack?: () => void;
}

type Status = "reading" | "completed" | "wishlist";

const STATUS_LABELS: Record<Status, string> = {
  reading: "Lendo",
  completed: "Concluído",
  wishlist: "Quero ler",
};

interface Sel {
  status: Status;
  page: string;
  chapter: string;
}

function calcPercent(sel: Sel, book: (typeof MOCK_BOOKS)[0]): number {
  if (sel.page && book.totalPages > 0) {
    return Math.min(100, Math.round((parseInt(sel.page) / book.totalPages) * 100));
  }
  if (sel.chapter && book.totalChapters > 0) {
    return Math.min(100, Math.round((parseInt(sel.chapter) / book.totalChapters) * 100));
  }
  return 0;
}

export function OnboardingBooksScreen({ onComplete, onBack }: Props) {
  const { updateBookProgress } = useApp();
  const [selections, setSelections] = useState<Record<number, Sel>>({});
  const [search, setSearch] = useState("");

  const filtered = MOCK_BOOKS.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCount = Object.keys(selections).length;
  const canContinue = selectedCount >= 1;

  const toggleBook = (bookId: number) => {
    setSelections((prev) => {
      if (prev[bookId]) {
        const next = { ...prev };
        delete next[bookId];
        return next;
      }
      return { ...prev, [bookId]: { status: "reading", page: "", chapter: "" } };
    });
  };

  const updateSel = (bookId: number, update: Partial<Sel>) => {
    setSelections((prev) => ({
      ...prev,
      [bookId]: { ...prev[bookId], ...update },
    }));
  };

  const handleComplete = () => {
    Object.entries(selections).forEach(([bookId, sel]) => {
      const book = MOCK_BOOKS.find((b) => b.id === parseInt(bookId));
      const pct = book ? calcPercent(sel, book) : 0;
      const page = sel.page ? parseInt(sel.page) : 0;
      updateBookProgress(parseInt(bookId), {
        status: sel.status,
        currentPercent: pct,
        currentPage: page,
        currentChapter: sel.chapter,
      });
    });
    onComplete();
  };

  return (
    <div
      className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col px-6 pt-10 pb-8"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    >
      {onBack && (
        <button onClick={onBack} className="text-[#454545]/40 mb-6 w-fit">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <div className="mb-6">
        <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
          5 de 5
        </span>
        <div className="w-full h-[2px] bg-[#EBE6DB] rounded-full mt-2 mb-6">
          <div className="h-full bg-[#AE8F7D] rounded-full w-full" />
        </div>
        <h2 className="font-serif italic text-[28px] text-[#454545] leading-tight mb-2">
          O que você está lendo agora?
        </h2>
        <p className="font-sans font-light text-[11px] text-[#454545]/50">
          Isso alimenta seu feed e protege seu ritmo de leitura.
        </p>
      </div>

      <div className="flex items-center gap-3 bg-[#EBE6DB]/60 rounded-[10px] px-4 py-3 mb-4 border border-[#AE8F7D]/10">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar livro ou autor..."
          className="flex-1 bg-transparent font-sans font-light text-[12px] text-[#454545] placeholder:text-[#454545]/35 outline-none"
        />
      </div>

      <div className="flex-1 overflow-auto space-y-2 mb-4">
        {filtered.map((book) => {
          const sel = selections[book.id];
          const isSelected = !!sel;
          const pct = isSelected ? calcPercent(sel, book) : 0;

          return (
            <div
              key={book.id}
              data-testid={`book-onboarding-${book.id}`}
              className={`rounded-[12px] border transition-all duration-200 overflow-hidden ${
                isSelected ? "border-[#AE8F7D]/40 bg-[#AE8F7D]/3" : "border-[#454545]/8 bg-[#FAF8F3]"
              }`}
            >
              <button
                onClick={() => toggleBook(book.id)}
                className="w-full flex items-center gap-3 p-4"
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    isSelected ? "border-[#AE8F7D] bg-[#AE8F7D]" : "border-[#454545]/20"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#FAF8F3]" />}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-serif text-[14px] text-[#2A2A2A]">{book.title}</div>
                  <div className="font-sans font-light text-[10px] tracking-[0.06em] uppercase text-[#454545]/45">
                    {book.author}
                  </div>
                </div>
                {isSelected && <CheckCircle className="w-4 h-4 text-[#AE8F7D] flex-shrink-0" />}
              </button>

              {isSelected && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="flex gap-2">
                    {(["reading", "completed", "wishlist"] as Status[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateSel(book.id, { status: s })}
                        className={`flex-1 font-sans text-[9px] font-light tracking-[0.1em] py-1.5 rounded-full border transition-all ${
                          sel.status === s
                            ? "bg-[#454545] text-[#FAF8F3] border-transparent"
                            : "bg-transparent text-[#454545]/50 border-[#454545]/12"
                        }`}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>

                  {sel.status === "reading" && (
                    <div className="bg-[#EBE6DB]/40 rounded-[10px] p-3 space-y-2.5">
                      <p className="font-sans text-[8px] font-light tracking-[0.14em] uppercase text-[#AE8F7D]">
                        Você está em que ponto?
                      </p>
                      {book.totalPages > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-light text-[10px] text-[#454545]/55 w-14 flex-shrink-0">Página</span>
                          <input
                            type="number"
                            min={1}
                            max={book.totalPages}
                            value={sel.page}
                            onChange={(e) => updateSel(book.id, { page: e.target.value, chapter: "" })}
                            placeholder="—"
                            className="w-14 font-serif italic text-[14px] text-[#AE8F7D] text-center bg-[#FAF8F3] rounded-[6px] py-1 border border-[#AE8F7D]/15 focus:border-[#AE8F7D]/40 outline-none"
                          />
                          <span className="font-sans font-light text-[9px] text-[#454545]/40">de {book.totalPages}</span>
                        </div>
                      )}
                      {book.totalChapters > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-light text-[10px] text-[#454545]/55 w-14 flex-shrink-0">Capítulo</span>
                          <input
                            type="number"
                            min={1}
                            max={book.totalChapters}
                            value={sel.chapter}
                            onChange={(e) => updateSel(book.id, { chapter: e.target.value, page: "" })}
                            placeholder="—"
                            className="w-14 font-serif italic text-[14px] text-[#AE8F7D] text-center bg-[#FAF8F3] rounded-[6px] py-1 border border-[#AE8F7D]/15 focus:border-[#AE8F7D]/40 outline-none"
                          />
                          <span className="font-sans font-light text-[9px] text-[#454545]/40">de {book.totalChapters}</span>
                        </div>
                      )}
                      {(sel.page || sel.chapter) && pct > 0 && (
                        <p className="font-sans font-light text-[9px] text-[#697962]">
                          ≈ {pct}% do livro
                        </p>
                      )}
                      {!sel.page && !sel.chapter && (
                        <p className="font-sans font-light text-[8px] text-[#454545]/30 italic">
                          Deixar em branco para começar do início
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div>
        {!canContinue && (
          <p className="font-sans font-light text-[10px] text-[#AE8F7D]/70 text-center mb-3 tracking-[0.06em]">
            Selecione pelo menos um livro para continuar
          </p>
        )}
        <button
          data-testid="button-books-complete"
          onClick={handleComplete}
          disabled={!canContinue}
          className="w-full flex items-center justify-center gap-2 bg-[#454545] text-[#FAF8F3] font-sans font-light text-[12px] tracking-[0.14em] uppercase py-4 rounded-[10px] disabled:opacity-30 hover:bg-[#454545]/90 active:scale-[0.99] transition-all"
        >
          {selectedCount > 0 ? `Entrar no Marginalia · ${selectedCount} ${selectedCount === 1 ? "livro" : "livros"}` : "Entrar no Marginalia"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
