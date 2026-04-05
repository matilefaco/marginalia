import { Link } from "wouter";
import { useApp } from "@/context/AppContext";
import { canUserSeeMargin, getBlockedReason } from "@/utils/spoiler";
import { formatReference, marginTypeLabel, timeAgo } from "@/utils/formatting";
import type { Margin } from "@/data/mockData";
import { Shield } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  insight: "text-[#697962]",
  theory: "text-[#AE8F7D]",
  critique: "text-[#454545]",
  question: "text-[#BDAB9C]",
  reaction: "text-[#AE8F7D]",
  favorite_quote: "text-[#697962]",
  personal_connection: "text-[#AE8F7D]",
  symbolic_reading: "text-[#454545]",
};

interface Props {
  margin: Margin;
  showBook?: boolean;
  linkToThread?: boolean;
}

export function MarginCard({ margin, showBook = false, linkToThread = true }: Props) {
  const { currentUser, getProgressForBook, addReaction } = useApp();
  const progress = getProgressForBook(margin.bookId);
  const canSee = canUserSeeMargin(margin, currentUser.spoilerPreference, progress);

  if (!canSee) {
    return <SpoilerShieldCard margin={margin} reason={getBlockedReason(margin, progress)} />;
  }

  const ref = formatReference(margin);
  const typeColor = TYPE_COLORS[margin.postType] || "text-[#AE8F7D]";

  const content = (
    <div
      data-testid={`card-margin-${margin.id}`}
      className="bg-[#FAF8F3] rounded-[12px] border border-[#AE8F7D]/15 p-4 hover:border-[#AE8F7D]/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`font-sans text-[8px] font-light tracking-[0.18em] uppercase ${typeColor}`}>
          {marginTypeLabel(margin.postType)}
        </span>
        {ref && (
          <>
            <span className="text-[#AE8F7D]/30">·</span>
            <span className="font-sans text-[8px] font-light text-[#454545]/35">{ref}</span>
          </>
        )}
        {showBook && (
          <>
            <span className="text-[#AE8F7D]/30">·</span>
            <span className="font-sans text-[8px] font-light text-[#454545]/35 truncate">
              {margin.bookTitle}
            </span>
          </>
        )}
        <span className="ml-auto font-sans text-[7px] font-light text-[#454545]/25">
          {timeAgo(margin.createdAt)}
        </span>
      </div>

      <p className="font-serif italic text-[13px] text-[#3D3D3D] leading-relaxed mb-2 border-l-2 border-[#AE8F7D]/45 pl-3">
        &ldquo;{margin.excerpt}&rdquo;
      </p>

      {margin.commentary && (
        <p className="font-serif text-[12px] text-[#454545]/65 leading-relaxed mb-3">
          {margin.commentary}
        </p>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full bg-[#697962] flex items-center justify-center flex-shrink-0">
          <span className="font-sans text-[7px] text-[#FAF8F3]">{margin.userInitials}</span>
        </div>
        <span className="font-sans font-light text-[9px] text-[#AE8F7D]">{margin.userName}</span>
        <span className="font-sans font-light text-[8px] text-[#454545]/25">
          · {margin.commentsCount} eco{margin.commentsCount !== 1 ? "s" : ""}
        </span>
      </div>

      {Object.keys(margin.reactions).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(margin.reactions)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([reaction, count]) => (
              <button
                key={reaction}
                data-testid={`chip-reaction-${margin.id}-${reaction}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addReaction(margin.id, reaction);
                }}
                className="font-sans text-[7px] font-light px-2 py-1 rounded-full bg-[#EBE6DB] text-[#454545]/60 border border-[#AE8F7D]/15 hover:border-[#AE8F7D]/40 transition-colors"
              >
                {reaction} · {count}
              </button>
            ))}
        </div>
      )}
    </div>
  );

  if (!linkToThread) return content;

  return (
    <Link href={`/thread/${margin.id}`} className="block">
      {content}
    </Link>
  );
}

function SpoilerShieldCard({
  margin,
  reason,
}: {
  margin: Margin;
  reason: string;
}) {
  return (
    <div
      data-testid={`card-spoiler-shield-${margin.id}`}
      className="rounded-[12px] border border-[#AE8F7D]/10 p-4 bg-[#EBE6DB]/30"
      style={{
        backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(174,143,125,0.04) 3px, rgba(174,143,125,0.04) 4px)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#EBE6DB] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Shield className="w-3.5 h-3.5 text-[#AE8F7D]/60" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif italic text-[12px] text-[#454545]/50 mb-1">
            Trecho ocultado para preservar sua leitura
          </p>
          <p className="font-sans font-light text-[10px] text-[#454545]/35 leading-relaxed mb-3">
            {reason}
          </p>
          <div className="flex gap-2">
            <button className="font-sans text-[8px] font-light tracking-[0.08em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/25 px-3 py-1.5 rounded-full hover:bg-[#AE8F7D]/5 transition-colors">
              Atualizar progresso
            </button>
            <button className="font-sans text-[8px] font-light tracking-[0.08em] uppercase text-[#454545]/40 px-3 py-1.5 hover:text-[#454545]/60 transition-colors">
              Liberar mesmo assim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
