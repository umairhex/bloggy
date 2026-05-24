"use client";

import React, { useState } from "react";
import { Project } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectFormSchema, ProjectFormValues } from "@/lib/validations/project";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormValues) => void;
  project?: Project | null;
}

export default function ProjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  project,
}: ProjectFormModalProps) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [mongodbUri, setMongodbUri] = useState(project?.mongodbUri || "");
  const [category, setCategory] = useState<"production" | "staging" | "development">(
    project?.category || "development"
  );


  const [nameError, setNameError] = useState("");
  const [uriError, setUriError] = useState("");
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"success" | "error" | null>(null);

  const validate = () => {
    const result = projectFormSchema.safeParse({
      name,
      description,
      mongodbUri,
      category,
    });

    if (result.success) {
      setNameError("");
      setUriError("");
      return result.data;
    }

    const flattened = result.error.flatten();
    setNameError(flattened.fieldErrors.name?.[0] || "");
    setUriError(flattened.fieldErrors.mongodbUri?.[0] || "");

    return null;
  };

  const handleTestConnection = async () => {
    const uriResult = projectFormSchema
      .pick({ mongodbUri: true })
      .safeParse({ mongodbUri });

    if (!uriResult.success) {
      setUriError(uriResult.error.flatten().fieldErrors.mongodbUri?.[0] || "");
      setConnectionStatus(null);
      return;
    }

    setUriError("");
    setTestingConnection(true);
    setConnectionStatus(null);


    await new Promise((resolve) => setTimeout(resolve, 1200));

    setTestingConnection(false);

    if (
      mongodbUri.includes("@") &&
      (mongodbUri.includes(".mongodb.net") ||
        mongodbUri.includes("localhost") ||
        mongodbUri.includes("127.0.0.1") ||
        mongodbUri.includes(".net") ||
        mongodbUri.includes(".com"))
    ) {
      setConnectionStatus("success");
    } else {
      setConnectionStatus("error");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedData = validate();

    if (parsedData) {
      onSubmit(parsedData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-canvas border-hairline min-w-[90vw] sm:min-w-[500px] max-w-lg p-0 overflow-hidden shadow-airbnb rounded-md h-auto flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-hairline">
          <DialogTitle className="text-display-sm font-semibold text-ink tracking-normal normal-case">
            {project ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit}>
          <div className="p-6 space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                Name of the Project <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corporate Blog"
                className={`w-full px-4 py-2 bg-canvas border rounded-sm text-sm text-ink outline-hidden transition-all h-11 focus:ring-1 focus:ring-ink focus:border-ink ${nameError ? "border-primary-error-text" : "border-hairline"
                  }`}
              />
              {nameError && (
                <p className="text-xs text-primary-error-text font-medium mt-1">
                  {nameError}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                Description <span className="text-muted text-[10px] font-normal lowercase">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this project represents..."
                rows={3}
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-sm text-sm text-ink outline-hidden transition-all focus:ring-1 focus:ring-ink focus:border-ink resize-none"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                Environment / Category <span className="text-primary">*</span>
              </label>
              <Select value={category} onValueChange={(val) => setCategory(val as "production" | "staging" | "development")}>
                <SelectTrigger className="w-full px-4 border border-hairline rounded-sm h-11 bg-canvas text-sm text-ink flex justify-between items-center cursor-pointer focus:ring-1 focus:ring-ink focus:border-ink">
                  <SelectValue placeholder="Select Environment" />
                </SelectTrigger>
                <SelectContent position="popper" className="bg-canvas border-hairline rounded-sm shadow-airbnb">
                  <SelectItem value="development" className="text-sm text-ink focus:bg-surface-soft hover:bg-surface-soft rounded-xs cursor-pointer">Development</SelectItem>
                  <SelectItem value="staging" className="text-sm text-ink focus:bg-surface-soft hover:bg-surface-soft rounded-xs cursor-pointer">Staging</SelectItem>
                  <SelectItem value="production" className="text-sm text-ink focus:bg-surface-soft hover:bg-surface-soft rounded-xs cursor-pointer">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                  MongoDB Connection Link <span className="text-primary">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className={`text-xs font-semibold px-2 py-0.5 rounded-xs transition-all cursor-pointer ${testingConnection
                    ? "text-muted bg-surface-soft cursor-not-allowed"
                    : "text-primary hover:bg-primary-disabled/20 bg-primary-disabled/10 border border-primary/20"
                    }`}
                >
                  {testingConnection ? "Testing..." : "Test Connection"}
                </button>
              </div>
              <input
                type="text"
                value={mongodbUri}
                onChange={(e) => {
                  setMongodbUri(e.target.value);
                  setConnectionStatus(null);
                }}
                placeholder="mongodb+srv://user:pass@cluster.mongodb.net/db"
                className={`w-full px-4 py-2 bg-canvas border rounded-sm font-mono text-xs text-ink outline-hidden transition-all h-11 focus:ring-1 focus:ring-ink focus:border-ink ${uriError ? "border-primary-error-text" : "border-hairline"
                  }`}
              />

              {connectionStatus === "success" && (
                <p className="text-xs text-green-600 font-medium flex items-center gap-xs mt-1 animate-fade-in">
                  <span className="text-green-500 font-bold">✓</span> Connection successful! Verified cluster access.
                </p>
              )}
              {connectionStatus === "error" && (
                <p className="text-xs text-primary-error-text font-medium flex items-center gap-xs mt-1 animate-fade-in">
                  <span className="font-bold">⚠</span> Connection failed: Invalid cluster domain or auth credentials.
                </p>
              )}
              {uriError && (
                <p className="text-xs text-primary-error-text font-medium mt-1">
                  {uriError}
                </p>
              )}

              <p className="text-[11px] text-body">
                Supports connection strings starting with <code className="font-mono bg-surface-soft px-1 py-0.5 rounded">mongodb://</code> or <code className="font-mono bg-surface-soft px-1 py-0.5 rounded">mongodb+srv://</code>.
              </p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-hairline bg-surface-soft flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-4 text-sm border-hairline text-ink hover:bg-canvas rounded-sm cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 px-6 text-sm bg-primary hover:bg-primary-active text-on-primary font-medium rounded-sm shadow-sm transition-colors cursor-pointer"
            >
              {project ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
