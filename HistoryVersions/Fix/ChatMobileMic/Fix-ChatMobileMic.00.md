# Fix-ChatMobileMic.00

**Date:** 19 May 2026 (19 พฤษภาคม 2569)

## Overview

Chat page mobile UX fixes, system microphone permission handling, stale room preview fix, per-room unread badge, and full i18n pass.

## Reason

Mobile audit found hardcoded height breaking layout, below-minimum touch targets, no mic permission check causing silent failures, stale room previews, and all strings hardcoded in English.

## Changes

### `src/pages/ChatPage.jsx`
- **Height**: `h-[calc(100vh-64px)]` → `h-full overflow-hidden` — fills parent layout height correctly
- **i18n**: all hardcoded strings replaced with `t.*` keys (Messages, No conversations, Select a conversation, ← Back, Send, Uploading, Sending voice, placeholder)
- **Back button**: `py-1` → `py-2.5 min-h-[44px]` — 44px touch target
- **FAB action buttons**: `w-9 h-9` (36px) → `w-11 h-11` (44px)
- **Send button**: added `min-h-[44px]`
- **Textarea auto-grow**: `onInput` calls `growTextarea()` — expands up to 120px, resets on send
- **Per-room unread badge**: green dot on rooms with messages newer than `chat_lastRead` timestamp
- **Microphone permission**: `queryMicPermission()` checks `navigator.permissions.query({ name: 'microphone' })` before recording — shows i18n error toast if `denied`; falls back to `prompt` if Permissions API unsupported
- **SVG icons**: replaced emoji `📎`, `🎤`, `📄` with inline SVG (design spec: no emoji)

### `src/store/chatSlice.js`
- Added `updateRoomLastMsg` reducer — updates `rooms[].last_msg[0]` when a realtime message arrives, keeping room list preview current

### `src/hooks/useChat.js`
- Dispatches `updateRoomLastMsg` alongside `appendMessage` in realtime subscription callback

### `src/i18n/en.js` + `src/i18n/th.js`
- Added: `chatMessages`, `noConversations`, `selectConversation`, `chatBack`, `chatSend`, `chatPlaceholder`, `sendingVoice`, `micDenied`, `micHold`, `micRecording`

## Validation

- `npm run lint` — 0 errors
- `npm run build` — clean
