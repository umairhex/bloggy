"use client";

import React, { useState, useEffect } from "react";
import { Project } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import ProjectCard from "./ProjectCard";
import ProjectFormModal from "./ProjectFormModal";
import BulkActionBar from "./BulkActionBar";
import ProjectsSkeleton from "./ProjectsSkeleton";
import ProjectControlBar from "./ProjectControlBar";
import ProjectEmptyState from "./ProjectEmptyState";
import { DEFAULT_PROJECTS } from "./constants";

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const triggerToast = (message: string) => {
    setToast({ show: true, message });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);


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
    title: "",
    description: "",
    actionLabel: "",
    showCancel: true,
    onAction: () => { },
  });


  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem("bloggy_projects");
        if (stored) {
          setProjects(JSON.parse(stored));
        } else {
          setProjects(DEFAULT_PROJECTS);
          localStorage.setItem("bloggy_projects", JSON.stringify(DEFAULT_PROJECTS));
        }
      } catch (e) {
        console.error("Failed to load projects: ", e);
        setProjects(DEFAULT_PROJECTS);
      } finally {
        setLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);


  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    try {
      localStorage.setItem("bloggy_projects", JSON.stringify(updatedProjects));
    } catch (e) {
      console.error("Failed to save projects to localStorage: ", e);
    }
  };


  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };


  const handleClearSelection = () => {
    setSelectedIds([]);
  };


  const handleUpdateProject = (id: string, updates: Partial<Project>) => {
    const updated = projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveProjects(updated);
  };


  const handleModalSubmit = (data: { name: string; description: string; mongodbUri: string; category: "production" | "staging" | "development" }) => {
    if (editingProject) {

      const updated = projects.map((proj) =>
        proj.id === editingProject.id
          ? {
            ...proj,
            name: data.name,
            description: data.description,
            mongodbUri: data.mongodbUri,
            category: data.category,
          }
          : proj
      );
      saveProjects(updated);
      setEditingProject(null);
      triggerToast(`Updated project "${data.name}" details.`);
    } else {

      const newProj: Project = {
        id: `proj-${Date.now()}`,
        name: data.name,
        description: data.description,
        mongodbUri: data.mongodbUri,
        category: data.category,
        isArchived: false,
        connectionStatus: "untested",
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
      saveProjects([newProj, ...projects]);
      triggerToast(`Added project "${data.name}" to workspace.`);
    }
  };


  const handleDeleteProject = (id: string) => {
    const projectToDelete = projects.find((p) => p.id === id);
    setAlertDialog({
      isOpen: true,
      title: "Delete Project?",
      description: `Are you sure you want to permanently delete "${projectToDelete?.name || "this project"}"? This action cannot be undone.`,
      actionLabel: "Delete",
      showCancel: true,
      onAction: () => {
        const updated = projects.filter((p) => p.id !== id);
        saveProjects(updated);
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        triggerToast(`Deleted project "${projectToDelete?.name || "Project"}".`);
      },
    });
  };


  const handleBulkDelete = () => {
    const count = selectedIds.length;
    setAlertDialog({
      isOpen: true,
      title: "Delete Multiple Projects?",
      description: `Are you sure you want to permanently delete the ${count} selected projects? This action cannot be undone and will erase all associated configurations.`,
      actionLabel: "Delete Projects",
      showCancel: true,
      onAction: () => {
        const updated = projects.filter((p) => !selectedIds.includes(p.id));
        saveProjects(updated);
        setSelectedIds([]);
        triggerToast(`Permanently deleted ${count} projects.`);
      },
    });
  };


  const handleBulkUpdate = (newUri: string) => {
    const updated = projects.map((proj) =>
      selectedIds.includes(proj.id) ? { ...proj, mongodbUri: newUri } : proj
    );
    saveProjects(updated);

    const count = selectedIds.length;
    setSelectedIds([]);

    triggerToast(`Bulk updated connection string for ${count} projects.`);


    setAlertDialog({
      isOpen: true,
      title: "Connection Details Updated",
      description: `Successfully updated the MongoDB connection string for ${count} projects.`,
      actionLabel: "Okay",
      showCancel: false,
      onAction: () => { },
    });
  };


  const handleResetDefaults = () => {
    setAlertDialog({
      isOpen: true,
      title: "Reset to Defaults?",
      description: "Are you sure you want to reset your workspace? This will replace all current items with the original sample projects.",
      actionLabel: "Reset",
      showCancel: true,
      onAction: () => {
        saveProjects(DEFAULT_PROJECTS);
        setSelectedIds([]);
      },
    });
  };


  const filteredProjects = projects.filter(
    (proj) =>
      proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.description && proj.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );


  const getSortedProjects = () => {
    const list = [...filteredProjects];
    if (sortBy === "name-asc") {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === "name-desc") {
      return list.sort((a, b) => b.name.localeCompare(a.name));
    }
    if (sortBy === "oldest") {
      return list.reverse();
    }
    return list;
  };
  const sortedProjects = getSortedProjects();

  if (loading) {
    return <ProjectsSkeleton />;
  }

  return (
    <div className="space-y-lg relative min-h-[500px]">
      <div className="flex flex-col space-y-xs pb-md border-b border-hairline">
        <h1 className="font-serif text-display-md font-bold text-ink">
          Workspace Projects
        </h1>
        <p className="text-sm text-body">
          Manage database configuration mappings, connection endpoints, and environment variables.
        </p>
      </div>

      <ProjectControlBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onResetDefaults={handleResetDefaults}
        onNewProject={() => {
          setEditingProject(null);
          setIsModalOpen(true);
        }}
      />

      {sortedProjects.length > 0 ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md ${selectedIds.length > 0 ? "pb-32" : "pb-xxl"}`}>
          {sortedProjects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              isSelected={selectedIds.includes(proj.id)}
              onToggleSelect={handleToggleSelect}
              onEdit={(p) => {
                setEditingProject(p);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteProject}
              onUpdateProject={handleUpdateProject}
              onCopySuccess={triggerToast}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <ProjectEmptyState
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onResetDefaults={handleResetDefaults}
          onNewProject={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
        />
      )}

      <BulkActionBar
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDelete}
        onBulkUpdate={handleBulkUpdate}
        onClearSelection={handleClearSelection}
      />

      <ProjectFormModal
        key={editingProject ? `edit-${editingProject.id}` : "create"}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleModalSubmit}
        project={editingProject}
      />

      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-canvas text-xs font-semibold px-md py-sm rounded-sm shadow-airbnb animate-slide-up flex items-center gap-sm border border-hairline-soft">
          <span>{toast.message}</span>
          <button
            onClick={() => setToast({ show: false, message: "" })}
            className="text-white/60 hover:text-white cursor-pointer ml-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

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
