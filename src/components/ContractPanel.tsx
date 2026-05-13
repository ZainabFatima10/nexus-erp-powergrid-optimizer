import { Loader2, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { ContractObject, approveContract, procurementCheckin } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Props {
  contract: ContractObject;
  orderId: string;
  onUpdated?: () => void;
}

const truncate = (s: string, n = 24) => (s && s.length > n ? `${s.slice(0, n)}…` : s);

const formatPKR = (n: number) =>
  `PKR ${Number(n || 0).toLocaleString("en-US")}`;

const ProgressBar = ({ pct, color }: { pct: number; color: string }) => (
  <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full transition-all ${color}`}
      style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
    />
  </div>
);

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-3 py-1.5 border-b border-border/30 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right max-w-[60%] truncate">{value}</span>
  </div>
);

const ContractPanel = ({ contract, orderId, onUpdated }: Props) => {
  const { toast } = useToast();
  const [signing, setSigning] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSign = async () => {
    setSigning(true);
    try {
      await approveContract(contract.id);
      toast({ title: "Contract approved and signed to ledger." });
      onUpdated?.();
    } catch (e) {
      toast({ title: "Sign failed", description: String(e), variant: "destructive" });
    } finally { setSigning(false); }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await procurementCheckin(orderId);
      toast({ title: "✅ Delivery Accepted & Smart Contract Executed on Ledger!" });
      onUpdated?.();
    } catch (e) {
      toast({ title: "Verification failed", description: String(e), variant: "destructive" });
    } finally { setVerifying(false); }
  };

  const txns = contract.transactions && contract.transactions.length > 0
    ? contract.transactions
    : null;

  return (
    <div className="space-y-6">
      {/* A — Blockchain Evidence */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Blockchain Evidence</p>
        <div className="glass-card p-4 space-y-1" style={{ borderRadius: 20 }}>
          <Row label="Immutable Ledger ID" value={<span className="font-mono text-xs">{truncate(contract.ledger_id)}</span>} />
          <Row label="Fabric Execution Hash" value={<span className="font-mono text-xs">{truncate(contract.fabric_hash)}</span>} />
          <Row label="Hyperledger Block Number" value={<span className="font-mono text-xs">{contract.block_number}</span>} />
        </div>
      </div>

      {/* B — Payment History */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Payment History</p>
        <div className="glass-card p-4 space-y-4" style={{ borderRadius: 20 }}>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium">Advance Payment (20%)</span>
              <span className={contract.advance_settled ? "text-success" : "text-warning"}>
                {contract.advance_settled ? "Settled" : "Pending"}
              </span>
            </div>
            <ProgressBar
              pct={contract.advance_settled ? 100 : 0}
              color={contract.advance_settled ? "bg-success" : "bg-warning animate-pulse"}
            />
            <p className="text-xs font-mono text-muted-foreground mt-1.5">
              {contract.advance_tx_id || "Pending"}
            </p>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium">Final Settlement (80%)</span>
              <span className={contract.final_settled ? "text-success" : "text-muted-foreground"}>
                {contract.final_settled ? "Settled" : "Pending"}
              </span>
            </div>
            <ProgressBar
              pct={contract.final_settled ? 100 : 0}
              color={contract.final_settled ? "bg-success" : "bg-muted"}
            />
            <p className="text-xs font-mono text-muted-foreground mt-1.5">
              {contract.final_tx_id || "Pending"}
            </p>
          </div>
        </div>
      </div>

      {/* C — Transaction History */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Transaction History</p>
        <div className="glass-card overflow-hidden" style={{ borderRadius: 20 }}>
          <table className="w-full">
            <thead className="bg-muted/20">
              <tr>
                {["Date", "Type", "Amount (PKR)", "Transaction ID"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {txns ? (
                txns.map((t, i) => (
                  <tr key={i} className="hover:bg-muted/10">
                    <td className="px-3 py-2 text-xs">{new Date(t.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="px-3 py-2 text-xs">{t.type}</td>
                    <td className="px-3 py-2 text-xs font-mono">{formatPKR(t.amount)}</td>
                    <td className="px-3 py-2 text-xs font-mono">{truncate(t.transaction_id)}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr><td className="px-3 py-2 text-xs">—</td><td className="px-3 py-2 text-xs">Advance Payment</td><td className="px-3 py-2 text-xs">—</td><td className="px-3 py-2 text-xs text-muted-foreground">Pending</td></tr>
                  <tr><td className="px-3 py-2 text-xs">—</td><td className="px-3 py-2 text-xs">Final Settlement</td><td className="px-3 py-2 text-xs">—</td><td className="px-3 py-2 text-xs text-muted-foreground">Pending</td></tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer actions */}
      {contract.status === "Pending" && (
        <button
          onClick={handleSign}
          disabled={signing}
          className="w-full py-2.5 btn-navy font-semibold flex items-center justify-center gap-2"
          style={{ borderRadius: 20 }}
        >
          {signing && <Loader2 size={14} className="animate-spin" />}
          <ShieldCheck size={14} /> Sign Contract
        </button>
      )}
      {contract.status === "Signed" && (
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="w-full py-2.5 btn-navy font-semibold flex items-center justify-center gap-2"
          style={{ borderRadius: 20 }}
        >
          {verifying && <Loader2 size={14} className="animate-spin" />}
          <Truck size={14} /> Verify Delivery
        </button>
      )}
    </div>
  );
};

export default ContractPanel;
