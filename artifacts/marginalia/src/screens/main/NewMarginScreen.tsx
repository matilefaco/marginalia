import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { MOCK_BOOKS } from "@/data/mockData";
import { MARGIN_TYPES, SPOILER_LEVELS, VISIBILITY_OPTIONS, REFERENCE_TYPES } from "@/data/constants";
import type { MarginType, SpoilerLevel, Visibility } from "@/data/constants";

const STEPS = [
  "Livro",
  "Trecho",
  "Referência",
  "Tipo",
  "Comentário",
  "Spoiler",
  "Visibilidade",
];

export function NewMarginScreen() {
  const [, navigate] = useLocation();
  const { addMargin, progress } = useApp();

  const [step, setStep] = useState(0);
  const [bookId, setBookId] = useState<number | null>(null);
  const [bookSearch, setBookSearch] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [referenceType, setReferenceType] = useState<"page" | "chapter" | "percent" | "none">("none");
  const [refValue, setRefValue] = useState("");
  const [postType, setPostType] = useState<MarginType>("insight");
  const [commentary, setCommentary] = useState("");
  const [spoilerLevel, setSpoilerLevel] = useState<SpoilerLevel>("none");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [published, setPublished] = useState(false);

  const myBooks = progress.filter((p) => p.userId === "user_me").map((p) => ({
    ...MOCK_BOOKS.find((b) => b.id === p.bookId)!,
    prog: p,
  })).filter(Boolean);

  const allBooks = MOCK_BOOKS.filter(
    (b) =>
      !bookSearch ||
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const selectedBook = MOCK_BOOKS.find((b) => b.id === bookId);

  const canNext = (() => {
    if (step === 0) return bookId !== null;
    if (step === 1) return excerpt.trim().length > 0;
    return true;
  })();

  const handlePublish = () => {
    if (!bookId || !selectedBook) return;
    addMargin({
      bookId,
      bookTitle: selectedBook.title,
      bookAuthor: selectedBook.author,
      excerpt: excerpt.trim(),
      referenceType,
      ...(referenceType === "page" ? { page: parseInt(refValue) || 0 } : {}),
      ...(referenceType === "chapter" ? { chapter: refValue } : {}),
      ...(referenceType === "percent" ? { percent: parseInt(refValue) || 0 } : {}),
      postType,
      commentary: commentary.trim(),
      spoilerLevel,
      visibility,
    });
    setPublished(true);
    setTimeout(() => navigate("/"), 1800);
  };

  if (published) {
    return (
      <div className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col items-center justify-center px-8 text-center"
        style={{ backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)", backgroundSize: "5px 5px" }}
      >
        <div className="w-16 h-16 rounded-full bg-[#697962]/15 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
          <Check className="w-8 h-8 text-[#697962]" />
        </div>
        <h2 className="font-serif italic text-[24px] text-[#454545] mb-2">Margem publicada</h2>
        <p className="font-sans font-light text-[11px] text-[#454545]/45 tracking-[0.08em]">
          Guardada para sempre no seu livro.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col"
      style={{ backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)", backgroundSize: "5px 5px" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        {step > 0 ? (
          <button onClick={() => setStep((s) => s - 1)} className="text-[#454545]/40">
            <ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => navigate("/")} className="text-[#454545]/40">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="font-serif italic text-[20px] text-[#454545]">Nova Margem</h1>
          <p className="font-sans font-light text-[9px] tracking-[0.12em] uppercase text-[#AE8F7D]">
            {STEPS[step]} · {step + 1}/{STEPS.length}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-5 mb-6">
        <div className="w-full h-[2px] bg-[#EBE6DB] rounded-full">
          <div
            className="h-full bg-[#AE8F7D] rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-auto px-5 pb-6">
        {/* STEP 0: Book */}
        {step === 0 && (
          <div className="space-y-4" data-testid="step-book">
            <p className="font-serif italic text-[16px] text-[#454545]/60">
              Que trecho ficou com você?
            </p>

            {myBooks.length > 0 && (
              <div>
                <p className="font-sans text-[9px] font-light tracking-[0.14em] uppercase text-[#AE8F7D] mb-2">
                  Sua biblioteca
                </p>
                <div className="space-y-2">
                  {myBooks.filter(Boolean).map((item) => (
                    <button
                      key={item.id}
                      data-testid={`select-book-${item.id}`}
                      onClick={() => setBookId(item.id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-[10px] border text-left transition-all ${
                        bookId === item.id
                          ? "border-[#AE8F7D]/50 bg-[#AE8F7D]/5"
                          : "border-[#454545]/8 hover:border-[#AE8F7D]/25"
                      }`}
                    >
                      <div className="w-8 h-11 rounded-[4px] bg-[#EBE6DB] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-[13px] text-[#454545] truncate">{item.title}</p>
                        <p className="font-sans font-light text-[9px] tracking-[0.06em] uppercase text-[#454545]/40">
                          {item.author}
                        </p>
                      </div>
                      {bookId === item.id && (
                        <div className="w-5 h-5 rounded-full bg-[#AE8F7D] flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-[#FAF8F3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="font-sans text-[9px] font-light tracking-[0.14em] uppercase text-[#AE8F7D] mb-2">
                Buscar outro livro
              </p>
              <div className="flex items-center gap-2 bg-[#EBE6DB]/60 rounded-[8px] px-3 py-2 mb-2 border border-[#AE8F7D]/10">
                <input
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="Título ou autor..."
                  className="flex-1 bg-transparent font-sans font-light text-[12px] text-[#454545] placeholder:text-[#454545]/30 outline-none"
                />
              </div>
              {bookSearch && (
                <div className="space-y-1.5">
                  {allBooks.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => { setBookId(book.id); setBookSearch(""); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-[8px] border text-left transition-all ${
                        bookId === book.id ? "border-[#AE8F7D]/50 bg-[#AE8F7D]/5" : "border-[#454545]/6 hover:border-[#AE8F7D]/20"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-[12px] text-[#454545] truncate">{book.title}</p>
                        <p className="font-sans font-light text-[9px] text-[#454545]/40">{book.author}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: Excerpt */}
        {step === 1 && (
          <div data-testid="step-excerpt">
            <p className="font-serif italic text-[15px] text-[#454545]/60 mb-4">
              Digite aqui o trecho que você marcou no livro.
            </p>
            <textarea
              data-testid="input-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder='"...'
              className="w-full font-serif italic text-[16px] text-[#454545] placeholder:text-[#454545]/25 bg-transparent border-none outline-none resize-none min-h-[200px] leading-relaxed"
            />
            <p className="font-sans font-light text-[9px] text-[#454545]/30 mt-2">
              Compartilhe apenas trechos curtos · {excerpt.length} caracteres
            </p>
          </div>
        )}

        {/* STEP 2: Reference */}
        {step === 2 && (
          <div data-testid="step-reference" className="space-y-4">
            <p className="font-serif italic text-[15px] text-[#454545]/60">
              Marque o ponto do livro para respeitar o ritmo dos outros leitores.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {REFERENCE_TYPES.map((rt) => (
                <button
                  key={rt.id}
                  data-testid={`ref-type-${rt.id}`}
                  onClick={() => setReferenceType(rt.id as typeof referenceType)}
                  className={`py-3 rounded-[10px] border font-sans text-[11px] font-light transition-all ${
                    referenceType === rt.id
                      ? "bg-[#454545] text-[#FAF8F3] border-transparent"
                      : "bg-transparent text-[#454545]/55 border-[#454545]/10 hover:border-[#AE8F7D]/30"
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>
            {referenceType !== "none" && (
              <div>
                <input
                  data-testid="input-ref-value"
                  value={refValue}
                  onChange={(e) => setRefValue(e.target.value)}
                  placeholder={
                    referenceType === "page" ? "Ex: 87" :
                    referenceType === "chapter" ? "Ex: IX" : "Ex: 60"
                  }
                  className="w-full font-serif italic text-[20px] text-[#454545] placeholder:text-[#454545]/20 bg-transparent border-b border-[#454545]/12 pb-2 outline-none focus:border-[#AE8F7D]/60 transition-colors text-center"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Type */}
        {step === 3 && (
          <div data-testid="step-type" className="space-y-2">
            <p className="font-serif italic text-[15px] text-[#454545]/60 mb-4">
              Como você quer classificar esta margem?
            </p>
            {MARGIN_TYPES.map((type) => (
              <button
                key={type.id}
                data-testid={`margin-type-${type.id}`}
                onClick={() => setPostType(type.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-[12px] border text-left transition-all ${
                  postType === type.id
                    ? "border-[#AE8F7D]/50 bg-[#AE8F7D]/5"
                    : "border-[#454545]/8 hover:border-[#AE8F7D]/25"
                }`}
              >
                <span className="text-[18px] flex-shrink-0">{type.icon}</span>
                <span className="font-sans font-light text-[13px] text-[#454545]">{type.label}</span>
                {postType === type.id && (
                  <div className="ml-auto w-4 h-4 rounded-full bg-[#AE8F7D] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FAF8F3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* STEP 4: Commentary */}
        {step === 4 && (
          <div data-testid="step-commentary">
            <p className="font-serif italic text-[15px] text-[#454545]/60 mb-4">
              O que esse trecho abriu em você?
            </p>
            <textarea
              data-testid="input-commentary"
              value={commentary}
              onChange={(e) => setCommentary(e.target.value)}
              placeholder="Escreva sua interpretação, sentimento ou teoria..."
              className="w-full font-serif text-[15px] text-[#454545] placeholder:text-[#454545]/25 bg-transparent border-none outline-none resize-none min-h-[180px] leading-relaxed"
            />
          </div>
        )}

        {/* STEP 5: Spoiler */}
        {step === 5 && (
          <div data-testid="step-spoiler" className="space-y-3">
            <p className="font-serif italic text-[15px] text-[#454545]/60 mb-4">
              Este trecho revela algo importante da obra?
            </p>
            {SPOILER_LEVELS.map((level) => (
              <button
                key={level.id}
                data-testid={`spoiler-level-${level.id}`}
                onClick={() => setSpoilerLevel(level.id as SpoilerLevel)}
                className={`w-full flex items-center gap-4 p-4 rounded-[12px] border text-left transition-all ${
                  spoilerLevel === level.id
                    ? "border-[#AE8F7D]/50 bg-[#AE8F7D]/5"
                    : "border-[#454545]/8 hover:border-[#AE8F7D]/25"
                }`}
              >
                <span className="font-sans font-light text-[13px] text-[#454545] flex-1">{level.label}</span>
                {spoilerLevel === level.id && (
                  <div className="w-4 h-4 rounded-full bg-[#AE8F7D] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FAF8F3]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* STEP 6: Visibility */}
        {step === 6 && (
          <div data-testid="step-visibility" className="space-y-3">
            <p className="font-serif italic text-[15px] text-[#454545]/60 mb-4">
              Quer guardar isso só para você ou compartilhar?
            </p>
            {VISIBILITY_OPTIONS.map((vis) => (
              <button
                key={vis.id}
                data-testid={`visibility-${vis.id}`}
                onClick={() => setVisibility(vis.id as Visibility)}
                className={`w-full flex items-center gap-4 p-4 rounded-[12px] border text-left transition-all ${
                  visibility === vis.id
                    ? "border-[#AE8F7D]/50 bg-[#AE8F7D]/5"
                    : "border-[#454545]/8 hover:border-[#AE8F7D]/25"
                }`}
              >
                <span className="font-sans font-light text-[13px] text-[#454545] flex-1">{vis.label}</span>
                {visibility === vis.id && (
                  <div className="w-4 h-4 rounded-full bg-[#AE8F7D] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FAF8F3]" />
                  </div>
                )}
              </button>
            ))}

            {/* Preview */}
            {selectedBook && excerpt && (
              <div className="mt-6 p-4 rounded-[12px] border border-[#AE8F7D]/20 bg-[#EBE6DB]/20">
                <p className="font-sans text-[8px] font-light tracking-[0.14em] uppercase text-[#AE8F7D] mb-3">Preview da margem</p>
                <p className="font-serif italic text-[12px] text-[#3D3D3D] border-l-2 border-[#AE8F7D]/40 pl-2 mb-2">
                  &ldquo;{excerpt.slice(0, 100)}{excerpt.length > 100 ? "..." : ""}&rdquo;
                </p>
                <p className="font-sans font-light text-[9px] text-[#454545]/40">
                  {selectedBook.title} · {MARGIN_TYPES.find((t) => t.id === postType)?.label}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-5 py-5 border-t border-[#AE8F7D]/10">
        {step < STEPS.length - 1 ? (
          <button
            data-testid="button-next-step"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext}
            className="w-full flex items-center justify-center gap-2 bg-[#AE8F7D] text-[#FAF8F3] font-sans font-light text-[12px] tracking-[0.12em] uppercase py-4 rounded-[10px] disabled:opacity-30 hover:bg-[#AE8F7D]/90 transition-colors"
          >
            Continuar
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            data-testid="button-publish-margin"
            onClick={handlePublish}
            className="w-full bg-[#454545] text-[#FAF8F3] font-sans font-light text-[12px] tracking-[0.12em] uppercase py-4 rounded-[10px] hover:bg-[#454545]/90 transition-colors"
          >
            Publicar margem
          </button>
        )}
      </div>
    </div>
  );
}
