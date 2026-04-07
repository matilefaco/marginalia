import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Download, Share2, Loader2, CheckCircle } from "lucide-react";
import type { Margin } from "@/data/mockData";
import { MOCK_USERS, MOCK_MARGINS } from "@/data/mockData";
import { MARGIN_TYPES } from "@/data/constants";
import { useApp } from "@/context/AppContext";
import { formatReference } from "@/utils/formatting";
import { toCanvas } from "html-to-image";

/* ── Brand tokens ── */
const T = {
  albescent:  "#FAF8F3",
  heather:    "#AE8F7D",
  oldVine:    "#697962",
  doeskin:    "#BDAB9C",
  metal:      "#2A2A2A",
  metalLight: "#5A5450",
  creamMid:   "#F0EDE6",
  parchment:  "#E8E3D9",
} as const;

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS  = "'Jost', sans-serif";

type Template = "quote-light" | "quote-dark" | "moment" | "reader-type" | "echo" | "reading-dna";
type Format   = "stories" | "feed";

/* ── Context types — what the caller passes ── */
export type ShareContext =
  | { type: "eco";     margin: Margin }
  | { type: "profile"; userId: string; userName: string; userInitials: string };

/* ── Dimensions ── */
const STORIES_W = 270; const STORIES_H = 480;
const FEED_W    = 360; const FEED_H    = 360;

interface Props { context: ShareContext; onClose: () => void; }

/* ── Context configuration: which templates appear, and defaults ── */
const CONTEXT_CONFIG: Record<ShareContext["type"], {
  templates: Template[];
  defaultTemplate: Template;
  defaultFormat: Format;
  subtitle: string;
}> = {
  eco: {
    templates:       ["echo", "quote-light", "quote-dark"],
    defaultTemplate: "echo",
    defaultFormat:   "feed",
    subtitle:        "Post · Citação Light · Citação Dark",
  },
  profile: {
    templates:       ["reader-type", "reading-dna"],
    defaultTemplate: "reader-type",
    defaultFormat:   "stories",
    subtitle:        "Tipo de Leitor · DNA de Leitura",
  },
};

/* ── Template display metadata ── */
const TEMPLATE_META: Record<Template, { label: string; icon: string; preferred: Format }> = {
  "echo":         { label: "Post",   icon: "◎",  preferred: "feed"    },
  "quote-light":  { label: "Citação Light",  icon: "✦",  preferred: "stories" },
  "quote-dark":   { label: "Citação Dark",   icon: "●",  preferred: "feed"    },
  "moment":       { label: "Momento",        icon: "◦",  preferred: "stories" },
  "reader-type":  { label: "Tipo de Leitor", icon: "🔭", preferred: "stories" },
  "reading-dna":  { label: "DNA de Leitura", icon: "∿",  preferred: "stories" },
};

/* ── Helpers ── */
function getUsername(userId: string) {
  return MOCK_USERS.find(u => u.id === userId)?.username ?? "@leitor";
}
function topReactions(r: Record<string, number>, max = 2) {
  return Object.entries(r).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1]).slice(0, max);
}
function getTypeLabel(t: string) { return MARGIN_TYPES.find(x => x.id === t)?.label ?? "Margem"; }
function getTypeIcon(t: string) {
  const m: Record<string,string> = { insight:"💡", theory:"🔭", critique:"⚡", question:"❓",
    reaction:"✦", favorite_quote:"✨", personal_connection:"🤍", symbolic_reading:"⊕" };
  return m[t] ?? "✦";
}

/* ── Reader profile computation ── */
function computeReaderProfile(userId: string) {
  const margins = MOCK_MARGINS.filter(m => m.userId === userId);
  const total   = margins.length || 1;
  const cnt = (types: string[]) => margins.filter(m => types.includes(m.postType)).length;
  const scores = {
    sensivel:  cnt(["reaction","personal_connection","favorite_quote"]),
    analitico: cnt(["insight","theory"]),
    critico:   cnt(["critique"]),
    curioso:   cnt(["question"]),
    simbolico: cnt(["symbolic_reading"]),
  };
  const dominant = (Object.entries(scores).sort((a,b) => b[1]-a[1])[0]?.[0] ?? "sensivel") as keyof typeof scores;
  const archetypes = {
    sensivel:  { name: "O Sensível",   desc: "Deixa as palavras tocarem fundo.", emoji: "🤍", tags: ["Leitor emocional","Tocado por detalhes","Curioso"] },
    analitico: { name: "O Analítico",  desc: "Encontra padrões onde outros veem história.", emoji: "🔭", tags: ["Leitor atento","Criterioso","Observador"] },
    critico:   { name: "O Crítico",    desc: "Lê com olhar afiado e voz precisa.", emoji: "⚡", tags: ["Opinativo","Criterioso","Preciso"] },
    curioso:   { name: "O Curioso",    desc: "Cada página levanta uma nova pergunta.", emoji: "❓", tags: ["Investigativo","Aberto","Perguntador"] },
    simbolico: { name: "O Simbólico",  desc: "Lê entre as linhas com olhar poético.", emoji: "⊕", tags: ["Simbólico","Interpretativo","Profundo"] },
  };
  const archetype = archetypes[dominant] ?? archetypes.sensivel;
  const books = [...new Set(margins.map(m => m.bookTitle))].slice(0, 4);
  const totalEcos = margins.reduce((s, m) => s + Object.values(m.reactions as Record<string,number>).reduce((a,b) => a+b, 0), 0);
  const traits = [
    { name: "Sensível",  value: Math.max(12, Math.round(scores.sensivel  / total * 100)) },
    { name: "Analítico", value: Math.max(10, Math.round(scores.analitico / total * 100)) },
    { name: "Crítico",   value: Math.max(6,  Math.round(scores.critico   / total * 100)) },
    { name: "Curioso",   value: Math.max(12, Math.round(scores.curioso   / total * 100)) },
  ];
  return { archetype, traits, books, stats: { margins: margins.length, ecos: totalEcos, books: books.length } };
}

/* ─────────────────────────────────────────── */
/* CARD 1 — Citação Favorita Light             */
/* ─────────────────────────────────────────── */
function CardQuoteLight({ margin, isSquare }: { margin: Margin; isSquare?: boolean }) {
  const w = isSquare ? FEED_W : STORIES_W;
  const h = isSquare ? FEED_H : STORIES_H;
  const username = getUsername(margin.userId);
  const reactions = topReactions(margin.reactions);
  const excerpt = margin.excerpt.length > (isSquare ? 140 : 200) ? margin.excerpt.slice(0, isSquare ? 140 : 200) + "…" : margin.excerpt;
  return (
    <div style={{ width: w, height: h, background: T.albescent, borderRadius: 20, overflow: "hidden",
      position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: isSquare ? "28px 28px" : "44px 36px", fontFamily: SANS }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgba(100,85,72,0.055) 1px, transparent 1px)", backgroundSize:"18px 18px", pointerEvents:"none" }} />
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 40% at 15% 10%, rgba(174,143,125,0.10) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 85% 90%, rgba(105,121,98,0.07) 0%, transparent 60%)", pointerEvents:"none" }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:9.5, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:T.heather }}>
          <div style={{ width:5, height:5, background:T.heather, borderRadius:"50%" }} />
          Citação favorita
        </div>
        <span style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:13, color:T.doeskin, letterSpacing:"0.04em" }}>marginalia</span>
      </div>
      <div style={{ position:"relative", zIndex:2, flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding: isSquare ? "16px 0" : "32px 0" }}>
        <div style={{ fontFamily:SERIF, fontSize: isSquare ? 38 : 52, color:T.heather, opacity:0.35, lineHeight:0.7, marginBottom:16, fontWeight:300 }}>"</div>
        <p style={{ fontFamily:SERIF, fontStyle:"italic", fontWeight:400, fontSize: isSquare ? 19 : 24, lineHeight:1.55, color:T.metal, letterSpacing:"0.01em", margin:0 }}>{excerpt}</p>
        <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:3 }}>
          <span style={{ fontFamily:SANS, fontSize:10, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:T.metalLight }}>{margin.bookTitle}</span>
          <span style={{ fontFamily:SANS, fontSize:10, fontWeight:300, letterSpacing:"0.10em", textTransform:"uppercase", color:T.doeskin }}>
            {margin.bookAuthor}{formatReference(margin) ? ` · ${formatReference(margin)}` : ""}
          </span>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:2, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:T.heather, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontFamily:SANS, fontSize:10, fontWeight:500, color:"white" }}>{margin.userInitials}</span>
          </div>
          <span style={{ fontFamily:SANS, fontSize:11, fontWeight:400, color:T.metalLight, letterSpacing:"0.06em" }}>{username}</span>
        </div>
        {reactions.length > 0 && (
          <div style={{ display:"flex", gap:6 }}>
            {reactions.map(([emoji, count]) => (
              <div key={emoji} style={{ background:T.parchment, borderRadius:20, padding:"4px 10px", fontSize:11, color:T.metalLight, display:"flex", alignItems:"center", gap:4 }}>
                {emoji} <span style={{ fontSize:9 }}>{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* CARD 2 — Citação Dark                       */
/* ─────────────────────────────────────────── */
function CardQuoteDark({ margin, isSquare }: { margin: Margin; isSquare?: boolean }) {
  const w = isSquare ? FEED_W : STORIES_W;
  const h = isSquare ? FEED_H : STORIES_H;
  const username = getUsername(margin.userId);
  const reactions = topReactions(margin.reactions);
  const excerpt = margin.excerpt.length > (isSquare ? 140 : 200) ? margin.excerpt.slice(0, isSquare ? 140 : 200) + "…" : margin.excerpt;
  return (
    <div style={{ width: w, height: h, background: "#100E0C", borderRadius: 20, overflow: "hidden",
      position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: isSquare ? "28px 28px" : "44px 36px", fontFamily: SANS }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 50% at 50% 50%, rgba(174,143,125,0.06) 0%, transparent 65%), radial-gradient(ellipse 30% 40% at 0% 100%, rgba(105,121,98,0.08) 0%, transparent 50%)", pointerEvents:"none" }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:9.5, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:T.doeskin, opacity:0.6 }}>
          <div style={{ width:5, height:5, background:T.doeskin, opacity:0.6, borderRadius:"50%" }} />
          Citação favorita
        </div>
        <span style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:13, color:"#6B5E54", letterSpacing:"0.04em" }}>marginalia</span>
      </div>
      <div style={{ position:"relative", zIndex:2, flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding: isSquare ? "16px 0" : "32px 0" }}>
        <div style={{ fontFamily:SERIF, fontSize: isSquare ? 38 : 52, color:T.heather, opacity:0.18, lineHeight:0.7, marginBottom:16, fontWeight:300 }}>"</div>
        <p style={{ fontFamily:SERIF, fontStyle:"italic", fontWeight:400, fontSize: isSquare ? 19 : 24, lineHeight:1.55, color:T.albescent, letterSpacing:"0.01em", margin:0 }}>{excerpt}</p>
        <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:3 }}>
          <span style={{ fontFamily:SANS, fontSize:10, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(250,248,243,0.5)" }}>{margin.bookTitle}</span>
          <span style={{ fontFamily:SANS, fontSize:10, fontWeight:300, letterSpacing:"0.10em", textTransform:"uppercase", color:T.heather, opacity:0.7 }}>
            {margin.bookAuthor}{formatReference(margin) ? ` · ${formatReference(margin)}` : ""}
          </span>
        </div>
      </div>
      <div style={{ position:"relative", zIndex:2, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"#3D3530", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontFamily:SANS, fontSize:10, fontWeight:500, color:T.heather }}>{margin.userInitials}</span>
          </div>
          <span style={{ fontFamily:SANS, fontSize:11, fontWeight:400, color:"rgba(250,248,243,0.35)", letterSpacing:"0.06em" }}>{username}</span>
        </div>
        {reactions.length > 0 && (
          <div style={{ display:"flex", gap:6 }}>
            {reactions.map(([emoji, count]) => (
              <div key={emoji} style={{ background:"rgba(255,255,255,0.06)", borderRadius:20, padding:"4px 10px", fontSize:11, color:"rgba(250,248,243,0.4)", display:"flex", alignItems:"center", gap:4 }}>
                {emoji} <span style={{ fontSize:9 }}>{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* CARD 3 — Momento (dark minimalist)          */
/* ─────────────────────────────────────────── */
function CardMoment({ margin, isSquare }: { margin: Margin; isSquare?: boolean }) {
  const w = isSquare ? FEED_W : STORIES_W;
  const h = isSquare ? FEED_H : STORIES_H;
  const username = getUsername(margin.userId);
  const excerpt = margin.excerpt.length > (isSquare ? 120 : 180) ? margin.excerpt.slice(0, isSquare ? 120 : 180) + "…" : margin.excerpt;
  const annotation = margin.commentary ? (margin.commentary.length > (isSquare ? 100 : 140) ? margin.commentary.slice(0, isSquare ? 100 : 140) + "…" : margin.commentary) : null;
  return (
    <div style={{ width: w, height: h, background: "#0D0B09", borderRadius: 20, overflow: "hidden",
      position: "relative", display: "flex", flexDirection: "column", justifyContent: "center",
      alignItems: "center", padding: isSquare ? "36px 32px" : "48px 36px", fontFamily: SANS }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% 30%, rgba(174,143,125,0.08) 0%, transparent 60%)", pointerEvents:"none" }} />
      <div style={{ position:"relative", zIndex:2, textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", width:"100%" }}>
        <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom: isSquare ? 28 : 48 }}>
          <div style={{ width:4, height:4, borderRadius:"50%", background:T.heather, opacity:0.4 }} />
          <span style={{ fontFamily:SANS, fontSize:9, fontWeight:400, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(174,143,125,0.4)" }}>
            {margin.bookTitle} · {margin.bookAuthor}
          </span>
          <div style={{ width:4, height:4, borderRadius:"50%", background:T.heather, opacity:0.4 }} />
        </div>
        <p style={{ fontFamily:SERIF, fontStyle:"italic", fontWeight:300, fontSize: isSquare ? 21 : 28, lineHeight:1.5, color:T.albescent, letterSpacing:"0.01em", textAlign:"center", maxWidth: isSquare ? 300 : 240, marginBottom: isSquare ? 24 : 40 }}>
          "{excerpt}"
        </p>
        <div style={{ width:1, height: isSquare ? 20 : 32, background:"linear-gradient(to bottom, transparent, rgba(174,143,125,0.4), transparent)", marginBottom: isSquare ? 24 : 40 }} />
        {annotation && (
          <p style={{ fontFamily:SANS, fontSize: isSquare ? 12 : 13, fontWeight:300, color:"rgba(250,248,243,0.45)", lineHeight:1.7, textAlign:"center", maxWidth: isSquare ? 300 : 260, letterSpacing:"0.01em", fontStyle:"italic" }}>
            {annotation}
          </p>
        )}
      </div>
      <div style={{ position:"absolute", bottom: isSquare ? 28 : 40, left: isSquare ? 28 : 36, right: isSquare ? 28 : 36, zIndex:3, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:"50%", background:"rgba(174,143,125,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontFamily:SANS, fontSize:9, color:T.heather, fontWeight:500 }}>{margin.userInitials}</span>
          </div>
          <span style={{ fontFamily:SANS, fontSize:11, fontWeight:300, color:"rgba(250,248,243,0.25)", letterSpacing:"0.06em" }}>{username}</span>
        </div>
        <span style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:14, color:"rgba(174,143,125,0.3)", letterSpacing:"0.04em" }}>marginalia</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* CARD 4 — Tipo de Leitor                     */
/* ─────────────────────────────────────────── */
function CardReaderType({ userId, userName, userInitials, isSquare }: {
  userId: string; userName: string; userInitials: string; isSquare?: boolean;
}) {
  const w = isSquare ? FEED_W : STORIES_W;
  const h = isSquare ? FEED_H : STORIES_H;
  const profile = computeReaderProfile(userId);
  return (
    <div style={{ width: w, height: h, background: T.creamMid, borderRadius: 20, overflow: "hidden",
      position: "relative", display: "flex", flexDirection: "column", fontFamily: SANS }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"55%", background:T.heather, clipPath:"ellipse(65% 100% at 50% 0%)", opacity:0.12, zIndex:0 }} />
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 100% 60% at 50% 0%, rgba(174,143,125,0.15) 0%, transparent 60%), radial-gradient(ellipse 80% 80% at 100% 100%, rgba(105,121,98,0.10) 0%, transparent 50%)", pointerEvents:"none", zIndex:1 }} />
      <div style={{ position:"relative", zIndex:2, padding: isSquare ? "28px 28px" : "44px 36px", display:"flex", flexDirection:"column", height:"100%", justifyContent:"space-between" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <span style={{ fontFamily:SANS, fontSize:9.5, fontWeight:500, letterSpacing:"0.18em", textTransform:"uppercase", color:T.heather }}>Seu tipo de leitor</span>
          <span style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:13, color:T.doeskin, letterSpacing:"0.04em" }}>marginalia</span>
        </div>
        {!isSquare && (
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", flex:1 }}>
            <span style={{ fontSize:80, filter:"saturate(0.7)", opacity:0.9 }}>{profile.archetype.emoji}</span>
          </div>
        )}
        <div style={{ textAlign:"center", paddingBottom: isSquare ? 0 : 8 }}>
          {isSquare && (
            <div style={{ fontSize:56, filter:"saturate(0.7)", opacity:0.9, marginBottom:8 }}>{profile.archetype.emoji}</div>
          )}
          <div style={{ fontFamily:SERIF, fontWeight:400, fontSize: isSquare ? 28 : 38, color:T.metal, lineHeight:1.1, letterSpacing:"-0.01em", marginBottom:8 }}>
            {profile.archetype.name}
          </div>
          <div style={{ fontFamily:SERIF, fontStyle:"italic", fontWeight:300, fontSize: isSquare ? 13 : 16, color:T.metalLight, lineHeight:1.5, letterSpacing:"0.01em", maxWidth:240, margin:"0 auto" }}>
            {profile.archetype.desc}
          </div>
          <div style={{ width:32, height:0.5, background:T.doeskin, margin: isSquare ? "12px auto" : "18px auto", opacity:0.6 }} />
          <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap", marginBottom:8 }}>
            {profile.archetype.tags.map(tag => (
              <span key={tag} style={{ fontFamily:SANS, fontSize:9.5, fontWeight:400, letterSpacing:"0.12em", textTransform:"uppercase", color:T.heather, padding:"4px 10px", border:`0.5px solid ${T.doeskin}`, borderRadius:20, opacity:0.8 }}>{tag}</span>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:16, borderTop:`0.5px solid rgba(174,143,125,0.25)` }}>
          <div style={{ display:"flex", gap:16 }}>
            {[
              { val: profile.stats.margins, key: "Posts" },
              { val: profile.stats.ecos,    key: "Respostas" },
              { val: profile.stats.books,   key: "Livros" },
            ].map(s => (
              <div key={s.key} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <span style={{ fontFamily:SERIF, fontSize:18, fontWeight:400, color:T.metal }}>{s.val}</span>
                <span style={{ fontFamily:SANS, fontSize:8, fontWeight:400, letterSpacing:"0.14em", textTransform:"uppercase", color:T.doeskin }}>{s.key}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
            <span style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:13, color:T.doeskin }}>marginalia</span>
            <span style={{ fontFamily:SANS, fontSize:8, fontWeight:400, letterSpacing:"0.10em", textTransform:"uppercase", color:T.doeskin, opacity:0.5 }}>{userName || userInitials}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* CARD 5 — Eco / Margem                       */
/* ─────────────────────────────────────────── */
function CardEcho({ margin, isSquare }: { margin: Margin; isSquare?: boolean }) {
  const w = isSquare ? FEED_W : STORIES_W;
  const h = isSquare ? FEED_H : STORIES_H;
  const reactions = topReactions(margin.reactions, 2);
  const typeIcon  = getTypeIcon(margin.postType);
  const typeLabel = getTypeLabel(margin.postType);
  const passage   = margin.excerpt.length > (isSquare ? 130 : 180) ? margin.excerpt.slice(0, isSquare ? 130 : 180) + "…" : margin.excerpt;
  const annotation = margin.commentary ? (margin.commentary.length > (isSquare ? 120 : 160) ? margin.commentary.slice(0, isSquare ? 120 : 160) + "…" : margin.commentary) : null;
  const ref = formatReference(margin);
  return (
    <div style={{ width: w, height: h, background: T.albescent, borderRadius: 20, overflow: "hidden",
      position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: isSquare ? "28px 28px" : "36px 32px", border: "0.5px solid rgba(174,143,125,0.2)", fontFamily: SANS }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgba(100,85,72,0.04) 1px, transparent 1px)", backgroundSize:"16px 16px", pointerEvents:"none" }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", position:"relative", zIndex:2, marginBottom: isSquare ? 16 : 28 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontFamily:SANS, fontSize:9, fontWeight:500, letterSpacing:"0.16em", textTransform:"uppercase", color:T.oldVine }}>
          <span style={{ fontSize:11 }}>{typeIcon}</span>
          <span>{typeLabel}</span>
        </div>
        <span style={{ fontFamily:SANS, fontSize:9, fontWeight:400, letterSpacing:"0.10em", textTransform:"uppercase", color:T.doeskin }}>{margin.bookTitle}</span>
      </div>
      <div style={{ position:"relative", zIndex:2, flex:1 }}>
        <div style={{ position:"relative", paddingLeft:20 }}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:2, background:T.heather, opacity:0.4, borderRadius:2 }} />
          <p style={{ fontFamily:SERIF, fontStyle:"italic", fontWeight:400, fontSize: isSquare ? 17 : 21, lineHeight:1.6, color:T.metal, letterSpacing:"0.01em", marginBottom:16 }}>
            "{passage}"
          </p>
        </div>
        {annotation && (
          <p style={{ fontFamily:SANS, fontSize: isSquare ? 12 : 13, fontWeight:300, color:T.metalLight, lineHeight:1.65, letterSpacing:"0.01em" }}>{annotation}</p>
        )}
      </div>
      <div style={{ position:"relative", zIndex:2, marginTop:28, display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:24, height:24, borderRadius:"50%", background:T.oldVine, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:500, color:"white", fontFamily:SANS }}>{margin.userInitials}</div>
            <span style={{ fontFamily:SANS, fontSize:11, fontWeight:400, color:T.metalLight, letterSpacing:"0.04em" }}>
              {getUsername(margin.userId)}
            </span>
          </div>
          {ref && <span style={{ fontFamily:SANS, fontSize:9, fontWeight:400, letterSpacing:"0.12em", textTransform:"uppercase", color:T.doeskin, marginTop:10 }}>{ref}</span>}
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
          {reactions.length > 0 && (
            <div style={{ display:"flex", gap:5 }}>
              {reactions.map(([emoji, count]) => (
                <div key={emoji} style={{ background:T.parchment, borderRadius:20, padding:"3px 8px", fontSize:10, color:T.metalLight, display:"flex", alignItems:"center", gap:3 }}>
                  {emoji} <span style={{ fontSize:8 }}>{count}</span>
                </div>
              ))}
            </div>
          )}
          <span style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:12, color:T.doeskin, opacity:0.6, letterSpacing:"0.04em" }}>marginalia</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/* CARD 6 — DNA de Leitura                     */
/* ─────────────────────────────────────────── */
function CardReadingDNA({ userId, userName, isSquare }: {
  userId: string; userName: string; isSquare?: boolean;
}) {
  const w = isSquare ? FEED_W : STORIES_W;
  const h = isSquare ? FEED_H : STORIES_H;
  const profile = computeReaderProfile(userId);
  const parts   = userName.trim().split(" ");
  const firstName = parts[0] ?? userName;
  const lastName  = parts.slice(1).join(" ");
  const year = new Date().getFullYear();
  return (
    <div style={{ width: w, height: h, background: "#100E0C", borderRadius: 20, overflow: "hidden",
      position: "relative", display: "flex", flexDirection: "column", padding: isSquare ? "28px 28px" : "44px 36px", fontFamily: SANS }}>
      <div style={{ position:"absolute", top:"-30%", left:"-20%", width:"80%", height:"120%", border:"0.5px solid rgba(174,143,125,0.08)", borderRadius:"50%", transform:"rotate(-15deg)" }} />
      <div style={{ position:"absolute", bottom:"-20%", right:"-10%", width:"70%", height:"100%", border:"0.5px solid rgba(105,121,98,0.08)", borderRadius:"50%", transform:"rotate(20deg)" }} />
      <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", height:"100%", justifyContent:"space-between" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <span style={{ fontFamily:SANS, fontSize:9, fontWeight:500, letterSpacing:"0.20em", textTransform:"uppercase", color:"rgba(174,143,125,0.5)" }}>DNA de leitura</span>
          <span style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:13, color:"rgba(174,143,125,0.4)", letterSpacing:"0.04em" }}>marginalia</span>
        </div>
        <div>
          <div style={{ fontFamily:SERIF, fontWeight:300, fontSize: isSquare ? 30 : 42, lineHeight:1.05, color:T.albescent, letterSpacing:"-0.02em", marginBottom:6 }}>
            {firstName}{lastName && <> <em style={{ fontStyle:"italic", color:T.heather }}>{lastName}</em></>}
          </div>
          <div style={{ fontFamily:SANS, fontSize:11, fontWeight:300, color:"rgba(250,248,243,0.35)", letterSpacing:"0.10em", textTransform:"uppercase" }}>
            perfil de leitor · {year}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap: isSquare ? 8 : 12 }}>
          {profile.traits.map(trait => (
            <div key={trait.name} style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontFamily:SANS, fontSize:11, fontWeight:400, color:"rgba(250,248,243,0.5)", letterSpacing:"0.06em", minWidth:90 }}>{trait.name}</span>
              <div style={{ flex:1, height:2, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", background:`linear-gradient(90deg, ${T.heather}, ${T.oldVine})`, borderRadius:2, opacity:0.7, width:`${trait.value}%` }} />
              </div>
              <span style={{ fontFamily:SERIF, fontSize:14, color:"rgba(250,248,243,0.4)", minWidth:30, textAlign:"right" }}>{trait.value}</span>
            </div>
          ))}
        </div>
        {profile.books.length > 0 && (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {profile.books.map(b => (
              <span key={b} style={{ fontFamily:SANS, fontSize:9.5, fontWeight:400, letterSpacing:"0.10em", color:"rgba(250,248,243,0.35)", border:"0.5px solid rgba(255,255,255,0.10)", padding:"5px 10px", borderRadius:20 }}>
                {b.length > 22 ? b.slice(0, 22) + "…" : b}
              </span>
            ))}
          </div>
        )}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:16, borderTop:"0.5px solid rgba(255,255,255,0.06)" }}>
          <div>
            <div style={{ fontFamily:SANS, fontSize:9, fontWeight:400, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(250,248,243,0.2)" }}>Impressão digital</div>
            <div style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:12, color:"rgba(174,143,125,0.4)" }}>
              {profile.archetype.name} · {profile.archetype.emoji}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Render dispatcher ── */
function renderCard(tpl: Template, ctx: ShareContext, isSquare: boolean) {
  if (tpl === "reader-type") {
    const userId = ctx.type === "profile" ? ctx.userId : ctx.margin.userId;
    const userName = ctx.type === "profile" ? ctx.userName : ctx.margin.userName;
    const userInitials = ctx.type === "profile" ? ctx.userInitials : ctx.margin.userInitials;
    return <CardReaderType userId={userId} userName={userName} userInitials={userInitials} isSquare={isSquare} />;
  }
  if (tpl === "reading-dna") {
    const userId = ctx.type === "profile" ? ctx.userId : ctx.margin.userId;
    const userName = ctx.type === "profile" ? ctx.userName : ctx.margin.userName;
    return <CardReadingDNA userId={userId} userName={userName} isSquare={isSquare} />;
  }
  if (ctx.type !== "eco") return null;
  switch (tpl) {
    case "quote-light": return <CardQuoteLight margin={ctx.margin} isSquare={isSquare} />;
    case "quote-dark":  return <CardQuoteDark  margin={ctx.margin} isSquare={isSquare} />;
    case "moment":      return <CardMoment     margin={ctx.margin} isSquare={isSquare} />;
    case "echo":        return <CardEcho       margin={ctx.margin} isSquare={isSquare} />;
  }
}

/* ─────────────────────────────────────────── */
/* MAIN MODAL                                  */
/* ─────────────────────────────────────────── */
export function ShareCardModal({ context, onClose }: Props) {
  useApp();
  const cfg = CONTEXT_CONFIG[context.type];

  const previewCardRef   = useRef<HTMLDivElement>(null);
  const exportCardRef    = useRef<HTMLDivElement>(null);
  const exportWrapperRef = useRef<HTMLDivElement>(null);
  const previewAreaRef   = useRef<HTMLDivElement>(null);

  const [template, setTemplate] = useState<Template>(cfg.defaultTemplate);
  const [format, setFormat]     = useState<Format>(cfg.defaultFormat);
  const [exporting, setExporting] = useState(false);
  const [shared, setShared]     = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);

  const isSquare = format === "feed";
  const cardW = isSquare ? FEED_W : STORIES_W;
  const cardH = isSquare ? FEED_H : STORIES_H;

  /* Sync format when template changes to its preferred format */
  const handleSetTemplate = (tpl: Template) => {
    setTemplate(tpl);
    setFormat(TEMPLATE_META[tpl].preferred);
  };

  useEffect(() => {
    const area = previewAreaRef.current;
    if (!area) return;
    const compute = () => {
      const { width, height } = area.getBoundingClientRect();
      const availW = width - 40;
      const availH = height - 16;
      setPreviewScale(Math.min(1, availH / cardH, availW / cardW));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(area);
    return () => ro.disconnect();
  }, [cardW, cardH]);

  /* File slug for download */
  const fileSlug = context.type === "eco"
    ? context.margin.bookTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30)
    : context.userName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 20);

  /* Share text for navigator.share */
  const shareText = context.type === "eco"
    ? `"${context.margin.excerpt.slice(0, 100)}" — ${context.margin.bookTitle}`
    : `${context.userName} · Perfil de leitura — Marginalia`;

  const captureCanvas = useCallback(async () => {
    if (!exportCardRef.current || !exportWrapperRef.current) return null;
    exportWrapperRef.current.style.left = "0px";
    try {
      await document.fonts.ready;
      await new Promise<void>(resolve => { requestAnimationFrame(() => requestAnimationFrame(() => resolve())); });
      const pixelRatio = isSquare ? 3 : 4;
      return await toCanvas(exportCardRef.current, {
        pixelRatio,
        backgroundColor: T.albescent,
        width: cardW,
        height: cardH,
        cacheBust: true,
        skipFonts: false,
      });
    } finally {
      exportWrapperRef.current.style.left = "-9999px";
    }
  }, [isSquare, cardW, cardH]);

  const doDownload = useCallback(async () => {
    const canvas = await captureCanvas();
    if (!canvas) throw new Error("Capture failed");
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.93));
    if (!blob) throw new Error("Blob failed");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `marginalia-${format}-${template}-${fileSlug}.jpg`; a.rel = "noopener";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    setDownloaded(true); setTimeout(() => setDownloaded(false), 2500);
  }, [captureCanvas, format, template, fileSlug]);

  const handleDownload = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try { await doDownload(); } catch(e) { console.error("[ShareCard] download error:", e); }
    finally { setExporting(false); }
  }, [exporting, doDownload]);

  const handleShare = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.93));
      if (!blob) return;
      const file = new File([blob], `marginalia-${format}-${template}-${fileSlug}.jpg`, { type: "image/jpeg" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Marginalia", text: shareText });
        setShared(true); setTimeout(() => setShared(false), 2500);
      } else {
        await doDownload();
      }
    } catch(err) {
      if ((err as Error)?.name !== "AbortError") await doDownload();
    } finally { setExporting(false); }
  }, [exporting, captureCanvas, format, template, fileSlug, shareText, doDownload]);

  /* Export portal (off-screen, full-res render) */
  const exportPortal = createPortal(
    <div ref={exportWrapperRef} aria-hidden="true" style={{ position:"fixed", top:0, left:"-9999px", width:cardW, height:cardH, overflow:"hidden", pointerEvents:"none" }}>
      <div ref={exportCardRef} style={{ width:cardW, height:cardH }}>
        {renderCard(template, context, isSquare)}
      </div>
    </div>,
    document.body
  );

  const allowedTemplates = cfg.templates;
  const showTemplateSelector = allowedTemplates.length > 1;

  const modalPortal = createPortal(
    <div data-share-overlay className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background:"rgba(16,13,11,0.97)", backdropFilter:"blur(10px)" }}
      onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget) onClose(); }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
        <div>
          <p className="font-serif italic text-[18px] text-[#FAF8F3]">Compartilhar</p>
          <p className="font-sans font-light text-[9px] tracking-[0.20em] uppercase text-[#FAF8F3]/30 mt-0.5">
            {cfg.subtitle}
          </p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full border border-[#FAF8F3]/10 flex items-center justify-center text-[#FAF8F3]/40 hover:text-[#FAF8F3]/70 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Template selector — only shown when context has multiple options */}
      {showTemplateSelector && (
        <div className="px-5 mb-3 flex-shrink-0">
          <p className="font-sans text-[8px] tracking-[0.18em] uppercase text-[#FAF8F3]/20 mb-2">Estilo do card</p>
          <div className="flex gap-1.5">
            {allowedTemplates.map(tpl => {
              const meta = TEMPLATE_META[tpl];
              return (
                <button key={tpl} onClick={() => handleSetTemplate(tpl)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-[9px] tracking-[0.12em] transition-all duration-200 ${
                    template === tpl
                      ? "bg-[#AE8F7D] text-[#100E0C] shadow-md"
                      : "border border-[#FAF8F3]/12 text-[#FAF8F3]/40 hover:border-[#FAF8F3]/28 hover:text-[#FAF8F3]/65"
                  }`}>
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Format toggle */}
      <div className="px-5 mb-3 flex-shrink-0 flex items-center gap-2">
        <p className="font-sans text-[8px] tracking-[0.18em] uppercase text-[#FAF8F3]/20 mr-1">Formato</p>
        {(["stories", "feed"] as Format[]).map(f => (
          <button key={f} onClick={() => setFormat(f)}
            className={`px-4 py-1.5 rounded-full font-sans text-[9px] tracking-[0.18em] uppercase transition-all duration-200 ${
              format === f
                ? "bg-[#697962] text-[#FAF8F3] shadow-md"
                : "border border-[#FAF8F3]/15 text-[#FAF8F3]/35 hover:border-[#FAF8F3]/30"
            }`}>
            {f === "stories" ? "Stories 9:16" : "Feed 1:1"}
          </button>
        ))}
      </div>

      {/* Preview */}
      <div ref={previewAreaRef} className="flex-1 flex items-center justify-center min-h-0 overflow-hidden px-5">
        <div style={{ width: cardW * previewScale, height: cardH * previewScale, position:"relative", flexShrink:0, transition:"width 0.2s ease, height 0.2s ease" }}>
          <div ref={previewCardRef} style={{ width:cardW, height:cardH, position:"absolute", top:0, left:0, transform:`scale(${previewScale})`, transformOrigin:"top left", transition:"transform 0.2s ease" }} className="shadow-2xl rounded-2xl overflow-hidden">
            {renderCard(template, context, isSquare)}
          </div>
        </div>
      </div>

      {/* Format label */}
      <div className="text-center py-2 flex-shrink-0">
        <span className="font-sans text-[8px] tracking-[0.2em] uppercase text-[#FAF8F3]/18">
          {isSquare ? "1080 × 1080 px" : "1080 × 1920 px"}
        </span>
      </div>

      {/* Actions */}
      <div className="px-5 pb-6 flex gap-3 flex-shrink-0">
        <button onClick={handleDownload} disabled={exporting}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] font-sans text-[10px] tracking-[0.18em] uppercase transition-all border border-[#FAF8F3]/15 text-[#FAF8F3]/55 hover:border-[#FAF8F3]/30 hover:text-[#FAF8F3]/80 disabled:opacity-40">
          {exporting && !shared ? <Loader2 className="w-4 h-4 animate-spin" /> : downloaded ? <CheckCircle className="w-4 h-4 text-[#697962]" /> : <Download className="w-4 h-4" />}
          {downloaded ? "Baixado!" : "Baixar"}
        </button>
        <button onClick={handleShare} disabled={exporting}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] font-sans text-[10px] tracking-[0.18em] uppercase bg-[#AE8F7D] text-[#100E0C] hover:bg-[#C4A28C] transition-all disabled:opacity-40">
          {exporting && !downloaded ? <Loader2 className="w-4 h-4 animate-spin" /> : shared ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          {shared ? "Compartilhado!" : "Compartilhar"}
        </button>
      </div>
    </div>,
    document.body
  );

  return <>{exportPortal}{modalPortal}</>;
}
