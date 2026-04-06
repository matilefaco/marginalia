import { useRef, useState, useCallback, useEffect } from "react";
import { X, Download, Share2, Loader2 } from "lucide-react";
import type { Margin } from "@/data/mockData";
import { MOCK_USERS } from "@/data/mockData";
import { MARGIN_TYPES } from "@/data/constants";
import { useApp } from "@/context/AppContext";
import { formatReference } from "@/utils/formatting";
import html2canvas from "html2canvas";

const C = {
  parchment: "#FAF7F2",
  parchmentWarm: "#F5F0E8",
  ink: "#2A2420",
  inkSoft: "#4A3F38",
  rose: "#C9A99A",
  roseLight: "#E8D5CD",
  roseDark: "#A07868",
  sage: "#8A9E8C",
  border: "rgba(42,36,32,0.08)",
} as const;

const SERIF = "'Cormorant Garamond', 'EB Garamond', Georgia, serif";
const SANS = "'Jost', 'Raleway', sans-serif";

type Format = "stories" | "feed";
type StoryTpl = "quote" | "moment";
type FeedTpl = "reaction" | "symbolic";

interface ShareCardModalProps {
  margin: Margin;
  onClose: () => void;
}

function getUsername(userId: string) {
  const u = MOCK_USERS.find((u) => u.id === userId);
  return u ? u.username : "@leitor";
}

function topReactions(reactions: Record<string, number>, max = 2) {
  return Object.entries(reactions)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max);
}

function getTypeLabel(postType: string) {
  return MARGIN_TYPES.find((t) => t.id === postType)?.label ?? "Margem";
}

function getTypeIcon(postType: string) {
  const icons: Record<string, string> = {
    insight: "💡",
    theory: "🔭",
    critique: "⚡",
    question: "❓",
    reaction: "✦",
    favorite_quote: "✨",
    personal_connection: "🤍",
    symbolic_reading: "⊕",
  };
  return icons[postType] ?? "✦";
}

/* ───────────────────────────────────────── */
/* CARD 1 — Stories · Citação (light)       */
/* ───────────────────────────────────────── */
function QuoteStoryCard({ margin }: { margin: Margin }) {
  const username = getUsername(margin.userId);
  const reactions = topReactions(margin.reactions);
  return (
    <div
      style={{
        width: 270,
        height: 480,
        background: C.parchment,
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: SANS,
      }}
    >
      {/* paper grain */}
      <div style={{ position: "absolute", inset: 0, background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")", pointerEvents: "none", zIndex: 10 }} />
      {/* accent line */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(to bottom, ${C.roseLight}, ${C.rose}, ${C.roseLight})` }} />
      {/* corner bracket */}
      <span style={{ position: "absolute", top: -10, left: 12, fontFamily: SERIF, fontSize: 64, color: C.roseLight, opacity: 0.3, lineHeight: 1, zIndex: 1 }}>[</span>

      {/* top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 22px 0 22px" }}>
        <span style={{ fontSize: 7, letterSpacing: "0.28em", textTransform: "uppercase", color: C.roseDark, display: "flex", alignItems: "center", gap: 4 }}>
          ✦ Citação favorita
        </span>
        <span style={{ fontFamily: SERIF, fontSize: 9.5, letterSpacing: "0.18em", color: `${C.ink}55`, fontStyle: "italic" }}>marginalia</span>
      </div>

      {/* body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "20px 28px 12px 28px" }}>
        <span style={{ fontFamily: SERIF, fontSize: 48, color: C.roseLight, lineHeight: 1, marginBottom: -6, display: "block" }}>"</span>
        <p style={{ fontFamily: SERIF, fontSize: 16.5, fontStyle: "italic", lineHeight: 1.55, color: C.ink, letterSpacing: "0.01em", margin: 0 }}>
          {margin.excerpt.length > 180 ? margin.excerpt.slice(0, 180) + "…" : margin.excerpt}
        </p>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 7.5, letterSpacing: "0.22em", textTransform: "uppercase", color: C.inkSoft, opacity: 0.6 }}>{margin.bookTitle}</span>
          <span style={{ fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase", color: C.rose, opacity: 0.75 }}>
            {margin.bookAuthor}{formatReference(margin) ? ` · ${formatReference(margin)}` : ""}
          </span>
        </div>
      </div>

      {/* footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: SANS, fontSize: 8, fontWeight: 600, color: C.parchment, letterSpacing: "0.04em" }}>{margin.userInitials}</span>
          </div>
          <div>
            <span style={{ fontSize: 9.5, fontWeight: 500, color: C.ink, display: "block" }}>{margin.userName}</span>
            <span style={{ fontSize: 8, color: `${C.ink}55`, letterSpacing: "0.04em" }}>{username}</span>
          </div>
        </div>
        {reactions.length > 0 && (
          <div style={{ display: "flex", gap: 3 }}>
            {reactions.map(([emoji, count]) => (
              <div key={emoji} style={{ background: C.parchmentWarm, border: `1px solid ${C.border}`, borderRadius: 20, padding: "2.5px 7px", fontSize: 10, display: "flex", alignItems: "center", gap: 2 }}>
                {emoji} <span style={{ fontSize: 7, color: C.inkSoft, opacity: 0.6 }}>{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* corner bracket bottom */}
      <span style={{ position: "absolute", bottom: -18, right: 12, fontFamily: SERIF, fontSize: 64, color: C.roseLight, opacity: 0.3, lineHeight: 1, transform: "rotate(180deg)" }}>[</span>
    </div>
  );
}

/* ───────────────────────────────────────── */
/* CARD 2 — Stories · Momento (dark)         */
/* ───────────────────────────────────────── */
function MomentStoryCard({ margin, progressPct }: { margin: Margin; progressPct: number }) {
  const username = getUsername(margin.userId);
  const ecosCount = Object.values(margin.reactions).reduce((a, b) => a + b, 0);
  return (
    <div
      style={{
        width: 270,
        height: 480,
        background: "linear-gradient(145deg, #2A2420 0%, #1A1614 100%)",
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        fontFamily: SANS,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", padding: "24px 22px" }}>
        {/* top */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <span style={{ fontSize: 7.5, letterSpacing: "0.28em", textTransform: "uppercase", color: `${C.parchment}50` }}>Minha leitura agora</span>
          <span style={{ fontFamily: SERIF, fontSize: 9.5, letterSpacing: "0.18em", color: `${C.parchment}33`, fontStyle: "italic" }}>marginalia</span>
        </div>

        {/* book */}
        <p style={{ fontFamily: SERIF, fontSize: 26, fontStyle: "italic", fontWeight: 400, color: C.parchment, lineHeight: 1.15, marginBottom: 4 }}>
          {margin.bookTitle}
        </p>
        <p style={{ fontSize: 7.5, letterSpacing: "0.22em", textTransform: "uppercase", color: `${C.parchment}50`, marginBottom: 20 }}>{margin.bookAuthor}</p>

        {/* progress */}
        {progressPct > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ fontSize: 7.5, letterSpacing: "0.18em", textTransform: "uppercase", color: `${C.parchment}50` }}>Progresso</span>
              <span style={{ fontFamily: SERIF, fontSize: 15, fontStyle: "italic", color: C.roseLight }}>{progressPct}%</span>
            </div>
            <div style={{ height: 2, background: `${C.parchment}14`, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: `linear-gradient(to right, ${C.roseDark}, ${C.roseLight})`, width: `${progressPct}%`, borderRadius: 2 }} />
            </div>
          </div>
        )}

        {/* passage */}
        <div style={{ flex: 1, borderLeft: `2px solid ${C.rose}55`, paddingLeft: 14, marginBottom: 20 }}>
          <p style={{ fontFamily: SERIF, fontSize: 14, fontStyle: "italic", lineHeight: 1.6, color: `${C.parchment}C0`, margin: 0 }}>
            {margin.excerpt.length > 160 ? `"${margin.excerpt.slice(0, 160)}…"` : `"${margin.excerpt}"`}
          </p>
          {formatReference(margin) && (
            <p style={{ marginTop: 8, fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase", color: `${C.parchment}33` }}>{formatReference(margin)}</p>
          )}
        </div>

        {/* footer */}
        <div style={{ borderTop: `1px solid ${C.parchment}10`, paddingTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 9.5, color: `${C.parchment}66` }}>{username}</span>
          {ecosCount > 0 && (
            <span style={{ fontSize: 7.5, letterSpacing: "0.16em", textTransform: "uppercase", background: `${C.rose}20`, color: C.roseLight, padding: "4px 10px", borderRadius: 20, border: `1px solid ${C.rose}25` }}>
              {ecosCount} ecos
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────── */
/* CARD 3 — Feed · Reação (light)            */
/* ───────────────────────────────────────── */
function ReactionFeedCard({ margin }: { margin: Margin }) {
  const username = getUsername(margin.userId);
  const reactions = topReactions(margin.reactions, 3);
  const typeLabel = getTypeLabel(margin.postType);
  const typeIcon = getTypeIcon(margin.postType);
  return (
    <div
      style={{
        width: 360,
        height: 360,
        background: C.parchment,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 24,
        fontFamily: SANS,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")", pointerEvents: "none", zIndex: 10 }} />
      <span style={{ position: "absolute", top: -8, left: 10, fontFamily: SERIF, fontSize: 54, color: C.roseLight, opacity: 0.15, lineHeight: 1, zIndex: 1 }}>[</span>

      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 7, letterSpacing: "0.24em", textTransform: "uppercase", color: C.roseDark }}>
          {typeIcon} {typeLabel}{formatReference(margin) ? ` · ${formatReference(margin)}` : ""}
        </span>
        <span style={{ fontFamily: SERIF, fontSize: 9.5, fontStyle: "italic", color: `${C.ink}40`, letterSpacing: "0.14em" }}>marginalia</span>
      </div>

      {/* quote */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 12 }}>
        <blockquote style={{ fontFamily: SERIF, fontSize: 16, fontStyle: "italic", lineHeight: 1.55, color: C.ink, borderLeft: `2px solid ${C.rose}`, paddingLeft: 14, margin: "0 0 12px 0" }}>
          {margin.excerpt.length > 160 ? `"${margin.excerpt.slice(0, 160)}…"` : `"${margin.excerpt}"`}
        </blockquote>
        {margin.commentary && (
          <p style={{ fontSize: 11, lineHeight: 1.6, color: C.inkSoft, opacity: 0.8, margin: "0 0 8px 0" }}>
            {margin.commentary.length > 140 ? margin.commentary.slice(0, 140) + "…" : margin.commentary}
          </p>
        )}
        <span style={{ fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase", color: `${C.ink}55` }}>
          {margin.bookTitle} · {margin.bookAuthor}
        </span>
      </div>

      {/* footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 7, fontWeight: 600, color: C.parchment }}>{margin.userInitials}</span>
          </div>
          <div>
            <span style={{ fontSize: 9, fontWeight: 500, color: C.ink, display: "block" }}>{margin.userName}</span>
            <span style={{ fontSize: 7.5, color: `${C.ink}55` }}>{username}</span>
          </div>
        </div>
        {reactions.length > 0 && (
          <div style={{ display: "flex", gap: 2 }}>
            {reactions.map(([emoji, count]) => (
              <div key={emoji} style={{ background: C.parchmentWarm, border: `1px solid ${C.border}`, borderRadius: 20, padding: "2px 6px", fontSize: 9.5 }}>
                {emoji} <span style={{ fontSize: 7, color: C.inkSoft, opacity: 0.6 }}>{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────── */
/* CARD 4 — Feed · Simbólica (warm/sage)     */
/* ───────────────────────────────────────── */
function SymbolicFeedCard({ margin }: { margin: Margin }) {
  const username = getUsername(margin.userId);
  const ecosCount = Object.values(margin.reactions).reduce((a, b) => a + b, 0);
  const typeLabel = getTypeLabel(margin.postType);
  return (
    <div
      style={{
        width: 360,
        height: 360,
        background: C.parchmentWarm,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 24,
        fontFamily: SANS,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")", pointerEvents: "none", zIndex: 10 }} />
      <span style={{ position: "absolute", top: -8, left: 10, fontFamily: SERIF, fontSize: 54, color: C.roseLight, opacity: 0.12, lineHeight: 1, zIndex: 1 }}>[</span>

      {/* header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 7, letterSpacing: "0.24em", textTransform: "uppercase", color: C.sage }}>
          ⊕ {typeLabel}{formatReference(margin) ? ` · ${formatReference(margin)}` : ""}
        </span>
        <span style={{ fontFamily: SERIF, fontSize: 9.5, fontStyle: "italic", color: `${C.ink}40`, letterSpacing: "0.14em" }}>marginalia</span>
      </div>

      {/* quote */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: 12 }}>
        <blockquote style={{ fontFamily: SERIF, fontSize: 16, fontStyle: "italic", lineHeight: 1.55, color: C.ink, borderLeft: `2px solid ${C.sage}`, paddingLeft: 14, margin: "0 0 12px 0" }}>
          {margin.excerpt.length > 160 ? `"${margin.excerpt.slice(0, 160)}…"` : `"${margin.excerpt}"`}
        </blockquote>
        {margin.commentary && (
          <p style={{ fontSize: 11, lineHeight: 1.6, color: C.inkSoft, opacity: 0.8, margin: "0 0 8px 0" }}>
            {margin.commentary.length > 140 ? margin.commentary.slice(0, 140) + "…" : margin.commentary}
          </p>
        )}
        <span style={{ fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase", color: `${C.ink}55` }}>
          {margin.bookTitle} · {margin.bookAuthor}
        </span>
      </div>

      {/* footer */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.sage, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 7, fontWeight: 600, color: C.parchment }}>{margin.userInitials}</span>
          </div>
          <div>
            <span style={{ fontSize: 9, fontWeight: 500, color: C.ink, display: "block" }}>{margin.userName}</span>
            <span style={{ fontSize: 7.5, color: `${C.ink}55` }}>{username}</span>
          </div>
        </div>
        {ecosCount > 0 && (
          <span style={{ fontSize: 9, color: `${C.ink}55`, letterSpacing: "0.08em" }}>{ecosCount} ecoaram isso</span>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────── */
/* MAIN MODAL                                */
/* ───────────────────────────────────────── */
export function ShareCardModal({ margin, onClose }: ShareCardModalProps) {
  const { getProgressForBook } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<Format>("stories");
  const [storyTpl, setStoryTpl] = useState<StoryTpl>("quote");
  const [feedTpl, setFeedTpl] = useState<FeedTpl>("reaction");
  const [exporting, setExporting] = useState(false);
  const [shared, setShared] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);

  const progress = getProgressForBook(margin.bookId);
  const progressPct = progress?.status === "reading" ? (progress.currentPercent ?? 0) : 0;

  const isStories = format === "stories";
  const cardW = isStories ? 270 : 360;
  const cardH = isStories ? 480 : 360;

  /* recompute scale whenever the preview area or card dims change */
  useEffect(() => {
    const area = previewAreaRef.current;
    if (!area) return;
    const compute = () => {
      const { width, height } = area.getBoundingClientRect();
      const availW = width - 40; // 20px padding each side
      const availH = height - 16; // small breathing room
      const scaleH = availH / cardH;
      const scaleW = availW / cardW;
      setPreviewScale(Math.min(1, scaleH, scaleW));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(area);
    return () => ro.disconnect();
  }, [cardW, cardH]);

  const captureCanvas = useCallback(async () => {
    if (!cardRef.current) return null;
    const outputScale = isStories ? 4 : 3;
    return html2canvas(cardRef.current, {
      scale: outputScale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });
  }, [isStories]);

  const handleDownload = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `marginalia-${isStories ? "stories" : "feed"}-${margin.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, [exporting, isStories, margin.id, captureCanvas]);

  const handleShare = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;
      const file = new File([blob], `marginalia-${margin.id}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Marginalia",
          text: `"${margin.excerpt.slice(0, 100)}" — ${margin.bookTitle}`,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      } else {
        /* fallback: download the image */
        await handleDownload();
      }
    } catch {
      /* user cancelled or share unavailable — fallback silently */
      await handleDownload();
    } finally {
      setExporting(false);
    }
  }, [exporting, margin, handleDownload, captureCanvas]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(26,22,20,0.96)", backdropFilter: "blur(10px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-safe-top pb-3 flex-shrink-0 pt-5">
        <div>
          <p className="font-serif italic text-[17px] text-[#FAF7F2]">Compartilhar</p>
          <p className="font-sans font-light text-[9px] tracking-[0.22em] uppercase text-[#FAF7F2]/30 mt-0.5">
            Stories · Feed · Instagram
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full border border-[#FAF7F2]/10 flex items-center justify-center text-[#FAF7F2]/40 hover:text-[#FAF7F2]/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Format tabs ── */}
      <div className="flex gap-2 px-5 mb-3 flex-shrink-0">
        {(["stories", "feed"] as Format[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`px-4 py-2 rounded-full font-sans text-[9px] tracking-[0.2em] uppercase transition-all duration-200 ${
              format === f
                ? "bg-[#C9A99A] text-[#2A2420] shadow-lg"
                : "border border-[#FAF7F2]/15 text-[#FAF7F2]/45 hover:border-[#FAF7F2]/30 hover:text-[#FAF7F2]/65"
            }`}
          >
            {f === "stories" ? "Stories 9:16" : "Feed 1:1"}
          </button>
        ))}
      </div>

      {/* ── Template sub-selector ── */}
      <div className="flex gap-2 px-5 mb-3 flex-shrink-0">
        {isStories ? (
          <>
            {(["quote", "moment"] as StoryTpl[]).map((t) => (
              <button
                key={t}
                onClick={() => setStoryTpl(t)}
                className={`px-3 py-1 rounded-full font-sans text-[8px] tracking-[0.15em] uppercase transition-all duration-200 ${
                  storyTpl === t
                    ? "bg-[#FAF7F2]/12 text-[#FAF7F2]/85 border border-[#FAF7F2]/22"
                    : "text-[#FAF7F2]/30 hover:text-[#FAF7F2]/55"
                }`}
              >
                {t === "quote" ? "Citação" : "Momento"}
              </button>
            ))}
          </>
        ) : (
          <>
            {(["reaction", "symbolic"] as FeedTpl[]).map((t) => (
              <button
                key={t}
                onClick={() => setFeedTpl(t)}
                className={`px-3 py-1 rounded-full font-sans text-[8px] tracking-[0.15em] uppercase transition-all duration-200 ${
                  feedTpl === t
                    ? "bg-[#FAF7F2]/12 text-[#FAF7F2]/85 border border-[#FAF7F2]/22"
                    : "text-[#FAF7F2]/30 hover:text-[#FAF7F2]/55"
                }`}
              >
                {t === "reaction" ? "Reação" : "Simbólica"}
              </button>
            ))}
          </>
        )}
      </div>

      {/* ── Card preview — grows to fill remaining space ── */}
      <div
        ref={previewAreaRef}
        className="flex-1 flex items-center justify-center min-h-0 overflow-hidden px-5"
      >
        {/* Scaled outer shell — takes up only the visually-scaled footprint */}
        <div
          style={{
            width: cardW * previewScale,
            height: cardH * previewScale,
            position: "relative",
            flexShrink: 0,
            transition: "width 0.2s ease, height 0.2s ease",
          }}
        >
          {/* Inner card rendered at natural size, then scaled visually */}
          <div
            ref={cardRef}
            style={{
              width: cardW,
              height: cardH,
              position: "absolute",
              top: 0,
              left: 0,
              transform: `scale(${previewScale})`,
              transformOrigin: "top left",
              transition: "transform 0.2s ease",
            }}
            className="shadow-2xl"
          >
            {isStories && storyTpl === "quote" && <QuoteStoryCard margin={margin} />}
            {isStories && storyTpl === "moment" && <MomentStoryCard margin={margin} progressPct={progressPct} />}
            {!isStories && feedTpl === "reaction" && <ReactionFeedCard margin={margin} />}
            {!isStories && feedTpl === "symbolic" && <SymbolicFeedCard margin={margin} />}
          </div>
        </div>
      </div>

      {/* ── Format label ── */}
      <div className="text-center py-2 flex-shrink-0">
        <span className="font-sans text-[8px] tracking-[0.2em] uppercase text-[#FAF7F2]/20">
          {isStories ? "1080 × 1920 px · Instagram Stories" : "1080 × 1080 px · Instagram Feed"}
        </span>
      </div>

      {/* ── Action buttons — always pinned above safe area ── */}
      <div
        className="flex gap-3 px-5 flex-shrink-0"
        style={{ paddingBottom: "max(32px, env(safe-area-inset-bottom, 16px) + 16px)" }}
      >
        <button
          onClick={handleDownload}
          disabled={exporting}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[12px] border border-[#FAF7F2]/15 text-[#FAF7F2]/60 hover:border-[#FAF7F2]/30 hover:text-[#FAF7F2]/85 active:scale-95 transition-all duration-150 font-sans text-[10px] tracking-[0.18em] uppercase disabled:opacity-35"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Baixar
        </button>
        <button
          onClick={handleShare}
          disabled={exporting}
          className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-[12px] bg-[#C9A99A] text-[#2A2420] hover:bg-[#D4B5A8] active:scale-95 active:bg-[#BFA090] transition-all duration-150 font-sans text-[10px] tracking-[0.18em] uppercase disabled:opacity-35 font-medium shadow-lg"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
          {shared ? "Compartilhado!" : "Compartilhar"}
        </button>
      </div>
    </div>
  );
}
