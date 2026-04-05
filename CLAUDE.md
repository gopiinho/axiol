# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Next.js dev server (also run: npx convex dev)
npm run build    # Production build
npm run lint     # Run ESLint
```

Convex requires its own dev process alongside Next.js:

```bash
npx convex dev   # Run Convex backend locally (separate terminal)
```

## Architecture

**Linkkit** is a creator commerce / link-in-bio platform. Creators sign up, build a public storefront at `linkkit.store/<username>` showcasing collections of products, affiliate links, and bookings, and optionally layer on Instagram DM automation that auto-replies to reel comments with product links. The codebase lives under the `nemeowww` org and is deployed at nemeowww.com.

### Tech Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **Convex** — real-time backend (database + server functions). All data mutations and queries go through Convex, not REST APIs.
- **better-auth** (`better-auth@1.5.3`) integrated with Convex via **`@convex-dev/better-auth@0.11.2`**
- **Tailwind CSS 4** + shadcn/ui (Radix UI)
- **PostHog** for analytics

### Key Architectural Patterns

**Convex as the backend**: All database operations are defined in `/convex/*.ts` as typed mutations/queries. The frontend uses `useQuery` and `useMutation` hooks from `convex/react` for real-time sync. Server-side fetching uses the authenticated Convex helpers from `/lib/auth-server.ts` (which wraps the Convex HTTP client with a better-auth-issued token).

**Authentication (better-auth)**: The app uses better-auth with the Convex adapter — not a custom session scheme. Key files:

- `/lib/auth-client.ts` — exports `authClient` from `createAuthClient({ plugins: [convexClient()], sessionOptions: { refetchOnWindowFocus: false } })`. Window-focus refetch is disabled to avoid spamming `/api/auth/get-session` on every tab refocus.
- `/lib/auth-server.ts` — `convexBetterAuthNextJs()` handler plus `isAuthenticated()`, `getToken()`, and authenticated `fetchQuery` / `fetchMutation` helpers for server components.
- `/convex/auth.ts` — `betterAuth()` instance configured with the Convex plugin and email/password auth (12-character minimum).
- `/app/api/auth/[...all]/route.ts` — catch-all route that delegates every `/api/auth/*` request to the better-auth handler.
- `/components/ConvexClientProvider.tsx` wraps the app in `ConvexBetterAuthProvider`, which exchanges the better-auth session for a Convex JWT via `/api/auth/convex/token` and keeps live queries authenticated.

Sessions are stored as an HttpOnly cookie (`better-auth.session_token`, or `__Secure-better-auth.session_token` in production). There is **no** `sessions` table in Convex — better-auth manages session storage internally.

**Signup / login flow**: `/signup` collects email, username, full name, and password. Username availability is checked live via `api.users.checkUsernameAvailable`. On submit, `authClient.signUp.email()` creates the identity, and once `useConvexAuth` reports authed, the client calls `api.users.createProfile` to create the corresponding user row, then redirects to `/dashboard`. `/login` is email + password only. There are no OAuth providers for app login — the Instagram OAuth flow under `/app/api/auth/instagram/` is a separate integration for connecting a creator's IG account, not a login method.

**Authorization helpers** (`/convex/security.ts`):

- `requireSession(ctx)` — any authenticated user
- `requireCreatorSession(ctx)` — creator OR admin
- `requireAdminSession(ctx)` — admin only

All three resolve the Convex identity via `ctx.auth.getUserIdentity()` and look up the user row by the `betterAuthId` field.

**Route protection**: `/proxy.ts` is the Next.js middleware (the filename is historical). It reads the better-auth session cookie and redirects authed users away from `/login` / `/signup` and unauthed users on `/dashboard/*` to `/login?next=<path>`. `app/dashboard/layout.tsx` additionally calls `isAuthenticated()` server-side as a second gate.

**Multi-user data ownership**: All data (collections, items, reelMappings, dmJobs, instagramConfig, etc.) is scoped per-user via `createdBy` or `userId` fields. Each user only sees and manages their own data.

**Public profile pages**: Each creator has a public storefront at `/[username]` rendered from `convex/users.ts` (getByUsername) and `convex/collections.ts` (listPublic). Individual collections can also be viewed at `/list/[collectionId]`.

**Feature modules**: Complex features have their own directory under `/features/`. Current modules: `analytics`, `auth`, `collections`, `dm-queue`, `instagram-mappings`, `items`, `onboarding`. Each typically has components, hooks, and client/server logic co-located.

**Dashboard routes** (`/app/dashboard/`):

- `page.tsx` — overview
- `store/` — the creator's public storefront management
- `create/` — new collection / item creation
- `drafts/` — drafts
- `lists/` — collections management
- `analytics/` — engagement and DM analytics
- `settings/` — profile, theme, Instagram connection

**Instagram automation flow**:

1. Meta webhook → `/app/api/webhooks/instagram/` validates and parses events.
2. Comment/mention events create `dmJobs` in Convex.
3. A Convex scheduler drains the queue, respects rate limits (195 DMs/hour), and sends DMs via the Meta Graph API.
4. All activity is written to `commentLogs` and `dmLogs`.

**Meta webhook auto-subscription**: When a creator completes the Instagram OAuth callback at `/app/api/auth/instagram/callback/route.ts`, the server POSTs to `https://graph.instagram.com/v25.0/{igAccountId}/subscribed_apps` to subscribe the account to `comments` and `messages` events, then records success/failure via `api.instagram.setWebhookSubscribed` (`convex/instagram.ts`), which patches the `instagramConfig.webhookSubscribed` boolean.

### Database Schema (Convex tables)

- **`users`** — `betterAuthId`, `email`, `username`, `name`, `bio`, `avatarUrl`, `instagramUrl`, `youtubeUrl`, `websiteUrl`, `profileImageId`, `coverImageId`, `theme`, `accentColor`, `storeName`, `accountType` (`creator` | `admin`), `trialStartedAt`, `trialEndsAt`, `subscriptionStatus` (`trial` | `active` | `expired` | `cancelled`), `createdAt`. Indexes: `by_email`, `by_username`, `by_betterAuthId`.
- **`collections`** + **`items`** — product collections and affiliate links, scoped per-user via `createdBy`.
- **`instagramConfig`** — IG access tokens, rate-limit state, and the `webhookSubscribed` flag (per-user).
- **`reelMappings`** — maps reel IDs to collections with keyword matching for auto-DM (per-user).
- **`dmJobs`** + **`dmRateLimitState`** — DM automation queue (`pending` / `processing` / `sent` / `failed` / `duplicate`) and per-user rate limiting.
- **`commentLogs`** + **`dmLogs`** — audit trails.
- **`catCounter`**, **`waitlist`** — misc.

There is no `sessions` table — sessions live inside better-auth's own storage.

### Path Alias

`@/*` maps to the project root (configured in `tsconfig.json`).

## Design Context

### Users

Instagram creators and influencers monetizing their audience through affiliate marketing. They curate product collections, connect Instagram accounts, and use keyword-triggered auto-DMs to respond to reel comments with product recommendations. They value speed, ease of setup, and visibility into engagement metrics.

### Brand Personality

**Playful, energetic, approachable.** The brand leans into bold, high-energy social media vibes while remaining accessible to creators who may not be tech-savvy. It should feel modern, cutting-edge, and alive — matching the fast-paced world of Instagram and creator commerce.

### References

- **Linktree / Stan Store** — clean, creator-focused link-in-bio tools with modern UI patterns
- **Gumroad / Lemon Squeezy** — bold, opinionated creator commerce design with strong personality

### Aesthetic Direction

- **Light mode only** — optimized for the current OKLCH palette designed for light backgrounds
- **Dual accent system** — blue (oklch 0.52 0.2 254) is the primary brand color; pink is a secondary accent for personality moments and highlights
- **Typography hierarchy** — Manrope for body, Space Grotesk for app titles, DM Sans for landing pages, Jersey 10 for playful accent headings
- **Motion with purpose** — motion/react library with ease-out-quart curves ([0.25, 1, 0.5, 1]), staggered lists, fade-in-up entrances. Animations should feel snappy and energetic.
- **Mobile-first mindset** — creators often check comments on phone; ensure responsive, thumb-friendly interactions
- **Consistency over novelty** — every page should follow established patterns; spacing, interactions, and states should be predictable

### Accessibility

Follow WCAG AA standard best practices. Ensure sufficient color contrast with the OKLCH palette, proper focus indicators (ring style already established), and semantic HTML.

### Design Principles

1. **Speed & clarity first** — Every feature should prioritize quick understanding and minimal friction. Creators are busy.
2. **Energy without chaos** — Bold colors, confident typography, and lively micro-interactions should make the interface feel alive, not overwhelming.
3. **Mobile as first-class citizen** — Touch targets, readable text, and intuitive navigation must work seamlessly on phone and tablet.
4. **Consistent systems over one-offs** — Use design tokens (OKLCH colors, radius scale, spacing) and component patterns (CVA variants, data-slot attributes). Avoid hard-coded styles and inline customizations.
5. **Trust through clarity** — Clear feedback on actions (loading states, confirmations, error messages) builds confidence in the automation workflow.
