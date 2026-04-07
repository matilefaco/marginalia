import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Share2, Check, MessageCircle, Bookmark, BookmarkCheck, CornerUpRight, Shield } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { canUserSeeMargin, getBlockedReason } from "@/utils/spoiler";
import { formatReference, marginTypeLabel, timeAgo } from "@/utils/formatting";
import { MARGIN_TYPES, EMOJI_REACTIONS } from "@/data/constants";
import type { Margin } from "@/data/mockData";
import { MOCK_BOOKS, MOCK_USERS } from "@/data/mockData";
import { ShareCardModal } from "./ShareCardModal";
import { UserIdentity } from "@/components/UserIdentity";

const USER_USERNAME_MAP: Record<string, string> = Object.fromEntries(
  MOCK_USERS.map((u) => [u.id, u.username])
);

/* ─── Type accent colour system ─── */
const ACCENT_MAP: Record<string, { border: string; label: string }> = {
  favorite_quote:      { border: "#C9A99A", label: "#A07868" },
  symbolic_reading:    { border: "#8A9E8C", label: "#697962" },
  theory:              { border: "#6B7A6B", label: "#5A6A5A" },
  question:            { border: "#BDAB9C", label: "#9A8878" },
  critique:            { border: "#7A7A7A", label: "#646464" },
  reaction:            { border: "#C4A28C", label: "#9A7A60" },
  insight:             { border: "#8A9E8C", label: "#697962" },
  personal_connection: { border: "#C4A08A", label: "#A07868" },
};
function accent(type: string) {
  return ACCENT_MAP[type] ?? { border: "#AE8F7D", label: "#AE8F7D" };
}

interface Props {
  margin: Margin;
  showBook?: boolean;
  linkToThread?: boolean;
  bookColor?: string;
}

function ShareButton({ margin }: { margin: Margin }) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <button
        data-testid={`button-share-margin-${margin.id}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalOpen(true); }}
        className="flex items-center gap-1 font-sans text-[7.5px] font-light tracking-[0.06em] text-[#2A2A2A]/28 hover:text-[#AE8F7D] transition-colors py-1 px-1"
        title="Compartilhar"
      >
        <Share2 className="w-3 h-3" />
      </button>
      {modalOpen && (
        <ShareCardModal context={{ type: "eco", margin }} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}

function SaveButton({ margin }: { margin: Margin }) {
  const { savedMargins, toggleSaveMargin } = useApp();
  const isSaved = savedMargins.includes(margin.id);
  return (
    <button
      data-testid={`button-save-margin-${margin.id}`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSaveMargin(margin.id); }}
      title={isSaved ? "Salvo" : "Salvar post"}
      className={`transition-all active:scale-90 ${isSaved ? "text-[#AE8F7D]" : "text-[#2A2A2A]/25 hover:text-[#AE8F7D]/60"}`}
    >
      {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
    </button>
  );
}

function EmojiReactionBar({ margin }: { margin: Margin }) {
  const { addReaction, userReactions, lastUsedReaction } = useApp();
  const myEmoji = userReactions[margin.id];
  const [pickerOpen, setPickerOpen] = useState(false);
  const [justPopped, setJustPopped] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const reactions = margin.reactions as Record<string, number>;
  const top3 = Object.entries(reactions).sort(([, a], [, b]) => b - a).slice(0, 3);
  const extraCount = Math.max(0, Object.keys(reactions).length - 3);

  useEffect(() => {
    if (!pickerOpen) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, [pickerOpen]);

  const pop = (emoji: string) => {
    setJustPopped(emoji);
    setTimeout(() => setJustPopped(null), 400);
  };

  const selectEmoji = (emoji: string, e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addReaction(margin.id, emoji);
    pop(emoji);
    setPickerOpen(false);
  };

  const handleChipClick = (emoji: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addReaction(margin.id, emoji);
    pop(emoji);
  };

  const startPress = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    timerRef.current = setTimeout(() => setPickerOpen(true), 380);
  };

  const endPress = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      if (!pickerOpen) {
        if (myEmoji) {
          addReaction(margin.id, myEmoji);
          pop(myEmoji);
        } else if (lastUsedReaction) {
          addReaction(margin.id, lastUsedReaction);
          pop(lastUsedReaction);
        } else {
          setPickerOpen(true);
        }
      }
    }
  };

  const cancelPress = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  return (
    <div
      className="flex items-center gap-1.5 flex-wrap"
      onClick={(e) => e.stopPropagation()}
    >
      <div ref={containerRef} className="relative flex-shrink-0">
        {pickerOpen && (
          <div
            className="absolute bottom-full left-0 mb-2 bg-[#2A2A2A] rounded-[20px] px-3 py-2.5 flex gap-2.5 shadow-2xl z-50"
            style={{ animation: "fadeScaleUp 0.15s ease" }}
            onClick={(e) => e.stopPropagation()}
          >
            {EMOJI_REACTIONS.map((r) => (
              <button
                type="button"
                key={r.emoji}
                onClick={(e) => selectEmoji(r.emoji, e)}
                className={`text-[22px] leading-none transition-transform hover:scale-125 active:scale-95 ${
                  r.emoji === myEmoji ? "scale-125 drop-shadow-sm" : ""
                } ${justPopped === r.emoji ? "emoji-pop" : ""}`}
                title={r.label}
              >
                {r.emoji}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onPointerDown={startPress}
          onPointerUp={endPress}
          onPointerLeave={cancelPress}
          onPointerCancel={cancelPress}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          style={{ userSelect: "none", WebkitUserSelect: "none", touchAction: "none" }}
          data-testid={`button-react-${margin.id}`}
          className={`text-[14px] leading-none px-2 py-1 rounded-full border transition-all select-none ${
            justPopped
              ? "emoji-pop"
              : myEmoji
              ? "bg-[#AE8F7D]/12 border-[#AE8F7D]/35"
              : "border-dashed border-[#454545]/15 hover:border-[#AE8F7D]/30 text-[#2A2A2A]/35"
          }`}
          title={myEmoji ? "Toque para remover · segure para trocar" : "Segure para reagir"}
        >
          {myEmoji ?? <span className="font-sans text-[11px]">＋</span>}
        </button>
      </div>

      {top3.map(([emoji, count]) => {
        const isMine = myEmoji === emoji;
        return (
          <button
            type="button"
            key={emoji}
            onClick={(e) => handleChipClick(emoji, e)}
            className={`flex items-center gap-0.5 text-[13px] leading-none px-2 py-1 rounded-full border transition-all active:scale-95 ${
              justPopped === emoji ? "emoji-pop" : ""
            } ${
              isMine
                ? "bg-[#AE8F7D]/18 border-[#AE8F7D]/40"
                : "bg-[#EBE6DB]/70 border-[#AE8F7D]/10 hover:border-[#AE8F7D]/25"
            }`}
          >
            {emoji}
            <span
              key={count}
              className={`font-sans font-light text-[8px] count-pulse ${isMine ? "text-[#AE8F7D]" : "text-[#2A2A2A]/55"}`}
            >
              {count}
            </span>
          </button>
        );
      })}
      {extraCount > 0 && (
        <span className="font-sans font-light text-[8px] text-[#2A2A2A]/30">+{extraCount}</span>
      )}
      {top3.length === 0 && (
        <span className="font-sans font-light text-[8px] text-[#2A2A2A]/25 italic">sem reações</span>
      )}
    </div>
  );
}

function EcoarBar({ margin, linkToThread }: { margin: Margin; linkToThread?: boolean }) {
  const [, navigate] = useLocation();
  const { currentUser } = useApp();
  const avatarColor = margin.userId === currentUser.id
    ? (currentUser.avatarColor || "#697962")
    : MOCK_USERS.find((u) => u.id === margin.userId)?.avatarColor || "#AE8F7D";
  const totalReactions = Object.values(margin.reactions as Record<string, number>).reduce((a, b) => a + b, 0);

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (margin.userId !== currentUser.id) {
      const username = USER_USERNAME_MAP[margin.userId]?.replace(/^@/, "");
      if (username) navigate(`/perfil/${username}`);
      else navigate(`/user/${margin.userId}`);
    }
  };

  const handleReplyWithMargin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/nova-margem?replyTo=${margin.id}&bookId=${margin.bookId}`);
  };

  const ecoarContent = (
    <button
      data-testid={`button-ecoar-${margin.id}`}
      onClick={(e) => { if (!linkToThread) { e.preventDefault(); e.stopPropagation(); } }}
      className="flex items-center gap-1.5 font-sans text-[8.5px] font-light tracking-[0.1em] text-[#2A2A2A]/45 hover:text-[#AE8F7D] transition-colors"
    >
      <MessageCircle className="w-3 h-3" />
      {margin.commentsCount > 0
        ? <span>{margin.commentsCount} {margin.commentsCount === 1 ? "resposta" : "respostas"}</span>
        : <span>Responder</span>
      }
    </button>
  );

  return (
    <div className="pt-3 border-t border-[#454545]/6 mt-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <UserIdentity
            name={margin.userName}
            username={USER_USERNAME_MAP[margin.userId] ?? null}
            initials={margin.userInitials}
            avatarColor={avatarColor}
            userId={margin.userId !== currentUser.id ? margin.userId : null}
            onNavigate={margin.userId !== currentUser.id ? handleAuthorClick : undefined}
          />
          {totalReactions >= 8 && (
            <span className="font-sans text-[7px] text-[#AE8F7D]/60" title="Trecho muito ativo">🔥</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {ecoarContent}
          <button
            title="Responder com seu post"
            onClick={handleReplyWithMargin}
            className="flex items-center gap-1 text-[#2A2A2A]/22 hover:text-[#697962] transition-colors"
          >
            <CornerUpRight className="w-3 h-3" />
          </button>
          <SaveButton margin={margin} />
          <ShareButton margin={margin} />
        </div>
      </div>
    </div>
  );
}

/* ─── CARD: Citação favorita ─── */
function QuoteCard({ margin, showBook, linkToThread, bookColor }: Props) {
  const ref = formatReference(margin);
  const a = accent(margin.postType);
  const content = (
    <div
      data-testid={`card-margin-${margin.id}`}
      className="rounded-[14px] p-5 hover:brightness-[0.98] transition-all"
      style={{
        border: "1px solid rgba(174,143,125,0.16)",
        borderLeft: `3px solid ${a.border}AA`,
        backgroundColor: bookColor ? `${bookColor}CC` : "#EBE6DB4D",
      }}
    >
      <div className="flex items-center justify-between mb-3.5">
        <span className="font-sans text-[7.5px] font-light tracking-[0.22em] uppercase" style={{ color: a.label }}>
          ✦ Citação favorita
        </span>
        <span className="font-sans font-light text-[7px] text-[#2A2A2A]/25">{timeAgo(margin.createdAt)}</span>
      </div>
      <div className="text-center py-4 mb-3.5">
        <p className="font-serif italic text-[18px] text-[#2A2A2A] leading-[1.75]">
          &ldquo;{margin.excerpt}&rdquo;
        </p>
      </div>
      {showBook && (
        <p className="font-sans font-light text-[8.5px] tracking-[0.1em] uppercase text-[#2A2A2A]/40 text-center mb-4">
          {margin.bookTitle} {ref && `· ${ref}`}
        </p>
      )}
      <div className="mb-3">
        <EmojiReactionBar margin={margin} />
      </div>
      <EcoarBar margin={margin} linkToThread={linkToThread} />
    </div>
  );
  if (!linkToThread) return content;
  return <Link href={`/thread/${margin.id}`} className="block active:scale-[0.99] active:opacity-90 transition-all duration-150">{content}</Link>;
}

/* ─── CARD: Pergunta ─── */
function QuestionCard({ margin, showBook, linkToThread, bookColor }: Props) {
  const ref = formatReference(margin);
  const a = accent(margin.postType);
  const content = (
    <div
      data-testid={`card-margin-${margin.id}`}
      className="rounded-[14px] p-5 hover:brightness-[0.98] transition-all"
      style={{
        border: "1px dashed rgba(189,171,156,0.35)",
        borderLeft: `3px solid ${a.border}AA`,
        backgroundColor: bookColor ? `${bookColor}99` : "#FAF8F3",
      }}
    >
      <div className="flex items-center gap-2 mb-3.5">
        <span className="font-sans text-[8px] font-light tracking-[0.18em] uppercase" style={{ color: a.label }}>❓ Pergunta</span>
        {showBook && <><span className="text-[#AE8F7D]/25">·</span><span className="font-sans text-[8px] font-light text-[#2A2A2A]/45 truncate max-w-[100px]">{margin.bookTitle}</span></>}
        {ref && <><span className="text-[#AE8F7D]/25">·</span><span className="font-sans text-[8px] font-light text-[#2A2A2A]/35">{ref}</span></>}
        <span className="ml-auto font-sans text-[7px] font-light text-[#2A2A2A]/25">{timeAgo(margin.createdAt)}</span>
      </div>
      <div className="bg-[#FAF8F3]/80 pl-4 mb-4" style={{ borderLeft: `2px solid ${a.border}88` }}>
        <p className="font-serif italic text-[15px] text-[#2A2A2A] leading-[1.75]">
          &ldquo;{margin.excerpt}&rdquo;
        </p>
      </div>
      {margin.commentary && (
        <p className="font-serif text-[15px] text-[#2A2A2A]/72 leading-[1.75] mb-4">{margin.commentary}</p>
      )}
      <div className="mb-3">
        <EmojiReactionBar margin={margin} />
      </div>
      <EcoarBar margin={margin} linkToThread={linkToThread} />
    </div>
  );
  if (!linkToThread) return content;
  return <Link href={`/thread/${margin.id}`} className="block active:scale-[0.99] active:opacity-90 transition-all duration-150">{content}</Link>;
}

/* ─── CARD: Teoria ─── */
function TheoryCard({ margin, showBook, linkToThread, bookColor }: Props) {
  const totalReactions = Object.values(margin.reactions as Record<string, number>).reduce((a, b) => a + b, 0);
  const a = accent(margin.postType);
  const content = (
    <div
      data-testid={`card-margin-${margin.id}`}
      className="rounded-[14px] p-5 hover:brightness-[0.98] transition-all shadow-sm"
      style={{
        border: "1px solid rgba(107,122,107,0.18)",
        borderLeft: `3px solid ${a.border}CC`,
        backgroundColor: bookColor ? `${bookColor}99` : "#FAF8F3",
      }}
    >
      <div className="flex items-center gap-2 mb-3.5">
        <span className="font-sans text-[8px] font-light tracking-[0.18em] uppercase" style={{ color: a.label }}>🔭 Teoria</span>
        {showBook && <><span style={{ color: `${a.border}40` }}>·</span><span className="font-sans text-[8px] font-light text-[#2A2A2A]/45 truncate max-w-[90px]">{margin.bookTitle}</span></>}
        <span className="ml-auto font-sans text-[7px] font-light text-[#2A2A2A]/25">{timeAgo(margin.createdAt)}</span>
      </div>
      <div className="pl-3 mb-4" style={{ borderLeft: `2px solid ${a.border}50` }}>
        <p className="font-serif italic text-[14px] text-[#2A2A2A]/60 leading-[1.75] line-clamp-3">
          &ldquo;{margin.excerpt}&rdquo;
        </p>
      </div>
      {margin.commentary && (
        <p className="font-serif text-[15px] text-[#2A2A2A]/80 leading-[1.75] mb-4">{margin.commentary}</p>
      )}
      <div className="mb-3">
        <EmojiReactionBar margin={margin} />
      </div>
      {totalReactions > 0 && (
        <p className="font-sans font-light text-[8px] mb-2" style={{ color: `${a.border}99` }}>{totalReactions} leitores responderam isso</p>
      )}
      <EcoarBar margin={margin} linkToThread={linkToThread} />
    </div>
  );
  if (!linkToThread) return content;
  return <Link href={`/thread/${margin.id}`} className="block active:scale-[0.99] active:opacity-90 transition-all duration-150">{content}</Link>;
}

/* ─── CARD: Standard (insight / reaction / critique / symbolic / personal) ─── */
function StandardCard({ margin, showBook, linkToThread, bookColor }: Props) {
  const totalReactions = Object.values(margin.reactions as Record<string, number>).reduce((a, b) => a + b, 0);
  const ref = formatReference(margin);
  const typeIcon = MARGIN_TYPES.find((t) => t.id === margin.postType)?.icon || "";
  const a = accent(margin.postType);

  const content = (
    <div
      data-testid={`card-margin-${margin.id}`}
      className="rounded-[14px] p-5 hover:brightness-[0.98] transition-all"
      style={{
        border: "1px solid rgba(174,143,125,0.14)",
        borderLeft: `3px solid ${a.border}99`,
        backgroundColor: bookColor ? `${bookColor}99` : "#FAF8F3",
      }}
    >
      <div className="flex items-center gap-2 mb-3.5">
        <span className="font-sans text-[8px] font-light tracking-[0.18em] uppercase flex items-center gap-1" style={{ color: a.label }}>
          <span>{typeIcon}</span>
          <span>{marginTypeLabel(margin.postType)}</span>
        </span>
        {ref && <><span className="text-[#AE8F7D]/25">·</span><span className="font-sans text-[8px] font-light text-[#2A2A2A]/45">{ref}</span></>}
        {showBook && <><span className="text-[#AE8F7D]/25">·</span><span className="font-sans text-[8px] font-light text-[#2A2A2A]/45 truncate max-w-[100px]">{margin.bookTitle}</span></>}
        <span className="ml-auto font-sans text-[7px] font-light text-[#2A2A2A]/25 flex-shrink-0">{timeAgo(margin.createdAt)}</span>
      </div>

      {/* Quote block */}
      <div className="pl-4 mb-4" style={{ borderLeft: `2px solid ${a.border}66` }}>
        <p className="font-serif italic text-[15px] text-[#2A2A2A] leading-[1.75]">
          &ldquo;{margin.excerpt}&rdquo;
        </p>
      </div>

      {/* Commentary — visually separated from the quote */}
      {margin.commentary && (
        <p className="font-serif text-[15px] text-[#2A2A2A]/72 leading-[1.75] mb-4">
          {margin.commentary}
        </p>
      )}

      <div className="mb-3">
        <EmojiReactionBar margin={margin} />
      </div>
      {totalReactions > 0 && (
        <p className="font-sans font-light text-[8px] text-[#2A2A2A]/35 mb-1">
          {totalReactions} {totalReactions === 1 ? "leitor respondeu" : "leitores responderam"} isso
        </p>
      )}
      <EcoarBar margin={margin} linkToThread={linkToThread} />
    </div>
  );
  if (!linkToThread) return content;
  return <Link href={`/thread/${margin.id}`} className="block active:scale-[0.99] active:opacity-90 transition-all duration-150">{content}</Link>;
}

export function MarginCard({ margin, showBook = false, linkToThread = true }: Props) {
  const { currentUser, getProgressForBook } = useApp();
  const progress = getProgressForBook(margin.bookId);
  const canSee = canUserSeeMargin(margin, currentUser.spoilerPreference, progress);

  const book = MOCK_BOOKS.find((b) => b.id === margin.bookId);
  const bookColor = book?.bookColor;

  if (!canSee) {
    return (
      <SpoilerShieldCard
        margin={margin}
        reason={getBlockedReason(margin, progress, currentUser.spoilerPreference)}
        inLibrary={!!progress}
      />
    );
  }

  if (margin.postType === "favorite_quote") {
    return <QuoteCard margin={margin} showBook={showBook} linkToThread={linkToThread} bookColor={bookColor} />;
  }
  if (margin.postType === "question") {
    return <QuestionCard margin={margin} showBook={showBook} linkToThread={linkToThread} bookColor={bookColor} />;
  }
  if (margin.postType === "theory") {
    return <TheoryCard margin={margin} showBook={showBook} linkToThread={linkToThread} bookColor={bookColor} />;
  }
  return <StandardCard margin={margin} showBook={showBook} linkToThread={linkToThread} bookColor={bookColor} />;
}

const ATMOSPHERIC_PHRASES = [
  "Leitores estão sentindo muito neste ponto.",
  "Uma conversa forte está acontecendo aqui.",
  "Este trecho tocou muitos leitores.",
  "A comunidade reagiu intensamente aqui.",
  "Algo significativo acontece neste ponto do livro.",
  "Muitos leitores pararam aqui para refletir.",
];

function SpoilerShieldCard({ margin, reason, inLibrary }: { margin: Margin; reason: string; inLibrary: boolean }) {
  const [, navigate] = useLocation();
  const [revealed, setRevealed] = useState(false);

  const book = MOCK_BOOKS.find((b) => b.id === margin.bookId);
  const totalReactions = Object.values(margin.reactions as Record<string, number>).reduce((a, b) => a + b, 0);
  const phrase = ATMOSPHERIC_PHRASES[margin.id % ATMOSPHERIC_PHRASES.length];
  const a = accent(margin.postType);
  const ref = formatReference(margin);
  const typeIcon = MARGIN_TYPES.find((t) => t.id === margin.postType)?.icon || "";
  const authorUsername = USER_USERNAME_MAP[margin.userId];

  if (revealed) {
    return (
      <Link
        href={`/thread/${margin.id}`}
        className="block active:scale-[0.99] active:opacity-90 transition-all duration-150"
      >
        <div
          data-testid={`card-spoiler-revealed-${margin.id}`}
          className="rounded-[14px] p-5"
          style={{
            border: "1px solid rgba(174,143,125,0.22)",
            borderLeft: `3px solid ${a.border}BB`,
            backgroundColor: "#FDF9F5",
            boxShadow: "0 1px 6px rgba(174,143,125,0.08)",
          }}
        >
          {/* Type + reference + timestamp */}
          <div className="flex items-center gap-2 mb-3.5">
            <span
              className="font-sans text-[7.5px] font-light tracking-[0.18em] uppercase flex items-center gap-1"
              style={{ color: a.label }}
            >
              <span>{typeIcon}</span>
              <span>{marginTypeLabel(margin.postType)}</span>
            </span>
            {ref && (
              <>
                <span className="text-[#AE8F7D]/25">·</span>
                <span className="font-sans text-[8px] font-light text-[#2A2A2A]/40">{ref}</span>
              </>
            )}
            <span className="ml-auto font-sans text-[7px] font-light text-[#2A2A2A]/25 flex-shrink-0">
              {timeAgo(margin.createdAt)}
            </span>
          </div>

          {/* Excerpt */}
          <div className="pl-4 mb-4" style={{ borderLeft: `2px solid ${a.border}66` }}>
            <p className="font-serif italic text-[15px] text-[#2A2A2A] leading-[1.75]">
              &ldquo;{margin.excerpt}&rdquo;
            </p>
          </div>

          {/* Commentary */}
          {margin.commentary && (
            <p className="font-serif text-[14px] text-[#454545]/72 leading-[1.7] mb-4">
              {margin.commentary}
            </p>
          )}

          {/* Author row */}
          <div className="flex items-center gap-2 mb-3 pt-3 border-t border-[#454545]/5">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: MOCK_USERS.find((u) => u.id === margin.userId)?.avatarColor || "#AE8F7D" }}
            >
              <span className="font-sans text-[7px] text-[#FAF8F3]">{margin.userInitials}</span>
            </div>
            <span className="font-sans font-light text-[10.5px] text-[#AE8F7D]">{margin.userName}</span>
            {authorUsername && (
              <span className="font-sans font-light text-[8.5px] text-[#454545]/30">
                @{authorUsername.replace(/^@/, "")}
              </span>
            )}
          </div>

          {/* Stats + affordance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {totalReactions > 0 && (
                <span className="font-sans font-light text-[8px] text-[#2A2A2A]/35">
                  {totalReactions} reações
                </span>
              )}
              {margin.commentsCount > 0 && (
                <span className="font-sans font-light text-[8px] text-[#2A2A2A]/35">
                  {margin.commentsCount} {margin.commentsCount === 1 ? "resposta" : "respostas"}
                </span>
              )}
            </div>
            <span className="font-sans font-light text-[7.5px] text-[#AE8F7D]/50 flex items-center gap-0.5">
              Abrir post ↗
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div
      data-testid={`card-spoiler-shield-${margin.id}`}
      className="rounded-[14px] border border-[#AE8F7D]/12 p-4 bg-[#FAF8F3]"
    >
      {/* Book info + shield icon */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-sans text-[7px] font-light tracking-[0.18em] uppercase text-[#AE8F7D]/65 mb-0.5">
            Trecho protegido · {margin.bookTitle}
          </p>
          {book && (
            <p className="font-sans font-light text-[8.5px] tracking-[0.06em] uppercase text-[#2A2A2A]/30">
              {book.author}
            </p>
          )}
        </div>
        <div className="w-7 h-7 rounded-full bg-[#EBE6DB]/70 flex items-center justify-center flex-shrink-0">
          <Shield className="w-3 h-3 text-[#AE8F7D]/45" />
        </div>
      </div>

      {/* Atmospheric signal */}
      <div className="bg-[#EBE6DB]/40 rounded-[10px] px-3 py-2.5 mb-3">
        <p className="font-serif italic text-[12.5px] text-[#2A2A2A]/55 leading-relaxed">{phrase}</p>
        {(totalReactions > 0 || margin.commentsCount > 0) && (
          <p className="font-sans font-light text-[8px] text-[#697962]/75 mt-1.5">
            {totalReactions > 0 && `${totalReactions} reações`}
            {totalReactions > 0 && margin.commentsCount > 0 && " · "}
            {margin.commentsCount > 0 &&
              `${margin.commentsCount} ${margin.commentsCount === 1 ? "resposta" : "respostas"}`}
          </p>
        )}
      </div>

      {/* Why it's hidden */}
      <p className="font-sans font-light text-[10px] text-[#2A2A2A]/38 leading-relaxed mb-3">{reason}</p>

      {/* CTAs */}
      <div className="flex gap-2 flex-wrap">
        {!inLibrary ? (
          <button
            onClick={() => navigate(`/book/${margin.bookId}`)}
            className="font-sans text-[8px] font-light tracking-[0.1em] uppercase text-[#697962] border border-[#697962]/25 px-3 py-1.5 rounded-full hover:bg-[#697962]/5 transition-colors"
          >
            Adicionar à biblioteca
          </button>
        ) : (
          <button
            onClick={() => navigate(`/book/${margin.bookId}`)}
            className="font-sans text-[8px] font-light tracking-[0.1em] uppercase text-[#697962] border border-[#697962]/25 px-3 py-1.5 rounded-full hover:bg-[#697962]/5 transition-colors"
          >
            Marcar progresso
          </button>
        )}
        <button
          data-testid={`button-reveal-${margin.id}`}
          onClick={() => setRevealed(true)}
          className="font-sans text-[8px] font-light tracking-[0.1em] uppercase text-[#2A2A2A]/35 px-3 py-1.5 hover:text-[#AE8F7D] transition-colors"
        >
          Ver mesmo assim
        </button>
      </div>
    </div>
  );
}
