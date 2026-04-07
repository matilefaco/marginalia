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
        <button onClick={onBack} className="text-[#454545]/40 mb-6 w-fit">
          <ArrowRight className="w-5 h-5 rotate-180" />
        </button>
      )}

      <div className="mb-7">
        <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
          2 de 5
        </span>
        <div className="w-full h-[2px] bg-[#EBE6DB] rounded-full mt-2 mb-6">
          <div className="h-full bg-[#AE8F7D] rounded-full w-2/5" />
        </div>
        <h2 className="font-serif italic text-[28px] text-[#454545] leading-tight mb-2">
          Como você prefere explorar o app?
        </h2>
        <p className="font-sans font-light text-[11px] tracking-[0.04em] text-[#454545]/50 leading-relaxed">
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
              className={`w-full text-left p-5 rounded-[14px] border transition-all duration-200 ${
                isSelected
                  ? "border-[#AE8F7D]/70 bg-[#AE8F7D]/8 shadow-sm"
                  : "border-[#454545]/10 bg-[#FAF8F3] hover:border-[#AE8F7D]/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    isSelected ? "bg-[#AE8F7D]/20" : "bg-[#EBE6DB]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${isSelected ? "text-[#AE8F7D]" : "text-[#454545]/40"}`}
                  />
                </div>
                <div className="flex-1">
                  <div
                    className={`font-sans font-light text-[13px] mb-1.5 transition-colors ${
                      isSelected ? "text-[#454545]" : "text-[#454545]/70"
                    }`}
                  >
                    {pref.label}
                  </div>
                  <div className="font-sans font-light text-[11px] text-[#454545]/45 leading-relaxed">
                    {pref.description}
                  </div>
                </div>
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 ${
                    isSelected
                      ? "border-[#AE8F7D] bg-[#AE8F7D]"
                      : "border-[#454545]/20"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#FAF8F3]" />}
                </div>
              </div>
            </button>
          );
        })}

        <div className="pt-4 px-1">
          <p className="font-sans font-light text-[10px] text-[#454545]/35 text-center leading-relaxed">
            Você poderá alterar essa preferência a qualquer momento em Preferências.
          </p>
        </div>
      </div>

      <div className="pt-5">
        {!canContinue && (
          <p className="font-sans font-light text-[10px] text-[#AE8F7D]/70 text-center mb-3 tracking-[0.06em]">
            Selecione uma opção para continuar
          </p>
        )}
        <button
          data-testid="button-spoiler-continue"
          onClick={() => canContinue && onContinue(selected!)}
          disabled={!canContinue}
          className="w-full flex items-center justify-center gap-2 bg-[#AE8F7D] text-[#FAF8F3] font-sans font-light text-[12px] tracking-[0.14em] uppercase py-4 rounded-[10px] disabled:opacity-30 hover:bg-[#AE8F7D]/90 active:scale-[0.99] transition-all"
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
