'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { Plus, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import DBConfigModal from './DBConfigModal';

export default function HeaderActions() {
  const pathname = usePathname();
  const router = useRouter();
  const isProjectsPage = pathname?.startsWith('/projects');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const handleNewPost = () => {
    router.push('/editor');
  };

  return (
    <>
      <div className="flex items-center gap-md">
        <ModeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-body hover:text-ink"
          onClick={() => setIsConfigModalOpen(true)}
          aria-label="Database configuration"
        >
          <Settings size={18} />
        </Button>
        {!isProjectsPage && (
          <Button
            size="sm"
            className="h-9 gap-md text-white cursor-pointer"
            onClick={handleNewPost}
          >
            <Plus size={16} />
            New post
          </Button>
        )}
      </div>

      <DBConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConfigured={() => {}}
      />
    </>
  );
}
