# Feature-LiveAnalysisHandlingGuide.00

## Date
16 May 2026 (16 พฤษภาคม 2569)

## Overview
Added a clearly labelled "แนวทางการจัดการ" (Handling Guide) section to the Live Analysis panel in ScanPage. The rules data was already in `wasteRules.js` and rendering in the JSX, but displayed without a section header — making it invisible to users who don't know to look for it.

## Reason
Users need clear guidance on how to prepare each waste type before selling (e.g. rinse PET bottles, remove tape from cardboard). The section existed but was unlabelled and visually indistinguishable from the surrounding UI.

## Changes

### `src/pages/ScanPage.jsx`
- Wrapped rules list in a `flex flex-col gap-2` container with a section label
- Label: `font-data text-[9px] uppercase tracking-[0.15em]` — matches "Detected" / "Estimated value" section headers
- Each rule row now uses `flex items-start gap-1.5` with the severity icon (`✕` / `!` / `·`) as a separate `shrink-0` span for correct alignment on long text
- `leading-relaxed` added to rule text for readability

### `src/i18n/th.js`
- Added `handlingGuide: 'แนวทางการจัดการ'`

### `src/i18n/en.js`
- Added `handlingGuide: 'Handling Guide'`

## Validation
- Scan any item → Live Analysis shows "แนวทางการจัดการ" section header above the rules list
- Rules follow WASTE_RULES in `src/data/wasteRules.js` per material
- Severity colours: red (`✕` reject) / amber (`!` warning) / grey (`·` info) remain correct
- Label language switches with app language toggle (TH/EN)

## Notes
- Rules content (`wasteRules.js`) unchanged — only the display wrapper updated.
- Materials with no rules (`WASTE_RULES[materialType] ?? []` → empty array) simply hide the section.
