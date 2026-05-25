import 'server-only';

import { BlogPost } from '@/types';
import { connectToDB, getProjectConnection, isLocalMongoUri } from '@/lib/db';
import Project from '@/models/Project.model';
import BlogPostModel, { getBlogPostModel } from '@/models/BlogPost.model';

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
  const connected = await connectToDB();
  if (!connected) return [];

  try {
    const mainPosts = await BlogPostModel.find()
      .sort({ updatedAt: -1 })
      .lean<BlogPostDocument[]>();

    const projects = await Project.find().lean<{ id: string; mongodbUri: string }[]>();
    const projectPosts = await Promise.all(
      projects.map(async (project) => {
        try {
          if (!project.mongodbUri) return [];
          if (isLocalMongoUri(project.mongodbUri) && process.env.NODE_ENV === 'production') {
            console.warn(
              `Skipping local MongoDB URI for project ${project.id} in production environment.`
            );
            return [];
          }

          const connection = await getProjectConnection(project.mongodbUri);
          const ProjectBlogPost = getBlogPostModel(connection);
          const posts = await ProjectBlogPost.find({ projectId: project.id })
            .sort({ updatedAt: -1 })
            .lean<BlogPostDocument[]>();

          return posts.map(formatBlogPost);
        } catch (projectError) {
          console.warn(`Failed to fetch posts for project ${project.id}:`, projectError);
          return [];
        }
      })
    );

    const merged = new Map<string, BlogPost>();
    mainPosts.map(formatBlogPost).forEach((post) => merged.set(post.id, post));
    projectPosts.flat().forEach((post) => merged.set(post.id, post));

    return Array.from(merged.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.warn('Failed to fetch blog posts:', error);
    return [];
  }
}
