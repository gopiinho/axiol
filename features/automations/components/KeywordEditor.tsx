"use client";

import { Hash, X } from "lucide-react";

interface KeywordEditorProps {
  keywordInput: string;
  keywordPresets: string[];
  keywordList: string[];
  keywordValid: boolean;
  onKeywordInputChange: (value: string) => void;
  onTogglePreset: (preset: string) => void;
  onRemoveKeyword: (keyword: string) => void;
  showPresets?: boolean;
  showValidation?: boolean;
}

export default function KeywordEditor({
  keywordInput,
  keywordPresets,
  keywordList,
  keywordValid,
  onKeywordInputChange,
  onTogglePreset,
  onRemoveKeyword,
  showPresets = true,
  showValidation = true,
}: KeywordEditorProps) {
  return (
    <div className="space-y-6">
      <div className="relative">
        <Hash className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          id="keywords"
          value={keywordInput}
          onChange={(event) => onKeywordInputChange(event.target.value.toLowerCase())}
          placeholder="link, dm, details"
          className="border-border bg-card focus:border-foreground/40 w-full rounded-xs border py-2.5 pr-3 pl-9 text-sm transition outline-none"
        />
      </div>

      {showPresets && keywordPresets.length > 0 && (
        <div>
          <p className="text-muted-foreground mb-2 text-sm font-semibold">Presets</p>
          <div className="flex flex-wrap gap-1.5">
            {keywordPresets.map((preset) => {
              const isActive = keywordList.includes(preset);
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onTogglePreset(preset)}
                  className={`cursor-pointer rounded-xs border px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-foreground text-background"
                      : "hover:border-border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {preset.charAt(0).toUpperCase() + preset.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {keywordList.length > 0 && (
        <div>
          <p className="text-muted-foreground mb-2 text-sm font-semibold">
            Active keywords ({keywordList.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {keywordList.map((value) => (
              <span
                key={value}
                className="bg-foreground/5 text-foreground border-border inline-flex items-center gap-2 rounded-xs border px-3 py-2 text-sm font-medium"
              >
                <span className="flex-1">{value.charAt(0).toUpperCase() + value.slice(1)}</span>
                <button
                  type="button"
                  onClick={() => onRemoveKeyword(value)}
                  className="hover:bg-foreground/10 cursor-pointer rounded-xs p-0.5 transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {showValidation && !keywordValid && (
        <div>
          <p className="text-destructive mb-2 text-sm font-semibold">Warning</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-destructive inline-flex items-center text-sm font-medium">
              At least one keyword is required!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
