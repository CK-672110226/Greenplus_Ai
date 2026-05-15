# Feature-ExpandedWasteRules.00

## Date
16 May 2026 (16 พฤษภาคม 2569)

## Overview
Expanded WASTE_RULES in wasteRules.js from 1-2 rules per material to 3-4 rules covering reject conditions, preparation warnings, and price-maximising tips. All 8 WASTE_ITEMS materials updated.

## Reason
Live Analysis "แนวทางการจัดการ" section was showing only one generic rule per material (e.g. glass had only "ล้างสะอาด แก้วใสได้ราคาดีกว่า"). Users need actionable preparation guidance to maximise sell price and avoid rejections.

## Changes

### `src/data/wasteRules.js`
Each material now has 3–4 rules covering:
- `reject` (red) — conditions that cause outright rejection
- `warning` (amber) — preparation steps required for acceptance
- `info` (grey) — tips to earn a better price

| Material | Rules before | Rules after |
|---|---|---|
| pet_bottle_clear | 2 | 4 |
| aluminum_can | 1 | 3 |
| cardboard | 2 | 4 |
| newspaper | 1 | 4 |
| copper | 1 | 4 |
| glass | 1 | 4 |
| cooking_oil | 1 | 4 |
| mixed_plastic | 1 | 4 |

## Validation
- Scan glass → 4 rules: reject (broken), warning (rinse), info (clear > coloured), info (sort by colour)
- Scan PET bottle → 4 rules including "ขวด PET ใสได้ราคาดีกว่า PET สี"
- Severity colours still correct: red/amber/grey per SEVERITY_COLOR map
