import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { MOCK_MARGINS, MOCK_BOOKS } from "@/data/mockData";
import { MarginCard } from "@/components/cards/MarginCard";
import { ArchetypeShareModal } from "@/components/cards/ArchetypeShareModal";
import { generateShareCard } from "@/utils/shareCard";
import { BookCover } from "@/components/BookCover";
import { AvatarIcon } from "@/components/AvatarIcon";
import { AvatarPicker } from "@/components/AvatarPicker";
import { Settings, Pencil, Check, X, Share2, Instagram, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { EMOJI_REACTIONS, MARGIN_TYPES } from "@/data/constants";
import {
  ARQUETIPOS,
  calcularArquetipos,
  getFraseCombinada,
  DNA_TRAITS,
  calcularDnaTrait,
  getTexturaStyle,
  type ArquetipoResult,
} from "@/data/archetypes";


function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.5a8.16 8.16 0 0 0 4.77 1.52V7.57a4.85 4.85 0 0 1-1-.88Z" />
    </svg>
  );
}

/* ─── Novo DNA de Leitura (barras + frase combinada) ─── */
function DnaDeLeiturasSection({ topArquetipos }: { topArquetipos: ArquetipoResult[] }) {
  if (topArquetipos.length === 0) return null;
  const primary = topArquetipos[0];
  const secondary = topArquetipos[1] ?? null;
  const fraseCombinada = secondary
    ? getFraseCombinada(primary.arquetipo.id, secondary.arquetipo.id)
    : null;

  return (
    <div className="mb-7">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">DNA de leitura</span>
        <div className="flex-1 h-px bg-[#AE8F7D]/20" />
      </div>
      <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40 mb-4">
        Padrões que emergem dos seus posts
      </p>

      {/* DNA trait bars */}
      <div className="space-y-3 mb-5">
        {DNA_TRAITS.map((trait) => {
          const pct = calcularDnaTrait(trait.archetipoIds, topArquetipos);
          return (
            <div key={trait.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans font-light text-[11px] text-[#5C5650]">{trait.label}</span>
                <span className="font-sans font-light text-[9px] text-[#AE8F7D]">{pct}%</span>
              </div>
              <div className="h-[3px] bg-[#EBE6DB] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#AE8F7D] rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Combined phrase */}
      {fraseCombinada && (
        <div className="bg-[#EBE6DB]/40 border border-[#AE8F7D]/15 rounded-[14px] px-5 py-4">
          <p className="font-sans text-[7px] font-light tracking-[0.2em] uppercase text-[#AE8F7D] mb-2">
            {primary.arquetipo.nome} · {secondary!.arquetipo.nome}
          </p>
          <p className="font-serif italic text-[16px] text-[#3D3D3D] leading-[1.6] whitespace-pre-line">
            &ldquo;{fraseCombinada}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

export function ProfileScreen() {
  const { currentUser, progress, savedMargins, margins, userReactions } = useApp();
  const { updateProfile: saveToSupabase } = useAuth();

  const [editing, setEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState(currentUser.firstName);
  const [editLastName, setEditLastName] = useState(currentUser.lastName);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editAvatarColor, setEditAvatarColor] = useState(currentUser.avatarColor || "#697962");
  const [editAvatarId, setEditAvatarId] = useState<string | null | undefined>(currentUser.avatarId ?? null);
  const [editInstagram, setEditInstagram] = useState(currentUser.instagram || "");
  const [editTikTok, setEditTikTok] = useState(currentUser.tiktok || "");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLabel, setShareLabel] = useState("Compartilhar identidade de leitura");
  const [savedToast, setSavedToast] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!editing) {
      setEditFirstName(currentUser.firstName);
      setEditLastName(currentUser.lastName);
      setEditBio(currentUser.bio || "");
      setEditUsername(currentUser.username || "");
      setEditAvatarColor(currentUser.avatarColor || "#697962");
      setEditAvatarId(currentUser.avatarId ?? null);
      setEditInstagram(currentUser.instagram || "");
      setEditTikTok(currentUser.tiktok || "");
    }
  }, [currentUser, editing]);

  const wishlistBooks = progress
    .filter((p) => p.userId === currentUser.id && p.status === "wishlist")
    .map((p) => MOCK_BOOKS.find((b) => b.id === p.bookId))
    .filter(Boolean) as typeof MOCK_BOOKS;

  const myMargins = margins.filter((m) => m.userId === currentUser.id);
  const myBooks = progress.filter((p) => p.userId === currentUser.id);

  const topArquetipos = calcularArquetipos({ margins: myMargins, progress: myBooks, userReactions });
  const isForming = topArquetipos.length === 0;
  const primaryArquetipo = topArquetipos[0]?.arquetipo ?? ARQUETIPOS.find((a) => a.id === "observador")!;
  const secondaryArquetipo = topArquetipos[1]?.arquetipo ?? null;

  const fullName = currentUser.lastName
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : currentUser.firstName || currentUser.name;

  const leituraCount = myBooks.filter((p) => p.status === "reading").length;
  const lidosCount = myBooks.filter((p) => p.status === "completed" || p.status === "finished" as string).length;
  const reacoesRecebidas = myMargins.reduce((sum, m) => sum + Object.values(m.reactions as Record<string, number>).reduce((a, b) => a + b, 0), 0);
  // Reactions GIVEN by the user (unique margins they reacted to)
  const reacoesFeitas = Object.keys(userReactions).length;

  const dominantEmojiEntry = (() => {
    const counts: Record<string, number> = {};
    Object.values(userReactions).forEach((emoji) => {
      counts[emoji] = (counts[emoji] || 0) + 1;
    });
    const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
    if (!top) return null;
    return EMOJI_REACTIONS.find((e) => e.emoji === top[0]) ?? null;
  })();

  const dominantMarginType = (() => {
    const counts: Record<string, number> = {};
    myMargins.forEach((m) => { counts[m.postType] = (counts[m.postType] || 0) + 1; });
    const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
    if (!top) return null;
    return MARGIN_TYPES.find((t) => t.id === top[0]) ?? null;
  })();

  const topAnnotatedBook = (() => {
    const counts: Record<number, number> = {};
    myMargins.forEach((m) => { if (m.bookId !== null) counts[m.bookId] = (counts[m.bookId] || 0) + 1; });
    const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
    if (!top) return null;
    return MOCK_BOOKS.find((b) => b.id === Number(top[0])) ?? null;
  })();

  const topEco = myMargins.reduce<(typeof myMargins)[0] | null>((best, m) => {
    const total = Object.values(m.reactions as Record<string, number>).reduce((a, b) => a + b, 0);
    const bestTotal = best ? Object.values(best.reactions as Record<string, number>).reduce((a, b) => a + b, 0) : -1;
    return total > bestTotal ? m : best;
  }, null);

  const handleShareIdentity = async () => {
    setShareLabel("Gerando card…");
    try {
      const arquetipo = isForming ? "Leitor em formação" : primaryArquetipo.nome;
      const assinatura = currentUser.readingSignature ?? "Cada livro me deixa diferente";
      const username = currentUser.username ?? currentUser.firstName ?? "leitor";

      const blob = await generateShareCard({
        type: "reader_identity",
        archetype: arquetipo,
        readingSignature: assinatura,
        username,
        format: "story",
      });

      const file = new File([blob], "marginalia-identidade.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Minha identidade de leitura — Marginalia" });
        setShareLabel("Compartilhar identidade de leitura");
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "marginalia-identidade.png";
        a.click();
        setShareLabel("Baixado!");
        setTimeout(() => setShareLabel("Compartilhar identidade de leitura"), 2000);
      }
    } catch {
      setShareLabel("Compartilhar identidade de leitura");
    }
  };

  const saveEdit = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    const first = editFirstName.trim() || currentUser.firstName;
    const last = editLastName.trim();
    const { error } = await saveToSupabase({
      full_name: last ? `${first} ${last}` : first,
      username: editUsername.trim().replace(/^@/, "") || null,
      bio: editBio.trim() || null,
      avatar_color: editAvatarColor,
      avatar_id: editAvatarId || null,
      instagram_handle: editInstagram.trim().replace(/^@/, "") || null,
      tiktok_handle: editTikTok.trim().replace(/^@/, "") || null,
    });
    setIsSaving(false);
    if (error) {
      setSaveError(error);
      setTimeout(() => setSaveError(null), 4000);
      return;
    }
    setEditing(false);
    setShowAvatarPicker(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const cancelEdit = () => {
    setEditFirstName(currentUser.firstName);
    setEditLastName(currentUser.lastName);
    setEditBio(currentUser.bio);
    setEditUsername(currentUser.username);
    setEditAvatarColor(currentUser.avatarColor || "#697962");
    setEditAvatarId(currentUser.avatarId ?? null);
    setEditInstagram(currentUser.instagram || "");
    setEditTikTok(currentUser.tiktok || "");
    setEditing(false);
    setShowAvatarPicker(false);
  };


  return (
    <div className="min-h-full bg-[#FAF8F3] overflow-x-hidden screen-enter">
      {/* Save toast */}
      {savedToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#697962] text-[#FAF8F3] font-sans text-[11px] font-light tracking-[0.08em] px-5 py-2.5 rounded-full shadow-lg feed-enter pointer-events-none">
          Perfil atualizado ✓
        </div>
      )}
      {/* Error toast */}
      {saveError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#6B3A3A] text-[#FAF8F3] font-sans text-[11px] font-light tracking-[0.08em] px-5 py-2.5 rounded-full shadow-lg feed-enter pointer-events-none max-w-[280px] text-center">
          {saveError}
        </div>
      )}
      <div className="px-5 pt-10 pb-10">

        {/* Top Actions */}
        <div className="flex justify-end gap-3 mb-5">
          {editing ? (
            <>
              <button onClick={cancelEdit} className="text-[#2A2A2A]/35 hover:text-[#2A2A2A]/65 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={saveEdit}
                disabled={isSaving}
                className={`transition-colors ${isSaving ? "text-[#697962]/40" : "text-[#697962] hover:text-[#697962]/80"}`}
              >
                {isSaving ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v2a6 6 0 100 12v2a8 8 0 01-8-8z" />
                  </svg>
                ) : (
                  <Check className="w-5 h-5" />
                )}
              </button>
            </>
          ) : (
            <>
              <button
                data-testid="button-edit-profile"
                onClick={() => setEditing(true)}
                className="text-[#2A2A2A]/35 hover:text-[#2A2A2A]/65 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <Link href="/settings">
                <button data-testid="button-settings" className="text-[#2A2A2A]/35 hover:text-[#2A2A2A]/65 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Identity */}
        <div className="flex items-start gap-4 mb-5">
          <div className="relative flex-shrink-0">
            <div data-testid="avatar-user">
              <AvatarIcon
                avatarId={editing ? (editAvatarId ?? currentUser.avatarId) : currentUser.avatarId}
                initials={currentUser.initials}
                size="xl"
              />
            </div>
            {editing && (
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#FAF8F3] border border-[#AE8F7D]/30 flex items-center justify-center shadow-sm"
              >
                <Pencil className="w-3 h-3 text-[#AE8F7D]" />
              </button>
            )}
          </div>

          <div className="flex-1 pt-1 min-w-0">
            {editing ? (
              <div className="space-y-2 min-w-0">
                <div className="flex gap-2 min-w-0">
                  <input
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="Nome"
                    autoCorrect="off"
                    autoComplete="given-name"
                    spellCheck={false}
                    autoCapitalize="words"
                    className="flex-1 min-w-0 font-serif italic text-[16px] text-[#2C2A27] bg-transparent border-b border-[#AE8F7D]/30 outline-none pb-0.5"
                  />
                  <input
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Sobrenome"
                    autoCorrect="off"
                    autoComplete="family-name"
                    spellCheck={false}
                    autoCapitalize="words"
                    className="flex-1 min-w-0 font-serif italic text-[16px] text-[#2C2A27] bg-transparent border-b border-[#AE8F7D]/30 outline-none pb-0.5"
                  />
                </div>
                <input
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="@username"
                  autoCorrect="off"
                  autoComplete="username"
                  spellCheck={false}
                  autoCapitalize="none"
                  className="w-full min-w-0 font-sans font-light text-[11px] text-[#AE8F7D] bg-transparent border-b border-[#AE8F7D]/20 outline-none pb-0.5"
                />
              </div>
            ) : (
              <>
                <h1 className="font-serif text-[22px] text-[#2C2A27] leading-tight" data-testid="text-fullname">
                  {fullName}
                </h1>
                <p className="font-sans font-light text-[10px] text-[#8C837A] mt-0.5" data-testid="text-username">
                  {currentUser.username}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Avatar Picker */}
        {editing && showAvatarPicker && (
          <div className="bg-[#FAF8F3] border border-[#AE8F7D]/20 rounded-[16px] p-4 mb-4">
            <p className="font-sans text-[8px] font-light tracking-[0.16em] uppercase text-[#AE8F7D] mb-3">
              Escolher avatar
            </p>
            <AvatarPicker
              selected={editAvatarId}
              onChange={(id) => {
                setEditAvatarId(id);
                setShowAvatarPicker(false);
              }}
              initials={currentUser.initials}
            />
          </div>
        )}

        {/* Bio */}
        <div className="mb-4">
          {editing ? (
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Bio — o que a leitura significa para você?"
              rows={2}
              className="w-full font-serif italic text-[14px] text-[#2C2A27] placeholder:text-[#8C837A] bg-transparent border-b border-[#AE8F7D]/20 outline-none resize-none leading-[1.65]"
            />
          ) : (
            currentUser.bio && (
              <p className="font-serif italic text-[14px] text-[#5C5650] leading-[1.65]" data-testid="text-bio">
                {currentUser.bio}
              </p>
            )
          )}
        </div>

        {/* Social Links — edit mode */}
        {editing && (
          <div className="mb-5 border border-[#AE8F7D]/20 rounded-[14px] p-4">
            <p className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D] mb-3">Onde te encontrar</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-[#EBE6DB]/40 rounded-[10px] px-3 py-2.5">
                <Instagram className="w-4 h-4 text-[#2A2A2A]/40 flex-shrink-0" />
                <input
                  value={editInstagram}
                  onChange={(e) => setEditInstagram(e.target.value)}
                  placeholder="@seuusuario"
                  className="flex-1 font-sans font-light text-[12px] text-[#2A2A2A]/70 bg-transparent outline-none placeholder:text-[#2A2A2A]/25"
                />
              </div>
              <div className="flex items-center gap-3 bg-[#EBE6DB]/40 rounded-[10px] px-3 py-2.5">
                <TikTokIcon className="w-4 h-4 text-[#2A2A2A]/40 flex-shrink-0" />
                <input
                  value={editTikTok}
                  onChange={(e) => setEditTikTok(e.target.value)}
                  placeholder="@seuusuario"
                  className="flex-1 font-sans font-light text-[12px] text-[#2A2A2A]/70 bg-transparent outline-none placeholder:text-[#2A2A2A]/25"
                />
              </div>
            </div>
          </div>
        )}

        {/* Social Links — view mode */}
        {!editing && (
          <div className="mb-5">
            {(currentUser.instagram || currentUser.tiktok) ? (
              <div className="border border-[#AE8F7D]/15 rounded-[14px] p-4">
                <p className="font-sans text-[7px] font-light tracking-[0.22em] uppercase text-[#AE8F7D] mb-3">Onde me encontrar</p>
                <div className="flex gap-3">
                  {currentUser.instagram && (
                    <a
                      href={`https://instagram.com/${currentUser.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#EBE6DB]/60 rounded-[10px] px-3.5 py-2.5 hover:bg-[#AE8F7D]/10 transition-colors group"
                    >
                      <Instagram className="w-4 h-4 text-[#2A2A2A]/50 group-hover:text-[#AE8F7D] transition-colors" />
                      <span className="font-sans font-light text-[11px] text-[#2A2A2A]/60 group-hover:text-[#2A2A2A]/80">{currentUser.instagram}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-[#2A2A2A]/20 group-hover:text-[#AE8F7D]/60" />
                    </a>
                  )}
                  {currentUser.tiktok && (
                    <a
                      href={`https://tiktok.com/@${currentUser.tiktok.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#EBE6DB]/60 rounded-[10px] px-3.5 py-2.5 hover:bg-[#AE8F7D]/10 transition-colors group"
                    >
                      <TikTokIcon className="w-4 h-4 text-[#2A2A2A]/50 group-hover:text-[#AE8F7D] transition-colors" />
                      <span className="font-sans font-light text-[11px] text-[#2A2A2A]/60 group-hover:text-[#2A2A2A]/80">{currentUser.tiktok}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-[#2A2A2A]/20 group-hover:text-[#AE8F7D]/60" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <button onClick={() => setEditing(true)} className="w-full border border-dashed border-[#AE8F7D]/20 rounded-[14px] p-4 text-left hover:border-[#AE8F7D]/40 transition-colors group">
                <p className="font-sans text-[7px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]/60 mb-1">Onde te encontrar</p>
                <p className="font-serif italic text-[12px] text-[#2A2A2A]/30 group-hover:text-[#2A2A2A]/50 transition-colors">Adicionar Instagram ou TikTok…</p>
              </button>
            )}
          </div>
        )}

        {/* ─── Contextual label + subtitle above archetype card ─── */}
        <div className="mb-3">
          <p
            className="font-sans font-light tracking-[0.18em] uppercase mb-1"
            style={{ fontSize: "10px", color: "#8C837A" }}
          >
            Impressão de Leitura
          </p>
          {myMargins.length === 0 && (
            <p className="font-sans font-light leading-[1.5] mb-3" style={{ fontSize: "13px", color: "#8C837A" }}>
              Publique seu primeiro post para começar a descobrir seu perfil de leitor.
            </p>
          )}
          {myMargins.length === 1 && (
            <p className="font-sans font-light leading-[1.5] mb-3" style={{ fontSize: "13px", color: "#8C837A" }}>
              Mais um post e seu perfil começa a tomar forma.
            </p>
          )}
          {myMargins.length >= 2 && myMargins.length <= 6 && (
            <p className="font-sans font-light leading-[1.5] mb-3" style={{ fontSize: "13px", color: "#8C837A" }}>
              Seu perfil está emergindo. Continue postando — cada vez fica mais preciso.
            </p>
          )}
        </div>

        {/* ─── Impressão de leitura — identity card with archetype colors ─── */}
        {isForming ? (
          /* Forming state card */
          <div
            className="rounded-[16px] p-5 mb-5 relative overflow-hidden"
            style={{ backgroundColor: "#2C2A27" }}
          >
            {/* Dog-ear */}
            <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
              <div
                className="absolute top-0 right-0 w-0 h-0"
                style={{
                  borderStyle: "solid",
                  borderWidth: "0 32px 32px 0",
                  borderColor: "transparent rgba(255,255,255,0.08) transparent transparent",
                }}
              />
            </div>
            <div className="relative z-10">
              <p
                className="font-sans text-[7px] font-light tracking-[0.22em] uppercase mb-4"
                style={{ color: "#9C8E82" }}
              >
                05 · Impressão de leitura
              </p>
              <p
                className="font-serif italic leading-tight mb-4"
                style={{ fontSize: "32px", color: "#EBE6DB" }}
              >
                Seu perfil ainda<br />está se formando
              </p>
              <p
                className="font-serif italic leading-relaxed mb-5"
                style={{ fontSize: "14px", color: "#9C8E82" }}
              >
                &ldquo;Cada post revela um pouco mais de quem você é como leitor.&rdquo;
              </p>
              <div className="h-px mb-4 opacity-20" style={{ backgroundColor: "#9C8E82" }} />
              <p
                className="font-sans text-[7px] font-light tracking-[0.22em] uppercase mb-2"
                style={{ color: "#9C8E82" }}
              >
                Assinatura de leitura
              </p>
              <p
                className="font-serif italic leading-snug mb-5"
                style={{ fontSize: "15px", color: "#EBE6DB" }}
              >
                &ldquo;Ainda escrevendo minha história&rdquo;
              </p>
              <button
                disabled
                className="flex items-center gap-2 rounded-[8px] px-4 py-2.5 opacity-40 cursor-not-allowed"
                style={{
                  backgroundColor: "rgba(243,237,229,0.08)",
                  border: "1px solid rgba(156,142,130,0.25)",
                  color: "#EBE6DB",
                }}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="font-sans text-[9px] font-light tracking-[0.12em]">
                  Compartilhar identidade de leitura
                </span>
              </button>
            </div>
          </div>
        ) : (
        <div
          className="rounded-[16px] p-5 mb-5 relative overflow-hidden"
          style={{ backgroundColor: primaryArquetipo.cor }}
        >
          {/* Texture overlay */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: getTexturaStyle(primaryArquetipo.textura),
              backgroundSize: primaryArquetipo.textura === "dots" || primaryArquetipo.textura === "grain" ? "6px 6px" : "auto",
            }}
          />
          {/* Dog-ear */}
          <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
            <div
              className="absolute top-0 right-0 w-0 h-0"
              style={{
                borderStyle: "solid",
                borderWidth: "0 32px 32px 0",
                borderColor: `transparent rgba(255,255,255,0.12) transparent transparent`,
              }}
            />
          </div>

          <div className="relative z-10">
            <p
              className="font-sans text-[7px] font-light tracking-[0.22em] uppercase mb-3"
              style={{ color: primaryArquetipo.corAccent }}
            >
              {primaryArquetipo.numero} · Impressão de leitura
            </p>
            <p
              className="font-serif italic text-[26px] leading-tight mb-1"
              style={{ color: primaryArquetipo.corTexto }}
            >
              {primaryArquetipo.nome}
            </p>
            {secondaryArquetipo && (
              <p
                className="font-sans font-light text-[10px] tracking-[0.06em] mb-3"
                style={{ color: primaryArquetipo.corAccent }}
              >
                {primaryArquetipo.nome} · {secondaryArquetipo.nome}
              </p>
            )}
            <p
              className="font-serif italic text-[13px] leading-relaxed mb-4"
              style={{ color: primaryArquetipo.corAccent }}
            >
              &ldquo;{primaryArquetipo.frase}&rdquo;
            </p>

            {/* Trait pills */}
            <div className="flex gap-1.5 flex-wrap mb-5">
              {primaryArquetipo.tracos.map((traco) => (
                <span
                  key={traco}
                  className="font-sans font-light text-[7px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: `${primaryArquetipo.corAccent}20`,
                    color: primaryArquetipo.corTexto,
                  }}
                >
                  {traco}
                </span>
              ))}
            </div>

            <div
              className="h-px mb-4 opacity-20"
              style={{ backgroundColor: primaryArquetipo.corAccent }}
            />

            <p
              className="font-sans text-[7px] font-light tracking-[0.22em] uppercase mb-2"
              style={{ color: primaryArquetipo.corAccent }}
            >
              Assinatura de leitura
            </p>
            <p
              className="font-serif italic text-[15px] leading-snug mb-5"
              data-testid="text-reading-signature"
              style={{ color: primaryArquetipo.corTexto }}
            >
              &ldquo;{currentUser.readingSignature}&rdquo;
            </p>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleShareIdentity}
                className="flex items-center gap-2 rounded-[8px] px-4 py-2.5 transition-all hover:opacity-90"
                style={{
                  backgroundColor: `${primaryArquetipo.corTexto}18`,
                  border: `1px solid ${primaryArquetipo.corAccent}40`,
                  color: primaryArquetipo.corTexto,
                }}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="font-sans text-[9px] font-light tracking-[0.12em]">
                  {shareLabel}
                </span>
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 rounded-[8px] px-3 py-2.5 transition-all hover:opacity-90"
                style={{
                  backgroundColor: `${primaryArquetipo.corTexto}10`,
                  border: `1px solid ${primaryArquetipo.corAccent}30`,
                  color: primaryArquetipo.corTexto,
                }}
              >
                <Instagram className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        )}

        {/* DNA de Leitura */}
        <DnaDeLeiturasSection topArquetipos={topArquetipos} />

        {/* Estatísticas de leitura */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[12px] font-light tracking-[0.18em] uppercase text-[#4A4540]">Estatísticas de leitura</span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>

          {/* Quick numbers grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: "Lendo", value: leituraCount, icon: "📖" },
              { label: "Lidos", value: lidosCount, icon: "📚" },
              { label: "Posts", value: myMargins.length, icon: "✍" },
              { label: "Reações", value: reacoesFeitas, icon: "🔥" },
            ].map((stat) => (
              <div key={stat.label} data-testid={`stat-${stat.label.toLowerCase()}`} className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] py-3 text-center">
                <div className="text-[13px] mb-0.5">{stat.icon}</div>
                <div className="font-serif italic text-[24px] text-[#1E1C19] leading-none mb-0.5">{stat.value}</div>
                <div className="font-sans font-light text-[11px] tracking-[0.14em] uppercase text-[#7A726A]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Behavioral stats */}
          <div className="border border-[#AE8F7D]/15 rounded-[14px] divide-y divide-[#AE8F7D]/8">
            {/* Reactions received on user's margins */}
            {reacoesRecebidas > 0 && (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-[15px] flex-shrink-0">✨</span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[12px] font-light tracking-[0.14em] uppercase text-[#4A4540]">Respostas nos seus posts</p>
                  <p className="font-serif italic text-[15px] text-[#1E1C19]">{reacoesRecebidas} {reacoesRecebidas === 1 ? "reação" : "reações"}</p>
                </div>
              </div>
            )}
            {dominantEmojiEntry ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-[15px] flex-shrink-0">{dominantEmojiEntry.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[12px] font-light tracking-[0.14em] uppercase text-[#4A4540]">Reação mais usada</p>
                  <p className="font-serif italic text-[15px] text-[#1E1C19] capitalize">{dominantEmojiEntry.label}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-[15px] flex-shrink-0 opacity-40">🤍</span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[12px] font-light tracking-[0.14em] uppercase text-[#4A4540]">Reação mais usada</p>
                  <p className="font-serif italic text-[14px] text-[#7A726A]">Reaja a posts para aparecer aqui</p>
                </div>
              </div>
            )}
            {dominantMarginType && (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-[15px] flex-shrink-0">{dominantMarginType.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[12px] font-light tracking-[0.14em] uppercase text-[#4A4540]">Tipo de post dominante</p>
                  <p className="font-serif italic text-[15px] text-[#1E1C19]">{dominantMarginType.label}</p>
                </div>
              </div>
            )}
            {topEco && (() => {
              const total = Object.values(topEco.reactions as Record<string, number>).reduce((a, b) => a + b, 0);
              return total > 0 ? (
                <div className="flex items-start gap-3 px-4 py-3">
                  <span className="text-[15px] flex-shrink-0 mt-0.5">✨</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-[12px] font-light tracking-[0.14em] uppercase text-[#4A4540]">Post mais popular · {total} reações</p>
                    <p className="font-serif italic text-[13px] text-[#1E1C19] leading-snug line-clamp-2">
                      &ldquo;{topEco.excerpt.slice(0, 80)}{topEco.excerpt.length > 80 ? "…" : ""}&rdquo;
                    </p>
                  </div>
                </div>
              ) : null;
            })()}
            {topAnnotatedBook && (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-[15px] flex-shrink-0">📖</span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[12px] font-light tracking-[0.14em] uppercase text-[#4A4540]">Livro mais anotado</p>
                  <p className="font-serif italic text-[15px] text-[#1E1C19] truncate">{topAnnotatedBook.title}</p>
                  <p className="font-sans font-light text-[12px] text-[#7A726A]">{topAnnotatedBook.author}</p>
                </div>
              </div>
            )}
            {!dominantMarginType && !topAnnotatedBook && reacoesRecebidas === 0 && reacoesFeitas === 0 && !dominantEmojiEntry && (
              <div className="px-4 py-4 text-center">
                <p className="font-serif italic text-[14px] text-[#7A726A]">As estatísticas aparecem conforme você lê e reage</p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Meus posts ─── */}
        <section className="mb-7">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-sans text-[12px] font-light tracking-[0.18em] uppercase text-[#4A4540]">Meus posts</span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            {myMargins.length > 0 && (
              <span className="font-sans font-light text-[8px] text-[#2A2A2A]/30">{myMargins.length}</span>
            )}
          </div>
          <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40 mb-3">
            Trechos e reflexões que você publicou
          </p>
          {myMargins.length === 0 ? (
            <div className="rounded-[12px] px-5 py-8 text-center" style={{ border: "1.5px dashed #C8BFB4" }}>
              <p className="font-serif italic text-[16px] text-[#4A4540] mb-1.5">Nenhum post ainda</p>
              <p className="font-sans font-light text-[14px] text-[#7A726A]">
                Seus trechos e reflexões aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myMargins.slice(0, 5).map((m) => (
                <MarginCard key={m.id} margin={m} showBook linkToThread />
              ))}
            </div>
          )}
        </section>

        {/* ─── Posts salvos ─── */}
        {(() => {
          const saved = margins.filter((m) => savedMargins.includes(m.id));
          return (
            <section className="mb-7">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-sans text-[12px] font-light tracking-[0.18em] uppercase text-[#4A4540]">Posts salvos</span>
                <div className="flex-1 h-px bg-[#AE8F7D]/20" />
                {saved.length > 0 && (
                  <span className="font-sans font-light text-[8px] text-[#2A2A2A]/30">{saved.length}</span>
                )}
              </div>
              <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40 mb-3">
                Posts que tocaram você
              </p>
              {saved.length === 0 ? (
                <div className="rounded-[12px] px-5 py-8 text-center" style={{ border: "1.5px dashed #C8BFB4" }}>
                  <p className="font-serif italic text-[16px] text-[#4A4540] mb-1.5">Nenhum post salvo</p>
                  <p className="font-sans font-light text-[14px] text-[#7A726A]">
                    Os posts que tocarem você aparecerão aqui
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {saved.slice(0, 5).map((m) => (
                    <MarginCard key={m.id} margin={m} showBook linkToThread />
                  ))}
                </div>
              )}
            </section>
          );
        })()}

        {/* Quero Ler — Wishlist */}
        {wishlistBooks.length > 0 && (
          <section className="mb-7">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-sans text-[12px] font-light tracking-[0.18em] uppercase text-[#4A4540]">Quero ler</span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
              <span className="font-sans font-light text-[8px] text-[#2A2A2A]/30">{wishlistBooks.length}</span>
            </div>
            <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40 mb-3">
              Livros que ainda te esperam
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {wishlistBooks.map((book) => (
                <Link key={book.id} href={`/book/${book.id}`} className="flex-shrink-0">
                  <div className="w-[120px] bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[12px] overflow-hidden hover:border-[#AE8F7D]/35 transition-colors">
                    <div
                      className="h-[80px] w-full flex items-center justify-center relative"
                      style={{ backgroundColor: book.bookColor }}
                    >
                      <span className="font-serif italic text-[36px] text-[#3D3D3D]/30 select-none leading-none">
                        {book.title.charAt(0)}
                      </span>
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)",
                        }}
                      />
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[3px]"
                        style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="font-serif italic text-[11px] text-[#3D3D3D] leading-tight line-clamp-2 mb-0.5">
                        {book.title}
                      </p>
                      <p className="font-sans font-light text-[7px] text-[#2A2A2A]/40 truncate">
                        {book.author}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      {showShareModal && (
        <ArchetypeShareModal
          primaryArquetipo={primaryArquetipo}
          secondaryArquetipo={secondaryArquetipo}
          topArquetipos={topArquetipos}
          userName={fullName ?? currentUser.username ?? "Leitor"}
          userInitials={currentUser.initials ?? (currentUser.firstName?.[0] ?? "L")}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
