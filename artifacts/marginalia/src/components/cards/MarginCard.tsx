import { useState } from "react";
import { Link } from "wouter";
import { Share2, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { canUserSeeMargin, getBlockedReason } from "@/utils/spoiler";
import { formatReference, marginTypeLabel, timeAgo } from "@/utils/formatting";
import type { Margin } from "@/data/mockData";
import { MOCK_BOOKS } from "@/data/mockData";
import { Shield } from "lucide-react";
import { MARGIN_TYPES } from "@/data/constants";

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
    const text = `"${margin.excerpt}"\n\n— ${margin.bookTitle}, ${margin.bookAuthor}\n\nvia Marginalia`;
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
      className="flex items-center gap-1 font-sans text-[8px] font-light tracking-[0.08em] text-[#454545]/30 hover:text-[#AE8F7D] transition-colors py-1 px-1"
    >
      {copied ? (
        <><Check className="w-3 h-3" /><span>Copiado</span></>
      ) : (
        <><Share2 className="w-3 h-3" /><span>Compartilhar</span></>
      )}
    </button>
  );
}

// Quote card — more elegant, centered around the excerpt
function QuoteCard({ margin, showBook, linkToThread, bookColor }: Props) {
  const { addReaction } = useApp();
  const ref = formatReference(margin);
  const content = (
    <div
      data-testid={`card-margin-${margin.id}`}
      className="border border-[#AE8F7D]/18 rounded-[14px] p-5 hover:border-[#AE8F7D]/35 transition-colors"
      style={{ backgroundColor: bookColor ? `${bookColor}CC` : "#EBE6DB4D" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-sans text-[7px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">✦ Citação favorita</span>
        <span className="font-sans font-light text-[7px] text-[#454545]/22">{timeAgo(margin.createdAt)}</span>
      </div>
      <div className="text-center py-2 mb-3">
        <p className="font-serif italic text-[18px] text-[#3D3D3D] leading-relaxed">
          &ldquo;{margin.excerpt}&rdquo;
        </p>
      </div>
      {showBook && (
        <p className="font-sans font-light text-[8px] tracking-[0.1em] uppercase text-[#454545]/35 text-center mb-3">
          {margin.bookTitle} {ref && `· ${ref}`}
        </p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#697962] flex items-center justify-center">
            <span className="font-sans text-[7px] text-[#FAF8F3]">{margin.userInitials}</span>
          </div>
          <span className="font-sans font-light text-[10px] text-[#AE8F7D]">{margin.userName}</span>
        </div>
        <ShareButton margin={margin} />
      </div>
    </div>
  );
  if (!linkToThread) return content;
  return <Link href={`/thread/${margin.id}`} className="block">{content}</Link>;
}

// Question card — dashed accent, inviting interaction
function QuestionCard({ margin, showBook, linkToThread, bookColor }: Props) {
  const { addReaction } = useApp();
  const ref = formatReference(margin);
  const content = (
    <div
      data-testid={`card-margin-${margin.id}`}
      className="border border-dashed border-[#AE8F7D]/30 rounded-[14px] p-4 hover:border-[#AE8F7D]/50 transition-colors"
      style={{ backgroundColor: bookColor ? `${bookColor}99` : "#FAF8F3" }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="font-sans text-[8px] font-light tracking-[0.18em] uppercase text-[#BDAB9C]">❓ Pergunta</span>
        {showBook && <><span className="text-[#AE8F7D]/25">·</span><span className="font-sans text-[8px] font-light text-[#454545]/35 truncate max-w-[100px]">{margin.bookTitle}</span></>}
        <span className="ml-auto font-sans text-[7px] font-light text-[#454545]/22">{timeAgo(margin.createdAt)}</span>
      </div>
      <div className="bg-[#FAF8F3] border-l-2 border-[#BDAB9C]/60 pl-3 mb-2.5">
        <p className="font-serif italic text-[14px] text-[#3D3D3D] leading-relaxed">
          &ldquo;{margin.excerpt}&rdquo;
        </p>
      </div>
      {margin.commentary && (
        <p className="font-serif text-[12px] text-[#454545]/65 leading-relaxed mb-2.5">{margin.commentary}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#BDAB9C] flex items-center justify-center">
            <span className="font-sans text-[7px] text-[#FAF8F3]">{margin.userInitials}</span>
          </div>
          <span className="font-sans font-light text-[10px] text-[#AE8F7D]">{margin.userName}</span>
          <span className="font-sans font-light text-[8px] text-[#454545]/25">· {margin.commentsCount} respostas</span>
        </div>
        <ShareButton margin={margin} />
      </div>
    </div>
  );
  if (!linkToThread) return content;
  return <Link href={`/thread/${margin.id}`} className="block">{content}</Link>;
}

// Theory card — more structured, academic feel
function TheoryCard({ margin, showBook, linkToThread, bookColor }: Props) {
  const ref = formatReference(margin);
  const totalReactions = Object.values(margin.reactions).reduce((a, b) => a + b, 0);
  const content = (
    <div
      data-testid={`card-margin-${margin.id}`}
      className="border-l-4 border-[#697962]/50 rounded-r-[14px] rounded-l-none p-4 hover:border-l-[#697962]/80 transition-all shadow-sm"
      style={{ backgroundColor: bookColor ? `${bookColor}99` : "#FAF8F3" }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="font-sans text-[8px] font-light tracking-[0.18em] uppercase text-[#697962]">🔭 Teoria</span>
        {showBook && <><span className="text-[#697962]/25">·</span><span className="font-sans text-[8px] font-light text-[#454545]/35 truncate max-w-[90px]">{margin.bookTitle}</span></>}
        <span className="ml-auto font-sans text-[7px] font-light text-[#454545]/22">{timeAgo(margin.createdAt)}</span>
      </div>
      <p className="font-serif italic text-[12px] text-[#454545]/50 border-l border-[#697962]/25 pl-2.5 mb-2.5 leading-relaxed line-clamp-2">
        &ldquo;{margin.excerpt}&rdquo;
      </p>
      {margin.commentary && (
        <p className="font-serif text-[13px] text-[#3D3D3D]/75 leading-relaxed mb-3">{margin.commentary}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#697962] flex items-center justify-center">
            <span className="font-sans text-[7px] text-[#FAF8F3]">{margin.userInitials}</span>
          </div>
          <span className="font-sans font-light text-[10px] text-[#AE8F7D]">{margin.userName}</span>
          {totalReactions > 0 && <span className="font-sans font-light text-[8px] text-[#454545]/25">· {totalReactions} reações</span>}
        </div>
        <ShareButton margin={margin} />
      </div>
    </div>
  );
  if (!linkToThread) return content;
  return <Link href={`/thread/${margin.id}`} className="block">{content}</Link>;
}

// Standard card for insight, reaction, critique, personal_connection, symbolic_reading
function StandardCard({ margin, showBook, linkToThread, bookColor }: Props) {
  const { addReaction } = useApp();
  const ref = formatReference(margin);
  const totalReactions = Object.values(margin.reactions).reduce((a, b) => a + b, 0);
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
      className="rounded-[14px] border border-[#AE8F7D]/15 p-4 hover:border-[#AE8F7D]/30 transition-colors"
      style={{ backgroundColor: bookColor ? `${bookColor}99` : "#FAF8F3" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={`font-sans text-[8px] font-light tracking-[0.18em] uppercase ${typeColor} flex items-center gap-1`}>
          <span>{typeIcon}</span>
          <span>{marginTypeLabel(margin.postType)}</span>
        </span>
        {ref && <><span className="text-[#AE8F7D]/25">·</span><span className="font-sans text-[8px] font-light text-[#454545]/35">{ref}</span></>}
        {showBook && <><span className="text-[#AE8F7D]/25">·</span><span className="font-sans text-[8px] font-light text-[#454545]/35 truncate max-w-[100px]">{margin.bookTitle}</span></>}
        <span className="ml-auto font-sans text-[7px] font-light text-[#454545]/22 flex-shrink-0">{timeAgo(margin.createdAt)}</span>
      </div>
      <div className="border-l-2 border-[#AE8F7D]/45 pl-3 mb-3">
        <p className="font-serif italic text-[14px] text-[#3D3D3D] leading-relaxed">
          &ldquo;{margin.excerpt}&rdquo;
        </p>
      </div>
      {margin.commentary && (
        <p className="font-serif text-[12px] text-[#454545]/60 leading-relaxed mb-3">{margin.commentary}</p>
      )}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-[#697962] flex items-center justify-center flex-shrink-0">
          <span className="font-sans text-[7px] text-[#FAF8F3]">{margin.userInitials}</span>
        </div>
        <span className="font-sans font-light text-[10px] text-[#AE8F7D]">{margin.userName}</span>
        <span className="font-sans font-light text-[8px] text-[#454545]/25">· {margin.commentsCount} eco{margin.commentsCount !== 1 ? "s" : ""}</span>
        {totalReactions > 0 && (
          <span className="font-sans font-light text-[8px] text-[#454545]/25">· {totalReactions} reações</span>
        )}
      </div>
      {Object.keys(margin.reactions).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {Object.entries(margin.reactions)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([reaction, count]) => (
              <button
                key={reaction}
                data-testid={`chip-reaction-${margin.id}-${reaction}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addReaction(margin.id, reaction); }}
                className="font-sans text-[7px] font-light px-2.5 py-1 rounded-full bg-[#EBE6DB] text-[#454545]/60 border border-[#AE8F7D]/12 hover:border-[#AE8F7D]/40 hover:bg-[#AE8F7D]/5 transition-colors"
              >
                {reaction} · {count}
              </button>
            ))}
        </div>
      )}
      <div className="flex justify-end pt-1 border-t border-[#454545]/5">
        <ShareButton margin={margin} />
      </div>
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
          <p className="font-serif italic text-[14px] text-[#3D3D3D]/70 leading-relaxed">&ldquo;{margin.excerpt}&rdquo;</p>
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
          <p className="font-serif italic text-[13px] text-[#454545]/55 mb-1">Trecho ocultado para preservar sua leitura</p>
          <p className="font-sans font-light text-[10px] text-[#454545]/38 leading-relaxed mb-3">{reason}</p>
          <div className="flex gap-2 flex-wrap">
            <button className="font-sans text-[8px] font-light tracking-[0.1em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/25 px-3 py-1.5 rounded-full hover:bg-[#AE8F7D]/5 transition-colors">
              Atualizar progresso
            </button>
            <button onClick={() => setRevealed(true)} className="font-sans text-[8px] font-light tracking-[0.1em] uppercase text-[#454545]/38 px-3 py-1.5 hover:text-[#454545]/60 transition-colors">
              Ver mesmo assim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
