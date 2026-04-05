import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, Send, Bookmark } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { MOCK_MARGINS } from "@/data/mockData";
import { REACTION_TYPES } from "@/data/constants";
import { formatReference, marginTypeLabel, timeAgo } from "@/utils/formatting";

const REACTION_STYLES: Record<string, string> = {
  "Isso mudou minha visão": "bg-[#454545] text-[#FAF8F3] border-transparent",
  "Me atravessou": "bg-[#AE8F7D]/10 text-[#AE8F7D] border-[#AE8F7D]/25",
  "Belo demais": "bg-[#697962]/8 text-[#697962] border-[#697962]/20",
  "Preciso pensar mais nisso": "bg-[#EBE6DB] text-[#454545]/60 border-[#AE8F7D]/15",
  "Me identifiquei profundamente": "bg-[#EBE6DB] text-[#454545]/60 border-[#AE8F7D]/15",
  "Quero reler esse trecho": "bg-[#697962]/8 text-[#697962] border-[#697962]/20",
  "Discordo, mas amei ler": "bg-[#EBE6DB] text-[#454545]/60 border-[#AE8F7D]/15",
  "Isso abriu uma teoria": "bg-[#454545]/5 text-[#454545] border-[#454545]/12",
};

export function ThreadScreen() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "1", 10);
  const { addReaction, currentUser } = useApp();

  const [replyText, setReplyText] = useState("");
  const [localReplies, setLocalReplies] = useState<{ text: string; createdAt: string }[]>([]);

  const margin = MOCK_MARGINS.find((m) => m.id === id);

  if (!margin) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <p className="font-serif italic text-[#454545]/40">Margem não encontrada.</p>
      </div>
    );
  }

  const ref = formatReference(margin);
  const reactions = margin.reactions as Record<string, number>;

  const handleReply = () => {
    if (!replyText.trim()) return;
    setLocalReplies((prev) => [
      ...prev,
      { text: replyText.trim(), createdAt: new Date().toISOString() },
    ]);
    setReplyText("");
  };

  return (
    <div className="min-h-full bg-[#FAF8F3] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-4 border-b border-[#AE8F7D]/12">
        <Link href={`/book/${margin.bookId}`}>
          <button data-testid="button-back-thread" className="text-[#454545]/40">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-serif italic text-[13px] text-[#454545]/55 truncate">{margin.bookTitle}</p>
          <p className="font-sans font-light text-[8px] tracking-[0.08em] uppercase text-[#454545]/30">
            {margin.bookAuthor}
          </p>
        </div>
        <Bookmark className="w-4 h-4 text-[#454545]/20" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-24 px-5 pt-5">
        {/* Main Margin */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[8px] font-light tracking-[0.18em] uppercase text-[#AE8F7D]">
              {marginTypeLabel(margin.postType)}
            </span>
            {ref && (
              <>
                <span className="text-[#AE8F7D]/30">·</span>
                <span className="font-sans font-light text-[8px] text-[#454545]/30">{ref}</span>
              </>
            )}
          </div>

          <div className="border-l-2 border-[#AE8F7D]/55 pl-4 mb-4">
            <p className="font-serif italic text-[18px] text-[#3D3D3D] leading-relaxed">
              &ldquo;{margin.excerpt}&rdquo;
            </p>
          </div>

          {margin.commentary && (
            <p className="font-serif text-[14px] text-[#454545]/65 leading-relaxed mb-4">
              {margin.commentary}
            </p>
          )}

          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-[#697962] flex items-center justify-center">
              <span className="font-sans text-[9px] text-[#FAF8F3]">{margin.userInitials}</span>
            </div>
            <span className="font-sans font-light text-[11px] text-[#AE8F7D]">{margin.userName}</span>
            <span className="font-sans font-light text-[9px] text-[#454545]/25">· {timeAgo(margin.createdAt)}</span>
          </div>

          {/* Active Reactions */}
          {Object.keys(reactions).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {Object.entries(reactions).map(([reaction, count]) => {
                const style = REACTION_STYLES[reaction] || "bg-[#EBE6DB] text-[#454545]/55 border-[#AE8F7D]/15";
                return (
                  <button
                    key={reaction}
                    data-testid={`chip-thread-reaction-${reaction}`}
                    onClick={() => addReaction(margin.id, reaction)}
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
            {REACTION_TYPES.filter((r) => !reactions[r]).slice(0, 4).map((reaction) => (
              <button
                key={reaction}
                data-testid={`button-add-reaction-${reaction}`}
                onClick={() => addReaction(margin.id, reaction)}
                className="font-sans text-[7px] font-light px-2.5 py-1.5 rounded-full border border-[#454545]/10 text-[#454545]/35 hover:border-[#AE8F7D]/30 hover:text-[#AE8F7D] transition-colors"
              >
                {reaction}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-[#454545]/6 mb-5" />

        {/* Replies */}
        <div className="space-y-4">
          {localReplies.length === 0 && (
            <p className="font-serif italic text-[13px] text-[#454545]/30 text-center py-4">
              Seja o primeiro a ecoar esta margem.
            </p>
          )}
          {localReplies.map((reply, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#697962] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-sans text-[8px] text-[#FAF8F3]">{currentUser.initials}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-sans font-light text-[10px] text-[#AE8F7D]">{currentUser.name}</span>
                  <span className="font-sans font-light text-[8px] text-[#454545]/25">· agora</span>
                </div>
                <p className="font-serif text-[13px] text-[#454545]/70 leading-relaxed">{reply.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FAF8F3]/95 backdrop-blur-md border-t border-[#AE8F7D]/15 px-5 py-3 flex items-center gap-3 max-w-md mx-auto">
        <input
          data-testid="input-thread-reply"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleReply()}
          placeholder="Escreva um eco..."
          className="flex-1 font-serif italic text-[13px] text-[#454545] placeholder:text-[#454545]/25 bg-transparent outline-none"
        />
        <button
          data-testid="button-send-reply"
          onClick={handleReply}
          disabled={!replyText.trim()}
          className="text-[#AE8F7D] disabled:text-[#AE8F7D]/25 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
