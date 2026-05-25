import React from 'react';

export default function HeaderBreadcrumbs() {
  return (
    <p className="text-sm text-body">
      Dashboard <span className="text-hairline"> › </span>{' '}
      <span className="text-ink font-semibold">Overview</span>
    </p>
  );
}
