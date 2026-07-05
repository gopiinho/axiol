"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { PalettePicker } from "./PalettePicker";
import { LayoutPicker } from "./LayoutPicker";
import type { PaletteConfig, LayoutConfig, BackgroundPatternValue } from "@/lib/themes";

type ThemeEditorProps = {
  palette: PaletteConfig;
  onPaletteChange: (p: PaletteConfig) => void;
  layout: LayoutConfig;
  onLayoutChange: (l: LayoutConfig) => void;
  onSave: () => void;
  onCancel?: () => void;
  saving: boolean;
  dirty: boolean;
};

export function ThemeEditor({
  palette,
  onPaletteChange,
  layout,
  onLayoutChange,
  onSave,
  onCancel,
  saving,
  dirty,
}: ThemeEditorProps) {
  const handleBackgroundPatternChange = useCallback(
    (pattern: BackgroundPatternValue) => {
      onLayoutChange({ ...layout, preset: undefined, backgroundPattern: pattern });
    },
    [layout, onLayoutChange]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Edit Design</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onCancel} disabled={!dirty}>
            Cancel
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving || !dirty}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-2 lg:divide-x lg:divide-border/60">
        <div className="lg:pr-10">
          <PalettePicker
            palette={palette}
            onPaletteChange={onPaletteChange}
            backgroundPattern={layout.backgroundPattern}
            onBackgroundPatternChange={handleBackgroundPatternChange}
          />
        </div>
        <div className="lg:pl-10">
          <LayoutPicker layout={layout} onLayoutChange={onLayoutChange} />
        </div>
      </div>
    </div>
  );
}
