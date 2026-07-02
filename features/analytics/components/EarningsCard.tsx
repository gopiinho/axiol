"use client";

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

interface EarningsCardProps {
  label: string;
  value: number;
  tooltip?: string;
  loading: boolean;
  isCurrency?: boolean;
  dotColor?: string;
}

export function EarningsCard({
  label,
  value,
  tooltip,
  loading,
  isCurrency = true,
  dotColor,
}: EarningsCardProps) {
  return (
    <div className="border-border/70 bg-card hover:border-border rounded-xs border p-7 transition-colors">
      <div className="mb-1 flex items-center gap-1.5">
        {dotColor && (
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
        )}
        <span className="text-muted-foreground text-sm font-medium tracking-wide">{label}</span>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {loading ? (
        <div className="bg-muted mt-1 h-8 w-24 animate-pulse rounded" />
      ) : (
        <p className="text-2xl font-bold tabular-nums sm:text-3xl">
          {isCurrency ? formatINR(value) : value.toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}
