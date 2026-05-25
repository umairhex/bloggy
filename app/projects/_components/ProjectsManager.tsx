'use client';

import React, { useState } from 'react';
import { Project } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ProjectCard from './ProjectCard';
import ProjectFormModal from './ProjectFormModal';
import BulkActionBar from './BulkActionBar';
import ProjectsSkeleton from './ProjectsSkeleton';
import ProjectControlBar from './ProjectControlBar';
import ProjectEmptyState from './ProjectEmptyState';
import {
  bulkUpdateProjects,
  createProject,
  deleteProjects,
  projectKeys,
  projectsQueryOptions,
  updateProject,
} from '@/lib/api/projects';
import { ProjectFormValues } from '@/lib/validations/project';

export default function ProjectsManager() {
  const queryClient = useQueryClient();
  const {
    data: projects = [],
    error,
    isError,
    isFetching,
    isPending,
    refetch,
  } = useQuery(projectsQueryOptions());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    showCancel: boolean;
    onAction: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionLabel: '',
    showCancel: true,
    onAction: () => {},
  });

  const updateProjectsCache = (updater: (projects: Project[]) => Project[]) => {
    queryClient.setQueryData<Project[]>(projectKeys.list(), (current = []) => updater(current));
  };

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      updateProjectsCache((current) => [project, ...current]);
      toast.success(`Added project "${project.name}" to workspace.`);
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Failed to create project.'
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: updateProject,
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.list() });
      const snapshot = queryClient.getQueryData<Project[]>(projectKeys.list());

      updateProjectsCache((current) =>
        current.map((project) => (project.id === id ? { ...project, ...updates } : project))
      );

      return { snapshot };
    },
    onError: (mutationError, _variables, context) => {
      queryClient.setQueryData(projectKeys.list(), context?.snapshot);
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Failed to update project.'
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: bulkUpdateProjects,
    onMutate: async ({ ids, updates }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.list() });
      const snapshot = queryClient.getQueryData<Project[]>(projectKeys.list());

      updateProjectsCache((current) =>
        current.map((project) => (ids.includes(project.id) ? { ...project, ...updates } : project))
      );

      return { snapshot };
    },
    onError: (mutationError, _variables, context) => {
      queryClient.setQueryData(projectKeys.list(), context?.snapshot);
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Failed to bulk update projects.'
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });

  const deleteProjectsMutation = useMutation({
    mutationFn: deleteProjects,
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.list() });
      const snapshot = queryClient.getQueryData<Project[]>(projectKeys.list());

      updateProjectsCache((current) => current.filter((project) => !ids.includes(project.id)));

      return { snapshot };
    },
    onError: (mutationError, _variables, context) => {
      queryClient.setQueryData(projectKeys.list(), context?.snapshot);
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Failed to delete projects.'
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    updateProjectMutation.mutate({ id, updates });
  };

  const handleModalSubmit = (data: ProjectFormValues) => {
    if (editingProject) {
      updateProjectMutation.mutate(
        {
          id: editingProject.id,
          updates: data,
        },
        {
          onSuccess: () => {
            toast.success(`Updated project "${data.name}" details.`);
          },
        }
      );
      setEditingProject(null);
      return;
    }

    createProjectMutation.mutate(data);
  };

  const handleDeleteProject = (id: string) => {
    const projectToDelete = projects.find((project) => project.id === id);
    setAlertDialog({
      isOpen: true,
      title: 'Delete Project?',
      description: `Are you sure you want to permanently delete "${
        projectToDelete?.name || 'this project'
      }"? This action cannot be undone.`,
      actionLabel: 'Delete',
      showCancel: true,
      onAction: () => {
        deleteProjectsMutation.mutate([id], {
          onSuccess: () => {
            setSelectedIds((prev) => prev.filter((item) => item !== id));
            toast.success(`Deleted project "${projectToDelete?.name || 'Project'}".`);
          },
        });
      },
    });
  };

  const handleBulkDelete = () => {
    const idsToDelete = [...selectedIds];
    const count = idsToDelete.length;
    setAlertDialog({
      isOpen: true,
      title: 'Delete Multiple Projects?',
      description: `Are you sure you want to permanently delete the ${count} selected projects? This action cannot be undone and will erase all associated configurations.`,
      actionLabel: 'Delete Projects',
      showCancel: true,
      onAction: () => {
        deleteProjectsMutation.mutate(idsToDelete, {
          onSuccess: () => {
            setSelectedIds([]);
            toast.success(`Permanently deleted ${count} projects.`);
          },
        });
      },
    });
  };

  const handleBulkUpdate = (newUri: string) => {
    const idsToUpdate = [...selectedIds];
    const count = idsToUpdate.length;

    bulkUpdateMutation.mutate(
      { ids: idsToUpdate, updates: { mongodbUri: newUri } },
      {
        onSuccess: () => {
          setSelectedIds([]);
          toast.success(`Bulk updated connection string for ${count} projects.`);
          setAlertDialog({
            isOpen: true,
            title: 'Connection Details Updated',
            description: `Successfully updated the MongoDB connection string for ${count} projects.`,
            actionLabel: 'Okay',
            showCancel: false,
            onAction: () => {},
          });
        },
      }
    );
  };

  const handleRefreshProjects = () => {
    refetch();
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSortedProjects = () => {
    const list = [...filteredProjects];
    if (sortBy === 'name-asc') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'name-desc') {
      return list.sort((a, b) => b.name.localeCompare(a.name));
    }
    if (sortBy === 'oldest') {
      return list.reverse();
    }
    return list;
  };
  const sortedProjects = getSortedProjects();

  if (isPending) {
    return <ProjectsSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-md border border-hairline bg-canvas p-lg text-sm text-body">
        {error instanceof Error ? error.message : 'Failed to load projects from the database.'}
      </div>
    );
  }

  return (
    <div className="space-y-lg relative min-h-125">
      <div className="flex flex-col space-y-xs pb-md border-b border-hairline">
        <h1 className="font-serif text-display-md font-bold text-ink">Workspace Projects</h1>
        <p className="text-sm text-body">
          Manage database configuration mappings, connection endpoints, and environment variables.
        </p>
      </div>

      <ProjectControlBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onRefreshProjects={handleRefreshProjects}
        isRefreshing={isFetching}
        onNewProject={() => {
          setEditingProject(null);
          setIsModalOpen(true);
        }}
      />

      {sortedProjects.length > 0 ? (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md ${selectedIds.length > 0 ? 'pb-32' : 'pb-xxl'}`}
        >
          {sortedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isSelected={selectedIds.includes(project.id)}
              onToggleSelect={handleToggleSelect}
              onEdit={(projectToEdit) => {
                setEditingProject(projectToEdit);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteProject}
              onUpdateProject={handleUpdateProject}
            />
          ))}
        </div>
      ) : (
        <ProjectEmptyState
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNewProject={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
        />
      )}

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <BulkActionBar
            selectedCount={selectedIds.length}
            onBulkDelete={handleBulkDelete}
            onBulkUpdate={handleBulkUpdate}
            onClearSelection={handleClearSelection}
          />
        )}
      </AnimatePresence>

      <ProjectFormModal
        key={editingProject ? `edit-${editingProject.id}` : 'create'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleModalSubmit}
        project={editingProject}
      />

      <AlertDialog
        open={alertDialog.isOpen}
        onOpenChange={(open) => setAlertDialog((prev) => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent className="bg-canvas border-hairline shadow-airbnb rounded-md max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-ink font-semibold tracking-normal normal-case">
              {alertDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body text-xs mt-2">
              {alertDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            {alertDialog.showCancel && (
              <AlertDialogCancel className="rounded-sm h-10 border-hairline text-ink hover:bg-surface-soft cursor-pointer">
                Cancel
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              className="bg-primary hover:bg-primary-active text-on-primary rounded-sm h-10 px-6 cursor-pointer font-medium"
              onClick={() => {
                alertDialog.onAction();
                setAlertDialog((prev) => ({ ...prev, isOpen: false }));
              }}
            >
              {alertDialog.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
