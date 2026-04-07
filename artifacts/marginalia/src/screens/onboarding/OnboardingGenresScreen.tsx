import { useState } from "react";
import { GENRES } from "@/data/constants";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  selected: string[];
  onContinue: (genres: string[]) => void;
  onBack?: () => void;
}

export function OnboardingGenresScreen({ selected: initial, onContinue, onBack }: Props) {
  const [selected, setSelected] = useState<string[]>(initial);
  const canContinue = selected.length >= 3;

  const toggle = (genre: string) => {
    setSelected((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col px-6 pt-10 pb-8"
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

      <div className="mb-8">
        <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
          1 de 5
        </span>
        <div className="w-full h-[2px] bg-[#EBE6DB] rounded-full mt-2 mb-6">
          <div className="h-full bg-[#AE8F7D] rounded-full w-1/5" />
        </div>
        <h2 className="font-serif italic text-[28px] text-[#454545] leading-tight mb-2">
          Que leituras mais chamam você?
        </h2>
        <p className="font-sans font-light text-[11px] tracking-[0.06em] text-[#454545]/50">
          Selecione quantas quiser. Isso personaliza seu feed.
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex flex-wrap gap-2 pb-4">
          {GENRES.map((genre) => {
            const isSelected = selected.includes(genre);
            return (
              <button
                key={genre}
                data-testid={`chip-genre-${genre}`}
                onClick={() => toggle(genre)}
                className={`font-sans text-[11px] font-light px-4 py-2.5 rounded-full border transition-all duration-200 ${
                  isSelected
                    ? "bg-[#454545] text-[#FAF8F3] border-transparent"
                    : "bg-transparent text-[#454545]/60 border-[#454545]/15 hover:border-[#AE8F7D]/40"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4">
        {!canContinue && (
          <p className="font-sans font-light text-[10px] text-[#AE8F7D]/70 text-center mb-3 tracking-[0.06em]">
            {selected.length === 0
              ? "Escolha pelo menos 3 interesses"
              : `Mais ${3 - selected.length} para continuar`}
          </p>
        )}
        <button
          data-testid="button-genres-continue"
          onClick={() => onContinue(selected)}
          disabled={!canContinue}
          className="w-full flex items-center justify-center gap-2 bg-[#AE8F7D] text-[#FAF8F3] font-sans font-light text-[12px] tracking-[0.14em] uppercase py-4 rounded-[10px] disabled:opacity-30 hover:bg-[#AE8F7D]/90 active:scale-[0.99] transition-all"
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onContinue([])}
          className="w-full text-[#454545]/30 font-sans font-light text-[10px] tracking-[0.08em] py-2 mt-1"
        >
          Pular por agora
        </button>
      </div>
    </div>
  );
}
