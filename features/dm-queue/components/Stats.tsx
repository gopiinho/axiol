"use client";

import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

export type StatTone = "ok" | "warn" | "danger" | "neutral";

export function StatTile({
  title,
  value,
  description,
  tone,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  tone: StatTone;
  icon: ComponentType<{ className?: string }>;
}) {
  const toneStyles = {
    ok: "bg-emerald-100 text-emerald-700",
    warn: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    neutral: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="app-panel-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className={cn("rounded-lg p-2", toneStyles[tone])}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export function KpiRow({
  label,
  value,
  helper,
  highlight = false,
}: {
  label: string;
  value: number | string;
  helper: string;
  highlight?: boolean;
}) {
  return (
    <div className="app-panel-soft flex items-center justify-between gap-3 px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </div>
      <p className={cn("text-xl font-semibold", highlight && "text-emerald-600")}>
        {value}
      </p>
    </div>
  );
}
