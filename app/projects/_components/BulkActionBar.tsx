'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { motion } from 'motion/react';
import { mongodbUriSchema } from '@/lib/validations/project';

interface BulkActionBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkUpdate: (newUri: string) => void;
  onClearSelection: () => void;
}

export default function BulkActionBar({
  selectedCount,
  onBulkDelete,
  onBulkUpdate,
  onClearSelection,
}: BulkActionBarProps) {
  const [showBulkEditForm, setShowBulkEditForm] = useState(false);
  const [bulkUri, setBulkUri] = useState('');
  const [error, setError] = useState('');

  const handleBulkUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedUri = mongodbUriSchema.safeParse(bulkUri);

    if (!parsedUri.success) {
      setError(parsedUri.error.flatten().formErrors[0] || 'Invalid MongoDB URI.');
      return;
    }
    onBulkUpdate(parsedUri.data);
    setBulkUri('');
    setError('');
    setShowBulkEditForm(false);
  };

  return (
    <motion.div
      initial={{ y: 80, x: '-50%', opacity: 0 }}
      animate={{ y: 0, x: '-50%', opacity: 1 }}
      exit={{ y: 80, x: '-50%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="fixed bottom-lg left-1/2 z-40 bg-surface-card text-ink rounded-full px-lg py-sm shadow-airbnb flex items-center gap-lg border border-hairline"
    >
      <div className="flex items-center gap-md">
        <span className="bg-primary text-on-primary h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold">
          {selectedCount}
        </span>
        <span className="text-sm font-medium">Projects selected</span>
      </div>

      <div className="h-6 w-px bg-hairline" />

      <div className="flex items-center gap-md">
        {showBulkEditForm ? (
          <form
            onSubmit={handleBulkUpdateSubmit}
            className="flex items-center gap-xs animate-fade-in"
          >
            <input
              type="text"
              value={bulkUri}
              onChange={(e) => setBulkUri(e.target.value)}
              placeholder="Bulk connection string..."
              className="px-md py-xs bg-canvas text-ink text-xs font-mono rounded-full border border-hairline outline-hidden h-8 w-60 focus:ring-1 focus:ring-primary focus:border-primary"
            />
            {error && (
              <span className="absolute bottom-12 bg-primary-error-text text-on-primary text-[10px] py-xxs px-sm rounded-sm font-sans shadow-sm">
                {error}
              </span>
            )}
            <Button
              type="submit"
              className="h-8 px-md bg-primary hover:bg-primary-active text-on-primary text-xs font-semibold rounded-full shadow-xs"
            >
              Apply
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-8 w-8 p-0 rounded-full hover:bg-hairline/50 text-ink cursor-pointer"
              onClick={() => {
                setShowBulkEditForm(false);
                setError('');
              }}
            >
              X
            </Button>
          </form>
        ) : (
          <>
            <Button
              variant="ghost"
              className="h-9 gap-sm text-sm font-semibold hover:bg-hairline/50 text-ink rounded-full px-md cursor-pointer"
              onClick={() => setShowBulkEditForm(true)}
            >
              <Edit size={14} className="text-primary" />
              Bulk Edit Connection
            </Button>
            <Button
              variant="ghost"
              className="h-9 gap-sm text-sm font-semibold text-primary-error-text hover:bg-primary-error-text/10 rounded-full px-md cursor-pointer"
              onClick={onBulkDelete}
            >
              <Trash2 size={14} />
              Bulk Delete
            </Button>
          </>
        )}

        {!showBulkEditForm && (
          <>
            <div className="h-6 w-px bg-hairline" />
            <Button
              variant="outline"
              className="h-8 w-8 p-0 rounded-full text-muted hover:text-ink hover:bg-hairline/50 cursor-pointer"
              onClick={onClearSelection}
              title="Clear Selection"
            >
              X
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}
