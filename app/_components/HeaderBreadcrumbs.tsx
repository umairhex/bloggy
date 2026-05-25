'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const breadcrumbConfig: Record<string, string> = {
  '/': 'Overview',
  '/editor': 'Editor',
  '/projects': 'Projects',
  '/publishing': 'Publishing',
};

export default function HeaderBreadcrumbs() {
  const pathname = usePathname();

  const getBreadcrumbLabel = (path: string): string => {
    return breadcrumbConfig[path] || 'Dashboard';
  };

  const label = getBreadcrumbLabel(pathname);

  return (
    <p className="truncate text-sm text-body">
      <span className="hidden sm:inline">
        Dashboard <span className="text-hairline"> › </span>{' '}
      </span>
      <span className="text-ink font-semibold">{label}</span>
    </p>
  );
}
