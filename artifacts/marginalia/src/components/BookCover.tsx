import { LogoMark } from "./LogoMark";

interface BookCoverProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BookCover({ size = "md", className = "" }: BookCoverProps) {
  const sizeClass = size === "sm" ? "w-full h-full" : size === "lg" ? "w-full h-full" : "w-full h-full";
  return (
    <div
      className={`${sizeClass} ${className} bg-[#EBE6DB] flex flex-col items-center justify-center`}
      style={{
        backgroundImage: "radial-gradient(circle, rgba(189,171,156,0.15) 1px, transparent 1px)",
        backgroundSize: "5px 5px",
      }}
    >
      <LogoMark className={size === "sm" ? "w-6 h-7" : "w-12 h-14"} />
    </div>
  );
}
