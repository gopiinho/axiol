# Product Thumbnail Styles + Live Preview -- Design

**Date:** 2026-06-07
**Scope:** Refactor ProductCard into 2 style variants, add live thumbnail preview to product builder.

---

## 1. Motivation

- `ProductCard.tsx` renders one fixed layout regardless of `config.thumbnail.style`
- Users configuring thumbnails see no live preview -- they guess what the card looks like
- Adding styles and previews now unlocks the checkout preview pattern later

---

## 2. Thumbnail Card Styles (Stan Store-inspired)

### 2.1 Button Style (`ButtonCard.tsx`)

Horizontal one-liner. Compact, minimal. Used for `button` style and as default fallback.

```
+-----------------------------------------+
| [img] Title text              [CTA btn] |
+-----------------------------------------+
```

- Flex row, items-center, gap-3, rounded-md, border, bg
- Thumbnail image: 40x40, rounded, object-cover
- Title: truncate, font-semibold
- CTA: small pill button/span on the right, accent-colored bg
- No subtitle, no price shown

**Data consumed from `config.thumbnail`:** `style`, `title`, `buttonText`, `imageId` -> `imageUrl`
**Falls back to:** `product.name` for title, product type's `defaultButtonText` for CTA

### 2.2 Callout Style (`CalloutCard.tsx`)

Vertical card. More visual, shows details + prominent CTA.

```
+-----------------------------------+
| +------+                          |
| |      |  Title text              |
| | img  |  Subtitle text           |
| |      |  $Price                  |
| +------+                          |
| +-----------------------------+   |
| |         CTA Button          |   |
| +-----------------------------+   |
+-----------------------------------+
```

- Outer: flex-col, rounded-md, border, bg, overflow-hidden
- Top section (flex-row, p-4, gap-4):
  - Image: 80x80, rounded, object-cover (or placeholder gradient with icon)
  - Details (flex-col, flex-1): title (font-semibold), subtitle (text-sm, muted, truncate-2), price (text-sm, accent)
- Bottom: full-width CTA button (border-t, py-2 px-4, accent bg, text-sm, font-medium)

**Data consumed:** `config.thumbnail` -- title, subtitle, buttonText, imageId -> imageUrl; `product.price`

### 2.3 Preview Style -- deferred, placeholder in registry

---

## 3. Architecture: Card Registry (`ProductCard/`)

```
features/products/components/ProductCard/
  index.ts         -- THUMBNAIL_CARDS registry + re-export
  BaseCard.tsx     -- shared: image loader, link wrapper, placeholder
  ButtonCard.tsx   -- horizontal one-liner
  CalloutCard.tsx  -- vertical card
  types.ts         -- ThumbnailCardProps, shared types
```

The root `ProductCard.tsx` imports the registry, resolves the style from `config.thumbnail`, and delegates. All existing consumers (`ProductSection`, `StoreContent`) are unaffected.

---

## 4. ProductBuilderLayout -- Two-Column Layout

On `lg+` (>=1024px), step content (left) + preview panel (right). On mobile, preview hidden.

New `preview` prop: `React.ReactNode`. Rendered in a sticky 380px right column, `hidden lg:block`.

---

## 5. ThumbnailStepPreview

Receives live state (style, title, subtitle, buttonText, imageUrl, price). Renders the exact same `ButtonCard`/`CalloutCard` from the registry with `interactive={false}`.

---

## 6. ProductStepPreview Dispatcher

`stepKey` -> preview component. Only thumbnail today; checkout added later.

---

## 7. ThumbnailStep -- Live State Callback

New `onLiveChange?: (state: ThumbnailLiveState) => void` prop. `useEffect` fires on every keystroke/image change to push state up.

---

## 8. Edit Page -- Wiring

- Tracks `thumbnailLiveState` via useState
- Passes `onLiveChange={setThumbnailLiveState}` to ThumbnailStep
- Passes `<ProductStepPreview stepKey={...} liveState={thumbnailLiveState} />` to ProductBuilderLayout's `preview` slot

---

## 9. StepRegistry -- Props Update

Add `onLiveChange` to ThumbnailStep's props interface; backward-compatible for all other steps.

---

## 10. File Change Summary

| Action   | File | Purpose |
|----------|------|---------|
| **New**  | `ProductCard/types.ts` | Shared types |
| **New**  | `ProductCard/index.ts` | Registry + resolver |
| **New**  | `ProductCard/BaseCard.tsx` | Shared image/link helpers |
| **New**  | `ProductCard/ButtonCard.tsx` | Horizontal one-liner |
| **New**  | `ProductCard/CalloutCard.tsx` | Vertical details card |
| **Modify** | `ProductCard.tsx` | Dispatch via registry |
| **Modify** | `ProductBuilderLayout.tsx` | `preview` slot + two-column |
| **New**  | `builder/previews/ThumbnailStepPreview.tsx` | Live card preview |
| **New**  | `builder/previews/ProductStepPreview.tsx` | Step dispatcher |
| **Modify** | `builder/steps/ThumbnailStep.tsx` | `onLiveChange` |
| **Modify** | `builder/steps/StepRegistry.tsx` | Extended props |
| **Modify** | `edit/page.tsx` | Wire state + preview slot |

---

## 11. Non-Goals

- Preview (document) style -- deferred
- Checkout step preview -- separate feature
- Mobile preview rendering -- explicitly hidden below `lg`
- Storefront/checkout page implementation -- separate feature
