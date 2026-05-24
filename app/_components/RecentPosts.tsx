import React from "react";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { getPosts } from "@/lib/data";
import { statusVariant } from "../_constants";

export default async function RecentPosts() {
  const posts = await getPosts();

  return (
    <div>
      <h2 className="font-serif text-title-md font-semibold mb-md text-ink">
        Recent posts
      </h2>
      <div className="space-y-sm">
        {posts.map(({ title, date, status }) => (
          <div
            key={title}
            className="flex items-center gap-md p-base rounded-md border border-hairline bg-canvas hover:border-hairline-soft hover:shadow-airbnb transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-sm bg-surface-soft flex items-center justify-center shrink-0">
              <FileText size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{title}</p>
              <p className="text-xs text-body mt-xs">{date}</p>
            </div>
            <Badge variant={statusVariant[status]} className="text-xs shrink-0">
              {status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
