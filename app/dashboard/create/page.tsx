"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAction, useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { AnimatePresence, motion } from "motion/react";
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
import { useInstagramConnection } from "@/features/instagram-mappings/hooks/useInstagramConnection";
import {
  DEFAULT_KEYWORD_PRESETS,
  KEYWORD_PRESET_STORAGE_KEY,
  parseKeywords,
} from "@/features/instagram-mappings/lib/keywords";
import type { Reel } from "@/features/instagram-mappings/types";
import CreateFlowHeader from "@/features/instagram-mappings/components/create-flow/CreateFlowHeader";
import ReelSelectionStep from "@/features/instagram-mappings/components/create-flow/ReelSelectionStep";
import MappingRulesStep from "@/features/instagram-mappings/components/create-flow/MappingRulesStep";
import DmPreviewStep from "@/features/instagram-mappings/components/create-flow/DmPreviewStep";
import CreateFlowFooter from "@/features/instagram-mappings/components/create-flow/CreateFlowFooter";

export default function CreatePostPage() {
  const router = useRouter();
  const { token: authToken } = useUser();
  const ig = useInstagramConnection();
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [selectedSection, setSelectedSection] = useState<
    Id<"collections"> | ""
  >("");
  const [keywordInput, setKeywordInput] = useState("link");
  const [keywordPresets, setKeywordPresets] = useState<string[]>(
    DEFAULT_KEYWORD_PRESETS,
  );
  const [maxItemsInDM, setMaxItemsInDM] = useState(10);
  const [includeWebsiteLink, setIncludeWebsiteLink] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [reelsError, setReelsError] = useState<string | null>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState(1);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generatePreview, setGeneratePreview] = useState<{
    message: string;
    itemCount: number;
    characterCount: number;
  } | null>(null);

  const convex = useConvex();
  const sections = useQuery(
    api.collections.listByUser,
    authToken ? { token: authToken } : "skip",
  );
  const fetchReels = useAction(api.instagram.fetchRecentReels);
  const createMapping = useMutation(api.instagram.createReelMapping);

  const keywordList = useMemo(
    () => parseKeywords(keywordInput),
    [keywordInput],
  );
  const keywordNormalized = useMemo(() => keywordList.join(","), [keywordList]);
  const keywordValid = keywordList.length > 0;
  const maxItemsValid =
    Number.isInteger(maxItemsInDM) && maxItemsInDM >= 1 && maxItemsInDM <= 20;
  const canPreview = Boolean(selectedSection) && maxItemsValid;

  useEffect(() => {
    if (!canPreview || !authToken) {
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
          token: authToken,
          collectionId: selectedSection as Id<"collections">,
          maxItems: maxItemsInDM,
          includeWebsiteLink,
        })
        .then((result) => {
          if (cancelled) return;
          setGeneratePreview(result);
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          setGeneratePreview(null);
          setPreviewError(
            error instanceof Error
              ? error.message
              : "Failed to generate message preview.",
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
  }, [
    convex,
    canPreview,
    authToken,
    selectedSection,
    maxItemsInDM,
    includeWebsiteLink,
  ]);

  const stepMeta = useMemo(
    () => [
      { id: 1 as const, title: "Select Reel" },
      { id: 2 as const, title: "Collection + Keyword" },
      { id: 3 as const, title: "DM + Preview" },
    ],
    [],
  );

  const goToStep = (nextStep: 1 | 2 | 3) => {
    setDirection(nextStep > currentStep ? 1 : -1);
    setCurrentStep(nextStep);
  };

  const persistPresets = useCallback((presets: string[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      KEYWORD_PRESET_STORAGE_KEY,
      JSON.stringify(presets),
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedValue = window.localStorage.getItem(KEYWORD_PRESET_STORAGE_KEY);
    if (!storedValue) return;

    try {
      const parsed = JSON.parse(storedValue) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setKeywordPresets(
          Array.from(
            new Set(
              parsed.map((value) => value.trim().toLowerCase()).filter(Boolean),
            ),
          ),
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
        const next = Array.from(
          new Set([...keywordsToRemember, ...previous]),
        ).slice(0, 16);
        persistPresets(next);
        return next;
      });
    },
    [persistPresets],
  );

  const addPresetToInput = (preset: string) => {
    const nextKeywords = Array.from(new Set([...keywordList, preset]));
    setKeywordInput(nextKeywords.join(", "));
  };

  const removeKeywordFromInput = (keywordToRemove: string) => {
    const nextKeywords = keywordList.filter(
      (value) => value !== keywordToRemove,
    );
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
    if (!ig.isUsable || !authToken) {
      setReelsLoading(false);
      return;
    }

    setReelsLoading(true);
    setReelsError(null);

    try {
      const fetchedReels = await fetchReels({ token: authToken });
      setReels(fetchedReels);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch reels. Please try again.";
      setReelsError(message);
    } finally {
      setReelsLoading(false);
    }
  }, [fetchReels, authToken, ig.isUsable]);

  useEffect(() => {
    void loadReels();
  }, [loadReels]);

  const handleSaveDraft = async () => {
    if (!selectedReel || !selectedSection || !keywordValid || !maxItemsValid) {
      return;
    }

    setIsSavingDraft(true);
    try {
      if (!authToken) {
        throw new Error("Unauthorized");
      }

      await createMapping({
        token: authToken,
        reelId: selectedReel.id,
        reelUrl: selectedReel.url,
        thumbnailUrl: selectedReel.thumbnailUrl,
        caption: selectedReel.caption,
        collectionId: selectedSection,
        keyword: keywordNormalized,
        maxItemsInDM,
        includeWebsiteLink,
      });

      rememberKeywords(keywordList);
      router.push("/dashboard/drafts");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save draft";
      setSaveError(
        message === "Unauthorized"
          ? "Session expired. Please sign in again."
          : message,
      );
    } finally {
      setIsSavingDraft(false);
    }
  };

  const canContinueFromStep1 = Boolean(selectedReel);
  const canContinueFromStep2 = Boolean(selectedSection) && keywordValid;

  const primaryActionDisabled =
    (currentStep === 1 && !canContinueFromStep1) ||
    (currentStep === 2 && !canContinueFromStep2) ||
    (currentStep === 3 &&
      (isSavingDraft ||
        !selectedReel ||
        !selectedSection ||
        !keywordValid ||
        !maxItemsValid));

  const handlePrimaryAction = () => {
    if (currentStep === 1) {
      goToStep(2);
      return;
    }

    if (currentStep === 2) {
      goToStep(3);
      return;
    }

    void handleSaveDraft();
  };

  const handleBackAction = () => {
    if (currentStep === 3) {
      goToStep(2);
      return;
    }

    if (currentStep === 2) {
      goToStep(1);
    }
  };

  return (
    <div className="mx-auto w-full pb-44 md:pb-28">
      <div className="overflow-hidden">
        <CreateFlowHeader
          currentStep={currentStep}
          stepMeta={stepMeta}
          canContinueFromStep1={canContinueFromStep1}
          canContinueFromStep2={canContinueFromStep2}
          onBack={() => router.back()}
          onGoToStep={goToStep}
        />

        <div className="min-h-135 p-4 sm:p-6">
          <AnimatePresence mode="wait" initial={false}>
            {currentStep === 1 && (
              <motion.section
                key="step-1"
                initial={{ opacity: 0, x: direction > 0 ? 36 : -36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -36 : 36 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <ReelSelectionStep
                  reels={reels}
                  selectedReelId={selectedReel?.id}
                  reelsLoading={reelsLoading}
                  reelsError={reelsError}
                  instagramStatus={ig.status}
                  onRetry={() => void loadReels()}
                  onSelectReel={setSelectedReel}
                />
              </motion.section>
            )}

            {currentStep === 2 && (
              <motion.section
                key="step-2"
                initial={{ opacity: 0, x: direction > 0 ? 36 : -36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -36 : 36 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <MappingRulesStep
                  sections={sections ?? undefined}
                  selectedSection={selectedSection}
                  keywordInput={keywordInput}
                  keywordPresets={keywordPresets}
                  keywordList={keywordList}
                  keywordValid={keywordValid}
                  onSelectSection={setSelectedSection}
                  onKeywordInputChange={setKeywordInput}
                  onTogglePreset={togglePresetKeyword}
                  onRemoveKeyword={removeKeywordFromInput}
                />
              </motion.section>
            )}

            {currentStep === 3 && (
              <motion.section
                key="step-3"
                initial={{ opacity: 0, x: direction > 0 ? 36 : -36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -36 : 36 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <DmPreviewStep
                  maxItemsInDM={maxItemsInDM}
                  includeWebsiteLink={includeWebsiteLink}
                  maxItemsValid={maxItemsValid}
                  canPreview={canPreview}
                  previewLoading={previewLoading}
                  previewError={previewError}
                  generatePreview={generatePreview ?? undefined}
                  onMaxItemsChange={setMaxItemsInDM}
                  onIncludeWebsiteLinkChange={setIncludeWebsiteLink}
                />
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CreateFlowFooter
        currentStep={currentStep}
        isSavingDraft={isSavingDraft}
        primaryActionDisabled={primaryActionDisabled}
        onBack={handleBackAction}
        onPrimaryAction={handlePrimaryAction}
      />

      <Dialog
        open={Boolean(saveError)}
        onOpenChange={(open) => !open && setSaveError(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Couldn&apos;t save draft</DialogTitle>
            <DialogDescription>
              {saveError ?? "Please try again."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSaveError(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
