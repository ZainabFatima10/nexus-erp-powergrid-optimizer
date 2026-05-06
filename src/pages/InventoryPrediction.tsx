import { useState } from "react";
import { format } from "date-fns";
import {
  Loader2, Brain, CalendarIcon, Zap, Network, Settings,
  AlertTriangle, TrendingUp, DollarSign,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getInventoryOverview, InventoryItem } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

type Cat = "Generation" | "Infrastructure" | "Operational";

interface Prediction {
  item: InventoryItem;
  predicted: number;
  recommendation: string;
  recColor: string;
}

const CATS: { key: Cat; icon: typeof Zap; accent: string; border: string; bg: string }[] = [
  { key: "Generation", icon: Zap, accent: "text-yellow-500", border: "border-yellow-500/30", bg: "bg-yellow-500/5" },
  { key: "Infrastructure", icon: Network, accent: "text-blue-500", border: "border-blue-500/30", bg: "bg-blue-500/5" },
  { key: "Operational", icon: Settings, accent: "text-green-500", border: "border-green-500/30", bg: "bg-green-500/5" },
];

const recFor = (status: string) => {
  if (status === "Critical") return { text: "Immediate VEMA reorder required", color: "text-destructive" };
  if (status === "Low") return { text: "Schedule procurement order", color: "text-warning" };
  return { text: "Stock sufficient", color: "text-success" };
};

const InventoryPrediction = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast({ title: "Pick a date", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const inv = await getInventoryOverview();
      const preds: Prediction[] = inv.items.map((item) => {
        const rec = recFor(item.status);
        return {
          item,
          predicted: Math.round(item.current_stock * 0.15),
          recommendation: rec.text,
          recColor: rec.color,
        };
      });
      setPredictions(preds);
    } catch (err) {
      toast({ title: "Prediction failed", description: String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const reorderNeeded = predictions?.filter((p) => p.item.status !== "OK").length ?? 0;
  const criticalCount = predictions?.filter((p) => p.item.status === "Critical").length ?? 0;
  const totalOrderValue = predictions
    ?.filter((p) => p.item.status !== "OK")
    .reduce((s, p) => s + (p.item.reorder_quantity || 0), 0) ?? 0;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-heading font-bold">Inventory Prediction</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pick a future date to forecast demand across all inventory categories.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-5 flex flex-wrap items-end gap-4" style={{ borderRadius: 20 }}>
        <div className="flex-1 min-w-[240px]">
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">Forecast Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "w-full px-4 py-2.5 bg-muted/50 border border-border text-left flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50",
                  !date && "text-muted-foreground"
                )}
                style={{ borderRadius: 20 }}
              >
                <CalendarIcon size={16} />
                {date ? format(date, "PPP") : "Select date"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 font-semibold btn-navy disabled:opacity-50"
          style={{ borderRadius: 20 }}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
          {loading ? "Predicting..." : "Predict Demand"}
        </button>
      </form>

      {predictions && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5" style={{ borderRadius: 20 }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-warning" />
                <span className="text-xs text-muted-foreground">Items Needing Reorder</span>
              </div>
              <p className="text-2xl font-heading font-bold">{reorderNeeded}</p>
            </div>
            <div className="glass-card p-5" style={{ borderRadius: 20 }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-destructive" />
                <span className="text-xs text-muted-foreground">Critical Items</span>
              </div>
              <p className="text-2xl font-heading font-bold text-destructive">{criticalCount}</p>
            </div>
            <div className="glass-card p-5" style={{ borderRadius: 20 }}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-primary" />
                <span className="text-xs text-muted-foreground">Estimated Total Order Units</span>
              </div>
              <p className="text-2xl font-heading font-bold">{totalOrderValue.toLocaleString()}</p>
            </div>
          </div>

          {/* Category cards */}
          {CATS.map((c) => {
            const rows = predictions.filter((p) => p.item.category === c.key);
            return (
              <div
                key={c.key}
                className={`glass-card overflow-hidden border-l-4 ${c.border} ${c.bg}`}
                style={{ borderRadius: 20 }}
              >
                <div className="flex items-center gap-2 p-4 border-b border-border/40">
                  <c.icon size={20} className={c.accent} />
                  <h3 className="font-heading font-semibold text-lg">{c.key}</h3>
                  <span className="ml-auto text-xs text-muted-foreground">{rows.length} items</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/20">
                      <tr>
                        {["Item Name", "Current Stock", "Predicted Demand", "Status", "Recommendation"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {rows.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">No items.</td></tr>
                      )}
                      {rows.map((p) => (
                        <tr key={p.item.item_id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium">{p.item.name}</td>
                          <td className="px-4 py-3 text-sm font-mono">{p.item.current_stock.toLocaleString()} {p.item.unit}</td>
                          <td className="px-4 py-3 text-sm font-mono">{p.predicted.toLocaleString()} {p.item.unit}</td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "text-[10px] px-2 py-0.5 font-semibold border",
                                p.item.status === "Critical" && "bg-destructive/10 text-destructive border-destructive/30 animate-pulse",
                                p.item.status === "Low" && "bg-warning/10 text-warning border-warning/30",
                                p.item.status === "OK" && "bg-success/10 text-success border-success/30",
                              )}
                              style={{ borderRadius: 20 }}
                            >
                              {p.item.status}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm font-medium ${p.recColor}`}>{p.recommendation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default InventoryPrediction;
