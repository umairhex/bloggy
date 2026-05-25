import React, { Suspense } from 'react';
import DashboardShell from './_components/DashboardShell';
import StatsGrid from './_components/StatsGrid';
import StatsGridSkeleton from './_components/StatsGridSkeleton';
import RecentPosts from './_components/RecentPosts';
import RecentPostsSkeleton from './_components/RecentPostsSkeleton';

export default function Page() {
  return (
    <DashboardShell>
      <main className="p-lg space-y-lg">
        <Suspense fallback={<StatsGridSkeleton />}>
          <StatsGrid />
        </Suspense>

        <Suspense fallback={<RecentPostsSkeleton />}>
          <RecentPosts />
        </Suspense>
      </main>
    </DashboardShell>
  );
}
