"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useToggleMapping, useUpdateMapping } from "@/features/automations/hooks/useAutomations";
import {
  DEFAULT_KEYWORD_PRESETS,
  KEYWORD_PRESET_STORAGE_KEY,
  parseKeywords,
} from "@/features/automations/lib/keywords";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Circle, Loader2 } from "lucide-react";
import KeywordEditor from "./KeywordEditor";

interface MappingData {
  _id: Id<"reelMappings">;
  reelId: string;
  reelUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  productId: Id<"products">;
  keyword: string;
  active: boolean;
  productName?: string;
}

interface EditAutomationDialogProps {
  mapping: MappingData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditAutomationDialog({
  mapping,
  open,
  onOpenChange,
}: EditAutomationDialogProps) {
  const toggleMapping = useToggleMapping();
  const updateMapping = useUpdateMapping();

  const [keywordInput, setKeywordInput] = useState("");
  const [keywordPresets, setKeywordPresets] = useState<string[]>(DEFAULT_KEYWORD_PRESETS);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const keywordList = useMemo(() => parseKeywords(keywordInput), [keywordInput]);
  const keywordValid = keywordList.length > 0;

  useEffect(() => {
    if (mapping) {
      setKeywordInput(mapping.keyword);
    }
  }, [mapping]);

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

  const addPreset = (preset: string) => {
    const next = Array.from(new Set([...keywordList, preset]));
    setKeywordInput(next.join(", "));
  };

  const removeKeyword = (kw: string) => {
    const next = keywordList.filter((v) => v !== kw);
    setKeywordInput(next.join(", "));
  };

  const togglePreset = (preset: string) => {
    if (keywordList.includes(preset)) {
      removeKeyword(preset);
    } else {
      addPreset(preset);
    }
  };

  const rememberKeywords = useCallback((kwList: string[]) => {
    if (kwList.length === 0) return;
    setKeywordPresets((prev) => {
      const next = Array.from(new Set([...kwList, ...prev])).slice(0, 16);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(KEYWORD_PRESET_STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const handleSave = async () => {
    if (!mapping || !keywordValid) return;
    setSaving(true);
    try {
      const normalized = keywordList.join(",");
      await updateMapping({ id: mapping._id, keyword: normalized });
      rememberKeywords(keywordList);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!mapping) return;
    setToggling(true);
    try {
      await toggleMapping({ id: mapping._id });
    } finally {
      setToggling(false);
    }
  };

  if (!mapping) return null;

  const hasChanges = keywordInput !== mapping.keyword;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-border/70 flex flex-row items-center justify-between border-b px-5 py-3.5">
          <DialogTitle className="text-lg font-semibold">Edit Automation</DialogTitle>
          <div className="flex items-center gap-3">
            <Switch
              id="automation-active"
              checked={mapping.active}
              onCheckedChange={handleToggle}
              disabled={toggling}
              className="data-[state=unchecked]:bg-white/20"
            />
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !keywordValid || !hasChanges}
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "" : "Save"}
            </Button>
          </div>
        </DialogHeader>

        <div className="px-5 py-5">
          <div
            className={
              mapping.active
                ? "bg-foreground/10 mb-5 flex items-center gap-2.5 rounded-r-xs border-l-2 border-l-emerald-500 px-4 py-3"
                : "bg-foreground/10 mb-5 flex items-center gap-2.5 rounded-r-xs border-l-2 border-l-amber-500 px-4 py-3"
            }
          >
            <Circle
              className={
                mapping.active
                  ? "h-2.5 w-2.5 fill-emerald-500 text-emerald-500"
                  : "h-2.5 w-2.5 fill-amber-500 text-amber-500"
              }
            />
            <div>
              <p className="text-sm font-semibold">{mapping.active ? "Active" : "Draft"}</p>
              <p className="text-muted-foreground text-xs">
                {mapping.active
                  ? "Auto-DM is enabled and responding to comments on this reel."
                  : "Not sending DMs yet. Toggle the switch to activate."}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground text-sm font-semibold">Trigger Keywords</Label>
            <p className="text-muted-foreground text-xs">
              When someone comments any of these words on your reel, they get a DM.
            </p>
            <div className="pt-2">
              <KeywordEditor
                keywordInput={keywordInput}
                keywordPresets={keywordPresets}
                keywordList={keywordList}
                keywordValid={keywordValid}
                onKeywordInputChange={setKeywordInput}
                onTogglePreset={togglePreset}
                onRemoveKeyword={removeKeyword}
                showPresets={keywordPresets.length > 0}
                showValidation={keywordInput !== ""}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
