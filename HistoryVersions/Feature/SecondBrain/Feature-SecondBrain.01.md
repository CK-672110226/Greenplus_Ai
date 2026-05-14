# Feature-SecondBrain.01

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Production-grade prompt engineering for the Second Brain Claude classifier, plus Vercel Speed Insights integration. The system prompt was rewritten with structured sections (material catalogue, grade criteria, weight references, calibrated confidence, 3 few-shot examples). JSON response validation was hardened. `@vercel/speed-insights` was installed and wired into App.jsx.

## Reason

### Prompt improvements
The original `DEFAULT_SYSTEM_PROMPT` had several production prompt engineering problems:
1. **No examples** — LLMs without few-shot examples produce inconsistent output structure
2. **Grade undefined** — "A/B/C" with no criteria led to arbitrary and inconsistent grading
3. **Confidence uncalibrated** — Model returned high confidence uniformly (no anchor points)
4. **Material list as `a/b/c/d` slash string** — Unusual format; structured rows with Thai names are clearer
5. **No anti-hallucination guidance** — Model would guess aggressively on unclear items
6. **User message weak** — `"Classify this waste item: X"` gave no structural hint to the model
7. **max_tokens: 256** — Sometimes truncated the explanation field; raised to 300

### Speed Insights
User requested `npm i @vercel/speed-insights` for Vercel Core Web Vitals monitoring. Integration uses `@vercel/speed-insights/react` (not `/next` — this is React + Vite, not Next.js).

### JSON validation hardening
Previous code parsed the JSON and only checked `materialType`. Now validates all 5 required keys (`materialType`, `grade`, `estimatedWeight`, `confidence`, `explanation`) and clamps numeric fields to valid ranges before use.

## Changes

### `src/services/secondBrain.js`

**`DEFAULT_SYSTEM_PROMPT`** — complete rewrite:
- Role statement: "WasteScan-AI, the waste classification engine for GreenPlus.Ai"
- `MATERIAL_LINES` generated dynamically from `WASTE_ITEMS` (self-updating when new materials are added)
- `## ACCEPTED MATERIALS` section: 8 entries with Thai names from `WASTE_ITEMS`
- `## GRADING CRITERIA`: A/B/C defined with Thai context
- `## WEIGHT ESTIMATION`: Unit weight reference table for common items
- `## CONFIDENCE CALIBRATION`: 4 bands (0.9+, 0.7–0.89, 0.5–0.69, 0.00–0.49) with descriptions
- `## OUTPUT FORMAT`: explicit JSON schema string
- `## EXAMPLES`: 3 few-shot examples (high confidence, low grade, very low confidence)
- `max_tokens` raised from 256 → 300 to prevent explanation truncation

**User message**: `"Classify this waste item: X"` → `"Classify this recycled waste item.\nItem description: X"` (structured label helps Claude parse the boundary between instruction and data)

**JSON validation**:
- Check all 5 required keys present; throw if any missing
- Clamp `confidence` to [0, 1]
- Clamp `estimatedWeight` to [0.01, ∞]

### `src/App.jsx`
- Import `SpeedInsights` from `@vercel/speed-insights/react`
- Render `<SpeedInsights />` inside `<AuthInitializer>` above the route tree
- No configuration needed — Vercel auto-detects the project

### `package.json` + `package-lock.json`
- Added `@vercel/speed-insights` dependency

## Validation

- `npm run lint` — zero errors
- `DEFAULT_SYSTEM_PROMPT` is a string (template literal array joined by \n) — verified no syntax errors
- `MATERIAL_LINES` generated from `WASTE_ITEMS` — self-syncing when items change
- Speed Insights renders as a hidden analytics element — no visible UI change

## Notes

The `DEFAULT_SYSTEM_PROMPT` is still overridable by admins via the Admin Panel → AI Model Config tab (`systemPrompt` field in `aiConfigSlice`). Admins can experiment with the prompt; the default here is just the baseline.

The few-shot examples use actual Thai material names in the explanation field — this trains the model to include Thai text in explanations, which improves UX for Thai users reading scan results.

For future improvement: add a `user_locale` field to the user message so the model can return Thai or English explanations based on the current language setting.
