import { StatItem, Post } from "@/types";

export async function getStats(): Promise<StatItem[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    { label: "Total posts", value: "48", delta: "↑ 4 this month" },
    { label: "Subscribers", value: "2.1k", delta: "↑ 12% vs last month" },
    { label: "Views", value: "18.4k", delta: "↑ 8% this week" },
    { label: "Avg read time", value: "4.2m", delta: "Stable" },
  ];
}

export async function getPosts(): Promise<Post[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return [
    {
      title: "How I built an AI pipeline with Next.js and n8n",
      date: "May 22, 2026 · 6 min",
      status: "Published",
    },
    {
      title: "Shadcn UI: designing for developer ergonomics",
      date: "May 18, 2026 · 4 min",
      status: "Published",
    },
    {
      title: "Branding a SaaS in 48 hours — a naming guide",
      date: "Scheduled · May 28, 2026",
      status: "Scheduled",
    },
    {
      title: "TypeScript patterns I wish I knew earlier",
      date: "Draft · Last edited May 20",
      status: "Draft",
    },
  ];
}
