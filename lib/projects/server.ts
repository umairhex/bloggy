import "server-only";

import { Project as ProjectType } from "@/types";
import { connectToDB } from "@/lib/db";
import Project from "@/models/Project.model";

type ProjectDocument = {
  id: string;
  name: string;
  description?: string | null;
  mongodbUri: string;
  category?: ProjectType["category"];
  isArchived?: boolean;
  connectionStatus?: ProjectType["connectionStatus"];
  createdAt: Date | string;
};

export function formatProject(project: ProjectDocument): ProjectType {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? "",
    mongodbUri: project.mongodbUri,
    category: project.category,
    isArchived: project.isArchived,
    connectionStatus: project.connectionStatus,
    createdAt: new Date(project.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

export async function getProjects() {
  await connectToDB();

  const projects = await Project.find().sort({ createdAt: -1 }).lean<ProjectDocument[]>();

  return projects.map(formatProject);
}
