import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { LogoMark } from "@/components/LogoMark";
import { useAuth } from "@/context/AuthContext";

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

export function LoginScreen({ onLogin, onBack }: Props) {
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const valid = identifier.trim().length >= 3 && password.trim().length >= 6;

  const handleLogin = async () => {
    if (!valid || loading) return;
    setLoading(true);
    setError("");
    const { error } = await signIn(identifier.trim(), password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
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
      <button onClick={onBack} className="text-[#4A4540]/60 mb-8 w-fit hover:opacity-70 transition-opacity">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center mb-10">
        <div className="w-10 h-12 mb-4">
          <LogoMark />
        </div>
        <h1 className="font-serif italic text-[28px] text-[#1E1C19] mb-1">Bem-vindo de volta</h1>
        <p className="font-sans font-light text-[11px] tracking-[0.12em] text-[#7A726A]">
          Continue sua leitura
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div>
          <label className="font-sans text-[11px] font-light tracking-[0.12em] uppercase text-[#4A4540] block mb-2">
            E-mail ou nome de usuário
          </label>
          <input
            data-testid="input-login-email"
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            value={identifier}
            onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
            placeholder="seu@email.com ou @usuario"
            className="w-full font-serif italic text-[16px] text-[#1E1C19] placeholder:text-[#9C948C] bg-transparent border-b border-[#4A4540]/20 pb-2.5 outline-none focus:border-[#697962]/70 transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>
        <div>
          <label className="font-sans text-[11px] font-light tracking-[0.12em] uppercase text-[#4A4540] block mb-2">
            Senha
          </label>
          <input
            data-testid="input-login-password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            placeholder="Sua senha"
            className="w-full font-serif italic text-[16px] text-[#1E1C19] placeholder:text-[#9C948C] bg-transparent border-b border-[#4A4540]/20 pb-2.5 outline-none focus:border-[#697962]/70 transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>
      </div>

      {error && (
        <p className="font-sans text-[13px] text-red-600 mb-4 text-center leading-snug px-2">
          {error}
        </p>
      )}

      <button
        data-testid="button-login"
        onClick={handleLogin}
        disabled={!valid || loading}
        className="w-full flex items-center justify-center gap-2 text-[#FAF8F3] font-sans font-light text-[13px] tracking-[0.16em] uppercase disabled:opacity-30 active:scale-[0.99] transition-all mb-4"
        style={{
          backgroundColor: "#1E1C19",
          borderRadius: "8px",
          padding: "16px",
        }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
      </button>
    </div>
  );
}
