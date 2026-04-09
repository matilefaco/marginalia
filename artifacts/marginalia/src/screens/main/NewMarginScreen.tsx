import { useState, useRef, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { ChevronLeft, Check, CornerUpRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { MOCK_BOOKS, MOCK_MARGINS } from "@/data/mockData";
import { MARGIN_TYPES, SPOILER_LEVELS } from "@/data/constants";
import type { MarginType, SpoilerLevel, Visibility } from "@/data/constants";
import { formatReference } from "@/utils/formatting";

type ComposerMode = "EXCERPT" | "THOUGHT";

const THOUGHT_TYPES = MARGIN_TYPES.filter((t) =>
  ["insight", "reaction", "theory"].includes(t.id)
);

export function NewMarginScreen() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const replyToId = params.get("replyTo");
  const preBookIdRaw = params.get("bookId");
  const preBookId =
    preBookIdRaw && preBookIdRaw !== "null"
      ? parseInt(preBookIdRaw) || null
      : null;

  const { addMargin, progress, currentUser, isDark } = useApp();

  const replyToMargin = replyToId
    ? MOCK_MARGINS.find((m) => m.id === parseInt(replyToId)) ?? null
    : null;

  /* ── Composer mode ── */
  const [composerMode, setComposerMode] = useState<ComposerMode>("EXCERPT");

  /* ── EXCERPT mode state ── */
  const [bookId, setBookId] = useState<number | null>(
    preBookId ?? (replyToMargin?.bookId ?? null)
  );
  const [bookSearch, setBookSearch] = useState("");
  const [showBookSearch, setShowBookSearch] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [referenceType, setReferenceType] = useState<"page" | "chapter" | "free_text" | "none">("none");
  const [refValue, setRefValue] = useState("");
  const [postType, setPostType] = useState<MarginType>("insight");
  const [commentary, setCommentary] = useState("");
  const [spoilerLevel, setSpoilerLevel] = useState<SpoilerLevel>("none");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [showSecondary, setShowSecondary] = useState<boolean>(
    preBookId !== null || replyToMargin?.bookId != null
  );

  /* ── THOUGHT mode state ── */
  const [thoughtText, setThoughtText] = useState("");
  const [thoughtPostType, setThoughtPostType] = useState<MarginType>("insight");
  const [thoughtVisibility, setThoughtVisibility] = useState<Visibility>("public");
  const [showThoughtSettings, setShowThoughtSettings] = useState(false);

  const [published, setPublished] = useState(false);

  const excerptRef = useRef<HTMLTextAreaElement>(null);
  const thoughtRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (bookId !== null) setShowSecondary(true);
  }, [bookId]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (composerMode === "EXCERPT") excerptRef.current?.focus();
      else thoughtRef.current?.focus();
    }, 180);
    return () => clearTimeout(t);
  }, [composerMode]);

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

  const canPublishExcerpt = bookId !== null && excerpt.trim().length > 0;
  const canPublishThought = thoughtText.trim().length >= 20;

  const handlePublishExcerpt = () => {
    if (!canPublishExcerpt || !selectedBook) return;
    addMargin({
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      bookAuthor: selectedBook.author,
      excerpt: excerpt.trim(),
      referenceType: referenceType === "free_text" ? "none" : referenceType,
      ...(referenceType === "page" ? { page: parseInt(refValue) || 0 } : {}),
      ...(referenceType === "chapter" ? { chapter: refValue } : {}),
      postType,
      composerMode: "EXCERPT",
      commentary: commentary.trim(),
      spoilerLevel,
      visibility,
      ...(replyToId ? { parentEcoId: parseInt(replyToId) } : {}),
    });
    setPublished(true);
    setTimeout(() => navigate("/"), 1800);
  };

  const handlePublishThought = () => {
    if (!canPublishThought) return;
    addMargin({
      bookId: null,
      bookTitle: "",
      bookAuthor: "",
      excerpt: "",
      referenceType: "none",
      postType: thoughtPostType,
      composerMode: "THOUGHT",
      commentary: thoughtText.trim(),
      spoilerLevel: "none",
      visibility: thoughtVisibility,
    });
    setPublished(true);
    setTimeout(() => navigate("/"), 1800);
  };

  const fieldBg = isDark ? "#201B17" : "#FAF8F3";
  const fieldBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(174,143,125,0.22)";
  const fieldStyle = {
    backgroundColor: fieldBg,
    border: `1px solid ${fieldBorder}`,
    color: "var(--text-primary)",
  };

  const activeChipStyle = {
    backgroundColor: isDark ? "#F3EDE3" : "#454545",
    color: isDark ? "#24211E" : "#FAF8F3",
    border: "1px solid transparent",
  };
  const inactiveChipStyle = {
    backgroundColor: "transparent",
    color: "var(--text-secondary)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(69,69,69,0.12)"}`,
  };

  if (published) {
    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center px-8 text-center"
        style={{
          backgroundColor: isDark ? "#1C1916" : "#FAF8F3",
          backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.10) 1px, transparent 1px)",
          backgroundSize: "5px 5px",
        }}
      >
        <div className="w-16 h-16 rounded-full bg-[#697962]/15 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
          <Check className="w-8 h-8 text-[#697962]" />
        </div>
        <h2 className="font-serif italic text-[26px] mb-2" style={{ color: "var(--text-primary)" }}>
          Post publicado
        </h2>
        <p className="font-sans font-light text-[11px] tracking-[0.08em]" style={{ color: "var(--text-soft)" }}>
          {composerMode === "THOUGHT"
            ? "Seu pensamento está no ar."
            : "Guardada no seu livro para sempre."}
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] flex flex-col screen-enter overflow-x-hidden"
      style={{
        backgroundColor: isDark ? "#1C1916" : "#FAF8F3",
        backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.10) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-10 pb-4 border-b border-[#AE8F7D]/10">
        <button
          onClick={() => navigate("/")}
          className="text-[#454545]/40 hover:text-[#454545]/70 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-serif italic text-[20px] text-[#454545]">
            {replyToMargin ? "Responder com post" : "Criar Post"}
          </h1>
          <p className="font-sans font-light text-[9px] tracking-[0.14em] uppercase text-[#AE8F7D]">
            {replyToMargin
              ? "Sua resposta"
              : composerMode === "THOUGHT"
              ? "Pensamento livre"
              : "Sobre um trecho"}
          </p>
        </div>
        {replyToMargin && (
          <div className="ml-auto flex items-center gap-1 text-[#697962]/60">
            <CornerUpRight className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-auto px-5 py-5 space-y-5">

        {/* ── Mode toggle (hidden when replying) ── */}
        {!replyToMargin && (
          <div
            className="flex rounded-[10px] overflow-hidden"
            style={{
              border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(174,143,125,0.22)"}`,
            }}
          >
            <button
              onClick={() => setComposerMode("EXCERPT")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-sans text-[10px] font-light tracking-[0.08em] transition-all"
              style={
                composerMode === "EXCERPT"
                  ? { backgroundColor: "#697962", color: "#FAF8F3" }
                  : {
                      backgroundColor: "transparent",
                      color: "var(--text-tertiary)",
                      borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(174,143,125,0.22)"}`,
                    }
              }
            >
              <span>📖</span> Sobre um trecho
            </button>
            <button
              onClick={() => setComposerMode("THOUGHT")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-sans text-[10px] font-light tracking-[0.08em] transition-all"
              style={
                composerMode === "THOUGHT"
                  ? { backgroundColor: "#697962", color: "#FAF8F3" }
                  : { backgroundColor: "transparent", color: "var(--text-tertiary)" }
              }
            >
              <span>✏️</span> Pensamento
            </button>
          </div>
        )}

        {/* ── Reply context banner ── */}
        {replyToMargin && (
          <div className="rounded-[12px] border border-[#697962]/20 bg-[#697962]/5 px-4 py-3.5">
            <p className="font-sans text-[7.5px] font-light tracking-[0.18em] uppercase text-[#697962] mb-1.5">
              Respondendo a {replyToMargin.userName ?? "outro leitor"}
            </p>
            <p className="font-serif italic text-[13px] text-[#454545]/65 leading-relaxed border-l-2 border-[#697962]/30 pl-3">
              &ldquo;
              {(replyToMargin.excerpt || replyToMargin.commentary).slice(0, 100)}
              {(replyToMargin.excerpt || replyToMargin.commentary).length > 100 ? "…" : ""}
              &rdquo;
            </p>
          </div>
        )}

        {/* ════════════════════════════════════════
            EXCERPT MODE FIELDS
            ════════════════════════════════════════ */}
        {composerMode === "EXCERPT" && (
          <>
            {/* Excerpt field */}
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
                className="w-full font-serif italic text-[17px] rounded-[12px] p-4 outline-none focus:border-[#AE8F7D]/60 transition-colors resize-none leading-[1.75] min-h-[120px]"
                style={fieldStyle}
                rows={4}
              />
              <p className="font-sans font-light text-[8px] mt-1 text-right" style={{ color: "var(--text-soft)" }}>
                {excerpt.length} caracteres · respeite direitos autorais
              </p>
            </div>

            {/* Book field */}
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
                          className="font-sans text-[9px] font-light px-3 py-1.5 rounded-full transition-all"
                          style={{
                            backgroundColor: isDark ? "#252119" : "#FAF8F3",
                            border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(69,69,69,0.12)"}`,
                            color: "var(--text-secondary)",
                          }}
                        >
                          {b.title.length > 20 ? b.title.slice(0, 20) + "…" : b.title}
                        </button>
                      ))}
                    </div>
                  )}
                  <div
                    className="flex items-center gap-2 rounded-[10px] px-4 py-3"
                    style={{
                      backgroundColor: isDark ? "#201B17" : "rgba(235,230,219,0.65)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(174,143,125,0.12)"}`,
                    }}
                  >
                    <input
                      data-testid="input-book-search"
                      value={bookSearch}
                      onChange={(e) => { setBookSearch(e.target.value); setShowBookSearch(true); }}
                      onFocus={() => setShowBookSearch(true)}
                      placeholder="Buscar outro livro..."
                      className="flex-1 bg-transparent font-sans font-light text-[12px] outline-none"
                      style={{ color: "var(--text-primary)" }}
                    />
                  </div>
                  {showBookSearch && searchResults.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {searchResults.map((book) => (
                        <button
                          key={book.id}
                          data-testid={`select-book-${book.id}`}
                          onClick={() => { setBookId(book.id); setBookSearch(""); setShowBookSearch(false); }}
                          className="w-full flex items-center gap-3 p-3 rounded-[8px] text-left transition-colors"
                          style={{
                            backgroundColor: isDark ? "#252119" : "#FAF8F3",
                            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(69,69,69,0.08)"}`,
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-serif text-[13px] truncate" style={{ color: "var(--text-primary)" }}>{book.title}</p>
                            <p className="font-sans font-light text-[9px]" style={{ color: "var(--text-tertiary)" }}>{book.author}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Secondary fields — appear when book is selected */}
            {showSecondary && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">

                {/* Post type */}
                <div>
                  <p className="font-sans text-[9px] font-light tracking-[0.18em] uppercase text-[#AE8F7D] mb-2">
                    Tipo de post
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {MARGIN_TYPES.map((type) => (
                      <button
                        key={type.id}
                        data-testid={`margin-type-${type.id}`}
                        onClick={() => setPostType(type.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full font-sans text-[10px] font-light transition-all"
                        style={postType === type.id ? activeChipStyle : inactiveChipStyle}
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
                    Referência{" "}
                    <span className="text-[#454545]/25 normal-case tracking-normal">
                      · ajuda outros leitores a evitar spoilers
                    </span>
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
                        className="py-2.5 rounded-[8px] font-sans text-[9px] font-light tracking-[0.06em] transition-all"
                        style={referenceType === rt.id ? activeChipStyle : inactiveChipStyle}
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
                        referenceType === "page"
                          ? "Ex: 87"
                          : referenceType === "chapter"
                          ? "Ex: IX ou 5"
                          : "Ex: 'O sonho dela'"
                      }
                      className="w-full font-serif italic text-[17px] text-[#454545] placeholder:text-[#454545]/20 bg-transparent border-b border-[#454545]/12 pb-2 outline-none focus:border-[#AE8F7D]/60 transition-colors"
                    />
                  )}
                </div>

                {/* Commentary */}
                <div>
                  <p className="font-sans text-[9px] font-light tracking-[0.18em] uppercase text-[#AE8F7D] mb-2">
                    Seu pensamento
                  </p>
                  <textarea
                    data-testid="input-commentary"
                    value={commentary}
                    onChange={(e) => setCommentary(e.target.value)}
                    placeholder="O que esse trecho abriu em você?"
                    className="w-full font-serif text-[15px] rounded-[10px] p-4 outline-none focus:border-[#AE8F7D]/50 transition-colors resize-none leading-[1.75]"
                    style={fieldStyle}
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
                          <span
                            className={`font-sans font-light text-[10px] leading-tight ${
                              spoilerLevel === level.id ? "text-[#454545]" : "text-[#454545]/50"
                            }`}
                          >
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
                            <span
                              className={`font-sans font-light text-[10px] block ${
                                visibility === vis.id ? "text-[#454545]" : "text-[#454545]/50"
                              }`}
                            >
                              {vis.label}
                            </span>
                            <span className="font-sans font-light text-[8px] text-[#454545]/30">
                              {vis.sub}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {selectedBook && excerpt.trim() && (
                  <div
                    className="rounded-[14px] overflow-hidden"
                    style={{
                      backgroundColor: isDark ? "#1F1A17" : "#FAF8F3",
                      border: `1px solid ${isDark ? "rgba(216,183,167,0.18)" : "rgba(174,143,125,0.20)"}`,
                    }}
                  >
                    <div
                      className="px-4 py-2.5 border-b flex items-center gap-2"
                      style={{
                        backgroundColor: isDark ? "rgba(215,183,167,0.06)" : "rgba(174,143,125,0.08)",
                        borderColor: isDark ? "rgba(216,183,167,0.10)" : "rgba(174,143,125,0.12)",
                      }}
                    >
                      <p
                        className="font-sans text-[6.5px] font-light tracking-[0.22em] uppercase"
                        style={{ color: isDark ? "#CDB9AA" : "#AE8F7D" }}
                      >
                        Preview · como vai aparecer no feed
                      </p>
                    </div>
                    <div className="px-4 pt-3.5 pb-4">
                      <div className="flex items-center gap-1.5 mb-3">
                        <span
                          className="font-sans text-[7.5px] font-light tracking-[0.18em] uppercase"
                          style={{ color: isDark ? "#CDB9AA" : "#AE8F7D" }}
                        >
                          {MARGIN_TYPES.find((t) => t.id === postType)?.icon}{" "}
                          {MARGIN_TYPES.find((t) => t.id === postType)?.label}
                        </span>
                        <span style={{ color: isDark ? "rgba(216,183,167,0.25)" : "rgba(174,143,125,0.30)" }}>·</span>
                        <span
                          className="font-sans font-light text-[7.5px] truncate"
                          style={{ color: isDark ? "#B7A697" : "#8C837A" }}
                        >
                          {selectedBook.title}
                        </span>
                      </div>
                      <div
                        className="pl-3 mb-3"
                        style={{
                          borderLeft: `2px solid ${isDark ? "rgba(216,183,167,0.45)" : "rgba(174,143,125,0.50)"}`,
                        }}
                      >
                        <p
                          className="font-serif italic text-[15px] leading-[1.72]"
                          style={{ color: isDark ? "#EADFD4" : "#24211E" }}
                        >
                          &ldquo;{excerpt.slice(0, 140)}{excerpt.length > 140 ? "…" : ""}&rdquo;
                        </p>
                      </div>
                      {commentary.trim() && (
                        <p
                          className="font-sans text-[12.5px] leading-[1.65] mb-3"
                          style={{ color: isDark ? "#F3EDE5" : "#24211E" }}
                        >
                          {commentary.slice(0, 140)}{commentary.length > 140 ? "…" : ""}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-sans font-light text-[7px] tracking-[0.1em] uppercase border px-1.5 py-0.5 rounded-full"
                          style={{
                            color: isDark ? "#B7A697" : "#8C837A",
                            borderColor: isDark ? "rgba(216,183,167,0.22)" : "rgba(174,143,125,0.28)",
                          }}
                        >
                          {spoilerLevel === "none" ? "Sem spoiler" : spoilerLevel}
                        </span>
                        <span
                          className="font-sans font-light text-[7px] tracking-[0.1em] uppercase border px-1.5 py-0.5 rounded-full"
                          style={{
                            color: isDark ? "#B7A697" : "#8C837A",
                            borderColor: isDark ? "rgba(216,183,167,0.22)" : "rgba(174,143,125,0.28)",
                          }}
                        >
                          {visibility === "public" ? "Público" : "Privado"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════
            THOUGHT MODE FIELDS
            ════════════════════════════════════════ */}
        {composerMode === "THOUGHT" && (
          <div className="space-y-5 animate-in fade-in duration-200">

            {/* Post type — only insight / reaction / theory */}
            <div>
              <p className="font-sans text-[9px] font-light tracking-[0.18em] uppercase text-[#AE8F7D] mb-2">
                Tipo de post
              </p>
              <div className="flex flex-wrap gap-1.5">
                {THOUGHT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    data-testid={`thought-type-${type.id}`}
                    onClick={() => setThoughtPostType(type.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full font-sans text-[10px] font-light transition-all"
                    style={thoughtPostType === type.id ? activeChipStyle : inactiveChipStyle}
                  >
                    <span className="text-[11px]">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Free-text field */}
            <div>
              <textarea
                ref={thoughtRef}
                data-testid="input-thought-text"
                value={thoughtText}
                onChange={(e) => setThoughtText(e.target.value.slice(0, 1000))}
                placeholder="O que está na sua cabeça agora?"
                className="w-full rounded-[12px] p-4 outline-none focus:border-[#AE8F7D]/60 transition-colors resize-none"
                style={{
                  ...fieldStyle,
                  fontFamily: "Jost, sans-serif",
                  fontSize: "15px",
                  fontWeight: 300,
                  lineHeight: 1.7,
                  minHeight: "120px",
                }}
                rows={5}
              />
              <p
                className="font-sans font-light text-[8px] mt-1 text-right"
                style={{
                  color: thoughtText.length > 900
                    ? "#C0704A"
                    : "var(--text-soft)",
                }}
              >
                {thoughtText.length}/1000 caracteres
              </p>
            </div>

            {/* Collapsible settings */}
            <div>
              <button
                onClick={() => setShowThoughtSettings((v) => !v)}
                className="flex items-center gap-1.5 font-sans text-[9px] font-light tracking-[0.12em] uppercase transition-colors"
                style={{ color: "var(--text-tertiary)" }}
              >
                <span>{showThoughtSettings ? "▲" : "▼"}</span>
                Visibilidade
              </button>
              {showThoughtSettings && (
                <div className="mt-3 flex flex-wrap gap-1.5 animate-in fade-in duration-200">
                  {([
                    { id: "public", label: "Público" },
                    { id: "private", label: "Privado" },
                  ] as const).map((vis) => (
                    <button
                      key={vis.id}
                      data-testid={`thought-visibility-${vis.id}`}
                      onClick={() => setThoughtVisibility(vis.id as Visibility)}
                      className="flex items-center gap-2 px-3 py-2 rounded-[8px] border font-sans text-[10px] font-light transition-all"
                      style={
                        thoughtVisibility === vis.id
                          ? {
                              borderColor: "rgba(174,143,125,0.40)",
                              backgroundColor: "rgba(174,143,125,0.05)",
                              color: "var(--text-primary)",
                            }
                          : {
                              borderColor: "rgba(69,69,69,0.10)",
                              color: "var(--text-tertiary)",
                            }
                      }
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            thoughtVisibility === vis.id ? "#AE8F7D" : "rgba(69,69,69,0.15)",
                        }}
                      />
                      {vis.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* THOUGHT preview */}
            {thoughtText.trim().length >= 20 && (
              <div
                className="rounded-[14px] overflow-hidden animate-in fade-in duration-300"
                style={{
                  backgroundColor: isDark ? "#1F1A17" : "#FAF8F3",
                  border: `1px solid ${isDark ? "rgba(216,183,167,0.18)" : "rgba(174,143,125,0.20)"}`,
                }}
              >
                <div
                  className="px-4 py-2.5 border-b"
                  style={{
                    backgroundColor: isDark ? "rgba(215,183,167,0.06)" : "rgba(174,143,125,0.08)",
                    borderColor: isDark ? "rgba(216,183,167,0.10)" : "rgba(174,143,125,0.12)",
                  }}
                >
                  <p
                    className="font-sans text-[6.5px] font-light tracking-[0.22em] uppercase"
                    style={{ color: isDark ? "#CDB9AA" : "#AE8F7D" }}
                  >
                    Preview · como vai aparecer no feed
                  </p>
                </div>
                <div className="px-4 pt-3.5 pb-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <span
                      className="font-sans text-[7.5px] font-light tracking-[0.18em] uppercase"
                      style={{ color: isDark ? "#CDB9AA" : "#AE8F7D" }}
                    >
                      {THOUGHT_TYPES.find((t) => t.id === thoughtPostType)?.icon}{" "}
                      {THOUGHT_TYPES.find((t) => t.id === thoughtPostType)?.label}
                    </span>
                  </div>
                  <p
                    className="font-sans font-light text-[14px] leading-[1.75]"
                    style={{ color: isDark ? "#EADFD4" : "#2C2A27" }}
                  >
                    {thoughtText.slice(0, 200)}{thoughtText.length > 200 ? "…" : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pb-4" />
      </div>

      {/* Sticky publish button */}
      <div
        className="px-5 py-4 backdrop-blur-sm"
        style={{
          borderTop: "1px solid rgba(174,143,125,0.12)",
          backgroundColor: isDark ? "rgba(28,25,22,0.97)" : "rgba(250,248,243,0.97)",
        }}
      >
        {composerMode === "EXCERPT" && !canPublishExcerpt && (
          <p className="font-sans font-light text-[9px] text-center mb-2" style={{ color: "var(--text-soft)" }}>
            {excerpt.trim().length === 0
              ? "Digite o trecho que ficou com você"
              : !bookId
              ? "Selecione o livro para continuar"
              : ""}
          </p>
        )}
        {composerMode === "THOUGHT" && !canPublishThought && thoughtText.length > 0 && (
          <p className="font-sans font-light text-[9px] text-center mb-2" style={{ color: "var(--text-soft)" }}>
            Escreva pelo menos 20 caracteres
          </p>
        )}
        <button
          data-testid="button-publish-margin"
          onClick={composerMode === "EXCERPT" ? handlePublishExcerpt : handlePublishThought}
          disabled={composerMode === "EXCERPT" ? !canPublishExcerpt : !canPublishThought}
          className="w-full font-sans font-light text-[12px] tracking-[0.14em] uppercase py-4 rounded-[10px] disabled:opacity-25 active:scale-[0.99] transition-all"
          style={{
            backgroundColor: isDark ? "#F3EDE3" : "#454545",
            color: isDark ? "#24211E" : "#FAF8F3",
          }}
        >
          {replyToMargin
            ? "Publicar resposta"
            : composerMode === "THOUGHT"
            ? "Publicar pensamento"
            : "Publicar post"}
        </button>
      </div>
    </div>
  );
}
