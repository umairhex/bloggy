import React from "react";
import DashboardShell from "@/app/_components/DashboardShell";
import EditorForm from "./_components/EditorForm";

export const metadata = {
  title: "Editor — Bloggy",
  description: "Write and publish blog posts in the Bloggy content workspace.",
};

export default function EditorPage() {
  return (
  <DashboardShell>
      {/* Add flex-col and min-h-0 here. 
        If DashboardShell doesn't provide a strict height, this container will 
        still try to grow. 
      */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-full">
        <EditorForm />
      </div>
    </DashboardShell>
  );
}