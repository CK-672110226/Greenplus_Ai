# Feature-ParticleField.00

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Ambient particle animation on the landing page hero: ♻ and ฿ symbols float upward while color-shifting from scrap-gray (bottom) through eco-green (mid) to baht-gold (top), visually telling the brand story "trash becomes money." Pure Canvas 2D — no Three.js dependency.

## Reason

The `/3d-web-experience` skill was invoked to add ambient life to the landing page. User specified "trash become to money" as the particle concept. The hero section is the highest-impact placement — first impression for all visitors. Landing page has a solid background, so particles are scoped inside the hero container where they can be seen against the paper background.

Canvas 2D was chosen over React Three Fiber because:
- No additional dependencies (~0 KB bundle increase vs ~600 KB for R3F)
- Simple particle motion doesn't benefit from a 3D scene graph
- Better battery and CPU performance on low-end Android devices

## Changes

### `src/components/ParticleField.jsx` (NEW)

- 38 particles desktop / 16 on mobile (auto-detected at mount)
- Each particle: random ♻ or ฿ glyph, 11–19px, spawns at bottom with random upward velocity
- Color interpolation: gray `rgb(130,130,130)` → green `rgb(22,163,74)` → gold `rgb(212,177,8)` as particle rises
- Alpha fade-in (0 → 0.06–0.16) on spawn; no fade-out (particles reset at top edge)
- `prefers-reduced-motion: reduce` → skips entire animation (returns early)
- `ResizeObserver` keeps canvas dimensions synced to parent
- `cancelAnimationFrame` + `ro.disconnect()` on unmount — no leak

### `src/pages/LandingPage.jsx`

- Import `ParticleField`
- `<main>` gains `relative overflow-hidden` — establishes stacking context and clips particles at hero edges
- `<ParticleField />` inserted as first child of `<main>` — `absolute inset-0` positions it behind columns
- Both hero columns gain `relative z-10` — ensures content renders above the canvas

## Validation

- `npm run lint` — zero errors expected (no new hooks, standard ESM import)
- Visual: open `/` route; gray ♻ symbols rise from bottom and shift through green to gold ฿ at top
- Reduced motion: `@media (prefers-reduced-motion: reduce)` in DevTools → canvas renders static (no animation)
- Mobile: narrow viewport → 16 particles vs 38 on desktop
- No click/scroll interaction blocked (`pointer-events: none`)

## Notes

The particles are scoped to the landing page hero only. Adding them site-wide on top of solid `bg-[var(--paper)]` page backgrounds would require either `mix-blend-mode` tricks or making backgrounds transparent — both create readability trade-offs. Landing page hero is the right scope for this effect.
