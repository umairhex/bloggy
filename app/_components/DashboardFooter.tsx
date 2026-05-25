import React from 'react';

export default function DashboardFooter() {
  return (
    <footer className="h-12 border-t border-hairline flex items-center justify-between px-lg shrink-0 bg-canvas">
      <p className="text-xs text-body">
        bloggy<span className="text-primary">.</span> — v1.0.0
      </p>
      <div className="flex gap-lg">
        {['Help', 'Changelog', 'Privacy'].map((link) => (
          <a key={link} href="#" className="text-xs text-body hover:text-ink transition-colors">
            {link}
          </a>
        ))}
      </div>
    </footer>
  );
}
