'use client';

import React from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectControlBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  onRefreshProjects: () => void;
  isRefreshing: boolean;
  onNewProject: () => void;
}

export default function ProjectControlBar({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  onRefreshProjects,
  isRefreshing,
  onNewProject,
}: ProjectControlBarProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-md mb-lg pt-sm">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-md flex-1">
        <div className="relative w-full sm:w-[320px] md:w-[384px] shrink-0">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name or description..."
            className="w-full pl-10 pr-10 bg-canvas border border-hairline rounded-full text-sm text-ink placeholder:text-muted outline-hidden focus:ring-1 focus:ring-ink focus:border-ink hover:shadow-airbnb hover:border-hairline-soft transition-all h-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer text-xs font-bold w-5 h-5 rounded-full hover:bg-surface-soft flex items-center justify-center transition-all"
              title="Clear Search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="relative shrink-0">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-10 pl-4 pr-3 bg-canvas border border-hairline rounded-full text-sm text-ink outline-hidden hover:shadow-airbnb hover:border-hairline-soft transition-all cursor-pointer min-w-[160px] justify-between flex items-center focus:ring-1 focus:ring-ink focus:border-ink">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="bg-canvas border-hairline rounded-sm shadow-airbnb"
            >
              <SelectItem
                value="newest"
                className="text-sm text-ink focus:bg-surface-soft hover:bg-surface-soft rounded-xs cursor-pointer"
              >
                Newest Added
              </SelectItem>
              <SelectItem
                value="oldest"
                className="text-sm text-ink focus:bg-surface-soft hover:bg-surface-soft rounded-xs cursor-pointer"
              >
                Oldest Added
              </SelectItem>
              <SelectItem
                value="name-asc"
                className="text-sm text-ink focus:bg-surface-soft hover:bg-surface-soft rounded-xs cursor-pointer"
              >
                Alphabetical (A-Z)
              </SelectItem>
              <SelectItem
                value="name-desc"
                className="text-sm text-ink focus:bg-surface-soft hover:bg-surface-soft rounded-xs cursor-pointer"
              >
                Alphabetical (Z-A)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-md shrink-0">
        <Button
          variant="outline"
          onClick={onRefreshProjects}
          disabled={isRefreshing}
          className="h-10 border-hairline text-ink hover:bg-surface-soft gap-sm px-md rounded-sm cursor-pointer"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </Button>
        <Button
          onClick={onNewProject}
          className="h-10 bg-primary hover:bg-primary-active text-on-primary text-sm font-semibold px-lg rounded-sm shadow-sm gap-sm flex items-center transition-colors shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          New Project
        </Button>
      </div>
    </div>
  );
}
