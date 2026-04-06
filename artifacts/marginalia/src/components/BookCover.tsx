import { useState } from "react";

interface Props {
  title: string;
  author?: string;
  bookColor: string;
  coverUrl?: string | null;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export function BookCover({ title, bookColor, coverUrl, className = "", size = "md" }: Props) {
  const [imgFailed, setImgFailed] = useState(false);

  const sizes = {
    xs: { wrapper: "w-8 h-11", fontSize: 14, showTitle: false },
    sm: { wrapper: "w-12 h-16", fontSize: 18, showTitle: false },
    md: { wrapper: "w-14 h-20", fontSize: 22, showTitle: true },
    lg: { wrapper: "w-20 h-28", fontSize: 28, showTitle: true },
  }[size];

  const initial = title.charAt(0).toUpperCase();
  const showImage = !!coverUrl && !imgFailed;

  return (
    <div
      className={`${sizes.wrapper} rounded-[6px] flex-shrink-0 overflow-hidden relative ${className}`}
      style={{ backgroundColor: bookColor }}
    >
      {showImage ? (
        <img
          src={coverUrl!}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.15) 100%)`,
            }}
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
        style={{ backgroundColor: showImage ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.18)" }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-px"
        style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
      />
    </div>
  );
}
