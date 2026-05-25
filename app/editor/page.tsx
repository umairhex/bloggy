import React from 'react';
import DashboardShell from '@/app/_components/DashboardShell';
import EditorForm from './_components/EditorForm';

export const metadata = {
  title: 'Editor',
  description: 'Write and publish blog posts in the Bloggy content workspace.',
};

export default function EditorPage() {
  return (
    <DashboardShell>
      <div className="flex h-full flex-1 flex-col overflow-hidden min-h-0">
        <EditorForm />
      </div>
    </DashboardShell>
  );
}
