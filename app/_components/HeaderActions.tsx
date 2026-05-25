"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function HeaderActions() {
  const pathname = usePathname();
  const router = useRouter();
  const isProjectsPage = pathname?.startsWith("/projects");

  const handleNewPost = () => {
    router.push("/editor");
  };

  return (
    <div className="flex items-center gap-md">
      <ModeToggle />
      {!isProjectsPage && (
        <Button
          size="sm"
          className="h-9 gap-md text-white cursor-pointer"
          onClick={handleNewPost}
        >
          <Plus size={16} />
          New post
        </Button>
      )}
    </div>
  );
}
