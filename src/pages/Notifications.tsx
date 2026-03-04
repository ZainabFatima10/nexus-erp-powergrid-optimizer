import { useState } from "react";
import { notifications } from "@/data/mockData";
import { CheckCheck, ShieldCheck, RefreshCw, Cpu, Cloud, MessageSquare } from "lucide-react";

type Category = "All" | "Confirmations" | "Updates" | "Resource Allocation" | "Outage Updates" | "User Complaints";

const Notifications = () => {
  const [filter, setFilter] = useState<Category>("All");
  const [items, setItems] = useState(notifications);

  const categories: Category[] = ["All", "Confirmations", "Updates", "Resource Allocation", "Outage Updates", "User Complaints"];

  const filtered = filter === "All" ? items : items.filter((n) => n.category === filter);

  const categoryIcons: Record<string, React.ReactNode> = {
    Confirmations: <ShieldCheck size={16} className="text-primary" />,
    Updates: <RefreshCw size={16} className="text-muted-foreground" />,
    "Resource Allocation": <Cpu size={16} className="text-success" />,
    "Outage Updates": <Cloud size={16} className="text-secondary" />,
    "User Complaints": <MessageSquare size={16} className="text-warning" />,
  };

  const categoryBorders: Record<string, string> = {
    Confirmations: "border-accent-cyan",
    Updates: "",
    "Resource Allocation": "border-accent-green",
    "Outage Updates": "border-accent-violet",
    "User Complaints": "border-accent-amber",
  };

  const markAllRead = () => setItems(items.map((n) => ({ ...n, read: true })));

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">Consolidated alerts and updates.</p>
        </div>
        <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-sm hover:bg-muted transition-colors">
          <CheckCheck size={16} /> Mark all as read
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap bg-muted/30 rounded-lg p-1">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === cat ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Notification feed */}
      <div className="space-y-2">
        {filtered.map((n) => (
          <div key={n.id} className={`glass-card p-4 transition-all glow-cyan-hover flex items-start gap-3 ${categoryBorders[n.category] || ""}`}>
            <div className="mt-0.5 flex-shrink-0">
              {categoryIcons[n.category] || <RefreshCw size={16} className="text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">{n.title}</h3>
                {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
            </div>
            <span className="text-[10px] text-muted-foreground flex-shrink-0 whitespace-nowrap">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
