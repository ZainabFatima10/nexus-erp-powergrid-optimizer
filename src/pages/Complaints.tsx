import { useState } from "react";
import { complaints } from "@/data/mockData";
import { Info, CheckCircle, X, AlertTriangle } from "lucide-react";

const Complaints = () => {
  const [tab, setTab] = useState<"unresolved" | "resolved">("unresolved");
  const [resolveModal, setResolveModal] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const categoryColors: Record<string, string> = {
    "Power Outage": "bg-destructive/10 text-destructive",
    "Billing": "bg-warning/10 text-warning",
    "Fault": "bg-secondary/10 text-secondary",
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-heading font-bold">User Complaints</h1>
        <p className="text-muted-foreground text-sm mt-1">VEMA-integrated complaint tracking and resolution.</p>
      </div>

      {/* VEMA banner */}
      <div className="flex items-start gap-2 glass-card p-3 border-accent-amber">
        <Info size={16} className="text-warning mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">Complaints are submitted by users through <strong className="text-foreground">VEMA</strong> (Voice & Email Management Agent) and auto-logged here.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/30 p-1 w-fit" style={{ borderRadius: 20 }}>
        <button onClick={() => setTab("unresolved")} style={{ borderRadius: 20 }} className={`px-4 py-2 text-sm font-medium transition-all ${tab === "unresolved" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          Unresolved ({complaints.unresolved.length})
        </button>
        <button onClick={() => setTab("resolved")} style={{ borderRadius: 20 }} className={`px-4 py-2 text-sm font-medium transition-all ${tab === "resolved" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          Resolved ({complaints.resolved.length})
        </button>
      </div>

      {/* Unresolved */}
      {tab === "unresolved" && (
        <div className="space-y-3">
          {complaints.unresolved.map((c) => (
            <div key={c.id} className={`glass-card p-4 transition-all glow-cyan-hover ${c.escalated ? "ring-1 ring-destructive/30" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-mono text-xs text-primary">{c.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColors[c.category] || "bg-muted text-muted-foreground"}`}>{c.category}</span>
                    {c.escalated && <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium flex items-center gap-1"><AlertTriangle size={10} />Escalated</span>}
                  </div>
                  <p className="text-sm">{c.summary}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>Area: {c.area}</span>
                    <span>•</span>
                    <span>{c.timeSince} ago</span>
                  </div>
                </div>
                <button onClick={() => setResolveModal(c.id)} className="flex-shrink-0 px-3 py-1.5 text-xs font-medium flex items-center gap-1 btn-navy">
                  <CheckCircle size={14} /> Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolved */}
      {tab === "resolved" && (
        <div className="space-y-3">
          {complaints.resolved.map((c) => (
            <div key={c.id} className="glass-card p-4">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="font-mono text-xs text-primary">{c.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColors[c.category] || "bg-muted text-muted-foreground"}`}>{c.category}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">Resolved</span>
              </div>
              <p className="text-sm">{c.summary}</p>
              <div className="mt-2 p-2.5 bg-muted/30 text-xs" style={{ borderRadius: 20 }}>
                <p className="text-muted-foreground"><strong className="text-foreground">Resolution:</strong> {c.note}</p>
                <p className="text-muted-foreground mt-1">Resolved by {c.resolver} on {c.resolvedAt}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setResolveModal(null)}>
          <div className="glass-card p-6 w-full max-w-md mx-4 glow-cyan animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg">Resolve {resolveModal}</h3>
              <button onClick={() => setResolveModal(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Resolution Note</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Describe the resolution..." />
              </div>
              <button onClick={() => { setResolveModal(null); setNote(""); }} className="w-full py-2.5 rounded-lg gradient-btn text-primary-foreground font-semibold hover:opacity-90 transition-all">
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
