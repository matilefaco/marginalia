import { useGetMe } from "@workspace/api-client-react";
import { AnnotationCard } from "@/components/AnnotationCard";

export default function Profile() {
  const { data: user, isLoading } = useGetMe();

  if (isLoading) {
    return (
      <div className="min-h-full bg-[#FAF8F3] px-5 py-8">
        <div className="h-24 bg-[#EBE6DB] rounded-[14px] animate-pulse mb-4" />
        <div className="h-20 bg-[#EBE6DB] rounded-[14px] animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-full bg-[#FAF8F3]">
      <div className="px-5 pt-8 pb-6">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4 mb-5">
          <div
            data-testid="avatar-user"
            className="w-16 h-16 rounded-full bg-[#697962] flex items-center justify-center flex-shrink-0"
          >
            <span className="font-serif italic text-[22px] text-[#FAF8F3]">{user.initials}</span>
          </div>
          <div>
            <h1 className="font-serif text-[22px] text-[#454545]" data-testid="text-username">{user.name}</h1>
            {user.bio && (
              <p className="font-serif italic text-[13px] text-[#454545]/55 mt-0.5">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Identity Phrase */}
        <div className="bg-[#EBE6DB]/60 border border-[#AE8F7D]/15 rounded-[12px] p-4 mb-5">
          <span className="font-sans text-[8px] font-light tracking-[0.18em] uppercase text-[#AE8F7D] block mb-1">
            Perfil de leitura
          </span>
          <p className="font-serif italic text-[15px] text-[#454545]" data-testid="text-identity-phrase">
            &ldquo;{user.identityPhrase}&rdquo;
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-7">
          {[
            { label: "Livros", value: user.booksRead },
            { label: "Anotações", value: user.totalAnnotations },
            { label: "Destaques", value: user.totalHighlights },
          ].map((stat) => (
            <div
              key={stat.label}
              data-testid={`stat-${stat.label.toLowerCase()}`}
              className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[12px] py-4 text-center"
            >
              <div className="font-serif text-[26px] text-[#454545]">{stat.value}</div>
              <div className="font-sans font-light text-[8px] tracking-[0.12em] uppercase text-[#454545]/40 mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Excerpts */}
        {user.recentExcerpts && user.recentExcerpts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-sans text-[9px] font-light tracking-[0.22em] uppercase text-[#AE8F7D]">
                Trechos favoritos
              </span>
              <div className="flex-1 h-px bg-[#AE8F7D]/20" />
            </div>
            <div className="space-y-3">
              {user.recentExcerpts.map((annotation) => (
                <AnnotationCard key={annotation.id} annotation={annotation} showBook />
              ))}
            </div>
            {user.recentExcerpts.length === 0 && (
              <p className="font-serif italic text-sm text-[#454545]/40 text-center py-6">
                Nenhuma anotação ainda. O texto aguarda o seu gesto.
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
