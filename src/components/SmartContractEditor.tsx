import { useState, useMemo } from "react";
import { Loader2, FileSignature } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createManualContract } from "@/services/api";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface Props {
  onCreated?: (created?: { order_code: string; item_name: string; vendor_name: string; quantity: number; total_price: number; advance_pct: number; order_id?: string; contract_hash?: string }) => void;
  prefilledItemName?: string;
  prefilledQuantity?: number;
}

const fmtPKR = (n: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(
    isFinite(n) ? n : 0,
  );

const SmartContractEditor = ({ onCreated }: Props) => {
  const { toast } = useToast();
  const [vendor, setVendor] = useState("");
  const [item, setItem] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [advancePct, setAdvancePct] = useState<number>(30);
  const [submitting, setSubmitting] = useState(false);

  const totalValue = useMemo(() => qty * price, [qty, price]);
  const advanceAmount = useMemo(() => (totalValue * advancePct) / 100, [totalValue, advancePct]);
  const finalAmount = useMemo(() => totalValue - advanceAmount, [totalValue, advanceAmount]);

  const canSubmit = vendor.trim() && item.trim() && qty > 0 && price > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const order_code = `ORD-${Date.now().toString().slice(-8)}`;
      const res = await createManualContract({
        item_name: item.trim(),
        quantity: qty,
        vendor_name: vendor.trim(),
        total_price: totalValue,
        order_code,
        payment_terms: `${advancePct}% advance / ${100 - advancePct}% on delivery`,
      });
      toast({
        title: "Smart contract sealed",
        description: res.contract_hash
          ? `Hash: ${res.contract_hash.slice(0, 18)}…`
          : `Order ${order_code} created.`,
      });
      setVendor(""); setItem(""); setQty(1); setPrice(0); setAdvancePct(30);
      onCreated?.();
    } catch (e) {
      toast({ title: "Failed to create contract", description: String(e), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-5" style={{ borderRadius: 20 }}>
      <div className="flex items-center gap-2 mb-4">
        <FileSignature size={16} className="text-primary" />
        <h3 className="font-heading font-bold text-sm">Smart Contract Editor</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Vendor Name</label>
          <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Siemens AG" style={{ borderRadius: 20 }} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Item / Asset Name</label>
          <Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Transformer 11kV" style={{ borderRadius: 20 }} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Quantity</label>
          <Input
            type="number" min={1} value={qty}
            onChange={(e) => setQty(parseInt(e.target.value) || 0)}
            style={{ borderRadius: 20 }}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Unit Price (PKR)</label>
          <Input
            type="number" min={0} value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            style={{ borderRadius: 20 }}
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">Advance Payment</span>
          <span className="font-mono font-semibold text-primary">{advancePct}%</span>
        </div>
        <Slider value={[advancePct]} onValueChange={(v) => setAdvancePct(v[0])} min={0} max={100} step={1} />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5">
        {[
          { label: "Total Value", v: totalValue },
          { label: "Advance Amount", v: advanceAmount },
          { label: "Final Amount", v: finalAmount },
        ].map((x) => (
          <div key={x.label} className="bg-muted/30 border border-border p-3" style={{ borderRadius: 20 }}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{x.label}</p>
            <p className="font-mono font-bold text-sm mt-1">{fmtPKR(x.v)}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium btn-navy disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderRadius: 20 }}
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <FileSignature size={14} />}
          Seal & Generate Smart Contract
        </button>
      </div>
    </div>
  );
};

export default SmartContractEditor;
