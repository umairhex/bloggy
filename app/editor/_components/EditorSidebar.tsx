'use client';

import React, { useState } from 'react';
import { Project, PostStatus } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Database, X, ImageIcon, Search, Tag } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditorSidebarProps {
  status: PostStatus;
  setStatus: (v: PostStatus) => void;
  publishDate: string;
  setPublishDate: (v: string) => void;
  tags: string[];
  setTags: (v: string[]) => void;
  excerpt: string;
  setExcerpt: (v: string) => void;
  featuredImageUrl: string;
  setFeaturedImageUrl: (v: string) => void;
  seoTitle: string;
  setSeoTitle: (v: string) => void;
  seoDescription: string;
  setSeoDescription: (v: string) => void;
  selectedProjectId: string;
  setSelectedProjectId: (v: string) => void;
  projects: Project[];
  onClose?: () => void;
}

export default function EditorSidebar({
  status,
  setStatus,
  publishDate,
  setPublishDate,
  tags,
  setTags,
  excerpt,
  setExcerpt,
  featuredImageUrl,
  setFeaturedImageUrl,
  seoTitle,
  setSeoTitle,
  seoDescription,
  setSeoDescription,
  selectedProjectId,
  setSelectedProjectId,
  projects,
  onClose,
}: EditorSidebarProps) {
  const [tagInput, setTagInput] = useState('');

  console.log('EditorSidebar rendering with props:', {
    tags,
    excerpt,
    featuredImageUrl,
    seoTitle,
    seoDescription
  });

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.includes(',')) {
      const parts = value.split(',').map((p) => p.trim()).filter(Boolean);
      const uniqueParts = Array.from(new Set(parts));
      const newTags = uniqueParts.filter((t) => !tags.includes(t));
      if (newTags.length > 0) {
        setTags([...tags, ...newTags]);
      }
      setTagInput('');
    } else {
      setTagInput(value);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const activeProjects = projects.filter((p) => !p.isArchived);

  return (
    <aside className="w-full h-full bg-surface-soft flex flex-col overflow-y-auto">
      {onClose && (
        <div className="flex items-center justify-between p-base border-b border-hairline md:hidden shrink-0">
          <span className="text-sm font-semibold text-ink">Post settings</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-surface-strong text-body hover:text-ink cursor-pointer"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={16} />
          </Button>
        </div>
      )}
      <section className="p-base border-b border-hairline space-y-base">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Publishing</h3>

          <div className="space-y-xs px-1">
            <Label htmlFor="post-status" className="text-xs font-medium text-body">
              Status
            </Label>
            <Select value={status} onValueChange={(v) => setStatus(v as PostStatus)}>
              <SelectTrigger
                id="post-status"
                className="h-9 px-3 text-sm bg-canvas border-hairline"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === 'Scheduled' && (
            <div className="space-y-xs">
              <Label htmlFor="publish-date" className="text-xs font-medium text-body">
                Publish date
              </Label>
              <Input
                id="publish-date"
                type="datetime-local"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="h-9 text-sm bg-canvas border-hairline"
              />
            </div>
          )}
        </section>

        <Separator className="bg-hairline" />

        <section className="p-base border-b border-hairline space-y-base">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Data Source</h3>

          <div className="space-y-xs">
            <Label htmlFor="project-select" className="text-xs font-medium text-body">
              Linked Project
            </Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger
                id="project-select"
                className="px-3 h-9 text-sm bg-canvas border-hairline"
              >
                <div className="flex items-center gap-xs overflow-hidden">
                  <Database size={13} className="text-primary shrink-0" />
                  <SelectValue placeholder="Select a project…" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-muted italic">No project</span>
                </SelectItem>
                {activeProjects.length === 0 ? (
                  <div className="px-md py-sm text-xs text-muted flex items-center gap-xs">
                    <Search size={12} />
                    No active projects found
                  </div>
                ) : (
                  activeProjects.map((proj) => (
                    <SelectItem key={proj.id} value={proj.id}>
                      <div className="flex items-center gap-xs">
                        <span className="truncate">{proj.name}</span>
                        {proj.category && (
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-px rounded-full border shrink-0 ${
                              proj.category === 'production'
                                ? 'text-plus bg-plus/10 border-plus/20'
                                : proj.category === 'staging'
                                  ? 'text-amber-800 bg-amber-50 border-amber-200'
                                  : 'text-muted bg-surface-strong border-hairline'
                            }`}
                          >
                            {proj.category}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {activeProjects.length === 0 && (
              <p className="text-[10px] text-muted leading-tight">
                Add projects in the{' '}
                <a href="/projects" className="text-primary underline-offset-2 hover:underline">
                  Projects workspace
                </a>{' '}
                to link them here.
              </p>
            )}
          </div>
        </section>

        <Separator className="bg-hairline" />

        <section className="p-base border-b border-hairline space-y-base">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Tags</h3>

          <div className="space-y-xs">
            <Label className="text-xs font-medium text-body">
              <Tag size={11} className="inline mr-xs" />
              Add tags
            </Label>
            <div className="flex flex-wrap gap-xs p-xs border border-hairline rounded-sm bg-canvas min-h-9">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="h-6 gap-xs pr-xs text-xs font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-primary-error-text transition-colors"
                    aria-label={`Remove ${tag}`}
                  >
                    <X size={10} />
                  </button>
                </Badge>
              ))}
              <input
                value={tagInput}
                onChange={handleTagChange}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? 'Type a tag, press Enter…' : 'Add more…'}
                className="px-3 flex-1 min-w-16 text-xs bg-transparent outline-none text-ink placeholder:text-muted-soft"
              />
            </div>
            <p className="text-[10px] text-muted">Press Enter or type/paste comma-separated tags</p>
          </div>
        </section>

        <Separator className="bg-hairline" />

        <section className="p-base border-b border-hairline space-y-base">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Excerpt</h3>

          <div className="space-y-xs">
            <Label htmlFor="post-excerpt" className="text-xs font-medium text-body">
              Post Excerpt
            </Label>
            <Textarea
              id="post-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary (defaults to auto-generated from body)…"
              className="text-xs bg-canvas border-hairline resize-none h-20 px-3 py-2 leading-relaxed"
              maxLength={300}
            />
            <p className="text-[10px] text-muted text-right">{excerpt.length}/300</p>
          </div>
        </section>

        <Separator className="bg-hairline" />

        <section className="p-base border-b border-hairline space-y-base">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Media</h3>

          <div className="space-y-xs">
            <Label htmlFor="featured-image" className="text-xs font-medium text-body">
              <ImageIcon size={11} className="inline mr-xs" />
              Featured Image URL
            </Label>
            <Input
              id="featured-image"
              type="url"
              value={featuredImageUrl}
              onChange={(e) => setFeaturedImageUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg"
              className="h-9 text-xs bg-canvas border-hairline font-mono"
            />
            {featuredImageUrl && (
              <div className="relative rounded-sm overflow-hidden border border-hairline h-24 bg-surface-strong">
                <img
                  src={featuredImageUrl}
                  alt="Featured preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </section>

        <Separator className="bg-hairline" />

        <section className="p-base space-y-base">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">SEO</h3>

          <div className="space-y-xs">
            <Label htmlFor="seo-title" className="text-xs font-medium text-body">
              Meta Title
            </Label>
            <Input
              id="seo-title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Defaults to post title"
              className="h-9 text-xs bg-canvas border-hairline"
              maxLength={70}
            />
            <p className="text-[10px] text-muted text-right">{seoTitle.length}/70</p>
          </div>

          <div className="space-y-xs">
            <Label htmlFor="seo-desc" className="text-xs font-medium text-body">
              Meta Description
            </Label>
            <Textarea
              id="seo-desc"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Brief description for search engines…"
              className="text-xs bg-canvas border-hairline resize-none h-20 px-3"
              maxLength={160}
            />
            <p className="text-[10px] text-muted text-right">{seoDescription.length}/160</p>
          </div>
        </section>

        <div className="mt-auto p-base border-t border-hairline shrink-0">
          <Button
            type="button"
            variant="ghost"
            className="w-full h-8 text-xs text-primary-error-text hover:bg-primary-disabled/20 hover:text-primary-error-text rounded-sm"
          >
            Discard draft
          </Button>
        </div>
    </aside>
  );
}
