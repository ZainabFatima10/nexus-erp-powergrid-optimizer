import { useState } from "react";
import { inventoryItems, currentOrders, pastOrders, reorderItems } from "@/data/mockData";
import { ArrowUpDown, Download, Plus, X, Info } from "lucide-react";

type SortDir = "asc" | "desc";

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    OK: "bg-success/10 text-success",
    Low: "bg-warning/10 text-warning",
    Critical: "bg-destructive/10 text-destructive",
    Verified: "bg-success/10 text-success",
    Pending: "bg-warning/10 text-warning",
    Unverified: "bg-destructive/10 text-destructive",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] || "bg-muted text-muted-foreground"}`}>{status}</span>;
};

const Inventory = () => {
  const [tab, setTab] = useState<"overview" | "orders" | "history" | "reorders">("overview");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showModal, setShowModal] = useState(false);

  const tabs = [
    { key: "overview" as const, label: "Overview" },
    { key: "orders" as const, label: "Current Orders" },
    { key: "history" as const, label: "Past History" },
    { key: "reorders" as const, label: "Reorders" },
  ];

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const SortHeader = ({ col, children }: { col: string; children: React.ReactNode }) => (
    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort(col)}>
      <div className="flex items-center gap-1">{children}<ArrowUpDown size={12} /></div>
    </th>
  );

  const banners: Record<string, string> = {
    overview: "Inventory levels are monitored in real-time. Critical items trigger automatic reorder via VEMA.",
    orders: "Smart contract statuses are verified on-chain. Pending contracts await vendor confirmation.",
    history: "All completed orders are immutably recorded on the blockchain ledger.",
    reorders: "Items at or below 20% threshold are flagged. VEMA auto-triggers reorders for critical stock.",
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-heading font-bold">Inventory Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Track stock, orders, and blockchain-verified procurement.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/30 rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === t.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 glass-card p-3 border-accent-cyan">
        <Info size={16} className="text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">{banners[tab]}</p>
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/20">
              <tr>
                <SortHeader col="name">Item Name</SortHeader>
                <SortHeader col="stock">Stock Level</SortHeader>
                <SortHeader col="status">Status</SortHeader>
                <SortHeader col="lastUpdated">Last Updated</SortHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {inventoryItems.map((item) => (
                <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-sm">{item.stock.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{item.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Current Orders Tab */}
      {tab === "orders" && (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/20">
              <tr>
                <SortHeader col="id">Order ID</SortHeader>
                <SortHeader col="item">Item</SortHeader>
                <SortHeader col="qty">Qty</SortHeader>
                <SortHeader col="vendor">Vendor</SortHeader>
                <SortHeader col="contract">Contract Status</SortHeader>
                <SortHeader col="stage">Stage</SortHeader>
                <SortHeader col="delivery">Expected Delivery</SortHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {currentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-primary">{order.id}</td>
                  <td className="px-4 py-3 text-sm">{order.item}</td>
                  <td className="px-4 py-3 text-sm">{order.qty}</td>
                  <td className="px-4 py-3 text-sm">{order.vendor}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.contractStatus} /></td>
                  <td className="px-4 py-3 text-sm">{order.stage}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{order.delivery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Past History Tab */}
      {tab === "history" && (
        <>
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-sm hover:bg-muted transition-colors">
              <Download size={16} /> Export
            </button>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/20">
                <tr>
                  <SortHeader col="id">Order ID</SortHeader>
                  <SortHeader col="item">Item</SortHeader>
                  <SortHeader col="qty">Qty</SortHeader>
                  <SortHeader col="vendor">Vendor</SortHeader>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tx Hash</th>
                  <SortHeader col="date">Completed</SortHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {pastOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-primary">{order.id}</td>
                    <td className="px-4 py-3 text-sm">{order.item}</td>
                    <td className="px-4 py-3 text-sm">{order.qty}</td>
                    <td className="px-4 py-3 text-sm">{order.vendor}</td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{order.txHash}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{order.completedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Reorders Tab */}
      {tab === "reorders" && (
        <>
          <div className="flex justify-end">
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-btn text-primary-foreground text-sm font-medium hover:opacity-90 transition-all">
              <Plus size={16} /> Manually Place Reorder
            </button>
          </div>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/20">
                <tr>
                  <SortHeader col="name">Item Name</SortHeader>
                  <SortHeader col="stock">Current Stock</SortHeader>
                  <SortHeader col="threshold">Threshold</SortHeader>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Auto-Triggered</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Trigger Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {reorderItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-destructive font-semibold">{item.stock}</td>
                    <td className="px-4 py-3 text-sm">{item.threshold}</td>
                    <td className="px-4 py-3">{item.autoTriggered ? <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">Yes</span> : <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">No</span>}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.triggerDate || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Reorder Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="glass-card p-6 w-full max-w-md mx-4 glow-cyan animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg">Place Manual Reorder</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Select Item</label>
                <select className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {inventoryItems.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Quantity</label>
                <input type="number" defaultValue={100} className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <button onClick={() => setShowModal(false)} className="w-full py-2.5 rounded-lg gradient-btn text-primary-foreground font-semibold hover:opacity-90 transition-all">
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
