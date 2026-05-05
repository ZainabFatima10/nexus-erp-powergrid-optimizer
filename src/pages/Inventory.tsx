import { useState, useEffect, useCallback } from "react";
import {
  RefreshCw, Loader2, Plus, X, Info,
  Package, CheckCircle2, AlertTriangle, XCircle,
  TruckIcon, History, FileCheck, Send,
} from "lucide-react";
import {
  getInventoryOverview, getCurrentOrders, getPastOrders,
  triggerInventoryCheck, acceptOrder, manualReorder,
  InventoryItem, Order,
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";

type CategoryTab = "All" | "Generation" | "Infrastructure" | "Operational";
type SubTab = "overview" | "orders" | "history" | "reorders";

const CategoryBadge = ({ category }: { category: string }) => {
  const styles: Record<string, string> = {
    Generation: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
    Infrastructure: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    Operational: "bg-green-500/10 text-green-600 border-green-500/30",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 font-semibold border ${styles[category] || "bg-muted text-muted-foreground border-border"}`}
      style={{ borderRadius: 20 }}
    >
      {category}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "Critical") {
    return (
      <span
        className="text-[10px] px-2 py-0.5 font-semibold bg-destructive/10 text-destructive border border-destructive/30 animate-pulse"
        style={{ borderRadius: 20 }}
      >
        Critical
      </span>
    );
  }
  const styles: Record<string, string> = {
    OK: "bg-success/10 text-success border-success/30",
    Low: "bg-warning/10 text-warning border-warning/30",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 font-semibold border ${styles[status] || "bg-muted text-muted-foreground border-border"}`}
      style={{ borderRadius: 20 }}
    >
      {status}
    </span>
  );
};

const TriggerBadge = ({ type }: { type: string }) => {
  const styles: Record<string, string> = {
    "VEMA-Triggered": "bg-destructive/10 text-destructive border-destructive/30",
    "Auto-Generated": "bg-warning/10 text-warning border-warning/30",
    Manual: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 font-semibold border ${styles[type] || "bg-muted text-muted-foreground border-border"}`}
      style={{ borderRadius: 20 }}
    >
      {type}
    </span>
  );
};

const StageBadge = ({ stage }: { stage: string }) => {
  const styles: Record<string, string> = {
    "Pending Verification": "bg-muted text-muted-foreground border-border",
    "Order Placed": "bg-blue-500/10 text-blue-600 border-blue-500/30",
    "Email Sent": "bg-success/10 text-success border-success/30",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 font-semibold border ${styles[stage] || "bg-muted text-muted-foreground border-border"}`}
      style={{ borderRadius: 20 }}
    >
      {stage}
    </span>
  );
};

const Inventory = () => {
  const { toast } = useToast();
  const [category, setCategory] = useState<CategoryTab>("All");
  const [tab, setTab] = useState<SubTab>("overview");

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState({ total_items: 0, ok: 0, low: 0, critical: 0 });
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showManualModal, setShowManualModal] = useState(false);
  const [manualItem, setManualItem] = useState("");
  const [manualQty, setManualQty] = useState(100);
  const [placing, setPlacing] = useState(false);

  const catParam = category === "All" ? undefined : category;

  const load = useCallback(async () => {
    try {
      const [inv, cur, past] = await Promise.all([
        getInventoryOverview(catParam),
        getCurrentOrders(catParam),
        getPastOrders(catParam),
      ]);
      setItems(inv.items);
      setSummary(inv.summary);
      setCurrentOrders(cur.orders);
      setPastOrders(past.orders);
    } catch (e) {
      toast({ title: "Failed to load inventory", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [catParam, toast]);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => { setRefreshing(true); load(); };

  const handleInventoryCheck = async () => {
    setRefreshing(true);
    try {
      const res = await triggerInventoryCheck();
      const n = res.order_ids?.length ?? 0;
      toast({ title: `${n} new order${n === 1 ? "" : "s"} generated` });
      await load();
    } catch (e) {
      toast({ title: "Check failed", description: String(e), variant: "destructive" });
      setRefreshing(false);
    }
  };

  const handleAccept = async (orderId: string) => {
    try {
      await acceptOrder(orderId, "Procurement Officer");
      toast({ title: "Order accepted — Smart contract verified — Vendor email sent" });
      await load();
    } catch (e) {
      toast({ title: "Accept failed", description: String(e), variant: "destructive" });
    }
  };

  const handleManualReorder = async () => {
    if (!manualItem) return;
    setPlacing(true);
    try {
      await manualReorder(manualItem, manualQty);
      toast({ title: "Manual reorder placed" });
      setShowManualModal(false);
      await load();
    } catch (e) {
      toast({ title: "Failed", description: String(e), variant: "destructive" });
    } finally { setPlacing(false); }
  };

  const categoryTabs: CategoryTab[] = ["All", "Generation", "Infrastructure", "Operational"];
  const subTabs: { key: SubTab; label: string; icon: typeof Package }[] = [
    { key: "overview", label: "Overview", icon: Package },
    { key: "orders", label: "Current Orders", icon: TruckIcon },
    { key: "history", label: "Past History", icon: History },
    { key: "reorders", label: "Reorders", icon: FileCheck },
  ];

  const lowOrCritical = items.filter((i) => i.status === "Low" || i.status === "Critical");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Inventory Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time stock, procurement orders, and reorder triggers.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border hover:bg-muted/30 transition-colors"
            style={{ borderRadius: 20 }}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={handleInventoryCheck}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium btn-navy"
            style={{ borderRadius: 20 }}
          >
            <RefreshCw size={14} /> Run Inventory Check
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: summary.total_items, icon: Package, color: "text-primary" },
          { label: "OK", value: summary.ok, icon: CheckCircle2, color: "text-success" },
          { label: "Low", value: summary.low, icon: AlertTriangle, color: "text-warning" },
          { label: "Critical", value: summary.critical, icon: XCircle, color: "text-destructive" },
        ].map((k) => (
          <div key={k.label} className="glass-card p-4 glow-cyan-hover" style={{ borderRadius: 20 }}>
            <div className="flex items-center gap-2 mb-2">
              <k.icon size={18} className={k.color} />
              <span className="text-xs text-muted-foreground">{k.label}</span>
            </div>
            <p className="text-2xl font-heading font-bold">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 bg-muted/30 p-1 w-fit flex-wrap" style={{ borderRadius: 20 }}>
        {categoryTabs.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{ borderRadius: 20 }}
            className={`px-4 py-1.5 text-xs font-medium transition-all ${
              category === c ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Sub tabs */}
      <div className="flex gap-1 bg-muted/30 p-1 w-fit flex-wrap" style={{ borderRadius: 20 }}>
        {subTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{ borderRadius: 20 }}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all ${
              tab === t.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="glass-card overflow-hidden" style={{ borderRadius: 20 }}>
          <table className="w-full">
            <thead className="bg-muted/20">
              <tr>
                {["Item ID", "Item Name", "Category", "Current Stock", "Min Threshold", "Status", "Days to Reorder", "Vendor"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {items.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">No items.</td></tr>
              )}
              {items.map((i) => (
                <tr key={i.item_id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-primary">{i.item_id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{i.name}</td>
                  <td className="px-4 py-3"><CategoryBadge category={i.category} /></td>
                  <td className="px-4 py-3 text-sm font-mono">{i.current_stock?.toLocaleString()} {i.unit}</td>
                  <td className="px-4 py-3 text-sm">{i.min_threshold?.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3 text-sm text-center">
                    {i.days_until_reorder === 0
                      ? <span className="text-destructive font-semibold">Now</span>
                      : i.days_until_reorder}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{i.vendor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CURRENT ORDERS */}
      {tab === "orders" && (
        <div className="glass-card overflow-hidden" style={{ borderRadius: 20 }}>
          <table className="w-full">
            <thead className="bg-muted/20">
              <tr>
                {["Order ID", "Item", "Category", "Qty", "Vendor", "Trigger Type", "Stage", "Contract", "Expected Delivery", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {currentOrders.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">No active orders.</td></tr>
              )}
              {currentOrders.map((o) => (
                <tr key={o.order_id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-primary">{o.order_id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{o.item_name}</td>
                  <td className="px-4 py-3"><CategoryBadge category={o.category} /></td>
                  <td className="px-4 py-3 text-sm">{o.quantity?.toLocaleString()} {o.unit}</td>
                  <td className="px-4 py-3 text-sm">{o.vendor}</td>
                  <td className="px-4 py-3"><TriggerBadge type={o.trigger_type} /></td>
                  <td className="px-4 py-3"><StageBadge stage={o.stage} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{o.contract_status}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{o.expected_delivery}</td>
                  <td className="px-4 py-3">
                    {o.stage === "Pending Verification" && (
                      <button
                        onClick={() => handleAccept(o.order_id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium btn-navy"
                        style={{ borderRadius: 20 }}
                      >
                        <Send size={12} /> Accept &amp; Send
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAST HISTORY */}
      {tab === "history" && (
        <div className="glass-card overflow-hidden" style={{ borderRadius: 20 }}>
          <table className="w-full">
            <thead className="bg-muted/20">
              <tr>
                {["Order ID", "Item", "Category", "Qty", "Vendor", "Accepted By", "Stage", "Expected Delivery"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {pastOrders.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">No past orders.</td></tr>
              )}
              {pastOrders.map((o) => (
                <tr key={o.order_id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-primary">{o.order_id}</td>
                  <td className="px-4 py-3 text-sm font-medium">{o.item_name}</td>
                  <td className="px-4 py-3"><CategoryBadge category={o.category} /></td>
                  <td className="px-4 py-3 text-sm">{o.quantity?.toLocaleString()} {o.unit}</td>
                  <td className="px-4 py-3 text-sm">{o.vendor}</td>
                  <td className="px-4 py-3 text-sm">{o.accepted_by ?? "—"}</td>
                  <td className="px-4 py-3"><StageBadge stage={o.stage} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{o.expected_delivery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REORDERS */}
      {tab === "reorders" && (
        <>
          <div className="flex items-start gap-2 glass-card p-3 border-accent-cyan" style={{ borderRadius: 20 }}>
            <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Items below threshold flagged for reorder. Critical items auto-trigger VEMA reorders.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium btn-navy"
              style={{ borderRadius: 20 }}
            >
              <Plus size={16} /> Manual Reorder
            </button>
          </div>
          <div className="glass-card overflow-hidden" style={{ borderRadius: 20 }}>
            <table className="w-full">
              <thead className="bg-muted/20">
                <tr>
                  {["Item", "Category", "Current Stock", "Min Threshold", "Critical At (20%)", "Status", "Trigger Type"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {lowOrCritical.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">All inventory levels are healthy.</td></tr>
                )}
                {lowOrCritical.map((i) => (
                  <tr key={i.item_id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{i.name}</td>
                    <td className="px-4 py-3"><CategoryBadge category={i.category} /></td>
                    <td className="px-4 py-3 text-sm text-destructive font-semibold">{i.current_stock?.toLocaleString()} {i.unit}</td>
                    <td className="px-4 py-3 text-sm">{i.min_threshold?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{i.critical_threshold?.toLocaleString() ?? Math.round((i.min_threshold || 0) * 0.2)}</td>
                    <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                    <td className="px-4 py-3">
                      <TriggerBadge type={i.status === "Critical" ? "VEMA-Triggered" : "Auto-Generated"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MANUAL REORDER MODAL */}
      {showManualModal && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowManualModal(false)}
        >
          <div
            className="glass-card p-6 w-full max-w-md mx-4 glow-cyan animate-slide-up"
            style={{ borderRadius: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg">Manual Reorder</h3>
              <button onClick={() => setShowManualModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Select Item</label>
                <select
                  value={manualItem}
                  onChange={(e) => {
                    const id = e.target.value;
                    setManualItem(id);
                    const picked = items.find((i) => i.item_id === id);
                    if (picked) setManualQty(picked.reorder_quantity || 100);
                  }}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  style={{ borderRadius: 20 }}
                >
                  <option value="">— Select an item —</option>
                  {items.map((i) => (
                    <option key={i.item_id} value={i.item_id}>
                      {i.name} (Stock: {i.current_stock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Quantity</label>
                <input
                  type="number"
                  value={manualQty}
                  onChange={(e) => setManualQty(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  style={{ borderRadius: 20 }}
                />
              </div>
              <button
                onClick={handleManualReorder}
                disabled={!manualItem || placing}
                className="w-full py-2.5 font-semibold btn-navy disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ borderRadius: 20 }}
              >
                {placing && <Loader2 size={16} className="animate-spin" />}
                Confirm Reorder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
