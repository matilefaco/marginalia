import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, X } from "lucide-react";
import { useGetBook, useCreateAnnotation, getGetBookQueryKey } from "@workspace/api-client-react";
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

const MOCK_PASSAGES: Record<number, Array<{ id: string; text: string; highlighted?: boolean }>> = {
  1: [
    {
      id: "p1",
      text: "Para retratar Macabéa, eu precisaria de estar com a face bem lavada, sem nada de batom, com olheiras fundas, usando como já disse uma blusa puída. Pois, como eu era um escritor de sucesso, eu teria que me fantasiar de escritor fracassado.",
    },
    {
      id: "p2",
      text: "Macabéa era tão discreta que nem ela mesma sabia que existia.",
      highlighted: true,
    },
    {
      id: "p3",
      text: "Ela era irreal como um pensamento, e real como um fato. Ela não fazia questão de existir e isso me doía. Ela era o tipo de moça que se compra pão duro no dia seguinte porque está mais barato.",
    },
    {
      id: "p4",
      text: "Quero escrever movimento puro. A passagem de um dia para outro.",
    },
    {
      id: "p5",
      text: "Ela tinha uma coisa que chamaria de solidão íntima — e não sabia que havia nomes para o que sentia, assim como não sabia que havia nomes para ela mesma.",
      highlighted: true,
    },
  ],
  2: [
    {
      id: "p1",
      text: "Nonada. Tiros que o Hermógenes deu. Deus existe mesmo quando não há. Mas o demo é demais: existe é onde não devia. O sertão está em todo lugar.",
      highlighted: true,
    },
    {
      id: "p2",
      text: "Minha vida não era uma coisa acontecida — era uma coisa acontecendo. O que me estragava era o amor. O que me salvava também.",
    },
    {
      id: "p3",
      text: "Sei que não vou poder contar com clareza. O que sei, o que imagino, o que temo — às vezes não consigo separar.",
    },
  ],
  3: [
    {
      id: "p1",
      text: "If we had a keen vision of all that is ordinary in human life, it would be like hearing the grass grow and the squirrel's heart beat, and we should die of that roar which lies on the other side of silence.",
      highlighted: true,
    },
    {
      id: "p2",
      text: "Her full nature spent itself in channels which had no great name on the earth. But the effect of her action on those around her was incalculably diffusive.",
    },
    {
      id: "p3",
      text: "It is a narrow mind which cannot look at a subject from various points of view. The growing good of the world is partly dependent on unhistoric acts.",
    },
  ],
};

export default function Reader() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id === "current" ? "1" : params.id || "1", 10);
  const queryClient = useQueryClient();

  const { data: book } = useGetBook(id, {
    query: { enabled: !!id, queryKey: getGetBookQueryKey(id) },
  });
  const createAnnotation = useCreateAnnotation();

  const [selectedPassage, setSelectedPassage] = useState<string | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showPanel, setShowPanel] = useState(false);

  const passages = MOCK_PASSAGES[id] || MOCK_PASSAGES[1];

  const handlePassageClick = (passageId: string) => {
    setSelectedPassage(passageId);
    setSelectedReaction(null);
    setNote("");
    setShowPanel(true);
  };

  const handlePublish = async () => {
    const passage = passages.find((p) => p.id === selectedPassage);
    if (!passage || !selectedReaction) return;

    await createAnnotation.mutateAsync({
      data: {
        bookId: id,
        chapter: book?.currentChapter || "I",
        progressAt: book?.progress || 0,
        excerpt: passage.text,
        note: note || null,
        type: "reaction",
        isPublic: true,
      },
    });

    queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(id) });
    setShowPanel(false);
    setSelectedPassage(null);
    setSelectedReaction(null);
    setNote("");
  };

  return (
    <div className="min-h-full bg-[#FAF8F3] flex flex-col" style={{ backgroundImage: "none" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-3 border-b border-[#AE8F7D]/15">
        <Link href={book ? `/book/${id}` : "/"}>
          <button data-testid="button-back-reader" className="text-[#454545]/50 hover:text-[#454545]">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="text-center">
          <div className="font-serif italic text-[14px] text-[#454545]">{book?.title || "..."}</div>
          <div className="font-sans font-light text-[8px] tracking-[0.18em] uppercase text-[#454545]/35">
            Cap. {book?.currentChapter || "I"} · {book?.author || ""}
          </div>
        </div>
        <div className="w-5" />
      </div>

      {/* Reading Content */}
      <div className="flex-1 px-7 py-8 overflow-auto">
        <div className="max-w-full">
          {passages.map((passage) => (
            <p
              key={passage.id}
              data-testid={`passage-${passage.id}`}
              onClick={() => handlePassageClick(passage.id)}
              className="font-serif text-[17px] text-[#3D3D3D] leading-[1.85] mb-6 cursor-pointer transition-all duration-200"
              style={
                passage.highlighted || selectedPassage === passage.id
                  ? {
                      background: "rgba(174,143,125,0.18)",
                      boxShadow: "inset 0 -1.5px 0 rgba(174,143,125,0.55)",
                      borderRadius: "2px",
                      padding: "0 2px",
                    }
                  : {}
              }
            >
              {passage.text}
            </p>
          ))}
        </div>
      </div>

      {/* Progress footer */}
      <div className="px-5 pb-2 pt-1">
        <div className="w-full h-[2px] bg-[#EBE6DB] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#AE8F7D] rounded-full"
            style={{ width: `${book?.progress || 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-sans font-light text-[8px] text-[#454545]/30">
            Cap. {book?.currentChapter || "I"} de {book?.heatmap?.length || "?"}
          </span>
          <span className="font-sans font-light text-[8px] text-[#454545]/30">
            {Math.round(book?.progress || 0)}%
          </span>
        </div>
      </div>

      {/* Annotation Panel (bottom sheet) */}
      {showPanel && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: "rgba(69,69,69,0.15)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPanel(false);
          }}
        >
          <div
            data-testid="annotation-panel"
            className="bg-[#FAF8F3] rounded-t-[20px] p-5 max-h-[75vh] overflow-y-auto"
            style={{ boxShadow: "0 -4px 32px rgba(69,69,69,0.12)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-sans text-[9px] font-light tracking-[0.18em] uppercase text-[#AE8F7D]">
                Anotar
              </span>
              <button
                data-testid="button-close-panel"
                onClick={() => setShowPanel(false)}
                className="text-[#454545]/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedPassage && (
              <div className="border-l-2 border-[#AE8F7D]/50 pl-3 mb-4">
                <p className="font-serif italic text-[12px] text-[#454545]/55 leading-relaxed">
                  &ldquo;{passages.find((p) => p.id === selectedPassage)?.text.slice(0, 120)}...&rdquo;
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mb-4">
              {REACTIONS.map((reaction) => (
                <button
                  key={reaction}
                  data-testid={`chip-reaction-select-${reaction}`}
                  onClick={() => setSelectedReaction(reaction === selectedReaction ? null : reaction)}
                  className={`font-sans text-[7px] font-light px-2.5 py-1.5 rounded-full border transition-all ${
                    selectedReaction === reaction
                      ? REACTIONS_STYLES[reaction]
                      : "bg-transparent text-[#454545]/50 border-[#454545]/15"
                  }`}
                >
                  {reaction}
                </button>
              ))}
            </div>

            <textarea
              data-testid="input-annotation-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Escreva uma nota..."
              className="w-full font-serif italic text-[14px] text-[#454545] placeholder:text-[#454545]/30 bg-transparent border-none outline-none resize-none min-h-[60px] mb-4"
            />

            <div className="flex gap-2">
              <button
                data-testid="button-publish-annotation"
                onClick={handlePublish}
                disabled={!selectedReaction || createAnnotation.isPending}
                className="flex-1 bg-[#AE8F7D] text-[#FAF8F3] font-sans text-[11px] font-light tracking-[0.08em] py-3 rounded-[8px] disabled:opacity-40 hover:bg-[#AE8F7D]/90 transition-colors"
              >
                {createAnnotation.isPending ? "Publicando..." : "Publicar"}
              </button>
              <button
                data-testid="button-highlight-only"
                onClick={() => setShowPanel(false)}
                className="flex-1 font-sans text-[11px] font-light tracking-[0.08em] py-3 rounded-[8px] border border-[#454545]/15 text-[#454545]/60 hover:bg-[#EBE6DB]/50 transition-colors"
              >
                Apenas destacar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
