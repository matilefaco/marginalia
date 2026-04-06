import { useState, useEffect } from "react";

interface Props {
  title: string;
  author?: string;
  bookColor: string;
  coverUrl?: string | null;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export function BookCover({ title, author, bookColor, coverUrl, className = "", size = "md" }: Props) {
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [olCoverUrl, setOlCoverUrl] = useState<string | null>(null);
  const [olFailed, setOlFailed] = useState(false);

  const sizes = {
    xs: { wrapper: "w-8 h-11", fontSize: 14, showTitle: false },
    sm: { wrapper: "w-12 h-16", fontSize: 18, showTitle: false },
    md: { wrapper: "w-14 h-20", fontSize: 22, showTitle: true },
    lg: { wrapper: "w-20 h-28", fontSize: 28, showTitle: true },
  }[size];

  const initial = title.charAt(0).toUpperCase();

  useEffect(() => {
    if (!primaryFailed || !title) return;
    const q = author ? `${title} ${author}` : title;
    fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=cover_i&limit=1`)
      .then((r) => r.json())
      .then((d) => {
        const coverId = d?.docs?.[0]?.cover_i;
        if (coverId) setOlCoverUrl(`https://covers.openlibrary.org/b/id/${coverId}-M.jpg`);
      })
      .catch(() => {});
  }, [primaryFailed, title, author]);

  const showPrimary = !!coverUrl && !primaryFailed;
  const showOl = !showPrimary && !!olCoverUrl && !olFailed;
  const showPlaceholder = !showPrimary && !showOl;

  return (
    <div
      className={`${sizes.wrapper} rounded-[6px] flex-shrink-0 overflow-hidden relative ${className}`}
      style={{ backgroundColor: bookColor }}
    >
      {showPrimary && (
        <img
          src={coverUrl!}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setPrimaryFailed(true)}
        />
      )}
      {showOl && (
        <img
          src={olCoverUrl!}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setOlFailed(true)}
        />
      )}
      {showPlaceholder && (
        <>
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.15) 100%)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.06) 1px, transparent 1px)",
              backgroundSize: "3px 3px",
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-1 gap-0.5">
            <span
              className="font-serif italic text-[#3D3D3D]/45 leading-none select-none"
              style={{ fontSize: sizes.fontSize }}
            >
              {initial}
            </span>
            {sizes.showTitle && (
              <span className="font-sans text-[5px] font-light tracking-[0.06em] text-[#3D3D3D]/30 text-center leading-tight line-clamp-2 px-0.5">
                {title}
              </span>
            )}
          </div>
        </>
      )}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[6px]"
        style={{ backgroundColor: showPrimary || showOl ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.18)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-px"
        style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
      />
    </div>
  );
}
