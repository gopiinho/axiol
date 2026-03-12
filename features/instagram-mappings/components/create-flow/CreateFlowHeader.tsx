"use client";

import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export default function CreateFlowHeader({
  currentStep,
  stepMeta,
  canContinueFromStep1,
  canContinueFromStep2,
  onBack,
  onGoToStep,
}: CreateFlowHeaderProps) {
  return (
    <div className="border-b bg-gradient-to-br from-pink-50 via-white to-rose-50 p-5 sm:p-6">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mb-3 -ml-2 h-8 px-2"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Create
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Create New Post</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Map a reel, set keyword rules, and preview your DM message.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          Step {currentStep} / 3
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {stepMeta.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => {
              if (step.id === 1) {
                onGoToStep(1);
              } else if (step.id === 2 && canContinueFromStep1) {
                onGoToStep(2);
              } else if (step.id === 3 && canContinueFromStep2) {
                onGoToStep(3);
              }
            }}
            className={`rounded-xl border px-2 py-2 text-left transition ${
              currentStep === step.id
                ? "border-pink-400 bg-pink-50"
                : "border-border bg-white"
            }`}
          >
            <p className="text-[10px] text-muted-foreground">Step {step.id}</p>
            <p className="truncate text-xs font-medium">{step.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
