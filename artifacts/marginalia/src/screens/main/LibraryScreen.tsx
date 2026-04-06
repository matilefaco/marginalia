import { useState } from "react";
import { Link } from "wouter";
import { useApp } from "@/context/AppContext";
import { MOCK_BOOKS } from "@/data/mockData";
import { LIBRARY_STATUSES } from "@/data/constants";
import { progressLabel } from "@/utils/formatting";
import { Plus } from "lucide-react";
import { BookCover } from "@/components/BookCover";

type FilterId = typeof LIBRARY_STATUSES[number]["id"];

export function LibraryScreen() {
  const { progress, margins, currentUser } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  const myProgress = progress.filter((p) => p.userId === currentUser.id);

  const booksWithProgress = myProgress
    .map((p) => {
      const book = MOCK_BOOKS.find((b) => b.id === p.bookId);
      if (!book) return null;
      const myMargins = margins.filter((m) => m.bookId === p.bookId && m.userId === currentUser.id).length;
      return { ...book, prog: p, myMargins };
    })
    .filter(Boolean) as Array<ReturnType<typeof MOCK_BOOKS.find> & { prog: typeof myProgress[0]; myMargins: number }>;

  const filtered = booksWithProgress.filter((item) => {
    if (!item) return false;
    if (activeFilter === "all") return true;
    return item.prog.status === activeFilter;
  });

  return (
    <div className="min-h-full bg-[#FAF8F3] overflow-x-hidden screen-enter">
      <div className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-serif italic text-[26px] text-[#454545]">Biblioteca</h1>
          <Link href="/nova-margem">
            <button className="text-[#454545]/35 hover:text-[#454545]/60 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {LIBRARY_STATUSES.map((f) => (
            <button
              key={f.id}
              data-testid={`filter-library-${f.id}`}
              onClick={() => setActiveFilter(f.id as FilterId)}
              className={`flex-shrink-0 font-sans text-[9px] font-light tracking-[0.12em] uppercase px-4 py-2 rounded-full border transition-all ${
                activeFilter === f.id
                  ? "bg-[#454545] text-[#FAF8F3] border-transparent"
                  : "bg-transparent text-[#454545]/45 border-[#454545]/12 hover:border-[#AE8F7D]/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-serif italic text-[15px] text-[#454545]/35 mb-4">
              Nenhum livro aqui ainda.
            </p>
            <Link href="/explore">
              <button className="font-sans text-[10px] font-light tracking-[0.12em] uppercase text-[#AE8F7D] border border-[#AE8F7D]/30 px-4 py-2 rounded-full hover:bg-[#AE8F7D]/5 transition-colors">
                Explorar livros
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              if (!item) return null;
              const p = item.prog;
              return (
                <Link
                  key={item.id}
                  href={`/book/${item.id}`}
                  data-testid={`card-library-book-${item.id}`}
                >
                  <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[14px] p-4 flex items-center gap-4 hover:border-[#AE8F7D]/30 transition-colors">
                    <BookCover title={item.title} bookColor={item.bookColor} coverUrl={item.coverUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-[15px] text-[#454545] leading-tight mb-0.5 truncate">
                        {item.title}
                      </p>
                      <p className="font-sans font-light text-[9px] tracking-[0.08em] uppercase text-[#454545]/40 mb-2">
                        {item.author}
                      </p>

                      {p.status === "reading" && (
                        <div className="mb-1.5">
                          <div className="w-full h-[2px] bg-[#EBE6DB] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#AE8F7D] rounded-full"
                              style={{ width: `${p.currentPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <span className="font-sans font-light text-[8px] text-[#454545]/35">
                          {progressLabel(p)}
                        </span>
                        <span className="text-[#AE8F7D]/20">·</span>
                        <span className="font-sans font-light text-[8px] text-[#454545]/35">
                          {item.myMargins} {item.myMargins === 1 ? "margem" : "margens"}
                        </span>
                        <span className="text-[#AE8F7D]/20">·</span>
                        <span className="font-sans font-light text-[8px] text-[#697962]">
                          {item.communityStats.totalMargins} ecos
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
