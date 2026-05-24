import React from "react";
import StatCard from "./StatCard";
import { getBlogPosts } from "@/lib/posts/server";

export default async function StatsGrid() {
  const posts = await getBlogPosts();
  const published = posts.filter((post) => post.status === "Published").length;
  const scheduled = posts.filter((post) => post.status === "Scheduled").length;
  const drafts = posts.filter((post) => post.status === "Draft").length;

  const stats = [
    { label: "Total posts", value: String(posts.length), delta: `${drafts} drafts` },
    { label: "Published", value: String(published), delta: "Live content" },
    { label: "Scheduled", value: String(scheduled), delta: "Queued posts" },
    {
      label: "Avg read time",
      value: posts.length
        ? `${Math.max(
            1,
            Math.round(
              posts.reduce((total, post) => {
                const words = post.content
                  .replace(/<[^>]+>/g, " ")
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean).length;

                return total + words / 220;
              }, 0) / posts.length
            )
          )}m`
        : "0m",
      delta: "Across all posts",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-md">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
