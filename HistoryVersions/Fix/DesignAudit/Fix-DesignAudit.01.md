# Fix-DesignAudit.01

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

---

## Overview

Two UI issues identified during a follow-up design audit against `docs/design-spec.md`. Both are visual-completeness fixes with no data-model or route changes.

1. **LINE OAuth button missing on LoginPage** — design spec §3.1 requires a LINE sign-in button for `role=user`. Only Google OAuth was present; LINE was absent.
2. **"Book pickup" button missing in MapPage shop cards** — design spec §3.6 requires each shop list card to have both a "Directions" button and a "Book pickup" button. Only Directions existed.

---

## Reason

- `LoginPage.jsx` had `handleGoogleSignIn` but no equivalent for LINE. The LINE button was simply never added to the OAuth section.
- `MapPage.jsx` shop list cards rendered only a single `Directions ↗` button in their action row. The "Book pickup" call-to-action was missing entirely.

---

## Changes

### `src/pages/LoginPage.jsx`

**New async function:** `handleLineSignIn` (added immediately after `handleGoogleSignIn`, ~line 147)

- Follows the identical pattern as `handleGoogleSignIn`: clears error, sets loading, stores `gp_pending_role` in localStorage, then calls `supabase.auth.signInWithOAuth({ provider: 'line', options: { redirectTo: window.location.origin } })`.
- On error: sets error state and clears loading.

**New JSX block:** LINE OAuth button (added below the Google OAuth button inside the `or` divider section)

- Conditionally rendered only when `role !== 'buyer'` (buyer login has no LINE option per spec).
- Style matches the Google button exactly: `w-full flex items-center gap-3 px-4 py-3 border-[1.5px] border-[var(--ink)] bg-[var(--paper)] font-body text-[16px]` with identical hover/disabled states.
- Icon slot: a `<span>` with a bold `"L"` character in `#06C755` (LINE green) as a text-mark substitute (no LINE SVG asset in the codebase).
- Label: `"Continue with LINE"`.

---

### `src/pages/MapPage.jsx`

**New import:** `useNavigate` from `react-router-dom` (added to the existing react-router-dom import line was absent — added as a new import line).

**New import:** `Button` from `'../components/Button'`.

**Hook call:** `const navigate = useNavigate()` added at the top of `MapPage` component body alongside existing hooks.

**Shop list card action row** (inside `{!loading && visible.length > 0 && ...}`):

- Added `<Button variant="primary" onClick={() => navigate('/basket')}>BOOK PICKUP →</Button>` as a sibling of the existing `Directions ↗` raw `<button>`, inside the same `flex gap-2 mt-0.5` div.
- The `<Button>` component uses the project's standard primary variant (green background, ink border, neo-brutalist shadow).

---

## Validation

- `npm run lint` — passes with zero errors or warnings.
- Manual browser checks recommended:
  - `/login?role=user` — Google and LINE buttons both appear below the "or" divider.
  - `/login?role=buyer` — only Google button appears; LINE button must NOT render.
  - `/map` — each shop card in the list shows "Directions ↗" and "BOOK PICKUP →" side by side; clicking BOOK PICKUP navigates to `/basket`.

---

## Notes

- No new routes, Redux slices, or components were added.
- The LINE icon uses a text-mark `"L"` in `#06C755` because no LINE SVG asset exists in `/public/icons.svg` or `src/assets/`. A proper SVG can replace this when assets are updated.
- The Popup (map pin) view was not changed — it uses an inline-styled `Navigate →` text button and is outside the shop-list card scope.
- The existing `Directions ↗` button in the shop list was not modified.
