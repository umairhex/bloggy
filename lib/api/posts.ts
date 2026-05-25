import { queryOptions } from '@tanstack/react-query';
import { BlogPost } from '@/types';
import { ApiError } from '@/lib/api-error';
import { PostFormValues } from '@/lib/validations/post';

type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;

  if (!response.ok) {
    throw new ApiError(payload.error || 'Post request failed.', response.status);
  }

  return payload.data as T;
}

export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: () => [...postKeys.lists()] as const,
};

export async function fetchPosts(): Promise<BlogPost[]> {
  const response = await fetch('/api/posts');

  return parseResponse<BlogPost[]>(response);
}

export const postsQueryOptions = () =>
  queryOptions({
    queryKey: postKeys.list(),
    queryFn: fetchPosts,
    staleTime: 30_000,
  });

export async function createPost(data: PostFormValues): Promise<BlogPost> {
  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return parseResponse<BlogPost>(response);
}

export async function updatePost({
  id,
  updates,
}: {
  id: string;
  updates: Partial<PostFormValues>;
}): Promise<BlogPost[]> {
  const response = await fetch('/api/posts', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, updates }),
  });

  return parseResponse<BlogPost[]>(response);
}

export async function deletePosts(ids: string[]): Promise<string[]> {
  const response = await fetch('/api/posts', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  return parseResponse<string[]>(response);
}
