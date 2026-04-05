import { useApp } from "@/context/AppContext";
import { MOCK_USERS, MOCK_MARGINS } from "@/data/mockData";
import { MarginCard } from "@/components/cards/MarginCard";
import { Settings } from "lucide-react";
import { Link } from "wouter";

export function ProfileScreen() {
  const { currentUser, progress } = useApp();

  const myMargins = MOCK_MARGINS.filter((m) => m.userId === "user_me");
  const myBooks = progress.filter((p) => p.userId === "user_me");

  const compatibleReaders = MOCK_USERS.filter((u) => u.id !== "user_me")
    .sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0))
    .slice(0, 3);

  const fullName = currentUser.lastName
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : currentUser.firstName || currentUser.name;

  return (
    <div className="min-h-full bg-[#FAF8F3]">
      <div className="px-5 pt-10 pb-6">
        {/* Top Actions */}
        <div className="flex justify-end mb-5">
          <Link href="/settings">
            <button
              data-testid="button-settings"
              className="text-[#454545]/35 hover:text-[#454545]/65 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Identity */}
        <div className="flex items-start gap-4 mb-5">
          <div
            data-testid="avatar-user"
            className="w-18 h-18 rounded-full bg-[#697962] flex items-center justify-center flex-shrink-0"
            style={{ width: 72, height: 72 }}
          >
            <span className="font-serif italic text-[24px] text-[#FAF8F3]">{currentUser.initials}</span>
          </div>
          <div className="flex-1 pt-1">
            <h1
              className="font-serif text-[22px] text-[#3D3D3D] leading-tight"
              data-testid="text-fullname"
            >
              {fullName}
            </h1>
            <p className="font-sans font-light text-[10px] text-[#AE8F7D] mt-0.5" data-testid="text-username">
              {currentUser.username}
            </p>
            {currentUser.city && (
              <p className="font-sans font-light text-[9px] text-[#454545]/30 mt-0.5">{currentUser.city}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        {currentUser.bio && (
          <p
            className="font-serif italic text-[14px] text-[#454545]/60 leading-relaxed mb-5"
            data-testid="text-bio"
          >
            {currentUser.bio}
          </p>
        )}

        {/* Reading Signature */}
        <div className="bg-[#EBE6DB]/50 border border-[#AE8F7D]/15 rounded-[14px] p-4 mb-6">
          <p className="font-sans text-[7px] font-light tracking-[0.2em] uppercase text-[#AE8F7D] mb-2">
            Assinatura de leitura
          </p>
          <p
            className="font-serif italic text-[16px] text-[#3D3D3D] leading-snug"
            data-testid="text-reading-signature"
          >
            &ldquo;{currentUser.readingSignature}&rdquo;
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: "Livros", value: myBooks.filter((p) => p.status !== "wishlist").length },
            { label: "Margens", value: currentUser.stats.totalMargins },
            { label: "Destaques", value: currentUser.stats.totalHighlights },
            { label: "Debates", value: currentUser.stats.debates },
          ].map((stat) => (
            <div
              key={stat.label}
              data-testid={`stat-${stat.label.toLowerCase()}`}
              className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] py-3 text-center"
            >
              <div className="font-serif text-[24px] text-[#3D3D3D] leading-none mb-0.5">{stat.value}</div>
              <div className="font-sans font-light text-[7px] tracking-[0.1em] uppercase text-[#454545]/35">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Genres */}
        {currentUser.preferredGenres.length > 0 && (
          <div className="mb-7">
            <p className="font-sans text-[8px] font-light tracking-[0.2em] uppercase text-[#AE8F7D] mb-2">
              Gêneros
            </p>
            <div className="flex flex-wrap gap-1.5">
              {currentUser.preferredGenres.map((g) => (
                <span
                  key={g}
                  className="font-sans font-light text-[10px] px-3 py-1.5 rounded-full bg-[#EBE6DB] text-[#454545]/60 border border-[#AE8F7D]/12"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* My Margins */}
        {myMargins.length > 0 && (
          <section className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Minhas margens
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
              <span className="font-sans font-light text-[8px] text-[#454545]/30">
                {currentUser.stats.totalMargins} total
              </span>
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
            <span className="font-sans text-[8px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
              Leitores compatíveis
            </span>
            <div className="flex-1 h-px bg-[#AE8F7D]/20" />
          </div>
          <p className="font-sans font-light text-[9px] text-[#454545]/40 mb-3">
            Gosto parecido com o seu
          </p>
          <div className="space-y-2">
            {compatibleReaders.map((reader) => (
              <div
                key={reader.id}
                className="bg-[#FAF8F3] border border-[#AE8F7D]/12 rounded-[12px] p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-[#EBE6DB] flex items-center justify-center flex-shrink-0">
                    <span className="font-sans text-[10px] text-[#454545]/60">{reader.initials}</span>
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
