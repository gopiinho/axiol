"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { motion } from "motion/react";
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

const easeOutQuart: [number, number, number, number] = [0.25, 1, 0.5, 1];

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
  const progressScale = (currentStep - 1) / (totalSteps - 1) || 0;

  return (
    <div className="px-5 lg:px-6">
      <FadeIn>
        <section className="py-6 lg:py-8">
          <h1 className="app-title">New Automation</h1>
        </section>
      </FadeIn>

      <FadeIn delay={0.08}>
        <nav aria-label="Create flow steps" className="pb-6 lg:pb-8">
          <div className="relative flex justify-between">
            <div
              className="absolute h-px bg-border"
              style={{
                left: `calc(${interval / 2}%)`,
                right: `calc(${interval / 2}%)`,
                top: "1.25rem",
              }}
            />

            <motion.div
              className="absolute h-px bg-primary origin-left"
              style={{
                left: `calc(${interval / 2}%)`,
                width: `calc(${100 - interval}%)`,
                top: "1.25rem",
              }}
              animate={{ scaleX: progressScale }}
              transition={{ duration: 0.5, ease: easeOutQuart }}
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
                    clickable && !active
                      ? "cursor-pointer"
                      : !clickable
                        ? "cursor-not-allowed"
                        : "",
                  )}
                >
                  <motion.div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors duration-300",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_4px_14px_-3px_oklch(0.5_0.22_254/0.45)]"
                        : completed
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground",
                    )}
                    animate={{ scale: active ? 1.08 : 1 }}
                    transition={{ duration: 0.3, ease: easeOutQuart }}
                  >
                    {completed ? (
                      <motion.span
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.35, ease: easeOutQuart }}
                      >
                        <Check className="h-4 w-4" strokeWidth={3} />
                      </motion.span>
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </motion.div>

                  <span
                    className={cn(
                      "text-xs font-semibold transition-colors duration-200 hidden sm:block",
                      active
                        ? "text-foreground"
                        : completed
                          ? "text-muted-foreground"
                          : "text-muted-foreground/40",
                    )}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </FadeIn>
    </div>
  );
}
