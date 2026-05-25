'use client';

import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { PostStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, Eye, FileText } from 'lucide-react';
import EditorToolbar from './EditorToolbar';
import EditorSidebar from './EditorSidebar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsQueryOptions } from '@/lib/api/projects';
import { createPost, postKeys, updatePost } from '@/lib/api/posts';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function EditorForm() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [status, setStatus] = useState<PostStatus>('Draft');
  const [publishDate, setPublishDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('none');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [savedPostId, setSavedPostId] = useState<string | null>(null);

  const { data: projects = [] } = useQuery(projectsQueryOptions());
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      setSavedPostId(post.id);
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: 'Start writing your post… use the toolbar above for formatting.',
      }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[420px] px-xl py-lg focus:outline-none text-ink leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    },
  });

  const handleSave = useCallback(
    async (saveStatus?: PostStatus) => {
      if (!title.trim()) {
        toast.error('Please add a title before saving.');
        return;
      }
      if (!editor) {
        toast.error('Editor is still loading. Try again in a moment.');
        return;
      }
      setIsSaving(true);
      const effectiveStatus = saveStatus ?? status;
      const content = editor.getHTML();
      const plainText = editor.getText().trim();
      const postPayload = {
        title,
        slug: slug || slugify(title),
        excerpt: plainText.slice(0, 220),
        content,
        status: effectiveStatus,
        publishDate: effectiveStatus === 'Published' ? new Date().toISOString() : publishDate,
        tags,
        featuredImageUrl,
        projectId: selectedProjectId === 'none' ? '' : selectedProjectId,
        seoTitle,
        seoDescription,
      };

      try {
        if (savedPostId) {
          await updatePostMutation.mutateAsync({
            id: savedPostId,
            updates: postPayload,
          });
        } else {
          await createPostMutation.mutateAsync(postPayload);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not save post.');
        setIsSaving(false);
        return;
      }

      const messages: Record<string, string> = {
        Draft: `Draft "${title}" saved.`,
        Scheduled: `"${title}" scheduled for publishing.`,
        Published: `"${title}" published successfully!`,
      };
      toast.success(messages[effectiveStatus] ?? 'Saved.');
      if (saveStatus) setStatus(saveStatus);
      setIsSaving(false);
    },
    [
      createPostMutation,
      editor,
      featuredImageUrl,
      publishDate,
      savedPostId,
      selectedProjectId,
      seoDescription,
      seoTitle,
      slug,
      status,
      tags,
      title,
      updatePostMutation,
    ]
  );

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="px-xl pt-lg pb-base border-b border-hairline bg-canvas shrink-0">
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => {
              const newTitle = e.target.value;
              setTitle(newTitle);

              if (!slugManuallyEdited) {
                setSlug(slugify(newTitle));
              }
            }}
            placeholder="Untitled post…"
            className="w-full text-display-xl font-bold text-ink bg-transparent border-none outline-none placeholder:text-hairline caret-primary"
            autoFocus
          />

          <div className="flex items-center gap-xs mt-sm">
            <span className="text-xs text-muted shrink-0">bloggy.io/posts/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true);
              }}
              placeholder="post-slug"
              className="flex-1 text-xs text-body bg-transparent border-none outline-none font-mono border-b border-transparent hover:border-hairline focus:border-primary transition-colors "
            />
            {slugManuallyEdited && (
              <button
                type="button"
                className="text-[10px] text-muted hover:text-primary transition-colors"
                onClick={() => {
                  setSlug(slugify(title));
                  setSlugManuallyEdited(false);
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <EditorToolbar editor={editor} />

        <div className="flex-1 overflow-y-auto min-h-0">
          <EditorContent editor={editor} className="h-full" />
        </div>

        <div className="h-10 border-t border-hairline bg-surface-soft px-lg flex items-center justify-between shrink-0">
          <div className="flex items-center gap-base text-xs text-muted">
            <span className="flex items-center gap-xs">
              <FileText size={11} />
              {wordCount} words
            </span>
          </div>
          <div className="flex items-center gap-md">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-xs text-xs text-body hover:text-ink"
              onClick={() => handleSave('Draft')}
              disabled={isSaving}
            >
              <Save size={13} />
              Save draft
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-xs text-xs text-body hover:text-ink"
              onClick={() => handleSave(status)}
              disabled={isSaving}
            >
              <Save size={13} />
              Save {status.toLowerCase()}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-xs text-xs text-body hover:text-ink"
            >
              <Eye size={13} />
              Preview
            </Button>
          </div>
        </div>
      </div>

      <EditorSidebar
        status={status}
        setStatus={setStatus}
        publishDate={publishDate}
        setPublishDate={setPublishDate}
        tags={tags}
        setTags={setTags}
        featuredImageUrl={featuredImageUrl}
        setFeaturedImageUrl={setFeaturedImageUrl}
        seoTitle={seoTitle}
        setSeoTitle={setSeoTitle}
        seoDescription={seoDescription}
        setSeoDescription={setSeoDescription}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        projects={projects}
      />
    </div>
  );
}
