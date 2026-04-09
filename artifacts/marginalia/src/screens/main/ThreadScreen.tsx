import { useState, useRef } from "react";
import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, Send, Bookmark, BookmarkCheck, Eye, EyeOff, Share2 } from "lucide-react";
import { ShareCardModal } from "@/components/cards/ShareCardModal";
import { useApp } from "@/context/AppContext";
import { MOCK_MARGINS, MOCK_REPLIES, MOCK_USERS, USER_AVATAR_MAP } from "@/data/mockData";
import { EMOJI_REACTIONS } from "@/data/constants";
import { formatReference, marginTypeLabel, timeAgo } from "@/utils/formatting";
import { UserIdentity } from "@/components/UserIdentity";
import { AvatarIcon } from "@/components/AvatarIcon";

const USER_USERNAME_MAP: Record<string, string> = Object.fromEntries(
  MOCK_USERS.map((u) => [u.id, u.username])
);

function CommentReactionBar({ commentId }: { commentId: number }) {
  const [myEmoji, setMyEmoji] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [justPopped, setJustPopped] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const react = (emoji: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (myEmoji === emoji) {
      setMyEmoji(null);
      setCounts((prev) => {
        const next = { ...prev };
        next[emoji] = Math.max(0, (next[emoji] || 1) - 1);
        if (next[emoji] === 0) delete next[emoji];
        return next;
      });
    } else {
      if (myEmoji) {
        setCounts((prev) => {
          const next = { ...prev };
          next[myEmoji] = Math.max(0, (next[myEmoji] || 1) - 1);
          if (next[myEmoji] === 0) delete next[myEmoji];
          return next;
        });
      }
      setMyEmoji(emoji);
      setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
      setJustPopped(emoji);
      setTimeout(() => setJustPopped(null), 400);
    }
    setPickerOpen(false);
  };

  const top = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 3);

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-1.5 flex-wrap mt-2"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative flex-shrink-0">
        {pickerOpen && (
          <div
            className="absolute bottom-full left-0 mb-1.5 bg-[#2A2A2A] rounded-[18px] px-2.5 py-2 flex gap-2 shadow-2xl z-50"
            style={{ animation: "fadeScaleUp 0.15s ease" }}
            onClick={(e) => e.stopPropagation()}
          >
            {EMOJI_REACTIONS.map((r) => (
              <button
                key={r.emoji}
                type="button"
                onClick={(e) => react(r.emoji, e)}
                className={`text-[18px] leading-none transition-transform hover:scale-125 active:scale-90 ${r.emoji === myEmoji ? "scale-110" : ""} ${justPopped === r.emoji ? "emoji-pop" : ""}`}
                title={r.label}
              >
                {r.emoji}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPickerOpen((o) => !o); }}
          className={`text-[11px] leading-none px-1.5 py-0.5 rounded-full border transition-all select-none ${
            myEmoji
              ? "bg-[#AE8F7D]/12 border-[#AE8F7D]/35 text-[14px]"
              : "border-dashed border-[#454545]/15 hover:border-[#AE8F7D]/30 text-[#454545]/35"
          }`}
        >
          {myEmoji ?? <span>＋</span>}
        </button>
      </div>

      {top.map(([emoji, count]) => (
        <button
          key={emoji}
          type="button"
          onClick={(e) => react(emoji, e)}
          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border text-[11px] transition-all active:scale-90 ${
            myEmoji === emoji
              ? "bg-[#AE8F7D]/15 border-[#AE8F7D]/40"
              : "bg-[#EBE6DB]/50 border-[#AE8F7D]/10 hover:border-[#AE8F7D]/30"
          }`}
        >
          <span className={justPopped === emoji ? "emoji-pop" : ""}>{emoji}</span>
          <span className={`font-sans font-light text-[7.5px] ${myEmoji === emoji ? "text-[#AE8F7D]" : "text-[#454545]/40"}`}>{count}</span>
        </button>
      ))}
    </div>
  );
}

export function ThreadScreen() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const id = params.id ? parseInt(params.id, 10) : 0;
  const { addReaction, userReactions, savedMargins, toggleSaveMargin, currentUser, margins } = useApp();

  const [replyText, setReplyText] = useState("");
  const [localReplies, setLocalReplies] = useState<{ text: string; createdAt: string }[]>([]);
  const [justReacted, setJustReacted] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [focusMode, setFocusMode] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Look up from live AppContext margins first, fall back to MOCK_MARGINS
  const margin = margins.find((m) => m.id === id) ?? MOCK_MARGINS.find((m) => m.id === id);

  if (!margin) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="font-serif italic text-[#454545]/40">Post não encontrado.</p>
      </div>
    );
  }

  const ref = formatReference(margin);
  const reactions = margin.reactions as Record<string, number>;
  const myEmoji = userReactions[margin.id];
  const isSaved = savedMargins.includes(margin.id);
  const mockReplies = MOCK_REPLIES[margin.id] || [];
  const totalVoices = mockReplies.length + localReplies.length;
  const visibleMockReplies = showAllReplies ? mockReplies : mockReplies.slice(0, 2);
  const authorUsername = USER_USERNAME_MAP[margin.userId];
  const authorAvatarColor = margin.userId === currentUser.id
    ? (currentUser.avatarColor || "#697962")
    : MOCK_USERS.find((u) => u.id === margin.userId)?.avatarColor || "#697962";
  const authorAvatarId = margin.userId === currentUser.id
    ? currentUser.avatarId
    : USER_AVATAR_MAP[margin.userId];
  const reactionTop = Object.entries(reactions).sort(([, a], [, b]) => b - a);

  const handleReply = () => {
    if (!replyText.trim()) return;
    setLocalReplies((prev) => [...prev, { text: replyText.trim(), createdAt: new Date().toISOString() }]);
    setReplyText("");
  };

  const handleReact = (emoji: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    addReaction(margin.id, emoji);
    setJustReacted(emoji);
    setPickerOpen(false);
    setTimeout(() => setJustReacted(null), 600);
  };

  const focusInput = () => {
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (margin.userId !== currentUser.id) {
      const uname = USER_USERNAME_MAP[margin.userId]?.replace(/^@/, "");
      if (uname) navigate(`/perfil/${uname}`);
      else navigate(`/user/${margin.userId}`);
    }
  };

  return (
    <div className="min-h-full flex flex-col screen-enter" style={{ backgroundColor: "var(--background)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-4" style={{ borderBottom: "1px solid rgba(174,143,125,0.10)" }}>
        <Link href={`/book/${margin.bookId}`}>
          <button data-testid="button-back-thread" style={{ color: "var(--text-tertiary)" }} className="hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-serif italic text-[13px] truncate" style={{ color: "var(--text-secondary)" }}>{margin.bookTitle}</p>
          <p className="font-sans font-light text-[8px] tracking-[0.08em] uppercase" style={{ color: "var(--text-tertiary)" }}>{margin.bookAuthor}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            title={focusMode ? "Sair do modo foco" : "Modo foco"}
            onClick={() => setFocusMode((f) => !f)}
            className="transition-all active:scale-90"
            style={{ color: focusMode ? "#AE8F7D" : "var(--text-tertiary)", opacity: focusMode ? 1 : 0.5 }}
          >
            {focusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            data-testid="button-share-thread"
            onClick={() => setShareModalOpen(true)}
            className="opacity-30 hover:opacity-60 transition-opacity active:scale-90"
            style={{ color: "var(--text-primary)" }}
            title="Compartilhar post"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            data-testid="button-save-thread"
            onClick={() => toggleSaveMargin(margin.id)}
            className={`transition-all active:scale-90 ${isSaved ? "text-[#AE8F7D]" : "opacity-30 hover:opacity-60"}`}
            style={{ color: isSaved ? "#AE8F7D" : "var(--text-primary)" }}
            title={isSaved ? "Post salvo" : "Salvar post"}
          >
            {isSaved ? <BookmarkCheck className="w-4.5 h-4.5" /> : <Bookmark className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>
      {shareModalOpen && (
        <ShareCardModal context={{ type: "eco", margin }} onClose={() => setShareModalOpen(false)} />
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto pb-28 px-5 pt-5">

        {/* Main Margin */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[8px] font-light tracking-[0.18em] uppercase text-[#AE8F7D]">
              {marginTypeLabel(margin.postType)}
            </span>
            {ref && (
              <>
                <span className="text-[#AE8F7D]/30">·</span>
                <span className="font-sans font-light text-[8px] text-[#8C837A]">{ref}</span>
              </>
            )}
            <span className="ml-auto font-sans font-light text-[7px] text-[#8C837A]">{timeAgo(margin.createdAt)}</span>
          </div>

          <div className="border-l-2 border-[#AE8F7D]/55 pl-4 mb-4">
            <p className="font-serif italic text-[19px] leading-[1.65]" style={{ color: "var(--text-primary)" }}>
              &ldquo;{margin.excerpt}&rdquo;
            </p>
          </div>

          {margin.commentary && (
            <p className="font-sans text-[14px] leading-[1.7] mb-4" style={{ color: "var(--text-secondary)" }}>
              {margin.commentary}
            </p>
          )}

          {/* Author */}
          <div className="mb-5">
            <UserIdentity
              name={margin.userName}
              username={authorUsername ?? null}
              initials={margin.userInitials}
              avatarColor={authorAvatarColor}
              avatarId={authorAvatarId}
              userId={margin.userId !== currentUser.id ? margin.userId : null}
              onNavigate={margin.userId !== currentUser.id ? handleAuthorClick : undefined}
              size="md"
            />
          </div>

          {/* Compact Reaction Row + Full Picker — hidden in focus mode */}
          {!focusMode && <div className="rounded-[12px] p-3.5" style={{ backgroundColor: "var(--muted)", opacity: 0.9 }} onClick={(e) => e.stopPropagation()}>
            <p className="font-sans text-[7.5px] font-light tracking-[0.16em] uppercase text-[#454545]/38 mb-2.5">
              Como isso te afetou?
            </p>

            {/* Compact row: + button + existing reaction chips */}
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {/* + trigger */}
              <div ref={pickerRef} className="relative flex-shrink-0">
                {pickerOpen && (
                  <div
                    className="absolute bottom-full left-0 mb-2 bg-[#2A2A2A] rounded-[20px] px-3 py-2.5 flex gap-2.5 shadow-2xl z-50"
                    style={{ animation: "fadeScaleUp 0.15s ease" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {EMOJI_REACTIONS.map((r) => (
                      <button
                        key={r.emoji}
                        type="button"
                        onClick={(e) => handleReact(r.emoji, e)}
                        className={`text-[22px] leading-none transition-transform hover:scale-125 active:scale-95 ${r.emoji === myEmoji ? "scale-125 drop-shadow-sm" : ""} ${justReacted === r.emoji ? "emoji-pop" : ""}`}
                        title={r.label}
                      >
                        {r.emoji}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  data-testid="button-reaction-picker-thread"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPickerOpen((o) => !o); }}
                  className={`text-[14px] leading-none px-2 py-1 rounded-full border transition-all select-none ${
                    myEmoji
                      ? "bg-[#AE8F7D]/12 border-[#AE8F7D]/35"
                      : "border-dashed border-[#454545]/15 hover:border-[#AE8F7D]/30 text-[#454545]/35"
                  }`}
                >
                  {myEmoji ?? <span className="font-sans text-[11px]">＋</span>}
                </button>
              </div>

              {/* Reaction chips */}
              {reactionTop.map(([emoji, count]) => {
                const isMine = myEmoji === emoji;
                return (
                  <button
                    key={emoji}
                    type="button"
                    data-testid={`button-add-reaction-${emoji}`}
                    onClick={(e) => handleReact(emoji, e)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all active:scale-90 ${
                      justReacted === emoji
                        ? "scale-110 bg-[#AE8F7D]/20 border-[#AE8F7D]/50"
                        : isMine
                        ? "bg-[#AE8F7D]/18 border-[#AE8F7D]/45"
                        : "bg-[#EBE6DB]/80 border-[#AE8F7D]/20 hover:border-[#AE8F7D]/40"
                    }`}
                    title={EMOJI_REACTIONS.find((r) => r.emoji === emoji)?.label}
                  >
                    <span className={`text-[15px] leading-none ${justReacted === emoji ? "emoji-pop" : ""}`}>{emoji}</span>
                    <span className={`font-sans font-light text-[9px] ${isMine ? "text-[#AE8F7D]" : "text-[#454545]/50"}`}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Full emoji selector */}
            <div className="flex flex-wrap gap-2">
              {EMOJI_REACTIONS.map((r) => {
                const count = reactions[r.emoji] || 0;
                const isMine = myEmoji === r.emoji;
                return (
                  <button
                    key={r.emoji}
                    type="button"
                    data-testid={`button-add-reaction-${r.emoji}`}
                    onClick={(e) => handleReact(r.emoji, e)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all active:scale-90 ${
                      justReacted === r.emoji
                        ? "scale-125 bg-[#AE8F7D]/20 border-[#AE8F7D]/50"
                        : isMine
                        ? "bg-[#AE8F7D]/18 border-[#AE8F7D]/45 shadow-sm"
                        : count > 0
                        ? "bg-[#EBE6DB]/80 border-[#AE8F7D]/20 hover:border-[#AE8F7D]/40"
                        : "border-[#454545]/10 hover:border-[#AE8F7D]/25 hover:bg-[#EBE6DB]/50"
                    }`}
                    title={r.label}
                  >
                    <span className="text-[16px] leading-none">{r.emoji}</span>
                    <span className={`font-sans font-light text-[9px] ${isMine ? "text-[#AE8F7D]" : "text-[#5C5650]"}`}>
                      {r.label}
                    </span>
                    {count > 0 && (
                      <span className={`font-sans font-light text-[9px] ${isMine ? "text-[#AE8F7D]" : "text-[#8C837A]"}`}>
                        · {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {myEmoji && (
              <p className="font-sans font-light text-[8px] text-[#AE8F7D]/70 mt-2">
                Você reagiu com {myEmoji} ·{" "}
                <button onClick={(e) => handleReact(myEmoji, e)} className="underline underline-offset-2">remover</button>
              </p>
            )}
          </div>}

          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-3 px-0.5">
            <button
              data-testid="button-ecoar-main"
              onClick={focusInput}
              className="font-sans font-light text-[8.5px] tracking-[0.12em] uppercase text-[#454545]/45 hover:text-[#AE8F7D] transition-colors flex items-center gap-1.5"
            >
              <span className="text-[12px]">✍</span>
              Responder
            </button>
            <button
              onClick={() => toggleSaveMargin(margin.id)}
              className={`font-sans font-light text-[8.5px] tracking-[0.12em] uppercase transition-colors flex items-center gap-1.5 ${
                isSaved ? "text-[#AE8F7D]" : "text-[#454545]/45 hover:text-[#AE8F7D]"
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
              {isSaved ? "Salvo" : "Salvar post"}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(174,143,125,0.10)" }} />
          <span className="font-sans text-[7px] font-light tracking-[0.2em] uppercase text-[#AE8F7D]/55">
            {focusMode ? "Leitura" : "Vozes nesse trecho"}
            {!focusMode && totalVoices > 0 && <span className="ml-1" style={{ color: "var(--text-tertiary)", opacity: 0.5 }}>· {totalVoices}</span>}
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(174,143,125,0.10)" }} />
        </div>

        {/* Replies */}
        <div className="space-y-5">
          {mockReplies.length === 0 && localReplies.length === 0 && (
            <div className="text-center py-8">
              <p className="font-serif italic text-[14px] text-[#454545]/35 mb-1">Ainda não há vozes aqui.</p>
              <p className="font-sans font-light text-[10px] text-[#454545]/28 mb-4">O que isso abriu em você?</p>
              <button
                onClick={focusInput}
                className="font-sans font-light text-[9px] tracking-[0.14em] uppercase bg-[#454545] text-[#FAF8F3] px-5 py-2.5 rounded-[8px] hover:bg-[#454545]/90 transition-colors active:scale-95"
              >
                Ser a primeira voz
              </button>
            </div>
          )}

          {visibleMockReplies.map((reply) => {
            const replyUsername = USER_USERNAME_MAP[reply.userId];
            const isLong = reply.text.length > 240;
            const isExpanded = expandedReplies.has(reply.id);
            const displayText = isLong && !isExpanded
              ? reply.text.slice(0, 240).trimEnd() + "…"
              : reply.text;
            return (
              <div key={reply.id} className="space-y-1.5">
                <UserIdentity
                  name={reply.userName}
                  username={replyUsername ?? null}
                  initials={reply.userInitials}
                  avatarColor={reply.avatarColor}
                  avatarId={USER_AVATAR_MAP[reply.userId]}
                  userId={reply.userId !== currentUser.id ? reply.userId : null}
                  onNavigate={reply.userId !== currentUser.id ? (e) => { e.stopPropagation(); const u = USER_USERNAME_MAP[reply.userId]?.replace(/^@/, ""); if (u) navigate(`/perfil/${u}`); else navigate(`/user/${reply.userId}`); } : undefined}
                  timestamp={timeAgo(reply.createdAt)}
                />
                <div className="pl-7">
                  <p className="font-sans text-[14px] leading-[1.65]" style={{ color: "var(--text-primary)" }}>{displayText}</p>
                  {isLong && !isExpanded && (
                    <button
                      onClick={() => setExpandedReplies((prev) => new Set([...prev, reply.id]))}
                      className="font-sans font-light text-[10px] text-[#AE8F7D]/70 hover:text-[#AE8F7D] mt-0.5 transition-colors"
                    >
                      ver mais
                    </button>
                  )}
                  <CommentReactionBar commentId={reply.id} />
                </div>
              </div>
            );
          })}

          {!showAllReplies && mockReplies.length > 2 && (
            <button
              onClick={() => setShowAllReplies(true)}
              className="w-full font-sans font-light text-[9px] tracking-[0.12em] uppercase text-[#AE8F7D]/70 hover:text-[#AE8F7D] border border-[#AE8F7D]/15 rounded-[10px] py-2.5 transition-colors"
            >
              Mostrar todos os comentários · {mockReplies.length}
            </button>
          )}

          {localReplies.map((reply, i) => (
            <div key={`local-${i}`} className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <AvatarIcon avatarId={currentUser.avatarId} initials={currentUser.initials} size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="font-sans font-light text-[10.5px] text-[#2C2A27]">{currentUser.name}</span>
                  {currentUser.username && (
                    <span className="font-sans font-light text-[8.5px] text-[#8C837A]">@{currentUser.username}</span>
                  )}
                  <span className="font-sans font-light text-[8px] text-[#8C837A]">· agora</span>
                </div>
                <p className="font-sans text-[14px] leading-[1.65]" style={{ color: "var(--text-primary)" }}>{reply.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Input */}
      <div
        className="fixed bottom-0 left-0 right-0 backdrop-blur-md px-5 py-3 flex items-center gap-3 max-w-md mx-auto"
        style={{
          backgroundColor: "color-mix(in srgb, var(--background) 96%, transparent)",
          borderTop: "1px solid rgba(174,143,125,0.12)",
        }}
      >
        <AvatarIcon avatarId={currentUser.avatarId} initials={currentUser.initials} size={24} />
        <input
          ref={inputRef}
          data-testid="input-thread-reply"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleReply()}
          placeholder="Escreva um comentário…"
          className="flex-1 font-serif italic text-[14px] bg-transparent outline-none"
          style={{ color: "var(--text-primary)" }}
        />
        <button
          data-testid="button-send-reply"
          onClick={handleReply}
          disabled={!replyText.trim()}
          className="text-[#AE8F7D] disabled:text-[#AE8F7D]/25 transition-colors active:scale-90"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
