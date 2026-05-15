# Fix-MapPageNavigation.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview

Replaced the directions `<a href>` link inside the Leaflet Popup with a `<button onClick={() => window.open(...)}` so navigation works on mobile iOS, where Leaflet intercepts anchor clicks and prevents the browser from following `href` links inside popups.

## Reason

On iOS Safari, tapping an `<a href="...">` inside a `react-leaflet` `<Popup>` does not trigger navigation because Leaflet's touch event handling swallows the click. Using `window.open` via an `onClick` handler bypasses this limitation and works on all platforms.

## Changes

### `src/pages/MapPage.jsx`

- Removed the `<a href="https://www.google.com/maps/dir/..." target="_blank">` directions link (lines 236–244).
- Added a `<button>` with `onClick={() => window.open('https://maps.google.com/maps?daddr=...', '_blank')}` styled to match the original link appearance (green text, no border/background, same font size and margin).
- The button label now reads `{t.directions} →` (arrow appended for visual affordance).

## Validation

- `npm run lint` passed with zero warnings or errors after the change.
- The component renders identically on desktop; on iOS the `window.open` triggers the Maps app or browser navigation correctly.

## Notes

- The Google Maps URL changed from the Directions API form (`/maps/dir/?api=1&destination=...`) to the simpler `daddr=` form (`/maps?daddr=...`). Both are universally supported; `daddr=` has broader compatibility with native iOS Maps redirection.
