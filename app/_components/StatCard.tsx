import React from "react";
import { StatItem } from "@/types";

export default function StatCard({ label, value, delta }: StatItem) {
  return (
    <div className="bg-surface-soft rounded-md p-base">
      <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-md">
        {label}
      </p>
      <p className="text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs text-primary mt-sm">{delta}</p>
    </div>
  );
}
