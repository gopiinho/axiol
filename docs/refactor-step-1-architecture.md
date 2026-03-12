# Step 1 Architecture Audit (Current + Target)

## Current snapshot

- App Router is used, but route groups are not used yet.
- Public routes and dashboard routes both live directly under `app/`.
- Most pages are client components and fetch Convex data directly in page files.
- Dashboard auth depends on `localStorage` token reads in client layouts/pages.
- Dashboard protection currently happens after render in `app/dashboard/layout.tsx`.
- Convex session checks are token-based and implemented in Convex functions.
- Webhook handling exists in `app/api/webhooks/instagram/route.ts` with HMAC validation.
- Convex domain modules are already separated by concern (`auth`, `sections`, `items`, `instagram`, `dmQueue`), but auth token plumbing is repeated throughout UI components.

## Key issues to address in later steps

- Protected UI can render before redirect because auth is client-side.
- `localStorage` session transport is weaker than HTTP-only cookies.
- Public pages (`app/page.tsx`, `app/list/[listId]/page.tsx`) are client-heavy despite mostly read-only content.
- Several route files are oversized and mix orchestration, data access, and UI concerns.
- Validation is ad hoc; no central validator module exists yet.
- Server/browser integration boundaries are blurry (`NEXT_PUBLIC_*` usage in server contexts, global wildcard image host config).

## Target architecture

```text
app/
  (public)/
    page.tsx
    list/[listId]/page.tsx
    privacy/page.tsx
    terms/page.tsx
    data-deletion/page.tsx
    login/page.tsx
  (dashboard)/
    dashboard/
      layout.tsx
      page.tsx
      create/page.tsx
      drafts/page.tsx
      lists/page.tsx
      lists/[id]/page.tsx
      settings/page.tsx
  api/
    auth/
      login/route.ts
      logout/route.ts
      session/route.ts
    webhooks/
      instagram/route.ts

components/
  ui/

features/
  auth/
    components/
    server/
    validators/
  sections/
    components/
    server/
    validators/
  items/
    components/
    server/
    validators/
  instagram-mappings/
    components/
    server/
    validators/
  dm-queue/
    components/
    server/
  analytics/
    components/
    server/

lib/
  env/
  validators/
  http/
  convex/
  analytics/

server/
  auth/
  convex/
  integrations/
```

## Boundary rules

- Routes:
  - `app/**/page.tsx` should orchestrate only (params, server fetch, composition).
  - Route handlers should stay thin and call feature/server modules.
- Server-only code:
  - Cookie/session handling, secrets, webhook verification, external API calls.
  - Lives under `server/*`, `features/*/server`, and route handlers.
- Client components:
  - Only for interactivity (`forms`, `dialogs`, `optimistic/realtime islands`, browser APIs).
  - No auth gatekeeping in client layouts.
- Shared UI:
  - Reusable primitives stay in `components/ui`.
  - Domain-specific UI stays inside its feature module.
- Feature modules:
  - Own domain logic/mappers/validators close to each feature.
  - Avoid cross-feature imports except through stable server helpers.
- Convex functions:
  - Keep focused by domain (`convex/auth.ts`, `convex/sections.ts`, etc.).
  - Split public vs admin-sensitive queries explicitly where needed.
- Validation:
  - Centralized reusable validators in `lib/validators` + feature validators.
  - Validate at both client boundary (UX) and server boundary (security/correctness).
- Analytics/integrations:
  - Browser analytics in client-only modules.
  - Server analytics + third-party API clients in server-only modules.

## Immediate implementation order (next steps)

1. Move auth/session transport to secure cookies and enforce dashboard protection on the server boundary.
2. Keep dashboard layout UI, but remove client-side auth gating logic from it.
3. Introduce minimal auth server helpers (`server/auth/*`) before broader page refactors.

## Assumptions

- Single-admin style dashboard behavior is acceptable for now.
- Convex remains the source of truth for sessions during this refactor.
- Visual design should remain intact while files are reorganized.
