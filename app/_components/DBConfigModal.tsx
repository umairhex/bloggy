'use client';

import React, { useState, useEffect } from 'react';
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
  ImageIcon,
  KeyRound,
  CloudLightning,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  saveDBConfig,
  validateMongoDBURI,
  getDBConfig,
  clearDBConfig,
  saveCloudinaryConfig,
  getCloudinaryConfig,
  isCloudinaryConfigured,
  clearCloudinaryConfig,
} from '@/lib/config/storage';
import { toast } from 'sonner';

interface DBConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigured: () => void;
}

export default function DBConfigModal({ isOpen, onClose, onConfigured }: DBConfigModalProps) {
  const [activeTab, setActiveTab] = useState<'mongodb' | 'cloudinary'>('mongodb');

 
  const [mongoUri, setMongoUri] = useState('');
  const [showUri, setShowUri] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

 
  const [cloudName, setCloudName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isTestingCloudinary, setIsTestingCloudinary] = useState(false);
  const [isValidatingCloudinary, setIsValidatingCloudinary] = useState(false);
  const [cloudinaryError, setCloudinaryError] = useState<string | null>(null);
  const [cloudinaryTestResult, setCloudinaryTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCloudinaryVerified, setIsCloudinaryVerified] = useState(false);
  const [isEditingCloudinary, setIsEditingCloudinary] = useState(false);

  useEffect(() => {
    if (isOpen) {
     
      const existingMongo = getDBConfig();
      if (existingMongo) {
        setMongoUri(existingMongo);
        setIsEditing(false);
      } else {
        setMongoUri('');
        setIsEditing(false);
      }

     
      const existingCloudinary = getCloudinaryConfig();
      if (existingCloudinary) {
        setCloudName(existingCloudinary.cloudName);
        setApiKey(existingCloudinary.apiKey);
        setApiSecret(existingCloudinary.apiSecret);
        setIsEditingCloudinary(false);
      } else {
        setCloudName('');
        setApiKey('');
        setApiSecret('');
        setIsEditingCloudinary(false);
      }

      setError(null);
      setTestResult(null);
      setIsVerified(false);

      setCloudinaryError(null);
      setCloudinaryTestResult(null);
      setIsCloudinaryVerified(false);
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
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
      setIsVerified(false);
      toast.success('Configuration removed');
      onConfigured();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setTestResult(null);
  };

 
  const handleValidateAndSaveCloudinary = async () => {
    setCloudinaryError(null);
    setIsValidatingCloudinary(true);

    try {
      saveCloudinaryConfig(cloudName, apiKey, apiSecret);
      toast.success('Cloudinary configuration saved successfully!');
      try {
        window.dispatchEvent(new CustomEvent('cloudinary-configured'));
      } catch (e) {
        console.error('Failed to dispatch event:', e);
      }
      onConfigured();
      setIsCloudinaryVerified(false);
      setIsEditingCloudinary(false);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save Cloudinary configuration';
      setCloudinaryError(message);
      toast.error(message);
    } finally {
      setIsValidatingCloudinary(false);
    }
  };

  const handleTestCloudinary = async () => {
    setCloudinaryError(null);
    setCloudinaryTestResult(null);
    setIsCloudinaryVerified(false);

    if (!cloudName.trim() || !apiKey.trim() || !apiSecret.trim()) {
      setCloudinaryTestResult({ success: false, message: 'All Cloudinary credentials are required.' });
      return;
    }

    setIsTestingCloudinary(true);
    try {
      const response = await fetch('/api/config/validate-cloudinary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloudName, apiKey, apiSecret }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate Cloudinary connection');
      }

      setCloudinaryTestResult({ success: true, message: 'Cloudinary connection verified successfully!' });
      setIsCloudinaryVerified(true);
      toast.success('Cloudinary connection verified successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to validate Cloudinary connection';
      setCloudinaryTestResult({ success: false, message });
      toast.error(message);
    } finally {
      setIsTestingCloudinary(false);
    }
  };

  const handleClearCloudinary = () => {
    if (
      confirm(
        'Are you sure you want to remove your Cloudinary configuration? Image upload features will be disabled.'
      )
    ) {
      clearCloudinaryConfig();
      setCloudName('');
      setApiKey('');
      setApiSecret('');
      setIsEditingCloudinary(false);
      setIsCloudinaryVerified(false);
      try {
        window.dispatchEvent(new CustomEvent('cloudinary-configured'));
      } catch (e) {
        console.error('Failed to dispatch event:', e);
      }
      toast.success('Cloudinary configuration removed');
      onConfigured();
    }
  };

  const handleEditCloudinary = () => {
    setIsEditingCloudinary(true);
    setCloudinaryError(null);
    setCloudinaryTestResult(null);
  };

  const hasConfig = getDBConfig() && !isEditing;
  const hasCloudinaryConfig = isCloudinaryConfigured() && !isEditingCloudinary;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="border-hairline bg-canvas sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-ink">Workspace Settings</DialogTitle>
          <DialogDescription className="text-body text-xs">
            Link and manage your backend connections. All credentials stay locally on your device.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'mongodb' | 'cloudinary')} className="flex flex-col w-full gap-base">
          <TabsList className="grid w-full grid-cols-2 bg-surface-strong/50 border border-hairline p-0.5 rounded-sm h-9">
            <TabsTrigger value="mongodb" className="text-[10px] font-bold tracking-wider">
              <Database size={11} className="mr-1 inline shrink-0" />
              MongoDB
            </TabsTrigger>
            <TabsTrigger value="cloudinary" className="text-[10px] font-bold tracking-wider">
              <CloudLightning size={11} className="mr-1 inline shrink-0" />
              Cloudinary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mongodb" className="space-y-base pt-xs">
            <div className="rounded-md bg-surface-soft p-md border border-hairline-soft flex gap-md items-start">
              <ShieldCheck size={16} className="text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-body leading-relaxed">
                <strong>Privacy First:</strong> Your MongoDB connection string is stored only in your
                browser&apos;s localStorage. Bloggy never sends or stores your credentials on any external servers.
              </p>
            </div>

            {!hasConfig ? (
              <div className="space-y-xs">
                <Label htmlFor="mongo-uri" className="text-xs font-semibold text-ink">
                  MongoDB Connection URI
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
                    className="w-full rounded-sm border border-hairline bg-surface-card px-3 py-2 pr-10 text-sm placeholder:text-muted-soft focus:border-primary focus:outline-none text-ink"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUri(!showUri)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors cursor-pointer"
                    aria-label="Toggle URI visibility"
                  >
                    {showUri ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-muted leading-tight">
                  Use your own MongoDB instance. Local URIs work only when running locally; hosted deployments require MongoDB Atlas.
                </p>
              </div>
            ) : (
              <div className="space-y-xs">
                <Label className="text-xs font-semibold text-ink">Status</Label>
                <div className="flex items-center gap-md rounded-sm bg-surface-strong/50 p-md border border-hairline">
                  <div className="flex items-center gap-xs">
                    <Check size={16} className="text-primary" />
                    <span className="text-sm text-ink font-semibold">MongoDB Configured</span>
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
          </TabsContent>

          <TabsContent value="cloudinary" className="space-y-base pt-xs">
            <div className="rounded-md bg-surface-soft p-md border border-hairline-soft flex gap-md items-start">
              <ShieldCheck size={16} className="text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-body leading-relaxed">
                <strong>Local Obfuscation:</strong> Cloudinary secrets are saved locally inside browser cookies and storage using Base64 obfuscation to authorize direct image uploads from the Editor.
              </p>
            </div>

            {!hasCloudinaryConfig ? (
              <div className="space-y-sm">
                <div className="space-y-xs">
                  <Label htmlFor="cloud-name" className="text-xs font-semibold text-ink">
                    Cloud Name
                  </Label>
                  <input
                    id="cloud-name"
                    type="text"
                    value={cloudName}
                    onChange={(e) => {
                      setCloudName(e.target.value);
                      setCloudinaryError(null);
                      setCloudinaryTestResult(null);
                      setIsCloudinaryVerified(false);
                    }}
                    placeholder="my-cloudinary-cloud"
                    className="w-full rounded-sm border border-hairline bg-surface-card px-3 py-2 text-sm placeholder:text-muted-soft focus:border-primary focus:outline-none text-ink"
                  />
                </div>

                <div className="space-y-xs">
                  <Label htmlFor="api-key" className="text-xs font-semibold text-ink">
                    API Key
                  </Label>
                  <input
                    id="api-key"
                    type="text"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setCloudinaryError(null);
                      setCloudinaryTestResult(null);
                      setIsCloudinaryVerified(false);
                    }}
                    placeholder="123456789012345"
                    className="w-full rounded-sm border border-hairline bg-surface-card px-3 py-2 text-sm placeholder:text-muted-soft focus:border-primary focus:outline-none text-ink"
                  />
                </div>

                <div className="space-y-xs">
                  <Label htmlFor="api-secret" className="text-xs font-semibold text-ink">
                    API Secret
                  </Label>
                  <div className="relative">
                    <input
                      id="api-secret"
                      type={showSecret ? 'text' : 'password'}
                      value={apiSecret}
                      onChange={(e) => {
                        setApiSecret(e.target.value);
                        setCloudinaryError(null);
                        setCloudinaryTestResult(null);
                        setIsCloudinaryVerified(false);
                      }}
                      placeholder="abcdefghijklmnopqrstuvwxyz12"
                      className="w-full rounded-sm border border-hairline bg-surface-card px-3 py-2 pr-10 text-sm placeholder:text-muted-soft focus:border-primary focus:outline-none text-ink"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors cursor-pointer"
                      aria-label="Toggle secret visibility"
                    >
                      {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-xs">
                <Label className="text-xs font-semibold text-ink">Status</Label>
                <div className="flex items-center gap-md rounded-sm bg-surface-strong/50 p-md border border-hairline">
                  <div className="flex items-center gap-xs">
                    <Check size={16} className="text-primary" />
                    <span className="text-sm text-ink font-semibold">Cloudinary Configured</span>
                  </div>
                </div>
              </div>
            )}

            {cloudinaryError && (
              <div className="flex items-start gap-md rounded-sm bg-red-50 p-md border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                <AlertCircle size={16} className="text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
                <span className="text-sm text-red-700 dark:text-red-400">{cloudinaryError}</span>
              </div>
            )}

            {cloudinaryTestResult && (
              <div
                className={`flex items-start gap-md rounded-sm p-md border ${
                  cloudinaryTestResult.success
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-700 dark:text-green-400'
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 text-red-700 dark:text-red-400'
                }`}
              >
                {cloudinaryTestResult.success ? (
                  <Check size={16} className="text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={16} className="text-red-600 dark:text-red-500 mt-0.5 shrink-0" />
                )}
                <span className="text-sm">{cloudinaryTestResult.message}</span>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-xs justify-end border-t border-hairline pt-md mt-sm">
          {activeTab === 'mongodb' ? (
            hasConfig ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="border-hairline text-ink gap-md cursor-pointer"
                >
                  <Trash2 size={14} />
                  Remove
                </Button>
                <Button
                  size="sm"
                  onClick={handleEdit}
                  className="bg-primary hover:bg-primary-active text-white gap-md cursor-pointer"
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
                  className="border-hairline text-ink disabled:bg-surface-soft disabled:text-muted-soft disabled:opacity-100 gap-md cursor-pointer"
                  disabled={isValidating || isTesting}
                >
                  <X size={14} />
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={!mongoUri.trim() || isValidating || isTesting}
                  className="border-hairline text-ink disabled:bg-surface-soft disabled:text-muted-soft disabled:opacity-100 gap-md cursor-pointer"
                >
                  <Activity size={14} className={isTesting ? 'animate-spin' : ''} />
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleValidateAndSave}
                  disabled={!isVerified || isValidating || isTesting}
                  className="bg-primary hover:bg-primary-active text-white disabled:bg-surface-strong disabled:text-muted-soft disabled:opacity-100 gap-md cursor-pointer"
                >
                  <Database size={14} />
                  {isValidating ? 'Saving...' : 'Save & Connect'}
                </Button>
              </>
            )
          ) : hasCloudinaryConfig ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCloudinary}
                className="border-hairline text-ink gap-md cursor-pointer"
              >
                <Trash2 size={14} />
                Remove
              </Button>
              <Button
                size="sm"
                onClick={handleEditCloudinary}
                className="bg-primary hover:bg-primary-active text-white gap-md cursor-pointer"
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
                className="border-hairline text-ink disabled:bg-surface-soft disabled:text-muted-soft disabled:opacity-100 gap-md cursor-pointer"
                disabled={isValidatingCloudinary || isTestingCloudinary}
              >
                <X size={14} />
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestCloudinary}
                disabled={
                  !cloudName.trim() ||
                  !apiKey.trim() ||
                  !apiSecret.trim() ||
                  isValidatingCloudinary ||
                  isTestingCloudinary
                }
                className="border-hairline text-ink disabled:bg-surface-soft disabled:text-muted-soft disabled:opacity-100 gap-md cursor-pointer"
              >
                <Activity size={14} className={isTestingCloudinary ? 'animate-spin' : ''} />
                {isTestingCloudinary ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button
                size="sm"
                onClick={handleValidateAndSaveCloudinary}
                disabled={!isCloudinaryVerified || isValidatingCloudinary || isTestingCloudinary}
                className="bg-primary hover:bg-primary-active text-white disabled:bg-surface-strong disabled:text-muted-soft disabled:opacity-100 gap-md cursor-pointer"
              >
                <ImageIcon size={14} />
                {isValidatingCloudinary ? 'Saving...' : 'Save & Connect'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
