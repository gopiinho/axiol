"use client";

import { useCallback } from "react";
import { Check, Layout } from "lucide-react";
import {
  LAYOUT_PRESETS,
  type LayoutConfig,
  type CardStyleValue,
  type HeaderLayoutValue,
  sliderToRadius,
  radiusToSlider,
  sliderToSpacing,
  spacingToSlider,
  sliderToTypeScale,
  typeScaleToSlider,
} from "@/lib/themes";

type LayoutPickerProps = {
  layout: LayoutConfig;
  onLayoutChange: (layout: LayoutConfig) => void;
};

const CARD_STYLE_OPTIONS: { value: CardStyleValue; label: string }[] = [
  { value: "flat", label: "Flat" },
  { value: "shadow", label: "Shadow" },
  { value: "layered", label: "Layered" },
];

const HEADER_OPTIONS: { value: HeaderLayoutValue; label: string }[] = [
  { value: "centered", label: "Centered" },
  { value: "left", label: "Left" },
  { value: "card", label: "Card" },
];

function PresetPreview({ config }: { config: LayoutConfig }) {
  const radiusRem = config.borderRadius === "sharp" ? 0.25 : config.borderRadius === "subtle" ? 0.5 : config.borderRadius === "round" ? 1 : 1.5;
  const isShadow = config.cardStyle === "shadow";
  const isLayered = config.cardStyle === "layered";

  return (
    <div className="relative w-full flex justify-center">
      <div
        className="h-6 w-10 rounded-sm"
        style={{
          borderRadius: `${radiusRem * 0.5}rem`,
          borderWidth: config.cardStyle === "flat" ? 2 : 1,
          borderStyle: "solid",
          borderColor: "var(--border)",
          backgroundColor: "var(--card)",
        }}
      />
    </div>
  );
}

export function LayoutPicker({ layout, onLayoutChange }: LayoutPickerProps) {
  const sliderPos = radiusToSlider(layout.borderRadius);
  const spacingVal = spacingToSlider(layout.spacing);
  const typeVal = typeScaleToSlider(layout.typeScale);

  const radiusLabel = `${Math.round((sliderPos / 100) * 24)}px`;

  const handlePresetSelect = useCallback(
    (presetKey: string) => {
      const preset = LAYOUT_PRESETS.find((p) => p.key === presetKey);
      if (preset) {
        onLayoutChange({ ...preset.config, preset: presetKey });
      }
    },
    [onLayoutChange]
  );

  const update = useCallback(
    (key: keyof LayoutConfig, value: string) => {
      onLayoutChange({ ...layout, preset: undefined, [key]: value });
    },
    [layout, onLayoutChange]
  );

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 px-1 pb-3">
        <Layout className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-semibold">Layout</p>
      </div>

      <div className="px-1 py-1.5">
        <p className="mb-2 text-[11px] font-medium text-muted-foreground tracking-wide">Presets</p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {LAYOUT_PRESETS.map((p) => {
            const isSelected =
              p.config.borderRadius === layout.borderRadius &&
              p.config.cardStyle === layout.cardStyle &&
              p.config.spacing === layout.spacing &&
              p.config.headerLayout === layout.headerLayout &&
              p.config.typeScale === layout.typeScale;
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
                <PresetPreview config={p.config} />
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

      <div className="px-1 py-3 space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium">Rounding</span>
            <span className="font-mono text-[10px] text-muted-foreground tabular-nums">{radiusLabel}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={sliderPos}
            onChange={(e) => update("borderRadius", sliderToRadius(Number(e.target.value)))}
            className="w-full h-1.5 appearance-none bg-border/60 rounded-full accent-primary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground/50">
            <span>0px</span>
            <span>24px</span>
          </div>
        </div>

        <div>
          <span className="text-xs font-medium">Card Style</span>
          <div className="mt-1.5 flex gap-1">
            {CARD_STYLE_OPTIONS.map((opt) => {
              const active = layout.cardStyle === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("cardStyle", opt.value)}
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

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium">Spacing</span>
            <span className="text-[10px] text-muted-foreground">
              {spacingVal <= 15 ? "Compact" : spacingVal >= 85 ? "Loose" : "Standard"}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={spacingVal}
            onChange={(e) => update("spacing", sliderToSpacing(Number(e.target.value)))}
            className="w-full h-1.5 appearance-none bg-border/60 rounded-full accent-primary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground/50">
            <span>Compact</span>
            <span>Loose</span>
          </div>
        </div>

        <div>
          <span className="text-xs font-medium">Header</span>
          <div className="mt-1.5 flex gap-1">
            {HEADER_OPTIONS.map((opt) => {
              const active = layout.headerLayout === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update("headerLayout", opt.value)}
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

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium">Type Scale</span>
            <span className="text-[10px] text-muted-foreground">
              {typeVal <= 15 ? "Small" : typeVal >= 85 ? "Large" : "Medium"}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={typeVal}
            onChange={(e) => update("typeScale", sliderToTypeScale(Number(e.target.value)))}
            className="w-full h-1.5 appearance-none bg-border/60 rounded-full accent-primary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="mt-0.5 flex justify-between text-[9px] text-muted-foreground/50">
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>
      </div>
    </div>
  );
}
