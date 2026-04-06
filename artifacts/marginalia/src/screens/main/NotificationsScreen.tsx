import { ArrowLeft, Bell, BookOpen, MessageCircle, Heart, Users } from "lucide-react";
import { Link } from "wouter";
import { useApp } from "@/context/AppContext";
import { timeAgo } from "@/utils/formatting";

const TYPE_ICONS = {
  reaction: Heart,
  comment: MessageCircle,
  echo_unlocked: BookOpen,
  debate: MessageCircle,
  follow: Users,
};

const TYPE_COLORS = {
  reaction: "text-[#AE8F7D]",
  comment: "text-[#697962]",
  echo_unlocked: "text-[#454545]",
  debate: "text-[#697962]",
  follow: "text-[#AE8F7D]",
};

export function NotificationsScreen() {
  const { notifications, markNotificationRead } = useApp();

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-full bg-[#FAF8F3] overflow-x-hidden">
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <Link href="/">
          <button className="text-[#454545]/40">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="font-serif italic text-[22px] text-[#454545]">Notificações</h1>
        <span className="ml-auto font-sans text-[9px] font-light tracking-[0.1em] uppercase text-[#AE8F7D]">
          {notifications.filter((n) => !n.isRead).length} novas
        </span>
      </div>

      <div className="px-5 pb-8">
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-8 h-8 text-[#454545]/15 mx-auto mb-3" />
            <p className="font-serif italic text-[14px] text-[#454545]/35">
              Nenhuma notificação ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((notif) => {
              const Icon = TYPE_ICONS[notif.type] || Bell;
              const color = TYPE_COLORS[notif.type] || "text-[#454545]/40";
              return (
                <button
                  key={notif.id}
                  data-testid={`notification-${notif.id}`}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`w-full flex items-start gap-3 p-4 rounded-[12px] border transition-all text-left ${
                    !notif.isRead
                      ? "border-[#AE8F7D]/20 bg-[#AE8F7D]/3"
                      : "border-[#454545]/6 bg-[#FAF8F3]"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      !notif.isRead ? "bg-[#AE8F7D]/10" : "bg-[#EBE6DB]"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-light text-[12px] text-[#454545]/75 leading-relaxed">
                      {notif.body}
                    </p>
                    <p className="font-sans font-light text-[9px] text-[#454545]/30 mt-1">
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-[#AE8F7D] mt-1.5 flex-shrink-0" />
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
