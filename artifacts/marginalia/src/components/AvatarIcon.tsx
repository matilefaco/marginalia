import { getAvatarById } from "@/data/avatarDefinitions";

interface Props {
  avatarId?: string | null;
  initials?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP = {
  xs: 16,
  sm: 20,
  md: 28,
  lg: 44,
  xl: 72,
};

function AvatarSvg({ id }: { id: string }) {
  switch (id) {
    case "vela":
      return (
        <>
          <ellipse cx="22" cy="28" rx="6" ry="8" fill="rgba(240,220,180,0.12)" />
          <ellipse cx="22" cy="11" rx="3.5" ry="5.5" fill="#F0A040" opacity="0.95" />
          <ellipse cx="22" cy="12" rx="2.2" ry="3.8" fill="#F8D060" />
          <ellipse cx="22" cy="13.5" rx="1.3" ry="2.2" fill="#FFFAA0" />
          <line x1="22" y1="17" x2="22" y2="19" stroke="#7A6040" strokeWidth="1" />
          <rect x="16.5" y="19" width="11" height="17" rx="2" fill="#F5EFE0" />
          <rect x="16.5" y="19" width="11" height="3.5" rx="1.5" fill="#EAE0CC" />
          <path d="M16.5 21 Q19 23 22 22 Q25 21 27.5 23" stroke="#D8CEBB" strokeWidth="0.5" fill="none" />
          <ellipse cx="22" cy="37" rx="5.5" ry="1.5" fill="#000" opacity="0.2" />
        </>
      );
    case "pena":
      return (
        <>
          <path d="M29 7 C34 12 31 23 22 31 L20 33 L17 28 C24 20 27 12 29 7Z" fill="#C8D8A8" opacity="0.9" />
          <path d="M29 7 C27 14 23 21 17 28 L20 33 C24 23 28 14 29 7Z" fill="#90A870" opacity="0.55" />
          <path d="M29 8 L17 29" stroke="#708850" strokeWidth="0.8" opacity="0.7" />
          <path d="M26 12 Q23 14 20 19" stroke="#90A870" strokeWidth="0.5" fill="none" opacity="0.5" />
          <path d="M28 16 Q25 17 22 21" stroke="#90A870" strokeWidth="0.4" fill="none" opacity="0.4" />
          <path d="M17 28 L14 35 L18.5 30Z" fill="#506838" />
          <circle cx="14" cy="36.5" r="1.2" fill="#304828" opacity="0.6" />
          <circle cx="12.5" cy="37.5" r="0.7" fill="#304828" opacity="0.35" />
        </>
      );
    case "cafe":
      return (
        <>
          <path d="M18 14 Q17 11 19 8" stroke="#C8A880" strokeWidth="0.9" fill="none" opacity="0.5" strokeLinecap="round" />
          <path d="M22 13 Q21 10 23 7" stroke="#C8A880" strokeWidth="0.9" fill="none" opacity="0.6" strokeLinecap="round" />
          <path d="M26 14 Q25 11 27 8" stroke="#C8A880" strokeWidth="0.9" fill="none" opacity="0.5" strokeLinecap="round" />
          <path d="M12 18 L14.5 33 Q14.5 35 17 35 L27 35 Q29.5 35 29.5 33 L32 18Z" fill="#C8A068" />
          <path d="M12 18 L32 18 Q32 16 22 16 Q12 16 12 18Z" fill="#D8B078" />
          <ellipse cx="22" cy="20" rx="7.5" ry="2.2" fill="#3A2010" opacity="0.7" />
          <path d="M29.5 22 Q37 22 37 27 Q37 32 29.5 32" stroke="#B08858" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <ellipse cx="22" cy="36" rx="11" ry="2.2" fill="#A07848" opacity="0.4" />
        </>
      );
    case "oculos":
      return (
        <>
          <line x1="7" y1="22" x2="14" y2="23" stroke="#9090C8" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="30" y1="23" x2="37" y2="22" stroke="#9090C8" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M20 22 Q22 19.5 24 22" stroke="#9090C8" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          <circle cx="15.5" cy="24" r="6.5" stroke="#A0A0D8" strokeWidth="1.3" fill="rgba(120,120,200,0.10)" />
          <circle cx="28.5" cy="24" r="6.5" stroke="#A0A0D8" strokeWidth="1.3" fill="rgba(120,120,200,0.10)" />
          <path d="M12 20 Q14 18.5 17 20" stroke="white" strokeWidth="0.7" fill="none" opacity="0.35" strokeLinecap="round" />
          <path d="M25 20 Q27 18.5 30 20" stroke="white" strokeWidth="0.7" fill="none" opacity="0.35" strokeLinecap="round" />
        </>
      );
    case "folha":
      return (
        <>
          <path d="M22 7 C29 10 38 17 35 28 C32 36 24 38 22 38 C20 38 12 36 9 28 C6 17 15 10 22 7Z" fill="#D07838" opacity="0.92" />
          <path d="M22 7 C27 12 31 19 29 28 C27 34 22 36 22 38 C22 36 17 34 15 28 C13 19 17 12 22 7Z" fill="#903A10" opacity="0.45" />
          <line x1="22" y1="9" x2="22" y2="37" stroke="#7A3008" strokeWidth="0.9" opacity="0.55" />
          <path d="M22 17 Q27 15 32 17" stroke="#7A3008" strokeWidth="0.55" fill="none" opacity="0.4" />
          <path d="M22 24 Q27 22 31 23" stroke="#7A3008" strokeWidth="0.55" fill="none" opacity="0.4" />
          <path d="M22 17 Q17 15 12 17" stroke="#7A3008" strokeWidth="0.55" fill="none" opacity="0.4" />
          <path d="M22 24 Q17 22 13 23" stroke="#7A3008" strokeWidth="0.55" fill="none" opacity="0.4" />
          <path d="M22 37 Q25 40 24 42" stroke="#602808" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </>
      );
    case "lua":
      return (
        <>
          <ellipse cx="22" cy="22" rx="14" ry="14" fill="rgba(180,170,120,0.04)" />
          <path d="M27 9 C20 11 15 17 15 24 C15 31 20 37 27 39 C18 39 9 32 9 24 C9 16 18 9 27 9Z" fill="#E0D090" opacity="0.92" />
          <path d="M27 9 C24 14 22 19 22 24 C22 29 24 34 27 39 C24 37 21 34 19 30 C17 27 15 24 15 24 C15 18 20 12 27 9Z" fill="#C0A840" opacity="0.25" />
          <path d="M31 14 L32.4 18.2 L36.8 18.2 L33.4 20.8 L34.6 25 L31 22.4 L27.4 25 L28.6 20.8 L25.2 18.2 L29.6 18.2Z" fill="#F8E868" opacity="0.85" />
          <circle cx="35" cy="11" r="1" fill="#E8D858" opacity="0.55" />
          <circle cx="29" cy="9" r="0.6" fill="#E8D858" opacity="0.4" />
          <circle cx="37" cy="30" r="0.7" fill="#E8D858" opacity="0.45" />
          <circle cx="33" cy="35" r="0.5" fill="#E8D858" opacity="0.3" />
        </>
      );
    case "borboleta":
      return (
        <>
          <ellipse cx="22" cy="22" rx="8" ry="6" fill="rgba(180,130,220,0.12)" />
          <path d="M22 21 C17 16 8 12 8 19 C8 26 17 24 22 21Z" fill="#A888D8" opacity="0.85" />
          <path d="M22 21 C27 16 36 12 36 19 C36 26 27 24 22 21Z" fill="#C0A0EC" opacity="0.85" />
          <path d="M22 23 C17 27 11 29 12 35 C13 38 20 36 22 23Z" fill="#8868B8" opacity="0.78" />
          <path d="M22 23 C27 27 33 29 32 35 C31 38 24 36 22 23Z" fill="#A880D0" opacity="0.78" />
          <circle cx="16" cy="19" r="2.5" fill="rgba(220,190,255,0.25)" />
          <circle cx="16" cy="19" r="1.2" fill="rgba(220,190,255,0.15)" />
          <circle cx="28" cy="19" r="2.5" fill="rgba(220,190,255,0.25)" />
          <circle cx="28" cy="19" r="1.2" fill="rgba(220,190,255,0.15)" />
          <ellipse cx="22" cy="22" rx="1.3" ry="6.5" fill="#1E0E30" />
          <path d="M21 16.5 Q19 12 17.5 10" stroke="#8060A8" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M23 16.5 Q25 12 26.5 10" stroke="#8060A8" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <circle cx="17.5" cy="10" r="1.2" fill="#B090D8" opacity="0.8" />
          <circle cx="26.5" cy="10" r="1.2" fill="#B090D8" opacity="0.8" />
        </>
      );
    case "novelo":
      return (
        <>
          <circle cx="22" cy="24" r="13" stroke="#E090A8" strokeWidth="0.5" fill="none" opacity="0.2" />
          <circle cx="22" cy="24" r="10" stroke="#D87898" strokeWidth="0.7" fill="none" opacity="0.3" />
          <circle cx="22" cy="24" r="7" stroke="#C86080" strokeWidth="0.8" fill="none" opacity="0.4" />
          <ellipse cx="22" cy="24" rx="9" ry="11" stroke="#D87898" strokeWidth="1.2" fill="rgba(200,100,120,0.10)" />
          <path d="M15 18 Q22 21 29 18" stroke="#E090A8" strokeWidth="0.7" fill="none" opacity="0.55" />
          <path d="M14 24 Q22 26 30 24" stroke="#E090A8" strokeWidth="0.7" fill="none" opacity="0.55" />
          <path d="M15 30 Q22 27 29 30" stroke="#E090A8" strokeWidth="0.7" fill="none" opacity="0.55" />
          <path d="M29 18 Q36 13 37 10" stroke="#F0A8B8" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.8" />
          <line x1="35" y1="11" x2="39" y2="7" stroke="#D8C8B8" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    case "ancora":
      return (
        <>
          <circle cx="22" cy="13" r="4" stroke="#80C0D8" strokeWidth="1.6" fill="none" />
          <line x1="22" y1="17" x2="22" y2="36" stroke="#80C0D8" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="13" y1="19.5" x2="31" y2="19.5" stroke="#80C0D8" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M22 36 Q13 32 11 27" stroke="#80C0D8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M22 36 Q31 32 33 27" stroke="#80C0D8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <circle cx="11" cy="26" r="2" fill="#80C0D8" />
          <circle cx="33" cy="26" r="2" fill="#80C0D8" />
          <path d="M18 10 Q22 8.5 26 10" stroke="rgba(180,230,255,0.4)" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        </>
      );
    case "espelho":
      return (
        <>
          <ellipse cx="22" cy="21" rx="12" ry="14" stroke="#D8C898" strokeWidth="1.6" fill="none" />
          <ellipse cx="22" cy="21" rx="9.5" ry="11.5" stroke="#D8C898" strokeWidth="0.5" fill="rgba(210,190,140,0.07)" opacity="0.6" />
          <path d="M16 9 Q22 7 28 9" stroke="#D8C898" strokeWidth="1" fill="none" opacity="0.5" strokeLinecap="round" />
          <circle cx="22" cy="8" r="1.2" fill="#D8C898" opacity="0.5" />
          <path d="M15 14 Q19 17 23 24" stroke="white" strokeWidth="1" fill="none" opacity="0.18" strokeLinecap="round" />
          <path d="M17 12 Q20 15 21 19" stroke="white" strokeWidth="0.5" fill="none" opacity="0.1" strokeLinecap="round" />
          <rect x="20.5" y="35" width="3" height="7" rx="1.5" fill="#C8B880" />
          <path d="M18 37.5 Q22 39.5 26 37.5" stroke="#C8B880" strokeWidth="0.8" fill="none" opacity="0.4" strokeLinecap="round" />
        </>
      );
    case "tempo":
      return (
        <>
          <rect x="14" y="7" width="16" height="2.5" rx="1.2" fill="#D8B060" />
          <rect x="14" y="35" width="16" height="2.5" rx="1.2" fill="#D8B060" />
          <line x1="14.5" y1="8.5" x2="22" y2="24" stroke="#D8B060" strokeWidth="1.1" opacity="0.75" />
          <line x1="29.5" y1="8.5" x2="22" y2="24" stroke="#D8B060" strokeWidth="1.1" opacity="0.75" />
          <line x1="14.5" y1="36" x2="22" y2="24" stroke="#D8B060" strokeWidth="1.1" opacity="0.75" />
          <line x1="29.5" y1="36" x2="22" y2="24" stroke="#D8B060" strokeWidth="1.1" opacity="0.75" />
          <path d="M16 10 Q22 10 28 10 Q26.5 15 22 22.5 Q17.5 15 16 10Z" fill="#F0D870" opacity="0.2" />
          <path d="M15.5 35.5 Q22 35.5 28.5 35.5 Q26 30 22 24 Q18 30 15.5 35.5Z" fill="#F0D870" opacity="0.65" />
          <line x1="22" y1="23" x2="22" y2="27" stroke="#F0D870" strokeWidth="0.9" opacity="0.6" />
          <circle cx="22" cy="28" r="0.7" fill="#F0D870" opacity="0.45" />
          <circle cx="21.4" cy="30" r="0.5" fill="#F0D870" opacity="0.3" />
        </>
      );
    case "bussola":
      return (
        <>
          <circle cx="22" cy="22" r="14" stroke="#90C090" strokeWidth="1.1" fill="none" />
          <circle cx="22" cy="22" r="11" stroke="#90C090" strokeWidth="0.4" fill="rgba(100,150,100,0.06)" opacity="0.6" />
          <line x1="22" y1="9" x2="22" y2="12" stroke="#90C090" strokeWidth="1" opacity="0.6" />
          <line x1="22" y1="32" x2="22" y2="35" stroke="#90C090" strokeWidth="0.7" opacity="0.4" />
          <line x1="9" y1="22" x2="12" y2="22" stroke="#90C090" strokeWidth="0.7" opacity="0.4" />
          <line x1="32" y1="22" x2="35" y2="22" stroke="#90C090" strokeWidth="0.7" opacity="0.4" />
          <text x="22" y="14" textAnchor="middle" fontSize="5.5" fill="#B8D8B0" fontWeight="500">N</text>
          <path d="M22 22 L19.5 15 L22 18 L24.5 15Z" fill="#D07060" opacity="0.95" />
          <path d="M22 22 L19.5 29 L22 26 L24.5 29Z" fill="#70A868" opacity="0.85" />
          <circle cx="22" cy="22" r="2.2" fill="#90C090" />
          <circle cx="22" cy="22" r="1" fill="#D0EAD0" />
        </>
      );
    case "lacre":
      return (
        <>
          <rect x="9" y="16" width="26" height="18" rx="2.5" fill="#F0E8D8" />
          <path d="M9 18.5 L22 27 L35 18.5" stroke="#D8C8A8" strokeWidth="0.9" fill="none" />
          <path d="M9 34 L18.5 27.5" stroke="#D8C8A8" strokeWidth="0.6" fill="none" opacity="0.5" />
          <path d="M35 34 L25.5 27.5" stroke="#D8C8A8" strokeWidth="0.6" fill="none" opacity="0.5" />
          <circle cx="22" cy="28" r="5" fill="#A02828" opacity="0.95" />
          <circle cx="22" cy="28" r="3.5" fill="#801818" opacity="0.9" />
          <path d="M19.5 25.5 Q21 24.5 23 25.5" stroke="rgba(255,180,160,0.4)" strokeWidth="0.6" fill="none" strokeLinecap="round" />
          <text x="22" y="30" textAnchor="middle" fontSize="4.5" fill="#F0D0C0" fontStyle="italic" fontWeight="300">M</text>
        </>
      );
    case "coracao":
      return (
        <>
          <ellipse cx="22" cy="24" rx="12" ry="10" fill="rgba(180,40,40,0.15)" />
          <path d="M22 36 C22 36 7 27 7 18 C7 12.5 11.5 9 16 9 C19.2 9 21.2 11 22 13.5 C22.8 11 24.8 9 28 9 C32.5 9 37 12.5 37 18 C37 27 22 36 22 36Z" fill="#C84848" opacity="0.9" />
          <path d="M12 12 Q15 10 19 12" stroke="rgba(255,180,180,0.4)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M15 15 Q13 19 15 24" stroke="#903030" strokeWidth="0.7" fill="none" opacity="0.45" strokeLinecap="round" />
          <path d="M29 15 Q31 19 29 24" stroke="#903030" strokeWidth="0.7" fill="none" opacity="0.45" strokeLinecap="round" />
          <path d="M22 17 Q22 24 22 28" stroke="#903030" strokeWidth="0.6" fill="none" opacity="0.35" strokeLinecap="round" />
        </>
      );
    case "chave":
      return (
        <>
          <circle cx="16" cy="17" r="9" fill="rgba(200,160,60,0.1)" />
          <circle cx="16" cy="17" r="8" stroke="#D8B050" strokeWidth="1.6" fill="none" />
          <circle cx="16" cy="17" r="4.5" stroke="#D8B050" strokeWidth="0.8" fill="none" opacity="0.45" />
          <circle cx="16" cy="17" r="1.8" fill="#D8B050" opacity="0.7" />
          <line x1="23" y1="18" x2="37" y2="22.5" stroke="#D8B050" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="28" y1="20" x2="28" y2="24.5" stroke="#D8B050" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="31.5" y1="21" x2="31.5" y2="25.5" stroke="#D8B050" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="35" y1="22" x2="35" y2="26.5" stroke="#D8B050" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M11 12 Q16 10 21 13" stroke="rgba(255,220,120,0.35)" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        </>
      );
    case "mapa":
      return (
        <>
          <path d="M9 14 L17 11 L27 14.5 L35 11 L35 33 L27 36 L17 32.5 L9 36Z" fill="rgba(180,190,140,0.55)" stroke="#9AA870" strokeWidth="0.9" />
          <line x1="22" y1="11.5" x2="22" y2="35.5" stroke="#788848" strokeWidth="0.8" strokeDasharray="1.5 2" opacity="0.5" />
          <path d="M11 21 Q17 23 22 21 Q27 19 33 22" stroke="#6A7840" strokeWidth="0.9" fill="none" opacity="0.65" />
          <path d="M13 27 Q19 25 22 27 Q25 29 31 27" stroke="#6A7840" strokeWidth="0.6" fill="none" opacity="0.45" />
          <path d="M10 17 Q15 19 17 22 Q19 25 17 29" stroke="#6090A8" strokeWidth="0.8" fill="none" opacity="0.5" strokeLinecap="round" />
          <line x1="20" y1="17" x2="24" y2="21" stroke="#C05838" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="24" y1="17" x2="20" y2="21" stroke="#C05838" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="22" cy="19" r="3.5" stroke="#C05838" strokeWidth="0.8" fill="none" opacity="0.55" />
        </>
      );
    default:
      return null;
  }
}

export function AvatarIcon({ avatarId, initials, size = "sm", className, style }: Props) {
  const px = SIZE_MAP[size];
  const avatar = avatarId ? getAvatarById(avatarId) : null;

  if (!avatar) {
    return (
      <div
        className={`rounded-full flex items-center justify-center flex-shrink-0 ${className ?? ""}`}
        style={{ width: px, height: px, backgroundColor: "#AE8F7D", ...style }}
      >
        <span
          className="font-sans text-[#FAF8F3] select-none"
          style={{ fontSize: Math.max(7, Math.round(px * 0.35)) }}
        >
          {initials ?? ""}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-full flex-shrink-0 ${className ?? ""}`}
      style={{
        width: px,
        height: px,
        background: avatar.bg,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "6px 6px",
          pointerEvents: "none",
        }}
      />
      <svg
        viewBox="0 0 44 44"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "115%",
          height: "115%",
          zIndex: 2,
        }}
      >
        <AvatarSvg id={avatar.id} />
      </svg>
    </div>
  );
}
