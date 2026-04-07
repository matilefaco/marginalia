import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { MOCK_MARGINS, MOCK_BOOKS } from "@/data/mockData";
import { MarginCard } from "@/components/cards/MarginCard";
import { ShareCardModal } from "@/components/cards/ShareCardModal";
import { BookCover } from "@/components/BookCover";
import { Settings, Pencil, Check, X, Share2, Instagram, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { READER_ARCHETYPES, EMOJI_REACTIONS, MARGIN_TYPES } from "@/data/constants";

const AVATAR_COLORS = [
  { id: "verde", label: "Verde", value: "#697962" },
  { id: "terracota", label: "Terracota", value: "#AE8F7D" },
  { id: "bege", label: "Bege", value: "#BDAB9C" },
  { id: "vinho", label: "Vinho", value: "#6B3A3A" },
  { id: "cinza", label: "Cinza", value: "#7A7A7A" },
];

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.5a8.16 8.16 0 0 0 4.77 1.52V7.57a4.85 4.85 0 0 1-1-.88Z" />
    </svg>
  );
}

/* ─── DNA de Leitura ─── */
interface DnaProps {
  myMargins: ReturnType<typeof useApp>["margins"];
  userReactions: Record<string, string>;
  myBooks: ReturnType<typeof useApp>["progress"];
  dominantMarginType: typeof MARGIN_TYPES[number] | null;
  dominantEmojiEntry: typeof EMOJI_REACTIONS[number] | null;
  archetype: typeof READER_ARCHETYPES[number];
}

function DnaDeLeiturasSection({ myMargins, userReactions, myBooks, dominantMarginType, dominantEmojiEntry, archetype }: DnaProps) {
  const hasData = myMargins.length > 0 || Object.keys(userReactions).length > 0;
  if (!hasData) return null;

  // Compute traits
  const marginCount = myMargins.length;
  const bookCount = myBooks.filter((p) => p.status === "reading" || p.status === "completed" || p.status === "finished").length;
  const avgMarginsPerBook = bookCount > 0 ? (marginCount / bookCount) : 0;

  const annotationStyle = (() => {
    if (!dominantMarginType) return null;
    const styleMap: Record<string, { label: string; desc: string; color: string }> = {
      favorite_quote:      { label: "Colecionador de trechos", desc: "Você guarda o que é belo", color: "#C9A99A" },
      symbolic_reading:    { label: "Leitor de símbolos", desc: "Você vê mais do que o texto diz", color: "#8A9E8C" },
      theory:              { label: "Construtor de teorias", desc: "Você conecta ideias", color: "#6B7A6B" },
      question:            { label: "O que questiona", desc: "Você não lê sem duvidar", color: "#BDAB9C" },
      critique:            { label: "Crítico exigente", desc: "Você avalia cada escolha do autor", color: "#7A7A7A" },
      reaction:            { label: "Leitor visceral", desc: "Você sente antes de pensar", color: "#C4A28C" },
      insight:             { label: "Caçador de insights", desc: "Você lê para entender", color: "#697962" },
      personal_connection: { label: "Leitor pessoal", desc: "Você se vê nas histórias", color: "#C4A08A" },
    };
    return styleMap[dominantMarginType.id] ?? null;
  })();

  const emotionalProfile = (() => {
    if (!dominantEmojiEntry) return null;
    const profileMap: Record<string, { label: string; desc: string }> = {
      "🤍": { label: "Leitor sensível", desc: "Você se toca facilmente" },
      "😭": { label: "Leitor emocional", desc: "Você sente tudo de verdade" },
      "🤔": { label: "Leitor reflexivo", desc: "Você processa devagar" },
      "🔥": { label: "Leitor intenso", desc: "Você lê com adrenalina" },
      "✨": { label: "Leitor estético", desc: "Você aprecia a forma" },
      "😮": { label: "Leitor curioso", desc: "Você se surpreende" },
    };
    return profileMap[dominantEmojiEntry.emoji] ?? null;
  })();

  const densityTrait = (() => {
    if (marginCount === 0) return null;
    if (avgMarginsPerBook >= 5) return { label: "Leitor denso", desc: "Você registra cada detalhe", icon: "📑" };
    if (avgMarginsPerBook >= 2) return { label: "Leitor criterioso", desc: "Você marca o que importa", icon: "✍" };
    return { label: "Leitor seletivo", desc: "Você guarda só o essencial", icon: "🎯" };
  })();

  const traits = [
    annotationStyle ? { ...annotationStyle, icon: dominantMarginType?.icon } : null,
    emotionalProfile ? { label: emotionalProfile.label, desc: emotionalProfile.desc, color: "#AE8F7D", icon: dominantEmojiEntry?.emoji } : null,
    densityTrait ? { label: densityTrait.label, desc: densityTrait.desc, color: "#697962", icon: densityTrait.icon } : null,
  ].filter(Boolean) as { label: string; desc: string; color: string; icon: string | undefined }[];

  if (traits.length === 0) return null;

  return (
    <div className="mb-7">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">DNA de leitura</span>
        <div className="flex-1 h-px bg-[#AE8F7D]/20" />
      </div>
      <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40 mb-4">
        Padrões que emergem das suas margens
      </p>

      <div className="space-y-2.5">
        {traits.map((trait, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-[14px] px-4 py-3.5 border"
            style={{
              borderColor: `${trait.color}25`,
              backgroundColor: `${trait.color}0A`,
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[18px]"
              style={{ backgroundColor: `${trait.color}18` }}
            >
              {trait.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-[15px] text-[#2A2A2A] leading-tight mb-0.5">{trait.label}</p>
              <p className="font-sans font-light text-[10px] text-[#2A2A2A]/50">{trait.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reading fingerprint tagline */}
      <div className="mt-4 rounded-[12px] border border-[#AE8F7D]/15 bg-[#EBE6DB]/20 px-4 py-3 flex items-center gap-3">
        <span className="text-[20px]">{archetype.marginTypes[0] ? "📚" : "📖"}</span>
        <div>
          <p className="font-sans text-[7.5px] font-light tracking-[0.18em] uppercase text-[#AE8F7D] mb-0.5">
            Impressão digital
          </p>
          <p className="font-serif italic text-[12.5px] text-[#2A2A2A]/65">
            {archetype.label} · {traits[0]?.label} · {dominantEmojiEntry?.emoji ?? "📖"}
          </p>
        </div>
      </div>
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
  const [editInstagram, setEditInstagram] = useState(currentUser.instagram || "");
  const [editTikTok, setEditTikTok] = useState(currentUser.tiktok || "");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
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

  const archetype = READER_ARCHETYPES.find((a) => a.id === currentUser.readerType)
    ?? READER_ARCHETYPES.find((a) => a.id === "observador")!;

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
    myMargins.forEach((m) => { counts[m.type] = (counts[m.type] || 0) + 1; });
    const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
    if (!top) return null;
    return MARGIN_TYPES.find((t) => t.id === top[0]) ?? null;
  })();

  const topAnnotatedBook = (() => {
    const counts: Record<number, number> = {};
    myMargins.forEach((m) => { counts[m.bookId] = (counts[m.bookId] || 0) + 1; });
    const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
    if (!top) return null;
    return MOCK_BOOKS.find((b) => b.id === Number(top[0])) ?? null;
  })();

  const topEco = myMargins.reduce<(typeof myMargins)[0] | null>((best, m) => {
    const total = Object.values(m.reactions as Record<string, number>).reduce((a, b) => a + b, 0);
    const bestTotal = best ? Object.values(best.reactions as Record<string, number>).reduce((a, b) => a + b, 0) : -1;
    return total > bestTotal ? m : best;
  }, null);

  const avatarColor = editing ? editAvatarColor : (currentUser.avatarColor || "#697962");

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
    setShowColorPicker(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const cancelEdit = () => {
    setEditFirstName(currentUser.firstName);
    setEditLastName(currentUser.lastName);
    setEditBio(currentUser.bio);
    setEditUsername(currentUser.username);
    setEditAvatarColor(currentUser.avatarColor || "#697962");
    setEditInstagram(currentUser.instagram || "");
    setEditTikTok(currentUser.tiktok || "");
    setEditing(false);
    setShowColorPicker(false);
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
            <div
              data-testid="avatar-user"
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: avatarColor }}
            >
              <span className="font-serif italic text-[24px] text-[#FAF8F3]">{currentUser.initials}</span>
            </div>
            {editing && (
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
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
                    className="flex-1 min-w-0 font-serif italic text-[16px] text-[#3D3D3D] bg-transparent border-b border-[#AE8F7D]/30 outline-none pb-0.5"
                  />
                  <input
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Sobrenome"
                    className="flex-1 min-w-0 font-serif italic text-[16px] text-[#3D3D3D] bg-transparent border-b border-[#AE8F7D]/30 outline-none pb-0.5"
                  />
                </div>
                <input
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="@username"
                  className="w-full min-w-0 font-sans font-light text-[11px] text-[#AE8F7D] bg-transparent border-b border-[#AE8F7D]/20 outline-none pb-0.5"
                />
              </div>
            ) : (
              <>
                <h1 className="font-serif text-[22px] text-[#3D3D3D] leading-tight" data-testid="text-fullname">
                  {fullName}
                </h1>
                <p className="font-sans font-light text-[10px] text-[#AE8F7D] mt-0.5" data-testid="text-username">
                  {currentUser.username}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Color Picker */}
        {editing && showColorPicker && (
          <div className="bg-[#FAF8F3] border border-[#AE8F7D]/20 rounded-[12px] p-4 mb-4">
            <p className="font-sans text-[8px] font-light tracking-[0.16em] uppercase text-[#AE8F7D] mb-3">
              Cor do avatar
            </p>
            <div className="flex gap-3 justify-center">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color.id}
                  data-testid={`avatar-color-${color.id}`}
                  onClick={() => setEditAvatarColor(color.value)}
                  className="relative w-9 h-9 rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                >
                  {editAvatarColor === color.value && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-4 h-4 text-[#FAF8F3]" />
                    </span>
                  )}
                </button>
              ))}
            </div>
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
              className="w-full font-serif italic text-[14px] text-[#2A2A2A]/60 bg-transparent border-b border-[#AE8F7D]/20 outline-none resize-none leading-relaxed"
            />
          ) : (
            currentUser.bio && (
              <p className="font-serif italic text-[14px] text-[#2A2A2A]/60 leading-relaxed" data-testid="text-bio">
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

        {/* Archetype + Reading Signature */}
        <div
          className="rounded-[16px] p-5 mb-5 relative overflow-hidden"
          style={{ backgroundColor: "#EBE6DB" }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.3) 1px, transparent 1px)",
              backgroundSize: "4px 4px",
            }}
          />
          <div className="relative z-10">
            <p className="font-sans text-[7px] font-light tracking-[0.22em] uppercase text-[#AE8F7D] mb-3">
              Seu tipo de leitor
            </p>
            <p className="font-serif text-[22px] text-[#3D3D3D] leading-tight mb-1">
              {archetype.label}
            </p>
            <p className="font-serif italic text-[13px] text-[#2A2A2A]/55 mb-4 leading-snug">
              {archetype.description}
            </p>

            <div className="h-px bg-[#AE8F7D]/20 mb-4" />

            <p className="font-sans text-[7px] font-light tracking-[0.22em] uppercase text-[#AE8F7D] mb-2">
              Assinatura de leitura
            </p>
            <p className="font-serif italic text-[17px] text-[#3D3D3D] leading-snug mb-4" data-testid="text-reading-signature">
              &ldquo;{currentUser.readingSignature}&rdquo;
            </p>

            <p className="font-sans font-light text-[8px] text-[#2A2A2A]/30 mb-4">
              Isso muda conforme você lê
            </p>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 bg-[#2A2A2A] text-[#FAF8F3] rounded-[8px] px-4 py-2.5 transition-colors hover:bg-[#3A3A3A]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="font-sans text-[9px] font-light tracking-[0.12em]">
                Compartilhar meu perfil de leitura
              </span>
            </button>
          </div>
        </div>

        {/* DNA de Leitura */}
        <DnaDeLeiturasSection
          myMargins={myMargins}
          userReactions={userReactions}
          myBooks={myBooks}
          dominantMarginType={dominantMarginType}
          dominantEmojiEntry={dominantEmojiEntry}
          archetype={archetype}
        />

        {/* Estatísticas de leitura */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">Estatísticas de leitura</span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>

          {/* Quick numbers grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: "Lendo", value: leituraCount, icon: "📖" },
              { label: "Lidos", value: lidosCount, icon: "📚" },
              { label: "Margens", value: myMargins.length, icon: "✍" },
              { label: "Reações", value: reacoesFeitas, icon: "🔥" },
            ].map((stat) => (
              <div key={stat.label} data-testid={`stat-${stat.label.toLowerCase()}`} className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] py-3 text-center">
                <div className="text-[13px] mb-0.5">{stat.icon}</div>
                <div className="font-serif text-[20px] text-[#3D3D3D] leading-none mb-0.5">{stat.value}</div>
                <div className="font-sans font-light text-[7px] tracking-[0.08em] uppercase text-[#2A2A2A]/35">{stat.label}</div>
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
                  <p className="font-sans text-[8px] font-light tracking-[0.08em] uppercase text-[#2A2A2A]/35">Ecos recebidos nas suas margens</p>
                  <p className="font-serif italic text-[13px] text-[#3D3D3D]">{reacoesRecebidas} {reacoesRecebidas === 1 ? "reação" : "reações"}</p>
                </div>
              </div>
            )}
            {dominantEmojiEntry ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-[15px] flex-shrink-0">{dominantEmojiEntry.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[8px] font-light tracking-[0.08em] uppercase text-[#2A2A2A]/35">Reação mais usada</p>
                  <p className="font-serif italic text-[13px] text-[#3D3D3D] capitalize">{dominantEmojiEntry.label}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-[15px] flex-shrink-0 opacity-30">🤍</span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[8px] font-light tracking-[0.08em] uppercase text-[#2A2A2A]/35">Reação mais usada</p>
                  <p className="font-serif italic text-[12px] text-[#2A2A2A]/30">Reaja a ecos para aparecer aqui</p>
                </div>
              </div>
            )}
            {dominantMarginType && (
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-[15px] flex-shrink-0">{dominantMarginType.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[8px] font-light tracking-[0.08em] uppercase text-[#2A2A2A]/35">Tipo de margem dominante</p>
                  <p className="font-serif italic text-[13px] text-[#3D3D3D]">{dominantMarginType.label}</p>
                </div>
              </div>
            )}
            {topEco && (() => {
              const total = Object.values(topEco.reactions as Record<string, number>).reduce((a, b) => a + b, 0);
              return total > 0 ? (
                <div className="flex items-start gap-3 px-4 py-3">
                  <span className="text-[15px] flex-shrink-0 mt-0.5">✨</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-[8px] font-light tracking-[0.08em] uppercase text-[#2A2A2A]/35">Eco mais popular · {total} reações</p>
                    <p className="font-serif italic text-[12px] text-[#3D3D3D] leading-snug line-clamp-2">
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
                  <p className="font-sans text-[8px] font-light tracking-[0.08em] uppercase text-[#2A2A2A]/35">Livro mais anotado</p>
                  <p className="font-serif italic text-[13px] text-[#3D3D3D] truncate">{topAnnotatedBook.title}</p>
                  <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40">{topAnnotatedBook.author}</p>
                </div>
              </div>
            )}
            {!dominantMarginType && !topAnnotatedBook && reacoesRecebidas === 0 && reacoesFeitas === 0 && !dominantEmojiEntry && (
              <div className="px-4 py-4 text-center">
                <p className="font-serif italic text-[13px] text-[#2A2A2A]/35">As estatísticas aparecem conforme você lê e reage</p>
              </div>
            )}
          </div>
        </div>

        {/* Quero Ler — Wishlist */}
        {wishlistBooks.length > 0 && (
          <section className="mb-7">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">Quero ler</span>
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

        {/* Guardados — saved ecos */}
        {savedMargins.length > 0 && (() => {
          const saved = margins.filter((m) => savedMargins.includes(m.id));
          return saved.length > 0 ? (
            <section className="mb-7">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">Guardados</span>
                <div className="flex-1 h-px bg-[#AE8F7D]/20" />
                <span className="font-sans font-light text-[8px] text-[#2A2A2A]/30">{saved.length}</span>
              </div>
              <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40 mb-3">
                Ecos que te tocaram
              </p>
              <div className="space-y-3">
                {saved.slice(0, 5).map((m) => (
                  <MarginCard key={m.id} margin={m} showBook linkToThread />
                ))}
              </div>
            </section>
          ) : null;
        })()}

        {/* My Margins */}
        {myMargins.length > 0 && (
          <section className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">Minhas margens</span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
              <span className="font-sans font-light text-[8px] text-[#2A2A2A]/30">{currentUser.stats.totalMargins} total</span>
            </div>
            <div className="space-y-3">
              {myMargins.slice(0, 3).map((m) => (
                <MarginCard key={m.id} margin={m} showBook linkToThread={false} />
              ))}
            </div>
          </section>
        )}
      </div>

      {showShareModal && (
        <ShareCardModal
          context={{
            type: "profile",
            userId: currentUser.id,
            userName: fullName ?? currentUser.username ?? "Leitor",
            userInitials: currentUser.initials ?? (currentUser.firstName?.[0] ?? "L"),
          }}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
