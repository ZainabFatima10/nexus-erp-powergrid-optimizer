import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Loader2, RefreshCw, ClipboardList, ShieldCheck, Truck, ChevronDown, ChevronUp, Link2,
} from "lucide-react";
import {
  fetchOrders, signContractById, executeContract, ProcurementOrderListItem,
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import SmartContractEditor from "@/components/SmartContractEditor";

const fmtPKR = (n: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(
    isFinite(n) ? n : 0,
  );

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Pending: "bg-warning/10 text-warning border-warning/30",
    Signed: "bg-success/10 text-success border-success/30",
    Executed: "bg-teal-500/10 text-teal-600 border-teal-500/30",
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

interface CardProps {
  order: ProcurementOrderListItem;
  highlighted: boolean;
  onChanged: () => void;
}

const OrderCard = ({ order, highlighted, onChanged }: CardProps) => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(highlighted);
  const [acting, setActing] = useState(false);

  const advancePct = order.advance_pct ?? 30;
  const advanceAmount = (order.total_price * advancePct) / 100;
  const finalAmount = order.total_price - advanceAmount;

  const handleSign = async () => {
    setActing(true);
    try {
      const res = await signContractById(order.id);
      const hash = res.transaction_hash || res.tx_hash || res.contract_hash;
      toast({
        title: "Contract signed — advance released",
        description: hash ? `Tx: ${hash.slice(0, 22)}…` : undefined,
      });
      onChanged();
    } catch (e) {
      toast({ title: "Signing failed", description: String(e), variant: "destructive" });
    } finally {
      setActing(false);
    }
  };

  const handleExecute = async () => {
    setActing(true);
    try {
      const res = await executeContract(order.id, order.quantity);
      const hash = res.transaction_hash || res.execution_hash;
      toast({
        title: "Delivery recorded — final payment released",
        description: hash ? `Tx: ${hash.slice(0, 22)}…` : undefined,
      });
      onChanged();
    } catch (e) {
      toast({ title: "Execution failed", description: String(e), variant: "destructive" });
    } finally {
      setActing(false);
    }
  };

  return (
    <div
      className={`glass-card ${highlighted ? "glow-cyan" : ""}`}
      style={{ borderRadius: 20 }}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full p-5 flex items-start justify-between gap-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-mono text-primary truncate">{order.order_code}</p>
          <h3 className="font-heading font-bold text-sm mt-1 truncate">{order.item_name}</h3>
          <p className="text-xs text-muted-foreground truncate">{order.vendor_name}</p>
          <p className="text-xs mt-1">
            <span className="font-mono">{order.quantity?.toLocaleString()}</span>{" "}
            <span className="text-muted-foreground">units · </span>
            <span className="font-mono font-semibold">{fmtPKR(order.total_price)}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <StatusBadge status={order.contract_status} />
          {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Smart Contract Record</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Buyer</p>
                <p className="font-medium">{order.buyer_name || "NEXUS Procurement"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Vendor</p>
                <p className="font-medium truncate">{order.vendor_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Item</p>
                <p className="font-medium truncate">{order.item_name} × {order.quantity}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Value</p>
                <p className="font-mono font-bold">{fmtPKR(order.total_price)}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Payment Schedule</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/30 border border-border p-2.5" style={{ borderRadius: 20 }}>
                <p className="text-[10px] text-muted-foreground">Advance ({advancePct}%)</p>
                <p className="font-mono font-bold text-xs mt-0.5">{fmtPKR(advanceAmount)}</p>
              </div>
              <div className="bg-muted/30 border border-border p-2.5" style={{ borderRadius: 20 }}>
                <p className="text-[10px] text-muted-foreground">On Delivery ({100 - advancePct}%)</p>
                <p className="font-mono font-bold text-xs mt-0.5">{fmtPKR(finalAmount)}</p>
              </div>
            </div>
          </div>

          {order.contract_hash && (
            <div className="flex items-start gap-2 bg-success/5 border border-success/20 p-2.5" style={{ borderRadius: 20 }}>
              <Link2 size={12} className="text-success mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-success uppercase tracking-wide font-semibold">Secured On-Chain</p>
                <p className="font-mono text-[10px] text-foreground/80 break-all mt-0.5">{order.contract_hash}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            {order.contract_status === "Pending" && (
              <button
                onClick={handleSign}
                disabled={acting}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium btn-navy disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderRadius: 20 }}
              >
                {acting ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
                Sign & Release Advance
              </button>
            )}
            {order.contract_status === "Signed" && (
              <button
                onClick={handleExecute}
                disabled={acting}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium btn-navy disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderRadius: 20 }}
              >
                {acting ? <Loader2 size={12} className="animate-spin" /> : <Truck size={12} />}
                Record Delivery & Release Final
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Procurement = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [orders, setOrders] = useState<ProcurementOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navState = (location.state as { prefilledItemName?: string; prefilledQuantity?: number } | null) || null;

  const load = useCallback(async () => {
    try {
      const res = await fetchOrders();
      setOrders((prev) => {
        const fresh = res.orders || [];
        // keep any optimistic items the backend hasn't returned yet
        const freshIds = new Set(fresh.map((o) => o.id));
        const freshCodes = new Set(fresh.map((o) => o.order_code));
        const optimistic = prev.filter(
          (o) => o.id?.startsWith("optimistic-") && !freshIds.has(o.id) && !freshCodes.has(o.order_code),
        );
        return [...optimistic, ...fresh];
      });
    } catch (e) {
      toast({ title: "Failed to load orders", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleCreated = useCallback((created?: {
    order_code: string; item_name: string; vendor_name: string;
    quantity: number; total_price: number; advance_pct: number;
    order_id?: string; contract_hash?: string;
  }) => {
    if (created) {
      const optimistic: ProcurementOrderListItem = {
        id: created.order_id || `optimistic-${created.order_code}`,
        order_code: created.order_code,
        item_name: created.item_name,
        quantity: created.quantity,
        total_price: created.total_price,
        contract_status: "Pending",
        contract_hash: created.contract_hash || null,
        vendor_name: created.vendor_name,
        advance_pct: created.advance_pct,
        buyer_name: "NEXUS Procurement",
      };
      setOrders((prev) => {
        const exists = prev.some((o) => o.order_code === optimistic.order_code);
        return exists ? prev : [optimistic, ...prev];
      });
    }
    load();
  }, [load]);

  const highlightedId = new URLSearchParams(location.search).get("contract") || "";
  const visible = orders.filter(
    (o) => o.contract_status !== "Executed" && o.contract_status !== "Rejected",
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Procurement & Smart Contracts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate, sign, and execute on-chain procurement contracts.
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

      <SmartContractEditor
        onCreated={handleCreated}
        prefilledItemName={navState?.prefilledItemName}
        prefilledQuantity={navState?.prefilledQuantity}
      />

      <div>
        <h2 className="font-heading font-bold text-sm mb-3">Active Contracts ({visible.length})</h2>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : visible.length === 0 ? (
          <div className="glass-card p-10 text-center text-muted-foreground" style={{ borderRadius: 20 }}>
            <ClipboardList size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No pending or signed contracts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                highlighted={o.id === highlightedId || o.order_code === highlightedId}
                onChanged={load}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Procurement;
