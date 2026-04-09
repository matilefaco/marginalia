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
        <button onClick={onBack} className="text-[#4A4540]/60 mb-6 w-fit hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <div className="mb-8">
        <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
          1 de 4
        </span>
        <div className="w-full h-[2px] bg-[#EBE6DB] rounded-full mt-2 mb-6">
          <div className="h-full bg-[#697962] rounded-full w-1/4" />
        </div>
        <h2 className="font-serif italic text-[28px] text-[#1E1C19] leading-tight mb-2">
          Que leituras mais chamam você?
        </h2>
        <p className="font-sans font-light text-[15px] text-[#4A4540]">
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
                className="font-sans text-[15px] font-light transition-all duration-200"
                style={{
                  padding: "10px 18px",
                  borderRadius: "100px",
                  border: `1.5px solid ${isSelected ? "#697962" : "#C8BFB4"}`,
                  backgroundColor: isSelected ? "#697962" : "#FFFFFF",
                  color: isSelected ? "#FFFFFF" : "#1E1C19",
                  fontWeight: isSelected ? 500 : 400,
                }}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4">
        {!canContinue && (
          <p className="font-sans font-light text-[14px] text-[#697962] text-center mb-3">
            {selected.length === 0
              ? "Escolha pelo menos 3 interesses"
              : `Mais ${3 - selected.length} para continuar`}
          </p>
        )}
        <button
          data-testid="button-genres-continue"
          onClick={() => onContinue(selected)}
          disabled={!canContinue}
          className="w-full flex items-center justify-center gap-2 text-[#FFFFFF] font-sans font-light text-[13px] tracking-[0.14em] uppercase active:scale-[0.99] transition-all"
          style={{
            backgroundColor: canContinue ? "#697962" : "#C8BFB4",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onContinue([])}
          className="w-full text-[#7A726A] font-sans font-light text-[13px] tracking-[0.08em] py-2 mt-1"
        >
          Pular por agora
        </button>
      </div>
    </div>
  );
}
