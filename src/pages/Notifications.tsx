import { useState, useEffect, useCallback } from "react";
import { Loader2, Bell, RefreshCw, CheckCircle2 } from "lucide-react";
import { getNotifications, markNotificationRead, Notification } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const TYPE_COLORS: Record<string, string> = {
  REORDER_REQUEST: "bg-warning/10 text-warning border-warning/30",
  ORDER_CONFIRMED: "bg-success/10 text-success border-success/30",
  EMAIL_SENT: "bg-primary/10 text-primary border-primary/30",
  CONTRACT_VERIFIED: "bg-purple-500/10 text-purple-500 border-purple-500/30",
};

const CATEGORY_COLORS: Record<string, string> = {
  Generation: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  Infrastructure: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  Operational: "bg-green-500/10 text-green-600 border-green-500/30",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min${m > 1 ? "s" : ""} ago`;
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  return `${d} day${d > 1 ? "s" : ""} ago`;
}

const Notifications = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await getNotifications(filter === "unread");
      setItems(res.notifications);
    } catch (e) {
      toast({ title: "Failed to load notifications", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      toast({ title: "Failed to mark as read", variant: "destructive" });
    }
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-semibold">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">Live alerts from the procurement engine.</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted/30 transition-colors"
          style={{ borderRadius: 20 }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Toggle */}
      <div className="flex gap-1 bg-muted/30 p-1 w-fit" style={{ borderRadius: 20 }}>
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ borderRadius: 20 }}
            className={`px-4 py-1.5 text-xs font-medium transition-all ${
              filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : "Unread Only"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {items.length === 0 && (
          <div className="glass-card p-10 text-center text-muted-foreground">
            <Bell size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notifications.</p>
          </div>
        )}
        {items.map((n) => (
          <div
            key={n.id}
            className={`glass-card p-4 transition-all ${n.is_read ? "bg-muted/10 opacity-80" : ""}`}
            style={{ borderRadius: 20 }}
          >
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${TYPE_COLORS[n.type] || "bg-muted text-muted-foreground border-border"}`}>
                    {n.type}
                  </span>
                  {n.category && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${CATEGORY_COLORS[n.category] || "bg-muted text-muted-foreground border-border"}`}>
                      {n.category}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">{timeAgo(n.created_at)}</span>
                </div>
                <h3 className="text-sm font-bold">{n.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border hover:bg-muted/30 transition-colors"
                  style={{ borderRadius: 20 }}
                >
                  <CheckCircle2 size={12} /> Mark as Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
