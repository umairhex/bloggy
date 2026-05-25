'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  X,
  Activity,
  Database,
  ShieldCheck,
  Edit3,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { saveDBConfig, validateMongoDBURI, getDBConfig, clearDBConfig } from '@/lib/config/storage';
import { toast } from 'sonner';

interface DBConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigured: () => void;
}

export default function DBConfigModal({ isOpen, onClose, onConfigured }: DBConfigModalProps) {
  const [mongoUri, setMongoUri] = useState('');
  const [showUri, setShowUri] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open && !mongoUri && !isEditing) {
      const existing = getDBConfig();
      if (existing) {
        setMongoUri(existing);
      }
    }
    if (!open) {
      onClose();
    }
  };

  const handleValidateAndSave = async () => {
    setError(null);

    const validation = validateMongoDBURI(mongoUri);
    if (!validation.valid) {
      setError(validation.error || 'Invalid MongoDB URI');
      return;
    }

    setIsValidating(true);
    try {
      saveDBConfig(mongoUri);
      toast.success('MongoDB configuration saved successfully!');
      onConfigured();
      setMongoUri('');
      setIsVerified(false);
      setIsEditing(false);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save configuration';
      setError(message);
      toast.error(message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleTestConnection = async () => {
    setError(null);
    setTestResult(null);
    setIsVerified(false);

    const validation = validateMongoDBURI(mongoUri);
    if (!validation.valid) {
      setTestResult({ success: false, message: validation.error || 'Invalid MongoDB URI' });
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/config/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mongoUri }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate MongoDB connection');
      }

      setTestResult({ success: true, message: 'Connection verified successfully!' });
      setIsVerified(true);
      toast.success('MongoDB connection verified successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to validate connection';
      setTestResult({ success: false, message });
      toast.error(message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    if (
      confirm(
        'Are you sure you want to remove your MongoDB configuration? You will need to add it again to use Bloggy.'
      )
    ) {
      clearDBConfig();
      setMongoUri('');
      setIsEditing(false);
      toast.success('Configuration removed');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const hasConfig = getDBConfig() && !isEditing;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="border-hairline bg-canvas sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-ink">
            {hasConfig ? 'MongoDB Configuration' : 'Configure MongoDB'}
          </DialogTitle>
          <DialogDescription className="text-body">
            {hasConfig
              ? 'Your MongoDB connection is configured and stored locally on your device.'
              : 'Connect to your own MongoDB instance. Your connection string stays on your device only.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-base">
          <div className="rounded-md bg-surface-soft p-md border border-hairline-soft flex gap-md items-start">
            <ShieldCheck size={16} className="text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-body leading-relaxed">
              <strong>Privacy First:</strong> Your MongoDB connection string is stored only in your
              browser&apos;s localStorage. Bloggy never sends, stores, or accesses your
              configuration on any server.
            </p>
          </div>

          {!hasConfig || isEditing ? (
            <div className="space-y-xs">
              <Label htmlFor="mongo-uri" className="text-xs font-medium text-ink">
                MongoDB URI
              </Label>
              <div className="relative">
                <input
                  id="mongo-uri"
                  type={showUri ? 'text' : 'password'}
                  value={mongoUri}
                  onChange={(e) => {
                    setMongoUri(e.target.value);
                    setError(null);
                    setTestResult(null);
                    setIsVerified(false);
                  }}
                  placeholder="mongodb+srv://user:password@cluster.mongodb.net/dbname"
                  className="w-full rounded-sm border border-hairline bg-surface-card px-3 py-2 pr-10 text-sm placeholder:text-muted-soft focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowUri(!showUri)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                  aria-label="Toggle URI visibility"
                >
                  {showUri ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-muted">
                Use your own MongoDB instance. Local URIs work only when Bloggy runs locally;
                hosted deployments require a publicly reachable MongoDB host or Atlas.
              </p>
            </div>
          ) : (
            <div className="space-y-xs">
              <Label className="text-xs font-medium text-ink">Status</Label>
              <div className="flex items-center gap-md rounded-sm bg-surface-strong/50 p-md border border-hairline">
                <div className="flex items-center gap-xs">
                  <Check size={16} className="text-primary" />
                  <span className="text-sm text-ink font-medium">Configured</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-md rounded-sm bg-red-50 p-md border border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <AlertCircle size={16} className="text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
            </div>
          )}

          {testResult && (
            <div
              className={`flex items-start gap-md rounded-sm p-md border ${
                testResult.success
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-700 dark:text-green-400'
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 text-red-700 dark:text-red-400'
              }`}
            >
              {testResult.success ? (
                <Check size={16} className="text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-xs justify-end">
          {hasConfig && !isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="border-hairline text-ink gap-md"
              >
                <Trash2 size={14} />
                Remove
              </Button>
              <Button
                size="sm"
                onClick={handleEdit}
                className="bg-primary hover:bg-primary-active text-on-primary gap-md"
              >
                <Edit3 size={14} />
                Update
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-hairline text-ink disabled:bg-surface-soft disabled:text-muted-soft disabled:opacity-100 gap-md"
                disabled={isValidating || isTesting}
              >
                <X size={14} />
                {hasConfig ? 'Close' : 'Cancel'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={!mongoUri.trim() || isValidating || isTesting}
                className="border-hairline text-ink disabled:bg-surface-soft disabled:text-muted-soft disabled:opacity-100 gap-md"
              >
                <Activity size={14} className={isTesting ? 'animate-spin' : ''} />
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button
                size="sm"
                onClick={handleValidateAndSave}
                disabled={!isVerified || isValidating || isTesting}
                className="bg-primary hover:bg-primary-active text-on-primary disabled:bg-surface-strong disabled:text-muted-soft disabled:opacity-100 gap-md"
              >
                <Database size={14} />
                {isValidating ? 'Saving...' : 'Save & Connect'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
