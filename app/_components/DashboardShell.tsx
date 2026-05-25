'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

import SidebarNav from './SidebarNav';
import UserFooter from './UserFooter';
import HeaderBreadcrumbs from './HeaderBreadcrumbs';
import HeaderActions from './HeaderActions';

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh bg-canvas overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-56 flex-col border-r border-hairline bg-surface-soft transition-all duration-300 ease-out md:sticky md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 flex-col justify-center border-b border-hairline px-base">
          <p className="text-title-md font-serif font-semibold tracking-tight text-ink">
            bloggy<span className="text-primary">.</span>
          </p>
          <p className="text-xs text-body">Content workspace</p>
        </div>

        <SidebarNav />

        <UserFooter />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-hairline bg-canvas px-md md:px-lg">
          <div className="flex min-w-0 items-center gap-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
            <div className="min-w-0">
              <HeaderBreadcrumbs />
            </div>
          </div>
          <HeaderActions />
        </header>

        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
