import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MOCK_MARGINS } from "@/data/mockData";
import { MarginCard } from "@/components/cards/MarginCard";
import { Settings, Pencil, Check, X, Share2, Instagram } from "lucide-react";
import { Link } from "wouter";
import { READER_ARCHETYPES } from "@/data/constants";

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

export function ProfileScreen() {
  const { currentUser, progress, updateProfile } = useApp();

  const [editing, setEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState(currentUser.firstName);
  const [editLastName, setEditLastName] = useState(currentUser.lastName);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editCity, setEditCity] = useState(currentUser.city);
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editAvatarColor, setEditAvatarColor] = useState(currentUser.avatarColor || "#697962");
  const [editInstagram, setEditInstagram] = useState(currentUser.instagram || "");
  const [editTikTok, setEditTikTok] = useState(currentUser.tiktok || "");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [shared, setShared] = useState(false);

  const myMargins = MOCK_MARGINS.filter((m) => m.userId === "user_me");
  const myBooks = progress.filter((p) => p.userId === "user_me");

  const archetype = READER_ARCHETYPES.find((a) => a.id === currentUser.readerType)
    ?? READER_ARCHETYPES.find((a) => a.id === "observador")!;

  const fullName = currentUser.lastName
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : currentUser.firstName || currentUser.name;

  const avatarColor = editing ? editAvatarColor : (currentUser.avatarColor || "#697962");

  const saveEdit = () => {
    updateProfile({
      firstName: editFirstName.trim() || currentUser.firstName,
      lastName: editLastName.trim(),
      bio: editBio.trim(),
      city: editCity.trim(),
      username: editUsername.trim(),
      avatarColor: editAvatarColor,
      instagram: editInstagram.trim(),
      tiktok: editTikTok.trim(),
    });
    setEditing(false);
    setShowColorPicker(false);
  };

  const cancelEdit = () => {
    setEditFirstName(currentUser.firstName);
    setEditLastName(currentUser.lastName);
    setEditBio(currentUser.bio);
    setEditCity(currentUser.city);
    setEditUsername(currentUser.username);
    setEditAvatarColor(currentUser.avatarColor || "#697962");
    setEditInstagram(currentUser.instagram || "");
    setEditTikTok(currentUser.tiktok || "");
    setEditing(false);
    setShowColorPicker(false);
  };

  const handleShare = () => {
    const text = `${fullName}\n${archetype.label}\n"${currentUser.readingSignature}"\n\nvia Marginalia`;
    if (navigator.share) {
      navigator.share({ title: "Meu perfil de leitura — Marginalia", text });
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="min-h-full bg-[#FAF8F3]">
      <div className="px-5 pt-10 pb-10">

        {/* Top Actions */}
        <div className="flex justify-end gap-3 mb-5">
          {editing ? (
            <>
              <button onClick={cancelEdit} className="text-[#454545]/35 hover:text-[#454545]/65 transition-colors">
                <X className="w-5 h-5" />
              </button>
              <button onClick={saveEdit} className="text-[#697962] hover:text-[#697962]/80 transition-colors">
                <Check className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                data-testid="button-edit-profile"
                onClick={() => setEditing(true)}
                className="text-[#454545]/35 hover:text-[#454545]/65 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <Link href="/settings">
                <button data-testid="button-settings" className="text-[#454545]/35 hover:text-[#454545]/65 transition-colors">
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
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    placeholder="Nome"
                    className="flex-1 font-serif italic text-[16px] text-[#3D3D3D] bg-transparent border-b border-[#AE8F7D]/30 outline-none pb-0.5"
                  />
                  <input
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    placeholder="Sobrenome"
                    className="flex-1 font-serif italic text-[16px] text-[#3D3D3D] bg-transparent border-b border-[#AE8F7D]/30 outline-none pb-0.5"
                  />
                </div>
                <input
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="@username"
                  className="w-full font-sans font-light text-[11px] text-[#AE8F7D] bg-transparent border-b border-[#AE8F7D]/20 outline-none pb-0.5"
                />
                <input
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="Cidade"
                  className="w-full font-sans font-light text-[10px] text-[#454545]/45 bg-transparent border-b border-[#454545]/10 outline-none pb-0.5"
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
                {currentUser.city && (
                  <p className="font-sans font-light text-[9px] text-[#454545]/30 mt-0.5">{currentUser.city}</p>
                )}
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
              className="w-full font-serif italic text-[14px] text-[#454545]/60 bg-transparent border-b border-[#AE8F7D]/20 outline-none resize-none leading-relaxed"
            />
          ) : (
            currentUser.bio && (
              <p className="font-serif italic text-[14px] text-[#454545]/60 leading-relaxed" data-testid="text-bio">
                {currentUser.bio}
              </p>
            )
          )}
        </div>

        {/* Social Links — edit mode */}
        {editing && (
          <div className="space-y-2 mb-5 bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[12px] p-4">
            <p className="font-sans text-[8px] font-light tracking-[0.16em] uppercase text-[#AE8F7D] mb-2">Redes sociais</p>
            <div className="flex items-center gap-2">
              <Instagram className="w-3.5 h-3.5 text-[#454545]/30 flex-shrink-0" />
              <input
                value={editInstagram}
                onChange={(e) => setEditInstagram(e.target.value)}
                placeholder="@seu.instagram"
                className="flex-1 font-sans font-light text-[11px] text-[#454545]/65 bg-transparent border-b border-[#454545]/10 outline-none pb-0.5"
              />
            </div>
            <div className="flex items-center gap-2">
              <TikTokIcon className="w-3 h-3 text-[#454545]/30 flex-shrink-0" />
              <input
                value={editTikTok}
                onChange={(e) => setEditTikTok(e.target.value)}
                placeholder="@seu.tiktok"
                className="flex-1 font-sans font-light text-[11px] text-[#454545]/65 bg-transparent border-b border-[#454545]/10 outline-none pb-0.5"
              />
            </div>
          </div>
        )}

        {/* Social Links — view mode */}
        {!editing && (currentUser.instagram || currentUser.tiktok) && (
          <div className="flex gap-4 mb-5">
            {currentUser.instagram && (
              <a
                href={`https://instagram.com/${currentUser.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#454545]/40 hover:text-[#AE8F7D] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span className="font-sans font-light text-[9px]">{currentUser.instagram}</span>
              </a>
            )}
            {currentUser.tiktok && (
              <a
                href={`https://tiktok.com/@${currentUser.tiktok.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#454545]/40 hover:text-[#AE8F7D] transition-colors"
              >
                <TikTokIcon className="w-3 h-3" />
                <span className="font-sans font-light text-[9px]">{currentUser.tiktok}</span>
              </a>
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
            <p className="font-serif italic text-[13px] text-[#454545]/55 mb-4 leading-snug">
              {archetype.description}
            </p>

            <div className="h-px bg-[#AE8F7D]/20 mb-4" />

            <p className="font-sans text-[7px] font-light tracking-[0.22em] uppercase text-[#AE8F7D] mb-2">
              Assinatura de leitura
            </p>
            <p className="font-serif italic text-[17px] text-[#3D3D3D] leading-snug mb-4" data-testid="text-reading-signature">
              &ldquo;{currentUser.readingSignature}&rdquo;
            </p>

            <p className="font-sans font-light text-[8px] text-[#454545]/30 mb-4">
              Isso muda conforme você lê
            </p>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-[#454545] text-[#FAF8F3] rounded-[8px] px-4 py-2.5 transition-colors hover:bg-[#3D3D3D]"
            >
              {shared ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span className="font-sans text-[9px] font-light tracking-[0.12em]">
                {shared ? "Copiado!" : "Compartilhar meu perfil de leitura"}
              </span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-7">
          {[
            { label: "Livros", value: myBooks.filter((p) => p.status !== "wishlist").length },
            { label: "Margens", value: currentUser.stats.totalMargins },
            { label: "Destaques", value: currentUser.stats.totalHighlights },
            { label: "Debates", value: currentUser.stats.debates },
          ].map((stat) => (
            <div key={stat.label} data-testid={`stat-${stat.label.toLowerCase()}`} className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] py-3 text-center">
              <div className="font-serif text-[24px] text-[#3D3D3D] leading-none mb-0.5">{stat.value}</div>
              <div className="font-sans font-light text-[7px] tracking-[0.1em] uppercase text-[#454545]/35">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* My Margins */}
        {myMargins.length > 0 && (
          <section className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">Minhas margens</span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
              <span className="font-sans font-light text-[8px] text-[#454545]/30">{currentUser.stats.totalMargins} total</span>
            </div>
            <div className="space-y-3">
              {myMargins.slice(0, 3).map((m) => (
                <MarginCard key={m.id} margin={m} showBook linkToThread={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
