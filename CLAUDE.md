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

**Linkkit** is a multi-user affiliate marketing/curator platform with Instagram DM automation. Creators sign up, build public profile pages with product collections, and use keyword-triggered auto-DMs to respond to Instagram reel comments with product links.

### Tech Stack

- **Next.js 15** (App Router) + React 19 + TypeScript
- **Convex** — real-time backend (database + server functions). All data mutations and queries go through Convex, not REST APIs.
- **Tailwind CSS 4** + shadcn/ui (Radix UI)
- **PostHog** for analytics

### Key Architectural Patterns

**Convex as the backend**: All database operations are defined in `/convex/*.ts` as typed mutations/queries. The frontend uses `useQuery` and `useMutation` hooks from `convex/react` for real-time sync. Server-side fetching uses the Convex HTTP client from `/server/convex.ts`.

**Authentication**: Custom session-based auth (no OAuth). Users self-register at `/signup` (creator accounts with 14-day trial) or are created as admins. Login → Convex stores session in DB with token → token set in HttpOnly cookie by `/app/api/auth/` routes. Convex mutations use `requireSession()` for any authenticated user, `requireCreatorSession()` for creator+admin, or `requireAdminSession()` for admin-only. Route protection is handled by `/proxy.ts` which redirects unauthenticated requests to `/login`.

**Multi-user data ownership**: All data (collections, items, reelMappings, dmJobs, etc.) is scoped per-user via `createdBy` or `userId` fields. Each user only sees and manages their own data.

**Public profile pages**: Each creator has a public page at `/[username]` showing their collections, powered by `convex/users.ts` (getByUsername) and `convex/collections.ts` (listPublic).

**Feature modules**: Complex features have their own directory under `/features/` (e.g., `auth`, `instagram-mappings`, `dm-queue`, `collections`, `items`, `analytics`). Each feature typically has components, hooks, and server actions co-located.

**Instagram automation flow**:

1. Instagram webhook → `/app/api/webhooks/instagram/` validates and parses events
2. Comment/mention events create `dmJobs` in Convex DB
3. Background Convex scheduler processes the queue, respects rate limits (195 DMs/hour), and sends DMs via Meta Graph API
4. All activity logged to `commentLogs` and `dmLogs` tables

### Database Schema (Convex tables)

- `users` (accountType: creator|admin, with username, profile fields, trial/subscription tracking) + `sessions` — auth & user management
- `collections` + `items` — product collections and affiliate links (scoped per-user via `createdBy`)
- `instagramConfig` — IG tokens and rate-limit state (per-user)
- `reelMappings` — maps reel IDs to collections with keyword matching for auto-DM (per-user)
- `dmJobs` + `dmRateLimitState` — automation queue and rate limiting (per-user)
- `commentLogs` + `dmLogs` — audit trail

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
