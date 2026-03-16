"use client";

import { X } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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

interface CollectionOption {
  _id: Id<"collections">;
  title: string;
}

interface MappingRulesStepProps {
  sections?: CollectionOption[];
  selectedSection: Id<"collections"> | "";
  keywordInput: string;
  keywordPresets: string[];
  keywordList: string[];
  keywordValid: boolean;
  onSelectSection: (collectionId: Id<"collections">) => void;
  onKeywordInputChange: (value: string) => void;
  onTogglePreset: (preset: string) => void;
  onRemoveKeyword: (keyword: string) => void;
}

export default function MappingRulesStep({
  sections,
  selectedSection,
  keywordInput,
  keywordPresets,
  keywordList,
  keywordValid,
  onSelectSection,
  onKeywordInputChange,
  onTogglePreset,
  onRemoveKeyword,
}: MappingRulesStepProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Collection</h2>
        <p className="text-xs text-muted-foreground">
          Choose which collection you want to automate DMs for.
        </p>
        <Select
          value={selectedSection}
          onValueChange={(value) => onSelectSection(value as Id<"collections">)}
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
        <h2 className="text-lg font-semibold">Trigger Keywords</h2>
        <Input
          value={keywordInput}
          onChange={(event) =>
            onKeywordInputChange(event.target.value.toLowerCase())
          }
          placeholder="link, dm, details"
        />
        <p className="text-xs text-muted-foreground">
          Separate keywords with commas. Comments matching any keyword will
          trigger DMs.
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
                onClick={() => onTogglePreset(preset)}
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
                  onClick={() => onRemoveKeyword(value)}
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
          <AlertDescription>Add a keyword to continue.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
