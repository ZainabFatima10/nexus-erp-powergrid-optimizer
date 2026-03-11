import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Megaphone, Loader2 } from "lucide-react";
import {
  getSalesSummary, getSalesByCategory, getSalesByRegion, getSalesTrend, getInventoryStatus,
  SalesSummary, CategoryData, RegionData, TrendData, InventoryStatus,
} from "@/services/api";
import HealthBanner from "@/components/HealthBanner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["hsl(216,19%,26%)", "hsl(130,15%,45%)", "hsl(38,92%,50%)", "hsl(0,72%,50%)", "hsl(215,19%,34%)", "hsl(133,25%,55%)", "hsl(207,80%,65%)", "hsl(215,20%,65%)"];

const Dashboard = () => {
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [byCategory, setByCategory] = useState<CategoryData[]>([]);
  const [byRegion, setByRegion] = useState<RegionData[]>([]);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [inventory, setInventory] = useState<InventoryStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getSalesSummary(),
      getSalesByCategory(),
      getSalesByRegion(),
      getSalesTrend("month"),
      getInventoryStatus(),
    ])
      .then(([sum, cat, reg, trd, inv]) => {
        setSummary(sum);
        setByCategory(cat.data);
        setByRegion(reg.data);
        setTrend(trd.data);
        setInventory(inv.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <HealthBanner />
        <div className="glass-card p-6 border-destructive/30 bg-destructive/5 text-center">
          <p className="text-destructive font-semibold">Failed to load dashboard data</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Total Records", value: summary?.total_records?.toLocaleString() ?? "—", icon: BarChart3, color: "text-primary" },
    { label: "Total Demand", value: summary?.total_demand?.toLocaleString() ?? "—", icon: TrendingUp, color: "text-success" },
    { label: "Avg Price", value: `$${summary?.avg_price?.toFixed(2) ?? "—"}`, icon: DollarSign, color: "text-warning" },
    { label: "Total Units Sold", value: summary?.total_units_sold?.toLocaleString() ?? "—", icon: ShoppingCart, color: "text-secondary" },
    { label: "Total Promotions", value: summary?.total_promotions?.toLocaleString() ?? "—", icon: Megaphone, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <HealthBanner />
      <div>
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Live sales & inventory analytics from your backend.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category - Bar Chart */}
        <div className="glass-card p-5">
          <h2 className="text-lg font-heading font-semibold mb-4">Demand by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(212,26%,83%)" />
              <XAxis dataKey="Category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(210,40%,98%)", border: "1px solid hsl(212,26%,83%)", borderRadius: 8 }} />
              <Bar dataKey="total_demand" fill="hsl(216,19%,26%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Region - Donut Chart */}
        <div className="glass-card p-5">
          <h2 className="text-lg font-heading font-semibold mb-4">Demand by Region</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={byRegion}
                dataKey="total_demand"
                nameKey="Region"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={2}
              >
                {byRegion.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(210,40%,98%)", border: "1px solid hsl(212,26%,83%)", borderRadius: 8 }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales Trend - Line Chart */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-heading font-semibold mb-4">Demand Trend (Monthly)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(212,26%,83%)" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "hsl(210,40%,98%)", border: "1px solid hsl(212,26%,83%)", borderRadius: 8 }} />
            <Line type="monotone" dataKey="total_demand" stroke="hsl(130,15%,45%)" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Status Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <h2 className="text-lg font-heading font-semibold">Inventory Status by Category</h2>
        </div>
        <table className="w-full">
          <thead className="bg-muted/20">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Avg Inventory</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Min</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Max</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Avg Ordered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {inventory.map((item) => (
              <tr key={item.Category} className="hover:bg-muted/10 transition-colors">
                <td className="px-4 py-3 text-sm font-medium">{item.Category}</td>
                <td className="px-4 py-3 text-sm">{item.avg_inventory?.toFixed(1)}</td>
                <td className="px-4 py-3 text-sm">{item.min_inventory}</td>
                <td className="px-4 py-3 text-sm">{item.max_inventory}</td>
                <td className="px-4 py-3 text-sm">{item.avg_units_ordered?.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
