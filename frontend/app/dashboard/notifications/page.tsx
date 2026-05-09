"use client";
import { useNotifications, useMarkNotifRead, useMarkAllRead } from "@/lib/hooks";
import { useToast } from "@/components/ui/Toast";
import { timeAgo } from "@/lib/utils";

const iconMap: Record<string, string> = {
  match:   "auto_awesome",
  claim:   "check_circle",
  alert:   "notifications_active",
  system:  "memory",
  default: "info",
};

const colorMap: Record<string, string> = {
  match:   "text-[#a5e7ff] bg-[#a5e7ff]/10 border-[#a5e7ff]/20",
  claim:   "text-[#edb1ff] bg-[#edb1ff]/10 border-[#edb1ff]/20",
  alert:   "text-[#ffd700] bg-[#ffd700]/10 border-[#ffd700]/20",
  system:  "text-[#bbc9cf] bg-white/5  border-white/10",
  default: "text-[#bbc9cf] bg-white/5  border-white/10",
};

export default function NotificationsPage() {
  const { data: notifs, isLoading } = useNotifications();
  const markOne = useMarkNotifRead();
  const markAll = useMarkAllRead();
  const { success } = useToast();

  const unread = (notifs ?? []).filter((n: any) => !n.is_read).length;

  const handleMarkAll = async () => {
    await markAll.mutateAsync();
    success("All caught up", "All notifications marked as read.");
  };

  return (
    <div className="p-8 lg:p-12 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tighter mb-1">Notifications</h1>
          <p className="text-[#bbc9cf] text-sm">
            {unread > 0 ? (
              <><span className="text-[#a5e7ff] font-semibold">{unread} unread</span> — click to mark as read.</>
            ) : (
              "All caught up — no unread messages."
            )}
          </p>
        </div>
        <button
          onClick={handleMarkAll}
          disabled={markAll.isPending || unread === 0}
          className="btn-ghost px-4 py-2 text-sm shrink-0 disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-base">done_all</span>
          Mark all read
        </button>
      </div>

      {/* Notification cards */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white/5 rounded-2xl h-20" />
          ))}
        </div>
      ) : (notifs ?? []).length === 0 ? (
        <div className="text-center py-24 text-[#859399]">
          <span className="material-symbols-outlined text-7xl block mb-4 opacity-20">notifications_off</span>
          <p className="text-lg font-semibold mb-1">No notifications yet</p>
          <p className="text-sm">Match alerts and claim updates will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {(notifs ?? []).map((n: any, idx: number) => {
            const iconColor = colorMap[n.type] || colorMap.default;
            return (
              <div
                key={n.id}
                onClick={() => { if (!n.is_read) markOne.mutate(n.id); }}
                className={`relative glass-panel rounded-2xl p-4 flex items-start gap-4 cursor-pointer transition-all duration-300 animate-fade-in-up border ${
                  !n.is_read
                    ? "border-[#a5e7ff]/25 bg-[#a5e7ff]/[0.03] hover:border-[#a5e7ff]/40"
                    : "border-white/5 opacity-55 hover:opacity-70"
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Unread dot */}
                {!n.is_read && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#a5e7ff] shadow-[0_0_8px_rgba(165,231,255,0.8)] animate-pulse" />
                )}

                <div className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${iconColor}`}>
                  <span className="material-symbols-outlined icon-fill text-lg">
                    {iconMap[n.type] || iconMap.default}
                  </span>
                </div>

                <div className="flex-1 min-w-0 pr-6">
                  <p className={`font-semibold text-sm mb-0.5 ${!n.is_read ? "text-white" : "text-[#bbc9cf]"}`}>
                    {n.title}
                  </p>
                  <p className="text-[#859399] text-xs leading-relaxed">{n.body}</p>
                  <p className="text-[#3c494e] text-[10px] mt-1.5 font-semibold">
                    {n.created_at ? timeAgo(n.created_at) : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
