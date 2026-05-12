# Feature-AuthRoles.00

**Date:** 12 May 2026 (12 พฤษภาคม 2569)

---

## Overview

Implemented PRD Milestone M2: Supabase-based email/password authentication, three-role routing (user / buyer / admin), Thai/English language toggle via Redux, and all eight route-level page shells.

## Reason

M2 is the prerequisite for every feature milestone M3–M10. Without auth, role detection, and routing, no protected feature page can be built or tested.

## Changes

### `src/main.jsx`
- Wrapped application with Redux `<Provider store={store}>`
- Kept React 19 `createRoot` pattern unchanged

### `src/App.jsx`
- Replaced Vite boilerplate with `<BrowserRouter>` + `<Routes>`
- Routes: `/`, `/login`, `/scan`, `/basket`, `/map`, `/marketplace`, `/dashboard`, `/admin`, `/settings`
- `AuthInitializer` wrapper component calls `useAuth()` at the root so session state is initialised before any route renders

### `src/store/index.js` (new)
- Redux store with three slices: `user`, `waste`, `marketplace`

### `src/store/userSlice.js` (new)
- State: `session`, `profile`, `language` (auto-detects Thai browser locale), `loading`
- Actions: `setSession` (also clears `loading`), `setProfile`, `setLanguage`, `clearUser`

### `src/store/wasteSlice.js` (new)
- State: `basket[]`, `lastScan`
- Actions: `addToBasket`, `removeFromBasket`, `clearBasket`, `setLastScan`

### `src/store/marketplaceSlice.js` (new)
- State: `posts[]`, `gradeFilter`, `bookingQueue[]`
- Actions: `setPosts`, `setGradeFilter`, `setBookingQueue`

### `src/hooks/useAuth.js` (new)
- Calls `supabase.auth.getSession()` on mount; sets `session` + `loading = false`
- Subscribes to `supabase.auth.onAuthStateChange` for live updates
- Fetches matching row from `user_profiles` and dispatches to `userSlice`

### `src/hooks/useT.js` (new)
- Reads `state.user.language` from Redux; returns `en` or `th` translation object

### `src/i18n/en.js` (new) — English strings
### `src/i18n/th.js` (new) — Thai strings

### `src/pages/LandingPage.jsx` (new)
- Role selector: three cards (User/Seller, Buyer/Shop, Admin)
- Already-authenticated users are redirected to their role home via `<Navigate>`
- Shows during `loading` (brief blank) then resolves

### `src/pages/LoginPage.jsx` (new)
- Email/password sign-in and sign-up (mode toggle)
- Sign-up creates `user_profiles` row with selected role + default values
- On success, navigates to role home (`/scan`, `/dashboard`, `/admin`)

### `src/pages/SettingsPage.jsx` (new)
- Language toggle (th/en) saved to Redux `userSlice`
- Displays current role and eco-points (user role only)

### Placeholder pages (new — functional stub, content added in later milestones)
- `src/pages/ScanPage.jsx` — M3
- `src/pages/BasketPage.jsx` — M3
- `src/pages/MapPage.jsx` — M5
- `src/pages/MarketplacePage.jsx` — M4
- `src/pages/DashboardPage.jsx` — M6
- `src/pages/AdminPage.jsx` — M7

## Validation

- `npm run dev` starts without errors
- Landing page shows role selector; clicking a card navigates to `/login?role=<role>`
- Sign-up creates user in Supabase Auth + inserts row in `user_profiles`
- Sign-in redirects to correct role home page
- Language toggle switches all UI strings between Thai and English
- Navigating to `/scan` without auth redirects to `/login`
- NavBar shows role-appropriate links after sign-in

## Notes

- `user_profiles` table must exist in Supabase before sign-up will succeed (schema in PRD §7)
- Admin role is set at sign-up; production systems should gate this via Supabase admin or RLS
- Language preference is stored only in Redux (session-scoped); PRD §7 `language_pref` column sync deferred to M9
