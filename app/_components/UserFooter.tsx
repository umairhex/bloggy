'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '../_constants';

export default function UserFooter() {
  const pathname = usePathname();

  const configSection = navItems.find((s) => s.label === 'Configuration');

  if (!configSection || !configSection.links.length) {
    return null;
  }

  const { icon: Icon, label, href } = configSection.links[0];
  const isActive = pathname === href;

  return (
    <div className="px-md py-md border-t border-hairline">
      <Link
        href={href || '#'}
        className={`w-full flex items-center gap-md px-md py-sm rounded-sm text-sm transition-colors
          ${
            isActive ? 'bg-canvas text-ink font-medium' : 'text-body hover:bg-canvas hover:text-ink'
          }`}
      >
        <Icon size={15} />
        <span className="flex-1 text-left">{label}</span>
      </Link>
    </div>
  );
}
