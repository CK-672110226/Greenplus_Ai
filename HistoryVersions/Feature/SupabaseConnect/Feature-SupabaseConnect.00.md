# Feature-SupabaseConnect.00

**Date:** 12 May 2026 (12 พฤษภาคม 2569)

## Overview

Initial Supabase client integration for the Greenplus AI React+Vite app.

## Reason

The project requires a backend data layer. Supabase was chosen as the hosted Postgres + auth + realtime platform.

## Changes

### `package.json` / `package-lock.json`
- Added `@supabase/supabase-js` dependency (v2.x).

### `.env.local` *(new, gitignored)*
- `VITE_SUPABASE_URL` — project URL (`https://rctlhpnruyjegdcninpu.supabase.co`)
- `VITE_SUPABASE_ANON_KEY` — publishable anon key

### `src/lib/supabase.js` *(new)*
- Creates and exports a single `supabase` client instance using `createClient`.
- Reads credentials from Vite env vars (`import.meta.env`).

## Validation

- `npm install` completed with 0 vulnerabilities.
- `src/lib/supabase.js` exports the client; any component can `import { supabase } from './lib/supabase'` and call Supabase methods.
- `.env.local` is covered by the existing `.gitignore` rule `*.local`.

## Notes

- No `.env.example` was created here; add one if this repo becomes multi-contributor.
- RLS should be enabled on all tables before any user-facing queries are added.
