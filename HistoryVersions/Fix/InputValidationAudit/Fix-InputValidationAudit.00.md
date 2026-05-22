# Fix-InputValidationAudit.00

**Date:** 22 May 2026 (22 พฤษภาคม 2569)
**PR:** #108 — fix(validation): add maxLength and max constraints to all unconstrained inputs
**Branch:** fix/input-validation-audit

## Overview

Full audit of every `<input>` and `<textarea>` across the project. Every unconstrained text field received a `maxLength`, and every unconstrained number field received a `max`. Previously, fields like bio, description, and weight inputs had no upper bound, allowing arbitrarily long/large values to be submitted.

## Reason

User report: "เช็คส่วน input ทั้งโปรเจค — ไม่มีการกำหนดเลยว่าต้องกรอกเป็นอะไร" (check all inputs across the project — nothing enforces what can be entered).

## Changes — Files and Constraints Applied

### `src/pages/AdminPage.jsx`
- Version tag `maxLength={30}`; model URL `type="url" maxLength={300}`; weight `max={10000}`; price `max={9999999}`; shop name `maxLength={80}`; shop area `maxLength={100}`; display name `maxLength={50}`.

### `src/pages/BasketPage.jsx`
- Both weight inputs `max={10000}` kg.

### `src/pages/BuyerOnboardingPage.jsx`
- Shop name `maxLength={80}`; description `maxLength={500}`; pickup radius `max={100}` km (raised from 50).

### `src/components/ChatOfferModal.jsx`
- Price `max={9999}` ฿/kg; weight `max={10000}` kg.

### `src/pages/DashboardPage.jsx`
- Reject reason textarea `maxLength={200}`.

### `src/pages/DriverDashboardPage.jsx`
- Actual weight `max={10000}` kg.

### `src/pages/MarketplacePage.jsx`
- Weight `max={10000}` kg; price `max={9999}` ฿/kg; shop name `maxLength={80}`; contact `maxLength={50}`.

### `src/pages/PricingPage.jsx`
- Price `max={9999}` ฿/kg; daily cap `max={50000}` kg.

### `src/pages/ProfilePage.jsx`
- Display name `maxLength={50}`; bio `maxLength={300}`; pickup notes `maxLength={400}`; shop name `maxLength={80}`; shop area `maxLength={100}`; shop description `maxLength={500}`; pickup radius `max={100}` km.

### `src/pages/ScanPage.jsx`
- Edited weight `max={10000}` kg.

### `src/components/SlotCreatePopup.jsx`
- Note textarea `maxLength={300}`.

## Constraint Reference

| Category       | Constraint |
|----------------|------------|
| Names (shop, display) | maxLength 80 / 50 |
| Area / district | maxLength 100 |
| Bio / short desc | maxLength 300 |
| Long description | maxLength 500 |
| Notes / remarks | maxLength 300–400 |
| Contact / short free-text | maxLength 50 |
| Weight (kg) | max 10 000 |
| Price (฿/kg) | max 9 999 |
| Daily cap (kg) | max 50 000 |
| Pickup radius (km) | max 100 |
| Version tag | maxLength 30 |
| Model URL | maxLength 300 |

## Validation

- Lint: clean on all 11 files.
- No logic changes — only HTML attribute additions.
- Browser enforces constraints natively; no JS validation added.
