"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Bell, Plus } from "lucide-react";
import { usePathname } from "next/navigation";

export default function HeaderActions() {
  const pathname = usePathname();
  const isProjectsPage = pathname?.startsWith("/projects");

  return (
    <div className="flex items-center gap-md">
      <ModeToggle />
      <Button variant="outline" size="icon" className="h-9 w-9">
        <Bell size={16} />
      </Button>
      {!isProjectsPage && (
        <Button size="sm" className="h-9 gap-md text-white cursor-pointer">
          <Plus size={16} />
          New post
        </Button>
      )}
    </div>
  );
}
