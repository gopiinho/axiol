"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateFlowFooterProps {
  currentStep: number;
  totalSteps: number;
  isSaving: boolean;
  primaryActionDisabled: boolean;
  onBack: () => void;
  onPrimaryAction: () => void;
}

export default function CreateFlowFooter({
  currentStep,
  totalSteps,
  isSaving,
  primaryActionDisabled,
  onBack,
  onPrimaryAction,
}: CreateFlowFooterProps) {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="bg-background/95 fixed inset-x-0 bottom-14 border-t backdrop-blur md:bottom-0">
      <div className="mx-auto flex w-full max-w-md gap-4 p-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:max-w-xl lg:max-w-2xl">
        <Button
          type="button"
          variant="outline"
          className="flex-1 text-xs"
          onClick={onBack}
          size="sm"
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          className="flex-1 text-xs"
          onClick={onPrimaryAction}
          size="sm"
          disabled={primaryActionDisabled}
        >
          {isLastStep ? (
            <>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Save Draft
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
