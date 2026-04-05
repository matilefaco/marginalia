import { Bell, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";
import { useApp } from "@/context/AppContext";
import { MarginCard } from "@/components/cards/MarginCard";
import { LogoMark } from "@/components/LogoMark";
import { filterMarginsForUser } from "@/utils/spoiler";
import { canUserSeeMargin } from "@/utils/spoiler";
import { MOCK_BOOKS, MOCK_MARGINS } from "@/data/mockData";
import { progressLabel } from "@/utils/formatting";
import { Shield } from "lucide-react";

const SUBTITLES = [
  "Seu ritmo está protegido.",
  "Novos ecos disponíveis para você.",
  "Leia junto. Sinta junto.",
  "O que ficou com você hoje?",
  "Isso ficou com você por um motivo.",
];

// Simulated "momento do dia" — picks books with highest recent activity
function getMomentosDeHoje(margins: typeof MOCK_MARGINS) {
  const byBook = new Map<number, typeof MOCK_MARGINS>();
  margins.forEach((m) => {
    if (!byBook.has(m.bookId)) byBook.set(m.bookId, []);
    byBook.get(m.bookId)!.push(m);
  });
  return Array.from(byBook.entries())
    .map(([bookId, ms]) => {
      const book = MOCK_BOOKS.find((b) => b.id === bookId);
      const sorted = [...ms].sort(
        (a, b) =>
          Object.values(b.reactions).reduce((x, y) => x + y, 0) -
          Object.values(a.reactions).reduce((x, y) => x + y, 0)
      );
      return { bookId, book, topMargin: sorted[0], count: ms.length };
    })
    .filter((x) => x.book && x.topMargin)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

function MomentosSection() {
  const { currentUser, margins, progress } = useApp();

  const progressMap = Object.fromEntries(
    progress.filter((p) => p.userId === "user_me").map((p) => [p.bookId, p])
  );

  const momentos = getMomentosDeHoje(margins);

  if (momentos.length === 0) return null;

  return (
    <section data-testid="section-momento-hoje">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
          Momento do livro hoje
        </span>
        <div className="flex-1 h-px bg-[#AE8F7D]/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#697962] animate-pulse" />
      </div>
      <p className="font-sans font-light text-[9px] text-[#454545]/40 mb-3">
        Onde leitores estão parando agora
      </p>
      <div className="space-y-2">
        {momentos.map(({ bookId, book, topMargin, count }, idx) => {
          if (!book || !topMargin) return null;
          const prog = progressMap[bookId];
          const canSee = canUserSeeMargin(topMargin, currentUser.spoilerPreference, prog);
          const reactionTotal = Object.values(topMargin.reactions).reduce((a, b) => a + b, 0);

          return (
            <Link key={bookId} href={`/book/${bookId}`}>
              <div
                className={`rounded-[14px] border p-4 transition-colors hover:border-[#AE8F7D]/30 ${
                  idx === 0
                    ? "bg-[#EBE6DB]/40 border-[#AE8F7D]/20"
                    : "bg-[#FAF8F3] border-[#AE8F7D]/12"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <p className="font-sans text-[7px] font-light tracking-[0.2em] uppercase text-[#697962] mb-0.5">
                      {idx === 0 ? "✦ Mais ativo agora" : "Em alta"}
                    </p>
                    <p className="font-serif italic text-[15px] text-[#3D3D3D] leading-tight">{book.title}</p>
                    <p className="font-sans font-light text-[8px] tracking-[0.08em] uppercase text-[#454545]/35">{book.author}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-serif text-[22px] text-[#AE8F7D] leading-none">{count}</p>
                    <p className="font-sans font-light text-[7px] tracking-[0.08em] uppercase text-[#454545]/30">ecos</p>
                  </div>
                </div>

                {canSee ? (
                  <div className="border-l-2 border-[#AE8F7D]/40 pl-3 mb-2.5">
                    <p className="font-serif italic text-[12px] text-[#454545]/65 leading-relaxed line-clamp-2">
                      &ldquo;{topMargin.excerpt}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#EBE6DB]/60 rounded-[8px] px-3 py-2 mb-2.5 flex items-center gap-2">
                    <Shield className="w-3 h-3 text-[#AE8F7D]/50 flex-shrink-0" />
                    <p className="font-sans font-light text-[9px] text-[#454545]/45 italic">
                      Leitores estão reagindo intensamente neste ponto.
                    </p>
                  </div>
                )}

                <p className="font-sans font-light text-[8px] text-[#454545]/35">
                  {reactionTotal > 0 ? `${reactionTotal} reações · ` : ""}
                  {topMargin.commentsCount} ecos
                  {topMargin.percent !== undefined ? ` · em ${topMargin.percent}% do livro` : ""}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function FeedBreak({ index }: { index: number }) {
  const breaks = [
    {
      label: "Guarde antes que se perca",
      body: "Aquele trecho que ficou ecoando na sua cabeça merece existir no papel também.",
      cta: "Registrar margem",
      href: "/nova-margem",
    },
    {
      label: "Outros leitores pararam aqui também",
      body: "Os livros que mais importam são aqueles que interrompem a leitura para fazer você pensar.",
      cta: "Ver ecos da comunidade",
      href: "/explore",
    },
    {
      label: "Isso ficou com você por um motivo",
      body: "O Marginalia respeita o seu ritmo de leitura — e guarda tudo o que você sentiu.",
      cta: null,
      href: null,
    },
  ];
  const b = breaks[index % breaks.length];
  return (
    <div className="bg-[#EBE6DB]/35 border border-[#AE8F7D]/12 rounded-[14px] p-5">
      <p className="font-sans text-[7px] font-light tracking-[0.2em] uppercase text-[#AE8F7D] mb-2">{b.label}</p>
      <p className="font-serif italic text-[13px] text-[#454545]/60 leading-relaxed mb-3">{b.body}</p>
      {b.cta && b.href && (
        <Link href={b.href}>
          <button className="font-sans text-[9px] font-light tracking-[0.12em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/30 px-4 py-2 rounded-full hover:bg-[#AE8F7D]/8 transition-colors">
            {b.cta}
          </button>
        </Link>
      )}
    </div>
  );
}

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
  const subtitle = SUBTITLES[new Date().getHours() % SUBTITLES.length];

  const visibleMargins = filterMarginsForUser(
    margins.filter((m) => m.userId !== "user_me"),
    currentUser.spoilerPreference,
    progressMap
  );

  const feedMargins = visibleMargins.slice(0, 6);
  const newEchos = currentReading
    ? margins.filter((m) => m.bookId === currentReading.bookId && m.userId !== "user_me").length
    : 0;
  const isProtected = currentUser.spoilerPreference !== "all";

  // Build feed with editorial breathing every 3 cards
  const feedWithBreaks: Array<{ type: "card"; margin: (typeof feedMargins)[0] } | { type: "break"; index: number }> = [];
  feedMargins.forEach((m, i) => {
    feedWithBreaks.push({ type: "card", margin: m });
    if ((i + 1) % 3 === 0 && i < feedMargins.length - 1) {
      feedWithBreaks.push({ type: "break", index: Math.floor(i / 3) });
    }
  });

  return (
    <div className="min-h-full bg-[#FAF8F3]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <div className="flex items-center gap-2.5">
          <LogoMark className="w-7 h-8" />
          <div>
            <span className="font-serif italic text-[19px] text-[#3D3D3D] block leading-tight">Marginalia</span>
            <span className="font-sans font-light text-[9px] tracking-[0.12em] text-[#AE8F7D]">{subtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/notifications">
            <button data-testid="button-notifications" className="relative text-[#454545]/40 hover:text-[#454545]/70 transition-colors p-1">
              <Bell className="w-5 h-5" />
              {unread > 0 && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#AE8F7D]" />}
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
                <div className="w-14 h-20 rounded-[8px] bg-gradient-to-b from-[#EBE6DB] to-[#BDAB9C]/40 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-light text-[8px] tracking-[0.14em] uppercase text-[#AE8F7D] mb-1">Lendo agora</p>
                  <h2 className="font-serif italic text-[18px] text-[#3D3D3D] leading-tight mb-0.5">{currentBook.title}</h2>
                  <p className="font-sans font-light text-[9px] tracking-[0.1em] uppercase text-[#454545]/45 mb-3">{currentBook.author}</p>
                  <div className="w-full h-[3px] bg-[#EBE6DB] rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-[#AE8F7D] rounded-full transition-all duration-500"
                      style={{ width: `${currentReading.currentPercent}%` }}
                    />
                  </div>
                  <span className="font-sans font-light text-[9px] text-[#454545]/40">
                    {progressLabel(currentReading)}
                    {currentReading.currentPage > 0 && currentBook.totalPages > 0
                      ? ` · p. ${currentReading.currentPage} de ${currentBook.totalPages}`
                      : ""}
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
                <Link href={`/book/${currentBook.id}`} data-testid="button-ver-ecos" className="flex-1">
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

        {/* Momento do Livro Hoje */}
        <MomentosSection />

        {/* Today's Feed with editorial breaks */}
        <section data-testid="section-today-feed">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">Hoje para você</span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <p className="font-sans font-light text-[9px] text-[#454545]/40 mb-4">
            {isProtected ? "Com seu ritmo protegido" : "Feed personalizado"}
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
              {feedWithBreaks.map((item, i) => {
                if (item.type === "break") {
                  return <FeedBreak key={`break-${i}`} index={item.index} />;
                }
                return <MarginCard key={item.margin.id} margin={item.margin} showBook />;
              })}
            </div>
          )}
        </section>

        {/* Ritual CTA */}
        <section className="pb-4">
          <div className="bg-[#EBE6DB]/50 border border-[#AE8F7D]/12 rounded-[16px] p-5">
            <p className="font-sans text-[7px] font-light tracking-[0.2em] uppercase text-[#AE8F7D] mb-2">Rituais de leitura</p>
            <p className="font-serif italic text-[15px] text-[#3D3D3D] mb-1 leading-snug">
              Guarde antes que se perca.
            </p>
            <p className="font-sans font-light text-[10px] text-[#454545]/45 mb-4 leading-relaxed">
              Aquele trecho que ficou com você — merece existir como margem.
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
