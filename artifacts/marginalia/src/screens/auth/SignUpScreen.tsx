import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";

const AVATAR_COLORS = [
  { id: "verde", label: "Verde musgo", value: "#697962" },
  { id: "terracota", label: "Terracota", value: "#AE8F7D" },
  { id: "bege", label: "Bege", value: "#BDAB9C" },
  { id: "vinho", label: "Vinho", value: "#6B3A3A" },
  { id: "azul", label: "Azul acinzentado", value: "#6A7D8A" },
  { id: "marrom", label: "Marrom suave", value: "#8B6F5E" },
  { id: "cinza", label: "Cinza", value: "#7A7A7A" },
];

interface Props {
  onComplete: (data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    bio: string;
    avatarColor: string;
  }) => Promise<void>;
  onBack: () => void;
  externalError?: string;
}

export function SignUpScreen({ onComplete, onBack, externalError }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [avatarColor, setAvatarColor] = useState("#697962");
  const [loading, setLoading] = useState(false);

  const valid = firstName.trim() && email.trim() && password.trim().length >= 6;

  const handleSubmit = async () => {
    if (!valid || loading) return;
    setLoading(true);
    await onComplete({ firstName, lastName, username, email, password, bio, avatarColor });
    setLoading(false);
  };

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

      <div className="mb-8">
        <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
          3 de 4
        </span>
        <div className="w-full h-[2px] bg-[#EBE6DB] rounded-full mt-2 mb-6">
          <div className="h-full bg-[#AE8F7D] rounded-full w-3/4" />
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

        <div className="bg-[#EBE6DB]/40 border border-[#AE8F7D]/12 rounded-[12px] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300"
              style={{ backgroundColor: avatarColor }}
            >
              <span className="font-serif italic text-[14px] text-[#FAF8F3]">
                {firstName ? firstName.charAt(0).toUpperCase() : "A"}
              </span>
            </div>
            <div>
              <p className="font-sans text-[9px] font-light tracking-[0.16em] uppercase text-[#AE8F7D]">
                Escolha um tom para sua presença
              </p>
              <p className="font-sans font-light text-[8px] text-[#454545]/35 mt-0.5">
                Aparece no seu perfil e nos seus ecos
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color.id}
                data-testid={`signup-color-${color.id}`}
                onClick={() => setAvatarColor(color.value)}
                className="relative w-8 h-8 rounded-full transition-all hover:scale-110 active:scale-95"
                style={{
                  backgroundColor: color.value,
                  boxShadow:
                    avatarColor === color.value
                      ? `0 0 0 2px #FAF8F3, 0 0 0 3.5px ${color.value}`
                      : "none",
                }}
                title={color.label}
              >
                {avatarColor === color.value && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-[#FAF8F3]" />
                  </span>
                )}
              </button>
            ))}
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

        {externalError && (
          <p className="font-sans text-[11px] text-red-400 text-center">{externalError}</p>
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
              Criar conta
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
