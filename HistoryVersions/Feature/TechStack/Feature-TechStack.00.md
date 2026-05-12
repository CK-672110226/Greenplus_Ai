# Feature-TechStack.00

**Date:** 12 May 2026 (12 พฤษภาคม 2569)

## Overview
Completed the full tech stack by adding five missing layers: testing (Vitest), internationalisation (i18next), form handling (React Hook Form + Zod), interactive maps (react-leaflet), and toast notifications (Sonner).

## Reason
Project already had Supabase + Vercel as backend/deploy layers. The remaining gaps were identified during a tech-stack audit: no test runner, no i18n library, no form validation, no map library, and no notification system.

## Changes

### `package.json`
- Added runtime dependencies: `i18next`, `react-i18next`, `react-hook-form`, `@hookform/resolvers`, `zod`, `react-leaflet`, `leaflet`, `sonner`
- Added dev dependencies: `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- Added scripts: `test`, `test:ui`, `test:run`, `coverage`

### `vite.config.js`
- Added `test` block: globals enabled, jsdom environment, `src/test/setup.js` as setupFiles

### `src/test/setup.js` _(new)_
- Imports `@testing-library/jest-dom` matchers globally for all test files

### `src/test/smoke.test.jsx` _(new)_
- Smoke test for `<Button>` component to confirm the Vitest + Testing Library pipeline works

### `src/i18n/index.js` _(new)_
- Initialises i18next with the existing `en.js` and `th.js` translation resources
- Default language auto-detected from `navigator.language`

### `src/hooks/useT.js`
- Added `useEffect` to call `i18n.changeLanguage()` whenever Redux `language` state changes
- Keeps backward-compatible `useT()` API; also keeps i18next in sync so `useTranslation()` works anywhere

### `src/main.jsx`
- Added `import './i18n'` to initialise i18next at app startup
- Added `import 'leaflet/dist/leaflet.css'` for Leaflet map styles

### `src/App.jsx`
- Imported `Toaster` from `sonner`
- Rendered `<Toaster richColors position="top-right" />` at the root level so any page can call `toast()` directly

## Validation
- `npm run build` — ✅ compiled 125 modules, no errors
- `npm run test:run` — ✅ 1 test file, 1 test passed (471 ms)

## Notes
- Leaflet CSS must be imported before `index.css` to avoid specificity conflicts
- `useT()` still returns the translation object directly (no change to callers); i18next sync is a side effect
- Future components can use either `useT()` (Redux-driven, returns plain object) or `useTranslation()` from react-i18next
- Map pages should `import { MapContainer, TileLayer } from 'react-leaflet'`
- Forms should `import { useForm } from 'react-hook-form'` + `import { zodResolver } from '@hookform/resolvers/zod'`
- Toasts: `import { toast } from 'sonner'` then call `toast.success()`, `toast.error()`, etc.
