# LP Sticky Bar + Size Selector — Design Spec

**Date:** 2026-05-13
**Status:** Approved (autonomous brainstorm — user delegated remaining decisions)
**Scope:** Mobile-only (V1). Desktop unchanged.

## Context

CRO audit identifies two top-priority gains on the TrailFlow landing page (`frontend-next/app/page.tsx`):

1. **Size selector on LP** — micro-engagement before checkout, filters unqualified clicks
2. **Sticky mobile bar** — permanent CTA visibility for 70% mobile traffic

Today, all LP CTAs link to `/produit` (no size pre-selection, no add-to-cart from LP). The `/produit` page already has its own size grid and sticky CTA bar (see `frontend-next/app/produit/page.tsx`). The LP currently provides no add-to-cart path.

This spec combines both audit items into a single mobile-only component for V1.

## Goals

- Reduce friction between intent ("commander") and purchase on mobile.
- Force a micro-engagement (size choice) before checkout, even when pre-filled.
- Avoid disrupting the existing `/produit` flow (which retains its own sticky bar and color picker).
- Measurable via existing `trackEvent` infrastructure with a `source: "lp_sticky"` tag.

## Non-goals (V1)

- Desktop sticky bar (deferred to V2).
- Color picker on LP (defaulted to canonical variant `"Gris perle"` — `COLOR_VARIANTS[0]` in `app/produit/page.tsx`).
- Quantity selector on LP (defaulted to 1).
- A/B test infrastructure (separate concern).
- Replacing existing LP CTAs that link to `/produit` (those stay — they serve users who want to read the product page).

## Architecture

### New component
`frontend-next/app/components/LandingStickyBar.tsx`

- Client component (`"use client"`).
- Imports `useCart` for `addItem` (existing context).
- Imports `trackEvent` from existing `Trackers` module.
- Uses Next.js `useRouter` for the `/checkout` redirect.

### Mounted in
`frontend-next/app/page.tsx` — single mount near the end of the LP tree, after main content.

### Hidden on
- `/produit` (already has its own sticky bar) — guaranteed by mounting on LP only.
- `/checkout` — same guarantee.
- When `CartDrawer` is open — read open state from existing cart context if exposed; otherwise the bar can stay visible (drawer overlay covers it visually).

### Visibility trigger
- `IntersectionObserver` watching the hero section element. Bar becomes visible (slides up via `translateY`) when hero leaves the viewport.
- Hidden initially (`translateY(100%)`) so it doesn't compete with hero CTA.

## Component contract

```
Props: none
State:
  - size: "S" | "M" | "L" | "XL" | "XXL"  (default "M", persisted in localStorage key "tf_lp_size")
  - visible: boolean                       (toggled by IntersectionObserver)
External effects on click "Commander":
  1. addItem({ productId, slug, name: "TrailFlow Hydration Vest", size, color: "Gris perle", price: 34.9, quantity: 1, image: "/images/product-face.png" })
  2. trackEvent("AddToCart", { source: "lp_sticky", size, color: "Gris perle", value: 34.9, currency: "EUR" })
  3. router.push("/checkout")
```

## Visual / interaction spec

```
┌─────────────────────────────────────────────┐
│  Taille :  [ S ] [ M✓ ] [ L ] [ XL ] [XXL] │   <-- row 1
│  ─────────────────────────────────────────  │
│  4̶9̶,̶9̶0̶€̶  34,90€         [ Commander → ]     │   <-- row 2
└─────────────────────────────────────────────┘
```

- Position: `fixed; bottom: 0; left: 0; right: 0`.
- Media query: visible only `@media (max-width: 900px)` (match existing `.sticky-cta` breakpoint).
- z-index above page, below `CartDrawer` overlay (use 150, same as existing `.sticky-cta`).
- Backdrop: `backdrop-filter: blur(16px)` + semi-transparent cream background — reuse existing `.sticky-cta` styling tokens.
- Size pills: 36px diameter, cream background, ink text. Active pill: ink background, cream text. `XXL` pill widened (auto width, same height). **XXL is `soldout` in `SIZES` data** — render as disabled (`opacity: 0.4`, no pointer events, `aria-disabled="true"`).
- CTA: reuse `.nav-btn` styling, full width on its row (less the price block on the left).
- Animation: enter/exit `translateY` 240ms ease-out.

## Accessibility

- Size pills wrapped in `<div role="radiogroup" aria-label="Choix de la taille">`, each pill a `<button role="radio" aria-checked={size === pill}>`.
- CTA: `<button>` with `aria-label="Commander en taille {size}, 34,90 euros"`.
- Focus states visible (2px outline in `--ink`).
- Keyboard: arrow keys move between size pills (standard radiogroup pattern).

## Data flow

```
[LP loaded]
      |
      v
[LandingStickyBar mounts, reads localStorage] -> default "M" if absent
      |
      v
[user scrolls past hero]  -- IntersectionObserver --> setVisible(true)
      |
      v
[user taps size]          -- setSize + localStorage.setItem("tf_lp_size", ...)
      |
      v
[user taps "Commander"]   -- addItem() + trackEvent() + router.push("/checkout")
```

## Tracking

- Event: `AddToCart` (existing event name in Pixel/CAPI).
- Custom param: `source: "lp_sticky"` to differentiate from `/produit` add-to-cart in analytics.
- Fire client-side via existing `trackEvent` helper in `Trackers.tsx`.

## Edge cases

- **localStorage unavailable / SSR** — `useState("M")` default; read localStorage in `useEffect` after mount (no flicker since the bar is `translateY(100%)` until hero passes).
- **Image asset for cart item** — use the same `image` field that `/produit` passes (canonical product hero image path). Hard-code the path in the component to avoid prop drilling.
- **Multiple rapid clicks** — disable CTA while routing (`isSubmitting` state, ms-level guard).
- **User has items in cart already** — `addItem` adds another line item; that's the existing behavior on `/produit`, no special handling here.

## Files touched

| File | Change |
|---|---|
| `frontend-next/app/components/LandingStickyBar.tsx` | **NEW** — component implementation |
| `frontend-next/app/page.tsx` | Add `<LandingStickyBar />` mount + assign `id="hero"` (or ref) to hero element for the IntersectionObserver |
| `frontend-next/app/globals.css` | Add `.lp-sticky-bar` styles (mirror `.sticky-cta` patterns, two-row layout) |

No backend changes. No new env vars. No migration.

## Implementation constraint (from `frontend-next/AGENTS.md`)

> This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code.

The implementation plan must include a first step that reads the relevant Next.js 16 docs (client components, `useRouter`, `IntersectionObserver` patterns) before writing component code. Project uses Next.js 16.2.4 with Turbopack.

## Rollback plan

Remove the `<LandingStickyBar />` mount in `app/page.tsx`. Component file and CSS can stay dormant. Single-commit revert.

## Success criteria

- Bar appears within ~200ms of hero leaving viewport on mobile.
- Tapping "Commander" with M selected lands on `/checkout` with a single cart line item `{ size: "M", color: "Gris perle", quantity: 1 }`.
- `AddToCart` event fires with `source: "lp_sticky"` in Pixel and Meta CAPI.
- Lighthouse mobile LP score unchanged ±2 points.
- No console errors, no CLS regression (bar enters with transform, doesn't push layout).
