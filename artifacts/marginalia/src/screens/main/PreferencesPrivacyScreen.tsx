import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useApp } from "@/context/AppContext";
import type { PrivacyPrefs } from "@/context/AppContext";

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, description, value, onChange }: ToggleRowProps) {
  return (
    <div
      className="flex items-center justify-between py-3.5 gap-4 w-full max-w-full"
      style={{ borderBottom: "1px solid rgba(174,143,125,0.10)" }}
    >
      <div className="flex-1 min-w-0 pr-3">
        <p className="font-sans font-light text-[13px] leading-snug" style={{ color: "var(--text-secondary)" }}>
          {label}
        </p>
        {description && (
          <p className="font-sans font-light text-[10px] mt-0.5 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-[220ms] ease-in-out"
        aria-checked={value}
        role="switch"
        style={{
          minWidth: "2.75rem",
          backgroundColor: value ? "#697962" : "rgba(174,143,125,0.18)",
        }}
      >
        <span
          className="absolute top-[4px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-all duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ left: value ? "24px" : "4px" }}
        />
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase" style={{ color: "#AE8F7D" }}>
          {title}
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(174,143,125,0.22)" }} />
      </div>
      {children}
    </section>
  );
}

export function PreferencesPrivacyScreen() {
  const { userPrefs, updatePrivacyPref } = useApp();
  const p = userPrefs.privacy;

  const set = (key: keyof PrivacyPrefs) => (v: boolean) =>
    updatePrivacyPref(key, v);

  return (
    <div
      className="min-h-full overflow-x-hidden screen-enter"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className="flex items-center gap-3 px-5 pt-8 pb-4"
        style={{ borderBottom: "1px solid rgba(174,143,125,0.10)" }}
      >
        <Link href="/settings">
          <button className="hover:opacity-70 transition-opacity" style={{ color: "var(--text-tertiary)" }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="font-serif italic text-[22px]" style={{ color: "var(--text-primary)" }}>
          Privacidade
        </h1>
      </div>

      <div className="px-5 pb-8 pt-5 space-y-6">
        <Section title="Perfil">
          <ToggleRow
            label="Perfil público"
            description="Outros leitores podem ver o seu perfil"
            value={p.profilePublic}
            onChange={set("profilePublic")}
          />
          <ToggleRow
            label="Mostrar cidade"
            description="Exibir a cidade no seu perfil público"
            value={p.showCity}
            onChange={set("showCity")}
          />
          <ToggleRow
            label="Mostrar Instagram"
            value={p.showInstagram}
            onChange={set("showInstagram")}
          />
          <ToggleRow
            label="Mostrar TikTok"
            value={p.showTikTok}
            onChange={set("showTikTok")}
          />
          <ToggleRow
            label="Mostrar gêneros de interesse"
            description="Visível para outros leitores no seu perfil"
            value={p.showGenres}
            onChange={set("showGenres")}
          />
          <ToggleRow
            label="Mostrar estatísticas de leitura"
            description="Livros lidos, posts criados, etc."
            value={p.showStats}
            onChange={set("showStats")}
          />
        </Section>

        <Section title="Atividade">
          <ToggleRow
            label="Permitir que outros vejam meus posts"
            description="Seus posts aparecem no feed público"
            value={p.showEcos}
            onChange={set("showEcos")}
          />
          <ToggleRow
            label="Permitir que outros vejam o que estou lendo"
            description="Livros em progresso visíveis no seu perfil"
            value={p.showCurrentBooks}
            onChange={set("showCurrentBooks")}
          />
        </Section>

        <Section title="Recomendações">
          <ToggleRow
            label="Recomendações baseadas na minha atividade"
            description="O app usa seus hábitos para sugerir leituras"
            value={p.allowRecommendations}
            onChange={set("allowRecommendations")}
          />
        </Section>

        <p
          className="font-sans font-light text-[10px] text-center leading-relaxed pt-2"
          style={{ color: "var(--text-tertiary)" }}
        >
          Preferências salvas automaticamente.
        </p>
      </div>
    </div>
  );
}
