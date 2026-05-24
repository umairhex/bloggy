import React from "react";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { statusVariant } from "../_constants";
import { getBlogPosts } from "@/lib/posts/server";

function formatPostDate(postDate: string, status: string) {
  if (!postDate) return status === "Draft" ? "Draft" : "Not scheduled";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(postDate));
}

export default async function RecentPosts() {
  const posts = (await getBlogPosts()).slice(0, 4);

  return (
    <div>
      <h2 className="font-serif text-title-md font-semibold mb-md text-ink">
        Recent posts
      </h2>
      <div className="space-y-sm">
        {posts.length === 0 && (
          <div className="p-base rounded-md border border-dashed border-hairline bg-canvas text-sm text-body">
            No posts yet. Create your first draft in the editor.
          </div>
        )}
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center gap-md p-base rounded-md border border-hairline bg-canvas hover:border-hairline-soft hover:shadow-airbnb transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-sm bg-surface-soft flex items-center justify-center shrink-0">
              <FileText size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{post.title}</p>
              <p className="text-xs text-body mt-xs">
                {formatPostDate(post.publishDate || post.updatedAt, post.status)}
              </p>
            </div>
            <Badge variant={statusVariant[post.status]} className="text-xs shrink-0">
              {post.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
