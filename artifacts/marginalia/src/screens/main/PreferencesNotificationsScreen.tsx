import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useApp } from "@/context/AppContext";
import type { NotificationPrefs } from "@/context/AppContext";

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, description, value, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[#454545]/5 gap-4 w-full max-w-full">
      <div className="flex-1 min-w-0 pr-3">
        <p className="font-sans font-light text-[13px] text-[#454545]/80 leading-snug">{label}</p>
        {description && (
          <p className="font-sans font-light text-[10px] text-[#454545]/35 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-[220ms] ease-in-out ${
          value ? "bg-[#697962]" : "bg-[#EBE6DB]"
        }`}
        aria-checked={value}
        role="switch"
        style={{ minWidth: "2.75rem" }}
      >
        <span
          className={`absolute top-[4px] w-[16px] h-[16px] rounded-full bg-white shadow-sm transition-all duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            value ? "left-[24px]" : "left-[4px]"
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

export function PreferencesNotificationsScreen() {
  const { userPrefs, updateNotificationPref } = useApp();
  const n = userPrefs.notifications;

  const set = (key: keyof NotificationPrefs) => (v: boolean) =>
    updateNotificationPref(key, v);

  return (
    <div className="min-h-full bg-[#FAF8F3] overflow-x-hidden screen-enter">
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <Link href="/settings">
          <button className="text-[#454545]/40">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="font-serif italic text-[22px] text-[#454545]">Notificações</h1>
      </div>

      <div className="px-5 pb-8 space-y-6">
        <Section title="Atividade social">
          <ToggleRow
            label="Reações nos meus posts"
            description="Quando alguém reagir a um post seu"
            value={n.reactions}
            onChange={set("reactions")}
          />
          <ToggleRow
            label="Comentários nos meus posts"
            description="Quando alguém comentar em um post seu"
            value={n.comments}
            onChange={set("comments")}
          />
          <ToggleRow
            label="Respostas aos meus comentários"
            description="Quando alguém responder à sua mensagem"
            value={n.replies}
            onChange={set("replies")}
          />
          <ToggleRow
            label="Quando salvarem meu post"
            description="Quando alguém guardar um post seu"
            value={n.saves}
            onChange={set("saves")}
          />
        </Section>

        <Section title="Descoberta">
          <ToggleRow
            label="Livros em alta"
            description="Tendências da comunidade Marginalia"
            value={n.trendingBooks}
            onChange={set("trendingBooks")}
          />
          <ToggleRow
            label="Recomendações do app"
            description="Sugestões baseadas nos seus gêneros de interesse"
            value={n.recommendations}
            onChange={set("recommendations")}
          />
          <ToggleRow
            label="Novidades do Marginalia"
            description="Atualizações, funcionalidades e conteúdo editorial"
            value={n.updates}
            onChange={set("updates")}
          />
        </Section>

        <Section title="Canais">
          <ToggleRow
            label="Notificações dentro do app"
            value={n.inApp}
            onChange={set("inApp")}
          />
          <ToggleRow
            label="Notificações por e-mail"
            description="Apenas o essencial, sem spam"
            value={n.email}
            onChange={set("email")}
          />
        </Section>

        <p className="font-sans font-light text-[10px] text-[#454545]/30 text-center leading-relaxed pt-2">
          Preferências salvas automaticamente.
        </p>
      </div>
    </div>
  );
}
