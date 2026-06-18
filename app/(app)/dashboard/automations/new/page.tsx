"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAction, useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "@/features/auth/client/UserContext";
import { useInstagramConnection } from "@/features/automations/hooks/useInstagramConnection";
import InstagramConnectOverlay from "@/features/automations/components/InstagramConnectOverlay";
import {
  DEFAULT_KEYWORD_PRESETS,
  KEYWORD_PRESET_STORAGE_KEY,
  parseKeywords,
} from "@/features/automations/lib/keywords";
import type { Reel } from "@/features/automations/types";
import CreateFlowHeader from "@/features/automations/components/CreateFlowHeader";
import ProductSelectionStep from "@/features/automations/components/ProductSelectionStep";
import ReelSelectionStep from "@/features/automations/components/ReelSelectionStep";
import MappingRulesStep from "@/features/automations/components/MappingRulesStep";
import DmPreviewStep from "@/features/automations/components/DmPreviewStep";
import CreateFlowFooter from "@/features/automations/components/CreateFlowFooter";

const TOTAL_STEPS = 4;

export default function CreateAutomationPage() {
  useUser();
  const ig = useInstagramConnection();

  if (ig.status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="border-muted h-8 w-8 animate-spin rounded-full border-4 border-t-pink-500" />
      </div>
    );
  }

  if (!ig.isUsable) {
    return <InstagramConnectOverlay />;
  }

  return <CreateAutomationWizard />;
}

function CreateAutomationWizard() {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState<Id<"products"> | "">("");
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [keywordInput, setKeywordInput] = useState("link");
  const [keywordPresets, setKeywordPresets] = useState<string[]>(DEFAULT_KEYWORD_PRESETS);
  const [isSaving, setIsSaving] = useState(false);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [reelsError, setReelsError] = useState<string | null>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generatePreview, setGeneratePreview] = useState<{
    message: string;
    itemCount: number;
    characterCount: number;
  } | null>(null);

  const convex = useConvex();
  const products = useQuery(api.products.listForSelect);
  const fetchReels = useAction(api.instagram.fetchRecentReels);
  const createMapping = useMutation(api.instagram.createReelMapping);

  const keywordList = useMemo(() => parseKeywords(keywordInput), [keywordInput]);
  const keywordNormalized = useMemo(() => keywordList.join(","), [keywordList]);
  const keywordValid = keywordList.length > 0;
  const canPreview = Boolean(selectedProductId);

  useEffect(() => {
    if (!canPreview) {
      setGeneratePreview(null);
      setPreviewError(null);
      setPreviewLoading(false);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      setPreviewLoading(true);
      setPreviewError(null);

      void convex
        .query(api.instagram.generateDMMessage, {
          productId: selectedProductId as Id<"products">,
          triggerType: "comment",
        })
        .then((result) => {
          if (cancelled) return;
          setGeneratePreview(result);
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setGeneratePreview(null);
          setPreviewError(
            error instanceof Error ? error.message : "Failed to generate message preview."
          );
        })
        .finally(() => {
          if (cancelled) return;
          setPreviewLoading(false);
        });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [convex, canPreview, selectedProductId]);

  const stepMeta = useMemo(
    () => [
      { id: 1, title: "Product" },
      { id: 2, title: "Reel" },
      { id: 3, title: "Keywords" },
      { id: 4, title: "Preview" },
    ],
    []
  );

  const goToStep = (nextStep: number) => {
    if (nextStep < 1 || nextStep > TOTAL_STEPS) return;
    setCurrentStep(nextStep);
  };

  const canGoToStep = useCallback(
    (step: number) => {
      if (step === 1) return true;
      if (step === 2) return Boolean(selectedProductId);
      if (step === 3) return Boolean(selectedProductId) && Boolean(selectedReel);
      if (step === 4) return Boolean(selectedProductId) && Boolean(selectedReel) && keywordValid;
      return false;
    },
    [selectedProductId, selectedReel, keywordValid]
  );

  const persistPresets = useCallback((presets: string[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEYWORD_PRESET_STORAGE_KEY, JSON.stringify(presets));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedValue = window.localStorage.getItem(KEYWORD_PRESET_STORAGE_KEY);
    if (!storedValue) return;

    try {
      const parsed = JSON.parse(storedValue) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setKeywordPresets(
          Array.from(new Set(parsed.map((value) => value.trim().toLowerCase()).filter(Boolean)))
        );
      }
    } catch {
      setKeywordPresets(DEFAULT_KEYWORD_PRESETS);
    }
  }, []);

  const rememberKeywords = useCallback(
    (keywordsToRemember: string[]) => {
      if (keywordsToRemember.length === 0) return;

      setKeywordPresets((previous) => {
        const next = Array.from(new Set([...keywordsToRemember, ...previous])).slice(0, 16);
        persistPresets(next);
        return next;
      });
    },
    [persistPresets]
  );

  const addPresetToInput = (preset: string) => {
    const nextKeywords = Array.from(new Set([...keywordList, preset]));
    setKeywordInput(nextKeywords.join(", "));
  };

  const removeKeywordFromInput = (keywordToRemove: string) => {
    const nextKeywords = keywordList.filter((value) => value !== keywordToRemove);
    setKeywordInput(nextKeywords.join(", "));
  };

  const togglePresetKeyword = (preset: string) => {
    if (keywordList.includes(preset)) {
      removeKeywordFromInput(preset);
      return;
    }

    addPresetToInput(preset);
  };

  const loadReels = useCallback(async () => {
    setReelsLoading(true);
    setReelsError(null);

    try {
      const fetchedReels = await fetchReels({});
      setReels(fetchedReels);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch reels. Please try again.";
      setReelsError(message);
    } finally {
      setReelsLoading(false);
    }
  }, [fetchReels]);

  useEffect(() => {
    void loadReels();
  }, [loadReels]);

  const handleSave = async () => {
    if (!selectedReel || !selectedProductId || !keywordValid) {
      return;
    }

    setIsSaving(true);
    try {
      await createMapping({
        reelId: selectedReel.id,
        reelUrl: selectedReel.url,
        thumbnailUrl: selectedReel.thumbnailUrl,
        caption: selectedReel.caption,
        productId: selectedProductId,
        keyword: keywordNormalized,
      });

      rememberKeywords(keywordList);
      router.push("/dashboard/automations");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save draft";
      setSaveError(message === "Unauthorized" ? "Session expired. Please sign in again." : message);
    } finally {
      setIsSaving(false);
    }
  };

  const canContinueFromCurrentStep = useCallback(() => {
    if (currentStep === 1) return Boolean(selectedProductId);
    if (currentStep === 2) return Boolean(selectedReel);
    if (currentStep === 3) return keywordValid;
    if (currentStep === 4)
      return Boolean(selectedReel) && Boolean(selectedProductId) && keywordValid;
    return false;
  }, [currentStep, selectedProductId, selectedReel, keywordValid]);

  const primaryActionDisabled = isSaving || !canContinueFromCurrentStep();

  const handlePrimaryAction = () => {
    if (currentStep < TOTAL_STEPS) {
      goToStep(currentStep + 1);
      return;
    }
    void handleSave();
  };

  const handleBackAction = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProductSelectionStep
            products={products ?? undefined}
            selectedProductId={selectedProductId}
            onSelectProduct={setSelectedProductId}
          />
        );
      case 2:
        return (
          <ReelSelectionStep
            reels={reels}
            selectedReelId={selectedReel?.id}
            reelsLoading={reelsLoading}
            reelsError={reelsError}
            instagramStatus="connected"
            onRetry={() => void loadReels()}
            onSelectReel={setSelectedReel}
          />
        );
      case 3:
        return (
          <MappingRulesStep
            keywordInput={keywordInput}
            keywordPresets={keywordPresets}
            keywordList={keywordList}
            keywordValid={keywordValid}
            onKeywordInputChange={setKeywordInput}
            onTogglePreset={togglePresetKeyword}
            onRemoveKeyword={removeKeywordFromInput}
          />
        );
      case 4:
        return (
          <DmPreviewStep
            canPreview={canPreview}
            previewLoading={previewLoading}
            previewError={previewError}
            previewMessage={generatePreview?.message}
            characterCount={generatePreview?.characterCount}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full">
      <div className="overflow-hidden">
        <CreateFlowHeader
          currentStep={currentStep}
          stepMeta={stepMeta}
          canGoToStep={canGoToStep}
          onGoToStep={goToStep}
        />

        <div className="mb-20 min-h-135 px-5 py-4 lg:px-6">
          <div>{renderStepContent()}</div>
        </div>
      </div>

      <CreateFlowFooter
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        isSaving={isSaving}
        primaryActionDisabled={primaryActionDisabled}
        onBack={handleBackAction}
        onPrimaryAction={handlePrimaryAction}
      />

      <Dialog open={Boolean(saveError)} onOpenChange={(open) => !open && setSaveError(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Couldn&apos;t save draft</DialogTitle>
            <DialogDescription>{saveError ?? "Please try again."}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSaveError(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
