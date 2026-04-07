import { Bell, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";
import { useApp } from "@/context/AppContext";
import { MarginCard } from "@/components/cards/MarginCard";
import { LogoMark } from "@/components/LogoMark";
import { BookCover } from "@/components/BookCover";
import { filterMarginsForUser } from "@/utils/spoiler";
import { canUserSeeMargin } from "@/utils/spoiler";
import { MOCK_BOOKS, type Margin } from "@/data/mockData";
import { progressLabel } from "@/utils/formatting";
import { Shield } from "lucide-react";
import { useCommunityFeed, formatCommunityMarginAge, totalReactions } from "@/hooks/useCommunity";

const SUBTITLES = [
  "Seu ritmo está protegido.",
  "Novos posts disponíveis para você.",
  "Leia junto. Sinta junto.",
  "O que ficou com você hoje?",
  "Isso ficou com você por um motivo.",
];

// Simulated "momento do dia" — picks books with highest recent activity
function getMomentosDeHoje(margins: Margin[]) {
  const byBook = new Map<number, Margin[]>();
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
    progress.filter((p) => p.userId === currentUser.id).map((p) => [p.bookId, p])
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
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#697962] opacity-35" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#697962]" />
        </span>
        <span className="font-sans text-[7px] font-light tracking-[0.14em] uppercase text-[#697962]/70">ao vivo</span>
      </div>
      <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40 mb-3">
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
                    <p className="font-sans font-light text-[8px] tracking-[0.08em] uppercase text-[#2A2A2A]/35">{book.author}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-serif text-[22px] text-[#AE8F7D] leading-none">{count}</p>
                    <p className="font-sans font-light text-[7px] tracking-[0.08em] uppercase text-[#2A2A2A]/30">ecos</p>
                  </div>
                </div>

                {canSee ? (
                  <div className="border-l-2 border-[#AE8F7D]/40 pl-3 mb-2.5">
                    <p className="font-serif italic text-[12px] text-[#2A2A2A]/65 leading-relaxed line-clamp-2">
                      &ldquo;{topMargin.excerpt}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#EBE6DB]/60 rounded-[8px] px-3 py-2 mb-2.5 flex items-center gap-2">
                    <Shield className="w-3 h-3 text-[#AE8F7D]/50 flex-shrink-0" />
                    <p className="font-sans font-light text-[9px] text-[#2A2A2A]/45 italic">
                      Leitores estão reagindo intensamente neste ponto.
                    </p>
                  </div>
                )}

                <p className="font-sans font-light text-[8px] text-[#2A2A2A]/35">
                  {reactionTotal > 0 ? `${reactionTotal} reações · ` : ""}
                  {topMargin.commentsCount} respostas
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
      label: "Trechos que estão fazendo leitores parar",
      body: "Algumas frases não pedem para ser entendidas. Pedem para ser sentidas. Os posts mais ativos desta semana estão aqui.",
      cta: "Ver posts",
      href: "/explore",
      accent: "text-[#AE8F7D]",
    },
    {
      label: "Pouca gente percebeu isso",
      body: "Os posts mais raros são os que revelam o que passa despercebido. Leia junto, sinta diferente.",
      cta: "Registrar o que você viu",
      href: "/nova-margem",
      accent: "text-[#697962]",
    },
    {
      label: "Guarde antes que se perca",
      body: "Aquele trecho que ficou ecoando na sua cabeça merece existir no papel também.",
      cta: "Criar post",
      href: "/nova-margem",
      accent: "text-[#AE8F7D]",
    },
    {
      label: "Isso ficou com você por um motivo",
      body: "O Marginalia respeita o seu ritmo de leitura — e guarda tudo o que você sentiu no caminho.",
      cta: null,
      href: null,
      accent: "text-[#BDAB9C]",
    },
    {
      label: "Leitores deste livro também marcaram",
      body: "Ver como outros percebem o mesmo texto é como ter várias janelas para o mesmo mundo.",
      cta: "Ver livros em destaque",
      href: "/explore",
      accent: "text-[#697962]",
    },
  ];
  const b = breaks[index % breaks.length];
  return (
    <div className="bg-[#EBE6DB]/35 border border-[#AE8F7D]/12 rounded-[14px] p-5">
      <p className={`font-sans text-[7px] font-light tracking-[0.2em] uppercase ${b.accent} mb-2`}>{b.label}</p>
      <p className="font-serif italic text-[13px] text-[#2A2A2A]/60 leading-relaxed mb-3">{b.body}</p>
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

function CommunityFeedSection() {
  const { margins, loading } = useCommunityFeed(1, 8);
  if (loading) return null;
  if (margins.length === 0) return null;

  return (
    <section data-testid="section-community-feed">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#697962]">Conversas da comunidade</span>
        <div className="flex-1 h-px bg-[#697962]/20" />
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#697962] opacity-35" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#697962]" />
        </span>
      </div>
      <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40 mb-4">O que leitores estão compartilhando agora</p>
      <div className="space-y-3">
        {margins.map((m) => {
          const rxTotal = totalReactions(m.reactions);
          return (
            <Link key={m.id} href={`/eco/${m.id}`}>
            <div className="bg-[#FAF8F3] border border-[#697962]/12 rounded-[14px] p-4 active:opacity-80 transition-opacity cursor-pointer">
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-medium text-white"
                  style={{ backgroundColor: m.userAvatarColor ?? "#697962" }}
                >
                  {m.userInitials?.[0] ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-light text-[10px] text-[#3D3D3D] truncate">{m.userName}</p>
                  <p className="font-sans font-light text-[8px] text-[#2A2A2A]/35">{formatCommunityMarginAge(m.createdAt)}</p>
                </div>
                {m.spoilerLevel !== "none" && (
                  <span className="font-sans font-light text-[7px] tracking-[0.1em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/25 px-1.5 py-0.5 rounded-full">
                    {m.spoilerLevel}
                  </span>
                )}
              </div>

              <div className="bg-[#EBE6DB]/50 rounded-[8px] px-3 py-2 mb-2.5">
                <p className="font-serif italic text-[13px] text-[#3D3D3D]/80 leading-relaxed line-clamp-3">
                  &ldquo;{m.excerpt}&rdquo;
                </p>
              </div>

              {m.commentary && (
                <p className="font-sans font-light text-[11px] text-[#2A2A2A]/60 leading-relaxed mb-2 line-clamp-2">{m.commentary}</p>
              )}

              <div className="flex items-center gap-3">
                <p className="font-sans font-light text-[8px] text-[#2A2A2A]/35 truncate flex-1">{m.bookTitle}</p>
                {rxTotal > 0 && (
                  <span className="font-sans font-light text-[8px] text-[#697962]">{rxTotal} reações</span>
                )}
                {m.commentsCount > 0 && (
                  <span className="font-sans font-light text-[8px] text-[#2A2A2A]/30">{m.commentsCount} ecos</span>
                )}
              </div>
            </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function WishlistSection() {
  const { currentUser, progress } = useApp();
  const wishlistProgress = progress.filter((p) => p.userId === currentUser.id && p.status === "wishlist");
  if (wishlistProgress.length === 0) return null;
  const wishlistBooks = wishlistProgress
    .map((p) => ({ prog: p, book: MOCK_BOOKS.find((b) => b.id === p.bookId) }))
    .filter((x) => x.book);

  return (
    <section data-testid="section-wishlist">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
          Da sua lista para ler
        </span>
        <div className="flex-1 h-px bg-[#AE8F7D]/20" />
      </div>
      <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40 mb-3">
        Quando chegar a hora, estará aqui
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
        {wishlistBooks.map(({ book }) =>
          book ? (
            <Link key={book.id} href={`/book/${book.id}`} className="flex-shrink-0">
              <div className="w-[110px] bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[12px] overflow-hidden hover:border-[#AE8F7D]/35 transition-colors">
                <div
                  className="h-[68px] w-full flex items-center justify-center relative"
                  style={{ backgroundColor: book.bookColor }}
                >
                  <span className="font-serif italic text-[32px] text-[#3D3D3D]/30 select-none">
                    {book.title.charAt(0)}
                  </span>
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)",
                      backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.07) 1px, transparent 1px)",
                      backgroundSize: "3px 3px",
                    }}
                  />
                </div>
                <div className="p-2.5">
                  <p className="font-serif italic text-[11px] text-[#3D3D3D] leading-tight line-clamp-2 mb-0.5">
                    {book.title}
                  </p>
                  <p className="font-sans font-light text-[7px] text-[#2A2A2A]/40 truncate">
                    {book.author}
                  </p>
                </div>
              </div>
            </Link>
          ) : null
        )}
      </div>
    </section>
  );
}

export function HomeScreen() {
  const { currentUser, margins, notifications, progress } = useApp();

  const progressMap = Object.fromEntries(
    progress.filter((p) => p.userId === currentUser.id).map((p) => [p.bookId, p])
  );

  const readingBooks = progress
    .filter((p) => p.userId === currentUser.id && p.status === "reading")
    .map((p) => ({ prog: p, book: MOCK_BOOKS.find((b) => b.id === p.bookId) }))
    .filter((x): x is { prog: (typeof progress)[0]; book: (typeof MOCK_BOOKS)[0] } => !!x.book);

  const currentReading = readingBooks[0]?.prog ?? null;
  const currentBook = readingBooks[0]?.book ?? null;

  const unread = notifications.filter((n) => !n.isRead).length;
  const subtitle = SUBTITLES[new Date().getHours() % SUBTITLES.length];

  const visibleMargins = filterMarginsForUser(
    margins.filter((m) => m.userId !== currentUser.id),
    currentUser.spoilerPreference,
    progressMap
  );

  const feedMargins = visibleMargins.slice(0, 6);
  const newEchos = currentReading
    ? margins.filter((m) => m.bookId === currentReading.bookId && m.userId !== currentUser.id).length
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
    <div className="min-h-full bg-[#FAF8F3] overflow-x-hidden screen-enter">
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
            <button data-testid="button-notifications" className="relative text-[#2A2A2A]/40 hover:text-[#2A2A2A]/70 transition-colors p-1">
              <Bell className="w-5 h-5" />
              {unread > 0 && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#AE8F7D]" />}
            </button>
          </Link>
          <button className="text-[#2A2A2A]/30 hover:text-[#2A2A2A]/60 transition-colors p-1">
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
        {/* Continue Reading — carrossel */}
        {readingBooks.length > 0 && (
          <section data-testid="section-continue-reading">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Lendo agora
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
              {readingBooks.length > 1 && (
                <span className="font-sans font-light text-[8px] text-[#2A2A2A]/30">{readingBooks.length} livros</span>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {readingBooks.map(({ book, prog }) => {
                const bookEchos = margins.filter((m) => m.bookId === book.id && m.userId !== currentUser.id).length;
                return (
                  <div
                    key={book.id}
                    className="flex-shrink-0 w-[280px] bg-[#FAF8F3] border border-[#AE8F7D]/20 rounded-[16px] p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <BookCover title={book.title} bookColor={book.bookColor} coverUrl={book.coverUrl} size="sm" className="shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <h2 className="font-serif italic text-[15px] text-[#3D3D3D] leading-tight mb-0.5 line-clamp-2">{book.title}</h2>
                        <p className="font-sans font-light text-[8px] tracking-[0.1em] uppercase text-[#2A2A2A]/45 mb-2">{book.author}</p>
                        <div className="w-full h-[2.5px] bg-[#EBE6DB] rounded-full overflow-hidden mb-1">
                          <div
                            className="h-full bg-[#AE8F7D] rounded-full transition-all duration-500"
                            style={{ width: `${prog.currentPercent}%` }}
                          />
                        </div>
                        <span className="font-sans font-light text-[8px] text-[#2A2A2A]/40">
                          {progressLabel(prog)}
                          {prog.currentPage > 0 && book.totalPages > 0
                            ? ` · p. ${prog.currentPage} de ${book.totalPages}`
                            : ""}
                        </span>
                      </div>
                    </div>
                    {bookEchos > 0 && (
                      <p className="font-sans font-light text-[8px] text-[#697962] mb-3">
                        {bookEchos} {bookEchos === 1 ? "post liberado" : "posts liberados"} dentro do seu progresso
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Link href={`/book/${book.id}`} data-testid="button-ver-ecos" className="flex-1">
                        <button className="w-full bg-[#454545] text-[#FAF8F3] font-sans text-[9px] font-light tracking-[0.1em] uppercase py-2.5 rounded-[8px] hover:bg-[#454545]/90 transition-colors">
                          Ver posts
                        </button>
                      </Link>
                      <Link href="/nova-margem" className="flex-1">
                        <button className="w-full border border-[#454545]/15 text-[#2A2A2A]/55 font-sans text-[9px] font-light tracking-[0.1em] uppercase py-2.5 rounded-[8px] hover:border-[#AE8F7D]/40 transition-colors">
                          + Post
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            {readingBooks.length > 1 && (
              <div className="flex justify-center gap-1 mt-2">
                {readingBooks.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-[#AE8F7D]" : "bg-[#AE8F7D]/25"}`} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Momento do Livro Hoje */}
        <MomentosSection />

        {/* Wishlist moved to Profile screen */}

        {/* Today's Feed with editorial breaks */}
        <section data-testid="section-today-feed">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">Hoje para você</span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40 mb-4">
            {isProtected ? "Com seu ritmo protegido" : "Feed personalizado"}
          </p>

          {feedMargins.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-[#AE8F7D]/20 rounded-[14px]">
              <p className="font-serif italic text-[14px] text-[#2A2A2A]/35 mb-3">
                Adicione livros à biblioteca para ver posts compatíveis.
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

        {/* Community Feed */}
        <CommunityFeedSection />

        {/* Ritual CTA */}
        <section className="pb-4">
          <div className="bg-[#EBE6DB]/50 border border-[#AE8F7D]/12 rounded-[16px] p-5">
            <p className="font-sans text-[7px] font-light tracking-[0.2em] uppercase text-[#AE8F7D] mb-2">Rituais de leitura</p>
            <p className="font-serif italic text-[15px] text-[#3D3D3D] mb-1 leading-snug">
              Guarde antes que se perca.
            </p>
            <p className="font-sans font-light text-[10px] text-[#2A2A2A]/45 mb-4 leading-relaxed">
              Aquele trecho que ficou com você — merece ser um post.
            </p>
            <Link href="/nova-margem" data-testid="button-nova-margem-ritual">
              <button className="font-sans text-[9px] font-light tracking-[0.14em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/35 px-5 py-2.5 rounded-full hover:bg-[#AE8F7D]/8 transition-colors">
                Criar post
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
