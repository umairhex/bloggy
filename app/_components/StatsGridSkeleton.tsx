import React from 'react';

export default function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-md lg:grid-cols-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="bg-surface-soft rounded-md p-base h-[120px] flex flex-col justify-between"
        >
          <div className="h-3 w-2/3 bg-hairline rounded" />
          <div className="h-8 w-1/2 bg-hairline rounded" />
          <div className="h-3 w-1/3 bg-hairline rounded" />
        </div>
      ))}
    </div>
  );
}
