# Feature-AiScannerMvp.02

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Senior ML/AI engineering audit: fixed call-stack overflow in softmax, WASM memory leak in clearModelCache, unsafe argmax, bounds checks, imprecise source tracking, and complete secondBrain.js hardening with timeout, error handling, and WASTE_MATERIALS sync.

## Reason

- `softmax` used `Math.max(...logits)` — spread of a Float32Array with thousands of elements causes call stack overflow in V8; silent crash with no scan result.
- `clearModelCache` dropped JS references but never called `session.release()` — ONNX WASM heap leaked on every model URL change from the Admin panel.
- `onnxStage1` used `probs.indexOf(Math.max(...probs))` — same spread issue; also had no `logits.length < MATERIALS.length` bounds check.
- `onnxStage2` had no bounds check on logits length.
- Source field was binary ('onnx' / 'mock') — impossible to diagnose stage1-ONNX + stage2-mock combinations during model rollout.
- `secondBrain.js` had no request timeout — Claude API hangs left the ScanPage spinner indefinitely.
- `secondBrain.js` did not check `response.ok` — HTTP 4xx/5xx errors were silently swallowed.
- `secondBrain.js` `WASTE_MATERIALS` was a hardcoded constant that could drift from `wasteItems.js`.
- No inference timing logs — impossible to measure latency in production.

## Changes

### `src/services/onnxInference.js`

- **`softmax()`** — replaced `Math.max(...logits)` and `.map()/.reduce()` with explicit `for` loops and `Float64Array`; no spread on typed arrays.
- **`runOnnx()`** — added `performance.now()` timing; logs `[ONNX] inference Nms` on success.
- **`clearModelCache()`** — now calls `await session.release()` on each cached ONNX `InferenceSession` before clearing the cache map, releasing WASM heap.

### `src/services/twoStageAI.js`

- **`onnxStage1()`** — added `logits.length < MATERIALS.length` guard; replaced `indexOf(Math.max(...probs))` with an explicit `for` loop argmax; slices logits to `MATERIALS.length` before softmax.
- **`onnxStage2()`** — added `logits.length < 1` guard; slices logits to first 2 outputs (clean/dirty).
- **`source` field** — now four possible values: `'onnx'` (both stages), `'onnx+mock'` (stage1 ONNX, stage2 mock), `'mock+onnx'` (stage1 mock, stage2 ONNX), `'mock'` (both mock).

### `src/services/secondBrain.js`

- **`WASTE_MATERIALS`** — now derived from `Object.keys(WASTE_ITEMS)` (imported from `wasteItems.js`); single source of truth, never drifts.
- **`DEFAULT_SYSTEM_PROMPT`** — rebuilt to include the actual `WASTE_MATERIALS` list so Claude's output matches the current taxonomy.
- **Timeout** — `AbortController` with `API_TIMEOUT_MS = 15_000`; `[SecondBrain] timeout after 15000ms` logged on abort.
- **`response.ok` check** — HTTP 4xx/5xx now throws with status code and body prefix.
- **`max_tokens`** reduced to `256` (JSON output is short; was 512 — wastes tokens and latency).
- **materialType sanitisation** — unknown categories (Claude hallucination) fall back to mock instead of passing invalid data to the rest of the pipeline.
- **Timing log** — `[SecondBrain] model Nms conf=X.XX` on every successful API call.

## Validation

- `npm run lint` — zero errors
- `softmax([...Array(10000)])` — completes in <1ms with the loop implementation; spread version threw RangeError on Node.js (same V8 stack depth as browser).
- No TypeScript — correctness verified by code inspection.

## Notes

The Anthropic API key is still accessed directly from the browser (stored in `gp_ai_config` localStorage). This is an accepted MVP limitation. Production remediation: create a Supabase Edge Function proxy so the key never reaches the client.

The `mock-fallback` source value lets `useScanInsert.js` correctly identify rows that fell back from Claude to mock inference, keeping `ai_source` in `scan_history` accurate.
