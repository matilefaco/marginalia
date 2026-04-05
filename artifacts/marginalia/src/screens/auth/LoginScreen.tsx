import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/LogoMark";

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

export function LoginScreen({ onLogin, onBack }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const valid = email.trim() && password.trim().length >= 6;

  const handleLogin = () => {
    if (!valid) return;
    // Mock: accept any credentials and go to home
    onLogin();
  };

  return (
    <div
      className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col px-6 pt-10 pb-8"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    >
      <button onClick={onBack} className="text-[#454545]/40 mb-8 w-fit">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center mb-10">
        <div className="w-10 h-12 mb-4">
          <LogoMark />
        </div>
        <h1 className="font-serif italic text-[28px] text-[#454545] mb-1">Bem-vindo de volta</h1>
        <p className="font-sans font-light text-[11px] tracking-[0.1em] text-[#454545]/40">
          Continue sua leitura
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div>
          <label className="font-sans text-[9px] font-light tracking-[0.18em] uppercase text-[#AE8F7D] block mb-2">
            E-mail
          </label>
          <input
            data-testid="input-login-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="seu@email.com"
            className="w-full font-serif italic text-[16px] text-[#454545] placeholder:text-[#454545]/25 bg-transparent border-b border-[#454545]/15 pb-2.5 outline-none focus:border-[#AE8F7D]/60 transition-colors"
          />
        </div>
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <label className="font-sans text-[9px] font-light tracking-[0.18em] uppercase text-[#AE8F7D]">
              Senha
            </label>
            <button className="font-sans text-[9px] font-light text-[#454545]/30 hover:text-[#AE8F7D] transition-colors">
              Esqueci a senha
            </button>
          </div>
          <input
            data-testid="input-login-password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="Sua senha"
            className="w-full font-serif italic text-[16px] text-[#454545] placeholder:text-[#454545]/25 bg-transparent border-b border-[#454545]/15 pb-2.5 outline-none focus:border-[#AE8F7D]/60 transition-colors"
          />
        </div>
      </div>

      {error && (
        <p className="font-sans text-[11px] text-[#AE8F7D] mb-4 text-center">{error}</p>
      )}

      <button
        data-testid="button-login"
        onClick={handleLogin}
        disabled={!valid}
        className="w-full bg-[#454545] text-[#FAF8F3] font-sans font-light text-[12px] tracking-[0.16em] uppercase py-4 rounded-[10px] disabled:opacity-30 hover:bg-[#454545]/90 active:scale-[0.99] transition-all mb-4"
      >
        Entrar
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#454545]/8" />
        <span className="font-sans font-light text-[9px] tracking-[0.08em] text-[#454545]/25">ou</span>
        <div className="flex-1 h-px bg-[#454545]/8" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {["Google", "Apple"].map((p) => (
          <button
            key={p}
            onClick={onLogin}
            className="font-sans font-light text-[11px] text-[#454545]/50 border border-[#454545]/10 py-3.5 rounded-[10px] hover:border-[#AE8F7D]/30 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
