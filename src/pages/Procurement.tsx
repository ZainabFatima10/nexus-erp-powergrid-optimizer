import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Loader2, RefreshCw, ClipboardList, ShieldCheck, Truck, CheckCircle2,
} from "lucide-react";
import {
  getCurrentOrders, approveContract, procurementCheckin, Order,
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const STAGES = [
  "Created",
  "Advance Paid",
  "Signed",
  "Delivered",
  "Final Payment Released",
] as const;

// Map a backend `stage` value to an index in STAGES.
function stageIndex(stage: string): number {
  // Pending Verification == before any progress (Created)
  if (stage === "Pending Verification") return 0;
  const i = STAGES.indexOf(stage as typeof STAGES[number]);
  return i === -1 ? 0 : i;
}

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    "Pending Verification": "bg-blue-500/10 text-blue-600 border-blue-500/30",
    "Signed": "bg-success/10 text-success border-success/30",
    "Executed": "bg-warning/10 text-warning border-warning/30",
    "Delivered": "bg-teal-500/10 text-teal-600 border-teal-500/30",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 font-semibold border ${map[status] || "bg-muted text-muted-foreground border-border"}`}
      style={{ borderRadius: 20 }}
    >
      {status}
    </span>
  );
};

const StageTracker = ({ stage }: { stage: string }) => {
  const idx = stageIndex(stage);
  return (
    <div className="flex items-center justify-between mt-3">
      {STAGES.map((s, i) => (
        <div key={s} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full border ${
                i <= idx ? "bg-primary border-primary" : "bg-transparent border-muted/50"
              }`}
            />
            <span className={`text-[9px] mt-1 text-center whitespace-nowrap ${i === idx ? "text-primary font-semibold" : "text-muted-foreground"}`}>
              {s.split(" ")[0]}
            </span>
          </div>
          {i < STAGES.length - 1 && (
            <div className={`h-px flex-1 mx-1 mb-4 ${i < idx ? "bg-primary" : "bg-muted/30"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const Procurement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getCurrentOrders();
      setOrders(res.orders || []);
    } catch (e) {
      toast({ title: "Failed to load contracts", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleSign = async (orderId: string) => {
    try {
      await approveContract(orderId);
      toast({ title: "Contract approved and signed to ledger." });
      load();
    } catch (e) {
      toast({ title: "Sign failed", description: String(e), variant: "destructive" });
    }
  };

  const handleCheckin = async (orderId: string) => {
    try {
      await procurementCheckin(orderId);
      toast({ title: "Delivery verified." });
      load();
    } catch (e) {
      toast({ title: "Verification failed", description: String(e), variant: "destructive" });
    }
  };

  // Highlight contract from notification deep-link
  const highlightedId = new URLSearchParams(location.search).get("contract") || "";

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
          <h1 className="text-2xl font-heading font-bold">Procurement</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Active smart contracts and procurement lifecycle.
          </p>
        </div>
        <button
          onClick={() => { setRefreshing(true); load(); }}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-border hover:bg-muted/30 transition-colors"
          style={{ borderRadius: 20 }}
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card p-10 text-center text-muted-foreground" style={{ borderRadius: 20 }}>
          <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No active contracts</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((o) => {
            const verified = !!o.execution_hash && o.execution_hash.length > 0;
            const isHighlighted = o.order_id === highlightedId;
            return (
              <div
                key={o.order_id}
                className={`glass-card p-5 ${isHighlighted ? "glow-cyan" : ""}`}
                style={{ borderRadius: 20 }}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono text-primary truncate">{o.order_id}</p>
                    <h3 className="font-heading font-bold text-sm mt-1 truncate">{o.item_name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{o.vendor}</p>
                    <p className="text-xs mt-1">
                      <span className="font-mono">{o.quantity?.toLocaleString()}</span>{" "}
                      <span className="text-muted-foreground">{o.unit}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge status={o.status || o.stage} />
                    {verified && (
                      <span
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 font-semibold bg-success/10 text-success border border-success/30"
                        style={{ borderRadius: 20 }}
                      >
                        <CheckCircle2 size={10} /> Verified on Ledger
                      </span>
                    )}
                  </div>
                </div>

                <StageTracker stage={o.stage} />

                <div className="mt-4 flex justify-end">
                  {o.stage === "Pending Verification" && (
                    <button
                      onClick={() => handleSign(o.order_id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium btn-navy"
                      style={{ borderRadius: 20 }}
                    >
                      <ShieldCheck size={12} /> Sign Contract
                    </button>
                  )}
                  {o.stage === "Signed" && (
                    <button
                      onClick={() => handleCheckin(o.order_id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium btn-navy"
                      style={{ borderRadius: 20 }}
                    >
                      <Truck size={12} /> Verify Delivery
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

export default Procurement;
