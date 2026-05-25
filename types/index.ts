import { ComponentType } from 'react';

export interface NavLink {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: ComponentType<any>;
  label: string;
  active?: boolean;
  badge?: string;
  href?: string;
}

export interface NavSection {
  label: string;
  links: NavLink[];
}

export interface StatItem {
  label: string;
  value: string;
  delta: string;
}

export type PostStatus = 'Published' | 'Scheduled' | 'Draft';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  publishDate?: string;
  tags: string[];
  featuredImageUrl?: string;
  projectId?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  mongodbUri: string;
  createdAt: string;
  category?: 'production' | 'staging' | 'development';
  isArchived?: boolean;
  connectionStatus?: 'untested' | 'connected' | 'failed';
}
