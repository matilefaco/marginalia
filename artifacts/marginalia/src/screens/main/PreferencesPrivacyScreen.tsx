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
    <div className="flex items-start justify-between py-3.5 border-b border-[#454545]/5 gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-sans font-light text-[13px] text-[#454545]/80 leading-snug">{label}</p>
        {description && (
          <p className="font-sans font-light text-[10px] text-[#454545]/35 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
          value ? "bg-[#697962]" : "bg-[#EBE6DB]"
        }`}
        aria-checked={value}
        role="switch"
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
          {title}
        </span>
        <div className="flex-1 h-px bg-[#AE8F7D]/20" />
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
    <div className="min-h-full bg-[#FAF8F3] overflow-x-hidden">
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <Link href="/settings">
          <button className="text-[#454545]/40">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="font-serif italic text-[22px] text-[#454545]">Privacidade</h1>
      </div>

      <div className="px-5 pb-8 space-y-6">
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
            description="Livros lidos, ecos criados, etc."
            value={p.showStats}
            onChange={set("showStats")}
          />
        </Section>

        <Section title="Atividade">
          <ToggleRow
            label="Permitir que outros vejam meus ecos"
            description="Seus ecos aparecem no feed público"
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

        <p className="font-sans font-light text-[10px] text-[#454545]/30 text-center leading-relaxed pt-2">
          Preferências salvas automaticamente.
        </p>
      </div>
    </div>
  );
}
