import React from "react";
import { getStats } from "@/lib/data";
import StatCard from "./StatCard";

export default async function StatsGrid() {
  const stats = await getStats();

  return (
    <div className="grid grid-cols-4 gap-md">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
