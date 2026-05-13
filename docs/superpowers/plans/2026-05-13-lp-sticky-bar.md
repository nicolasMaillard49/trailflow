# LP Sticky Bar + Size Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile-only sticky bottom bar to the TrailFlow landing page containing a size selector (S/M/L/XL/XXL) and an express CTA that adds-to-cart and redirects to `/checkout`.

**Architecture:** New React client component (`LandingStickyBar.tsx`) mounted only on the LP. It fetches the product via the existing `api()`/`parseProduct` pipeline (same as `/produit`), uses the existing Zustand `useCart` store, and reuses the design tokens already defined for `.sticky-cta` in `globals.css`. Visibility is driven by a scroll listener (mirroring `FloatingCTA`).

**Tech Stack:** Next.js 16.2.4 (App Router), React 19.2.4, Zustand 5, Tailwind 4 + plain CSS in `globals.css`, TypeScript 5.

**Spec:** `docs/superpowers/specs/2026-05-13-lp-sticky-bar-size-selector-design.md` (commit `8c4ce34`).

**No test infrastructure exists in `frontend-next/` (no Jest/Vitest configured).** Verification is manual via browser DevTools and the local dev server (`npm run dev:front` on port 3000, back on 3010). Adding a test framework is out of scope for this feature.

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `frontend-next/app/components/LandingStickyBar.tsx` | The component: fetches product, holds size state, renders sticky UI, dispatches add-to-cart + tracking + redirect | **Create** |
| `frontend-next/app/page.tsx` | LP — mount `<LandingStickyBar />` near the bottom of the JSX | **Modify** |
| `frontend-next/app/globals.css` | Visual styles for `.lp-sticky-bar` (mobile-only `@media (max-width: 900px)`, two-row layout) | **Modify** (append at end) |

No backend changes. No new dependencies. No env vars.

---

## Task 1: Read Next.js 16 conventions (constraint from `frontend-next/AGENTS.md`)

**Files:** read-only.

`AGENTS.md` says: *"This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code."*

- [ ] **Step 1: Inventory the relevant docs**

Run from `C:\Users\n.maillard\VueJS\trailflow\frontend-next`:

```powershell
Get-ChildItem -Recurse node_modules\next\dist\docs\01-app -Filter "*.md" | Select-Object -ExpandProperty FullName | Select-String "client|navigation|router|use-client" -SimpleMatch | Select-Object -First 20
```

Expected: a list of doc paths covering Client Components, `useRouter`, navigation, dynamic rendering.

- [ ] **Step 2: Read the client-components doc**

Use the `Read` tool on the file path returned by Step 1 that matches `*client-components*.md` (typically `node_modules/next/dist/docs/01-app/03-building-your-application/01-rendering/02-client-components.md` or the closest equivalent). Note any change vs Next.js 13/14: directive placement, when `useEffect` is allowed, how state hydration works.

- [ ] **Step 3: Read the `useRouter` doc**

Read the path matching `*use-router*.md` under `node_modules/next/dist/docs/`. Confirm the import is `from "next/navigation"` (not `next/router`, which was the Pages Router) and that `router.push("/checkout")` is the redirect signature.

- [ ] **Step 4: No commit** — this task is read-only, just inform the implementation.

---

## Task 2: Add a `data-hero` marker to the LP hero (anchor for visibility logic)

**Files:**
- Modify: `frontend-next/app/page.tsx` (hero section element)

The new component needs to know where the hero ends to delay its appearance. Rather than a fragile CSS selector, expose a data attribute.

- [ ] **Step 1: Locate the hero**

Read `frontend-next/app/page.tsx` lines 1–110. Find the first `<section>` or `<div>` immediately after the nav that contains the hero copy and the "Commander maintenant" button (the `.btn-primary` with `id="buy"`).

- [ ] **Step 2: Add `data-hero=""` attribute**

Edit the opening tag of that hero container. Example: change `<section className="hero">` to `<section className="hero" data-hero="">`. If the hero uses a different tag/class, add `data-hero=""` to its top-level element. No styling impact, just a hook.

- [ ] **Step 3: Verify the page still renders**

The dev server is already running on port 3000. Open `http://localhost:3000` in the browser and confirm the page renders identically (no visual diff).

- [ ] **Step 4: Commit**

```powershell
git add frontend-next/app/page.tsx
git commit -m "chore(frontend): data-hero anchor sur la section hero LP"
```

---

## Task 3: Create the `LandingStickyBar` component (full implementation)

**Files:**
- Create: `frontend-next/app/components/LandingStickyBar.tsx`

- [ ] **Step 1: Create the file with the full implementation**

Write the following exact content to `frontend-next/app/components/LandingStickyBar.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../lib/cart";
import { api } from "../lib/api";
import { parseProduct, type Product } from "../lib/schemas";
import { trackEvent } from "./Trackers";

const SIZES: { label: string; soldout?: boolean }[] = [
  { label: "S" },
  { label: "M" },
  { label: "L" },
  { label: "XL" },
  { label: "XXL", soldout: true },
];

const DEFAULT_COLOR = "Gris perle";
const DEFAULT_IMAGE = "/images/product-face.png";
const STORAGE_KEY = "tf_lp_size";

/**
 * Sticky bar mobile sur la LP : sélecteur de taille + CTA express.
 * Visible uniquement <900px (cf. globals.css), apparaît après 15% de scroll,
 * se cache quand la .cta-section finale entre dans le viewport.
 */
export function LandingStickyBar() {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const cartOpen = useCart((s) => s.isOpen);
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState<string>("M");
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Rehydrate la taille depuis localStorage après le mount (évite mismatch SSR).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && SIZES.some((s) => s.label === saved && !s.soldout)) {
        setSize(saved);
      }
    } catch {
      /* localStorage indisponible (mode privé, quota) — on garde M. */
    }
  }, []);

  // Fetch produit — mirror exact du pattern utilisé dans /produit.
  useEffect(() => {
    let cancelled = false;
    let attempt = 0;
    const tryFetch = () => {
      api("/products/gilet-trailflow", { parse: parseProduct })
        .then((p) => {
          if (!cancelled) setProduct(p);
        })
        .catch(() => {
          attempt += 1;
          if (attempt < 3 && !cancelled) {
            setTimeout(tryFetch, 1000 * Math.pow(2, attempt - 1));
          }
          /* Échec après 3 tentatives : on n'affiche pas la sticky bar. */
        });
    };
    tryFetch();
    return () => {
      cancelled = true;
    };
  }, []);

  // Visibilité scroll-based (mirror FloatingCTA), seuil 15%.
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      if (total <= 0) return setVisible(false);
      const progress = h.scrollTop / total;

      // Hide si la CTA-section finale est dans le viewport (CTA déjà visible).
      const cta = document.querySelector(".cta-section");
      if (cta) {
        const rect = cta.getBoundingClientRect();
        if (rect.top < window.innerHeight) return setVisible(false);
      }

      setVisible(progress > 0.15);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const handlePickSize = (label: string) => {
    setSize(label);
    try {
      window.localStorage.setItem(STORAGE_KEY, label);
    } catch {
      /* idem mount */
    }
  };

  const handleOrder = () => {
    if (!product || submitting) return;
    setSubmitting(true);

    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size,
      color: DEFAULT_COLOR,
      price: product.price,
      quantity: 1,
      image: DEFAULT_IMAGE,
    });

    trackEvent("AddToCart", {
      content_name: product.name,
      content_ids: product.id,
      content_type: "product",
      value: product.price,
      currency: "EUR",
      num_items: 1,
      contents: JSON.stringify([
        { id: product.id, quantity: 1, item_price: product.price },
      ]),
      size,
      color: DEFAULT_COLOR,
      source: "lp_sticky",
    });

    router.push("/checkout");
  };

  // Pas de produit chargé ou cart drawer ouvert → on ne rend rien.
  if (!product) return null;
  if (cartOpen) return null;

  return (
    <div
      className={`lp-sticky-bar${visible ? " is-visible" : ""}`}
      aria-hidden={!visible}
    >
      <div className="lp-sticky-row lp-sticky-row--sizes" role="radiogroup" aria-label="Choix de la taille">
        <span className="lp-sticky-label">Taille</span>
        <div className="lp-sticky-sizes">
          {SIZES.map((s) => {
            const active = s.label === size;
            const disabled = !!s.soldout;
            return (
              <button
                key={s.label}
                type="button"
                role="radio"
                aria-checked={active}
                aria-disabled={disabled}
                disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                className={`lp-sticky-pill${active ? " is-active" : ""}${disabled ? " is-disabled" : ""}`}
                onClick={() => !disabled && handlePickSize(s.label)}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="lp-sticky-row lp-sticky-row--cta">
        <div className="lp-sticky-price">
          <s>49,90€</s> <strong>34,90€</strong>
        </div>
        <button
          type="button"
          className="lp-sticky-btn"
          onClick={handleOrder}
          disabled={submitting}
          aria-label={`Commander en taille ${size}, 34,90 euros`}
        >
          Commander →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check the file**

Run from project root:

```powershell
npx --workspace=frontend-next tsc --noEmit -p frontend-next/tsconfig.json
```

If that flag combo errors, fall back to:

```powershell
Push-Location frontend-next; npx tsc --noEmit; Pop-Location
```

Expected: no errors mentioning `LandingStickyBar.tsx`. Pre-existing errors in unrelated files are acceptable for this step but note them.

- [ ] **Step 3: Commit**

```powershell
git add frontend-next/app/components/LandingStickyBar.tsx
git commit -m "feat(frontend): composant LandingStickyBar (LP mobile)"
```

---

## Task 4: Add `.lp-sticky-bar` styles to `globals.css`

**Files:**
- Modify: `frontend-next/app/globals.css` (append a new block at end of file)

- [ ] **Step 1: Append the CSS block**

Open `frontend-next/app/globals.css` and append this block at the very end:

```css
/* =============================================
   LP STICKY BAR — mobile only, two rows (size + CTA)
   ============================================= */
.lp-sticky-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 150;
  background: rgba(14, 14, 12, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 0.5px solid rgba(240, 237, 232, 0.08);
  padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
  flex-direction: column;
  gap: 10px;
  transform: translateY(100%);
  transition: transform 240ms ease-out;
}
.lp-sticky-bar.is-visible {
  transform: translateY(0);
}
.lp-sticky-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lp-sticky-label {
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cream-dk);
  flex-shrink: 0;
}
.lp-sticky-sizes {
  display: flex;
  gap: 6px;
  flex: 1;
  justify-content: flex-end;
}
.lp-sticky-pill {
  min-width: 36px;
  height: 32px;
  padding: 0 8px;
  border: 0.5px solid rgba(240, 237, 232, 0.25);
  background: transparent;
  color: var(--cream);
  font-family: var(--font-geist), system-ui, sans-serif;
  font-size: 12px;
  font-weight: 400;
  border-radius: 2px;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
}
.lp-sticky-pill:hover:not(.is-disabled) {
  border-color: rgba(240, 237, 232, 0.55);
}
.lp-sticky-pill.is-active {
  background: var(--cream);
  color: var(--ink);
  border-color: var(--cream);
}
.lp-sticky-pill.is-disabled {
  opacity: 0.35;
  cursor: not-allowed;
  text-decoration: line-through;
}
.lp-sticky-pill:focus-visible {
  outline: 2px solid var(--cream);
  outline-offset: 2px;
}
.lp-sticky-price {
  flex: 1;
  font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
  font-weight: 300;
  font-size: 15px;
  color: var(--cream-dk);
}
.lp-sticky-price s {
  opacity: 0.5;
  margin-right: 6px;
}
.lp-sticky-price strong {
  color: var(--cream);
  font-weight: 400;
}
.lp-sticky-btn {
  height: 40px;
  padding: 0 18px;
  background: var(--cream);
  color: var(--ink);
  font-family: var(--font-geist), system-ui, sans-serif;
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: opacity 120ms ease;
}
.lp-sticky-btn:hover:not(:disabled) {
  opacity: 0.9;
}
.lp-sticky-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}
.lp-sticky-btn:focus-visible {
  outline: 2px solid var(--cream);
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .lp-sticky-bar { display: flex; }
  /* Décale le footer pour ne pas que le contenu soit masqué par la bar. */
  body:has(.lp-sticky-bar.is-visible) footer { padding-bottom: 120px; }
}
```

- [ ] **Step 2: Visual check in browser**

The dev server is on `http://localhost:3000`. Open DevTools, switch to mobile viewport (iPhone 14 Pro, 390px wide). Reload. Scroll down past the hero. Expect to see the new sticky bar slide up from the bottom with size pills + price + CTA.

- [ ] **Step 3: Commit**

```powershell
git add frontend-next/app/globals.css
git commit -m "feat(frontend): styles .lp-sticky-bar (mobile only)"
```

---

## Task 5: Mount `<LandingStickyBar />` in the LP

**Files:**
- Modify: `frontend-next/app/page.tsx` (add import + mount near the end of the returned JSX)

- [ ] **Step 1: Add the import**

In `frontend-next/app/page.tsx`, find the import block at the top of the file (after `"use client"`). Add this import alongside the other component imports:

```tsx
import { LandingStickyBar } from "./components/LandingStickyBar";
```

- [ ] **Step 2: Mount the component**

Locate the last `<SiteFooter />` (or the closing tag of the outermost wrapper) in the JSX returned by the page component. Just before that closing wrapper (and after `<SiteFooter />` if it exists on the LP), insert:

```tsx
      <LandingStickyBar />
```

It must be at the page level — NOT inside the hero or any centered container — so the `position: fixed` works against the viewport without parent transform issues.

- [ ] **Step 3: Reload and verify in browser (mobile viewport)**

Open `http://localhost:3000` with DevTools mobile emulation (≤900px wide). Reload.

Verify in order:
1. Bar is **hidden** when at the top of the page (you only see hero CTA).
2. Scroll down ~20% — bar **slides up** from the bottom.
3. Tap size "L" — pill turns cream-on-ink (active state).
4. Reload — pill "L" is still active (localStorage persistence works).
5. Scroll to the bottom — when `.cta-section` (the final CTA section) enters viewport, bar **disappears**.
6. Scroll back up — bar reappears.
7. Resize browser to >900px — bar is hidden via media query.
8. Click size "XXL" — nothing happens (disabled, soldout).

- [ ] **Step 4: Verify desktop is unchanged**

Resize browser to 1280×800. The LP must render identically to before this work (no sticky bar on desktop).

- [ ] **Step 5: Commit**

```powershell
git add frontend-next/app/page.tsx
git commit -m "feat(frontend): mount LandingStickyBar sur la LP"
```

---

## Task 6: End-to-end flow verification

**Files:** none modified — manual browser test.

- [ ] **Step 1: Verify backend is reachable**

Open `http://localhost:3010/api/products/gilet-trailflow` in a browser. Expected: 200 JSON with `{ id, slug: "gilet-trailflow", name, price, ... }`.

If 503 or connection refused → `docker compose up -d` to start Postgres, then re-test.

- [ ] **Step 2: Cold flow — empty cart, tap CTA**

1. Open `http://localhost:3000` in mobile viewport, with `localStorage.clear()` first (DevTools → Application → Storage → Clear site data).
2. Scroll past hero. Bar appears with "M" pre-selected.
3. Tap "L". Tap "Commander →".
4. Expect: redirect to `/checkout`. The Stripe embedded checkout loads, with line item showing **TrailFlow Hydration Vest, Size L, Color Gris perle, 34,90€**.

- [ ] **Step 3: Pixel/CAPI event check**

Open DevTools → Network. Filter on `fbevents.js` or `facebook.com/tr`. With cookie consent accepted, after tapping "Commander" you should see an `AddToCart` event. In the event params (Network tab → request → Payload), confirm `source: "lp_sticky"` is present alongside `size`, `color`, `value: 34.9`.

If consent is not given, no Pixel event fires — this is expected (CookieBanner gates `Trackers`). Accept consent and retry.

- [ ] **Step 4: A11y keyboard check**

1. With keyboard focus on the page (Tab through), confirm focus reaches each size pill in order.
2. Use arrow keys / Tab through pills, then Tab to the "Commander" button.
3. Press Enter on "Commander". The flow proceeds identically to mouse.

- [ ] **Step 5: Lighthouse mobile sanity check (optional but advised)**

In DevTools → Lighthouse → Mobile, run a perf audit on `http://localhost:3000`. Confirm CLS and LCP are within ±2 points of the previous run (the bar uses `transform`, not layout, so no CLS impact expected).

- [ ] **Step 6: No commit** — verification only.

---

## Task 7: Update the LP audit follow-up (memory + next steps)

**Files:** none in source; one optional note.

- [ ] **Step 1: Confirm the feature shipped**

`git log --oneline -5` should show the four commits from Tasks 2–5 in order. Each commit message is in French per project convention.

- [ ] **Step 2: Note open follow-ups (not implemented in V1)**

The spec defers these — they are intentionally NOT in this plan:
- Desktop sticky bar (V2)
- Color picker on LP (always defaults to Gris perle)
- Quantity selector on LP (always 1)
- A/B test of CTA copy
- "Voir + options" secondary link to `/produit?size=M`

If product wants any of these, they go into a separate spec.

- [ ] **Step 3: Final commit (if any pending edits)**

```powershell
git status
```

Expected: clean working tree (or only `package-lock.json` modified, which predates this work).

---

## Self-Review

**Spec coverage** — every section of the spec is implemented:
- Component file + mount + CSS → Tasks 3, 4, 5 ✓
- Mobile-only via media query → Task 4 (`@media (max-width: 900px)`) ✓
- Scroll-based visibility → Task 3 (in component) ✓
- Hide on `/produit` and `/checkout` → guaranteed by mounting only in `app/page.tsx` (LP route) ✓
- Hide on cart drawer open → Task 3 (`if (cartOpen) return null`) ✓
- Default size M, default color Gris perle → Task 3 ✓
- XXL disabled (soldout) → Task 3 (data) + Task 4 (CSS `.is-disabled`) ✓
- localStorage persistence → Task 3 (rehydrate on mount, save on pick) ✓
- AddToCart tracking with `source: "lp_sticky"` → Task 3 ✓
- Redirect `/checkout` via `useRouter` → Task 3 ✓
- A11y radiogroup + aria-label → Task 3 ✓
- safe-area-inset-bottom → Task 4 ✓
- AGENTS.md Next.js 16 docs read → Task 1 ✓

**Placeholder scan** — no TBD, no "implement later", no "similar to Task N". Every step has exact code or exact command.

**Type consistency** — `cart.add` (Zustand) used everywhere (not `addItem`). `product.id`, `product.slug`, `product.name`, `product.price` match the `Product` type from `app/lib/schemas.ts` (used identically in `/produit`). `trackEvent` signature matches `app/components/Trackers.tsx:115`. `useRouter` imported from `next/navigation` (App Router) — to be confirmed in Task 1 step 3.
