# Fix-SecurityAudit.00

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview

Security audit of the full application surface: Edge Function, Redux state persistence, client-to-server trust boundaries. Four issues found and fixed — two critical, one high, one medium.

## Issues Fixed

### Fix 1 — Dead `apiKey` field persisted to localStorage (CRITICAL)

**File:** `src/store/aiConfigSlice.js`

**Root cause:** The `aiConfigSlice` initial state had an `apiKey` field left over from before the Edge Function migration. The `setAiConfig` reducer wrote the entire state to `localStorage.gp_ai_config` on every call, including this field. If an admin had ever typed a key into any UI that dispatched `setAiConfig`, it would be persisted to disk and readable by any XSS attack.

**Fix:** Removed the `apiKey` field entirely. The Anthropic API key now lives exclusively in Supabase Edge Function secrets (`ANTHROPIC_API_KEY`), never on the client.

Also removed `systemPrompt` from the persisted state for the same reason (see Fix 2).

---

### Fix 2 — `systemPrompt` accepted from client, enabling prompt injection (CRITICAL)

**File:** `supabase/functions/classify-waste/index.ts`, `src/services/secondBrain.js`

**Root cause:** The Edge Function accepted a `systemPrompt` field from the request body and forwarded it directly to the Anthropic API as the `system` parameter. Any authenticated user could manipulate the Redux store in their browser (via devtools or a stored XSS on `gp_ai_config`) and send an arbitrary system prompt to the AI model.

**Fix:** Removed `systemPrompt` from accepted body parameters. The system prompt is now hardcoded in the Edge Function (`SYSTEM_PROMPT` constant) and cannot be overridden from the client. `secondBrain.js` no longer sends `systemPrompt` in the request body.

---

### Fix 3 — `model` accepted from client without validation (HIGH)

**File:** `supabase/functions/classify-waste/index.ts`

**Root cause:** The Edge Function used `body.model ?? 'claude-haiku-4-5-20251001'` with no validation. Any authenticated user could specify `claude-opus-4-7` or any future expensive model, incurring unbounded API costs.

**Fix:** Added `ALLOWED_MODELS` whitelist set. If the client sends a model not in the whitelist (or sends nothing), the Edge Function silently falls back to `claude-haiku-4-5-20251001`. Allowed models: `claude-haiku-4-5-20251001`, `claude-haiku-4-5`, `claude-sonnet-4-6`, `claude-sonnet-4-5`.

Also added `description` length validation — requests exceeding 2 000 characters are rejected with HTTP 400.

---

### Fix 4 — `vertexAccessToken` persisted to localStorage (MEDIUM)

**File:** `src/store/aiConfigSlice.js`

**Root cause:** `setAiConfig` wrote `{ ...state, ...action.payload }` to localStorage on every call. Because `vertexAccessToken` lives in Redux state, it was being persisted to `localStorage.gp_ai_config`. This means:
1. The token survived across browser sessions even after it expired.
2. An XSS attacker could read the active GCP OAuth2 token from localStorage.

The prior DevOps audit documented that `vertexAccessToken` should be "Admin UI only (localStorage)" — but the intent was session-only storage, not persistent disk storage.

**Fix:** Added `TRANSIENT_FIELDS = ['vertexAccessToken']` array. The `setAiConfig` reducer now filters these fields before the `localStorage.setItem` call. `vertexAccessToken` remains in in-memory Redux state for the current session but is never written to localStorage.

Also changed the initial state to always start `vertexAccessToken: ''` (ignoring any stale value in localStorage).

---

## Files Changed

- `supabase/functions/classify-waste/index.ts` — removed `systemPrompt` param; added `ALLOWED_MODELS` whitelist + 2 000 char description limit; moved system prompt server-side as `SYSTEM_PROMPT` constant
- `src/services/secondBrain.js` — removed `systemPrompt` from request body (no longer accepted server-side); removed `systemPrompt` from config destructuring
- `src/store/aiConfigSlice.js` — removed `apiKey` and `systemPrompt` fields; added `TRANSIENT_FIELDS` mechanism to exclude `vertexAccessToken` from localStorage persistence

## Validation

`npm run lint -- --max-warnings=0` → exit 0, no errors.

## Trust Boundary Summary (post-fix)

| Data | Source of truth | Sent by client? |
|------|----------------|-----------------|
| `ANTHROPIC_API_KEY` | Supabase Edge Function secret | Never |
| `system` (system prompt) | Hardcoded in Edge Function | Never |
| `model` | Client request (validated against whitelist) | Yes, but sanitized |
| `description` | Client request (≤2 000 chars) | Yes, length-limited |
| `vertexAccessToken` | Admin UI → Redux memory only | Never persisted |
