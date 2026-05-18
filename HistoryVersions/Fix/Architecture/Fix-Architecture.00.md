# Fix-Architecture.00 — Redux Persist, Pricing Slice Cleanup, Supabase Guard

18 May 2026 (18 พฤษภาคม 2569)

## Overview

Three architecture fixes derived from a senior-architect audit. Addresses the two highest-risk issues (basket loss on refresh, silent Supabase misconfiguration) and one anti-pattern (localStorage side-effects inside Redux reducers).

## Reason

1. **Basket lost on refresh** — `waste.basket` lived only in memory; a browser refresh or cold load silently emptied it, breaking the core scan-to-sell user journey.
2. **`pricingSlice` anti-pattern** — `bulkSet` and `resetToDefault` reducers called `localStorage.setItem` directly inside RTK reducers. Side-effects in reducers make state non-serializable, break time-travel debugging, and are an RTK anti-pattern.
3. **Silent Supabase failures** — `createClient` was called with `undefined` values when env vars were missing, causing every hook to fail at runtime with no actionable error.

## Changes

### package.json + package-lock.json

- Added `redux-persist` dependency.

### src/store/index.js

- Replaced flat `configureStore` with `combineReducers` + `persistStore`/`persistReducer` setup.
- `waste` slice persisted with whitelist `['basket', 'lastScan']`.
- `pricing` slice persisted with whitelist `['prices', 'savedAt']`.
- Added `serializableCheck` middleware config ignoring redux-persist action types (`FLUSH`, `REHYDRATE`, `PAUSE`, `PERSIST`, `PURGE`, `REGISTER`).
- Exports both `store` and `persistor`.

### src/main.jsx

- Imported `PersistGate` from `redux-persist/integration/react`.
- Wrapped `<App />` in `<PersistGate loading={null} persistor={persistor}>`.

### src/store/pricingSlice.js

- Removed all `localStorage.setItem`/`removeItem` calls from `bulkSet` and `resetToDefault` reducers.
- Removed `loadFromStorage()` function and its module-level call (replaced by redux-persist rehydration).
- `initialState` now always starts from `buildDefaultPrices()` — persist layer overwrites it on hydration.

### src/lib/supabase.js

- Added env-var guard: throws a descriptive `Error` at startup if `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` is missing.

## Validation

- `npm run lint` — clean
- `npm run build` — clean
- No remaining `gp_pricing` localStorage references in `src/`
- Basket and pricing now survive browser refresh (persisted to `localStorage` under `persist:waste` and `persist:pricing` keys)

## Notes

- `loading={null}` on PersistGate means the app renders immediately; the rehydration is synchronous for localStorage so there is no visible flash.
- The old `gp_pricing` + `gp_pricing_savedAt` localStorage keys will be orphaned in existing browser sessions but are harmless — they are never read again.
- `waste.basket` items contain `scannedAt` ISO strings which are serializable; no serialize-check issues expected.
