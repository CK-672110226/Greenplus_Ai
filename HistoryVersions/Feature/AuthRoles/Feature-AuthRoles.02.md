# Feature-AuthRoles.02

**Date:** 12 May 2026 (12 พฤษภาคม 2569)

## Overview
Set up full test infrastructure and wrote baseline test suite (27 tests) covering components, hooks, and page integration.

## Reason
Establish a working, convention-driven test system before adding more features. Tests run in ~800ms, give immediate regression feedback, and demonstrate the pattern for future branches.

## Changes

### `src/test/setup.js`
- Added explicit `afterEach(cleanup)` to prevent RTL DOM leakage between tests

### `src/test/helpers/renderWithProviders.jsx` (new)
- Wraps any component with Redux `Provider` (full store) + `MemoryRouter`
- Returns `{ container, store, ...rtlQueries }` for scoped assertions

### `src/test/helpers/supabaseMock.js` (new)
- Pre-built `mockSupabase` object with `vi.fn()` stubs for auth + `from()` chain
- Import and use in test files that need to spy on Supabase calls

### `src/__tests__/components/Button.test.jsx` (new)
- Renders children, calls onClick, ignores click when disabled, submit type, fullWidth class

### `src/__tests__/components/Card.test.jsx` (new)
- Renders children, merges extra className, calls onClick

### `src/__tests__/components/GradeTag.test.jsx` (new)
- A/B/C background colors via `toHaveStyle`, fallback for unknown grade

### `src/__tests__/components/ProtectedRoute.test.jsx` (new)
- Redirect when no session, shows content when session + no role requirement, role match/mismatch, loading state returns empty

### `src/__tests__/hooks/useT.test.jsx` (new)
- English strings for `language=en`, Thai strings for `language=th`, fallback to English for unknown language

### `src/__tests__/pages/LoginPage.test.jsx` (new)
- Renders email/password fields and Google button
- Shows error message on failed sign-in (mock signInWithPassword returns error)
- Calls signInWithPassword with correct credentials
- Calls signInWithOAuth with google provider
- Switches to sign-up mode

## Validation
- `npm run test:run` → 7 test files, 27 tests, 0 failed, ~800ms

## Notes
- Use `within(container)` for LoginPage tests to avoid scope collisions with RTL's global `screen` when the page title and button share the same text ("Sign In")
- Pattern: co-located helpers in `src/test/helpers/`, test files in `src/__tests__/<type>/`
- For future branches: add tests in the matching `__tests__` subfolder; use `renderWithProviders` for anything needing Redux or routing
