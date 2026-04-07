import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AvatarPicker } from "@/components/AvatarPicker";
import { AvatarIcon } from "@/components/AvatarIcon";
import type { AvatarId } from "@/data/avatarDefinitions";

interface Props {
  initials?: string;
  onContinue: (avatarId: AvatarId) => void;
  onBack: () => void;
}

export function OnboardingAvatarScreen({ initials, onContinue, onBack }: Props) {
  const [selected, setSelected] = useState<AvatarId | null>(null);

  return (
    <div
      className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col px-6 pt-10 pb-8"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    >
      <button onClick={onBack} className="text-[#454545]/40 mb-6 w-fit">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="mb-6">
        <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
          4 de 5
        </span>
        <div className="w-full h-[2px] bg-[#EBE6DB] rounded-full mt-2 mb-6">
          <div className="h-full bg-[#AE8F7D] rounded-full w-4/5" />
        </div>
        <h2 className="font-serif italic text-[28px] text-[#454545] leading-tight mb-1">
          Escolha seu avatar
        </h2>
        <p className="font-sans font-light text-[11px] text-[#454545]/45">
          Aparece no seu perfil, nos seus posts e nas respostas.
        </p>
      </div>

      {selected && (
        <div className="flex items-center gap-3 bg-[#EBE6DB]/40 border border-[#AE8F7D]/15 rounded-[14px] px-4 py-3 mb-5">
          <AvatarIcon avatarId={selected} initials={initials} size="md" />
          <p className="font-serif italic text-[13px] text-[#2A2A2A]/70">
            Boa escolha — este é você no Marginalia.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-auto pb-4">
        <AvatarPicker
          selected={selected}
          onChange={setSelected}
          initials={initials}
        />
      </div>

      <div className="pt-5">
        <button
          data-testid="button-avatar-continue"
          onClick={() => selected && onContinue(selected)}
          disabled={!selected}
          className="w-full flex items-center justify-center gap-2 bg-[#454545] text-[#FAF8F3] font-sans font-light text-[12px] tracking-[0.14em] uppercase py-4 rounded-[10px] disabled:opacity-30 hover:bg-[#454545]/90 active:scale-[0.99] transition-all"
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
