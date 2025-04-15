import React, { useState } from "react";
import { Search, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import Sidebar from "./Sidebar";
import TopNavAuth from "./TopNavAuth";

const TopNav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 md:hidden"
            aria-label="Toggle Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        </SheetContent>
      </Sheet>
      
      <div className="w-full flex justify-between items-center gap-4">
        <div className="hidden md:block">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="relative hidden md:flex">
          <Input
            type="search"
            placeholder="Search..."
            className="sm:w-[300px] md:w-[200px] lg:w-[300px] pl-8"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
        
        <TopNavAuth />
      </div>
    </header>
  );
};

export default TopNav;
