"use client";

import { X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MappingRulesStepProps {
  keywordInput: string;
  keywordPresets: string[];
  keywordList: string[];
  keywordValid: boolean;
  onKeywordInputChange: (value: string) => void;
  onTogglePreset: (preset: string) => void;
  onRemoveKeyword: (keyword: string) => void;
}

export default function MappingRulesStep({
  keywordInput,
  keywordPresets,
  keywordList,
  keywordValid,
  onKeywordInputChange,
  onTogglePreset,
  onRemoveKeyword,
}: MappingRulesStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Trigger Keywords</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          When someone comments any of these words on your reel, they get a DM.
          Separate with commas.
        </p>
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="keywords">Keywords</Label>
        <Input
          id="keywords"
          value={keywordInput}
          onChange={(event) =>
            onKeywordInputChange(event.target.value.toLowerCase())
          }
          placeholder="link, dm, details"
        />
      </div>

      {keywordPresets.length > 0 && (
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
                  onClick={() => onTogglePreset(preset)}
                  className="h-7 rounded-full px-3 text-xs"
                >
                  {preset}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {keywordList.length > 0 && (
        <div className="app-panel-soft p-3.5">
          <p className="mb-2.5 text-xs font-medium text-muted-foreground">
            Active keywords ({keywordList.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {keywordList.map((value) => (
              <Badge
                key={value}
                variant="secondary"
                className="gap-1 rounded-full px-2.5 py-1"
              >
                {value}
                <button
                  type="button"
                  onClick={() => onRemoveKeyword(value)}
                  className="ml-0.5 rounded-full p-0.5 transition hover:bg-foreground/10"
                >
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
          <AlertDescription>Add a keyword to continue.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
