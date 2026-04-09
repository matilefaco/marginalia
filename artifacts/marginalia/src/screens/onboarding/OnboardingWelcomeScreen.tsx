import { LogoMark } from "@/components/LogoMark";

interface Props {
  onStart: () => void;
  onLogin: () => void;
}

export function OnboardingWelcomeScreen({ onStart, onLogin }: Props) {
  return (
    <div
      className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col px-8"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    >
      {/* Top: logo + wordmark */}
      <div
        className="flex items-center gap-3 pt-14"
        style={{ animation: "fadeIn 500ms ease both" }}
      >
        <div className="w-8 h-10">
          <LogoMark className="w-full h-full" />
        </div>
        <div>
          <span className="font-serif italic text-[22px] text-[#2C2A27] leading-none">
            Marginalia
          </span>
          <p
            className="font-sans font-light uppercase mt-0.5"
            style={{ fontSize: "8px", letterSpacing: "0.2em", color: "#9C948C" }}
          >
            Leia junto. Sinta junto.
          </p>
        </div>
      </div>

      {/* Hero text block */}
      <div
        className="flex-1 flex flex-col justify-center"
        style={{ paddingBottom: "8px" }}
      >
        {/* Headline */}
        <h1
          className="font-serif italic leading-[1.15] mb-5"
          style={{
            fontSize: "clamp(34px, 9vw, 42px)",
            color: "#1E1C19",
            maxWidth: "300px",
            animation: "fadeSlideUp 700ms ease 200ms both",
          }}
        >
          Você não leu esse livro sozinho.
        </h1>

        {/* Subheadline */}
        <p
          className="font-sans font-light leading-[1.65]"
          style={{
            fontSize: "15px",
            color: "#7A726A",
            maxWidth: "260px",
            animation: "fadeSlideUp 700ms ease 380ms both",
          }}
        >
          Veja o que outros sentiram exatamente onde você está.
        </p>
      </div>

      {/* Buttons */}
      <div
        className="pb-14 space-y-3"
        style={{ animation: "fadeIn 600ms ease 600ms both" }}
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
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
