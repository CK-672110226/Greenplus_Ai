# Feature-ProfilePages.00

**Date:** 13 May 2026 (13 พฤษภาคม 2569)

## Overview
Implements M3b — role-aware profile pages for User, Buyer, and Admin, accessible at `/profile`.

## Reason
PRD user stories U-14 (user profile with Eco-Points + scan history), B-05 (buyer shop profile + accepted materials), and A-04 (admin badge + pending actions) require a dedicated profile route.

## Changes

### `src/pages/ProfilePage.jsx` (NEW)
- `ProfilePage` renders a different sub-component depending on `profile.role`
- **UserProfile**: Avatar with initials, email, role badge, stats row (eco points / total scans / total value), mock scan history list with GradeTag + date + value
- **BuyerProfile**: Avatar, shop identity, accepted-materials toggle grid (all 8 material types), Save button triggers toast (wired to Supabase in M10 final)
- **AdminProfile**: Avatar, admin badge, 3-stat card (shops to approve / active shops / flagged posts)
- `Avatar` sub-component: green square with initials derived from `display_name` or email prefix

### `src/App.jsx`
- Added `/profile` route (ProtectedRoute, no role restriction)
- Added `useEffect` in `AuthInitializer` that toggles `.dark` class on `documentElement` when `darkMode` changes

### `src/components/NavBar.jsx`
- Added `{t.profile}` NavLink for all signed-in users
- Added `{t.ecoPoints}` NavLink for `user` role

## Validation
- `npm run lint` — 0 errors
- `npm run build` — succeeds
- Profile page renders correct sub-component per role

## Notes
Mock scan history uses hardcoded data; will be replaced by Supabase query in M10 final. Accepted-materials save currently fires a toast; Supabase update wired in M10 final.
