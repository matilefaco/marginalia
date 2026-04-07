import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Download, Share2, Loader2, CheckCircle } from "lucide-react";
import { toCanvas } from "html-to-image";
import type { Arquetipo, ArquetipoResult } from "@/data/archetypes";
import { DNA_TRAITS, calcularDnaTrait, getTexturaStyle } from "@/data/archetypes";

/* ── Dimensions ── */
const STORIES_W = 270;  const STORIES_H = 480;
const FEED_W    = 360;  const FEED_H    = 360;

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Jost', sans-serif";

type Format = "stories" | "feed";

interface Props {
  primaryArquetipo: Arquetipo;
  secondaryArquetipo: Arquetipo | null;
  topArquetipos: ArquetipoResult[];
  userName: string;
  userInitials: string;
  onClose: () => void;
}

/* ─────────────────────────────────────────── */
/* ARCHETYPE CARD — shared by preview + export */
/* ─────────────────────────────────────────── */
function ArchetypeCard({
  primaryArquetipo,
  secondaryArquetipo,
  topArquetipos,
  userName,
  isSquare,
}: {
  primaryArquetipo: Arquetipo;
  secondaryArquetipo: Arquetipo | null;
  topArquetipos: ArquetipoResult[];
  userName: string;
  isSquare: boolean;
}) {
  const w = isSquare ? FEED_W : STORIES_W;
  const h = isSquare ? FEED_H : STORIES_H;
  const bg = primaryArquetipo.cor;
  const textColor = primaryArquetipo.corTexto;
  const accent = primaryArquetipo.corAccent;
  const year = new Date().getFullYear();

  const dnaTraits = DNA_TRAITS.map((trait) => ({
    label: trait.label,
    pct: calcularDnaTrait(trait.archetipoIds, topArquetipos),
  }));

  return (
    <div style={{
      width: w,
      height: h,
      background: bg,
      borderRadius: 20,
      overflow: "hidden",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      fontFamily: SANS,
    }}>
      {/* Texture layer */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: getTexturaStyle(primaryArquetipo.textura),
        backgroundSize: "6px 6px",
        opacity: 0.55,
        pointerEvents: "none",
      }} />

      {/* Vignette */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 90% 70% at 50% 120%, rgba(0,0,0,0.28) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* Dog-ear top-right */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 36, height: 36, overflow: "hidden" }}>
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderStyle: "solid",
          borderWidth: "0 36px 36px 0",
          borderColor: `transparent rgba(255,255,255,0.10) transparent transparent`,
        }} />
      </div>

      {/* Content */}
      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: isSquare ? "22px 24px" : "32px 28px",
      }}>

        {/* ── Header row ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: isSquare ? 16 : 24 }}>
          <div>
            <div style={{
              fontFamily: SANS,
              fontSize: 8,
              fontWeight: 400,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: accent,
              marginBottom: 3,
            }}>
              {primaryArquetipo.numero} · Identidade de leitura
            </div>
          </div>
          {/* marginalia brand */}
          <div style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 13,
            letterSpacing: "0.04em",
            color: accent,
            opacity: 0.75,
          }}>
            marginalia
          </div>
        </div>

        {/* ── Archetype name ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: isSquare ? 32 : 40,
            lineHeight: 1.05,
            color: textColor,
            letterSpacing: "-0.01em",
            marginBottom: 6,
          }}>
            {primaryArquetipo.nome}
          </div>

          {secondaryArquetipo && (
            <div style={{
              fontFamily: SANS,
              fontSize: 9,
              fontWeight: 300,
              letterSpacing: "0.10em",
              color: accent,
              opacity: 0.75,
              marginBottom: 12,
            }}>
              {primaryArquetipo.nome} · {secondaryArquetipo.nome}
            </div>
          )}

          {/* Frase */}
          <div style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: isSquare ? 13 : 15,
            lineHeight: 1.6,
            color: accent,
            marginBottom: isSquare ? 14 : 20,
            maxWidth: isSquare ? 280 : 220,
          }}>
            &ldquo;{primaryArquetipo.frase}&rdquo;
          </div>

          {/* Traço pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: isSquare ? 14 : 20 }}>
            {primaryArquetipo.tracos.map((traco) => (
              <div key={traco} style={{
                fontFamily: SANS,
                fontSize: 7.5,
                fontWeight: 400,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: textColor,
                border: `0.5px solid ${accent}60`,
                borderRadius: 20,
                padding: "3px 10px",
                background: `${accent}14`,
              }}>
                {traco}
              </div>
            ))}
          </div>

          {/* DNA bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: isSquare ? 7 : 10 }}>
            {dnaTraits.map((t) => (
              <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  fontFamily: SANS,
                  fontSize: 8,
                  fontWeight: 400,
                  letterSpacing: "0.10em",
                  color: `${textColor}90`,
                  minWidth: isSquare ? 54 : 50,
                }}>
                  {t.label}
                </div>
                <div style={{ flex: 1, height: 2, background: `${textColor}18`, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${t.pct}%`,
                    background: `linear-gradient(90deg, ${accent}CC, ${accent}66)`,
                    borderRadius: 2,
                  }} />
                </div>
                <div style={{
                  fontFamily: SERIF,
                  fontSize: 10,
                  color: `${accent}AA`,
                  minWidth: 22,
                  textAlign: "right",
                }}>
                  {t.pct}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: isSquare ? 14 : 20,
          paddingTop: isSquare ? 10 : 14,
          borderTop: `0.5px solid ${accent}28`,
        }}>
          <div>
            <div style={{
              fontFamily: SANS,
              fontSize: 7.5,
              fontWeight: 400,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: `${accent}80`,
              marginBottom: 2,
            }}>
              Tipo de leitor
            </div>
            <div style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 11,
              color: `${accent}99`,
            }}>
              {userName} · {year}
            </div>
          </div>

          {/* Small marginalia mark bottom-right */}
          <div style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 10,
            color: `${accent}55`,
            letterSpacing: "0.04em",
          }}>
            marginalia
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* MAIN MODAL                                  */
/* ─────────────────────────────────────────── */
export function ArchetypeShareModal({
  primaryArquetipo,
  secondaryArquetipo,
  topArquetipos,
  userName,
  userInitials: _userInitials,
  onClose,
}: Props) {
  const [format, setFormat] = useState<Format>("stories");
  const [exporting, setExporting] = useState(false);
  const [shared, setShared] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);

  const previewAreaRef   = useRef<HTMLDivElement>(null);
  const exportWrapperRef = useRef<HTMLDivElement>(null);
  const exportCardRef    = useRef<HTMLDivElement>(null);

  const isSquare = format === "feed";
  const cardW = isSquare ? FEED_W : STORIES_W;
  const cardH = isSquare ? FEED_H : STORIES_H;

  /* Responsive preview scale */
  useEffect(() => {
    const area = previewAreaRef.current;
    if (!area) return;
    const compute = () => {
      const { width, height } = area.getBoundingClientRect();
      setPreviewScale(Math.min(1, (height - 16) / cardH, (width - 40) / cardW));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(area);
    return () => ro.disconnect();
  }, [cardW, cardH]);

  /* Capture via html-to-image */
  const captureCanvas = useCallback(async () => {
    if (!exportCardRef.current || !exportWrapperRef.current) return null;
    exportWrapperRef.current.style.left = "0px";
    try {
      await document.fonts.ready;
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      return await toCanvas(exportCardRef.current, {
        pixelRatio: isSquare ? 3 : 4,
        backgroundColor: primaryArquetipo.cor,
        width: cardW,
        height: cardH,
        cacheBust: true,
        skipFonts: false,
      });
    } finally {
      exportWrapperRef.current.style.left = "-9999px";
    }
  }, [isSquare, cardW, cardH, primaryArquetipo.cor]);

  const slug = primaryArquetipo.nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const doDownload = useCallback(async () => {
    const canvas = await captureCanvas();
    if (!canvas) throw new Error("Capture failed");
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.93));
    if (!blob) throw new Error("Blob failed");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marginalia-arquetipo-${format}-${slug}.jpg`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  }, [captureCanvas, format, slug]);

  const handleDownload = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try { await doDownload(); } catch (e) { console.error("[ArchetypeShare] download:", e); }
    finally { setExporting(false); }
  }, [exporting, doDownload]);

  const handleShare = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.93));
      if (!blob) return;
      const file = new File([blob], `marginalia-arquetipo-${format}-${slug}.jpg`, { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Marginalia",
          text: `${primaryArquetipo.nome} · ${primaryArquetipo.frase} — Marginalia`,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      } else {
        await doDownload();
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") await doDownload();
    } finally {
      setExporting(false);
    }
  }, [exporting, captureCanvas, format, slug, primaryArquetipo, doDownload]);

  /* Off-screen export portal */
  const exportPortal = createPortal(
    <div
      ref={exportWrapperRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: "-9999px",
        width: cardW,
        height: cardH,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div ref={exportCardRef} style={{ width: cardW, height: cardH }}>
        <ArchetypeCard
          primaryArquetipo={primaryArquetipo}
          secondaryArquetipo={secondaryArquetipo}
          topArquetipos={topArquetipos}
          userName={userName}
          isSquare={isSquare}
        />
      </div>
    </div>,
    document.body
  );

  const modalPortal = createPortal(
    <div
      data-archetype-share-overlay
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: "rgba(14,12,10,0.97)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <div>
          <p className="font-serif italic text-[18px] text-[#FAF8F3]">Compartilhar</p>
          <p className="font-sans font-light text-[9px] tracking-[0.22em] uppercase text-[#FAF8F3]/30 mt-0.5">
            Identidade de leitura
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full border border-[#FAF8F3]/12 flex items-center justify-center text-[#FAF8F3]/40 hover:text-[#FAF8F3]/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Format toggle ── */}
      <div className="px-5 mb-3 flex-shrink-0 flex items-center gap-2">
        <p className="font-sans text-[8px] tracking-[0.18em] uppercase text-[#FAF8F3]/20 mr-1">Formato</p>
        {(["stories", "feed"] as Format[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`px-4 py-1.5 rounded-full font-sans text-[9px] tracking-[0.18em] uppercase transition-all duration-200 ${
              format === f
                ? "text-[#FAF8F3] shadow-md"
                : "border border-[#FAF8F3]/15 text-[#FAF8F3]/35 hover:border-[#FAF8F3]/30"
            }`}
            style={format === f ? { backgroundColor: primaryArquetipo.corAccent } : {}}
          >
            {f === "stories" ? "Stories 9:16" : "Feed 1:1"}
          </button>
        ))}
      </div>

      {/* ── Preview ── */}
      <div
        ref={previewAreaRef}
        className="flex-1 flex items-center justify-center min-h-0 overflow-hidden px-5"
      >
        <div style={{
          width: cardW * previewScale,
          height: cardH * previewScale,
          position: "relative",
          flexShrink: 0,
          transition: "width 0.2s ease, height 0.2s ease",
        }}>
          <div
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
            className="shadow-2xl rounded-[20px] overflow-hidden"
          >
            <ArchetypeCard
              primaryArquetipo={primaryArquetipo}
              secondaryArquetipo={secondaryArquetipo}
              topArquetipos={topArquetipos}
              userName={userName}
              isSquare={isSquare}
            />
          </div>
        </div>
      </div>

      {/* ── Format label ── */}
      <div className="text-center py-2 flex-shrink-0">
        <span className="font-sans text-[8px] tracking-[0.2em] uppercase text-[#FAF8F3]/18">
          {isSquare ? "1080 × 1080 px" : "1080 × 1920 px"}
        </span>
      </div>

      {/* ── Actions ── */}
      <div className="px-5 pb-6 flex gap-3 flex-shrink-0">
        <button
          onClick={handleDownload}
          disabled={exporting}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] font-sans text-[10px] tracking-[0.18em] uppercase transition-all border border-[#FAF8F3]/15 text-[#FAF8F3]/55 hover:border-[#FAF8F3]/30 hover:text-[#FAF8F3]/80 disabled:opacity-40"
        >
          {exporting && !shared
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : downloaded
            ? <CheckCircle className="w-4 h-4 text-[#697962]" />
            : <Download className="w-4 h-4" />}
          {downloaded ? "Baixado!" : "Baixar"}
        </button>
        <button
          onClick={handleShare}
          disabled={exporting}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] font-sans text-[10px] tracking-[0.18em] uppercase transition-all disabled:opacity-40"
          style={{ backgroundColor: primaryArquetipo.corAccent, color: primaryArquetipo.cor }}
        >
          {exporting && !downloaded
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : shared
            ? <CheckCircle className="w-4 h-4" />
            : <Share2 className="w-4 h-4" />}
          {shared ? "Compartilhado!" : "Compartilhar"}
        </button>
      </div>
    </div>,
    document.body
  );

  return <>{exportPortal}{modalPortal}</>;
}
