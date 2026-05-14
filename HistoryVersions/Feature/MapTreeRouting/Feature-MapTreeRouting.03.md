# Feature-MapTreeRouting.03

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Three targeted improvements to `MapPage.jsx`: responsive map height, desktop sidebar filter layout, and dark-mode-aware map tiles.

## Reason

- The fixed `420px` inline height caused the map to feel cramped on small screens and oversized on large ones.
- All filter pills were in a single flat row on every viewport; on desktop this wasted the horizontal space that could serve as a proper sidebar.
- Dark mode toggled the app chrome but left the map tiles always in light style, breaking visual consistency.

## Changes

### `src/pages/MapPage.jsx`

- **Issue 1 — Responsive map height:** Replaced `style={{ height: 420, border: '1.5px solid var(--ink)' }}` with Tailwind classes `h-[55vw] max-h-[480px] min-h-[260px] border-[1.5px] border-[var(--ink)]`. The inner `MapContainer` `style={{ width: '100%', height: '100%' }}` is unchanged (Leaflet requires it).
- **Issue 2 — Desktop filter sidebar:** Restructured the filter + map section into a `md:grid md:grid-cols-[180px_1fr]` wrapper. Added a sticky `<aside>` visible only on `md:` with vertical pill buttons (`w-full px-3 py-1.5 text-left`). The original flat pill row is retained inside a `md:hidden` div for mobile. Pill style constants (`pillBase`, `pillActive`, `pillInactive`) extracted to reduce repetition.
- **Issue 3 — Dark mode tiles:** Added `const darkMode = useSelector(s => s.user.darkMode)`. `<TileLayer>` now uses CARTO dark basemap (`dark_all`) when `darkMode` is true, falling back to OpenStreetMap otherwise. Attribution string switches accordingly.
- Moved the empty-state `<p>` inside the right-column `<div>` so it sits below the map rather than outside the grid.
- All color references use CSS tokens only (`--ink`, `--paper`, `--paper-2`, `--ink-3`, `--green`). No raw hex values introduced.

## Validation

- `npm run lint` should pass (no new ESLint issues; hooks usage unchanged).
- Manual browser checks:
  - Mobile (<768 px): flat pill row visible, map height scales with viewport, min 260 px enforced.
  - Desktop (>=768 px): sidebar visible, flat row hidden, map capped at 480 px.
  - Dark mode toggle: map tiles switch between CARTO dark and OSM light.
  - Selecting a filter hides shops that do not accept that material; empty state message appears when `visible.length === 0`.

## Notes

- `darkMode` selector path (`s.user.darkMode`) must match the Redux slice. If the slice key differs, update the selector accordingly.
- CARTO tile URL uses `{r}` retina suffix; this is correct for the cartocdn endpoint.
