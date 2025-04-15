
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart2,
  FileText,
  FolderKanban,
  Home,
  Users,
  Code2,
  Settings,
  DollarSign,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const routes = [
    {
      href: "/",
      icon: Home,
      label: "Dashboard",
    },
    {
      href: "/projects",
      icon: FolderKanban,
      label: "Projects",
    },
    {
      href: "/clients",
      icon: Users,
      label: "Clients",
    },
    {
      href: "/documents",
      icon: FileText,
      label: "Documents",
    },
    {
      href: "/finance",
      icon: DollarSign,
      label: "Finance",
    },
    {
      href: "/snippets",
      icon: Code2,
      label: "Snippets",
    },
    {
      href: "/settings",
      icon: Settings,
      label: "Settings",
    },
  ];

  const handleItemClick = () => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside 
      className={cn(
        "h-screen bg-background z-20 flex-col fixed inset-y-0 left-0 border-r transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        "hidden md:flex"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex h-14 items-center px-4 py-4 border-b justify-between">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 font-semibold",
              isCollapsed && "justify-center"
            )}
            onClick={handleItemClick}
          >
            <BarChart2 className="h-6 w-6" />
            {!isCollapsed && <span className="text-xl font-bold">ProjectFlow</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2 px-4">
          <nav className="grid items-start gap-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                onClick={handleItemClick}
              >
                <Button
                  variant={pathname === route.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start", 
                    {
                      "bg-primary/5": pathname === route.href,
                    },
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <route.icon className="h-5 w-5 mr-3" />
                  {!isCollapsed && <span>{route.label}</span>}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className={cn(
              "w-full text-red-500 hover:text-red-500 hover:bg-red-50",
              isCollapsed ? "justify-center px-2" : "justify-start"
            )}
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
