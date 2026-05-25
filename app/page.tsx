import React, { Suspense } from 'react';
import DashboardShell from './_components/DashboardShell';
import StatsGrid from './_components/StatsGrid';
import StatsGridSkeleton from './_components/StatsGridSkeleton';
import RecentPosts from './_components/RecentPosts';
import RecentPostsSkeleton from './_components/RecentPostsSkeleton';
import SetupDbCard from './_components/SetupDbCard';
import { hasDBConfigServer } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const isConfigured = await hasDBConfigServer();

  return (
    <DashboardShell>
      {!isConfigured ? (
        <div className="flex-1 flex items-center justify-center p-md sm:p-lg md:p-xl overflow-y-auto">
          <SetupDbCard />
        </div>
      ) : (
        <main className="space-y-md overflow-y-auto p-md sm:p-lg md:space-y-lg flex-1">
          <Suspense fallback={<StatsGridSkeleton />}>
            <StatsGrid />
          </Suspense>

          <Suspense fallback={<RecentPostsSkeleton />}>
            <RecentPosts />
          </Suspense>
        </main>
      )}
    </DashboardShell>
  );
}
