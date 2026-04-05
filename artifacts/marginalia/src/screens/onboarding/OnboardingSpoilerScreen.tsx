import { useState } from "react";
import { SPOILER_PREFERENCES, type SpoilerPreference } from "@/data/constants";
import { ArrowRight, Eye, BookOpen, Shield } from "lucide-react";

interface Props {
  selected: SpoilerPreference;
  onContinue: (pref: SpoilerPreference) => void;
}

const ICONS = [Eye, BookOpen, Shield];

export function OnboardingSpoilerScreen({ selected: initial, onContinue }: Props) {
  const [selected, setSelected] = useState<SpoilerPreference>(initial);

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col px-6 pt-12 pb-8"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    >
      <div className="mb-8">
        <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
          2 de 4
        </span>
        <div className="w-full h-[2px] bg-[#EBE6DB] rounded-full mt-2 mb-6">
          <div className="h-full bg-[#AE8F7D] rounded-full w-2/4" />
        </div>
        <h2 className="font-serif italic text-[28px] text-[#454545] leading-tight mb-2">
          Como você prefere explorar o app?
        </h2>
        <p className="font-sans font-light text-[11px] tracking-[0.06em] text-[#454545]/50 leading-relaxed">
          O Marginalia respeita o seu ritmo de leitura.
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
                  ? "border-[#AE8F7D]/60 bg-[#AE8F7D]/5"
                  : "border-[#454545]/10 bg-[#FAF8F3] hover:border-[#AE8F7D]/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected ? "bg-[#AE8F7D]/15" : "bg-[#EBE6DB]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isSelected ? "text-[#AE8F7D]" : "text-[#454545]/40"}`}
                  />
                </div>
                <div>
                  <div
                    className={`font-sans font-light text-[13px] mb-1 ${
                      isSelected ? "text-[#454545]" : "text-[#454545]/70"
                    }`}
                  >
                    {pref.label}
                  </div>
                  <div className="font-sans font-light text-[11px] text-[#454545]/45 leading-relaxed">
                    {pref.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-[#AE8F7D] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#FAF8F3]" />
                  </div>
                )}
              </div>
            </button>
          );
        })}

        <div className="pt-2 px-1">
          <p className="font-serif italic text-[11px] text-[#454545]/35 text-center leading-relaxed">
            "O Marginalia respeita o seu ritmo de leitura."
          </p>
        </div>
      </div>

      <div className="pt-6">
        <button
          data-testid="button-spoiler-continue"
          onClick={() => onContinue(selected)}
          className="w-full flex items-center justify-center gap-2 bg-[#AE8F7D] text-[#FAF8F3] font-sans font-light text-[12px] tracking-[0.14em] uppercase py-4 rounded-[10px] hover:bg-[#AE8F7D]/90 transition-colors"
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
