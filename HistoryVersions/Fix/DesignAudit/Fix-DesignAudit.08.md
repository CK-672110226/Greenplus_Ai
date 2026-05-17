# Fix-DesignAudit.08 — Remove Clean/Dirty Price Multiplier; Revert PricingPage Grade Grid

18 May 2026 (18 พฤษภาคม 2569)

## Overview

ลบระบบ clean/dirty price multiplier ออกทั้งหมด — ราคาวัสดุใช้ basePrice เดียว (ไม่มี 0.7× สำหรับ dirty) พร้อม revert PricingPage จาก Grade A/B/C grid กลับเป็น single price per material editor

## Reason

- ระบบนี้ไม่มี grade (A/B/C) และไม่มี CO2 system
- `pricePerKg(mat, false)` คืน `basePrice × 0.7` ซึ่ง wrong — ราคาควรเป็น basePrice เสมอ
- Fix-DesignAudit.04 เพิ่ม `deriveGrades()` + Grade A/B/C grid ใน PricingPage โดยผิดพลาด

## Changes

### src/data/wasteItems.js

ลบ `clean` parameter และ multiplier:
```js
// before:
export function pricePerKg(materialType, clean = true) {
  return item.basePrice * (clean === false ? 0.7 : 1.0)
}
// after:
export function pricePerKg(materialType) {
  return item.basePrice
}
```

### src/store/pricingSlice.js

เปลี่ยน `{ clean, dirty }` shape เป็น flat price number ต่อ material:
```js
// before: prices[mat] = { clean: pricePerKg(mat, true), dirty: pricePerKg(mat, false) }
// after:  prices[mat] = pricePerKg(mat)  // just the number
```
เพิ่ม guard ใน `loadFromStorage()` เพื่อ discard stale `{ clean, dirty }` format จาก localStorage

### src/hooks/useMarketPricing.js

ลบ `clean` parameter ออกจาก `marketPrice()`:
```js
// before: function marketPrice(materialType, clean = true) { return pricing[m] ?? pricePerKg(m, clean) }
// after:  function marketPrice(materialType)               { return pricing[m] ?? pricePerKg(m) }
```

### src/pages/PricingPage.jsx (REVERT + SIMPLIFY)

ลบออกทั้งหมด:
- `deriveGrades()` function
- `gradeA`, `gradeB`, `gradeC` fields
- Grade Reference Prices section (4-column grid with Grade A/B/C)

เปลี่ยนเป็น simple single price editor (2 sections):
1. **Price Per kg** — grid 3 คอลัมน์: material / price input / status
2. **Daily Capacity (kg)** — grid 3 คอลัมน์: material / cap input / status (เหมือนเดิม)

local state shape เปลี่ยนจาก `{ gradeA, gradeB, gradeC, cap_kg }` → `{ price_per_kg, cap_kg }`

### src/__tests__/wasteItems.test.js

ลบ:
- `'dirty price returns 70% of base price'` test
- `'cardboard dirty price is 70% of base'` test
- `'default (no second arg) returns clean price'` test

เพิ่ม:
- `'returns same price regardless of any extra arg'` — ยืนยัน `pricePerKg(mat, false) === pricePerKg(mat, true) === basePrice`
- `'cardboard base price is 3'` — explicit base price check

## Validation

- `npm run test:run` → 3 test files, **16 tests, 0 failures**
- `npm run lint` → 0 errors (to verify before commit)

## Notes

- Callers ที่ pass `clean` argument เดิม (ScanPage, HomePage, BasketPage, BookingModal, etc.) ยังทำงานได้ปกติ — extra argument ถูก ignore โดย JS; ไม่ต้องเปลี่ยน callers
- `pricingSlice` localStorage guard จะ discard stale `{ clean, dirty }` entries โดยอัตโนมัติเมื่อ user เปิด app ครั้งต่อไป
