import { LogoMark } from "@/components/LogoMark";

interface Props {
  onStart: () => void;
  onLogin: () => void;
}

export function OnboardingWelcomeScreen({ onStart, onLogin }: Props) {
  return (
    <div className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col items-center justify-between px-8 py-12"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs">
        <div className="w-20 h-24 mb-8 animate-in fade-in zoom-in duration-700">
          <LogoMark className="w-full h-full" />
        </div>

        <h1 className="font-serif italic text-[42px] text-[#454545] leading-tight mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          Marginalia
        </h1>

        <p className="font-sans font-light text-[11px] tracking-[0.22em] uppercase text-[#AE8F7D] mb-8 animate-in fade-in duration-700 delay-200">
          Leia junto. Sinta junto.
        </p>

        <div
          className="animate-in fade-in duration-700 delay-300"
          style={{
            borderLeft: "2px solid rgba(174,143,125,0.4)",
            paddingLeft: "16px",
            marginBottom: "0",
          }}
        >
          <p className="font-serif italic text-[15px] text-[#454545]/60 leading-relaxed text-left">
            Um espaço para registrar trechos, compartilhar margens e descobrir como outras pessoas atravessam os mesmos livros.
          </p>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
        <button
          data-testid="button-start-onboarding"
          onClick={onStart}
          className="w-full bg-[#454545] text-[#FAF8F3] font-sans font-light text-[12px] tracking-[0.14em] uppercase py-4 rounded-[10px] hover:bg-[#454545]/90 active:scale-[0.99] transition-all"
        >
          Começar
        </button>
        <button
          data-testid="button-already-have-account"
          onClick={onLogin}
          className="w-full text-[#454545]/45 font-sans font-light text-[11px] tracking-[0.1em] py-3 hover:text-[#454545]/70 transition-colors"
        >
          Já tenho conta
        </button>
      </div>
    </div>
  );
}
