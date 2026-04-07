import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AVATAR_FAMILIES, AVATAR_DEFINITIONS, type AvatarFamily, type AvatarId } from "@/data/avatarDefinitions";
import { AvatarIcon } from "./AvatarIcon";

interface Props {
  selected?: string | null;
  onChange: (id: AvatarId) => void;
  initials?: string;
}

export function AvatarPicker({ selected, onChange, initials }: Props) {
  const [activeFamily, setActiveFamily] = useState<AvatarFamily | null>(
    selected
      ? (AVATAR_DEFINITIONS.find((a) => a.id === selected)?.family ?? null)
      : null
  );

  const familyAvatars = activeFamily
    ? AVATAR_DEFINITIONS.filter((a) => a.family === activeFamily)
    : [];

  return (
    <div>
      {!activeFamily ? (
        <div className="grid grid-cols-2 gap-3">
          {AVATAR_FAMILIES.map((fam) => {
            const previews = fam.avatars.slice(0, 4);
            return (
              <button
                key={fam.id}
                onClick={() => setActiveFamily(fam.id)}
                className="bg-[#EBE6DB]/60 border border-[#AE8F7D]/15 rounded-[14px] p-3 text-left hover:border-[#AE8F7D]/40 hover:bg-[#EBE6DB] active:scale-[0.98] transition-all"
              >
                <div className="flex gap-1.5 mb-2.5">
                  {previews.map((id) => (
                    <AvatarIcon
                      key={id}
                      avatarId={id}
                      size="xs"
                      className={selected === id ? "ring-1 ring-[#AE8F7D] ring-offset-1" : ""}
                    />
                  ))}
                </div>
                <p className="font-sans text-[10px] font-medium text-[#2A2A2A] leading-tight">
                  {fam.label}
                </p>
                <p className="font-sans font-light text-[9px] text-[#8A8178] mt-0.5 leading-snug">
                  {fam.description}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setActiveFamily(null)}
            className="flex items-center gap-1.5 text-[#AE8F7D] mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="font-sans font-light text-[10px] tracking-[0.08em]">
              {AVATAR_FAMILIES.find((f) => f.id === activeFamily)?.label}
            </span>
          </button>
          <div className="grid grid-cols-2 gap-4">
            {familyAvatars.map((avatar) => {
              const isSelected = selected === avatar.id;
              return (
                <button
                  key={avatar.id}
                  onClick={() => onChange(avatar.id)}
                  className={`flex flex-col items-center gap-2.5 p-3 rounded-[14px] border transition-all active:scale-[0.97] ${
                    isSelected
                      ? "border-[#AE8F7D]/70 bg-[#EBE6DB]"
                      : "border-[#AE8F7D]/15 bg-[#EBE6DB]/40 hover:border-[#AE8F7D]/35"
                  }`}
                >
                  <div className="relative">
                    <AvatarIcon
                      avatarId={avatar.id}
                      initials={initials}
                      size="lg"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 rounded-full ring-2 ring-[#AE8F7D] ring-offset-2 ring-offset-[#EBE6DB]" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-serif italic text-[13px] text-[#2A2A2A] leading-tight">
                      {avatar.name}
                    </p>
                    <p className="font-sans font-light text-[9px] text-[#8A8178] mt-0.5 leading-snug">
                      {avatar.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
