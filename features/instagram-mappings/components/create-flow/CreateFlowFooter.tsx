"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateFlowFooterProps {
  currentStep: 1 | 2 | 3;
  isSavingDraft: boolean;
  primaryActionDisabled: boolean;
  onBack: () => void;
  onPrimaryAction: () => void;
}

export default function CreateFlowFooter({
  currentStep,
  isSavingDraft,
  primaryActionDisabled,
  onBack,
  onPrimaryAction,
}: CreateFlowFooterProps) {
  return (
    <div className="fixed inset-x-0 bottom-16 z-60 border-t bg-background/95 backdrop-blur md:bottom-0">
      <div className="mx-auto flex w-full max-w-md gap-2 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:max-w-xl lg:max-w-2xl">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={onPrimaryAction}
          disabled={primaryActionDisabled}
        >
          {currentStep === 3 ? (
            isSavingDraft ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Save Draft
              </>
            )
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
