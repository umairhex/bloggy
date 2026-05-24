import React from "react";
import { Badge } from "@/components/ui/badge";
import { navItems } from "../_constants";

export default function SidebarNav() {
  return (
    <div className="flex-1 px-sm py-sm overflow-y-auto">
      {navItems.map((section) => (
        <div key={section.label} className="mb-md">
          <p className="text-xs uppercase tracking-wider text-muted font-semibold px-md mb-xs">
            {section.label}
          </p>
          {section.links.map(({ icon: Icon, label, badge, active }) => (
            <button
              key={label}
              className={`w-full flex items-center gap-md px-md py-sm rounded-sm text-sm mb-xs transition-colors
                ${
                  active
                    ? "bg-canvas text-ink font-medium"
                    : "text-body hover:bg-canvas hover:text-ink"
                }`}
            >
              <Icon size={15} />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <Badge variant="secondary" className="text-xs px-sm py-xs">
                  {badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
