"use client";

import type { ProductStepComponentProps } from "../../registry/steps";

export function OptionsStep({}: ProductStepComponentProps) {
  return (
    <div className="space-y-8">
      <div className="border-border/60 bg-muted/30 rounded-xs border p-6 text-center">
        <p className="text-muted-foreground text-sm">
          Additional options will appear here as the product builder expands.
        </p>
      </div>
    </div>
  );
}
