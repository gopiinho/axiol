"use client";

import type { ProductStepComponentProps } from "../../registry/steps";

export function OptionsStep({ }: ProductStepComponentProps) {
  return (
    <div className="space-y-8">
      <div className="p-6 border border-border/60 rounded-xs bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground">
          Additional options will appear here as the product builder expands.
        </p>
      </div>
    </div>
  );
}
