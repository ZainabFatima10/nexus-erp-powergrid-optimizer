import { useState, useEffect, useCallback } from "react";
import { Loader2, Bell, RefreshCw, CheckCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications, markNotificationRead, getPendingContracts,
  approveContract, rejectContract, Notification,
} from "@/services/api";
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
  "Critical Stock": "bg-destructive/10 text-destructive border-destructive/30",
  "Contract Signed": "bg-success/10 text-success border-success/30",
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

const formatPKR = (n: number) =>
  `PKR ${Number(n || 0).toLocaleString("en-US")}`;

type TabKey = "all" | "unread" | "approvals";

interface PendingContract {
  id: string;
  order_id: string;
  item_name: string;
  vendor: string;
  quantity: number;
  unit: string;
  total_value: number;
}

const Notifications = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<Notification[]>([]);
  const [approvals, setApprovals] = useState<PendingContract[]>([]);
  const [tab, setTab] = useState<TabKey>("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await getNotifications(tab === "unread");
      setItems(res.notifications);
    } catch (e) {
      toast({ title: "Failed to load notifications", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [tab, toast]);

  const loadApprovals = useCallback(async () => {
    const fromApi = await getPendingContracts();
    if (fromApi.contracts && fromApi.contracts.length > 0) {
      setApprovals(fromApi.contracts);
      return;
    }
    // Fallback: derive from notifications with type contract_approval
    const derived = items
      .filter((n) => (n.type || "").toLowerCase() === "contract_approval")
      .map((n) => ({
        id: String(n.order_id || n.id),
        order_id: String(n.order_id || ""),
        item_name: n.item_name || "—",
        vendor: "—",
        quantity: 0,
        unit: "",
        total_value: 0,
      }));
    setApprovals(derived);
  }, [items]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);
  useEffect(() => { if (tab === "approvals") loadApprovals(); }, [tab, loadApprovals]);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      toast({ title: "Failed to mark as read", variant: "destructive" });
    }
  };

  const handleNotificationClick = (n: Notification) => {
    const isContract = n.category === "Contract Signed" || /contract/i.test(n.type || "");
    if (isContract && n.order_id) {
      navigate(`/procurement?contract=${encodeURIComponent(n.order_id)}`);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveContract(id);
      toast({ title: "Contract approved and signed to ledger." });
      setApprovals((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      toast({ title: "Approval failed", description: String(e), variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectContract(id);
      toast({ title: "Contract rejected." });
      setApprovals((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      toast({ title: "Reject failed", description: String(e), variant: "destructive" });
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
          onClick={() => { load(); if (tab === "approvals") loadApprovals(); }}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted/30 transition-colors"
          style={{ borderRadius: 20 }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Toggle */}
      <div className="flex gap-1 bg-muted/30 p-1 w-fit flex-wrap" style={{ borderRadius: 20 }}>
        {(["all", "unread", "approvals"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setTab(f)}
            style={{ borderRadius: 20 }}
            className={`px-4 py-1.5 text-xs font-medium transition-all ${
              tab === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : f === "unread" ? "Unread Only" : "Contract Approvals"}
          </button>
        ))}
      </div>

      {tab === "approvals" ? (
        <div className="space-y-2">
          {approvals.length === 0 ? (
            <div className="glass-card p-10 text-center text-muted-foreground" style={{ borderRadius: 20 }}>
              <Bell size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No contracts pending approval.</p>
            </div>
          ) : (
            approvals.map((a) => (
              <div key={a.id} className="glass-card p-4" style={{ borderRadius: 20 }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-bold text-primary truncate">{a.id}</p>
                    <h3 className="text-sm font-bold mt-1">{a.vendor}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {a.item_name}{a.quantity ? ` — ${a.quantity.toLocaleString()} ${a.unit}` : ""}
                    </p>
                    <p className="text-xs font-semibold mt-1">{formatPKR(a.total_value)}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(a.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium btn-navy"
                      style={{ borderRadius: 20 }}
                    >
                      <CheckCircle2 size={12} /> Approve Contract
                    </button>
                    <button
                      onClick={() => handleReject(a.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors"
                      style={{ borderRadius: 20 }}
                    >
                      <X size={12} /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {items.length === 0 && (
            <div className="glass-card p-10 text-center text-muted-foreground" style={{ borderRadius: 20 }}>
              <Bell size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notifications.</p>
            </div>
          )}
          {items.map((n) => {
            const isContract = n.category === "Contract Signed" || /contract/i.test(n.type || "");
            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`glass-card p-4 transition-all ${n.is_read ? "bg-muted/10 opacity-80" : ""} ${isContract ? "cursor-pointer hover:bg-muted/20" : ""}`}
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
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border hover:bg-muted/30 transition-colors"
                      style={{ borderRadius: 20 }}
                    >
                      <CheckCircle2 size={12} /> Mark as Read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
