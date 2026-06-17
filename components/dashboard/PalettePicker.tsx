"use client";

import { useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import { Check, Palette } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { PALETTE_PRESETS, type PaletteConfig, type BackgroundPatternValue } from "@/lib/themes";
import { resolvePalette, oklchToHex, hexToOklch } from "@/lib/colorUtils";

type PalettePickerProps = {
  palette: PaletteConfig;
  onPaletteChange: (palette: PaletteConfig) => void;
  backgroundPattern?: BackgroundPatternValue;
  onBackgroundPatternChange?: (pattern: BackgroundPatternValue) => void;
};

const PATTERN_OPTIONS: { value: BackgroundPatternValue; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "dots", label: "Dots" },
  { value: "gradient", label: "Gradient" },
];

const COLOR_FIELDS: { key: keyof PaletteConfig; label: string }[] = [
  { key: "bg", label: "Background" },
  { key: "accent", label: "Accent" },
  { key: "text", label: "Text" },
  { key: "textMuted", label: "Secondary Text" },
  { key: "border", label: "Border" },
  { key: "cardBg", label: "Card" },
];

export function PalettePicker({
  palette,
  onPaletteChange,
  backgroundPattern,
  onBackgroundPatternChange,
}: PalettePickerProps) {
  const resolved = resolvePalette(palette);

  const handlePresetSelect = useCallback(
    (presetKey: string) => {
      const preset = PALETTE_PRESETS.find((p) => p.key === presetKey);
      if (preset) {
        onPaletteChange(resolvePalette({ bg: preset.bg, accent: preset.accent }));
      }
    },
    [onPaletteChange]
  );

  const handleColorChange = useCallback(
    (key: keyof PaletteConfig, hex: string) => {
      onPaletteChange({ ...palette, [key]: hexToOklch(hex) });
    },
    [palette, onPaletteChange]
  );

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 px-1 pb-3">
        <Palette className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-semibold">Palette</p>
      </div>

      <div className="px-1 py-1.5">
        <p className="mb-2 text-[11px] font-medium text-muted-foreground tracking-wide">Presets</p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {PALETTE_PRESETS.map((p) => {
            const isSelected = palette.bg === p.bg && palette.accent === p.accent;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => handlePresetSelect(p.key)}
                className={`relative flex cursor-pointer flex-col items-center gap-1 rounded-xs border p-2 transition ${
                  isSelected
                    ? "border-foreground bg-foreground/[0.06]"
                    : "border-transparent hover:bg-foreground/[0.03]"
                }`}
              >
                <div
                  className="h-5 w-full rounded-xs"
                  style={{
                    background: `linear-gradient(135deg, ${p.bg} 50%, ${p.accent} 50%)`,
                  }}
                />
                <span className="text-[10px] font-medium">{p.label}</span>
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border/60" />

      <div className="px-1 py-3">
        <p className="mb-2 text-[11px] font-medium text-muted-foreground tracking-wide">Colors</p>
        <div className="space-y-1">
          {COLOR_FIELDS.map(({ key, label }) => {
            const storedOklch = (resolved[key] as string) || "#000000";
            const hex = oklchToHex(storedOklch);
            return (
              <div key={key} className="flex items-center justify-between py-1">
                <span className="text-xs font-medium w-24 shrink-0">{label}</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex cursor-pointer items-center gap-2 rounded-xs border border-border/50 bg-background px-2.5 py-1 text-left transition hover:border-border hover:bg-accent/5"
                    >
                      <span
                        className="h-4 w-4 shrink-0 rounded-[2px] border border-border/40"
                        style={{ backgroundColor: storedOklch }}
                      />
                      <span className="font-mono text-[11px] tabular-nums">{hex}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-3" align="start">
                    <HexColorPicker
                      color={hex}
                      onChange={(c) => handleColorChange(key, c)}
                      style={{ width: "100%", height: "140px" }}
                    />
                    <input
                      type="text"
                      value={hex}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="mt-2 w-full rounded-xs border border-border bg-background px-2 py-1.5 font-mono text-[11px]"
                      placeholder="#000000"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            );
          })}
        </div>
      </div>

      {onBackgroundPatternChange && (
        <>
          <div className="border-t border-border/60" />
          <div className="px-1 py-3">
            <p className="mb-2 text-[11px] font-medium text-muted-foreground tracking-wide">Background Pattern</p>
            <div className="flex gap-1">
              {PATTERN_OPTIONS.map((opt) => {
                const active = backgroundPattern === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onBackgroundPatternChange(opt.value)}
                    className={`flex-1 cursor-pointer rounded-xs px-2 py-1.5 text-[11px] font-medium transition ${
                      active
                        ? "bg-foreground text-background"
                        : "bg-background text-foreground border border-border hover:border-primary/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
