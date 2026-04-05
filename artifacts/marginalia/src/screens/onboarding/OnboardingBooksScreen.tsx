import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MOCK_BOOKS } from "@/data/mockData";
import { CheckCircle, ArrowRight } from "lucide-react";

interface Props {
  onComplete: () => void;
}

type Status = "reading" | "completed" | "wishlist";

const STATUS_LABELS: Record<Status, string> = {
  reading: "Lendo",
  completed: "Concluído",
  wishlist: "Quero ler",
};

export function OnboardingBooksScreen({ onComplete }: Props) {
  const { updateBookProgress } = useApp();
  const [selections, setSelections] = useState<Record<number, { status: Status; percent: number }>>({});
  const [search, setSearch] = useState("");

  const filtered = MOCK_BOOKS.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBook = (bookId: number) => {
    setSelections((prev) => {
      if (prev[bookId]) {
        const next = { ...prev };
        delete next[bookId];
        return next;
      }
      return { ...prev, [bookId]: { status: "reading", percent: 0 } };
    });
  };

  const updateSelection = (bookId: number, update: Partial<{ status: Status; percent: number }>) => {
    setSelections((prev) => ({
      ...prev,
      [bookId]: { ...prev[bookId], ...update },
    }));
  };

  const handleComplete = () => {
    Object.entries(selections).forEach(([bookId, sel]) => {
      updateBookProgress(parseInt(bookId), {
        status: sel.status,
        currentPercent: sel.percent,
      });
    });
    onComplete();
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col px-6 pt-10 pb-8"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    >
      <div className="mb-6">
        <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
          4 de 4
        </span>
        <div className="w-full h-[2px] bg-[#EBE6DB] rounded-full mt-2 mb-6">
          <div className="h-full bg-[#AE8F7D] rounded-full w-full" />
        </div>
        <h2 className="font-serif italic text-[28px] text-[#454545] leading-tight mb-2">
          O que você está lendo agora?
        </h2>
        <p className="font-sans font-light text-[11px] text-[#454545]/50">
          Isso alimenta seu feed e protege seu ritmo.
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
                  <div className="font-serif text-[14px] text-[#454545]">{book.title}</div>
                  <div className="font-sans font-light text-[10px] tracking-[0.06em] uppercase text-[#454545]/40">
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
                        onClick={() => updateSelection(book.id, { status: s })}
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
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-sans font-light text-[9px] text-[#454545]/40 tracking-[0.08em] uppercase">
                          Progresso
                        </span>
                        <span className="font-sans font-light text-[9px] text-[#AE8F7D]">
                          {sel.percent}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={sel.percent}
                        onChange={(e) => updateSelection(book.id, { percent: parseInt(e.target.value) })}
                        className="w-full accent-[#AE8F7D]"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        data-testid="button-books-complete"
        onClick={handleComplete}
        className="w-full flex items-center justify-center gap-2 bg-[#454545] text-[#FAF8F3] font-sans font-light text-[12px] tracking-[0.14em] uppercase py-4 rounded-[10px] hover:bg-[#454545]/90 transition-colors"
      >
        {Object.keys(selections).length > 0 ? "Entrar no Marginalia" : "Pular e entrar"}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
