import { ArrowLeft, ArrowRight, Globe, Shield, LogOut, Bell, Lock, Info } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { SPOILER_PREFERENCES, GENRES, type SpoilerPreference } from "@/data/constants";

const RHYTHM_ICONS = [Shield, Globe];

export function SettingsScreen() {
  const { currentUser, userPrefs, updateSpoilerPreference, updatePreferredGenres } = useApp();
  const { signOut } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const toggleGenre = (genre: string) => {
    const current = userPrefs.preferredGenres;
    const next = current.includes(genre)
      ? current.filter((g) => g !== genre)
      : [...current, genre];
    updatePreferredGenres(next);
  };

  const accountLinks = [
    { label: "Notificações", icon: Bell, href: "/settings/notifications" },
    { label: "Privacidade",  icon: Lock, href: "/settings/privacy" },
    { label: "Sobre o Marginalia", icon: Info, href: "/settings/about" },
  ];

  return (
    <div className="min-h-full bg-[#FAF8F3] overflow-x-hidden screen-enter">
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <Link href="/profile">
          <button className="text-[#454545]/40">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="font-serif italic text-[22px] text-[#454545]">Preferências</h1>
      </div>

      <div className="px-5 pb-8 space-y-8">

        {/* Reading rhythm */}
        <section data-testid="section-spoiler-settings">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Ritmo da leitura
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <p className="font-serif italic text-[12px] text-[#454545]/50 mb-3">
            "O Marginalia respeita o seu ritmo de leitura."
          </p>
          <div className="space-y-2">
            {SPOILER_PREFERENCES.map((pref, i) => {
              const Icon = RHYTHM_ICONS[i];
              const isSelected = userPrefs.spoilerPreference === pref.id;
              return (
                <button
                  key={pref.id}
                  data-testid={`settings-spoiler-${pref.id}`}
                  onClick={() => updateSpoilerPreference(pref.id as SpoilerPreference)}
                  className={`w-full flex items-start gap-3 p-4 rounded-[12px] border text-left transition-all ${
                    isSelected
                      ? "border-[#AE8F7D]/40 bg-[#AE8F7D]/5"
                      : "border-[#454545]/8 hover:border-[#AE8F7D]/25"
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? "text-[#AE8F7D]" : "text-[#454545]/30"}`} />
                  <div className="flex-1">
                    <p className={`font-sans font-light text-[12px] mb-0.5 ${isSelected ? "text-[#454545]" : "text-[#454545]/60"}`}>
                      {pref.label}
                    </p>
                    <p className="font-sans font-light text-[10px] text-[#454545]/35 leading-relaxed">
                      {pref.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-[#AE8F7D] flex-shrink-0 flex items-center justify-center mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#FAF8F3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {userPrefs.spoilerPreference === "all" && (
            <div className="mt-2 flex items-start gap-2 bg-[#EBE6DB]/50 border border-[#BDAB9C]/30 rounded-[10px] px-3 py-2.5">
              <Globe className="w-3 h-3 text-[#BDAB9C] flex-shrink-0 mt-0.5" />
              <p className="font-sans font-light text-[9px] text-[#2A2A2A]/50 leading-relaxed">
                Você pode ver spoilers neste modo.
              </p>
            </div>
          )}
        </section>

        {/* Genres */}
        <section data-testid="section-genres-settings">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Gêneros de interesse
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          {userPrefs.preferredGenres.length > 0 && (
            <p className="font-sans font-light text-[10px] text-[#AE8F7D] mb-2">
              {userPrefs.preferredGenres.length} selecionado{userPrefs.preferredGenres.length !== 1 ? "s" : ""}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => {
              const isSelected = userPrefs.preferredGenres.includes(g);
              return (
                <button
                  key={g}
                  data-testid={`settings-genre-${g}`}
                  onClick={() => toggleGenre(g)}
                  className={`font-sans text-[10px] font-light px-3 py-1.5 rounded-full border transition-all duration-[180ms] ${
                    isSelected
                      ? "bg-[#454545] text-[#FAF8F3] border-transparent scale-[1.04]"
                      : "bg-transparent text-[#454545]/50 border-[#454545]/12 hover:border-[#AE8F7D]/30 scale-100"
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
          <p className="font-sans font-light text-[10px] text-[#454545]/30 mt-3 leading-relaxed">
            Salvo automaticamente. Personaliza o seu feed e descobertas.
          </p>
        </section>

        {/* Account */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Conta
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <div className="space-y-1">
            {accountLinks.map(({ label, icon: Icon, href }) => (
              <Link key={label} href={href}>
                <button className="w-full flex items-center justify-between py-3.5 border-b border-[#454545]/5 hover:opacity-70 transition-opacity">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#AE8F7D]/60" />
                    <span className="font-sans font-light text-[13px] text-[#454545]/65">{label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#454545]/20" />
                </button>
              </Link>
            ))}
          </div>
          <button
            data-testid="button-logout"
            onClick={handleLogout}
            className="mt-6 w-full flex items-center justify-center gap-2 border border-red-200 text-red-400 font-sans font-light text-[12px] tracking-[0.1em] py-3.5 rounded-[10px] hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </button>
        </section>
      </div>
    </div>
  );
}
