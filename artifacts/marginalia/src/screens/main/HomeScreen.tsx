import { Bell, SlidersHorizontal, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useApp } from "@/context/AppContext";
import { MarginCard } from "@/components/cards/MarginCard";
import { LogoMark } from "@/components/LogoMark";
import { BookCover } from "@/components/BookCover";
import { filterMarginsForUser } from "@/utils/spoiler";
import { canUserSeeMargin } from "@/utils/spoiler";
import { MOCK_BOOKS, USER_AVATAR_MAP, type Margin, type BookProgress } from "@/data/mockData";
import { UserIdentity } from "@/components/UserIdentity";
import { progressLabel } from "@/utils/formatting";
import { Shield } from "lucide-react";
import { useCommunityFeed, formatCommunityMarginAge, totalReactions, type CommunityMargin } from "@/hooks/useCommunity";
import type { SpoilerPreference } from "@/data/constants";

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
    if (m.bookId === null) return;
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
        <span className="mg-live-dot" />
        <span className="font-sans text-[7px] font-light tracking-[0.14em] uppercase text-[#697962]/70">ao vivo</span>
      </div>
      <p className="font-sans font-light text-[9px] text-[#8C837A] mb-3">
        Onde leitores estão parando agora
      </p>
      <div className="space-y-2">
        {momentos.map(({ bookId, book, topMargin, count }, idx) => {
          if (!book || !topMargin) return null;
          const prog = progressMap[bookId];
          const canSee = canUserSeeMargin(topMargin, currentUser.spoilerPreference, prog);
          const reactionTotal = Object.values(topMargin.reactions).reduce((a, b) => a + b, 0);

          return (
            <div
              key={bookId}
              className={`rounded-[14px] border p-4 ${
                idx === 0
                  ? "bg-[#EBE6DB]/40 border-[#AE8F7D]/20"
                  : "bg-[#FAF8F3] border-[#AE8F7D]/12"
              }`}
            >
              <div className="mb-2.5">
                <p className="font-sans text-[7px] font-light tracking-[0.2em] uppercase text-[#697962] mb-0.5">
                  {idx === 0 ? "✦ Mais ativo agora" : "Em alta"}
                </p>
                <p className="font-serif italic text-[15px] text-[#2C2A27] leading-tight">{book.title}</p>
                <p className="font-sans font-light text-[8px] tracking-[0.08em] uppercase text-[#5C5650]">{book.author}</p>
              </div>

              {canSee ? (
                <div className="border-l-2 border-[#AE8F7D]/40 pl-3 mb-2.5">
                  <p className="font-serif italic text-[12px] text-[#2C2A27] leading-[1.65] line-clamp-2">
                    &ldquo;{topMargin.excerpt}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="bg-[#EBE6DB]/60 rounded-[8px] px-3 py-2 mb-2.5 flex items-center gap-2">
                  <Shield className="w-3 h-3 text-[#AE8F7D]/50 flex-shrink-0" />
                  <p className="font-sans font-light text-[9px] text-[#8C837A] italic">
                    Leitores estão reagindo intensamente neste ponto.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="font-sans font-light text-[8px] text-[#8C837A]">
                  {reactionTotal > 0 ? `${reactionTotal} reações · ` : ""}
                  {topMargin.commentsCount} respostas
                  {topMargin.percent !== undefined ? ` · em ${topMargin.percent}% do livro` : ""}
                </p>
                {idx === 0 && (
                  <Link href={`/eco/${topMargin.id}`}>
                    <button className="font-sans text-[8px] font-light tracking-[0.12em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/30 px-3 py-1 rounded-full hover:bg-[#AE8F7D]/8 transition-colors flex-shrink-0 ml-2">
                      Ver post
                    </button>
                  </Link>
                )}
                {idx > 0 && (
                  <Link href={`/book/${bookId}`}>
                    <button className="font-sans text-[8px] font-light tracking-[0.12em] uppercase text-[#697962]/60 px-2 py-1 hover:text-[#697962] transition-colors flex-shrink-0">
                      Ver livro →
                    </button>
                  </Link>
                )}
              </div>
            </div>
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
      <p className="font-serif italic text-[13px] text-[#5C5650] leading-relaxed mb-3">{b.body}</p>
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

// ─── Community feed helpers ────────────────────────────────────────────────

const COMMUNITY_ATMOSPHERIC_PHRASES = [
  "Algo significativo está sendo discutido neste ponto do livro.",
  "Leitores estão reagindo intensamente aqui.",
  "Uma conversa forte está acontecendo neste livro.",
  "Este trecho despertou surpresa e reflexão na comunidade.",
  "Há muita atividade da comunidade neste momento do livro.",
  "Leitores estão discutindo intensamente este ponto.",
];

function canSeeCommunityMarginFull(
  m: CommunityMargin,
  preference: SpoilerPreference,
  progress: BookProgress | undefined
): boolean {
  if (preference === "all") return true;
  if (!progress) return false;
  if (progress.status === "completed") return true;
  if (m.spoilerLevel !== "none") return false;
  return true;
}

function ProtectedCommunityCard({ m }: { m: CommunityMargin }) {
  const [, navigate] = useLocation();
  const rxTotal = totalReactions(m.reactions);
  const phrase = COMMUNITY_ATMOSPHERIC_PHRASES[m.id % COMMUNITY_ATMOSPHERIC_PHRASES.length];

  return (
    <div
      data-testid={`card-community-protected-${m.id}`}
      className="rounded-[14px] border border-[#697962]/15 p-4 bg-[#FAF8F3]"
    >
      {/* Book header */}
      <div className="flex items-start gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-serif italic text-[14px] text-[#2C2A27] leading-tight truncate">{m.bookTitle}</p>
          <p className="font-sans font-light text-[8px] tracking-[0.1em] uppercase text-[#5C5650] mt-0.5">{m.bookAuthor}</p>
        </div>
        <div className="flex items-center gap-1 bg-[#697962]/8 border border-[#697962]/15 rounded-full px-2 py-1 flex-shrink-0">
          <Shield className="w-2.5 h-2.5 text-[#697962]" />
          <span className="font-sans font-light text-[7px] tracking-[0.1em] uppercase text-[#697962]">Protegido</span>
        </div>
      </div>

      {/* Atmospheric phrase */}
      <div className="bg-[#EBE6DB]/40 rounded-[8px] px-3 py-2.5 mb-3">
        <p className="font-serif italic text-[13px] text-[#5C5650] leading-relaxed">{phrase}</p>
      </div>

      {/* Activity counts */}
      {(rxTotal > 0 || m.commentsCount > 0) && (
        <div className="flex items-center gap-3 mb-3">
          <span className="font-sans font-light text-[8px] text-[#697962]/70">
            {rxTotal > 0 && `${rxTotal} reações`}
            {rxTotal > 0 && m.commentsCount > 0 && " · "}
            {m.commentsCount > 0 && `${m.commentsCount} ${m.commentsCount === 1 ? "resposta" : "respostas"}`}
          </span>
        </div>
      )}

      <p className="font-sans font-light text-[9px] text-[#8C837A] mb-3 leading-relaxed">
        Trecho protegido para respeitar seu ritmo de leitura.
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link href={`/book/${m.bookId}`}>
          <button className="font-sans text-[8px] font-light tracking-[0.1em] uppercase text-[#697962] border border-[#697962]/30 px-3 py-1.5 rounded-full hover:bg-[#697962]/8 transition-colors">
            Ver livro
          </button>
        </Link>
        <button
          onClick={() => navigate(`/eco/${m.id}`)}
          className="font-sans text-[8px] font-light tracking-[0.1em] uppercase text-[#2A2A2A]/35 px-3 py-1.5 hover:text-[#2A2A2A]/55 transition-colors"
        >
          Ver mesmo assim
        </button>
      </div>
    </div>
  );
}

function CommunityFeedSection() {
  const { currentUser, progress } = useApp();
  const { margins, loading } = useCommunityFeed(1, 8);
  if (loading) return null;
  if (margins.length === 0) return null;

  const progressMap = Object.fromEntries(
    progress.filter((p) => p.userId === currentUser.id).map((p) => [p.bookId, p])
  );
  const isProtected = currentUser.spoilerPreference !== "all";

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
      <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40 mb-4">
        {isProtected ? "Discussões seguras da comunidade" : "O que leitores estão compartilhando agora"}
      </p>
      <div className="space-y-3">
        {margins.map((m) => {
          const bookProgress = progressMap[m.bookId] as BookProgress | undefined;
          const canSee = canSeeCommunityMarginFull(m, currentUser.spoilerPreference, bookProgress);

          if (!canSee) {
            return <ProtectedCommunityCard key={m.id} m={m} />;
          }

          const rxTotal = totalReactions(m.reactions);
          const handle = m.userSeedId ? `@${m.userSeedId.replace(/^s_/, '').replace(/_/g, '')}` : null;
          return (
            <Link key={m.id} href={`/eco/${m.id}`}>
              <div className="bg-[#FAF8F3] border border-[#697962]/12 rounded-[14px] p-4 active:opacity-80 transition-opacity cursor-pointer">
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <UserIdentity
                    name={m.userName}
                    username={handle}
                    initials={m.userInitials ?? m.userName[0]}
                    avatarColor={m.userAvatarColor ?? "#697962"}
                    avatarId={USER_AVATAR_MAP[m.userSeedId?.replace(/^s_/, 'user_') ?? ""] ?? undefined}
                    timestamp={formatCommunityMarginAge(m.createdAt)}
                  />
                  {m.spoilerLevel !== "none" && (
                    <span className="font-sans font-light text-[7px] tracking-[0.1em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/25 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {m.spoilerLevel}
                    </span>
                  )}
                </div>

                <div className="bg-[#EBE6DB]/50 rounded-[8px] px-3 py-2 mb-2.5">
                  <p className="font-serif italic text-[13px] text-[#2C2A27] leading-[1.65] line-clamp-3">
                    &ldquo;{m.excerpt}&rdquo;
                  </p>
                </div>

                {m.commentary && (
                  <p className="font-sans text-[11px] text-[#5C5650] leading-[1.65] mb-2 line-clamp-2">{m.commentary}</p>
                )}

                <div className="flex items-center gap-3">
                  <p className="font-sans font-light text-[8px] text-[#8C837A] truncate flex-1">{m.bookTitle}</p>
                  {(rxTotal > 0 || m.commentsCount > 0) && (
                    <span className="font-sans font-light text-[8px] text-[#697962]/80 flex-shrink-0">
                      {rxTotal > 0 && `${rxTotal} reações`}
                      {rxTotal > 0 && m.commentsCount > 0 && " · "}
                      {m.commentsCount > 0 && `${m.commentsCount} ${m.commentsCount === 1 ? "resposta" : "respostas"}`}
                    </span>
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
                  <p className="font-serif italic text-[11px] text-[#2C2A27] leading-tight line-clamp-2 mb-0.5">
                    {book.title}
                  </p>
                  <p className="font-sans font-light text-[7px] text-[#5C5650] truncate">
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
  const { currentUser, margins, notifications, progress, isDark, toggleTheme, streak } = useApp();

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
          <button
            onClick={toggleTheme}
            className="text-[#2A2A2A]/40 hover:text-[#2A2A2A]/70 dark:text-white/30 dark:hover:text-white/60 transition-opacity p-1"
            title={isDark ? "Ativar modo claro" : "Ativar modo noturno"}
            style={{ transition: "opacity 200ms" }}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {streak >= 3 && (
            <span
              className="font-sans text-[11px] font-light"
              style={{ color: streak >= 30 ? "#697962" : "#AE8F7D" }}
              title={`${streak} dias consecutivos de leitura`}
            >
              🔥 {streak}
            </span>
          )}
          <Link href="/notifications">
            <button data-testid="button-notifications" className="relative text-[#2A2A2A]/40 hover:text-[#2A2A2A]/70 dark:text-white/30 dark:hover:text-white/60 transition-colors p-1">
              <Bell className="w-5 h-5" />
              {unread > 0 && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#AE8F7D]" />}
            </button>
          </Link>
          <button className="text-[#2A2A2A]/30 hover:text-[#2A2A2A]/60 dark:text-white/25 dark:hover:text-white/50 transition-colors p-1">
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
                        <h2 className="font-serif italic text-[15px] text-[#2C2A27] leading-tight mb-0.5 line-clamp-2">{book.title}</h2>
                        <p className="font-sans font-light text-[8px] tracking-[0.1em] uppercase text-[#5C5650] mb-2">{book.author}</p>
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
