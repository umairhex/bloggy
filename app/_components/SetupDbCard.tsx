'use client';

import React from 'react';
import { Shield, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SetupDbCard() {
  const handleOpenConfig = () => {
    window.dispatchEvent(new CustomEvent('open-db-config-modal'));
  };

  return (
    <div className="rounded-md border border-hairline bg-surface-card p-lg md:p-xl shadow-airbnb max-w-4xl mx-auto w-full relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-primary/30 via-primary to-primary/30" />

      <div className="flex flex-col md:flex-row gap-lg md:gap-xl items-start justify-between">
        <div className="space-y-md flex-1">
          <div className="inline-flex items-center gap-xs rounded-full bg-red-500/10 px-sm py-xxs border border-red-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Database Offline
            </span>
          </div>

          <div className="space-y-sm">
            <h2 className="font-serif text-display-lg text-ink font-semibold tracking-tight leading-tight">
              Initialize Your Workspace
            </h2>
            <p className="text-body text-sm leading-relaxed">
              Bloggy operates as a local-first platform designed to keep you in control. Connect
              your own MongoDB database to activate full content and project management.
            </p>
          </div>

          <div className="pt-xs">
            <Button
              size="sm"
              onClick={handleOpenConfig}
              className="gap-md bg-primary hover:bg-primary-active text-white cursor-pointer px-base h-9 text-xs font-semibold shadow-sm transition-all duration-200 hover:translate-x-0.5"
            >
              Configure MongoDB
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>

        <div className="flex-1 w-full space-y-md border-t border-hairline pt-lg md:border-t-0 md:pt-0 md:border-l md:pl-xl">
          <h3 className="text-[10px] uppercase tracking-wider text-muted font-bold">
            Platform Benefits
          </h3>

          <div className="space-y-sm">
            <div className="flex gap-md items-start">
              <div className="h-8 w-8 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Shield size={16} />
              </div>
              <div className="space-y-xxs">
                <h4 className="text-sm font-semibold text-ink">Zero Server Storage</h4>
                <p className="text-xs text-body leading-relaxed">
                  Your credentials and articles reside locally inside your browser cookies, fully
                  protected.
                </p>
              </div>
            </div>

            <div className="flex gap-md items-start">
              <div className="h-8 w-8 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Zap size={16} />
              </div>
              <div className="space-y-xxs">
                <h4 className="text-sm font-semibold text-ink">Direct Local Queries</h4>
                <p className="text-xs text-body leading-relaxed">
                  Fast database connections prevent buffering delays and yield instant content
                  responses.
                </p>
              </div>
            </div>

            <div className="flex gap-md items-start">
              <div className="h-8 w-8 rounded-sm bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div className="space-y-xxs">
                <h4 className="text-sm font-semibold text-ink">Data Autonomy</h4>
                <p className="text-xs text-body leading-relaxed">
                  Backup, migrate, or query your records directly in your favorite database client
                  anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
