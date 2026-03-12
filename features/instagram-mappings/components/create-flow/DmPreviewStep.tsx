"use client";

import { Eye } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">DM Config + Preview</h2>
        <p className="text-sm text-muted-foreground">
          Finalize DM details and check exactly what users receive.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Max Items in DM</Label>
        <Input
          type="number"
          min={1}
          max={20}
          value={maxItemsInDM}
          onChange={(event) => onMaxItemsChange(Number(event.target.value))}
        />
        <p className="text-xs text-muted-foreground">Choose 1 to 20 items for the DM.</p>
      </div>

      <div className="flex items-center space-x-2 rounded-xl border p-3">
        <Checkbox
          id="include-link"
          checked={includeWebsiteLink}
          onCheckedChange={(checked) => onIncludeWebsiteLinkChange(checked as boolean)}
        />
        <Label htmlFor="include-link" className="cursor-pointer text-sm">
          Include website collection link in the DM
        </Label>
      </div>

      {!maxItemsValid && (
        <Alert variant="destructive">
          <AlertTitle>Invalid DM item count</AlertTitle>
          <AlertDescription>
            Max items must be a whole number between 1 and 20.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-2xl border bg-muted/20 p-3">
        <div className="mb-2 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <Label>Message Preview</Label>
        </div>

        {previewLoading ? (
          <div className="space-y-2 rounded-xl border bg-background p-3">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
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
          <>
            <Textarea
              value={generatePreview.message}
              readOnly
              rows={12}
              className="bg-background font-mono text-xs"
            />
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>Items: {generatePreview.itemCount}</span>
              <span>Characters: {generatePreview.characterCount}/1000</span>
              {generatePreview.characterCount > 1000 && (
                <span className="font-medium text-destructive">
                  Too long: message will be truncated
                </span>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
