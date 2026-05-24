import DashboardShell from "../_components/DashboardShell";
import ProjectsManager from "./_components/ProjectsManager";

export const metadata = {
  title: "Projects — bloggy.",
  description: "Manage your content workspace projects and databases.",
};

export default function ProjectsPage() {
  return (
    <DashboardShell>
      <main className="p-lg space-y-lg">
        <ProjectsManager />
      </main>
    </DashboardShell>
  );
}
