"use client";

import KeywordEditor from "./KeywordEditor";

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
        <p className="text-muted-foreground mt-0.5 text-sm">
          When someone comments any of these words on your reel, they get a DM. Separate with
          commas.
        </p>
      </div>

      <KeywordEditor
        keywordInput={keywordInput}
        keywordPresets={keywordPresets}
        keywordList={keywordList}
        keywordValid={keywordValid}
        onKeywordInputChange={onKeywordInputChange}
        onTogglePreset={onTogglePreset}
        onRemoveKeyword={onRemoveKeyword}
      />
    </div>
  );
}
