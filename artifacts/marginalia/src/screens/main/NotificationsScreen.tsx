import { ArrowLeft, Bell, BookOpen, MessageCircle, Heart, Users, Sparkles, Flame, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useApp } from "@/context/AppContext";
import { timeAgo } from "@/utils/formatting";

const TYPE_ICONS: Record<string, React.ElementType> = {
  reaction: Heart,
  comment: MessageCircle,
  echo_unlocked: BookOpen,
  debate: MessageCircle,
  follow: Users,
  NEW_THEORY_ON_YOUR_BOOK: Sparkles,
  MILESTONE_REACTIONS: Heart,
  COMPATIBLE_READER_POSTED: Users,
  BOOK_GETTING_HOT: TrendingUp,
  STREAK_AT_RISK: Flame,
};

const TYPE_ACCENT: Record<string, string> = {
  reaction:                "#AE8F7D",
  comment:                 "#697962",
  echo_unlocked:           "#AE8F7D",
  debate:                  "#697962",
  follow:                  "#AE8F7D",
  NEW_THEORY_ON_YOUR_BOOK: "#AE8F7D",
  MILESTONE_REACTIONS:     "#AE8F7D",
  COMPATIBLE_READER_POSTED:"#697962",
  BOOK_GETTING_HOT:        "#697962",
  STREAK_AT_RISK:          "#C8836A",
};

export function NotificationsScreen() {
  const { notifications, markNotificationRead } = useApp();

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      className="min-h-full overflow-x-hidden screen-enter"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 pt-8 pb-4"
        style={{ borderBottom: "1px solid rgba(174,143,125,0.10)" }}
      >
        <Link href="/">
          <button style={{ color: "var(--text-tertiary)" }} className="hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1
          className="font-serif italic text-[22px]"
          style={{ color: "var(--text-primary)" }}
        >
          Notificações
        </h1>
        {unreadCount > 0 && (
          <span
            className="ml-auto font-sans text-[9px] font-light tracking-[0.12em] uppercase"
            style={{ color: "#AE8F7D" }}
          >
            {unreadCount} {unreadCount === 1 ? "nova" : "novas"}
          </span>
        )}
      </div>

      <div className="px-5 pb-8 pt-4">
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--text-soft)", opacity: 0.4 }} />
            <p className="font-serif italic text-[14px]" style={{ color: "var(--text-tertiary)" }}>
              Nenhuma notificação ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((notif) => {
              const Icon = TYPE_ICONS[notif.type] || Bell;
              const accent = TYPE_ACCENT[notif.type] || "#AE8F7D";
              const isUnread = !notif.isRead;

              return (
                <button
                  key={notif.id}
                  data-testid={`notification-${notif.id}`}
                  onClick={() => markNotificationRead(notif.id)}
                  className="w-full flex items-start gap-3 p-4 rounded-[12px] text-left transition-all active:opacity-80"
                  style={{
                    backgroundColor: isUnread
                      ? "color-mix(in srgb, var(--background) 85%, #AE8F7D 15%)"
                      : "var(--muted)",
                    border: isUnread
                      ? `1px solid rgba(174,143,125,0.30)`
                      : `1px solid rgba(174,143,125,0.12)`,
                  }}
                >
                  {/* Icon bubble */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: isUnread
                        ? `${accent}22`
                        : "color-mix(in srgb, var(--background) 60%, var(--muted) 40%)",
                    }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: isUnread ? accent : "var(--text-tertiary)" }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-sans font-light text-[12.5px] leading-[1.6]"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {notif.body}
                    </p>
                    <p
                      className="font-sans font-light text-[10px] mt-1"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {isUnread && (
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: accent }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
