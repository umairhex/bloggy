import React from 'react';
import DashboardShell from '@/app/_components/DashboardShell';
import EditorForm from './_components/EditorForm';

export const metadata = {
  title: 'Editor — Bloggy',
  description: 'Write and publish blog posts in the Bloggy content workspace.',
};

export default function EditorPage() {
  return (
    <DashboardShell>
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 h-full">
        <EditorForm />
      </div>
    </DashboardShell>
  );
}
