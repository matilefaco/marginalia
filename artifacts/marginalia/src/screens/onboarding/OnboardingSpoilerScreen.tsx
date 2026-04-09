import { useState } from "react";
import { SPOILER_PREFERENCES, type SpoilerPreference } from "@/data/constants";
import { ArrowRight, Eye, Shield } from "lucide-react";

interface Props {
  selected: SpoilerPreference | null;
  onContinue: (pref: SpoilerPreference) => void;
  onBack?: () => void;
}

const ICONS = [Shield, Eye];

export function OnboardingSpoilerScreen({ selected: initial, onContinue, onBack }: Props) {
  const [selected, setSelected] = useState<SpoilerPreference | null>(initial);
  const canContinue = selected !== null;

  return (
    <div
      className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col px-6 pt-10 pb-8"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    >
      {onBack && (
        <button onClick={onBack} className="text-[#4A4540]/60 mb-6 w-fit hover:opacity-70 transition-opacity">
          <ArrowRight className="w-5 h-5 rotate-180" />
        </button>
      )}

      <div className="mb-7">
        <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
          3 de 4
        </span>
        <div className="w-full h-[2px] bg-[#EBE6DB] rounded-full mt-2 mb-6">
          <div className="h-full bg-[#697962] rounded-full w-3/4" />
        </div>
        <h2 className="font-serif italic text-[28px] text-[#1E1C19] leading-tight mb-2">
          Como você prefere explorar o app?
        </h2>
        <p className="font-sans font-light text-[15px] text-[#4A4540] leading-relaxed">
          Escolha como quer explorar a comunidade.
        </p>
      </div>

      <div className="flex-1 space-y-3">
        {SPOILER_PREFERENCES.map((pref, i) => {
          const Icon = ICONS[i];
          const isSelected = selected === pref.id;
          return (
            <button
              key={pref.id}
              data-testid={`card-spoiler-${pref.id}`}
              onClick={() => setSelected(pref.id as SpoilerPreference)}
              className="w-full text-left transition-all duration-200"
              style={{
                padding: "16px",
                borderRadius: "12px",
                border: `1.5px solid ${isSelected ? "#697962" : "#D4CBB8"}`,
                backgroundColor: isSelected ? "#F5F1EA" : "#FFFFFF",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                  style={{ backgroundColor: isSelected ? "rgba(105,121,98,0.15)" : "#EBE6DB" }}
                >
                  <Icon
                    className="w-4 h-4 transition-colors"
                    style={{ color: isSelected ? "#697962" : "#7A726A" }}
                  />
                </div>
                <div className="flex-1">
                  <div
                    className="font-sans mb-1.5 transition-colors"
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "#1E1C19",
                    }}
                  >
                    {pref.label}
                  </div>
                  <div
                    className="font-sans font-light leading-relaxed"
                    style={{ fontSize: "14px", color: "#4A4540", lineHeight: 1.5 }}
                  >
                    {pref.description}
                  </div>
                </div>
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mt-0.5"
                  style={{
                    borderColor: isSelected ? "#697962" : "#C8BFB4",
                    backgroundColor: isSelected ? "#697962" : "#FFFFFF",
                  }}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#FFFFFF]" />}
                </div>
              </div>
            </button>
          );
        })}

        <div className="pt-4 px-1">
          <p className="font-sans font-light text-[12px] text-[#7A726A] text-center leading-relaxed">
            Você poderá alterar essa preferência a qualquer momento em Preferências.
          </p>
        </div>
      </div>

      <div className="pt-5">
        {!canContinue && (
          <p className="font-sans font-light text-[14px] text-[#697962] text-center mb-3">
            Selecione uma opção para continuar
          </p>
        )}
        <button
          data-testid="button-spoiler-continue"
          onClick={() => canContinue && onContinue(selected!)}
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
      </div>
    </div>
  );
}
