import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface Props {
  onComplete: (data: { name: string; username: string; city: string; email: string }) => void;
  onBack: () => void;
}

export function SignUpScreen({ onComplete, onBack }: Props) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const valid = name.trim() && email.trim() && password.trim().length >= 6;

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col px-6 pt-10 pb-8"
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
        <h2 className="font-serif italic text-[28px] text-[#454545] leading-tight mb-2">
          Criar conta
        </h2>
        <p className="font-sans font-light text-[11px] tracking-[0.06em] text-[#454545]/50">
          Seu espaço pessoal de leitura começa aqui.
        </p>
      </div>

      <div className="flex-1 space-y-4">
        {[
          { label: "Nome do leitor", value: name, set: setName, placeholder: "Como você quer ser chamado?", testid: "input-name" },
          { label: "@username", value: username, set: setUsername, placeholder: "@seunome", testid: "input-username" },
          { label: "Cidade", value: city, set: setCity, placeholder: "Onde você lê?", testid: "input-city" },
          { label: "E-mail", value: email, set: setEmail, placeholder: "seu@email.com", testid: "input-email", type: "email" },
          { label: "Senha", value: password, set: setPassword, placeholder: "Mínimo 6 caracteres", testid: "input-password", type: "password" },
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
              className="w-full font-serif italic text-[15px] text-[#454545] placeholder:text-[#454545]/25 bg-transparent border-b border-[#454545]/12 pb-2 outline-none focus:border-[#AE8F7D]/60 transition-colors"
            />
          </div>
        ))}

        <div className="pt-2 space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#454545]/8" />
            <span className="font-sans font-light text-[9px] tracking-[0.08em] text-[#454545]/30">ou continue com</span>
            <div className="flex-1 h-px bg-[#454545]/8" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Google", "Apple"].map((provider) => (
              <button
                key={provider}
                className="font-sans font-light text-[11px] text-[#454545]/50 border border-[#454545]/10 py-3 rounded-[8px] hover:border-[#AE8F7D]/30 transition-colors"
              >
                {provider}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          data-testid="button-create-account"
          onClick={() => valid && onComplete({ name, username, city, email })}
          disabled={!valid}
          className="w-full flex items-center justify-center gap-2 bg-[#454545] text-[#FAF8F3] font-sans font-light text-[12px] tracking-[0.14em] uppercase py-4 rounded-[10px] disabled:opacity-30 hover:bg-[#454545]/90 transition-colors"
        >
          Criar conta
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
