"use client";

import type {
  ProductTypeDefinition,
  ProductStepKey,
} from "../registry/productTypes";
import { STEP_LABELS } from "../registry/steps";

interface ProductBuilderLayoutProps {
  product: { _id: string; name: string; status: string };
  definition: ProductTypeDefinition;
  currentStepKey: ProductStepKey;
  currentStepIndex: number;
  totalSteps: number;
  onStepClick: (index: number) => void;
  children: React.ReactNode;
}

export function ProductBuilderLayout({
  product: _product,
  definition,
  currentStepKey: _currentStepKey,
  currentStepIndex,
  totalSteps: _totalSteps,
  onStepClick,
  children,
}: ProductBuilderLayoutProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {definition.steps.map((stepKey, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          return (
            <button
              key={stepKey}
              type="button"
              onClick={() => onStepClick(index)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : isCompleted
                    ? "bg-primary text-foreground"
                    : "bg-background text-muted-foreground"
              }`}
            >
              <span className="flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold border border-current">
                {isCompleted ? "✓" : index + 1}
              </span>
              {STEP_LABELS[stepKey]}
            </button>
          );
        })}
      </div>

      <div>{children}</div>
    </div>
  );
}
