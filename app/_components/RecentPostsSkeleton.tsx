import React from "react";

export default function RecentPostsSkeleton() {
  return (
    <div>
      <h2 className="font-serif text-title-md font-semibold mb-md text-ink">
        Recent posts
      </h2>
      <div className="space-y-sm animate-pulse">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-md p-base rounded-md border border-hairline bg-canvas"
          >
            <div className="w-9 h-9 rounded-sm bg-surface-soft shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-hairline rounded w-1/3" />
              <div className="h-3 bg-hairline rounded w-1/4" />
            </div>
            <div className="h-6 w-16 bg-hairline rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
