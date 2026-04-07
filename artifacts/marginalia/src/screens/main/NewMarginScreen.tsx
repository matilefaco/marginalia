import { useState, useRef, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { ChevronLeft, Check, ChevronDown, ChevronUp, CornerUpRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { MOCK_BOOKS, MOCK_MARGINS } from "@/data/mockData";
import { MARGIN_TYPES, SPOILER_LEVELS, VISIBILITY_OPTIONS } from "@/data/constants";
import type { MarginType, SpoilerLevel, Visibility } from "@/data/constants";
import { formatReference } from "@/utils/formatting";

export function NewMarginScreen() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const replyToId = params.get("replyTo");
  const preBookId = params.get("bookId") ? parseInt(params.get("bookId")!) : null;

  const { addMargin, progress, currentUser } = useApp();

  const replyToMargin = replyToId ? MOCK_MARGINS.find((m) => m.id === parseInt(replyToId)) ?? null : null;

  const [bookId, setBookId] = useState<number | null>(preBookId ?? (replyToMargin?.bookId ?? null));
  const [bookSearch, setBookSearch] = useState("");
  const [showBookSearch, setShowBookSearch] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [referenceType, setReferenceType] = useState<"page" | "chapter" | "free_text" | "none">("none");
  const [refValue, setRefValue] = useState("");
  const [postType, setPostType] = useState<MarginType>("insight");
  const [commentary, setCommentary] = useState("");
  const [spoilerLevel, setSpoilerLevel] = useState<SpoilerLevel>("none");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [published, setPublished] = useState(false);
  const [showSecondary, setShowSecondary] = useState<boolean>(
    preBookId !== null || replyToMargin?.bookId != null
  );
  const excerptRef = useRef<HTMLTextAreaElement>(null);

  // Progressive disclosure: secondary fields appear as soon as a book is selected
  useEffect(() => {
    if (bookId !== null) {
      setShowSecondary(true);
    }
  }, [bookId]);

  // Autofocus excerpt
  useEffect(() => {
    const t = setTimeout(() => excerptRef.current?.focus(), 180);
    return () => clearTimeout(t);
  }, []);

  const myBooks = progress
    .filter((p) => p.userId === currentUser.id && p.status !== "wishlist")
    .map((p) => MOCK_BOOKS.find((b) => b.id === p.bookId))
    .filter(Boolean) as typeof MOCK_BOOKS;

  const searchResults = bookSearch.trim()
    ? MOCK_BOOKS.filter(
        (b) =>
          b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
          b.author.toLowerCase().includes(bookSearch.toLowerCase())
      ).slice(0, 5)
    : [];

  const selectedBook = MOCK_BOOKS.find((b) => b.id === bookId);
  const canPublish = bookId !== null && excerpt.trim().length > 0;

  const handlePublish = () => {
    if (!canPublish || !selectedBook) return;
    addMargin({
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      bookAuthor: selectedBook.author,
      excerpt: excerpt.trim(),
      referenceType: referenceType === "free_text" ? "none" : referenceType,
      ...(referenceType === "page" ? { page: parseInt(refValue) || 0 } : {}),
      ...(referenceType === "chapter" ? { chapter: refValue } : {}),
      postType,
      commentary: commentary.trim(),
      spoilerLevel,
      visibility,
      ...(replyToId ? { parentEcoId: replyToId } : {}),
    });
    setPublished(true);
    setTimeout(() => navigate("/"), 1800);
  };

  if (published) {
    return (
      <div
        className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col items-center justify-center px-8 text-center"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)",
          backgroundSize: "5px 5px",
        }}
      >
        <div className="w-16 h-16 rounded-full bg-[#697962]/15 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
          <Check className="w-8 h-8 text-[#697962]" />
        </div>
        <h2 className="font-serif italic text-[26px] text-[#454545] mb-2">Margem publicada</h2>
        <p className="font-sans font-light text-[11px] text-[#454545]/40 tracking-[0.08em]">
          Guardada no seu livro para sempre.
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] bg-[#FAF8F3] flex flex-col screen-enter overflow-x-hidden"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.12) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-10 pb-4 border-b border-[#AE8F7D]/10">
        <button onClick={() => navigate("/")} className="text-[#454545]/40 hover:text-[#454545]/70 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-serif italic text-[20px] text-[#454545]">
            {replyToMargin ? "Responder com margem" : "Nova Margem"}
          </h1>
          <p className="font-sans font-light text-[9px] tracking-[0.14em] uppercase text-[#AE8F7D]">
            {replyToMargin ? "Seu eco em resposta" : "Guardar esse trecho para sempre"}
          </p>
        </div>
        {replyToMargin && (
          <div className="ml-auto flex items-center gap-1 text-[#697962]/60">
            <CornerUpRight className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-auto px-5 py-6 space-y-6">

        {/* Reply context banner */}
        {replyToMargin && (
          <div className="rounded-[12px] border border-[#697962]/20 bg-[#697962]/5 px-4 py-3.5">
            <p className="font-sans text-[7.5px] font-light tracking-[0.18em] uppercase text-[#697962] mb-1.5">
              Respondendo ao eco de {replyToMargin.userName ?? "outro leitor"}
            </p>
            <p className="font-serif italic text-[13px] text-[#454545]/65 leading-relaxed border-l-2 border-[#697962]/30 pl-3">
              &ldquo;{replyToMargin.excerpt.slice(0, 100)}{replyToMargin.excerpt.length > 100 ? "…" : ""}&rdquo;
            </p>
          </div>
        )}

        {/* STEP 1: Excerpt — always first and most prominent */}
        <div>
          <p className="font-sans text-[9px] font-light tracking-[0.18em] uppercase text-[#AE8F7D] mb-2">
            Trecho
          </p>
          <textarea
            ref={excerptRef}
            data-testid="input-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Cole ou escreva o trecho que ficou com você…"
            className="w-full font-serif italic text-[17px] text-[#2A2A2A] placeholder:text-[#454545]/20 bg-[#FAF8F3] border border-[#AE8F7D]/20 rounded-[12px] p-4 outline-none focus:border-[#AE8F7D]/50 transition-colors resize-none leading-[1.75] min-h-[120px]"
            rows={4}
          />
          <p className="font-sans font-light text-[8px] text-[#454545]/25 mt-1 text-right">
            {excerpt.length} caracteres · respeite direitos autorais
          </p>
        </div>

        {/* STEP 2: Book — always visible */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="font-sans text-[9px] font-light tracking-[0.18em] uppercase text-[#AE8F7D] mb-2">
              Livro
            </p>

            {selectedBook ? (
              <button
                data-testid="selected-book-display"
                onClick={() => { setBookId(null); setShowBookSearch(true); }}
                className="w-full flex items-center gap-3 p-3.5 rounded-[10px] border border-[#AE8F7D]/30 bg-[#AE8F7D]/4 text-left"
              >
                <div className="w-8 h-11 rounded-[4px] bg-[#EBE6DB] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-[14px] text-[#454545] truncate">{selectedBook.title}</p>
                  <p className="font-sans font-light text-[9px] tracking-[0.06em] uppercase text-[#454545]/40">
                    {selectedBook.author}
                  </p>
                </div>
                <span className="font-sans text-[9px] text-[#454545]/30">trocar</span>
              </button>
            ) : (
              <div>
                {myBooks.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {myBooks.slice(0, 4).map((b) => (
                      <button
                        key={b.id}
                        data-testid={`quick-select-book-${b.id}`}
                        onClick={() => { setBookId(b.id); setShowBookSearch(false); }}
                        className="font-sans text-[9px] font-light px-3 py-1.5 rounded-full border border-[#454545]/10 text-[#454545]/55 hover:border-[#AE8F7D]/40 hover:text-[#454545] transition-all bg-[#FAF8F3]"
                      >
                        {b.title.length > 20 ? b.title.slice(0, 20) + "…" : b.title}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 bg-[#EBE6DB]/60 rounded-[10px] px-4 py-3 border border-[#AE8F7D]/10">
                  <input
                    data-testid="input-book-search"
                    value={bookSearch}
                    onChange={(e) => { setBookSearch(e.target.value); setShowBookSearch(true); }}
                    onFocus={() => setShowBookSearch(true)}
                    placeholder="Buscar outro livro..."
                    className="flex-1 bg-transparent font-sans font-light text-[12px] text-[#454545] placeholder:text-[#454545]/30 outline-none"
                  />
                </div>
                {showBookSearch && searchResults.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {searchResults.map((book) => (
                      <button
                        key={book.id}
                        data-testid={`select-book-${book.id}`}
                        onClick={() => { setBookId(book.id); setBookSearch(""); setShowBookSearch(false); }}
                        className="w-full flex items-center gap-3 p-3 rounded-[8px] border border-[#454545]/8 text-left hover:border-[#AE8F7D]/30 transition-colors bg-[#FAF8F3]"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-[13px] text-[#454545] truncate">{book.title}</p>
                          <p className="font-sans font-light text-[9px] text-[#454545]/40">{book.author}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        {/* STEP 3: Secondary fields — progressive disclosure */}
        {showSecondary && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">

            {/* Type */}
            <div>
              <p className="font-sans text-[9px] font-light tracking-[0.18em] uppercase text-[#AE8F7D] mb-2">
                Tipo de margem
              </p>
              <div className="flex flex-wrap gap-1.5">
                {MARGIN_TYPES.map((type) => (
                  <button
                    key={type.id}
                    data-testid={`margin-type-${type.id}`}
                    onClick={() => setPostType(type.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full border font-sans text-[10px] font-light transition-all ${
                      postType === type.id
                        ? "bg-[#454545] text-[#FAF8F3] border-transparent"
                        : "bg-transparent text-[#454545]/55 border-[#454545]/10 hover:border-[#AE8F7D]/30"
                    }`}
                  >
                    <span className="text-[11px]">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference */}
            <div>
              <p className="font-sans text-[9px] font-light tracking-[0.18em] uppercase text-[#AE8F7D] mb-2">
                Referência <span className="text-[#454545]/25 normal-case tracking-normal">· ajuda outros leitores a evitar spoilers</span>
              </p>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {[
                  { id: "none", label: "Sem ref." },
                  { id: "page", label: "Página" },
                  { id: "chapter", label: "Capítulo" },
                  { id: "free_text", label: "Livre" },
                ].map((rt) => (
                  <button
                    key={rt.id}
                    data-testid={`ref-type-${rt.id}`}
                    onClick={() => setReferenceType(rt.id as typeof referenceType)}
                    className={`py-2.5 rounded-[8px] border font-sans text-[9px] font-light tracking-[0.06em] transition-all ${
                      referenceType === rt.id
                        ? "bg-[#454545] text-[#FAF8F3] border-transparent"
                        : "bg-transparent text-[#454545]/50 border-[#454545]/10 hover:border-[#AE8F7D]/30"
                    }`}
                  >
                    {rt.label}
                  </button>
                ))}
              </div>
              {referenceType !== "none" && (
                <input
                  data-testid="input-ref-value"
                  value={refValue}
                  onChange={(e) => setRefValue(e.target.value)}
                  type={referenceType === "page" ? "number" : "text"}
                  placeholder={
                    referenceType === "page" ? "Ex: 87" :
                    referenceType === "chapter" ? "Ex: IX ou 5" :
                    "Ex: 'O sonho dela'"
                  }
                  className="w-full font-serif italic text-[17px] text-[#454545] placeholder:text-[#454545]/20 bg-transparent border-b border-[#454545]/12 pb-2 outline-none focus:border-[#AE8F7D]/60 transition-colors"
                />
              )}
            </div>

            {/* Sua margem (commentary) */}
            <div>
              <p className="font-sans text-[9px] font-light tracking-[0.18em] uppercase text-[#AE8F7D] mb-2">
                Sua margem
              </p>
              <textarea
                data-testid="input-commentary"
                value={commentary}
                onChange={(e) => setCommentary(e.target.value)}
                placeholder="O que esse trecho abriu em você?"
                className="w-full font-serif text-[15px] text-[#2A2A2A]/80 placeholder:text-[#454545]/22 bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[10px] p-4 outline-none focus:border-[#AE8F7D]/40 transition-colors resize-none leading-[1.75]"
                rows={3}
              />
            </div>

            {/* Spoiler + Visibility */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-sans text-[9px] font-light tracking-[0.18em] uppercase text-[#AE8F7D] mb-2">
                  Spoiler
                </p>
                <div className="space-y-1.5">
                  {SPOILER_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      data-testid={`spoiler-level-${level.id}`}
                      onClick={() => setSpoilerLevel(level.id as SpoilerLevel)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-[8px] border text-left transition-all ${
                        spoilerLevel === level.id
                          ? "border-[#AE8F7D]/40 bg-[#AE8F7D]/5"
                          : "border-[#454545]/8 hover:border-[#AE8F7D]/20"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          spoilerLevel === level.id ? "bg-[#AE8F7D]" : "bg-[#454545]/15"
                        }`}
                      />
                      <span className={`font-sans font-light text-[10px] leading-tight ${spoilerLevel === level.id ? "text-[#454545]" : "text-[#454545]/50"}`}>
                        {level.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-sans text-[9px] font-light tracking-[0.18em] uppercase text-[#AE8F7D] mb-2">
                  Visibilidade
                </p>
                <div className="space-y-1.5">
                  {([
                    { id: "public", label: "Pública", sub: "Visível para todos" },
                    { id: "private", label: "Privada", sub: "Só você pode ver" },
                  ] as const).map((vis) => (
                    <button
                      key={vis.id}
                      data-testid={`visibility-${vis.id}`}
                      onClick={() => setVisibility(vis.id as Visibility)}
                      className={`w-full flex items-start gap-2 px-3 py-2 rounded-[8px] border text-left transition-all ${
                        visibility === vis.id
                          ? "border-[#AE8F7D]/40 bg-[#AE8F7D]/5"
                          : "border-[#454545]/8 hover:border-[#AE8F7D]/20"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${
                          visibility === vis.id ? "bg-[#AE8F7D]" : "bg-[#454545]/15"
                        }`}
                      />
                      <div>
                        <span className={`font-sans font-light text-[10px] block ${visibility === vis.id ? "text-[#454545]" : "text-[#454545]/50"}`}>
                          {vis.label}
                        </span>
                        <span className="font-sans font-light text-[8px] text-[#454545]/30">{vis.sub}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            {selectedBook && excerpt.trim() && (
              <div className="p-4 rounded-[12px] border border-[#AE8F7D]/15 bg-[#EBE6DB]/20">
                <p className="font-sans text-[7px] font-light tracking-[0.18em] uppercase text-[#AE8F7D] mb-2">
                  Preview · como vai aparecer no feed
                </p>
                <p className="font-serif italic text-[13px] text-[#2A2A2A]/80 border-l-2 border-[#AE8F7D]/45 pl-3 mb-2 leading-relaxed">
                  &ldquo;{excerpt.slice(0, 120)}{excerpt.length > 120 ? "…" : ""}&rdquo;
                </p>
                <p className="font-sans font-light text-[9px] text-[#454545]/40">
                  {selectedBook.title} · {MARGIN_TYPES.find((t) => t.id === postType)?.label}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="pb-4" />
      </div>

      {/* Sticky publish button */}
      <div className="px-5 py-4 border-t border-[#AE8F7D]/10 bg-[#FAF8F3]/95 backdrop-blur-sm">
        {!canPublish && (
          <p className="font-sans font-light text-[9px] text-center text-[#454545]/30 mb-2">
            {excerpt.trim().length === 0
              ? "Digite o trecho que ficou com você"
              : !bookId
              ? "Selecione o livro para continuar"
              : ""}
          </p>
        )}
        <button
          data-testid="button-publish-margin"
          onClick={handlePublish}
          disabled={!canPublish}
          className="w-full bg-[#454545] text-[#FAF8F3] font-sans font-light text-[12px] tracking-[0.14em] uppercase py-4 rounded-[10px] disabled:opacity-25 hover:bg-[#454545]/90 active:scale-[0.99] transition-all"
        >
          {replyToMargin ? "Publicar resposta" : "Publicar margem"}
        </button>
      </div>
    </div>
  );
}
