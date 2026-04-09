import { useState } from "react";
import { ArrowLeft, ArrowRight, Globe, Shield, LogOut, Bell, Lock, Info, Loader2, Moon, Sun } from "lucide-react";
import { Link } from "wouter";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { SPOILER_PREFERENCES, GENRES, type SpoilerPreference } from "@/data/constants";

const RHYTHM_ICONS = [Shield, Globe];

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase" style={{ color: "#AE8F7D" }}>
        {title}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: "rgba(174,143,125,0.22)" }} />
    </div>
  );
}

export function SettingsScreen() {
  const { currentUser, userPrefs, updateSpoilerPreference, updatePreferredGenres, isDark, toggleTheme } = useApp();
  const { signOut } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    setLogoutError("");
    try {
      await signOut();
    } catch {
      setLogoutError("Não foi possível sair da conta agora. Tente novamente.");
    } finally {
      setLogoutLoading(false);
    }
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

  const dividerStyle = { borderBottom: "1px solid rgba(174,143,125,0.12)" };

  return (
    <div
      className="min-h-full overflow-x-hidden screen-enter"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 pt-8 pb-4"
        style={{ borderBottom: "1px solid rgba(174,143,125,0.10)" }}
      >
        <Link href="/profile">
          <button className="hover:opacity-70 transition-opacity" style={{ color: "var(--text-tertiary)" }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="font-serif italic text-[22px]" style={{ color: "var(--text-primary)" }}>
          Preferências
        </h1>
      </div>

      <div className="px-5 pb-8 space-y-8 pt-5">

        {/* ── Ritmo da leitura ── */}
        <section data-testid="section-spoiler-settings">
          <SectionHeader title="Ritmo da leitura" />
          <p className="font-serif italic text-[12px] mb-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
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
                  className="w-full flex items-start gap-3 p-4 rounded-[12px] text-left transition-all active:scale-[0.99]"
                  style={{
                    border: isSelected
                      ? "1px solid rgba(174,143,125,0.45)"
                      : "1px solid rgba(174,143,125,0.18)",
                    backgroundColor: isSelected
                      ? "color-mix(in srgb, var(--background) 80%, #AE8F7D 20%)"
                      : "color-mix(in srgb, var(--background) 94%, var(--muted) 6%)",
                  }}
                >
                  <Icon
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: isSelected ? "#AE8F7D" : "var(--text-tertiary)" }}
                  />
                  <div className="flex-1">
                    <p
                      className="font-sans text-[13px] font-light mb-0.5"
                      style={{ color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}
                    >
                      {pref.label}
                    </p>
                    <p
                      className="font-sans font-light text-[11px] leading-relaxed"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {pref.description}
                    </p>
                  </div>
                  {isSelected ? (
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: "#AE8F7D" }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
                      style={{ border: "1px solid rgba(174,143,125,0.30)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {userPrefs.spoilerPreference === "all" && (
            <div
              className="mt-2 flex items-start gap-2 rounded-[10px] px-3 py-2.5"
              style={{
                backgroundColor: "color-mix(in srgb, var(--muted) 70%, #AE8F7D 30%)",
                border: "1px solid rgba(174,143,125,0.25)",
              }}
            >
              <Globe className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "#AE8F7D" }} />
              <p className="font-sans font-light text-[10px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Você pode ver spoilers neste modo. Conteúdos de qualquer ponto do livro serão exibidos.
              </p>
            </div>
          )}
        </section>

        {/* ── Gêneros de interesse ── */}
        <section data-testid="section-genres-settings">
          <SectionHeader title="Gêneros de interesse" />
          {userPrefs.preferredGenres.length > 0 && (
            <p className="font-sans font-light text-[10px] mb-2" style={{ color: "#AE8F7D" }}>
              {userPrefs.preferredGenres.length} selecionado{userPrefs.preferredGenres.length !== 1 ? "s" : ""}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {GENRES.map((g) => {
              const isSelected = userPrefs.preferredGenres.includes(g);
              return (
                <button
                  key={g}
                  data-testid={`settings-genre-${g}`}
                  onClick={() => toggleGenre(g)}
                  className="font-sans text-[10.5px] font-light px-3 py-1.5 rounded-full transition-all duration-[180ms] active:scale-95"
                  style={
                    isSelected
                      ? {
                          backgroundColor: "var(--text-primary)",
                          color: "var(--background)",
                          border: "1px solid transparent",
                          transform: "scale(1.03)",
                        }
                      : {
                          backgroundColor: "transparent",
                          color: "var(--text-secondary)",
                          border: "1px solid rgba(174,143,125,0.28)",
                        }
                  }
                >
                  {g}
                </button>
              );
            })}
          </div>
          <p
            className="font-sans font-light text-[10px] mt-3 leading-relaxed"
            style={{ color: "var(--text-tertiary)" }}
          >
            Salvo automaticamente. Personaliza o seu feed e descobertas.
          </p>
        </section>

        {/* ── Aparência ── */}
        <section>
          <SectionHeader title="Aparência" />
          <button
            data-testid="button-toggle-dark-mode"
            onClick={toggleTheme}
            className="w-full flex items-center justify-between py-3.5 hover:opacity-75 transition-opacity"
            style={dividerStyle}
          >
            <div className="flex items-center gap-2.5">
              {isDark
                ? <Moon className="w-4 h-4" style={{ color: "#AE8F7D" }} />
                : <Sun className="w-4 h-4" style={{ color: "#AE8F7D" }} />}
              <span
                className="font-sans font-light text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                {isDark ? "Modo escuro ativo" : "Modo claro ativo"}
              </span>
            </div>
            <div
              className="w-10 h-5 rounded-full transition-all duration-300 flex items-center px-0.5"
              style={{ backgroundColor: isDark ? "#697962" : "rgba(69,69,69,0.20)" }}
            >
              <div
                className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300"
                style={{ transform: isDark ? "translateX(20px)" : "translateX(0)" }}
              />
            </div>
          </button>
        </section>

        {/* ── Conta ── */}
        <section>
          <SectionHeader title="Conta" />
          <div className="space-y-0">
            {accountLinks.map(({ label, icon: Icon, href }) => (
              <Link key={label} href={href}>
                <button
                  className="w-full flex items-center justify-between py-3.5 hover:opacity-70 transition-opacity"
                  style={dividerStyle}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" style={{ color: "#AE8F7D", opacity: 0.7 }} />
                    <span
                      className="font-sans font-light text-[13px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {label}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--text-soft)" }} />
                </button>
              </Link>
            ))}
          </div>

          {logoutError && (
            <p className="mt-4 text-center font-sans font-light text-[11px] text-red-400">
              {logoutError}
            </p>
          )}

          <button
            data-testid="button-logout"
            onClick={handleLogout}
            disabled={logoutLoading}
            className="mt-5 w-full flex items-center justify-center gap-2 font-sans font-light text-[12px] tracking-[0.1em] py-3.5 rounded-[10px] transition-colors disabled:opacity-50"
            style={{
              border: "1px solid rgba(200,80,80,0.30)",
              color: "rgba(200,80,80,0.80)",
            }}
          >
            {logoutLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saindo…
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Sair da conta
              </>
            )}
          </button>
        </section>
      </div>
    </div>
  );
}
