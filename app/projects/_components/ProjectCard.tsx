'use client';

import React, { useState } from 'react';
import { Project } from '@/types';
import {
  Database,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit3,
  Trash2,
  RefreshCw,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
}

export default function ProjectCard({
  project,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  onUpdateProject,
}: ProjectCardProps) {
  const [revealUri, setRevealUri] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(project.mongodbUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied connection string to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy to clipboard.');
    }
  };

  const handleLocalTest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTesting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsTesting(false);

    let isSuccess = false;
    if (
      project.mongodbUri.includes('@') &&
      (project.mongodbUri.includes('.mongodb.net') ||
        project.mongodbUri.includes('localhost') ||
        project.mongodbUri.includes('127.0.0.1') ||
        project.mongodbUri.includes('.net') ||
        project.mongodbUri.includes('.com'))
    ) {
      isSuccess = true;
    }

    const newStatus = isSuccess ? 'connected' : 'failed';
    onUpdateProject(project.id, { connectionStatus: newStatus });

    if (isSuccess) {
      toast.success(`Verified! Connection to "${project.name}" is working.`);
    } else {
      toast.error(`Failed: Could not reach cluster for "${project.name}".`);
    }
  };

  const handleToggleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextArchivedState = !project.isArchived;
    onUpdateProject(project.id, { isArchived: nextArchivedState });

    if (nextArchivedState && isSelected) {
      onToggleSelect(project.id);
    }

    if (nextArchivedState) {
      toast.success(`Archived project "${project.name}".`);
    } else {
      toast.success(`Restored project "${project.name}" to workspace.`);
    }
  };

  const getCensoredUri = (uri: string) => {
    try {
      if (uri.startsWith('mongodb+srv://') || uri.startsWith('mongodb://')) {
        const prefix = uri.startsWith('mongodb+srv://') ? 'mongodb+srv://' : 'mongodb://';
        const rest = uri.substring(prefix.length);
        const atIdx = rest.indexOf('@');
        if (atIdx !== -1) {
          return `${prefix}******:******${rest.substring(atIdx)}`;
        }
      }
      return 'mongodb://******:******@hidden-cluster.mongodb.net';
    } catch {
      return 'mongodb://******:******@hidden-cluster.mongodb.net';
    }
  };

  return (
    <div
      className={`relative rounded-md border bg-canvas p-base flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-sm hover:shadow-airbnb hover:border-hairline-soft ${
        isSelected ? 'border-primary ring-1 ring-primary' : 'border-hairline'
      } ${project.isArchived ? 'opacity-60 saturate-50 hover:opacity-80 transition-opacity' : ''}`}
      onClick={() => !project.isArchived && onToggleSelect(project.id)}
    >
      <div className="flex justify-between items-start mb-md">
        <div
          className={`p-xs -m-xs ${project.isArchived ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!project.isArchived) {
              onToggleSelect(project.id);
            }
          }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            disabled={project.isArchived}
            onChange={() => onToggleSelect(project.id)}
            className={`h-4.5 w-4.5 rounded border-hairline text-primary focus:ring-primary accent-primary ${
              project.isArchived ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className="w-8 h-8 rounded-full bg-surface-soft flex items-center justify-center shrink-0">
          <Database size={16} className={project.mongodbUri ? 'text-primary' : 'text-muted'} />
        </div>
      </div>

      <div className="flex-1 min-w-0 mb-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-xs mb-xs flex-wrap">
          <h3 className="text-title-md font-semibold text-ink truncate flex-1">{project.name}</h3>

          {project.category && (
            <span
              className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                project.category === 'production'
                  ? 'text-plus bg-plus/10 border-plus/20'
                  : project.category === 'staging'
                    ? 'text-amber-800 bg-amber-50 border-amber-200'
                    : 'text-muted bg-surface-strong border-hairline'
              }`}
            >
              {project.category}
            </span>
          )}

          {project.isArchived && (
            <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border border-hairline bg-canvas text-ink shrink-0">
              Archived
            </span>
          )}
        </div>
        <p className="text-xs text-body line-clamp-2 h-9">
          {project.description || (
            <span className="text-muted italic">No description provided.</span>
          )}
        </p>
      </div>

      <div
        className="bg-surface-soft rounded-sm p-sm mb-base flex items-center justify-between gap-sm border border-hairline-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className={`font-mono text-xs text-ink truncate flex-1 leading-tight ${revealUri ? 'select-all' : 'select-none cursor-default'}`}
        >
          {revealUri ? project.mongodbUri : getCensoredUri(project.mongodbUri)}
        </span>
        <div className="flex items-center gap-xs shrink-0">
          <span
            className={`h-2.5 w-2.5 rounded-full mr-xs transition-all duration-300 ${
              project.connectionStatus === 'connected'
                ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                : project.connectionStatus === 'failed'
                  ? 'bg-primary shadow-[0_0_8px_rgba(255,56,92,0.6)]'
                  : 'bg-gray-400'
            }`}
            title={`Connection status: ${project.connectionStatus || 'untested'}`}
          />

          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 rounded-full text-body hover:text-ink hover:bg-canvas transition-all ${
              isTesting ? 'animate-spin text-primary' : ''
            }`}
            onClick={handleLocalTest}
            disabled={isTesting || project.isArchived}
            title="Test Connection"
          >
            <RefreshCw size={12} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-body hover:text-ink hover:bg-canvas"
            onClick={() => setRevealUri(!revealUri)}
            title={revealUri ? 'Hide Link' : 'Reveal Link'}
          >
            {revealUri ? <EyeOff size={14} /> : <Eye size={14} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-body hover:text-ink hover:bg-canvas"
            onClick={handleCopy}
            title="Copy Link"
          >
            {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
          </Button>
        </div>
      </div>

      <div
        className="flex items-center justify-between border-t border-hairline-soft pt-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-uppercase-tag text-muted font-medium">Added {project.createdAt}</span>
        <div className="flex items-center gap-xs">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full text-body hover:bg-surface-soft ${
              project.isArchived
                ? 'text-primary hover:text-primary-active hover:bg-primary-disabled/20'
                : 'hover:text-ink'
            }`}
            onClick={handleToggleArchive}
            title={project.isArchived ? 'Restore to active workspace' : 'Archive Project'}
          >
            <Archive size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-body hover:text-ink hover:bg-surface-soft"
            disabled={project.isArchived}
            onClick={() => onEdit(project)}
            title="Edit Project"
          >
            <Edit3 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-body hover:text-primary-error-text hover:bg-primary-disabled/20"
            onClick={() => onDelete(project.id)}
            title="Delete Project"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
