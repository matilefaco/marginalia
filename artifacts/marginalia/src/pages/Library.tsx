import { useState } from "react";
import { useListBooks } from "@workspace/api-client-react";
import { Link } from "wouter";
import { BookCover } from "@/components/BookCover";
import type { Book } from "@workspace/api-client-react";

const FILTERS = ["Todos", "Lendo", "Concluídos", "Lista de desejos"] as const;
type Filter = typeof FILTERS[number];

const STATUS_MAP: Record<Filter, string | null> = {
  "Todos": null,
  "Lendo": "reading",
  "Concluídos": "completed",
  "Lista de desejos": "wishlist",
};

export default function Library() {
  const { data: books, isLoading } = useListBooks();
  const [activeFilter, setActiveFilter] = useState<Filter>("Todos");

  const filtered = books?.filter((b) => {
    const status = STATUS_MAP[activeFilter];
    return status === null || b.status === status;
  }) ?? [];

  return (
    <div className="min-h-full bg-[#FAF8F3]">
      <div className="px-5 pt-8 pb-4">
        <h1 className="font-serif italic text-[24px] text-[#454545] mb-5">Biblioteca</h1>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              data-testid={`filter-${f}`}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 font-sans text-[9px] font-light tracking-[0.14em] uppercase px-4 py-2 rounded-full border transition-all ${
                activeFilter === f
                  ? "bg-[#454545] text-[#FAF8F3] border-transparent"
                  : "bg-transparent text-[#454545]/50 border-[#454545]/15 hover:border-[#AE8F7D]/30"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-8">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-52 bg-[#EBE6DB] rounded-[12px] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="font-serif italic text-sm text-[#454545]/40 text-center py-12">
            Nenhum livro aqui ainda.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/book/${book.id}`} data-testid={`card-library-book-${book.id}`}>
      <div className="bg-[#FAF8F3] border border-[#AE8F7D]/15 rounded-[12px] overflow-hidden hover:border-[#AE8F7D]/30 transition-colors">
        <div className="h-32">
          <BookCover />
        </div>
        <div className="p-3">
          <p className="font-serif text-[13px] text-[#454545] leading-tight mb-0.5 line-clamp-2">
            {book.title}
          </p>
          <p className="font-sans font-light text-[9px] tracking-[0.06em] uppercase text-[#454545]/40 mb-2">
            {book.author}
          </p>
          <div className="w-full h-[2px] bg-[#EBE6DB] rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-[#AE8F7D] rounded-full"
              style={{ width: `${book.progress}%` }}
            />
          </div>
          <div className="flex justify-between">
            <span className="font-sans font-light text-[8px] text-[#454545]/30">
              {Math.round(book.progress)}%
            </span>
            <span className="font-sans font-light text-[8px] text-[#454545]/30">
              {book.annotations} notas
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
