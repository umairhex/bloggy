/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { PostStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, Eye, FileText, Settings } from 'lucide-react';
import EditorToolbar from './EditorToolbar';
import EditorSidebar from './EditorSidebar';
import PostPreviewModal from '@/app/_components/PostPreviewModal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsQueryOptions } from '@/lib/api/projects';
import { createPost, postKeys, updatePost, postsQueryOptions } from '@/lib/api/posts';

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
  const [excerpt, setExcerpt] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('none');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [savedPostId, setSavedPostId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: projects = [] } = useQuery(projectsQueryOptions());
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');

  const { data: posts = [] } = useQuery(postsQueryOptions());

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      setSavedPostId(post.id);
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      router.replace(`/editor?id=${post.id}`);
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
          'prose prose-sm max-w-none min-h-[420px] px-md sm:px-lg md:px-xl py-lg focus:outline-none text-ink leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    },
  });

  useEffect(() => {
    if (editor) {
      if (postId) {
        if (savedPostId !== postId && posts.length > 0) {
          const post = posts.find((p) => p.id === postId);
          if (post) {
            console.log('EditorForm loaded post:', post);
            setTitle(post.title);
            setSlug(post.slug);
            setExcerpt(post.excerpt || '');
            setStatus(post.status);
            setPublishDate(post.publishDate || '');
            setTags(post.tags || []);
            setFeaturedImageUrl(post.featuredImageUrl || '');
            setSelectedProjectId(post.projectId || 'none');
            setSeoTitle(post.seoTitle || '');
            setSeoDescription(post.seoDescription || '');
            setSavedPostId(post.id);
            setSlugManuallyEdited(true);
            editor.commands.setContent(post.content);
          }
        }
      } else {
        if (savedPostId !== null && !createPostMutation.isSuccess) {
          setTitle('');
          setSlug('');
          setExcerpt('');
          setStatus('Draft');
          setPublishDate('');
          setTags([]);
          setFeaturedImageUrl('');
          setSelectedProjectId('none');
          setSeoTitle('');
          setSeoDescription('');
          setSavedPostId(null);
          setSlugManuallyEdited(false);
          editor.commands.setContent('');
        }
      }
    }
  }, [postId, posts, savedPostId, editor, createPostMutation.isSuccess]);

  useEffect(() => {
    const handleToggleSidebar = () => {
      setSidebarOpen((open) => !open);
    };
    window.addEventListener('toggle-editor-sidebar', handleToggleSidebar);
    return () => {
      window.removeEventListener('toggle-editor-sidebar', handleToggleSidebar);
    };
  }, []);

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
        excerpt: excerpt.trim() || plainText.slice(0, 220),
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
      excerpt,
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
    <div className="flex h-full flex-1 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex flex-1 flex-col overflow-hidden min-h-0">
        <div className="border-b border-hairline bg-canvas shrink-0 space-y-base px-md py-base sm:px-lg sm:pt-lg sm:pb-base">
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
            className="w-full text-2xl font-bold sm:text-display-xl text-ink bg-transparent border-none outline-none placeholder:text-hairline caret-primary"
            autoFocus
          />

          <div className="flex items-center gap-xs">
            <span className="shrink-0 text-xs text-muted">bloggy.io/posts/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true);
              }}
              placeholder="post-slug"
              className="flex-1 text-xs text-body bg-transparent border-none outline-none font-mono border-b border-transparent hover:border-hairline focus:border-primary transition-colors"
            />
            {slugManuallyEdited && (
              <button
                type="button"
                className="shrink-0 text-[10px] text-muted hover:text-primary transition-colors"
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

        <div className="min-h-0 flex-1 overflow-y-auto">
          <EditorContent editor={editor} className="h-full" />
        </div>

        <div className="flex h-10 shrink-0 items-center justify-between border-t border-hairline bg-surface-soft px-md sm:px-lg">
          <div className="flex items-center gap-base text-xs text-muted">
            <span className="flex items-center gap-xs">
              <FileText size={11} />
              <span className="hidden sm:inline">{wordCount} words</span>
              <span className="sm:hidden">{wordCount}w</span>
            </span>
          </div>
          <div className="flex items-center gap-xs sm:gap-md">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-xs text-xs text-body hover:text-ink cursor-pointer"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Eye size={13} />
              <span className="hidden sm:inline">Preview</span>
            </Button>

            {status !== 'Draft' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-xs text-xs text-body hover:text-ink cursor-pointer"
                onClick={() => handleSave('Draft')}
                disabled={isSaving}
              >
                <Save size={13} />
                <span className="hidden sm:inline">Save as draft</span>
                <span className="sm:hidden">Draft</span>
              </Button>
            )}

            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-7 gap-xs text-xs font-semibold bg-primary hover:bg-primary-active text-white rounded-sm px-3 cursor-pointer shadow-sm transition-colors duration-150"
              onClick={() => handleSave(status)}
              disabled={isSaving}
            >
              <Save size={13} />
              <span>
                {status === 'Published'
                  ? savedPostId
                    ? 'Update post'
                    : 'Publish post'
                  : status === 'Scheduled'
                    ? savedPostId
                      ? 'Update schedule'
                      : 'Schedule post'
                    : 'Save draft'}
              </span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-xs text-xs text-body hover:text-ink md:hidden cursor-pointer"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle post settings"
            >
              <Settings size={13} />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop visible, Mobile as drawer */}
      <div
        className={`fixed bottom-0 right-0 top-0 z-50 w-72 border-l border-hairline bg-surface-soft md:sticky md:translate-x-0 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <EditorSidebar
          status={status}
          setStatus={setStatus}
          publishDate={publishDate}
          setPublishDate={setPublishDate}
          tags={tags}
          setTags={setTags}
          excerpt={excerpt}
          setExcerpt={setExcerpt}
          featuredImageUrl={featuredImageUrl}
          setFeaturedImageUrl={setFeaturedImageUrl}
          seoTitle={seoTitle}
          setSeoTitle={setSeoTitle}
          seoDescription={seoDescription}
          setSeoDescription={setSeoDescription}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          projects={projects}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <PostPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        post={{
          title: title || 'Untitled Post',
          content: editor ? editor.getHTML() : '',
          tags,
          excerpt: excerpt.trim() || (editor ? editor.getText().trim().slice(0, 220) : ''),
          featuredImageUrl,
          status,
          publishDate,
          projectId: selectedProjectId === 'none' ? '' : selectedProjectId,
        }}
      />
    </div>
  );
}
