import { useState } from "react";
import { Link } from "wouter";
import { Share2, Check, MessageCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { canUserSeeMargin, getBlockedReason } from "@/utils/spoiler";
import { formatReference, marginTypeLabel, timeAgo } from "@/utils/formatting";
import type { Margin } from "@/data/mockData";
import { MOCK_BOOKS } from "@/data/mockData";
import { Shield } from "lucide-react";
import { MARGIN_TYPES, EMOJI_REACTIONS } from "@/data/constants";

interface Props {
  margin: Margin;
  showBook?: boolean;
  linkToThread?: boolean;
  bookColor?: string;
}

function ShareButton({ margin }: { margin: Margin }) {
  const [copied, setCopied] = useState(false);
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const typeLabel = MARGIN_TYPES.find((t) => t.id === margin.postType)?.label || "Margem";
    const text = [
      `"${margin.excerpt}"`,
      ``,
      `— ${margin.bookTitle}`,
      `${margin.bookAuthor}`,
      ``,
      `@${margin.userName.replace("@", "")} · ${typeLabel}`,
      ``,
      `marginalia — leia junto`,
    ].join("\n");
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      data-testid={`button-share-margin-${margin.id}`}
      onClick={handleShare}
      className="flex items-center gap-1 font-sans text-[7.5px] font-light tracking-[0.06em] text-[#454545]/28 hover:text-[#AE8F7D] transition-colors py-1 px-1"
    >
      {copied ? (
        <><Check className="w-3 h-3" /><span>Copiado</span></>
      ) : (
        <Share2 className="w-3 h-3" />
      )}
    </button>
  );
}

function EmojiReactionBar({ margin, onEcoarClick, compact = false }: { margin: Margin; onEcoarClick?: () => void; compact?: boolean }) {
  const { addReaction } = useApp();
  const [justReacted, setJustReacted] = useState<string | null>(null);
  const reactions = margin.reactions as Record<string, number>;
  const topReactions = Object.entries(reactions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, compact ? 3 : 6);
  const notReacted = EMOJI_REACTIONS.filter((r) => !(r.emoji in reactions));

  const handleReact = (e: React.MouseEvent, emoji: string) => {
    e.preventDefault();
    e.stopPropagation();
    addReaction(margin.id, emoji);
    setJustReacted(emoji);
    setTimeout(() => setJustReacted(null), 600);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {topReactions.map(([emoji, count]) => (
        <button
          key={emoji}
          data-testid={`chip-reaction-${margin.id}-${emoji}`}
          onClick={(e) => handleReact(e, emoji)}
          style={{ transition: "transform 0.15s ease, background 0.15s" }}
          className={`flex items-center gap-1 text-[14px] leading-none px-2 py-1 rounded-full bg-[#EBE6DB]/70 border border-[#AE8F7D]/12 hover:bg-[#AE8F7D]/10 hover:border-[#AE8F7D]/30 active:scale-90 ${
            justReacted === emoji ? "scale-125 bg-[#AE8F7D]/15" : "scale-100"
          }`}
        >
          <span>{emoji}</span>
          <span className="font-sans font-light text-[9px] text-[#454545]/55">{count}</span>
        </button>
      ))}
      {!compact && notReacted.slice(0, 2).map((r) => (
        <button
          key={r.emoji}
          data-testid={`button-add-emoji-${margin.id}-${r.emoji}`}
          onClick={(e) => handleReact(e, r.emoji)}
          className="text-[14px] leading-none px-2 py-1 rounded-full border border-dashed border-[#454545]/10 opacity-40 hover:opacity-70 hover:border-[#AE8F7D]/30 transition-all active:scale-90"
          title={r.label}
        >
          {r.emoji}
        </button>
      ))}
    </div>
  );
}

interface EcoarBarProps {
  margin: Margin;
  linkToThread?: boolean;
  avatarColor?: string;
}

function EcoarBar({ margin, linkToThread, avatarColor = "#697962" }: EcoarBarProps) {
  const totalReactions = Object.values(margin.reactions as Record<string, number>).reduce((a, b) => a + b, 0);
  const ecoarContent = (
    <button
      data-testid={`button-ecoar-${margin.id}`}
      onClick={(e) => { if (!linkToThread) { e.preventDefault(); e.stopPropagation(); } }}
      className="flex items-center gap-1.5 font-sans text-[8.5px] font-light tracking-[0.1em] text-[#454545]/45 hover:text-[#AE8F7D] transition-colors"
    >
      <MessageCircle className="w-3 h-3" />
      <span>Ecoar</span>
      {margin.commentsCount > 0 && (
        <span className="text-[#454545]/28">· {margin.commentsCount}</span>
      )}
    </button>
  );

  return (
    <div className="pt-2.5 border-t border-[#454545]/6 mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            <span className="font-sans text-[7px] text-[#FAF8F3]">{margin.userInitials}</span>
          </div>
          <span className="font-sans font-light text-[10px] text-[#AE8F7D]">{margin.userName}</span>
          {totalReactions >= 8 && (
            <span className="font-sans text-[7px] text-[#AE8F7D]/60" title="Trecho muito ativo">🔥</span>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {ecoarContent}
          <ShareButton margin={margin} />
        </div>
      </div>
    </div>
  );
}

function QuoteCard({ margin, showBook, linkToThread, bookColor }: Props) {
  const ref = formatReference(margin);
  const content = (
    <div
      data-testid={`card-margin-${margin.id}`}
      className="border border-[#AE8F7D]/18 rounded-[14px] p-5 hover:border-[#AE8F7D]/35 transition-colors"
      style={{ backgroundColor: bookColor ? `${bookColor}CC` : "#EBE6DB4D" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-sans text-[7.5px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">✦ Citação favorita</span>
        <span className="font-sans font-light text-[7px] text-[#454545]/25">{timeAgo(margin.createdAt)}</span>
      </div>
      <div className="text-center py-3 mb-3">
        <p className="font-serif italic text-[19px] text-[#2A2A2A] leading-[1.65]">
          &ldquo;{margin.excerpt}&rdquo;
        </p>
      </div>
      {showBook && (
        <p className="font-sans font-light text-[8.5px] tracking-[0.1em] uppercase text-[#454545]/40 text-center mb-3">
          {margin.bookTitle} {ref && `· ${ref}`}
        </p>
      )}
      <div className="mb-2.5">
        <EmojiReactionBar margin={margin} compact />
      </div>
      <EcoarBar margin={margin} linkToThread={linkToThread} avatarColor="#697962" />
    </div>
  );
  if (!linkToThread) return content;
  return <Link href={`/thread/${margin.id}`} className="block">{content}</Link>;
}

function QuestionCard({ margin, showBook, linkToThread, bookColor }: Props) {
  const ref = formatReference(margin);
  const content = (
    <div
      data-testid={`card-margin-${margin.id}`}
      className="border border-dashed border-[#AE8F7D]/30 rounded-[14px] p-4 hover:border-[#AE8F7D]/50 transition-colors"
      style={{ backgroundColor: bookColor ? `${bookColor}99` : "#FAF8F3" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="font-sans text-[8px] font-light tracking-[0.18em] uppercase text-[#BDAB9C]">❓ Pergunta</span>
        {showBook && <><span className="text-[#AE8F7D]/25">·</span><span className="font-sans text-[8px] font-light text-[#454545]/45 truncate max-w-[100px]">{margin.bookTitle}</span></>}
        <span className="ml-auto font-sans text-[7px] font-light text-[#454545]/25">{timeAgo(margin.createdAt)}</span>
      </div>
      <div className="bg-[#FAF8F3]/80 border-l-2 border-[#BDAB9C]/60 pl-3 mb-3">
        <p className="font-serif italic text-[15px] text-[#2A2A2A] leading-[1.65]">
          &ldquo;{margin.excerpt}&rdquo;
        </p>
      </div>
      {margin.commentary && (
        <p className="font-serif text-[13px] text-[#454545]/72 leading-[1.7] mb-3">{margin.commentary}</p>
      )}
      <div className="mb-2">
        <EmojiReactionBar margin={margin} compact />
      </div>
      <EcoarBar margin={margin} linkToThread={linkToThread} avatarColor="#BDAB9C" />
    </div>
  );
  if (!linkToThread) return content;
  return <Link href={`/thread/${margin.id}`} className="block">{content}</Link>;
}

function TheoryCard({ margin, showBook, linkToThread, bookColor }: Props) {
  const totalReactions = Object.values(margin.reactions as Record<string, number>).reduce((a, b) => a + b, 0);
  const ref = formatReference(margin);
  const content = (
    <div
      data-testid={`card-margin-${margin.id}`}
      className="border-l-4 border-[#697962]/50 rounded-r-[14px] rounded-l-none p-4 hover:border-l-[#697962]/80 transition-all shadow-sm"
      style={{ backgroundColor: bookColor ? `${bookColor}99` : "#FAF8F3" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="font-sans text-[8px] font-light tracking-[0.18em] uppercase text-[#697962]">🔭 Teoria</span>
        {showBook && <><span className="text-[#697962]/25">·</span><span className="font-sans text-[8px] font-light text-[#454545]/45 truncate max-w-[90px]">{margin.bookTitle}</span></>}
        <span className="ml-auto font-sans text-[7px] font-light text-[#454545]/25">{timeAgo(margin.createdAt)}</span>
      </div>
      <p className="font-serif italic text-[13px] text-[#454545]/60 border-l border-[#697962]/25 pl-2.5 mb-3 leading-[1.65] line-clamp-2">
        &ldquo;{margin.excerpt}&rdquo;
      </p>
      {margin.commentary && (
        <p className="font-serif text-[14px] text-[#2A2A2A]/80 leading-[1.7] mb-3">{margin.commentary}</p>
      )}
      <div className="mb-2">
        <EmojiReactionBar margin={margin} compact />
      </div>
      {totalReactions > 0 && (
        <p className="font-sans font-light text-[8px] text-[#697962]/55 mb-2">{totalReactions} leitores ecoaram isso</p>
      )}
      <EcoarBar margin={margin} linkToThread={linkToThread} avatarColor="#697962" />
    </div>
  );
  if (!linkToThread) return content;
  return <Link href={`/thread/${margin.id}`} className="block">{content}</Link>;
}

function StandardCard({ margin, showBook, linkToThread, bookColor }: Props) {
  const totalReactions = Object.values(margin.reactions as Record<string, number>).reduce((a, b) => a + b, 0);
  const ref = formatReference(margin);
  const typeIcon = MARGIN_TYPES.find((t) => t.id === margin.postType)?.icon || "";

  const TYPE_COLORS: Record<string, string> = {
    insight: "text-[#697962]",
    reaction: "text-[#AE8F7D]",
    critique: "text-[#454545]/70",
    personal_connection: "text-[#AE8F7D]",
    symbolic_reading: "text-[#697962]",
  };
  const typeColor = TYPE_COLORS[margin.postType] || "text-[#AE8F7D]";

  const content = (
    <div
      data-testid={`card-margin-${margin.id}`}
      className="rounded-[14px] border border-[#AE8F7D]/15 p-5 hover:border-[#AE8F7D]/30 transition-colors"
      style={{ backgroundColor: bookColor ? `${bookColor}99` : "#FAF8F3" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`font-sans text-[8px] font-light tracking-[0.18em] uppercase ${typeColor} flex items-center gap-1`}>
          <span>{typeIcon}</span>
          <span>{marginTypeLabel(margin.postType)}</span>
        </span>
        {ref && <><span className="text-[#AE8F7D]/25">·</span><span className="font-sans text-[8px] font-light text-[#454545]/45">{ref}</span></>}
        {showBook && <><span className="text-[#AE8F7D]/25">·</span><span className="font-sans text-[8px] font-light text-[#454545]/45 truncate max-w-[100px]">{margin.bookTitle}</span></>}
        <span className="ml-auto font-sans text-[7px] font-light text-[#454545]/25 flex-shrink-0">{timeAgo(margin.createdAt)}</span>
      </div>
      <div className="border-l-2 border-[#AE8F7D]/45 pl-3 mb-3.5">
        <p className="font-serif italic text-[15px] text-[#2A2A2A] leading-[1.7]">
          &ldquo;{margin.excerpt}&rdquo;
        </p>
      </div>
      {margin.commentary && (
        <p className="font-serif text-[13px] text-[#454545]/72 leading-[1.7] mb-3.5">{margin.commentary}</p>
      )}
      <div className="mb-2.5">
        <EmojiReactionBar margin={margin} />
      </div>
      {totalReactions > 0 && (
        <p className="font-sans font-light text-[8px] text-[#454545]/35 mb-1">
          {totalReactions} {totalReactions === 1 ? "leitor ecoou" : "leitores ecoaram"} isso
        </p>
      )}
      <EcoarBar margin={margin} linkToThread={linkToThread} avatarColor="#697962" />
    </div>
  );
  if (!linkToThread) return content;
  return <Link href={`/thread/${margin.id}`} className="block">{content}</Link>;
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

function SpoilerShieldCard({ margin, reason }: { margin: Margin; reason: string }) {
  const [revealed, setRevealed] = useState(false);
  if (revealed) {
    return (
      <div data-testid={`card-margin-${margin.id}-revealed`} className="bg-[#FAF8F3] rounded-[14px] border border-[#AE8F7D]/20 p-4 opacity-80">
        <div className="border-l-2 border-[#AE8F7D]/30 pl-3 mb-2">
          <p className="font-serif italic text-[15px] text-[#2A2A2A]/75 leading-[1.65]">&ldquo;{margin.excerpt}&rdquo;</p>
        </div>
        <p className="font-sans font-light text-[8px] text-[#AE8F7D]/60 tracking-[0.08em]">Conteúdo liberado manualmente</p>
      </div>
    );
  }
  return (
    <div
      data-testid={`card-spoiler-shield-${margin.id}`}
      className="rounded-[14px] border border-[#AE8F7D]/10 p-4 bg-[#EBE6DB]/25"
      style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(174,143,125,0.03) 4px, rgba(174,143,125,0.03) 5px)" }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#EBE6DB] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Shield className="w-3.5 h-3.5 text-[#AE8F7D]/60" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif italic text-[14px] text-[#454545]/60 mb-1">Trecho ocultado para preservar sua leitura</p>
          <p className="font-sans font-light text-[11px] text-[#454545]/45 leading-relaxed mb-3">{reason}</p>
          <div className="flex gap-2 flex-wrap">
            <button className="font-sans text-[8px] font-light tracking-[0.1em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/25 px-3 py-1.5 rounded-full hover:bg-[#AE8F7D]/5 transition-colors">
              Atualizar progresso
            </button>
            <button onClick={() => setRevealed(true)} className="font-sans text-[8px] font-light tracking-[0.1em] uppercase text-[#454545]/45 px-3 py-1.5 hover:text-[#454545]/65 transition-colors">
              Ver mesmo assim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
