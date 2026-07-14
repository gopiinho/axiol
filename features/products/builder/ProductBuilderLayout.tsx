"use client";

import type { ProductTypeDefinition, ProductStepKey } from "../registry/productTypes";
import { STEP_LABELS } from "../registry/steps";
import { Rows2, RectangleHorizontal, SlidersVertical, FileUp } from "lucide-react";

const STEP_ICONS: Record<string, React.ElementType> = {
  thumbnail: Rows2,
  checkout: RectangleHorizontal,
  options: SlidersVertical,
  content: FileUp,
};

interface ProductBuilderLayoutProps {
  product: { _id: string; name: string; status: string };
  definition: ProductTypeDefinition;
  currentStepKey: ProductStepKey;
  currentStepIndex: number;
  totalSteps: number;
  onStepClick: (index: number) => void;
  children: React.ReactNode;
  preview?: React.ReactNode;
}

export function ProductBuilderLayout({
  product: _product,
  definition,
  currentStepKey: _currentStepKey,
  currentStepIndex,
  totalSteps: _totalSteps,
  onStepClick,
  children,
  preview,
}: ProductBuilderLayoutProps) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4 overflow-x-auto pb-2">
        {definition.steps.map((stepKey, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const StepIcon = STEP_ICONS[stepKey];
          return (
            <button
              key={stepKey}
              type="button"
              onClick={() => onStepClick(index)}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : isCompleted
                    ? "bg-primary text-foreground"
                    : "bg-background text-muted-foreground hover:bg-card/30"
              }`}
            >
              {StepIcon && <StepIcon className="h-4 w-4" />}
              {STEP_LABELS[stepKey]}
            </button>
          );
        })}
      </div>

      <div className="lg:flex lg:gap-8 lg:items-start">
        <div className="lg:flex-1 lg:min-w-0">{children}</div>
        {preview && (
          <div className="hidden lg:block lg:w-95 lg:shrink-0 lg:self-stretch">
            <div className="sticky top-8">{preview}</div>
          </div>
        )}
      </div>
    </div>
  );
}
