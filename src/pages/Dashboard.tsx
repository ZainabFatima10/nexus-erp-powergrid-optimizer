import { Package, Cloud, MessageSquare, Bell, ArrowRight, Wifi, Link2, Brain, Box, ShieldAlert, AlertTriangle, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { inventoryItems, complaints, outageForecast, notifications } from "@/data/mockData";

const Dashboard = () => {
  const totalInventory = inventoryItems.length;
  const activeOrders = 4;
  const unresolvedComplaints = complaints.unresolved.length;
  const todayRisk = outageForecast[1]; // Tuesday = today

  const kpis = [
    { label: "Total Inventory Items", value: totalInventory, icon: Box, color: "text-primary" },
    { label: "Active Orders", value: activeOrders, icon: ClipboardList, color: "text-secondary" },
    { label: "Unresolved Complaints", value: unresolvedComplaints, icon: AlertTriangle, color: "text-warning" },
    { label: "Outage Risk Today", value: `${todayRisk.probability}%`, icon: ShieldAlert, color: todayRisk.risk === "High" ? "text-destructive" : todayRisk.risk === "Medium" ? "text-warning" : "text-success" },
  ];

  const modules = [
    { title: "Inventory Management", desc: "Track stock levels, orders, and blockchain-verified procurement.", icon: Package, url: "/inventory", accent: "border-accent-cyan" },
    { title: "Outage Prediction", desc: "AI-powered 7-day outage forecasting with grid area analysis.", icon: Cloud, url: "/outage-prediction", accent: "border-accent-violet" },
    { title: "User Complaints", desc: "VEMA-integrated complaint tracking with escalation management.", icon: MessageSquare, url: "/complaints", accent: "border-accent-amber" },
    { title: "Notifications", desc: "Consolidated alerts for orders, outages, complaints, and resources.", icon: Bell, url: "/notifications", accent: "border-accent-green" },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back. Here's your system overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="glass-card p-5 glow-cyan-hover transition-all">
            <div className="flex items-center justify-between mb-3">
              <kpi.icon size={22} className={kpi.color} />
            </div>
            <p className="text-2xl font-heading font-bold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Module Cards */}
      <div>
        <h2 className="text-lg font-heading font-semibold mb-3">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <div key={mod.title} className={`glass-card p-5 ${mod.accent} glow-cyan-hover transition-all`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
                  <mod.icon size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-sm">{mod.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{mod.desc}</p>
                  <Link to={mod.url} className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-3 font-medium">
                    Open <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-heading font-semibold mb-3">System Status</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Wifi size={16} className="text-success" />
            <span className="text-sm">VEMA</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <Link2 size={16} className="text-success" />
            <span className="text-sm">Blockchain</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-success" />
            <span className="text-sm">AI Model</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">Running</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
