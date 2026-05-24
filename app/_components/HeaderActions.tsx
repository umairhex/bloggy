import React from "react";
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";

export default function HeaderActions() {
  return (
    <div className="flex items-center gap-md">
      <Button variant="outline" size="icon" className="h-9 w-9">
        <Bell size={16} />
      </Button>
      <Button size="sm" className="h-9 gap-md">
        <Plus size={16} />
        New post
      </Button>
    </div>
  );
}
