# Thumbnail Styles + Live Preview — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor ProductCard into 2 style variants (Button, Callout) with a registry, add live thumbnail preview to the product builder edit page.

**Architecture:** Card variants live in a `cards/` subdirectory with a shared registry. `ProductCard.tsx` becomes a thin dispatcher. `ProductBuilderLayout` gains a `preview` slot (right panel on lg+). `ThumbnailStep` emits live state via `onLiveChange` callback, wired through the edit page to a `ThumbnailStepPreview` component that renders from the same card registry.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Convex

---

## File Map

| Action | File | Purpose |
|--------|------|---------|
| New | `features/products/components/cards/types.ts` | `ThumbnailCardProps`, `ThumbnailLiveState` |
| New | `features/products/components/cards/index.ts` | `THUMBNAIL_CARDS` registry + `resolveThumbnailStyle` |
| New | `features/products/components/cards/BaseCard.tsx` | Shared `ThumbnailImage` and `CardLink` |
| New | `features/products/components/cards/ButtonCard.tsx` | Horizontal one-liner card |
| New | `features/products/components/cards/CalloutCard.tsx` | Vertical details card |
| Modify | `features/products/components/ProductCard.tsx` | Dispatch via registry |
| Modify | `features/products/builder/ProductBuilderLayout.tsx` | `preview` prop + two-column layout |
| New | `features/products/builder/previews/ThumbnailStepPreview.tsx` | Live thumbnail card preview |
| New | `features/products/builder/previews/ProductStepPreview.tsx` | Step → preview dispatcher |
| Modify | `features/products/builder/steps/ThumbnailStep.tsx` | `onLiveChange` callback |
| Modify | `app/dashboard/products/[productId]/edit/page.tsx` | Wire live state + preview slot |

---

### Task 1: Create shared card types

**Files:**
- Create: `features/products/components/cards/types.ts`

- [ ] **Step 1: Create types file**

```typescript
export type ThumbnailLiveState = {
  style: "button" | "callout";
  title: string;
  subtitle?: string;
  buttonText: string;
  imageUrl?: string | null;
  price?: string | null;
};

export type ThumbnailCardProps = {
  product: {
    _id: string;
    name: string;
    productUrl: string;
    type?: string;
    price?: string | null;
    coverImageUrl?: string | null;
    thumbnailImageUrl?: string | null;
    config?: Record<string, unknown>;
    itemCount?: number;
  };
  username?: string;
  index?: number;
  interactive?: boolean;
};

export type ThumbnailStyle = "button" | "callout";
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit --pretty features/products/components/cards/types.ts 2>&1 | head -20
```

Expected: No errors (or only unrelated project-level errors)

- [ ] **Step 3: Commit**

```bash
git add features/products/components/cards/types.ts
git commit -m "feat: add thumbnail card types"
```

---

### Task 2: Create card registry

**Files:**
- Create: `features/products/components/cards/index.ts`

- [ ] **Step 1: Verify the `cards/` directory exists**

```bash
mkdir -p features/products/components/cards
```

- [ ] **Step 2: Create registry file**

```typescript
import { ButtonCard } from "./ButtonCard";
import { CalloutCard } from "./CalloutCard";
import type { ThumbnailStyle } from "./types";
import type { ProductTypeKey } from "../../registry/productTypes";
import { PRODUCT_TYPES } from "../../registry/productTypes";

export const THUMBNAIL_CARDS: Record<
  ThumbnailStyle,
  React.ComponentType<import("./types").ThumbnailCardProps>
> = {
  button: ButtonCard,
  callout: CalloutCard,
};

export function resolveThumbnailStyle(
  product: { type?: string; config?: Record<string, unknown> }
): ThumbnailStyle {
  const configStyle = (
    product.config?.thumbnail as { style?: string } | undefined
  )?.style;
  if (configStyle === "button" || configStyle === "callout") {
    return configStyle as ThumbnailStyle;
  }
  if (product.type) {
    const def = PRODUCT_TYPES[product.type as ProductTypeKey];
    if (def && (def.defaultThumbnailStyle === "button" || def.defaultThumbnailStyle === "callout")) {
      return def.defaultThumbnailStyle as ThumbnailStyle;
    }
  }
  return "button";
}
```

- [ ] **Step 3: Commit**

```bash
git add features/products/components/cards/index.ts
git commit -m "feat: add thumbnail card registry"
```

---

### Task 3: Create BaseCard helpers

**Files:**
- Create: `features/products/components/cards/BaseCard.tsx`

- [ ] **Step 1: Create BaseCard with image + link helpers**

```typescript
import Link from "next/link";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThumbnailImage({
  url,
  alt,
  className,
  fallbackClassName,
}: {
  url?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "from-primary/10 to-pink/10 flex items-center justify-center bg-linear-to-br",
        className,
        fallbackClassName
      )}
    >
      <Package className="text-muted-foreground/40 h-8 w-8" />
    </div>
  );
}

export function CardLink({
  href,
  interactive,
  children,
  className,
}: {
  href?: string;
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  if (interactive && href) {
    return (
      <Link href={href} className={cn("block", className)}>
        {children}
      </Link>
    );
  }
  return <div className={className}>{children}</div>;
}
```

- [ ] **Step 2: Commit**

```bash
git add features/products/components/cards/BaseCard.tsx
git commit -m "feat: add BaseCard image and link helpers"
```

---

### Task 4: Create ButtonCard

**Files:**
- Create: `features/products/components/cards/ButtonCard.tsx`

- [ ] **Step 1: Create ButtonCard component**

```typescript
"use client";

import type { ThumbnailCardProps } from "./types";
import { ThumbnailImage, CardLink } from "./BaseCard";

export function ButtonCard({
  product,
  username,
  index = 0,
  interactive = true,
}: ThumbnailCardProps) {
  const thumbnail = product.config?.thumbnail as
    | { title?: string; buttonText?: string }
    | undefined;
  const previewUrl = product.thumbnailImageUrl || product.coverImageUrl;
  const title = thumbnail?.title || product.name;
  const buttonText = thumbnail?.buttonText || "Get Access";
  const href = username ? `/${username}/p/${product.productUrl}` : undefined;

  const card = (
    <div className="group border-border/60 hover:border-border flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-md border bg-white px-4 py-3 transition-all duration-300">
      <ThumbnailImage
        url={previewUrl}
        alt={title}
        className="h-10 w-10 shrink-0 rounded"
      />

      <h3 className="text-foreground min-w-0 flex-1 truncate text-sm font-semibold">
        {title}
      </h3>

      <span className="bg-primary/10 text-primary shrink-0 rounded-md px-3 py-1.5 text-xs font-medium">
        {buttonText}
      </span>
    </div>
  );

  return <CardLink href={href} interactive={interactive}>{card}</CardLink>;
}
```

- [ ] **Step 2: Commit**

```bash
git add features/products/components/cards/ButtonCard.tsx
git commit -m "feat: add ButtonCard component"
```

---

### Task 5: Create CalloutCard

**Files:**
- Create: `features/products/components/cards/CalloutCard.tsx`

- [ ] **Step 1: Create CalloutCard component**

```typescript
"use client";

import type { ThumbnailCardProps } from "./types";
import { ThumbnailImage, CardLink } from "./BaseCard";

export function CalloutCard({
  product,
  username,
  index = 0,
  interactive = true,
}: ThumbnailCardProps) {
  const thumbnail = product.config?.thumbnail as
    | { title?: string; subtitle?: string; buttonText?: string }
    | undefined;
  const previewUrl = product.thumbnailImageUrl || product.coverImageUrl;
  const title = thumbnail?.title || product.name;
  const subtitle = thumbnail?.subtitle;
  const buttonText = thumbnail?.buttonText || "Get Access";
  const href = username ? `/${username}/p/${product.productUrl}` : undefined;

  const card = (
    <div className="group border-border/60 hover:border-border flex w-full cursor-pointer flex-col overflow-hidden rounded-md border bg-white transition-all duration-300">
      <div className="flex items-start gap-4 p-4">
        <ThumbnailImage
          url={previewUrl}
          alt={title}
          className="h-20 w-20 shrink-0 rounded-md"
        />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <h3 className="text-foreground line-clamp-1 text-sm font-semibold">
            {title}
          </h3>

          {subtitle && (
            <p className="text-muted-foreground line-clamp-2 text-xs">
              {subtitle}
            </p>
          )}

          {product.price && (
            <p className="text-primary text-xs font-medium">
              {product.price}
            </p>
          )}
        </div>
      </div>

      <div className="border-border/60 bg-secondary/10 border-t px-4 py-2.5 text-center">
        <span className="text-primary text-sm font-semibold">
          {buttonText}
        </span>
      </div>
    </div>
  );

  return <CardLink href={href} interactive={interactive}>{card}</CardLink>;
}
```

- [ ] **Step 2: Commit**

```bash
git add features/products/components/cards/CalloutCard.tsx
git commit -m "feat: add CalloutCard component"
```

---

### Task 6: Refactor ProductCard to dispatch via registry

**Files:**
- Modify: `features/products/components/ProductCard.tsx`

- [ ] **Step 1: Replace ProductCard content with registry dispatch**

Read the current file first, then replace entire content:

```typescript
"use client";

import { THUMBNAIL_CARDS, resolveThumbnailStyle } from "./cards";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    productUrl: string;
    type?: string;
    price?: string | null;
    coverImageUrl?: string | null;
    thumbnailImageUrl?: string | null;
    config?: Record<string, unknown>;
    itemCount?: number;
  };
  username?: string;
  index?: number;
  interactive?: boolean;
}

export function ProductCard(props: ProductCardProps) {
  const style = resolveThumbnailStyle({
    type: props.product.type,
    config: props.product.config,
  });
  const Card = THUMBNAIL_CARDS[style];
  return <Card {...props} />;
}
```

- [ ] **Step 2: Verify the build compiles across all consumers**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No errors related to ProductCard or cards directory.

- [ ] **Step 3: Quick visual check — run dev server**

```bash
# Start dev server and note: ProductSection on dashboard/store page should still render product cards
# No visual regression — cards should look unchanged for products without config.thumbnail set
```

- [ ] **Step 4: Commit**

```bash
git add features/products/components/ProductCard.tsx
git commit -m "refactor: ProductCard dispatches via thumbnail card registry"
```

---

### Task 7: Add preview slot to ProductBuilderLayout

**Files:**
- Modify: `features/products/builder/ProductBuilderLayout.tsx`

- [ ] **Step 1: Read current file, then replace with two-column layout**

```typescript
"use client";

import type { ProductTypeDefinition, ProductStepKey } from "../registry/productTypes";
import { STEP_LABELS } from "../registry/steps";
import { Rows2, RectangleHorizontal, SlidersVertical, FileUp } from "lucide-react";

const STEP_ICONS: Record<string, React.ElementType> = {
  thumbnail: Rows2,
  checkout: RectangleHorizontal,
  options: SlidersVertical,
  content: FileUp,
};

interface ProductBuilderLayoutProps {
  product: { _id: string; name: string; status: string };
  definition: ProductTypeDefinition;
  currentStepKey: ProductStepKey;
  currentStepIndex: number;
  totalSteps: number;
  onStepClick: (index: number) => void;
  children: React.ReactNode;
  preview?: React.ReactNode;
}

export function ProductBuilderLayout({
  product: _product,
  definition,
  currentStepKey: _currentStepKey,
  currentStepIndex,
  totalSteps: _totalSteps,
  onStepClick,
  children,
  preview,
}: ProductBuilderLayoutProps) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4 overflow-x-auto pb-2">
        {definition.steps.map((stepKey, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const StepIcon = STEP_ICONS[stepKey];
          return (
            <button
              key={stepKey}
              type="button"
              onClick={() => onStepClick(index)}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : isCompleted
                    ? "bg-primary text-foreground"
                    : "bg-background text-muted-foreground hover:bg-card/30"
              }`}
            >
              {StepIcon && <StepIcon className="h-4 w-4" />}
              {STEP_LABELS[stepKey]}
            </button>
          );
        })}
      </div>

      <div className="lg:flex lg:gap-8 lg:items-start">
        <div className="lg:flex-1 lg:min-w-0">{children}</div>
        {preview && (
          <div className="hidden lg:block lg:w-[380px] lg:shrink-0">
            <div className="sticky top-8">{preview}</div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add features/products/builder/ProductBuilderLayout.tsx
git commit -m "feat: add preview slot and two-column layout to ProductBuilderLayout"
```

---

### Task 8: Create ThumbnailStepPreview

**Files:**
- Create: `features/products/builder/previews/ThumbnailStepPreview.tsx`

- [ ] **Step 1: Ensure previews directory exists**

```bash
mkdir -p features/products/builder/previews
```

- [ ] **Step 2: Create ThumbnailStepPreview**

```typescript
"use client";

import { THUMBNAIL_CARDS } from "@/features/products/components/cards";
import type { ThumbnailLiveState } from "@/features/products/components/cards/types";

interface ThumbnailStepPreviewProps extends ThumbnailLiveState {}

export function ThumbnailStepPreview({
  style,
  title,
  subtitle,
  buttonText,
  imageUrl,
  price,
}: ThumbnailStepPreviewProps) {
  const Card = THUMBNAIL_CARDS[style];

  const product = {
    _id: "preview",
    name: title,
    productUrl: "#",
    price: price ?? null,
    thumbnailImageUrl: imageUrl ?? null,
    coverImageUrl: null,
    config: {
      thumbnail: {
        style,
        title,
        subtitle,
        buttonText,
      },
    },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          Preview
        </span>
      </div>
      <div className="border-border/40 bg-card/50 rounded-lg border p-5">
        <Card product={product} interactive={false} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add features/products/builder/previews/ThumbnailStepPreview.tsx
git commit -m "feat: add ThumbnailStepPreview component"
```

---

### Task 9: Create ProductStepPreview dispatcher

**Files:**
- Create: `features/products/builder/previews/ProductStepPreview.tsx`

- [ ] **Step 1: Create dispatcher**

```typescript
"use client";

import { ThumbnailStepPreview } from "./ThumbnailStepPreview";
import type { ProductStepKey } from "../../registry/productTypes";
import type { ThumbnailLiveState } from "@/features/products/components/cards/types";

interface ProductStepPreviewProps {
  stepKey: ProductStepKey;
  liveState: ThumbnailLiveState | null;
}

export function ProductStepPreview({
  stepKey,
  liveState,
}: ProductStepPreviewProps) {
  switch (stepKey) {
    case "thumbnail":
      if (!liveState) return null;
      return <ThumbnailStepPreview {...liveState} />;
    default:
      return null;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add features/products/builder/previews/ProductStepPreview.tsx
git commit -m "feat: add ProductStepPreview dispatcher"
```

---

### Task 10: Add onLiveChange to ThumbnailStep

**Files:**
- Modify: `features/products/builder/steps/ThumbnailStep.tsx`

- [ ] **Step 1: Read current file, then make two edits**

**Edit A:** Change the function signature and imports (lines 1-14). Add `useEffect` import and type import:

```typescript
// Line 3: Ensure useEffect is imported
import { useState, useEffect, useCallback, useRef } from "react";
// ... rest of imports stay the same ...
import type { ProductStepComponentProps } from "../../registry/steps";
import type { ThumbnailLiveState } from "@/features/products/components/cards/types";
```

**Edit B:** Change the component signature to accept `onLiveChange` (line 34):

Find:
```typescript
export function ThumbnailStep({ productId, product, onRegisterSave }: ProductStepComponentProps) {
```

Replace with:
```typescript
interface ThumbnailStepProps extends ProductStepComponentProps {
  onLiveChange?: (state: ThumbnailLiveState) => void;
}

export function ThumbnailStep({ productId, product, onRegisterSave, onLiveChange }: ThumbnailStepProps) {
```

**Edit C:** Add `useEffect` for live state AFTER the existing `handleSave` useEffect (after line 114):

Find:
```typescript
  useEffect(() => {
    onRegisterSave?.(handleSave);
  }, [handleSave, onRegisterSave]);
```

Add after:
```typescript
  useEffect(() => {
    onLiveChange?.({
      style,
      title: title.trim() || product.name,
      subtitle: subtitle.trim() || undefined,
      buttonText: buttonText.trim() || "Download Now",
      imageUrl: showImage
        ? (thumbnailPreview || persistedThumbUrl)
        : null,
      price: product.price,
    });
  }, [
    style,
    title,
    subtitle,
    buttonText,
    showImage,
    thumbnailPreview,
    persistedThumbUrl,
    product.price,
    product.name,
    onLiveChange,
  ]);
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add features/products/builder/steps/ThumbnailStep.tsx
git commit -m "feat: add onLiveChange callback to ThumbnailStep"
```

---

### Task 11: Wire edit page with live state and preview

**Files:**
- Modify: `app/dashboard/products/[productId]/edit/page.tsx`

- [ ] **Step 1: Read current file, then apply edits**

**Edit A:** Add imports (after line 18):

```typescript
import { ProductStepPreview } from "@/features/products/builder/previews/ProductStepPreview";
import type { ThumbnailLiveState } from "@/features/products/components/cards/types";
```

**Edit B:** Add live state (after `const [currentStepIndex, setCurrentStepIndex] = useState(0);` at line 36):

```typescript
  const [thumbnailLiveState, setThumbnailLiveState] = useState<ThumbnailLiveState>({
    style: "button",
    title: "",
    buttonText: "Download Now",
  });
```

**Edit C:** Add `useEffect` to seed initial live state from saved config (after the state declarations):

```typescript
  useEffect(() => {
    if (product && definition) {
      const saved = product.config?.thumbnail as
        | { style?: string; title?: string; subtitle?: string; buttonText?: string }
        | undefined;
      setThumbnailLiveState({
        style:
          saved?.style === "button" || saved?.style === "callout"
            ? saved.style
            : definition.defaultThumbnailStyle === "preview"
              ? "button"
              : (definition.defaultThumbnailStyle as "button" | "callout"),
        title: saved?.title || product.name,
        subtitle: saved?.subtitle,
        buttonText: saved?.buttonText || definition.defaultButtonText,
        imageUrl: product.thumbnailImageUrl ?? null,
        price: product.price,
      });
    }
  }, [product, definition]);
```

**Edit D:** In the Step render loop (around line 170-197), pass `onLiveChange` when it's the thumbnail step:

Find the `onRegisterSave={` line and add `onLiveChange` after it:

```typescript
                  <Step
                    productId={product._id}
                    product={{
                      _id: product._id,
                      name: product.name,
                      description: product.description,
                      productUrl: product.productUrl,
                      price: product.price,
                      priceCents: product.priceCents,
                      coverImageUrl: product.coverImageUrl,
                      coverImageId: product.coverImageId,
                      thumbnailImageUrl: product.thumbnailImageUrl ?? null,
                      username: user?.username,
                      type: product.type,
                      status: product.status,
                      config: product.config as Record<string, unknown>,
                    }}
                    onRegisterSave={(fn) => handleRegisterSave(index, fn)}
                    visible={index === currentStepIndex}
                    {...(stepKey === "thumbnail"
                      ? ({ onLiveChange: setThumbnailLiveState } as Record<string, unknown>)
                      : {})}
                  />
```

**Edit E:** Add `useEffect` import at top (line 3):

Change:
```typescript
import { use, useState, useRef, useCallback } from "react";
```

To:
```typescript
import { use, useState, useEffect, useRef, useCallback } from "react";
```

**Edit F:** In `ProductBuilderLayout`, add the `preview` prop (around line 162-168):

```typescript
          <ProductBuilderLayout
            product={product}
            definition={definition}
            currentStepKey={definition.steps[currentStepIndex]}
            currentStepIndex={currentStepIndex}
            totalSteps={definition.steps.length}
            onStepClick={setCurrentStepIndex}
            preview={
              <ProductStepPreview
                stepKey={definition.steps[currentStepIndex]}
                liveState={thumbnailLiveState}
              />
            }
          >
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/products/\[productId\]/edit/page.tsx
git commit -m "feat: wire live thumbnail preview into product edit page"
```

---

### Task 12: Verification — full typecheck

**Files:** None (verification only)

- [ ] **Step 1: Run full TypeScript check**

```bash
npx tsc --noEmit 2>&1 | tail -30
```

Expected: No errors. Fix any that appear.

- [ ] **Step 2: Run lint**

```bash
npm run lint 2>&1 | tail -30
```

- [ ] **Step 3: Start dev server and verify**

```bash
# Start: npm run dev
# Navigate to: /dashboard/products/[existingProductId]/edit
# Verify:
#   - On desktop (>=1024px): preview panel appears on right during Thumbnail step
#   - On mobile (<1024px): preview hidden
#   - Typing in title/subtitle/button text updates preview in real-time
#   - Switching style (Button ↔ Callout) changes preview card
#   - Image upload updates preview image
```

- [ ] **Step 4: Commit final verification**

```bash
git add -A
git commit -m "chore: verification pass for thumbnail preview"
```
