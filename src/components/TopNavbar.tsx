import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { notifications } from "@/data/mockData";
import { Link } from "react-router-dom";

const TopNavbar = () => {
  const { user } = useAuth();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-14 border-b border-border bg-card/40 backdrop-blur-md flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <Bell size={20} className="text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
            {user?.name?.[0] || "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">{user?.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground">{user?.role || "Admin"}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
