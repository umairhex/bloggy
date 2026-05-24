"use client";

import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

import SidebarNav from "./SidebarNav";
import UserFooter from "./UserFooter";
import HeaderBreadcrumbs from "./HeaderBreadcrumbs";
import HeaderActions from "./HeaderActions";
import DashboardFooter from "./DashboardFooter";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <aside
        className={`shrink-0 border-r border-hairline bg-surface-soft flex flex-col transition-all duration-300 ease-out ${sidebarOpen ? "w-56" : "w-0"
          } overflow-hidden`}
      >
        <div className="h-16 px-base border-b border-hairline flex flex-col justify-center">
          <p className="font-serif text-title-md font-semibold tracking-tight text-ink">
            bloggy<span className="text-primary">.</span>
          </p>
          <p className="text-xs text-body">Content workspace</p>
        </div>

        <SidebarNav />

        <UserFooter />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-hairline flex items-center justify-between px-lg shrink-0 bg-canvas">
          <div className="flex items-center gap-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
            <HeaderBreadcrumbs />
          </div>
          <HeaderActions />
        </header>

        <ScrollArea className="flex-1">
          {children}
        </ScrollArea>

        <DashboardFooter />
      </div>
    </div>
  );
}
