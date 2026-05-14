# Feature-NotificationsFlaggedPulse.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Four notification system improvements:
1. `flagged_item` notification type with orange pulsing border (admin moderation signal)
2. Updated anti-troll messages in EN and TH (funnier, less corporate)
3. Fixed Card component to pass `style` prop through (was silently ignored, breaking existing `borderLeft`)
4. Fixed hardcoded `TODAY = '2026-05-14'` in NotificationsPage to `new Date().toISOString().slice(0,10)`

## Reason

- Flagged-item pulse: admin needs a visual signal when a post is flagged for moderation
- Anti-troll messages: user directive for funnier Thai/English copy
- Card `style` fix: existing `borderLeft` on unread notifications was dead code (Card didn't pass `style` through)
- Hardcoded date: the page was showing all notifications under "Earlier" since May 15

## Changes

### `src/components/Card.jsx`
- Added `style` prop to function signature and spread onto root `<div>`

### `src/pages/NotificationsPage.jsx`
- `TYPE_ICON`: added `flagged_item: '🚩'`
- `NotifCard`: derives `isFlagged = item.type === 'flagged_item'`; applies `flagged-pulse` class when item is flagged and unread; uses orange `borderLeft` for flagged items
- `TODAY`: changed from hardcoded string to `new Date().toISOString().slice(0,10)`

### `src/i18n/en.js`
- `antiTroll`: 'Anti-Troll Filter Active' → 'Nice try, but no.'
- `rejectedHint`: corporate text → "That's not recyclable (or it's your hand again). Point the camera at actual waste."

### `src/i18n/th.js`
- `antiTroll`: 'ระบบกรองข้อมูลผิดปกติ' → 'AI ไม่หลอก… แต่คุณหลอก AI ไม่ได้หรอก'
- `rejectedHint`: plain text → 'สิ่งที่คุณสแกนไม่ใช่ขยะรีไซเคิล (หรือเป็นมือคุณอีกแล้ว?) ลองชี้กล้องไปที่ขยะจริงๆ ดูนะ'

### `src/index.css`
- Added `@keyframes flagged-pulse` — animates `box-shadow` between orange glow and transparent
- Added `.flagged-pulse` utility class

## Validation

- `npm run lint` — 0 errors
- `npm run build` — 205 modules, clean
