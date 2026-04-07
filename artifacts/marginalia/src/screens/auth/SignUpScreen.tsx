import { useState } from "react";
import { ArrowRight, ArrowLeft, Loader2, X, ChevronLeft } from "lucide-react";
import { AvatarIcon } from "@/components/AvatarIcon";
import {
  AVATAR_FAMILIES,
  AVATAR_DEFINITIONS,
  getAvatarById,
  type AvatarId,
  type AvatarFamily,
} from "@/data/avatarDefinitions";

interface Props {
  onComplete: (data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    bio: string;
    avatarId: AvatarId;
  }) => Promise<void>;
  onBack: () => void;
  externalError?: string;
}

function AvatarSheet({
  onSelect,
  onClose,
  initials,
}: {
  onSelect: (id: AvatarId) => void;
  onClose: () => void;
  initials?: string;
}) {
  const [activeFamily, setActiveFamily] = useState<AvatarFamily | null>(null);
  const family = activeFamily
    ? AVATAR_FAMILIES.find((f) => f.id === activeFamily)
    : null;
  const familyAvatars = family
    ? AVATAR_DEFINITIONS.filter((a) => a.family === activeFamily)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-md bg-[#FAF8F3] rounded-t-[24px] px-5 pt-5 pb-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-[3px] bg-[#BDAB9C]/50 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-4">
          {activeFamily ? (
            <button
              onClick={() => setActiveFamily(null)}
              className="flex items-center gap-1 text-[#454545]/40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-sans font-light text-[10px] tracking-[0.08em]">
                Categorias
              </span>
            </button>
          ) : (
            <h3 className="font-serif italic text-[18px] text-[#454545]">
              Escolha seu avatar
            </h3>
          )}
          <button onClick={onClose} className="text-[#454545]/30 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!activeFamily ? (
          <div className="space-y-2">
            {AVATAR_FAMILIES.map((fam) => (
              <button
                key={fam.id}
                onClick={() => setActiveFamily(fam.id)}
                className="w-full flex items-center justify-between bg-[#EBE6DB]/40 hover:bg-[#EBE6DB]/70 border border-[#BDAB9C]/20 rounded-[12px] px-4 py-3 transition-colors text-left"
              >
                <div>
                  <p className="font-sans font-light text-[12px] text-[#2A2A2A] tracking-[0.04em]">
                    {fam.label}
                  </p>
                  <p className="font-sans font-light text-[10px] text-[#454545]/40 mt-0.5">
                    {fam.description}
                  </p>
                </div>
                <div className="flex gap-1 ml-3 flex-shrink-0">
                  {fam.avatars.slice(0, 3).map((id) => (
                    <AvatarIcon
                      key={id}
                      avatarId={id}
                      initials={initials}
                      size="xs"
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {familyAvatars.map((av) => (
              <button
                key={av.id}
                onClick={() => {
                  onSelect(av.id);
                  onClose();
                }}
                className="flex flex-col items-center gap-2 bg-[#EBE6DB]/40 hover:bg-[#EBE6DB]/70 border border-[#BDAB9C]/20 rounded-[14px] px-3 py-4 transition-colors"
              >
                <AvatarIcon avatarId={av.id} initials={initials} size="md" />
                <div className="text-center">
                  <p className="font-sans font-light text-[11px] text-[#2A2A2A] tracking-[0.04em]">
                    {av.name}
                  </p>
                  <p className="font-sans font-light text-[9px] text-[#454545]/40 mt-0.5 leading-snug">
                    {av.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SignUpScreen({ onComplete, onBack, externalError }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [avatarId, setAvatarId] = useState<AvatarId | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [loading, setLoading] = useState(false);

  const avatarDef = avatarId ? getAvatarById(avatarId) : null;
  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : firstName
    ? firstName[0].toUpperCase()
    : "?";

  const valid =
    firstName.trim() &&
    email.trim() &&
    password.trim().length >= 6 &&
    avatarId !== null;

  const handleSubmit = async () => {
    if (!valid || loading || !avatarId) return;
    setLoading(true);
    await onComplete({ firstName, lastName, username, email, password, bio, avatarId });
    setLoading(false);
  };

  return (
    <>
      <div
        className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col px-6 pt-10 pb-8"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)",
          backgroundSize: "5px 5px",
        }}
      >
        <button onClick={onBack} className="text-[#454545]/40 mb-6 w-fit">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
            2 de 4
          </span>
          <div className="w-full h-[2px] bg-[#EBE6DB] rounded-full mt-2 mb-6">
            <div className="h-full bg-[#AE8F7D] rounded-full w-2/4" />
          </div>
          <h2 className="font-serif italic text-[28px] text-[#454545] leading-tight mb-1">
            Criar conta
          </h2>
          <p className="font-sans font-light text-[11px] text-[#454545]/45">
            Seu espaço pessoal de leitura começa aqui.
          </p>
        </div>

        <div className="flex-1 space-y-5 overflow-auto pb-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-sans text-[9px] font-light tracking-[0.16em] uppercase text-[#AE8F7D] block mb-1.5">
                Nome
              </label>
              <input
                data-testid="input-first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ana"
                className="w-full font-serif italic text-[15px] text-[#454545] placeholder:text-[#454545]/20 bg-transparent border-b border-[#454545]/12 pb-2 outline-none focus:border-[#AE8F7D]/60 transition-colors"
              />
            </div>
            <div>
              <label className="font-sans text-[9px] font-light tracking-[0.16em] uppercase text-[#AE8F7D] block mb-1.5">
                Sobrenome
              </label>
              <input
                data-testid="input-last-name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Clara"
                className="w-full font-serif italic text-[15px] text-[#454545] placeholder:text-[#454545]/20 bg-transparent border-b border-[#454545]/12 pb-2 outline-none focus:border-[#AE8F7D]/60 transition-colors"
              />
            </div>
          </div>

          {[
            {
              label: "@username",
              value: username,
              set: setUsername,
              placeholder: "@seunome",
              testid: "input-username",
            },
            {
              label: "E-mail",
              value: email,
              set: setEmail,
              placeholder: "seu@email.com",
              testid: "input-email",
              type: "email",
            },
            {
              label: "Senha",
              value: password,
              set: setPassword,
              placeholder: "Mínimo 6 caracteres",
              testid: "input-password",
              type: "password",
            },
          ].map(({ label, value, set, placeholder, testid, type }) => (
            <div key={testid}>
              <label className="font-sans text-[9px] font-light tracking-[0.16em] uppercase text-[#AE8F7D] block mb-1.5">
                {label}
              </label>
              <input
                data-testid={testid}
                type={type || "text"}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="w-full font-serif italic text-[15px] text-[#454545] placeholder:text-[#454545]/20 bg-transparent border-b border-[#454545]/12 pb-2 outline-none focus:border-[#AE8F7D]/60 transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="font-sans text-[9px] font-light tracking-[0.16em] uppercase text-[#AE8F7D] block mb-1.5">
              Bio{" "}
              <span className="text-[#454545]/25 normal-case tracking-normal">
                · opcional
              </span>
            </label>
            <textarea
              data-testid="input-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="O que a leitura significa para você?"
              rows={2}
              className="w-full font-serif italic text-[14px] text-[#454545] placeholder:text-[#454545]/20 bg-transparent border-b border-[#454545]/12 pb-2 outline-none focus:border-[#AE8F7D]/60 transition-colors resize-none"
            />
          </div>

          <div className="pt-1">
            <div className="w-full h-[1px] bg-[#EBE6DB] mb-4" />
            <p className="font-sans text-[9px] font-light tracking-[0.16em] uppercase text-[#AE8F7D] mb-3">
              Avatar
            </p>

            {avatarDef ? (
              <div className="flex items-center gap-3 bg-[#EBE6DB]/40 border border-[#AE8F7D]/15 rounded-[14px] px-4 py-3">
                <AvatarIcon avatarId={avatarId!} initials={initials} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-serif italic text-[14px] text-[#2A2A2A] leading-tight">
                    {avatarDef.name}
                  </p>
                  <p className="font-sans font-light text-[10px] text-[#454545]/40 mt-0.5">
                    {avatarDef.description}
                  </p>
                </div>
                <button
                  onClick={() => setShowSheet(true)}
                  className="font-sans font-light text-[10px] text-[#AE8F7D] tracking-[0.06em] flex-shrink-0"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <button
                data-testid="button-choose-avatar"
                onClick={() => setShowSheet(true)}
                className="w-full flex items-center gap-3 bg-[#EBE6DB]/25 border border-dashed border-[#AE8F7D]/25 rounded-[14px] px-4 py-3.5 text-left"
              >
                <div className="w-9 h-9 rounded-full bg-[#EBE6DB]/70 flex items-center justify-center flex-shrink-0">
                  <span className="font-serif italic text-[13px] text-[#AE8F7D]/50">
                    {initials}
                  </span>
                </div>
                <div>
                  <p className="font-sans font-light text-[11px] text-[#454545]/40">
                    Escolha seu avatar
                  </p>
                  <p className="font-sans font-light text-[9px] text-[#454545]/25 mt-0.5">
                    Aparece no perfil e nos seus posts
                  </p>
                </div>
              </button>
            )}

            {!avatarId && (
              <p className="font-sans font-light text-[9px] text-[#AE8F7D]/60 text-center mt-2">
                Escolha um avatar para continuar
              </p>
            )}
          </div>

          {externalError && (
            <p className="font-sans text-[11px] text-red-400 text-center">
              {externalError}
            </p>
          )}
        </div>

        <div className="pt-5">
          <button
            data-testid="button-create-account"
            onClick={handleSubmit}
            disabled={!valid || loading}
            className="w-full flex items-center justify-center gap-2 bg-[#454545] text-[#FAF8F3] font-sans font-light text-[12px] tracking-[0.14em] uppercase py-4 rounded-[10px] disabled:opacity-30 hover:bg-[#454545]/90 active:scale-[0.99] transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Continuar
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {showSheet && (
        <AvatarSheet
          initials={initials}
          onSelect={(id) => setAvatarId(id)}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  );
}
