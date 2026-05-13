# Feature-Tests.00

**Date:** 13 May 2026 (13 พฤษภาคม 2569)

## Overview
Created unit test files for the wasteItems data layer and the Second Brain classification service.

## Reason
The two pure-logic modules (`wasteItems.js` and `secondBrain.js`) are critical path functions that benefit from automated regression tests to catch pricing and classification logic regressions.

## Changes

### src/__tests__/wasteItems.test.js (NEW)
- 7 tests: count of materials (8), grade A 1.2x multiplier, grade B base price, grade C 0.7x, Thai localName, English localName, unknown material returns 0

### src/__tests__/secondBrain.test.js (NEW)
- 7 tests: aluminum can detection, PET bottle detection, copper wire detection, glass bottle detection, mock fallback when no apiKey, confidence in 0–1 range, estimatedWeight is positive number

### src/setupTests.js (NEW)
- `import '@testing-library/jest-dom'` for DOM matchers

### vite.config.js (UPDATED)
- `setupFiles` updated to `['./src/test/setup.js', './src/setupTests.js']` to run both setup files

## Validation
- `npm run test:run` → 3 test files, 15 tests, all pass

## Notes
Tests are pure (no React, no DOM) so they run without `@testing-library/react`. The keyword priority fix in `secondBrain.js` (glass checked before bottle) was necessary to make the glass detection test deterministic.
