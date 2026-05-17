# Feature-ChatFeature.01

**Date:** 17 May 2026 (17 พฤษภาคม 2569)

## Overview

Extends the M8 Chat feature with two enhancements: (1) an unread-count badge on the Chat nav link in BuyerLayout, and (2) a ChatOfferModal component that lets users send structured material offers inside a chat room.

## Reason

M8 Chat shipped with a working real-time message thread but lacked two visible UX affordances:
- Buyers had no way to know they had unread messages when navigating away from the Chat page.
- There was no structured way to propose a material offer inside a conversation; users had to type freeform text.

## Changes

### `src/layouts/BuyerLayout.jsx` — MODIFIED

- Added `useMemo` import.
- Added `IconChat` SVG icon function (speech-bubble).
- Added `session` and `chatMessages` selectors from Redux (`s.user.session`, `s.chat.messages`).
- Added `unreadChat` computed via `useMemo`: counts messages in the active-room `messages` array where `sender_id !== currentUserId` and `created_at > lastRead[room_id]` (persisted in `localStorage` key `chat_lastRead`).
- Added `<SideLink to="/chat" icon={<IconChat />} label="Chat" badge={unreadChat} />` to the "Main" nav section (after Pricing), using the existing `badge` prop already supported by `SideLink`.

### `src/components/ChatOfferModal.jsx` — NEW

Modal for sending a structured offer inside a chat room. Props:
- `onSend(offer)` — called with `{ type, material, price, weight, date }`.
- `onClose()` — called on cancel or after send.
- `language` — passed to `localName()` for Thai/English material names.

UI: fixed overlay with bottom-sheet on mobile / centered card on desktop. Fields: Material select (from `WASTE_ITEMS`), Price (฿/kg), Weight (optional), Pickup Date (optional). Send button disabled until material + price are filled. Follows neo-brutalist tokens: `--paper`, `--ink`, `--ink-3`, `--ink-4`, `font-data`, `font-body`.

### `src/pages/ChatPage.jsx` — MODIFIED

- Added `ChatOfferModal` import.
- Added `language` selector from Redux (`s.user.language`), passed to modal.
- Added `offerOpen` state (boolean).
- Added `useEffect` that writes `localStorage.chat_lastRead[activeRoomId]` to the latest message's `created_at` whenever the message list changes — this drives the unread badge in BuyerLayout to zero when the room is open.
- Added `handleOffer(offer)` — formats offer fields into `[OFFER] material · ฿price/kg · weightkg · date` using `\xB7` middle-dot separator, then calls `sendMessage`.
- Moved modal render above the message-thread div so it mounts in the document root flow and not inside the flex layout.
- Added "+ Offer" button to the Composer bar (left of textarea). Styled with `--ink-4` border, `font-data`, uppercase, tracks widest — matches existing composer style.
- Offer messages (body starts with `[OFFER]`) render with `--green-soft` background, `--green` border, an "Offer" micro-label in `--green-ink`, and the body with `[OFFER] ` prefix stripped for readability.

## Validation

- `npm run lint`: 0 new errors/warnings introduced. Pre-existing `AdminPage.jsx` error (`set-state-in-effect`) unchanged.
- `localStorage` key `chat_lastRead` is a JSON object keyed by `room_id`; safe to read with `JSON.parse(... ?? '{}')` in BuyerLayout even before any room is opened.
- `unreadChat` correctly returns 0 when `session` is null (buyer not logged in) — the `if (!session?.user?.id) return 0` guard handles this.
- Offer body format: `[OFFER] pet_bottle_clear · ฿8/kg · 10kg · 2026-06-01` — parsable by any future automation.

## Notes

- The Chat SideLink is added to BuyerLayout only (buyer role). UserLayout does not have a Chat nav item (user role accesses chat from marketplace shop detail).
- The `chatRooms` selector was initially included in `useMemo` deps but removed after lint flagged it as unnecessary — the computation only uses `chatMessages` and `session`.
- Mobile bottom tab bar for BuyerLayout does not include Chat (it only shows 5 items with a hero center). Chat is accessible via desktop sidebar or direct URL.
