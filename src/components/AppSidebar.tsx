import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Package, Cloud, MessageSquare, Bell, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import NexusLogo from "@/components/NexusLogo";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Outage Prediction", url: "/outage-prediction", icon: Cloud },
  { title: "User Complaints", url: "/complaints", icon: MessageSquare },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const AppSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? "w-16" : "w-64"} min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
      <div className={`p-4 border-b border-sidebar-border flex items-center ${collapsed ? "justify-center" : ""}`}>
        {!collapsed && <NexusLogo />}
        {collapsed && (
          <div className="w-8 h-8 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <defs><linearGradient id="sideHex" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFFCF7" /><stop offset="100%" stopColor="#FFFCF7" /></linearGradient></defs>
              <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="url(#sideHex)" strokeWidth="2" fill="none" />
            </svg>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
              active
                  ? "bg-white/10 text-sidebar-accent glow-cyan"
                  : "text-sidebar-foreground hover:text-sidebar-accent hover:bg-white/5"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.title : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 space-y-1 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:text-sidebar-accent hover:bg-white/5 transition-all w-full"
        >
          {collapsed ? <ChevronRight size={20} /> : <><ChevronLeft size={20} /><span>Collapse</span></>}
        </button>
        <button
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-all w-full ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
