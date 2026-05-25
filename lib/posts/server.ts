import 'server-only';

import { BlogPost } from '@/types';
import { connectToDB } from '@/lib/db';
import BlogPostModel from '@/models/BlogPost.model';

type BlogPostDocument = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  status: BlogPost['status'];
  publishDate?: Date | string | null;
  tags?: string[];
  featuredImageUrl?: string | null;
  projectId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export function formatBlogPost(post: BlogPostDocument): BlogPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? '',
    content: post.content,
    status: post.status,
    publishDate: post.publishDate ? new Date(post.publishDate).toISOString() : '',
    tags: post.tags ?? [],
    featuredImageUrl: post.featuredImageUrl ?? '',
    projectId: post.projectId ?? '',
    seoTitle: post.seoTitle ?? '',
    seoDescription: post.seoDescription ?? '',
    createdAt: new Date(post.createdAt).toISOString(),
    updatedAt: new Date(post.updatedAt).toISOString(),
  };
}

export async function getBlogPosts() {
  await connectToDB();

  const posts = await BlogPostModel.find().sort({ updatedAt: -1 }).lean<BlogPostDocument[]>();

  return posts.map(formatBlogPost);
}
