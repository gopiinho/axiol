"use client";

import { FadeIn } from "@/components/motion/FadeIn";
import { motion } from "motion/react";
import { Check } from "lucide-react";

interface StepMeta {
  id: 1 | 2 | 3;
  title: string;
}

interface CreateFlowHeaderProps {
  currentStep: 1 | 2 | 3;
  stepMeta: StepMeta[];
  canContinueFromStep1: boolean;
  canContinueFromStep2: boolean;
  onBack: () => void;
  onGoToStep: (step: 1 | 2 | 3) => void;
}

const easeOutQuart: [number, number, number, number] = [0.25, 1, 0.5, 1];

export default function CreateFlowHeader({
  currentStep,
  stepMeta,
  canContinueFromStep1,
  canContinueFromStep2,
  onGoToStep,
}: CreateFlowHeaderProps) {
  const isClickable = (stepId: number) => {
    if (stepId === 1) return true;
    if (stepId === 2) return canContinueFromStep1;
    if (stepId === 3) return canContinueFromStep2;
    return false;
  };

  const isCompleted = (stepId: number) => currentStep > stepId;

  return (
    <div className="px-5 lg:px-6">
      <FadeIn>
        <section className="py-6 lg:py-8">
          <h1 className="app-title">Create New Post</h1>
          <p className="app-subtitle mt-1 max-w-md">
            Set up keyword-triggered auto-DMs for your Instagram reel.
          </p>
        </section>
      </FadeIn>

      <FadeIn delay={0.08}>
        <nav
          aria-label="Create flow steps"
          className="app-panel flex items-stretch gap-0 overflow-hidden p-1.5"
        >
          {stepMeta.map((step, i) => {
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
                className={`
                  group relative flex flex-1 items-center justify-center gap-2.5
                  rounded-xl px-3 py-3 text-sm font-semibold
                  transition-colors duration-200
                  ${
                    active
                      ? "text-primary"
                      : completed
                        ? "text-foreground/70"
                        : "text-muted-foreground"
                  }
                  ${
                    clickable && !active
                      ? "hover:text-foreground cursor-pointer"
                      : !clickable
                        ? "cursor-not-allowed opacity-40"
                        : ""
                  }
                `}
              >
                {active && (
                  <motion.div
                    layoutId="active-step-pill"
                    className="absolute inset-0 rounded-xl bg-primary/[0.08]"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                      mass: 0.8,
                    }}
                  />
                )}

                <motion.span
                  className={`
                    relative z-10 flex h-7 w-7 shrink-0 items-center justify-center
                    rounded-full text-xs font-extrabold transition-colors duration-200
                    ${
                      active
                        ? "bg-primary text-primary-foreground shadow-[0_2px_8px_-2px_oklch(0.5_0.22_254/0.4)]"
                        : completed
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                    }
                  `}
                  animate={{
                    scale: active ? 1 : 0.9,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: easeOutQuart,
                  }}
                >
                  {completed ? (
                    <motion.span
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        duration: 0.35,
                        ease: easeOutQuart,
                      }}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </motion.span>
                  ) : (
                    step.id
                  )}
                </motion.span>

                <span className="relative z-10 hidden sm:inline">
                  {step.title}
                </span>

                {i < stepMeta.length - 1 && (
                  <span
                    className="pointer-events-none absolute right-0 top-1/2 h-5 w-px -translate-y-1/2 bg-border"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </nav>
      </FadeIn>
    </div>
  );
}
