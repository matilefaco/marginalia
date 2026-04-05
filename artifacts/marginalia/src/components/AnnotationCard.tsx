import { Link } from "wouter";
import type { Annotation } from "@workspace/api-client-react";

const REACTIONS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "Isso mudou minha visão": {
    bg: "bg-[#454545]",
    text: "text-[#FAF8F3]",
    border: "border-transparent",
  },
  "Preciso pensar mais": {
    bg: "bg-[#AE8F7D]/10",
    text: "text-[#AE8F7D]",
    border: "border-[#AE8F7D]/25",
  },
  "Genial": {
    bg: "bg-[#EBE6DB]",
    text: "text-[#454545]/65",
    border: "border-[#AE8F7D]/20",
  },
  "Discordo completamente": {
    bg: "bg-[#697962]/8",
    text: "text-[#697962]",
    border: "border-[#697962]/20",
  },
  "Me identifico profundamente": {
    bg: "bg-[#EBE6DB]",
    text: "text-[#454545]/65",
    border: "border-[#AE8F7D]/20",
  },
};

const TYPE_LABELS: Record<string, string> = {
  insight: "Insight",
  reaction: "Reação",
  theory: "Teoria",
  highlight: "Destaque",
};

interface AnnotationCardProps {
  annotation: Annotation;
  showBook?: boolean;
}

export function AnnotationCard({ annotation, showBook = false }: AnnotationCardProps) {
  const reactions = annotation.reactions as Record<string, number>;

  return (
    <Link
      href={`/thread/${annotation.id}`}
      data-testid={`card-annotation-${annotation.id}`}
      className="block"
    >
      <div className="bg-[#FAF8F3] rounded-[12px] border border-[#AE8F7D]/15 p-4 hover:border-[#AE8F7D]/30 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-sans text-[7px] font-light tracking-[0.18em] uppercase text-[#AE8F7D]">
            {TYPE_LABELS[annotation.type] || annotation.type}
          </span>
          <span className="text-[#AE8F7D]/30">·</span>
          <span className="font-sans text-[7px] font-light tracking-[0.06em] text-[#454545]/35">
            Cap. {annotation.chapter} · {Math.round(annotation.progressAt)}%
          </span>
          {showBook && (
            <>
              <span className="text-[#AE8F7D]/30">·</span>
              <span className="font-sans text-[7px] font-light tracking-[0.06em] text-[#454545]/35 truncate">
                {annotation.bookTitle}
              </span>
            </>
          )}
        </div>

        <p
          className="font-serif italic text-[13px] text-[#3D3D3D] leading-relaxed mb-2 border-l-2 border-[#AE8F7D]/50 pl-3"
          data-testid={`text-excerpt-${annotation.id}`}
        >
          &ldquo;{annotation.excerpt}&rdquo;
        </p>

        {annotation.note && (
          <p className="font-serif text-[12px] text-[#454545]/70 leading-relaxed mb-3">
            {annotation.note}
          </p>
        )}

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#697962] flex items-center justify-center flex-shrink-0">
            <span className="font-sans text-[7px] font-light text-[#FAF8F3]">
              {annotation.userInitials}
            </span>
          </div>
          <span className="font-sans font-light text-[9px] tracking-[0.06em] text-[#AE8F7D]">
            {annotation.userName}
          </span>
          <span className="font-sans font-light text-[9px] text-[#454545]/30">
            · {annotation.replyCount} respostas
          </span>
        </div>

        {Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {Object.entries(reactions).map(([reaction, count]) => {
              const style = REACTIONS_STYLES[reaction] || {
                bg: "bg-[#EBE6DB]",
                text: "text-[#454545]/65",
                border: "border-[#AE8F7D]/20",
              };
              return (
                <span
                  key={reaction}
                  data-testid={`chip-reaction-${annotation.id}-${reaction}`}
                  className={`font-sans text-[7px] font-light px-2 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}
                >
                  {reaction} · {count}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}
