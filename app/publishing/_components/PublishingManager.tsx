'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  CheckCircle2,
  Edit3,
  FileText,
  RefreshCw,
  Search,
  Send,
  Trash2,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BlogPost, PostStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deletePosts, postKeys, postsQueryOptions, updatePost, type DeletePostItem } from '@/lib/api/posts';

const statusVariant: Record<PostStatus, 'default' | 'secondary' | 'outline'> = {
  Published: 'default',
  Scheduled: 'secondary',
  Draft: 'outline',
};

const statusTabs = ['All', 'Published', 'Scheduled', 'Draft'] as const;

function formatDate(value?: string) {
  if (!value) return 'Not scheduled';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

export default function PublishingManager() {
  const queryClient = useQueryClient();
  const {
    data: posts = [],
    error,
    isError,
    isFetching,
    isPending,
    refetch,
  } = useQuery(postsQueryOptions());
  const [activeTab, setActiveTab] = useState<(typeof statusTabs)[number]>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    ids: [] as string[],
    title: '',
    description: '',
  });

  const updatePostsCache = (updater: (posts: BlogPost[]) => BlogPost[]) => {
    queryClient.setQueryData<BlogPost[]>(postKeys.list(), (current = []) => updater(current));
  };

  const updatePostMutation = useMutation({
    mutationFn: updatePost,
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: postKeys.list() });
      const snapshot = queryClient.getQueryData<BlogPost[]>(postKeys.list());
      updatePostsCache((current) =>
        current.map((post) => (post.id === id ? { ...post, ...updates } : post))
      );
      return { snapshot };
    },
    onError: (mutationError, _variables, context) => {
      queryClient.setQueryData(postKeys.list(), context?.snapshot);
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Failed to update post.'
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  });

  const deletePostsMutation = useMutation<string[], Error, DeletePostItem[], { snapshot?: BlogPost[] }>({
    mutationFn: (items) => deletePosts(items),
    onMutate: async (items) => {
      const ids = items.map((item) => item.id);
      await queryClient.cancelQueries({ queryKey: postKeys.list() });
      const snapshot = queryClient.getQueryData<BlogPost[]>(postKeys.list());
      updatePostsCache((current) => current.filter((post) => !ids.includes(post.id)));
      return { snapshot };
    },
    onError: (mutationError, _variables, context) => {
      queryClient.setQueryData(postKeys.list(), context?.snapshot);
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Failed to delete posts.'
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  });

  const counts = useMemo(
    () => ({
      total: posts.length,
      Published: posts.filter((post) => post.status === 'Published').length,
      Scheduled: posts.filter((post) => post.status === 'Scheduled').length,
      Draft: posts.filter((post) => post.status === 'Draft').length,
    }),
    [posts]
  );

  const filteredPosts = posts.filter((post) => {
    const matchesStatus = activeTab === 'All' || post.status === activeTab;
    const query = searchQuery.toLowerCase();
    return (
      matchesStatus &&
      (post.title.toLowerCase().includes(query) ||
        post.slug.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query)))
    );
  });

  const allVisibleSelected =
    filteredPosts.length > 0 && filteredPosts.every((post) => selectedIds.includes(post.id));
  const publishingCompletion = counts.total
    ? Math.round(((counts.Published + counts.Scheduled) / counts.total) * 100)
    : 0;

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    setSelectedIds(
      checked
        ? Array.from(new Set([...selectedIds, ...filteredPosts.map((post) => post.id)]))
        : selectedIds.filter((id) => !filteredPosts.some((post) => post.id === id))
    );
  };

  const handleToggleSelect = (id: string, checked: boolean | 'indeterminate') => {
    setSelectedIds(checked ? [...selectedIds, id] : selectedIds.filter((item) => item !== id));
  };

  const handleStatusChange = (post: BlogPost, status: PostStatus) => {
    updatePostMutation.mutate(
      {
        id: post.id,
        updates: {
          status,
          publishDate: status === 'Published' ? new Date().toISOString() : post.publishDate,
          projectId: post.projectId ?? '',
        },
      },
      { onSuccess: () => toast.success(`Moved "${post.title}" to ${status}.`) }
    );
  };

  const openDeleteDialog = (ids: string[]) => {
    const count = ids.length;
    setDeleteDialog({
      isOpen: true,
      ids,
      title: count === 1 ? 'Delete Post?' : 'Delete Posts?',
      description:
        count === 1
          ? 'This post will be permanently removed.'
          : `The ${count} selected posts will be permanently removed.`,
    });
  };

  const handleConfirmDelete = () => {
    const items: DeletePostItem[] = deleteDialog.ids.map((id) => {
      const post = posts.find((entry) => entry.id === id);
      return { id, projectId: post?.projectId };
    });

    deletePostsMutation.mutate(items, {
      onSuccess: () => {
        setSelectedIds([]);
        toast.success('Posts deleted.');
      },
    });
  };

  if (isPending)
    return (
      <div className="space-y-lg">
        <div className="h-28 rounded-md border border-hairline bg-surface-soft animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-md border border-hairline bg-surface-soft animate-pulse"
            />
          ))}
        </div>
        <div className="h-96 rounded-md border border-hairline bg-surface-soft animate-pulse" />
      </div>
    );

  if (isError)
    return (
      <Card className="rounded-md border-hairline bg-canvas shadow-sm">
        <CardHeader>
          <CardTitle className="text-title-md normal-case tracking-normal">
            Could not load publishing data
          </CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'The publishing queue could not be loaded.'}
          </CardDescription>
        </CardHeader>
      </Card>
    );

  return (
    <div className="space-y-lg pb-xl max-w-full overflow-hidden">
      <div className="flex flex-col gap-md border-b border-hairline pb-md lg:flex-row lg:items-end lg:justify-between shrink-0">
        <div className="space-y-xs">
          <h1 className="font-serif text-display-md font-bold text-ink">Publishing</h1>
          <p className="text-sm text-body">
            Review drafts, schedule upcoming articles, and keep published content in sync.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <Button
            variant="outline"
            className="h-10 border-hairline text-ink hover:bg-surface-soft gap-sm rounded-sm"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Button
            asChild
            className="h-10 bg-primary hover:bg-primary-active text-on-primary text-sm font-semibold rounded-sm shadow-sm gap-sm"
          >
            <Link href="/editor">
              <Edit3 size={15} /> New Draft
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-4 shrink-0 ">
        <Card size="sm" className="rounded-md border border-hairline bg-canvas shadow-sm">
          <CardHeader>
            <CardDescription>Total queue</CardDescription>
            <CardTitle className="text-display-sm">{counts.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card size="sm" className="rounded-md border border-hairline bg-canvas shadow-sm">
          <CardHeader>
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-display-sm">{counts.Published}</CardTitle>
          </CardHeader>
        </Card>

        <Card size="sm" className="rounded-md border border-hairline bg-canvas shadow-sm">
          <CardHeader>
            <CardDescription>Scheduled</CardDescription>
            <CardTitle className="text-display-sm">{counts.Scheduled}</CardTitle>
          </CardHeader>
        </Card>

        <Card size="sm" className="rounded-md border border-hairline bg-canvas shadow-sm">
          <CardHeader>
            <CardDescription>Ready pipeline</CardDescription>
            <CardTitle className="text-display-sm">{publishingCompletion}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={publishingCompletion} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="flex flex-col gap-md w-full min-w-0"
      >
        <div className="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
          <TabsList
            variant="line"
            className="rounded-none p-0 overflow-x-auto shrink-0 w-full lg:w-auto"
          >
            {statusTabs.map((status) => (
              <TabsTrigger key={status} value={status}>
                {status}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex flex-col gap-sm sm:flex-row sm:items-center shrink-0 w-full lg:w-auto">
            {selectedIds.length > 0 && (
              <Button
                variant="outline"
                className="h-10 border-hairline text-primary-error-text hover:bg-primary-disabled/20 rounded-sm gap-sm"
                onClick={() => openDeleteDialog(selectedIds)}
              >
                <Trash2 size={14} /> Delete selected
              </Button>
            )}
            <div className="relative w-full sm:w-80">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, slug, or tag..."
                className="h-10 rounded-full border-hairline bg-canvas pl-9 text-sm w-full"
              />
            </div>
          </div>
        </div>

        {statusTabs.map((status) => (
          <TabsContent key={status} value={status} className="mt-0 w-full min-w-0">
            <Card className="rounded-md border border-hairline bg-canvas py-0 shadow-sm w-full">
              {filteredPosts.length === 0 ? (
                <div className="flex w-full min-h-[300px] flex-col items-center justify-center p-8 text-center bg-canvas">
                  <div className="flex flex-col items-center w-full max-w-[280px]">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-surface-soft text-muted">
                      <FileText size={24} />
                    </div>
                    <h3 className="text-md font-semibold text-ink uppercase tracking-wider mb-2">
                      {searchQuery ? 'No posts match' : 'No posts yet'}
                    </h3>
                    <p className="text-sm text-body mb-6">
                      {searchQuery
                        ? 'Try a different title, slug, or tag.'
                        : 'Create a draft in the editor to begin the publishing workflow.'}
                    </p>
                    {!searchQuery && (
                      <Button
                        asChild
                        className="rounded-sm bg-primary hover:bg-primary-active text-on-primary shadow-sm font-medium px-8"
                      >
                        <Link href="/editor">Create draft</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="block w-full overflow-x-auto rounded-md border border-hairline">
                  <Table className="w-full min-w-[800px]">
                    <TableHeader className="bg-surface-soft/50">
                      <TableRow className="hover:bg-transparent border-b border-hairline">
                        <TableHead className="w-10">
                          <Checkbox
                            checked={allVisibleSelected}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Post</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Publish date</TableHead>
                        <TableHead>Read time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPosts.map((post) => (
                        <TableRow
                          key={post.id}
                          className="group hover:bg-surface-soft/50 border-b border-hairline last:border-0"
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.includes(post.id)}
                              onCheckedChange={(c) => handleToggleSelect(post.id, c)}
                            />
                          </TableCell>
                          <TableCell className="min-w-72">
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-ink">{post.title}</span>
                              <span className="text-xs text-body font-mono">/{post.slug}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={statusVariant[post.status]}
                              className="rounded-sm text-xs font-medium"
                            >
                              {post.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-xs text-sm text-body">
                              <CalendarClock size={13} />
                              {formatDate(post.publishDate)}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-body">
                            {getReadTime(post.content)} min
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-xs">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => handleStatusChange(post, 'Published')}
                              >
                                <Send size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => handleStatusChange(post, 'Draft')}
                              >
                                <CheckCircle2 size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-primary-error-text"
                                onClick={() => openDeleteDialog([post.id])}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => setDeleteDialog((c) => ({ ...c, isOpen: open }))}
      >
        <AlertDialogContent className="bg-canvas border-hairline rounded-md max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{deleteDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
