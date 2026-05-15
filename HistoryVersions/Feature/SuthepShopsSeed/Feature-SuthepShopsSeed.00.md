# Feature-SuthepShopsSeed.00

**Date:** 16 May 2026 (16 พฤษภาคม 2569)

## Overview

Added a self-contained Supabase SQL seed file for 6 real Chiang Mai recycling shops in the Suthep/Nimman area, along with corresponding `shop_pricing` rows for every accepted material type.

## Reason

The dev/test environment had no shop data for Chiang Mai, making map and pricing flows impossible to test without manual SQL. This seed file allows a one-shot bootstrap with idempotent inserts.

## Changes

### `supabase/seed/chiangmai_suthep_shops.sql` (new file)
- Inserts the shared buyer owner profile `00000000-0000-0000-0000-000000000099` (role=buyer) with `ON CONFLICT (id) DO NOTHING`.
- Inserts 6 shops with fixed UUIDs `a1000000-0000-0000-0000-00000000000{1-6}`, realistic Chiang Mai coordinates (lat 18.76–18.80, lng 98.96–99.01), correct `accepts[]` arrays, and `status = 'active'`.
- Inserts `shop_pricing` rows for each shop and each of its accepted material types, with Grade A = market base price, Grade B ≈ 85%, Grade C ≈ 70%. All inserts use `ON CONFLICT (shop_id, material_type) DO NOTHING` for safe re-runs.

## Shops included

| # | Name | Area | Lat | Lng | Materials |
|---|------|------|-----|-----|-----------|
| 1 | ร้านรับซื้อของเก่าเฮียหมู | นิมมานเหมินท์ | 18.8012 | 98.9681 | aluminum_can, pet_bottle_clear, mixed_plastic |
| 2 | ไฮเทครีไซเคิล | สุเทพ | 18.7921 | 98.9744 | cardboard, newspaper, pet_bottle_clear |
| 3 | ร้านรับซื้อทองเหลือง สมชาย | ช้างเผือก | 18.7964 | 98.9921 | copper, aluminum_can |
| 4 | ร้านเก็บกาก แม่หมาน | หางดง | 18.7651 | 98.9601 | glass, cooking_oil, mixed_plastic |
| 5 | กรีนพลัส รีไซเคิล | เมือง | 18.7884 | 98.9853 | aluminum_can, pet_bottle_clear, cardboard, newspaper, mixed_plastic, copper |
| 6 | ร้านซื้อขายเศษเหล็ก ชัยมงคล | สันกำแพง | 18.7793 | 99.0119 | copper, aluminum_can, mixed_plastic |

## Validation

- SQL syntax reviewed against `001_init.sql` schema: `shops`, `shop_pricing`, `user_profiles` tables.
- `ON CONFLICT` clauses match each table's primary key or unique constraint.
- `shop_pricing` foreign key `shop_id` references the fixed UUIDs set in the shops insert.
- Re-runnable: running the file twice leaves data unchanged.

## Notes

- The owner profile `00000000-0000-0000-0000-000000000099` requires a corresponding `auth.users` row. In practice, create a Supabase Auth user (e.g. `buyer_seed@greenplus.test`) and then update the profile UUID, or bypass RLS for seeding via the service role key.
- Base prices sourced from `supabase/seed/test_data.sql`.
