import React from 'react';
import { StatItem } from '@/types';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StatCard({ label, value, delta }: StatItem) {
  return (
    <Card size="sm" className="rounded-md border-hairline bg-surface-soft shadow-none">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tracking-normal normal-case">{value}</CardTitle>
        <p className="text-xs text-primary">{delta}</p>
      </CardHeader>
    </Card>
  );
}
