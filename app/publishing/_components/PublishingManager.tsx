"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  Edit3,
  FileText,
  MoreHorizontal,
  RefreshCw,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BlogPost, PostStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deletePosts,
  postKeys,
  postsQueryOptions,
  updatePost,
} from "@/lib/api/posts";

const statusVariant: Record<PostStatus, "default" | "secondary" | "outline"> = {
  Published: "default",
  Scheduled: "secondary",
  Draft: "outline",
};

const statusTabs = ["All", "Published", "Scheduled", "Draft"] as const;

function formatDate(value?: string) {
  if (!value) return "Not scheduled";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getReadTime(content: string) {
  const words = content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean);
  return Math.max(1, Math.ceil(words.length / 220));
}

export default function PublishingManager() {
  const queryClient = useQueryClient();
  const { data: posts = [], error, isError, isFetching, isPending, refetch } =
    useQuery(postsQueryOptions());
  const [activeTab, setActiveTab] = useState<(typeof statusTabs)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    ids: string[];
    title: string;
    description: string;
  }>({
    isOpen: false,
    ids: [],
    title: "",
    description: "",
  });

  const updatePostsCache = (updater: (posts: BlogPost[]) => BlogPost[]) => {
    queryClient.setQueryData<BlogPost[]>(postKeys.list(), (current = []) =>
      updater(current)
    );
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
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to update post."
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });

  const deletePostsMutation = useMutation({
    mutationFn: deletePosts,
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: postKeys.list() });
      const snapshot = queryClient.getQueryData<BlogPost[]>(postKeys.list());

      updatePostsCache((current) => current.filter((post) => !ids.includes(post.id)));

      return { snapshot };
    },
    onError: (mutationError, _variables, context) => {
      queryClient.setQueryData(postKeys.list(), context?.snapshot);
      toast.error(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to delete posts."
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });

  const counts = useMemo(
    () => ({
      total: posts.length,
      Published: posts.filter((post) => post.status === "Published").length,
      Scheduled: posts.filter((post) => post.status === "Scheduled").length,
      Draft: posts.filter((post) => post.status === "Draft").length,
    }),
    [posts]
  );

  const filteredPosts = posts.filter((post) => {
    const matchesStatus = activeTab === "All" || post.status === activeTab;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(query) ||
      post.slug.toLowerCase().includes(query) ||
      post.tags.some((tag) => tag.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  const allVisibleSelected =
    filteredPosts.length > 0 &&
    filteredPosts.every((post) => selectedIds.includes(post.id));

  const publishingCompletion = counts.total
    ? Math.round(((counts.Published + counts.Scheduled) / counts.total) * 100)
    : 0;

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked) {
      setSelectedIds((current) =>
        Array.from(new Set([...current, ...filteredPosts.map((post) => post.id)]))
      );
      return;
    }

    setSelectedIds((current) =>
      current.filter((id) => !filteredPosts.some((post) => post.id === id))
    );
  };

  const handleToggleSelect = (id: string, checked: boolean | "indeterminate") => {
    setSelectedIds((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id)
    );
  };

  const handleStatusChange = (post: BlogPost, status: PostStatus) => {
    updatePostMutation.mutate(
      {
        id: post.id,
        updates: {
          status,
          publishDate: status === "Published" ? new Date().toISOString() : post.publishDate,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Moved "${post.title}" to ${status}.`);
        },
      }
    );
  };

  const openDeleteDialog = (ids: string[]) => {
    const count = ids.length;
    setDeleteDialog({
      isOpen: true,
      ids,
      title: count === 1 ? "Delete Post?" : "Delete Posts?",
      description:
        count === 1
          ? "This post will be permanently removed from the publishing queue."
          : `The ${count} selected posts will be permanently removed from the publishing queue.`,
    });
  };

  const handleConfirmDelete = () => {
    const ids = [...deleteDialog.ids];
    deletePostsMutation.mutate(ids, {
      onSuccess: () => {
        setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
        toast.success(ids.length === 1 ? "Post deleted." : `${ids.length} posts deleted.`);
      },
    });
  };

  if (isPending) {
    return (
      <div className="space-y-lg">
        <div className="h-28 rounded-md border border-hairline bg-surface-soft animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 rounded-md border border-hairline bg-surface-soft animate-pulse"
            />
          ))}
        </div>
        <div className="h-96 rounded-md border border-hairline bg-surface-soft animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="rounded-md border-hairline bg-canvas shadow-sm">
        <CardHeader>
          <CardTitle className="text-title-md normal-case tracking-normal">
            Could not load publishing data
          </CardTitle>
          <CardDescription>
            {error instanceof Error
              ? error.message
              : "The publishing queue could not be loaded."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-lg">
      <div className="flex flex-col gap-md border-b border-hairline pb-md lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-xs">
          <h1 className="font-serif text-display-md font-bold text-ink">
            Publishing
          </h1>
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
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button
            asChild
            className="h-10 bg-primary hover:bg-primary-active text-on-primary text-sm font-semibold rounded-sm shadow-sm gap-sm"
          >
            <Link href="/editor">
              <Edit3 size={15} />
              New Draft
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-4">
        <Card size="sm" className="rounded-md border-hairline bg-canvas shadow-sm">
          <CardHeader>
            <CardDescription>Total queue</CardDescription>
            <CardTitle className="text-display-sm tracking-normal normal-case">
              {counts.total}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm" className="rounded-md border-hairline bg-canvas shadow-sm">
          <CardHeader>
            <CardDescription>Published</CardDescription>
            <CardTitle className="text-display-sm tracking-normal normal-case">
              {counts.Published}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm" className="rounded-md border-hairline bg-canvas shadow-sm">
          <CardHeader>
            <CardDescription>Scheduled</CardDescription>
            <CardTitle className="text-display-sm tracking-normal normal-case">
              {counts.Scheduled}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm" className="rounded-md border-hairline bg-canvas shadow-sm">
          <CardHeader>
            <CardDescription>Ready pipeline</CardDescription>
            <CardTitle className="text-display-sm tracking-normal normal-case">
              {publishingCompletion}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={publishingCompletion} className="h-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
        className="gap-md"
      >
        <div className="flex flex-col gap-md lg:flex-row lg:items-center lg:justify-between">
          <TabsList variant="line" className="rounded-none p-0">
            {statusTabs.map((status) => (
              <TabsTrigger key={status} value={status}>
                {status}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
            {selectedIds.length > 0 && (
              <Button
                variant="outline"
                className="h-10 border-hairline text-primary-error-text hover:bg-primary-disabled/20 rounded-sm gap-sm"
                onClick={() => openDeleteDialog(selectedIds)}
              >
                <Trash2 size={14} />
                Delete selected
              </Button>
            )}
            <div className="relative w-full sm:w-80">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search title, slug, or tag..."
                className="h-10 rounded-full border-hairline bg-canvas pl-9 text-sm"
              />
            </div>
          </div>
        </div>

        {statusTabs.map((status) => (
          <TabsContent key={status} value={status} className="mt-0">
            <Card className="rounded-md border-hairline bg-canvas py-0 shadow-sm">
              {filteredPosts.length === 0 ? (
                <Empty className="min-h-80 border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FileText />
                    </EmptyMedia>
                    <EmptyTitle>
                      {searchQuery ? "No posts match" : "No posts yet"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {searchQuery
                        ? "Try a different title, slug, or tag."
                        : "Create a draft in the editor to begin the publishing workflow."}
                    </EmptyDescription>
                  </EmptyHeader>
                  {!searchQuery && (
                    <EmptyContent>
                      <Button asChild className="rounded-sm bg-primary text-on-primary">
                        <Link href="/editor">Create draft</Link>
                      </Button>
                    </EmptyContent>
                  )}
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={allVisibleSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select visible posts"
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
                      <TableRow key={post.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(post.id)}
                            onCheckedChange={(checked) =>
                              handleToggleSelect(post.id, checked)
                            }
                            aria-label={`Select ${post.title}`}
                          />
                        </TableCell>
                        <TableCell className="min-w-72">
                          <div className="flex min-w-0 flex-col gap-1">
                            <span className="font-semibold text-ink">
                              {post.title}
                            </span>
                            <span className="text-xs text-body">
                              /{post.slug}
                            </span>
                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-xs pt-1">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="rounded-sm text-[10px]"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={statusVariant[post.status]}
                            className="rounded-sm text-xs"
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
                        <TableCell>{getReadTime(post.content)} min</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-xs">
                            {post.status !== "Published" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                title="Publish now"
                                onClick={() => handleStatusChange(post, "Published")}
                              >
                                <Send size={14} />
                              </Button>
                            )}
                            {post.status !== "Draft" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                title="Move to draft"
                                onClick={() => handleStatusChange(post, "Draft")}
                              >
                                <CheckCircle2 size={14} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-body"
                              title="More actions"
                              disabled
                            >
                              <MoreHorizontal size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-primary-error-text hover:bg-primary-disabled/20"
                              title="Delete post"
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
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          setDeleteDialog((current) => ({ ...current, isOpen: open }))
        }
      >
        <AlertDialogContent className="bg-canvas border-hairline shadow-airbnb rounded-md max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-ink font-semibold tracking-normal normal-case">
              {deleteDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body text-xs mt-2">
              {deleteDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="rounded-sm h-10 border-hairline text-ink hover:bg-surface-soft cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary hover:bg-primary-active text-on-primary rounded-sm h-10 px-6 cursor-pointer font-medium"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
