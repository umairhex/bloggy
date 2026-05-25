import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import DashboardShell from '../_components/DashboardShell';
import PublishingManager from './_components/PublishingManager';
import { getQueryClient } from '@/lib/get-query-client';
import { postsQueryOptions } from '@/lib/api/posts';
import { getBlogPosts } from '@/lib/posts/server';

export const metadata = {
  title: 'Publishing',
  description: 'Review, schedule, and publish workspace content.',
};

export const dynamic = 'force-dynamic';

export default async function PublishingPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    ...postsQueryOptions(),
    queryFn: getBlogPosts,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardShell>
        <main className="h-full w-full overflow-y-auto p-base md:p-lg lg:p-xl">
          <PublishingManager />
        </main>
      </DashboardShell>
    </HydrationBoundary>
  );
}
