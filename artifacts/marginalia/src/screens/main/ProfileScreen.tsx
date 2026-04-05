import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MOCK_USERS, MOCK_MARGINS } from "@/data/mockData";
import { MarginCard } from "@/components/cards/MarginCard";
import { Settings, Pencil, Check, X } from "lucide-react";
import { Link } from "wouter";

const AVATAR_COLORS = [
  { id: "verde", label: "Verde", value: "#697962" },
  { id: "terracota", label: "Terracota", value: "#AE8F7D" },
  { id: "bege", label: "Bege", value: "#BDAB9C" },
  { id: "vinho", label: "Vinho", value: "#6B3A3A" },
  { id: "cinza", label: "Cinza", value: "#7A7A7A" },
];

export function ProfileScreen() {
  const { currentUser, progress, updateProfile } = useApp();

  const [editing, setEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState(currentUser.firstName);
  const [editLastName, setEditLastName] = useState(currentUser.lastName);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editCity, setEditCity] = useState(currentUser.city);
  const [editUsername, setEditUsername] = useState(currentUser.username);
  const [editAvatarColor, setEditAvatarColor] = useState(currentUser.avatarColor || "#697962");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const myMargins = MOCK_MARGINS.filter((m) => m.userId === "user_me");
  const myBooks = progress.filter((p) => p.userId === "user_me");

  const compatibleReaders = MOCK_USERS.filter((u) => u.id !== "user_me")
    .sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0))
    .slice(0, 3);

  const fullName = currentUser.lastName
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : currentUser.firstName || currentUser.name;

  const avatarColor = currentUser.avatarColor || "#697962";

  const saveEdit = () => {
    updateProfile({
      firstName: editFirstName.trim() || currentUser.firstName,
      lastName: editLastName.trim(),
      bio: editBio.trim(),
      city: editCity.trim(),
      username: editUsername.trim(),
      avatarColor: editAvatarColor,
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
    setEditing(false);
    setShowColorPicker(false);
  };

  return (
    <div className="min-h-full bg-[#FAF8F3]">
      <div className="px-5 pt-10 pb-6">
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
              style={{ backgroundColor: editing ? editAvatarColor : avatarColor }}
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
        <div className="mb-5">
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

        {/* Reading Signature */}
        <div className="bg-[#EBE6DB]/50 border border-[#AE8F7D]/15 rounded-[14px] p-4 mb-6">
          <p className="font-sans text-[7px] font-light tracking-[0.2em] uppercase text-[#AE8F7D] mb-2">Assinatura de leitura</p>
          <p className="font-serif italic text-[16px] text-[#3D3D3D] leading-snug" data-testid="text-reading-signature">
            &ldquo;{currentUser.readingSignature}&rdquo;
          </p>
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

        {/* Compatible Readers */}
        <section>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">Leitores compatíveis</span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <p className="font-sans font-light text-[9px] text-[#454545]/40 mb-3">Gosto parecido com o seu</p>
          <div className="space-y-2">
            {compatibleReaders.map((reader) => (
              <div key={reader.id} className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: reader.avatarColor || "#697962" }}
                  >
                    <span className="font-sans text-[10px] text-[#FAF8F3]">{reader.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-[14px] text-[#3D3D3D]">{reader.name}</p>
                    <p className="font-sans font-light text-[9px] text-[#454545]/35">{reader.username}</p>
                  </div>
                  {reader.compatibilityScore && (
                    <div className="flex-shrink-0 text-right">
                      <span className="font-serif text-[16px] text-[#AE8F7D] leading-none block">{reader.compatibilityScore}%</span>
                      <span className="font-sans font-light text-[7px] tracking-[0.08em] uppercase text-[#454545]/25">compatível</span>
                    </div>
                  )}
                </div>
                <p className="font-serif italic text-[11px] text-[#AE8F7D]">&ldquo;{reader.readingSignature}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
