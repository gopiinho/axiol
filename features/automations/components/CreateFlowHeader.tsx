"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepMeta {
  id: number;
  title: string;
}

interface CreateFlowHeaderProps {
  currentStep: number;
  stepMeta: StepMeta[];
  canGoToStep: (step: number) => boolean;
  onGoToStep: (step: number) => void;
}

export default function CreateFlowHeader({
  currentStep,
  stepMeta,
  canGoToStep,
  onGoToStep,
}: CreateFlowHeaderProps) {
  const isClickable = (stepId: number) => canGoToStep(stepId);
  const isCompleted = (stepId: number) => currentStep > stepId;
  const totalSteps = stepMeta.length;
  const interval = 100 / totalSteps;

  return (
    <div className="px-5 lg:px-6">
      <section className="py-6 lg:py-8">
        <h1 className="app-title">New Automation</h1>
      </section>

      <nav aria-label="Create flow steps" className="pb-6 lg:pb-8">
        <div className="relative flex justify-between">
          <div
            className="bg-border absolute h-px"
            style={{
              left: `calc(${interval / 2}%)`,
              right: `calc(${interval / 2}%)`,
              top: "1.25rem",
            }}
          />

          <div
            className="bg-primary absolute h-px origin-left"
            style={{
              left: `calc(${interval / 2}%)`,
              width: `calc(${100 - interval}%)`,
              top: "1.25rem",
            }}
          />

          {stepMeta.map((step) => {
            const active = currentStep === step.id;
            const completed = isCompleted(step.id);
            const clickable = isClickable(step.id);

            return (
              <button
                key={step.id}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onGoToStep(step.id)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "relative z-10 flex flex-1 flex-col items-center gap-2.5",
                  clickable && !active ? "cursor-pointer" : !clickable ? "cursor-not-allowed" : ""
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors duration-300",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_4px_14px_-3px_oklch(0.5_0.22_254/0.45)]"
                      : completed
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground"
                  )}
                >
                  {completed ? (
                    <span>
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                <span
                  className={cn(
                    "hidden text-xs font-semibold transition-colors duration-200 sm:block",
                    active
                      ? "text-foreground"
                      : completed
                        ? "text-muted-foreground"
                        : "text-muted-foreground/40"
                  )}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
