'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarClock, BookOpen, Tag, Database, Globe, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { projectsQueryOptions } from '@/lib/api/projects';
import { BlogPost, PostStatus } from '@/types';

interface PreviewPostData {
  title: string;
  content: string;
  tags?: string[];
  excerpt?: string;
  featuredImageUrl?: string;
  status: PostStatus;
  publishDate?: string;
  projectId?: string;
  projectName?: string;
}

interface PostPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PreviewPostData | BlogPost | null;
}

const statusVariant: Record<PostStatus, 'default' | 'secondary' | 'outline'> = {
  Published: 'default',
  Scheduled: 'secondary',
  Draft: 'outline',
};

function formatDate(value?: string) {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getReadTime(content: string) {
  const words = content
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return Math.max(1, Math.ceil(words.length / 220));
}

export default function PostPreviewModal({ isOpen, onClose, post }: PostPreviewModalProps) {
  const { data: projects = [] } = useQuery(projectsQueryOptions());

  if (!post) return null;

  const resolvedProjectName =
    (post && 'projectName' in post ? post.projectName : undefined) ||
    (post.projectId && projects.find((p) => p.id === post.projectId)?.name) ||
    '';

  const readTime = getReadTime(post.content);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-6xl! max-h-[90vh] overflow-y-auto bg-canvas border-hairline p-0 rounded-md shadow-airbnb flex flex-col gap-0 select-text">
        <DialogHeader className="p-base border-b border-hairline flex flex-row items-center justify-between shrink-0">
          <div className="space-y-xxs">
            <DialogTitle className="text-sm font-bold uppercase tracking-wider text-muted flex items-center gap-xs">
              <Globe size={13} className="text-primary" />
              Content Preview
            </DialogTitle>
            <DialogDescription className="text-[10px] text-muted-soft">
              This is how your post will render in the workspace.
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-surface-soft text-body hover:text-ink flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close preview"
          >
            <X size={16} />
          </button>
        </DialogHeader>

        {post.featuredImageUrl && (
          <div className="relative w-full h-48 md:h-64 overflow-hidden border-b border-hairline bg-surface-strong shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-base left-base right-base text-white">
              <h1 className="font-serif text-xl md:text-3xl font-bold leading-tight line-clamp-2">
                {post.title}
              </h1>
            </div>
          </div>
        )}

        <div className="flex-1 p-base md:p-lg space-y-md overflow-y-auto">
          {!post.featuredImageUrl && (
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink leading-tight">
              {post.title}
            </h1>
          )}

          <div className="flex flex-wrap items-center gap-sm text-xs text-body border-b border-hairline pb-sm shrink-0">
            <Badge variant={statusVariant[post.status]} className="rounded-sm font-semibold">
              {post.status}
            </Badge>

            {resolvedProjectName && (
              <span className="inline-flex items-center gap-xxs px-2 py-0.5 rounded-sm bg-surface-soft border border-hairline font-medium text-ink">
                <Database size={11} className="text-primary" />
                {resolvedProjectName}
              </span>
            )}

            <span className="inline-flex items-center gap-xxs">
              <BookOpen size={11} />
              {readTime} min read
            </span>

            {post.status === 'Scheduled' && post.publishDate && (
              <span className="inline-flex items-center gap-xxs text-primary-error-text">
                <CalendarClock size={11} />
                Publishing: {formatDate(post.publishDate)}
              </span>
            )}

            {post.status === 'Published' && post.publishDate && (
              <span className="inline-flex items-center gap-xxs text-muted">
                <CalendarClock size={11} />
                Published: {formatDate(post.publishDate)}
              </span>
            )}
          </div>

          {post.excerpt && (
            <div className="p-base bg-surface-soft border border-hairline rounded-sm italic text-body text-sm leading-relaxed shrink-0">
              <p className="font-semibold text-ink not-italic text-xs uppercase tracking-wider mb-xs">
                Excerpt Summary
              </p>
              &ldquo;{post.excerpt}&rdquo;
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-xs shrink-0">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-sm text-[11px] font-medium">
                  <Tag size={9} className="mr-xxs" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator className="bg-hairline" />

          <article
            className="prose prose-sm max-w-none text-body leading-roomier pb-lg"
            dangerouslySetInnerHTML={{ __html: post.content || '<p className="italic text-muted">No content written yet.</p>' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
