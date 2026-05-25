import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import DashboardShell from '../_components/DashboardShell';
import ProjectsManager from './_components/ProjectsManager';
import { getQueryClient } from '@/lib/get-query-client';
import { projectsQueryOptions } from '@/lib/api/projects';
import { getProjects } from '@/lib/projects/server';

export const metadata = {
  title: 'Projects',
  description: 'Manage your content workspace projects and databases.',
};

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    ...projectsQueryOptions(),
    queryFn: getProjects,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardShell>
        <main className="space-y-md overflow-y-auto p-md sm:p-lg md:space-y-lg">
          <ProjectsManager />
        </main>
      </DashboardShell>
    </HydrationBoundary>
  );
}
