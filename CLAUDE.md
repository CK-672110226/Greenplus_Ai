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
- `usePresence()` — updates `user_profiles.last_seen` every 2 min for any logged-in user
- dark mode sync with `localStorage` and `prefers-color-scheme`

**Role-based routing** (all authenticated routes live inside `<SmartLayout>`):
- `role === 'user'` → `<UserLayout>` (bottom tab bar: home, scan, basket, map, profile)
- `role === 'buyer'` → `<BuyerLayout>` (sidebar: dashboard, schedule, pricing, marketplace, driver)
- `role === 'admin'` → plain `<NavBar>` shell
- `<ProtectedRoute requiredRole="X">` redirects to `/login` if no session, or `/` if wrong role
- `<ProtectedRoute requiredRole="buyer" allowIfDriver>` — also allows `profile.is_driver = true` regardless of role (used by `/driver`)

**Auth flow** (`src/hooks/useAuth.js`):
- `supabase.auth.getSession()` on mount + `onAuthStateChange` → dispatches `setSession` / `setProfile`
- First Google OAuth login: reads `gp_pending_role` from `localStorage`, creates `user_profiles` row in Supabase

**Redux store** (`src/store/index.js`) — 12 slices:
- **Persisted** via redux-persist: `waste` (basket, lastScan), `pricing` (prices, savedAt)
- **Not persisted**: user, marketplace, aiConfig, bookings, buyer, notifications, schedule, customLabels, logistics, chat

**Key data** (`src/data/`):
- `wasteItems.js` — 8 recyclable materials with `nameEn`, `nameTh`, `basePrice`; use `localName(key, language)` for bilingual display
- `wasteRules.js` — classification rules for ONNX/TensorFlow scan model

**Backend**: Supabase (PostgreSQL). Client at `src/lib/supabase.js`. Main tables: `user_profiles`, `scan_history`, `shops`, `marketplace_posts`, `bookings`, `schedules`, `booking_groups`, `transfer_jobs`.

**Key booking columns** (migrations 019–022):
- `bookings`: `pickup_mode` (`dropOff|onDemand`), `pickup_lat/lng`, `booking_group_id`, `scheduled_for`, `expires_at`, `assigned_driver_id`, `driver_assignment_status` (`unassigned|invited|accepted|rejected`)
- `user_profiles`: `is_driver BOOLEAN`, `driver_vehicle TEXT`, `is_online BOOLEAN`, `current_lat/lng`, `last_seen TIMESTAMPTZ`
- `booking_groups`: multi-shop on-demand requests with 10-min `expires_at`
- `transfer_jobs`: inter-shop logistics jobs

**Key hooks**:
- `useBookingGroup` — creates/tracks multi-shop on-demand groups with Realtime + countdown
- `useDriverAssignment` — shop assigns driver (±30-min conflict guard); driver accepts/rejects; `myAssignments` Realtime
- `usePresence` — heartbeat writing `last_seen` (mount in `AuthInitializer` only)
- `useSystemMonitor` — admin: shop/user/driver presence + 5 anomaly rules, auto-refresh 30s

**Hook return conventions** (enforced across all 32 hooks):
- **Mutation hooks** always return `{ ok: boolean, error?: string }` — never `void` or `boolean`
- **Data-fetching hooks** always expose `{ data/items, loading, error }` — never swallow fetch errors silently
- **Exception**: `useActiveModels` catch → fallback to local models is intentional graceful degradation
- `useQuery.js` is the standardised async fetch wrapper — wrap new Supabase reads in it

**Optimistic update pattern** (use for all state mutations):
```js
const prev = items.find(x => x.id === id)       // 1. snapshot
setState(prev => applyChange(prev))               // 2. optimistic update
try {
  const { error } = await supabase.from(...).update(...)
  if (error) throw error
  return { ok: true }
} catch (err) {
  if (prev) setState(p => restoreSnapshot(p, prev)) // 3. rollback
  return { ok: false, error: err?.message }
}
```
Reference implementation: `src/hooks/useBookingActions.js`, `src/hooks/useSupabaseBookings.js`

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

**Component conventions**:
- All shared components in `src/components/` **must** have `PropTypes` defined (package: `prop-types`)
- Apply `React.memo` to leaf/list-item components that render inside `.map()` or under a polling parent (every 30s): `KpiCard`, `GradeTag`, `Button`, `Card`, `Avatar`, `Chip`, `MiniLabel`
- Do **not** add memo to heavy layout components (`NavBar`, `SmartLayout`) — they already own their own re-render boundaries

## i18n

- Two locale files: `src/i18n/en.js` and `src/i18n/th.js`
- **Always add new keys to both files simultaneously** — missing a key in `th.js` means Thai users see English
- Access via `useT()` hook (`src/hooks/useT.js`), which wraps `useTranslation()`
- **No `?? 'fallback'` guards** — if the key exists in both files, no fallback is needed; if the key is genuinely missing, add it to both files
- `t.errorGeneric` — generic operation-failed message; always use this in `toast.error(error ?? t.errorGeneric)` pattern

## Testing

- Framework: **Vitest** + **React Testing Library** + **MSW v2**
- Setup files: `src/test/setup.js` (MSW lifecycle) + `src/setupTests.js` (`@testing-library/jest-dom`)
- MSW handlers: `src/test/server.js` — add new handlers here when testing new Supabase tables
- Test files: `src/__tests__/` — one file per hook or component group
- **MSW server must intercept all Supabase REST calls** — never let tests hit the real DB
- Simulate failure with `server.use(http.patch('*/rest/v1/bookings*', () => HttpResponse.error()))`
- Test rollback by checking Redux state *after* a failed mutation call returns `ok: false`

```js
// Standard hook test wrapper
function makeStore(preloaded = {}) {
  return configureStore({ reducer: { bookings: bookingReducer, user: userReducer }, preloadedState: preloaded })
}
function wrap(store) { return ({ children }) => <Provider store={store}>{children}</Provider> }
```

## ESLint rules to know

- **`react-hooks/set-state-in-effect`**: never call `setState` directly in the `useEffect` body — wrap in an `async function foo() { setState(...) }; foo()` pattern
- **`react-hooks/purity`**: never call `Date.now()`, `Math.random()`, or other impure functions during render (including inside `.map()` callbacks) — compute the value in a hook or from stable state passed as a prop
- **`react-hooks/exhaustive-deps`**: **never suppress** — fix properly instead:
  - Stabilise arrays/objects with `useMemo` before adding them to deps
  - Use functional setState `prev => ...` to avoid needing state in deps
  - Reference: `BasketPage` uses `useMemo` for `shopsWithDist`, `computeRoutes`, `activeItems`; `DashboardPage` uses `useMemo` for `scheduledDate`
- **Vitest globals** (`describe`, `it`, `expect`, `vi`, etc.) are declared in `eslint.config.js` for `src/**/*.test.*` — no import needed

## AI Working Rules (from PROJECT_AI_WORKING_RULES.md)

These rules govern all AI-assisted work in this repository.

### Mandatory workflow for every task

1. Make focused changes only to files required by the task.
2. After completing changes, create a new history version file.

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

1. Always create a branch: `git checkout -b fix/<scope>` or `feat/<scope>`
2. Stage only the changed source files (never `.claude-flow/`, `.env`, secrets); stage `package.json` + `package-lock.json` when packages are added
3. Commit with Conventional Commits format: `fix:`, `feat:`, `chore:`, etc.
4. Push and open a PR: `git push -u origin <branch> && gh pr create …`
5. CI gate runs automatically: lint → unit tests → build (see `.github/workflows/pr.yml`)
6. Merge with `gh pr merge --squash --auto` once CI passes — never commit directly to `main`
7. After merging, apply any new Supabase migrations to remote: use the Supabase MCP `apply_migration` tool or `supabase db push`
