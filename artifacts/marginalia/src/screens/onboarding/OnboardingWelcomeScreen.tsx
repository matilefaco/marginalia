import { LogoMark } from "@/components/LogoMark";

interface Props {
  onStart: () => void;
  onLogin: () => void;
}

export function OnboardingWelcomeScreen({ onStart, onLogin }: Props) {
  return (
    <div
      className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col items-center justify-between px-8 py-14"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs">
        {/* Logo */}
        <div
          className="w-20 h-24 mb-8"
          style={{ animation: "fadeIn 600ms ease both" }}
        >
          <LogoMark className="w-full h-full" />
        </div>

        {/* Name */}
        <h1
          className="font-serif italic leading-tight mb-3"
          style={{
            fontSize: "52px",
            color: "#1E1C19",
            animation: "fadeSlideUp 800ms ease 200ms both",
          }}
        >
          Marginalia
        </h1>

        {/* Tagline */}
        <p
          className="font-sans font-light uppercase mb-10"
          style={{
            fontSize: "11px",
            letterSpacing: "0.22em",
            color: "#7A726A",
            animation: "fadeIn 600ms ease 500ms both",
          }}
        >
          Leia junto. Sinta junto.
        </p>

        {/* Manifesto */}
        <div
          style={{
            borderLeft: "2px solid #697962",
            paddingLeft: "16px",
            animation: "fadeIn 600ms ease 700ms both",
          }}
        >
          <p
            className="font-serif italic text-left"
            style={{
              fontSize: "18px",
              color: "#1E1C19",
              lineHeight: 1.8,
            }}
          >
            Livros mudam a gente por dentro.<br />
            Marginalia é onde essa mudança<br />
            encontra outras pessoas.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div
        className="w-full max-w-xs space-y-3"
        style={{ animation: "fadeIn 600ms ease 900ms both" }}
      >
        <button
          data-testid="button-start-onboarding"
          onClick={onStart}
          className="w-full text-[#FAF8F3] font-sans font-light uppercase tracking-[0.14em] active:scale-[0.99] transition-all"
          style={{
            fontSize: "13px",
            backgroundColor: "#1E1C19",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          Começar
        </button>
        <button
          data-testid="button-already-have-account"
          onClick={onLogin}
          className="w-full font-sans font-light py-3 hover:opacity-70 transition-opacity"
          style={{ fontSize: "14px", color: "#7A726A" }}
        >
          Já tenho conta
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
