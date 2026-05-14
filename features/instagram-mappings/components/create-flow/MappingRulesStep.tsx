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

interface ProductOption {
  _id: Id<"products">;
  name: string;
}

interface MappingRulesStepProps {
  products?: ProductOption[];
  selectedProductId: Id<"products"> | "";
  keywordInput: string;
  keywordPresets: string[];
  keywordList: string[];
  keywordValid: boolean;
  onSelectProduct: (productId: Id<"products">) => void;
  onKeywordInputChange: (value: string) => void;
  onTogglePreset: (preset: string) => void;
  onRemoveKeyword: (keyword: string) => void;
}

export default function MappingRulesStep({
  products,
  selectedProductId,
  keywordInput,
  keywordPresets,
  keywordList,
  keywordValid,
  onSelectProduct,
  onKeywordInputChange,
  onTogglePreset,
  onRemoveKeyword,
}: MappingRulesStepProps) {
  return (
    <div className="space-y-6">
      {/* Product */}
      <div className="space-y-2.5">
        <div>
          <Label className="text-base font-semibold">Product</Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Which product should followers receive in the DM?
          </p>
        </div>
        <Select
          value={selectedProductId}
          onValueChange={(value) =>
            onSelectProduct(value as Id<"products">)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose product..." />
          </SelectTrigger>
          <SelectContent>
            {products?.map((product) => (
              <SelectItem key={product._id} value={product._id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Keywords */}
      <div className="space-y-2.5">
        <div>
          <Label className="text-base font-semibold">Trigger Keywords</Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            When someone comments any of these words on your reel, they get a DM.
            Separate with commas.
          </p>
        </div>
        <Input
          value={keywordInput}
          onChange={(event) =>
            onKeywordInputChange(event.target.value.toLowerCase())
          }
          placeholder="link, dm, details"
        />
      </div>

      {/* Presets */}
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

      {/* Active keywords */}
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
