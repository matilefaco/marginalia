import { Bell, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";
import { useApp } from "@/context/AppContext";
import { MarginCard } from "@/components/cards/MarginCard";
import { LogoMark } from "@/components/LogoMark";
import { filterMarginsForUser } from "@/utils/spoiler";
import { MOCK_BOOKS } from "@/data/mockData";
import { progressLabel } from "@/utils/formatting";
import { Shield } from "lucide-react";

const SUBTITLES = [
  "Seu ritmo está protegido.",
  "Novos ecos disponíveis para você.",
  "Leia junto. Sinta junto.",
  "O que ficou com você hoje?",
];

export function HomeScreen() {
  const { currentUser, margins, notifications, progress } = useApp();

  const progressMap = Object.fromEntries(
    progress.filter((p) => p.userId === "user_me").map((p) => [p.bookId, p])
  );

  const currentReading = progress.find(
    (p) => p.userId === "user_me" && p.status === "reading"
  );
  const currentBook = currentReading
    ? MOCK_BOOKS.find((b) => b.id === currentReading.bookId)
    : null;

  const unread = notifications.filter((n) => !n.isRead).length;
  const subtitle = SUBTITLES[Math.floor(new Date().getDate() / 7) % SUBTITLES.length];

  const visibleMargins = filterMarginsForUser(
    margins.filter((m) => m.userId !== "user_me"),
    currentUser.spoilerPreference,
    progressMap
  );

  const feedMargins = visibleMargins.slice(0, 5);
  const popularMargins = margins
    .filter((m) => {
      const total = Object.values(m.reactions).reduce((a, b) => a + b, 0);
      return total > 5;
    })
    .slice(0, 3);
  const myLastMargin = margins.find((m) => m.userId === "user_me");
  const newEchos = currentReading
    ? margins.filter((m) => m.bookId === currentReading.bookId && m.userId !== "user_me").length
    : 0;

  const isProtected = currentUser.spoilerPreference !== "all";

  return (
    <div className="min-h-full bg-[#FAF8F3]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-5">
        <div className="flex items-center gap-2.5">
          <LogoMark className="w-7 h-8" />
          <div>
            <span className="font-serif italic text-[19px] text-[#3D3D3D] block leading-tight">
              Marginalia
            </span>
            <span className="font-sans font-light text-[9px] tracking-[0.12em] text-[#AE8F7D]">
              {subtitle}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/notifications">
            <button
              data-testid="button-notifications"
              className="relative text-[#454545]/40 hover:text-[#454545]/70 transition-colors p-1"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#AE8F7D]" />
              )}
            </button>
          </Link>
          <button className="text-[#454545]/30 hover:text-[#454545]/60 transition-colors p-1">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Anti-spoiler badge */}
      {isProtected && (
        <div className="mx-5 mb-4 flex items-center gap-2 bg-[#697962]/8 border border-[#697962]/15 rounded-[8px] px-3 py-2">
          <Shield className="w-3 h-3 text-[#697962] flex-shrink-0" />
          <p className="font-sans font-light text-[9px] text-[#697962]">
            O Marginalia respeita o seu ritmo de leitura.
          </p>
        </div>
      )}

      <div className="px-5 pb-8 space-y-8">
        {/* Continue Reading */}
        {currentBook && currentReading && (
          <section data-testid="section-continue-reading">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Continue de onde você parou
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <div className="bg-[#FAF8F3] border border-[#AE8F7D]/20 rounded-[16px] p-5 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-20 rounded-[8px] bg-[#EBE6DB] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-light text-[8px] tracking-[0.14em] uppercase text-[#AE8F7D] mb-1">
                    Lendo agora
                  </p>
                  <h2 className="font-serif italic text-[18px] text-[#3D3D3D] leading-tight mb-0.5">
                    {currentBook.title}
                  </h2>
                  <p className="font-sans font-light text-[9px] tracking-[0.1em] uppercase text-[#454545]/45 mb-3">
                    {currentBook.author}
                  </p>
                  <div className="w-full h-[3px] bg-[#EBE6DB] rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-[#AE8F7D] rounded-full transition-all duration-500"
                      style={{ width: `${currentReading.currentPercent}%` }}
                    />
                  </div>
                  <span className="font-sans font-light text-[9px] text-[#454545]/40">
                    {progressLabel(currentReading)}
                  </span>
                </div>
              </div>

              {newEchos > 0 && (
                <div className="bg-[#697962]/10 border border-[#697962]/15 rounded-[10px] px-4 py-2.5 mb-4">
                  <p className="font-sans font-light text-[10px] text-[#697962] font-medium">
                    {newEchos} ecos liberados dentro do seu progresso
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Link
                  href={`/book/${currentBook.id}`}
                  data-testid="button-ver-ecos"
                  className="flex-1"
                >
                  <button className="w-full bg-[#454545] text-[#FAF8F3] font-sans text-[10px] font-light tracking-[0.12em] uppercase py-3.5 rounded-[10px] hover:bg-[#454545]/90 transition-colors">
                    Ver ecos liberados
                  </button>
                </Link>
                <Link href="/nova-margem" className="flex-1">
                  <button className="w-full border border-[#454545]/15 text-[#454545]/60 font-sans text-[10px] font-light tracking-[0.12em] uppercase py-3.5 rounded-[10px] hover:border-[#AE8F7D]/40 hover:text-[#454545]/80 transition-colors">
                    Adicionar margem
                  </button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Today's Feed */}
        <section data-testid="section-today-feed">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Hoje para você
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <p className="font-sans font-light text-[9px] text-[#454545]/40 mb-4 leading-snug">
            Baseado nos seus livros e gêneros — {currentUser.spoilerPreference !== "all" ? "com spoilers filtrados" : "sem filtros ativos"}
          </p>
          {feedMargins.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-[#AE8F7D]/20 rounded-[14px]">
              <p className="font-serif italic text-[14px] text-[#454545]/35 mb-3">
                Adicione livros à biblioteca para ver ecos compatíveis.
              </p>
              <Link href="/explore">
                <button className="font-sans text-[9px] font-light tracking-[0.12em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/30 px-4 py-2 rounded-full hover:bg-[#AE8F7D]/5 transition-colors">
                  Explorar livros
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {feedMargins.map((m) => (
                <MarginCard key={m.id} margin={m} showBook />
              ))}
            </div>
          )}
        </section>

        {/* Em Alta */}
        <section data-testid="section-em-alta">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Em alta, sem estragar sua leitura
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <p className="font-sans font-light text-[9px] text-[#454545]/40 mb-4">
            Conteúdos populares — respeitando suas preferências
          </p>
          <div className="space-y-3">
            {popularMargins.map((m) => (
              <MarginCard key={m.id} margin={m} showBook />
            ))}
          </div>
        </section>

        {/* My Activity */}
        {myLastMargin && (
          <section data-testid="section-my-activity">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Sua atividade recente
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <MarginCard margin={myLastMargin} showBook />
          </section>
        )}

        {/* Rituals */}
        <section data-testid="section-rituals" className="pb-4">
          <div className="bg-[#EBE6DB]/50 border border-[#AE8F7D]/12 rounded-[16px] p-5">
            <p className="font-sans text-[7px] font-light tracking-[0.2em] uppercase text-[#AE8F7D] mb-2">
              Rituais de leitura
            </p>
            <p className="font-serif italic text-[15px] text-[#3D3D3D] mb-1 leading-snug">
              O que esse trecho abriu em você?
            </p>
            <p className="font-sans font-light text-[10px] text-[#454545]/45 mb-4 leading-relaxed">
              Quer registrar uma frase antes de esquecê-la?
            </p>
            <Link href="/nova-margem" data-testid="button-nova-margem-ritual">
              <button className="font-sans text-[9px] font-light tracking-[0.14em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/35 px-5 py-2.5 rounded-full hover:bg-[#AE8F7D]/8 transition-colors">
                Guardar como margem
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
