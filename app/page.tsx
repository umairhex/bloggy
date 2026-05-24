"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard, FileText, PenLine, Tag, BarChart2,
  Users, MessageSquare, Settings, Bell, Plus, Search, Menu, X,
} from "lucide-react";

const navItems = [
  { label: "Workspace", links: [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: FileText, label: "Posts", badge: "12" },
    { icon: PenLine, label: "Editor" },
    { icon: Tag, label: "Topics" },
  ]},
  { label: "Insights", links: [
    { icon: BarChart2, label: "Analytics" },
    { icon: Users, label: "Subscribers" },
    { icon: MessageSquare, label: "Comments" },
  ]},
  { label: "Settings", links: [
    { icon: Settings, label: "Settings" },
  ]},
];

const stats = [
  { label: "Total posts", value: "48", delta: "↑ 4 this month" },
  { label: "Subscribers", value: "2.1k", delta: "↑ 12% vs last month" },
  { label: "Views", value: "18.4k", delta: "↑ 8% this week" },
  { label: "Avg read time", value: "4.2m", delta: "Stable" },
];

const posts = [
  { title: "How I built an AI pipeline with Next.js and n8n", date: "May 22, 2026 · 6 min", status: "Published" },
  { title: "Shadcn UI: designing for developer ergonomics", date: "May 18, 2026 · 4 min", status: "Published" },
  { title: "Branding a SaaS in 48 hours — a naming guide", date: "Scheduled · May 28, 2026", status: "Scheduled" },
  { title: "TypeScript patterns I wish I knew earlier", date: "Draft · Last edited May 20", status: "Draft" },
];

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  Published: "default",
  Scheduled: "secondary",
  Draft: "outline",
};

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">

      {/* Sidebar - Airbnb Light Surface */}
      <aside className={`flex-shrink-0 border-r border-hairline bg-surface-soft flex flex-col transition-all duration-300 ease-out ${
        sidebarOpen ? "w-56" : "w-0"
      } overflow-hidden`}>
        {/* Logo */}
        <div className="px-base py-base border-b border-hairline">
          <p className="font-serif text-title-md font-semibold tracking-tight text-ink">
            bloggy<span className="text-primary">.</span>
          </p>
          <p className="text-xs text-body mt-0.5">Content workspace</p>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 px-sm py-sm">
          {navItems.map((section) => (
            <div key={section.label} className="mb-md">
              <p className="text-xs uppercase tracking-wider text-muted font-semibold px-md mb-xs">
                {section.label}
              </p>
              {section.links.map(({ icon: Icon, label, badge, active }) => (
                <button
                  key={label}
                  className={`w-full flex items-center gap-md px-md py-sm rounded-sm text-sm mb-xs transition-colors
                    ${active
                      ? "bg-canvas text-ink font-medium"
                      : "text-body hover:bg-canvas hover:text-ink"
                    }`}
                >
                  <Icon size={15} />
                  <span className="flex-1 text-left">{label}</span>
                  {badge && (
                    <Badge variant="secondary" className="text-xs px-sm py-xs">
                      {badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          ))}
        </ScrollArea>

        {/* User footer */}
        <div className="px-md py-md border-t border-hairline">
          <div className="flex items-center gap-md">
            <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
              MU
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight truncate text-ink">M Umair</p>
              <p className="text-xs text-body">Pro plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header - Airbnb top nav with 1px hairline */}
        <header className="h-16 border-b border-hairline flex items-center justify-between px-lg flex-shrink-0 bg-canvas">
          <div className="flex items-center gap-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
            <p className="text-sm text-body">
              Dashboard <span className="text-hairline"> › </span> <span className="text-ink font-semibold">Overview</span>
            </p>
          </div>
          <div className="flex items-center gap-md">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Bell size={16} />
            </Button>
            <Button size="sm" className="h-9 gap-md">
              <Plus size={16} />
              New post
            </Button>
          </div>
        </header>

        {/* Main content */}
        <ScrollArea className="flex-1">
          <main className="p-lg space-y-lg">
            {/* Stats Grid - Airbnb surface-soft cards */}
            <div className="grid grid-cols-4 gap-md">
              {stats.map(({ label, value, delta }) => (
                <div key={label} className="bg-surface-soft rounded-md p-base">
                  <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-md">
                    {label}
                  </p>
                  <p className="text-2xl font-bold text-ink">{value}</p>
                  <p className="text-xs text-primary mt-sm">{delta}</p>
                </div>
              ))}
            </div>

            {/* Posts list */}
            <div>
              <h2 className="font-serif text-title-md font-semibold mb-md text-ink">Recent posts</h2>
              <div className="space-y-sm">
                {posts.map(({ title, date, status }) => (
                  <div
                    key={title}
                    className="flex items-center gap-md p-base rounded-md border border-hairline bg-canvas hover:border-hairline-soft hover:shadow-airbnb transition-all cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-sm bg-surface-soft flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{title}</p>
                      <p className="text-xs text-body mt-xs">{date}</p>
                    </div>
                    <Badge variant={statusVariant[status]} className="text-xs flex-shrink-0">
                      {status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </ScrollArea>

        {/* Footer - Airbnb style with 1px top hairline */}
        <footer className="h-12 border-t border-hairline flex items-center justify-between px-lg flex-shrink-0 bg-canvas">
          <p className="text-xs text-body">
            bloggy<span className="text-primary">.</span> — v1.0.0
          </p>
          <div className="flex gap-lg">
            {["Help", "Changelog", "Privacy"].map((link) => (
              <a key={link} href="#" className="text-xs text-body hover:text-ink transition-colors">
                {link}
              </a>
            ))}
          </div>
        </footer>

      </div>
    </div>
  );
}