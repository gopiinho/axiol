# DM Message Redesign for Non-Affiliate Products

**Date:** 2025-06-18
**Status:** Approved

## Summary

The automation DM message builder currently only supports affiliate products by enumerating product items with individual links. Since product items are disabled and new product types (digital, coaching, course, etc.) don't have items, the DM message must be rebuilt to send a simple product page link for all product types.

## Product Types

Supported types in automations: `affiliate`, `digital`, `coaching`, `collect_emails`, `applications`, `course`.

This design handles non-affiliate types first. Affiliate will be revisited later with its own item-based format.

## DM Message Template

### Non-Affiliate (all types except affiliate)

```
Hi,

Thanks for showing interest in "{productName}"

Here is the link: {siteUrl}/{username}/p/{productUrl}

Thank you
```

- No product description (could be too long)
- No emojis or sign-off fluff
- Product link always included
- No "items per DM" concept — single message per trigger

### Affiliate (unchanged for now)

Kept as-is with numbered items, affiliate links, and existing format. Will be updated when affiliate items are re-enabled.

## Architecture

### Single `buildDmMessage` function

```typescript
function buildDmMessage(opts: {
  productType: ProductTypeKey;
  productName: string;
  productUrl: string;
  items?: Array<{title?: string; price?: string; affiliateLink: string}>;
  maxItems?: number;
  includeWebsiteLink?: boolean;
  triggerType?: "comment" | "dm";
}): { message: string; characterCount: number }
```

- `productType === "affiliate"` → existing numbered-items format
- All other types → simple link format
- `characterCount` returned for the preview badge

### Queries

**`generateDMMessage`** (public, used by Preview tab):
- Args: `productId`, `triggerType`
- Fetches product, checks type, fetches items only if affiliate
- Delegates to `buildDmMessage`

**`generateDMMessageForJob`** (internal, used by dmQueue):
- Same logic, skips auth, fetches user for username resolution

## Changes

### 1. Schema (`convex/schema.ts`)

Remove from `reelMappings` table:
- `maxItemsInDM: v.number()`
- `includeWebsiteLink: v.boolean()`

Remove from `dmJobs` table:
- `maxItemsInDM: v.number()`
- `includeWebsiteLink: v.boolean()`

### 2. Convex Functions

**`convex/instagram.ts`:**
- Rewrite `buildDmMessage` with product type switch
- `generateDMMessage`: remove `maxItems`, `includeWebsiteLink` args; add product type check
- `generateDMMessageForJob`: same changes
- `createReelMapping`: remove `maxItemsInDM`, `includeWebsiteLink` from args and stored data

**`convex/dmQueue.ts`:**
- `createJob`: remove `maxItemsInDM`, `includeWebsiteLink` from args
- `sendDM`: remove `maxItemsInDM`, `includeWebsiteLink` usage; call `generateDMMessageForJob` without those args

### 3. Webhook (`app/api/webhooks/instagram/route.ts`)

Remove `maxItemsInDM` and `includeWebsiteLink` from job creation calls.

### 4. Validator (`lib/validators/instagram-mappings.ts`)

Remove `maxItemsInDM` and `includeWebsiteLink` from `ReelMappingInput` interface and `validateReelMappingInput` function.

### 5. Preview Tab UI (`features/automations/components/DmPreviewStep.tsx`)

- Remove "Items per DM" input control
- Remove "Add a link to your product page" checkbox
- Remove "X items" badge
- Keep preview textarea and character count badge (with >1000 warning)
- Simplified props — no more `maxItemsInDM`, `includeWebsiteLink`, `maxItemsValid`, `itemCount`

### 6. Wizard Page (`app/(app)/dashboard/automations/new/page.tsx`)

- Remove `maxItemsInDM` and `includeWebsiteLink` state
- Remove `maxItemsValid` validation
- Remove those props from `DmPreviewStep`
- Remove from `handleSave` and `createMapping` call
- Remove `maxItems`/`includeWebsiteLink` from `generateDMMessage` query call
- `canPreview` still checks `Boolean(selectedProductId)`

## Edge Cases

- **Character count > 1000**: Warning displayed as before. dmQueue truncates at 950 chars with "... (visit link for full list)" message
- **Existing reelMappings data**: Convex handles removed fields gracefully. Existing docs retain stale fields
- **Instagram link unfurling**: Well-formed URL provided; Instagram generates its own preview card from page metadata
- **Product with no productUrl**: Products always have productUrl (required field), no fallback needed

## Files Affected

```
convex/schema.ts
convex/instagram.ts
convex/dmQueue.ts
app/api/webhooks/instagram/route.ts
lib/validators/instagram-mappings.ts
features/automations/components/DmPreviewStep.tsx
app/(app)/dashboard/automations/new/page.tsx
```
