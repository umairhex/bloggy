"use client";

import React from "react";
import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectEmptyStateProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNewProject: () => void;
}

export default function ProjectEmptyState({
  searchQuery,
  setSearchQuery,
  onNewProject,
}: ProjectEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 border border-dashed border-hairline rounded-md bg-canvas text-center animate-fade-in w-full">
      <div className="w-14 h-14 rounded-full bg-surface-soft flex items-center justify-center text-muted mb-base">
        <Database size={28} />
      </div>
      
      <h3 className="text-title-md font-semibold text-ink mb-xs">
        {searchQuery ? "No results match search" : "No active projects"}
      </h3>
      
      {/* FIX: Removed w-full and mx-auto, replaced with an explicit max-w-[400px] */}
      <p className="max-w-[400px] text-xs text-body mb-lg">
        {searchQuery
          ? "Try adjusting your query or keywords to find matching database connection profiles."
          : "Connect your first MongoDB connection strings to enable CMS sync, automated drafts, and analytics logging."}
      </p>
      
      <div className="flex gap-md shrink-0">
        {searchQuery ? (
          <Button
            variant="outline"
            className="h-9 px-md text-sm border-hairline text-ink rounded-sm font-medium cursor-pointer"
            onClick={() => setSearchQuery("")}
          >
            Clear Search
          </Button>
        ) : (
          <Button
            className="h-10 px-lg text-sm bg-primary hover:bg-primary-active text-on-primary font-medium rounded-sm shadow-sm gap-sm flex items-center transition-colors cursor-pointer"
            onClick={onNewProject}
          >
            <Plus size={16} />
            Connect Database
          </Button>
        )}
      </div>
    </div>
  );
}