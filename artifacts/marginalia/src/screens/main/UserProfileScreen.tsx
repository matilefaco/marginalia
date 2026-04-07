import { useParams, Link } from "wouter";
import { ArrowLeft, Instagram, ExternalLink } from "lucide-react";
import { MOCK_USERS, MOCK_MARGINS, MOCK_BOOKS } from "@/data/mockData";
import { READER_ARCHETYPES } from "@/data/constants";
import { MarginCard } from "@/components/cards/MarginCard";
import { timeAgo } from "@/utils/formatting";
import { useApp } from "@/context/AppContext";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.5a8.16 8.16 0 0 0 4.77 1.52V7.57a4.85 4.85 0 0 1-1-.88Z" />
    </svg>
  );
}

export function UserProfileScreen() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const { currentUser } = useApp();

  const user = MOCK_USERS.find((u) => u.id === userId);
  if (!user || userId === currentUser.id) {
    return (
      <div className="min-h-full flex items-center justify-center screen-enter">
        <p className="font-serif italic text-[#2A2A2A]/40">Perfil não encontrado.</p>
      </div>
    );
  }

  const archetype = READER_ARCHETYPES.find((a) => a.id === user.readerType)
    ?? READER_ARCHETYPES.find((a) => a.id === "observador")!;

  const userMargins = MOCK_MARGINS.filter((m) => m.userId === userId && m.visibility === "public");
  const fullName = user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.name;

  const topAnnotatedBook = (() => {
    const counts: Record<number, number> = {};
    userMargins.forEach((m) => { counts[m.bookId] = (counts[m.bookId] || 0) + 1; });
    const top = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
    if (!top) return null;
    return MOCK_BOOKS.find((b) => b.id === Number(top[0])) ?? null;
  })();

  return (
    <div className="min-h-full bg-[#FAF8F3] screen-enter">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <button
          onClick={() => window.history.back()}
          className="text-[#2A2A2A]/40 hover:text-[#2A2A2A]/70 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="font-sans font-light text-[9px] tracking-[0.14em] uppercase text-[#2A2A2A]/35">
          Perfil do leitor
        </p>
      </div>

      <div className="px-5 pb-10 space-y-5">
        {/* Identity */}
        <div className="flex items-start gap-4">
          <div
            className="w-[72px] h-[72px] rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: user.avatarColor || "#697962" }}
          >
            <span className="font-serif italic text-[24px] text-[#FAF8F3]">{user.initials}</span>
          </div>
          <div className="flex-1 pt-1 min-w-0">
            <h1 className="font-serif text-[22px] text-[#3D3D3D] leading-tight">{fullName}</h1>
            <p className="font-sans font-light text-[10px] text-[#8A8178] mt-0.5">{user.username}</p>
            {user.city && (
              <p className="font-sans font-light text-[9px] text-[#2A2A2A]/35 mt-0.5">{user.city}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="font-serif italic text-[14px] text-[#2A2A2A]/60 leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Social Links */}
        {(user.instagram || user.tiktok) && (
          <div className="border border-[#AE8F7D]/15 rounded-[14px] p-4">
            <p className="font-sans text-[7px] font-light tracking-[0.22em] uppercase text-[#AE8F7D] mb-3">
              Onde encontrar
            </p>
            <div className="flex gap-3 flex-wrap">
              {user.instagram && (
                <a
                  href={`https://instagram.com/${user.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#EBE6DB]/60 rounded-[10px] px-3.5 py-2.5 hover:bg-[#AE8F7D]/10 transition-colors group"
                >
                  <Instagram className="w-4 h-4 text-[#2A2A2A]/50 group-hover:text-[#AE8F7D] transition-colors" />
                  <span className="font-sans font-light text-[11px] text-[#2A2A2A]/60 group-hover:text-[#2A2A2A]/80">{user.instagram}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#2A2A2A]/20 group-hover:text-[#AE8F7D]/60" />
                </a>
              )}
              {user.tiktok && (
                <a
                  href={`https://tiktok.com/@${user.tiktok.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#EBE6DB]/60 rounded-[10px] px-3.5 py-2.5 hover:bg-[#AE8F7D]/10 transition-colors group"
                >
                  <TikTokIcon className="w-4 h-4 text-[#2A2A2A]/50 group-hover:text-[#AE8F7D] transition-colors" />
                  <span className="font-sans font-light text-[11px] text-[#2A2A2A]/60 group-hover:text-[#2A2A2A]/80">{user.tiktok}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#2A2A2A]/20 group-hover:text-[#AE8F7D]/60" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Reader Archetype */}
        <div
          className="rounded-[16px] p-5 relative overflow-hidden"
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
            <p className="font-sans text-[7px] font-light tracking-[0.22em] uppercase text-[#AE8F7D] mb-2">
              Tipo de leitor
            </p>
            <p className="font-serif text-[20px] text-[#3D3D3D] leading-tight mb-1">{archetype.label}</p>
            <p className="font-serif italic text-[12px] text-[#2A2A2A]/55 mb-4 leading-snug">{archetype.description}</p>
            <div className="h-px bg-[#AE8F7D]/20 mb-4" />
            <p className="font-sans text-[7px] font-light tracking-[0.22em] uppercase text-[#AE8F7D] mb-2">
              Assinatura de leitura
            </p>
            <p className="font-serif italic text-[16px] text-[#3D3D3D] leading-snug">
              &ldquo;{user.readingSignature}&rdquo;
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Lidos", value: user.stats.booksRead, icon: "📚" },
            { label: "Posts", value: user.stats.totalMargins, icon: "✍" },
            { label: "Debates", value: user.stats.debates, icon: "💬" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] py-3 text-center">
              <div className="text-[13px] mb-0.5">{stat.icon}</div>
              <div className="font-serif text-[20px] text-[#3D3D3D] leading-none mb-0.5">{stat.value}</div>
              <div className="font-sans font-light text-[7px] tracking-[0.08em] uppercase text-[#2A2A2A]/35">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Livro mais anotado */}
        {topAnnotatedBook && (
          <Link href={`/book/${topAnnotatedBook.id}`}>
            <div className="flex items-center gap-3 border border-[#AE8F7D]/15 rounded-[14px] px-4 py-3 hover:border-[#AE8F7D]/30 transition-colors">
              <span className="text-[15px] flex-shrink-0">📖</span>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-[8px] font-light tracking-[0.08em] uppercase text-[#2A2A2A]/35">Livro mais anotado</p>
                <p className="font-serif italic text-[13px] text-[#3D3D3D] truncate">{topAnnotatedBook.title}</p>
                <p className="font-sans font-light text-[9px] text-[#2A2A2A]/40">{topAnnotatedBook.author}</p>
              </div>
            </div>
          </Link>
        )}

        {/* Gêneros favoritos */}
        {user.preferredGenres.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">Gêneros favoritos</span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <div className="flex flex-wrap gap-2">
              {user.preferredGenres.map((g) => (
                <span key={g} className="font-sans font-light text-[10px] text-[#2A2A2A]/60 bg-[#EBE6DB]/60 border border-[#AE8F7D]/15 rounded-full px-3 py-1.5">
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Public margins */}
        {userMargins.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">Margens públicas</span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
              <span className="font-sans font-light text-[8px] text-[#2A2A2A]/30">{userMargins.length}</span>
            </div>
            <div className="space-y-3">
              {userMargins.slice(0, 8).map((m) => (
                <MarginCard key={m.id} margin={m} showBook linkToThread />
              ))}
            </div>
          </div>
        )}

        {userMargins.length === 0 && (
          <div className="text-center py-10 border border-dashed border-[#AE8F7D]/15 rounded-[14px]">
            <p className="font-serif italic text-[13px] text-[#2A2A2A]/35">
              Nenhuma margem pública ainda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
