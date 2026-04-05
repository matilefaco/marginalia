import { Bell, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";
import { useApp } from "@/context/AppContext";
import { MarginCard } from "@/components/cards/MarginCard";
import { LogoMark } from "@/components/LogoMark";
import { filterMarginsForUser } from "@/utils/spoiler";
import { MOCK_BOOKS } from "@/data/mockData";
import { progressLabel } from "@/utils/formatting";

const SUBTITLES = [
  "Leia junto.",
  "Novos ecos dentro do seu progresso.",
  "Seu ritmo está protegido.",
  "Hoje há novas margens para você.",
];

export function HomeScreen() {
  const { currentUser, margins, notifications, progress } = useApp();

  const progressMap = Object.fromEntries(progress.map((p) => [p.bookId, p]));
  const currentReading = progress.find(
    (p) => p.userId === "user_me" && p.status === "reading"
  );
  const currentBook = currentReading ? MOCK_BOOKS.find((b) => b.id === currentReading.bookId) : null;

  const unread = notifications.filter((n) => !n.isRead).length;
  const subtitle = SUBTITLES[Math.floor(Date.now() / 86400000) % SUBTITLES.length];

  const visibleMargins = filterMarginsForUser(
    margins.filter((m) => m.userId !== "user_me"),
    currentUser.spoilerPreference,
    progressMap
  );

  const feedMargins = visibleMargins.slice(0, 6);
  const popularMargins = margins
    .filter((m) => Object.values(m.reactions).reduce((a, b) => a + b, 0) > 5)
    .slice(0, 3);

  const myLastMargin = margins.find((m) => m.userId === "user_me");
  const newEchos = currentReading
    ? margins.filter((m) => m.bookId === currentReading.bookId && m.userId !== "user_me").length
    : 0;

  return (
    <div className="min-h-full bg-[#FAF8F3]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-8 pb-4">
        <div className="flex items-center gap-2">
          <LogoMark className="w-7 h-8" />
          <div>
            <span className="font-serif italic text-[18px] text-[#454545] block leading-tight">
              Marginalia
            </span>
            <span className="font-sans font-light text-[9px] tracking-[0.1em] text-[#454545]/40">
              {subtitle}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/notifications">
            <button
              data-testid="button-notifications"
              className="relative text-[#454545]/35 hover:text-[#454545]/60 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#AE8F7D]" />
              )}
            </button>
          </Link>
          <button className="text-[#454545]/35 hover:text-[#454545]/60 transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-8 space-y-8">
        {/* Continue Reading */}
        {currentBook && currentReading && (
          <section data-testid="section-continue-reading">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Continue de onde você parou
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[14px] p-5 shadow-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-16 rounded-[6px] bg-[#EBE6DB] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif italic text-[17px] text-[#454545] leading-tight mb-0.5">
                    {currentBook.title}
                  </h2>
                  <p className="font-sans font-light text-[9px] tracking-[0.12em] uppercase text-[#454545]/40 mb-2">
                    {currentBook.author}
                  </p>
                  <div className="w-full h-[3px] bg-[#EBE6DB] rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-[#AE8F7D] rounded-full"
                      style={{ width: `${currentReading.currentPercent}%` }}
                    />
                  </div>
                  <span className="font-sans font-light text-[8px] text-[#454545]/30">
                    {progressLabel(currentReading)}
                  </span>
                </div>
              </div>

              {newEchos > 0 && (
                <div className="bg-[#697962]/8 rounded-[8px] px-4 py-2.5 mb-4 flex items-center justify-between">
                  <span className="font-sans font-light text-[10px] text-[#697962]">
                    {newEchos} ecos disponíveis dentro do seu progresso
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                <Link
                  href={`/book/${currentBook.id}`}
                  data-testid="button-ver-ecos"
                  className="flex-1 text-center bg-[#454545] text-[#FAF8F3] font-sans text-[10px] font-light tracking-[0.1em] uppercase py-3 rounded-[8px] hover:bg-[#454545]/90 transition-colors"
                >
                  Ver ecos liberados
                </Link>
                <Link
                  href="/nova-margem"
                  className="flex-1 text-center border border-[#454545]/12 text-[#454545]/55 font-sans text-[10px] font-light tracking-[0.1em] uppercase py-3 rounded-[8px] hover:border-[#AE8F7D]/30 transition-colors"
                >
                  Adicionar margem
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Today's Feed */}
        <section data-testid="section-today-feed">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Hoje para você
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <p className="font-sans font-light text-[8px] text-[#454545]/35 mb-3 tracking-[0.06em]">
            Baseado no que você lê — respeitando seu ritmo
          </p>
          {feedMargins.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-serif italic text-sm text-[#454545]/35">
                Adicione livros à sua biblioteca para ver ecos.
              </p>
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
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Em alta, sem estragar sua leitura
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
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
              <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Sua atividade
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <MarginCard margin={myLastMargin} showBook />
          </section>
        )}

        {/* Rituals */}
        <section data-testid="section-rituals" className="pb-4">
          <div className="bg-[#EBE6DB]/40 border border-[#AE8F7D]/10 rounded-[14px] p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-serif italic text-[11px] text-[#AE8F7D]">Rituais de leitura</span>
            </div>
            <p className="font-serif italic text-[14px] text-[#454545]/65 mb-4">
              Quer registrar uma frase antes de esquecê-la?
            </p>
            <Link
              href="/nova-margem"
              data-testid="button-nova-margem-ritual"
              className="inline-block font-sans text-[9px] font-light tracking-[0.12em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/30 px-4 py-2 rounded-full hover:bg-[#AE8F7D]/5 transition-colors"
            >
              Nova margem
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
