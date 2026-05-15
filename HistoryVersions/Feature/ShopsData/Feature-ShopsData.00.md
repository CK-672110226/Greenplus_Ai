# Feature-ShopsData.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Added real recycling shop and drop-off point data for the Chiang Mai Mueang-Suthep zone as a Supabase seed file. Covers 6 locations including a REFUN reverse vending machine, a mobile pickup service, a Bangchak cooking-oil drop-off, and three traditional recycling shops.

## Reason

The app needs real shop data for the SmartMap and shop finder features. These 6 shops cover the Mueang-Suthep zone that corresponds to the CMU area and surrounding neighbourhoods where initial users are expected.

## Changes

### `supabase/seed/chiangmai_suthep_shops.sql` (new)

Inserts 6 shops into `public.shops` with `status = 'active'` and no `owner_id` (pre-seeded reference data, not buyer-registered). Uses explicit stable UUIDs (`10000000-0000-0000-0000-00000000000X`) with `ON CONFLICT (id) DO NOTHING` for idempotent re-runs.

Inserts corresponding rows into `public.shop_pricing` with approximate May 2026 market rates for each accepted material.

**Shops:**

| # | Name | Area | Coordinates | Accepts |
|---|------|------|-------------|---------|
| 1 | ตู้ REFUN (คณะมนุษยศาสตร์ มช.) | CMU Humanities Faculty, Suthep | 18.803497, 98.950864 | pet_bottle_clear |
| 2 | ปภาณพสิษฐ์ รีไซเคิล | Mueang CM (pickup service) | 18.787000, 98.993000 [approx] | aluminum_can, cardboard, newspaper, mixed_plastic, glass, cooking_oil |
| 3 | ปั๊มน้ำมันบางจาก (โครงการทอดไม่ทิ้ง) | Suthep Rd, Suthep, Mueang CM | 18.802000, 98.960030 | cooking_oil |
| 4 | เอี่ยมดี รีไซเคิล | Pa Daet, Mueang CM | 18.748000, 99.009000 [approx] | pet_bottle_clear, aluminum_can, cardboard, newspaper, mixed_plastic, glass |
| 5 | ส.ทรัพย์เจริญ รีไซเคิล | Sanphisuea-Pa Khoi Tai Rd, Mueang CM | 18.849790, 98.987908 | aluminum_can, copper, mixed_plastic |
| 6 | เอส.เค. รีไซเคิล | Ring Rd (Hwy 121), Suthep, Mueang CM | 18.764146, 98.945311 | pet_bottle_clear, aluminum_can, mixed_plastic |

**Coordinate sources:**
- ตู้ REFUN, เอส.เค. รีไซเคิล, ปั๊มบางจาก: CMHY.city and Thailand Yellow Pages (high confidence)
- ส.ทรัพย์เจริญ: GPS provided by user (exact)
- ปภาณพสิษฐ์, เอี่ยมดี: approximate from subdistrict centroid — no fixed address found online (marked `[approx]` in file)

**Pricing notes:**
- ตู้ REFUN: programme rate (10 bottles = 1 baht) converted to ~5 baht/kg for Grade A
- ปั๊มบางจาก: fixed rate 20 baht/kg for used cooking oil (all grades)
- All other shops: approximate May 2026 Thai recycling market rates; update as needed

## Validation

Run in Supabase SQL Editor after `001_init.sql`. Safe to re-run due to `ON CONFLICT DO NOTHING`.

## Notes

The `owner_id` column is nullable; these rows have no owner since they are reference/admin-seeded data, not buyer-registered shops. They will be visible to all users via the "Anyone can read active shops" RLS policy.
