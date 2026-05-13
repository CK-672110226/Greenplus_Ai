# Feature-SecondBrain.00

**Date:** 13 May 2026 (13 พฤษภาคม 2569)

## Overview
Implemented the "ระบบสมองที่ 2" (Second Brain) AI classification service and its Redux config slice.

## Reason
The app requires an AI layer that can classify waste from text descriptions and optionally call the Claude API for real inference. A Redux slice is needed to persist model configuration across sessions.

## Changes

### src/services/secondBrain.js (NEW)
- `classifyWaste(description, config)` async function
- Config: `{ model, apiKey, systemPrompt, confidenceThreshold }`
- When `model === 'mock'` or `!apiKey`: calls `mockClassify()` immediately
- Claude API path: `fetch('https://api.anthropic.com/v1/messages')` with `anthropic-dangerous-direct-browser-access: true` header
- Parses JSON block from Claude response text via regex
- Falls back to `mockClassify()` on any fetch/parse error
- `mockClassify()`: keyword-based detection (Thai + English), score → grade A/B/C, random weight and confidence, returns `source: 'mock'`
- Keyword priority: glass > copper > oil > aluminum_can > cardboard > newspaper > pet_bottle_clear (more specific first to avoid false matches)
- Exports `WASTE_MATERIALS` array and `DEFAULT_SYSTEM_PROMPT` constant

### src/store/aiConfigSlice.js (NEW)
- Redux Toolkit slice `aiConfig`
- Initial state hydrated from `localStorage.getItem('gp_ai_config')`
- Fields: `model`, `apiKey`, `systemPrompt`, `confidenceThreshold`
- `setAiConfig` reducer: `Object.assign` + saves merged state to localStorage

### src/store/index.js (UPDATED)
- Added `aiConfig: aiConfigReducer` to the store reducer map

## Validation
- `npm run lint` passes
- `npm run build` succeeds
- Unit tests in `src/__tests__/secondBrain.test.js` pass (7 tests)

## Notes
The `localStorage.getItem` call at module load is safe in browser environments. In test (jsdom) it returns null, falling back to defaults.
