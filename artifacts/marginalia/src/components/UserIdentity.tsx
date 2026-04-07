import React from "react";
import { useLocation } from "wouter";
import { AvatarIcon } from "./AvatarIcon";

interface Props {
  name: string;
  username?: string | null;
  initials: string;
  avatarColor: string;
  avatarId?: string | null;
  userId?: string | null;
  onNavigate?: (e: React.MouseEvent) => void;
  timestamp?: string | null;
  size?: "sm" | "md";
  className?: string;
}

export function UserIdentity({
  name,
  username,
  initials,
  avatarColor,
  avatarId,
  userId,
  onNavigate,
  timestamp,
  size = "sm",
  className,
}: Props) {
  const [, navigate] = useLocation();

  const isClickable = !!(userId || onNavigate || (username && username.replace(/^@/, "")));

  const avatarSize = size === "md" ? "md" : "sm";
  const initFSize  = size === "md" ? "text-[9px]" : "text-[7px]";
  const nameFSize  = size === "md" ? "text-[11px]" : "text-[10px]";
  const userFSize  = size === "md" ? "text-[10px]" : "text-[9px]";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate(e);
      return;
    }
    if (username) {
      const clean = username.replace(/^@/, "");
      if (clean) { navigate(`/perfil/${clean}`); return; }
    }
    if (userId) {
      navigate(`/user/${userId}`);
    }
  };

  const avatarEl = avatarId ? (
    <AvatarIcon avatarId={avatarId} initials={initials} size={avatarSize} />
  ) : (
    <div
      className={`${size === "md" ? "w-7 h-7" : "w-5 h-5"} rounded-full flex items-center justify-center flex-shrink-0`}
      style={{ backgroundColor: avatarColor }}
    >
      <span className={`font-sans ${initFSize} text-[#FAF8F3]`}>{initials}</span>
    </div>
  );

  const inner = (
    <div className={`flex items-center gap-2 min-w-0 ${className ?? ""}`}>
      {avatarEl}
      <div className="flex items-center gap-1 min-w-0">
        <span className={`font-sans font-medium ${nameFSize} text-[#2A2A2A] truncate`}>{name}</span>
        {username && (
          <>
            <span className="font-sans font-light text-[8px] text-[#2A2A2A]/20 flex-shrink-0">·</span>
            <span className={`font-sans font-light ${userFSize} text-[#8A8178] flex-shrink-0`}>{username}</span>
          </>
        )}
        {timestamp && (
          <span className="font-sans font-light text-[8px] text-[#454545]/25 flex-shrink-0 ml-0.5">· {timestamp}</span>
        )}
      </div>
    </div>
  );

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`text-left ${isClickable ? "hover:opacity-70 active:opacity-50 transition-opacity" : ""}`}
      >
        {inner}
      </button>
    );
  }

  return inner;
}
