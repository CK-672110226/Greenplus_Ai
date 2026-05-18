# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with HMR at http://localhost:5173
npm run build     # Production build to dist/
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint on all JS/JSX files
npm test          # Vitest unit tests (interactive)
npm run test:run  # Vitest unit tests (single run)
npm run e2e       # Playwright end-to-end tests
```

## Architecture

This is a **React 19 + Vite 8** single-page application. Entry: `index.html` → `src/main.jsx` → `src/App.jsx`.

**Bootstrap chain** (`src/main.jsx`):
`<StrictMode>` → `<Provider store>` → `<PersistGate>` → `<App />`

**`src/App.jsx`** wraps all routes in `<AuthInitializer>` which runs:
- `useAuth()` — Supabase session listener → Redux
- `useActiveModels()` — loads AI model registry
- dark mode sync with `localStorage` and `prefers-color-scheme`

**Role-based routing** (all authenticated routes live inside `<SmartLayout>`):
- `role === 'user'` → `<UserLayout>` (bottom tab bar: home, scan, basket, map, profile)
- `role === 'buyer'` → `<BuyerLayout>` (sidebar: dashboard, schedule, pricing, marketplace, etc.)
- `role === 'admin'` → plain `<NavBar>` shell
- `<ProtectedRoute requiredRole="X">` redirects to `/login` if no session, or `/` if wrong role

**Auth flow** (`src/hooks/useAuth.js`):
- `supabase.auth.getSession()` on mount + `onAuthStateChange` → dispatches `setSession` / `setProfile`
- First Google OAuth login: reads `gp_pending_role` from `localStorage`, creates `user_profiles` row in Supabase

**Redux store** (`src/store/index.js`) — 12 slices:
- **Persisted** via redux-persist: `waste` (basket, lastScan), `pricing` (prices, savedAt)
- **Not persisted**: user, marketplace, aiConfig, bookings, buyer, notifications, schedule, customLabels, logistics, chat

**Key data** (`src/data/`):
- `wasteItems.js` — 8 recyclable materials with `nameEn`, `nameTh`, `basePrice`; use `localName(key, language)` for bilingual display
- `wasteRules.js` — classification rules for ONNX/TensorFlow scan model

**Backend**: Supabase (PostgreSQL). Client at `src/lib/supabase.js`. Main tables: `user_profiles`, `scan_history`, `shops`, `marketplace_posts`, `bookings`, `schedules`.

**AI scanning**: ONNX Runtime Web (`onnxruntime-web`) + TensorFlow.js (`@teachablemachine/image`) loaded lazily in `ScanPage`.

**Maps**: Leaflet + react-leaflet in `MapPage`. Import `leaflet/dist/leaflet.css` is in `src/main.jsx`.

**Error monitoring**: Sentry (`@sentry/react`) initialized in `src/main.jsx`, gated on `VITE_SENTRY_DSN`.

## Design Specification

Before building or restyling any page, read **`docs/design-spec.md`**. It is the visual source-of-truth and covers:
- Design language (neo-brutalist, 1.5px ink borders, flat shadows, hatch bar charts)
- Navigation anatomy for each role with ASCII diagrams
- Every page spec: layout zones, exact UI zones, data shown
- Shared micro-patterns: KpiCard, SectionDivider, ProgressBar, Timeline, BookingRow, hatch bar chart

## User Flow & Page Composition

Before creating or editing any page, read **`docs/user-flow.md`**. It covers:
- Entry points and role-based routing
- Full navigation flow for each role (user / buyer / admin)
- Per-page composition: components, Redux slices, services, and data each page needs
- Redux state ↔ page map

## UI Design System

Before writing any JSX or CSS, read **`docs/ui-components.md`**. Key rules:
- CSS tokens: `--ink`, `--ink-2`, `--ink-3`, `--ink-4`, `--paper`, `--paper-2`, `--green`, `--green-soft`, `--green-ink`, `--orange` — **never use raw hex values**
- Only `--ink` through `--ink-4` exist; `--ink-5` does not exist
- Typography classes: `font-brand` (display/headings), `font-body` (prose), `font-data` (labels/data)
- Component APIs: `<Button>`, `<Card>`, `<GradeTag>`, `<KpiCard>`, `<SectionDivider>`, `<ProgressBar>`, `<NavBar>`, `<ProtectedRoute>`
- Layout: `<SmartLayout>`, `<UserLayout>`, `<BuyerLayout>`

## i18n

- Two locale files: `src/i18n/en.js` and `src/i18n/th.js`
- **Always add new keys to both files simultaneously** — missing a key in `th.js` means Thai users see English
- Access via `useT()` hook (`src/hooks/useT.js`), which wraps `useTranslation()`
- **No `?? 'fallback'` guards** — if the key exists in both files, no fallback is needed; if the key is genuinely missing, add it to both files

## AI Working Rules (from PROJECT_AI_WORKING_RULES.md)

These rules govern all AI-assisted work in this repository.

### Mandatory workflow for every task

1. Review relevant history files in `HistoryVersions/` **before** planning or editing code.
2. Read versions from `.00` through latest in ascending order for the target scope.
3. Make focused changes only to files required by the task.
4. After completing changes, create a new history version file.

### History file structure

```
HistoryVersions/
  Feature/<ScopeKey>/Feature-<ScopeKey>.YY.md   ← new feature work
  Fix/<ScopeKey>/Fix-<ScopeKey>.YY.md            ← bug fix work

HistorySystem/
  System1.YY.md    ← AI workflow / process / rule changes only
```

- First revision for any scope is always `.00`; each follow-up increments by `.01` in filename.
- Never overwrite or delete existing history files.
- When `HistoryVersions/` structure changes, update `HistoryVersions/README.md`.

### Required content for each history file

1. Title with exact version name
2. Date in English and Thai (e.g. `18 May 2026 (18 พฤษภาคม 2569)`)
3. Overview, Reason, Changes (file-by-file), Validation, Notes

### When history must be updated

Any feature addition, bug fix, UI/styling change, data structure change, file reorganization, or meaningful refactor requires a new history version file. Do not skip this step.

### Git workflow

- Always create a branch for fixes/features — never commit directly to `main`
- Ask before running `git commit` — user reviews before committing
- Use Conventional Commits format: `fix:`, `feat:`, `chore:`, etc.
