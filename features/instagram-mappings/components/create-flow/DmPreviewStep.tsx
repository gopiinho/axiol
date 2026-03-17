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
        <h2 className="text-base font-semibold">DM Config + Preview</h2>
        <p className="text-sm text-muted-foreground">
          Finalize DM details and check exactly what users receive.
        </p>
      </div>

      {/* Config fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Max Items in DM</Label>
          <Input
            type="number"
            min={1}
            max={20}
            value={maxItemsInDM}
            onChange={(event) => onMaxItemsChange(Number(event.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Choose 1 to 20 items for the DM.
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-border/70 px-3.5 py-3">
          <Checkbox
            id="include-link"
            checked={includeWebsiteLink}
            onCheckedChange={(checked) =>
              onIncludeWebsiteLinkChange(checked as boolean)
            }
          />
          <Label htmlFor="include-link" className="cursor-pointer text-sm">
            Include website collection link in the DM
          </Label>
        </div>
      </div>

      {!maxItemsValid && (
        <Alert variant="destructive">
          <AlertTitle>Invalid DM item count</AlertTitle>
          <AlertDescription>
            Max items must be a whole number between 1 and 20.
          </AlertDescription>
        </Alert>
      )}

      {/* Preview */}
      <div className="app-panel-soft p-4">
        <div className="mb-3 flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Message Preview</Label>
        </div>

        {previewLoading ? (
          <div className="space-y-2 rounded-xl border border-border/70 bg-background p-4">
            <div className="h-3.5 w-full animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-3/5 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-3.5 w-full animate-pulse rounded bg-muted" />
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ) : !canPreview ? (
          <Alert>
            <AlertTitle>Preview unavailable</AlertTitle>
            <AlertDescription>
              Select a collection and valid DM item count to generate a preview.
            </AlertDescription>
          </Alert>
        ) : previewError ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t generate preview</AlertTitle>
            <AlertDescription>{previewError}</AlertDescription>
          </Alert>
        ) : generatePreview && generatePreview.itemCount === 0 ? (
          <Alert>
            <AlertTitle>No items in this collection</AlertTitle>
            <AlertDescription>
              Add items to this collection to generate a DM preview.
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
                className={`text-xs ${
                  generatePreview.characterCount > 1000
                    ? "tone-danger"
                    : ""
                }`}
              >
                {generatePreview.characterCount}/1000 chars
              </Badge>
              {generatePreview.characterCount > 1000 && (
                <span className="text-xs font-medium text-destructive">
                  Message will be truncated
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
