"use client";

import { Eye } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface DmPreviewData {
  message: string;
  itemCount: number;
  characterCount: number;
}

interface DmPreviewStepProps {
  maxItemsInDM: number;
  includeWebsiteLink: boolean;
  maxItemsValid: boolean;
  canPreview: boolean;
  previewLoading: boolean;
  previewError: string | null;
  generatePreview?: DmPreviewData;
  onMaxItemsChange: (value: number) => void;
  onIncludeWebsiteLinkChange: (value: boolean) => void;
}

export default function DmPreviewStep({
  maxItemsInDM,
  includeWebsiteLink,
  maxItemsValid,
  canPreview,
  previewLoading,
  previewError,
  generatePreview,
  onMaxItemsChange,
  onIncludeWebsiteLinkChange,
}: DmPreviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Message Settings</h2>
        <p className="text-muted-foreground text-sm">
          Customize what followers receive and preview the DM.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Items per DM</Label>
          <Input
            type="number"
            min={1}
            max={20}
            value={maxItemsInDM}
            onChange={(event) => onMaxItemsChange(Number(event.target.value))}
          />
          <p className="text-muted-foreground text-xs">How many product items to include (1–20).</p>
        </div>

        <div className="border-border/70 flex items-center gap-2.5 rounded-xl border px-3.5 py-3">
          <Checkbox
            id="include-link"
            checked={includeWebsiteLink}
            onCheckedChange={(checked) => onIncludeWebsiteLinkChange(checked as boolean)}
          />
          <Label htmlFor="include-link" className="cursor-pointer text-sm">
            Add a link to your product page
          </Label>
        </div>
      </div>

      {!maxItemsValid && (
        <Alert variant="destructive">
          <AlertTitle>Invalid item count</AlertTitle>
          <AlertDescription>Enter a number between 1 and 20.</AlertDescription>
        </Alert>
      )}

      <div className="app-panel-soft p-4">
        <div className="mb-3 flex items-center gap-2">
          <Eye className="text-muted-foreground h-4 w-4" />
          <Label className="text-sm font-medium">Message Preview</Label>
        </div>

        {previewLoading ? (
          <div className="border-border/70 bg-background space-y-2 rounded-xl border p-4">
            <div className="bg-muted h-3.5 w-full animate-pulse rounded" />
            <div className="bg-muted h-3.5 w-4/5 animate-pulse rounded" />
            <div className="bg-muted h-3.5 w-3/5 animate-pulse rounded" />
            <div className="bg-muted mt-3 h-3.5 w-full animate-pulse rounded" />
            <div className="bg-muted h-3.5 w-2/3 animate-pulse rounded" />
          </div>
        ) : !canPreview ? (
          <Alert>
            <AlertTitle>Preview not ready</AlertTitle>
            <AlertDescription>
              Select a product above to see what your followers will receive.
            </AlertDescription>
          </Alert>
        ) : previewError ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t generate preview</AlertTitle>
            <AlertDescription>{previewError}</AlertDescription>
          </Alert>
        ) : generatePreview && generatePreview.itemCount === 0 ? (
          <Alert>
            <AlertTitle>This product has no items</AlertTitle>
            <AlertDescription>
              Add items to this product first, then come back to preview the DM.
            </AlertDescription>
          </Alert>
        ) : generatePreview ? (
          <div className="space-y-3">
            <Textarea
              value={generatePreview.message}
              readOnly
              rows={12}
              className="border-border/70 bg-background font-mono text-xs leading-relaxed"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {generatePreview.itemCount} items
              </Badge>
              <Badge
                variant="secondary"
                className={`text-xs ${generatePreview.characterCount > 1000 ? "tone-danger" : ""}`}
              >
                {generatePreview.characterCount}/1000 chars
              </Badge>
              {generatePreview.characterCount > 1000 && (
                <span className="text-destructive text-xs font-medium">
                  Instagram may cut off this message
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
