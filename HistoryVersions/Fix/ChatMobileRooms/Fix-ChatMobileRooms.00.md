# Fix-ChatMobileRooms.00 — Chat mobile room list navigation

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

## Overview

On mobile viewports, the chat room list panel was hidden (`hidden md:flex`), leaving users on `/chat` with a blank "Select a conversation" message and no way to select a room. This fix implements a standard mobile "inbox → thread" navigation pattern.

## Reason

M8 Chat was marked done, but with a known gap: mobile room list navigation was hidden. Users on mobile had no way to navigate between conversations.

## Changes

### src/pages/ChatPage.jsx

- Added `mobileView` state (`'rooms' | 'thread'`) with lazy initializer — deep-linked rooms (`/chat/:roomId`) start directly in `'thread'` view; all other entry points start in `'rooms'` view.
- Room list panel: replaces `hidden md:flex` with responsive classes that show the panel full-width on mobile when `mobileView === 'rooms'`, and as a fixed-width sidebar on `md+` regardless of state.
- Thread panel: hidden on mobile when `mobileView === 'rooms'`, shown otherwise.
- Room row click: calls `setActiveRoom(room.id)` and `setMobileView('thread')` together.
- "← Back" button added to the thread header (mobile-only via `md:hidden`) — returns to `'rooms'` view without clearing `activeRoomId`.

## Validation

- `npm run lint` — 0 errors.
- `npm run build` — clean.
- Mobile: `/chat` opens inbox list; tapping a room navigates to thread; "← Back" returns to inbox.
- Desktop `md+`: sidebar and thread visible simultaneously, unchanged behaviour.

## Notes

- Avoided `useEffect` + `setMobileView` pattern (violates `react-hooks/set-state-in-effect`). Used lazy `useState` initializer instead.
