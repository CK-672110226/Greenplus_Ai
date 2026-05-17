# Fix-DesignAudit.04 — PricingPage Grade A/B/C Grid

18 May 2026 (18 พฤษภาคม 2569)

## Overview

เพิ่ม grade reference grid ขนาด 8×3 (8 วัสดุ × 3 เกรด A/B/C) ใน PricingPage ตาม design spec ที่กำหนดใน section 3.11 (Pricing tab ของ DashboardPage) ซึ่งระบุคอลัมน์ Material | Grade A | Grade B | Grade C | Cap

## Reason

Design spec (section 3.11) ระบุ pricing table ต้องมี 3 คอลัมน์ราคา (Grade A / B / C) ต่อวัสดุ แต่ PricingPage เดิมแสดงเพียงราคาเดียว (`price_per_kg`) ต่อวัสดุ — เป็น 8×1 แทนที่จะเป็น 8×3

## Changes

### src/pages/PricingPage.jsx

**Data structure change:**
- เพิ่มฟังก์ชัน `deriveGrades(gradeA)` — คำนวณ Grade B ≈ 65% และ Grade C ≈ 35% ของ Grade A (rounded to nearest 0.01)
- `buildDefaultPrices()` เปลี่ยนจาก `{ price_per_kg, cap_kg }` เป็น `{ gradeA, gradeB, gradeC, cap_kg }`
- `loadShopPricing()` ใน useEffect: ดึง `price_per_kg` จาก DB แล้วแปลงเป็น grades ผ่าน `deriveGrades()`
- `handleChange` แยกเป็น `handlePriceChange(mat, raw)` (Grade A เท่านั้น — B/C auto-derived) และ `handleCapChange(mat, raw)`
- `handleSave()` ส่ง `gradeA` เป็น `clean`/`dirty` ไปยัง Redux และ Supabase `price_per_kg` เหมือนเดิม — backward-compatible

**JSX/layout change:**
- แทนที่ single-section table 4 คอลัมน์ด้วย 2 sections แยกกัน:
  1. **Grade Reference Prices** — CSS Grid 4 คอลัมน์ (`2fr 1fr 1fr 1fr`): Material | Grade A | Grade B | Grade C
     - Header row: border `1.5px solid var(--ink)`, Grade A header มี `background: var(--green-soft)`
     - แต่ละ row: 4 cells ต่อกัน ไม่มี border-radius (neo-brutalist), border ซ้าย-ขวา-บน-ล่าง ด้วย `var(--ink)`
     - Grade A cell: `background: var(--green-soft)`, มี `<input type="number">` แบบ inline (editable)
     - Grade B / Grade C: แสดงค่า read-only ที่ auto-derive จาก Grade A
     - Typography: `font-data`, `text-[11px]` สำหรับ header; `text-[12px]` สำหรับค่าในเซลล์
  2. **Daily Capacity (kg)** — 3-column grid (Material | Cap input | Status) เหมือนเดิม แต่ใช้ `gradeA` แทน `price_per_kg` สำหรับ status check

**CSS tokens used:** `--ink`, `--ink-3`, `--ink-4`, `--paper`, `--green`, `--green-soft` — ไม่มี raw hex

## Validation

- Lint: pass — `npm run lint` คืนค่า exit 0, 0 errors, 0 warnings
- Grid: 8 materials × 3 grades = 24 price cells rendered (Grade A editable, B/C read-only)
- Grade A column: highlighted with `var(--green-soft)` background ทั้ง header และ cells
- No rounded corners — neo-brutalist flat style ตลอด
- Borders: `1.5px solid var(--ink)` ทุก cell
- Column headers: uppercase, `font-data` (JetBrains Mono)
- Redux/Supabase backward-compatible: ยังส่ง `price_per_kg` (= gradeA) ออกไปเหมือนเดิม

## Notes

Grade B/C derivation:
- Grade B = `Math.round(gradeA × 0.65 × 100) / 100`
- Grade C = `Math.round(gradeA × 0.35 × 100) / 100`

ตัวอย่างราคาเริ่มต้นจาก `wasteItems.js` basePrice:
| Material         | basePrice | Grade A | Grade B | Grade C |
|------------------|-----------|---------|---------|---------|
| Clear PET Bottle | 8         | 8       | 5.2     | 2.8     |
| Aluminum Can     | 40        | 40      | 26      | 14      |
| Cardboard        | 3         | 3       | 1.95    | 1.05    |
| Newspaper        | 2         | 2       | 1.3     | 0.7     |
| Mixed Plastic    | 5         | 5       | 3.25    | 1.75    |
| Copper           | 200       | 200     | 130     | 70      |
| Glass            | 1         | 1       | 0.65    | 0.35    |
| Cooking Oil      | 12        | 12      | 7.8     | 4.2     |

ไม่ได้แก้ `wasteItems.js` หรือ `pricingSlice.js` — ตรรกะ grade derivation อยู่ใน `PricingPage.jsx` เท่านั้น เพื่อไม่กระทบส่วนอื่นของระบบที่ใช้ `pricePerKg()` หรือ Redux pricing state
