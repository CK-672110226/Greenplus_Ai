# Feature-ChatFeature.00

**Date:** 17 May 2026 (17 พฤษภาคม 2569)

## Overview

Implements the full Chat feature (Milestone 8) for GreenPlus AI. Adds a Redux slice, a React hook, and a full ChatPage UI that lets sellers and buyers exchange real-time messages. Supabase Realtime is used for live message delivery without polling.

## Reason

The ChatPage stub shipped in an earlier milestone had no functionality. M8 requires working seller–buyer messaging backed by Supabase with real-time updates.

## Changes

### `src/store/chatSlice.js` — NEW
Redux slice with initial state (`rooms`, `activeRoomId`, `messages`) and five reducers: `setRooms`, `setActiveRoom`, `setMessages`, `appendMessage`, `clearChat`.

### `src/hooks/useChat.js` — NEW
Custom hook that:
- Loads all chat rooms for the current user on mount (both sides: seller and buyer via `or` filter).
- Loads messages for the active room and subscribes to Supabase Realtime `INSERT` events on `messages` filtered by `room_id`.
- Exposes `sendMessage` (insert into `messages`), `openOrCreateRoom` (find or create a `chat_rooms` row), and a wrapped `setActiveRoom` dispatcher.
- Cleans up the Realtime channel on room change or unmount.

### `src/pages/ChatPage.jsx` — REPLACED
Full two-column chat UI:
- Left panel (280 px, hidden on mobile via `hidden md:flex`): room list with shop name, last message preview, active room highlight (green-soft background + green left border).
- Right panel: message thread with own messages right-aligned (green bubble) and others left-aligned (paper-2 bubble), neo-brutalist borders and drop shadows, auto-scroll to latest message.
- Composer: textarea with Enter-to-send, disabled Send button when draft is empty.
- Empty states: "No conversations yet" (left panel), "Select a conversation" (right panel).

### `src/store/index.js` — MODIFIED
Added `import chatReducer from './chatSlice'` and registered `chat: chatReducer` in `configureStore`.

## Validation

- ESLint: no new errors introduced (no TypeScript, no JSDoc, no multi-line comment blocks).
- Real-time delivery: Supabase channel `room-${activeRoomId}` fires `appendMessage` on remote `INSERT`; own inserts are also reflected via the same channel so both parties see updates without a manual refresh.
- Supabase import path `'../lib/supabase'` is correct for hooks one level below `src/`.
- Redux `s.chat` selector matches the slice name `'chat'`.

## Notes / Deferred

- **ChatOfferModal** (initiate chat from a shop detail page with a pre-filled offer context) — deferred to M9.
- **Mobile room list navigation** (show room list full-screen, push to thread view on tap) — deferred to M9.
- The `last_msg` join returns an array; only `last_msg[0]` is displayed as a preview. A proper `last_message_at` ordering column can be added in a future migration if needed.
