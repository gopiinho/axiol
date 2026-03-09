"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Id } from "@/convex/_generated/dataModel";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getAuthToken } from "@/lib/auth";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

type Reel = {
  id: string;
  url: string;
  caption: string;
  thumbnailUrl: string;
  timestamp: string;
};

const PRESET_STORAGE_KEY = "nemeowww.create.keyword-presets";
const DEFAULT_KEYWORD_PRESETS = ["link", "dm", "details", "shop", "price"];

function parseKeywords(rawValue: string) {
  return Array.from(
    new Set(
      rawValue
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

export default function CreatePostPage() {
  const router = useRouter();
  const authToken = getAuthToken();
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [selectedSection, setSelectedSection] = useState<Id<"sections"> | "">(
    "",
  );
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

  const sections = useQuery(api.sections.list);
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

  const generatePreview = useQuery(
    api.instagram.generateDMMessage,
    canPreview
      ? {
          sectionId: selectedSection as Id<"sections">,
          maxItems: maxItemsInDM,
          includeWebsiteLink,
        }
      : "skip",
  );

  const previewLoading = canPreview && generatePreview === undefined;

  const stepMeta = useMemo(
    () => [
      { id: 1, title: "Select Reel" },
      { id: 2, title: "Collection + Keyword" },
      { id: 3, title: "DM + Preview" },
    ],
    [],
  );

  const goToStep = (nextStep: 1 | 2 | 3) => {
    setDirection(nextStep > currentStep ? 1 : -1);
    setCurrentStep(nextStep);
  };

  const persistPresets = useCallback((presets: string[]) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedValue = window.localStorage.getItem(PRESET_STORAGE_KEY);
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
    const nextKeywords = keywordList.filter((value) => value !== keywordToRemove);
    setKeywordInput(nextKeywords.join(", "));
  };

  const loadReels = useCallback(async () => {
    setReelsLoading(true);
    setReelsError(null);

    try {
      if (!authToken) {
        throw new Error("Unauthorized");
      }

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
  }, [fetchReels, authToken]);

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
        sectionId: selectedSection,
        keyword: keywordNormalized,
        maxItemsInDM,
        includeWebsiteLink,
      });

      rememberKeywords(keywordList);
      router.push("/dashboard/drafts");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save draft";
      setSaveError(message === "Unauthorized" ? "Session expired. Please sign in again." : message);
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
    <div className="mx-auto w-full max-w-md pb-44 sm:max-w-xl md:pb-28 lg:max-w-2xl">
      <div className="overflow-hidden rounded-[2rem] border bg-white shadow-xl">
        <div className="border-b bg-gradient-to-br from-pink-50 via-white to-rose-50 p-5 sm:p-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mb-3 -ml-2 h-8 px-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Create
              </p>
              <h1 className="text-xl font-semibold tracking-tight">
                Create New Post
              </h1>
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
                    goToStep(1);
                  } else if (step.id === 2 && canContinueFromStep1) {
                    goToStep(2);
                  } else if (step.id === 3 && canContinueFromStep2) {
                    goToStep(3);
                  }
                }}
                className={`rounded-xl border px-2 py-2 text-left transition ${
                  currentStep === step.id
                    ? "border-pink-400 bg-pink-50"
                    : "border-border bg-white"
                }`}
              >
                <p className="text-[10px] text-muted-foreground">
                  Step {step.id}
                </p>
                <p className="truncate text-xs font-medium">{step.title}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[540px] p-4 sm:p-6">
          <AnimatePresence mode="wait" initial={false}>
            {currentStep === 1 && (
              <motion.section
                key="step-1"
                initial={{ opacity: 0, x: direction > 0 ? 36 : -36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -36 : 36 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-lg font-semibold">Select a Reel</h2>
                  <p className="text-sm text-muted-foreground">
                    Showing the latest {reels.length} reels (current fetch
                    limit: 20).
                  </p>
                </div>

                {reelsLoading ? (
                  <div className="space-y-3">
                    <div className="h-28 animate-pulse rounded-2xl bg-muted" />
                    <div className="h-28 animate-pulse rounded-2xl bg-muted" />
                    <div className="h-28 animate-pulse rounded-2xl bg-muted" />
                  </div>
                ) : reelsError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Couldn&apos;t load reels</AlertTitle>
                    <AlertDescription className="space-y-3">
                      <p>{reelsError}</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={loadReels}
                      >
                        Try again
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : reels.length === 0 ? (
                  <Alert>
                    <AlertTitle>No reels found</AlertTitle>
                    <AlertDescription>
                      No recent reels are available for this account yet.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {reels.map((reel) => (
                      <button
                        type="button"
                        key={reel.id}
                        onClick={() => setSelectedReel(reel)}
                        className={`group overflow-hidden rounded-2xl border text-left transition ${
                          selectedReel?.id === reel.id
                            ? "border-pink-500 bg-pink-50"
                            : "border-border bg-card"
                        }`}
                      >
                        <div className="aspect-[4/5] overflow-hidden bg-muted">
                          {reel.thumbnailUrl ? (
                            <Image
                              src={reel.thumbnailUrl}
                              alt="Reel"
                              width={420}
                              height={520}
                              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                              No thumbnail
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 p-2.5">
                          <p className="line-clamp-2 text-xs font-medium">
                            {reel.caption}
                          </p>
                          <a
                            href={reel.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            onClick={(event) => event.stopPropagation()}
                          >
                            Open reel
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.section>
            )}

            {currentStep === 2 && (
              <motion.section
                key="step-2"
                initial={{ opacity: 0, x: direction > 0 ? 36 : -36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -36 : 36 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-lg font-semibold">
                    Collection + Keywords
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose where products come from and add comma-separated
                    trigger keywords.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Collection</Label>
                  <Select
                    value={selectedSection}
                    onValueChange={(value) =>
                      setSelectedSection(value as Id<"sections">)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose collection..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sections?.map((section) => (
                        <SelectItem key={section._id} value={section._id}>
                          {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Trigger Keywords</Label>
                  <Input
                    value={keywordInput}
                    onChange={(event) =>
                      setKeywordInput(event.target.value.toLowerCase())
                    }
                    placeholder="link, dm, details"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate keywords with commas. Comments matching any keyword
                    will trigger DMs.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Saved presets
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {keywordPresets.map((preset) => {
                      const isActive = keywordList.includes(preset);
                      return (
                        <Button
                          key={preset}
                          type="button"
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            isActive
                              ? removeKeywordFromInput(preset)
                              : addPresetToInput(preset)
                          }
                          className="h-7 rounded-full px-3 text-xs"
                        >
                          {preset}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {keywordList.length > 0 && (
                  <div className="rounded-xl border bg-muted/20 p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Active keywords ({keywordList.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {keywordList.map((value) => (
                        <Badge
                          key={value}
                          variant="secondary"
                          className="rounded-full px-2 py-1"
                        >
                          <button
                            type="button"
                            className="inline-flex items-center gap-1"
                            onClick={() => removeKeywordFromInput(value)}
                          >
                            <span>{value}</span>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {!keywordValid && (
                  <Alert variant="destructive">
                    <AlertTitle>At least one keyword is required</AlertTitle>
                    <AlertDescription>
                      Add a keyword to continue.
                    </AlertDescription>
                  </Alert>
                )}
              </motion.section>
            )}

            {currentStep === 3 && (
              <motion.section
                key="step-3"
                initial={{ opacity: 0, x: direction > 0 ? 36 : -36 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -36 : 36 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-lg font-semibold">DM Config + Preview</h2>
                  <p className="text-sm text-muted-foreground">
                    Finalize DM details and check exactly what users receive.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Max Items in DM</Label>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={maxItemsInDM}
                    onChange={(event) =>
                      setMaxItemsInDM(Number(event.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose 1 to 20 items for the DM.
                  </p>
                </div>

                <div className="flex items-center space-x-2 rounded-xl border p-3">
                  <Checkbox
                    id="include-link"
                    checked={includeWebsiteLink}
                    onCheckedChange={(checked) =>
                      setIncludeWebsiteLink(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="include-link"
                    className="cursor-pointer text-sm"
                  >
                    Include website collection link in the DM
                  </Label>
                </div>

                {!maxItemsValid && (
                  <Alert variant="destructive">
                    <AlertTitle>Invalid DM item count</AlertTitle>
                    <AlertDescription>
                      Max items must be a whole number between 1 and 20.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="rounded-2xl border bg-muted/20 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <Label>Message Preview</Label>
                  </div>

                  {previewLoading ? (
                    <div className="space-y-2 rounded-xl border bg-background p-3">
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                      <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                    </div>
                  ) : !canPreview ? (
                    <Alert>
                      <AlertTitle>Preview unavailable</AlertTitle>
                      <AlertDescription>
                        Select a collection and valid DM item count to generate
                        a preview.
                      </AlertDescription>
                    </Alert>
                  ) : generatePreview && generatePreview.itemCount === 0 ? (
                    <Alert>
                      <AlertTitle>No items in this collection</AlertTitle>
                      <AlertDescription>
                        Add items to this collection to generate a DM preview.
                      </AlertDescription>
                    </Alert>
                  ) : generatePreview ? (
                    <>
                      <Textarea
                        value={generatePreview.message}
                        readOnly
                        rows={12}
                        className="bg-background font-mono text-xs"
                      />
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>Items: {generatePreview.itemCount}</span>
                        <span>
                          Characters: {generatePreview.characterCount}/1000
                        </span>
                        {generatePreview.characterCount > 1000 && (
                          <span className="font-medium text-destructive">
                            Too long: message will be truncated
                          </span>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-[60] border-t bg-background/95 backdrop-blur md:bottom-0">
        <div className="mx-auto flex w-full max-w-md gap-2 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:max-w-xl lg:max-w-2xl">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleBackAction}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handlePrimaryAction}
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
