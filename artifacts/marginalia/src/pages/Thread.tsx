import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Send, BookmarkIcon } from "lucide-react";
import { useGetAnnotation, useAddReaction, getGetAnnotationQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const REACTIONS = [
  "Isso mudou minha visão",
  "Preciso pensar mais",
  "Genial",
  "Discordo completamente",
  "Me identifico profundamente",
];

const REACTIONS_STYLES: Record<string, string> = {
  "Isso mudou minha visão": "bg-[#454545] text-[#FAF8F3] border-transparent",
  "Preciso pensar mais": "bg-[#AE8F7D]/10 text-[#AE8F7D] border-[#AE8F7D]/25",
  "Genial": "bg-[#EBE6DB] text-[#454545]/65 border-[#AE8F7D]/20",
  "Discordo completamente": "bg-[#697962]/8 text-[#697962] border-[#697962]/20",
  "Me identifico profundamente": "bg-[#EBE6DB] text-[#454545]/65 border-[#AE8F7D]/20",
};

const TYPE_LABELS: Record<string, string> = {
  insight: "Insight",
  reaction: "Reação",
  theory: "Teoria",
  highlight: "Destaque",
};

export default function Thread() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "1", 10);
  const queryClient = useQueryClient();

  const { data: thread, isLoading } = useGetAnnotation(id, {
    query: { enabled: !!id, queryKey: getGetAnnotationQueryKey(id) },
  });
  const addReaction = useAddReaction();

  const [inputText, setInputText] = useState("");

  const handleReaction = async (reaction: string) => {
    await addReaction.mutateAsync({
      id,
      data: { reaction },
    });
    queryClient.invalidateQueries({ queryKey: getGetAnnotationQueryKey(id) });
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-[#FAF8F3] px-5 py-8">
        <div className="h-32 bg-[#EBE6DB] rounded-[14px] animate-pulse mb-4" />
        <div className="h-24 bg-[#EBE6DB] rounded-[14px] animate-pulse" />
      </div>
    );
  }

  const annotation = thread?.annotation;
  const replies = thread?.replies || [];

  if (!annotation) return null;

  const reactions = annotation.reactions as Record<string, number>;

  return (
    <div className="min-h-full bg-[#FAF8F3] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-4 border-b border-[#AE8F7D]/15">
        <Link href={`/book/${annotation.bookId}`}>
          <button data-testid="button-back-thread" className="text-[#454545]/50">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <span className="font-serif italic text-[13px] text-[#454545]/60 truncate">
            {annotation.bookTitle}
          </span>
        </div>
        <BookmarkIcon className="w-4 h-4 text-[#454545]/25" />
      </div>

      {/* Thread Content */}
      <div className="flex-1 overflow-auto pb-24">
        <div className="px-5 py-5">
          {/* Main Annotation */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[7px] font-light tracking-[0.18em] uppercase text-[#AE8F7D]">
                {TYPE_LABELS[annotation.type] || annotation.type}
              </span>
              <span className="text-[#AE8F7D]/30">·</span>
              <span className="font-sans font-light text-[7px] tracking-[0.06em] text-[#454545]/35">
                Cap. {annotation.chapter} · {Math.round(annotation.progressAt)}%
              </span>
            </div>

            <div className="border-l-2 border-[#AE8F7D]/60 pl-4 mb-4">
              <p className="font-serif italic text-[16px] text-[#3D3D3D] leading-relaxed">
                &ldquo;{annotation.excerpt}&rdquo;
              </p>
            </div>

            {annotation.note && (
              <p className="font-serif text-[14px] text-[#454545]/70 leading-relaxed mb-4">
                {annotation.note}
              </p>
            )}

            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#697962] flex items-center justify-center">
                <span className="font-sans text-[8px] font-light text-[#FAF8F3]">{annotation.userInitials}</span>
              </div>
              <span className="font-sans font-light text-[10px] tracking-[0.06em] text-[#AE8F7D]">
                {annotation.userName}
              </span>
              <span className="font-sans font-light text-[9px] text-[#454545]/30">· {annotation.createdAt.split("T")[0]}</span>
            </div>

            {/* Reactions Summary */}
            {Object.keys(reactions).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {Object.entries(reactions).map(([reaction, count]) => {
                  const style = REACTIONS_STYLES[reaction] || "bg-[#EBE6DB] text-[#454545]/65 border-[#AE8F7D]/20";
                  return (
                    <button
                      key={reaction}
                      data-testid={`chip-thread-reaction-${reaction}`}
                      onClick={() => handleReaction(reaction)}
                      className={`font-sans text-[7px] font-light px-2.5 py-1.5 rounded-full border transition-all hover:opacity-80 ${style}`}
                    >
                      {reaction} · {count}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Add Reactions */}
            <div className="flex flex-wrap gap-1.5">
              {REACTIONS.filter((r) => !reactions[r]).map((reaction) => (
                <button
                  key={reaction}
                  data-testid={`button-add-reaction-${reaction}`}
                  onClick={() => handleReaction(reaction)}
                  className="font-sans text-[7px] font-light px-2.5 py-1.5 rounded-full border border-[#454545]/12 text-[#454545]/40 hover:border-[#AE8F7D]/30 hover:text-[#AE8F7D] transition-colors"
                >
                  {reaction}
                </button>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-[#454545]/6 mb-5" />

          {/* Replies */}
          <div className="space-y-4">
            {replies.length === 0 && (
              <p className="font-serif italic text-[13px] text-[#454545]/35 text-center py-4">
                Nenhuma resposta ainda. Seja o primeiro a comentar.
              </p>
            )}
            {replies.map((reply) => (
              <div key={reply.id} data-testid={`reply-${reply.id}`} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#EBE6DB] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="font-sans text-[8px] font-light text-[#454545]/60">{reply.userInitials}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-sans font-light text-[10px] tracking-[0.06em] text-[#AE8F7D]">
                      {reply.userName}
                    </span>
                    <span className="font-sans font-light text-[8px] text-[#454545]/25">
                      · {reply.createdAt.split("T")[0]}
                    </span>
                  </div>
                  <p className="font-serif text-[13px] text-[#454545]/75 leading-relaxed">{reply.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Bar */}
      <div
        data-testid="thread-input-bar"
        className="fixed bottom-0 left-0 right-0 bg-[#FAF8F3]/95 backdrop-blur-md border-t border-[#AE8F7D]/20 px-5 py-3 flex items-center gap-3 max-w-md mx-auto"
      >
        <input
          data-testid="input-thread-reply"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escreva uma anotação..."
          className="flex-1 font-serif italic text-[13px] text-[#454545] placeholder:text-[#454545]/30 bg-transparent outline-none"
        />
        <button
          data-testid="button-send-reply"
          disabled={!inputText.trim()}
          className="text-[#AE8F7D] disabled:text-[#AE8F7D]/30 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
