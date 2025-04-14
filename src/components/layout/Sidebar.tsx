
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  FileText, 
  Receipt, 
  Settings,
  Code,
  PanelLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Sidebar = () => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = React.useState(isMobile);

  React.useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80"
        )
      }
    >
      <Icon size={20} />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );

  return (
    <aside 
      className={cn(
        "flex flex-col bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold text-sidebar-foreground">ProjectFlow</h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "mx-auto"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          <PanelLeft size={20} />
        </Button>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/projects" icon={FolderKanban} label="Projects" />
        <NavItem to="/clients" icon={Users} label="Clients" />
        <NavItem to="/documents" icon={FileText} label="Documents" />
        <NavItem to="/finance" icon={Receipt} label="Finance" />
        <NavItem to="/snippets" icon={Code} label="Code Snippets" />
      </nav>

      <div className="p-4">
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </div>
    </aside>
  );
};

export default Sidebar;
