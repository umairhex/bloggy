'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { Plus, Settings, SlidersHorizontal } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import DBConfigModal from './DBConfigModal';
import OnboardingTour from './OnboardingTour';

export default function HeaderActions() {
  const pathname = usePathname();
  const router = useRouter();
  const isProjectsPage = pathname?.startsWith('/projects');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  React.useEffect(() => {
    const handleOpenModal = () => {
      setIsConfigModalOpen(true);
    };

    window.addEventListener('open-db-config-modal', handleOpenModal);
    return () => {
      window.removeEventListener('open-db-config-modal', handleOpenModal);
    };
  }, []);

  const handleNewPost = () => {
    router.push('/editor');
  };

  const isEditorPage = pathname?.startsWith('/editor');
  const hideNewPostButton = isProjectsPage || isEditorPage;

  return (
    <>
      <div className="flex items-center gap-xs sm:gap-md">
        <ModeToggle />
        {isEditorPage && (
          <Button
            variant="ghost"
            size="icon"
            id="editor-sidebar-toggle"
            className="h-9 w-9 text-body hover:text-ink cursor-pointer"
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-editor-sidebar'))}
            aria-label="Toggle post settings"
            title="Post settings"
          >
            <SlidersHorizontal size={18} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          id="db-config-button"
          className="h-9 w-9 text-body hover:text-ink"
          onClick={() => setIsConfigModalOpen(true)}
          aria-label="Database configuration"
        >
          <Settings size={18} />
        </Button>
        {!hideNewPostButton && (
          <Button
            size="sm"
            id="new-post-button"
            className="h-9 gap-sm text-white cursor-pointer px-3 sm:px-4"
            onClick={handleNewPost}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New post</span>
          </Button>
        )}
      </div>

      <DBConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConfigured={() => router.refresh()}
      />

      <OnboardingTour />
    </>
  );
}
