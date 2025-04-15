
import React from "react";
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

  return (
    <aside className="h-screen bg-background z-20 flex-col fixed inset-y-0 left-0 w-64 hidden md:flex border-r">
      <div className="flex flex-col h-full">
        <div className="flex h-14 items-center px-4 py-4 border-b">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold"
            onClick={handleItemClick}
          >
            <BarChart2 className="h-6 w-6" />
            <span className="text-xl font-bold">ProjectFlow</span>
          </Link>
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
                  className={cn("w-full justify-start", {
                    "bg-primary/5": pathname === route.href,
                  })}
                >
                  <route.icon className="h-5 w-5 mr-3" />
                  {route.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
