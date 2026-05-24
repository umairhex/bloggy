import React from "react";

export default function UserFooter() {
  return (
    <div className="px-md py-md border-t border-hairline">
      <div className="flex items-center gap-md">
        <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-semibold shrink-0">
          MU
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight truncate text-ink">
            M Umair
          </p>
          <p className="text-xs text-body">Pro plan</p>
        </div>
      </div>
    </div>
  );
}
