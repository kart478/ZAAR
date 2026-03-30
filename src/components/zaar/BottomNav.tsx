import { Home, Users, Rocket, CalendarDays, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems = [
  { id: "home", label: "Home", icon: <Home className="h-5 w-5" />, path: "/" },
  { id: "communities", label: "Communities", icon: <Users className="h-5 w-5" />, path: "/communities" },
  { id: "spaces", label: "Spaces", icon: <Rocket className="h-5 w-5" />, path: "/spaces" },
  { id: "events", label: "Events", icon: <CalendarDays className="h-5 w-5" />, path: "/events" },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-5 w-5" />, path: "/notifications" },
  { id: "profile", label: "Profile", icon: <User className="h-5 w-5" />, path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-card/95 backdrop-blur-lg border-t border-border shadow-soft">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.id} to={item.path}>
                <button
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.icon}
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
