# Fix-DesignAudit.02 — Chat Entry Points

18 May 2026 (18 พฤษภาคม 2569)

## Overview

เพิ่ม entry point 2 จุดที่ขาดหายไปสำหรับระบบ Chat ซึ่งมี backend/UI ครบแล้วแต่ User ยังเข้าไม่ได้

## Reason

ระบบ chat (ChatPage, useChat, chatSlice, migration 014) เสร็จ ~85% แต่:
1. UserLayout ไม่มี Chat ใน navigation (Buyer มีแต่ User ไม่มี)
2. `openOrCreateRoom()` ใน useChat ไม่ถูกเรียกจากที่ไหน — ไม่มีปุ่มเปิด chat จากร้านค้า

## Changes

### src/layouts/UserLayout.jsx
- เพิ่ม `useMemo` ใน imports
- เพิ่ม `IconChat` SVG component
- เพิ่ม `unreadChat` count จาก `s.chat.messages` + localStorage `chat_lastRead` (เหมือน BuyerLayout)
- เพิ่ม `/chat` entry ใน `mainNav` (desktop sidebar) พร้อม badge
- เพิ่ม `/chat` tab ใน `mobileNav` (bottom tab bar) เป็น item ที่ 6 พร้อม badge

### src/pages/MapPage.jsx
- import `useChat` hook
- เพิ่ม `openOrCreateRoom` จาก `useChat()`
- เพิ่ม `handleChat(shopId)` — เรียก `openOrCreateRoom` แล้ว navigate ไป `/chat`
- เพิ่มปุ่ม `CHAT →` ใน shop list cards (สีเขียว border, beside DIRECTIONS + BOOK PICKUP)
- เพิ่มปุ่ม `Chat →` ใน Leaflet Popup ของแต่ละ marker

## Validation

- Lint: pass (0 errors/warnings)
- Home screenshot: bottom tab bar แสดง 6 tabs รวม CHAT ✓
- Map screenshot: shop cards แสดงปุ่ม DIRECTIONS / BOOK PICKUP / CHAT ✓

## Notes

- 6 tabs ใน mobile bottom bar: HOME | MARKETPLACE | AI(hero) | BASKET | MAP | CHAT
- CHAT tab มี badge สำหรับ unread messages เหมือน BuyerLayout
- `handleChat` เป็น async — สร้าง room ถ้ายังไม่มี ก่อน navigate
