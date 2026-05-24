import { queryOptions } from "@tanstack/react-query";
import { Project } from "@/types";
import { ProjectFormValues } from "@/lib/validations/project";
import { ApiError } from "@/lib/api-error";

type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok) {
    throw new ApiError(
      payload.error || "Project request failed.",
      response.status
    );
  }

  return payload.data as T;
}

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: () => [...projectKeys.lists()] as const,
};

export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch("/api/projects");

  return parseResponse<Project[]>(response);
}

export const projectsQueryOptions = () =>
  queryOptions({
    queryKey: projectKeys.list(),
    queryFn: fetchProjects,
    staleTime: 30_000,
  });

export async function createProject(data: ProjectFormValues): Promise<Project> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return parseResponse<Project>(response);
}

export async function updateProject({
  id,
  updates,
}: {
  id: string;
  updates: Partial<ProjectFormValues> & Pick<Partial<Project>, "isArchived" | "connectionStatus">;
}): Promise<Project[]> {
  const response = await fetch("/api/projects", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, updates }),
  });

  return parseResponse<Project[]>(response);
}

export async function bulkUpdateProjects({
  ids,
  updates,
}: {
  ids: string[];
  updates: Partial<ProjectFormValues> & Pick<Partial<Project>, "isArchived" | "connectionStatus">;
}): Promise<Project[]> {
  const response = await fetch("/api/projects", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, updates }),
  });

  return parseResponse<Project[]>(response);
}

export async function deleteProjects(ids: string[]): Promise<string[]> {
  const response = await fetch("/api/projects", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });

  return parseResponse<string[]>(response);
}
