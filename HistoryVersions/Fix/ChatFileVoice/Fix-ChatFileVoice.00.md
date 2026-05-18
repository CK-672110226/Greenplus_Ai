# Fix-ChatFileVoice.00 — Chat file send, voice send, and broken room list

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

## Overview

Three chat issues were reported by the user:
1. ส่งไฟล์ไม่ได้ — file send button was permanently disabled
2. ส่งไฟล์เสียงไม่ขึ้น — voice send button was permanently disabled
3. แชทหากันไม่ได้ — chat rooms failed to load (broken PostgREST subquery)

## Reason

- `loadRooms` in `useChat.js` used an invalid PostgREST `.or()` filter with a subquery syntax that the API doesn't support. This caused no rooms to appear for any user.
- File and voice buttons in the composer were `disabled` stubs with no implementation (`sendFile` and `sendVoice` were absent from `useChat`).

## Changes

### supabase/migrations/018_chat_attachments.sql (new)

Extends the messages table and storage to support file and voice message types:
- `ADD COLUMN IF NOT EXISTS attachment_url TEXT, attachment_name TEXT, attachment_size INTEGER`
- Drops and recreates `messages_type_check` constraint to include `'file'` and `'voice'`
- Creates `chat-attachments` public storage bucket (10 MB limit per file; image, audio, PDF, plain text MIME types)
- Storage RLS policies: `chat_attachments_upload` (authenticated INSERT) and `chat_attachments_read` (authenticated SELECT)

### src/hooks/useChat.js

- **Fixed `loadRooms`**: removed the invalid PostgREST subquery from the `.select()` call. The existing RLS policy (`chat_rooms_rls`) already restricts the query to rooms where the current user is `user_id` or the shop owner — no client-side filter is needed.
- **Added `sendFile(file)`**: uploads `file` to the `chat-attachments` bucket at `{roomId}/{timestamp}.{ext}`, then inserts a `type='file'` message with `attachment_url`, `attachment_name`, and `attachment_size`.
- **Added `sendVoice(blob, durationSec)`**: uploads a WebM audio blob to `{roomId}/voice-{timestamp}.webm`, then inserts a `type='voice'` message with `attachment_url` and body `"{N}s"`.
- Both functions throw on Supabase storage error so callers can show a toast.

### src/pages/ChatPage.jsx

- Added `FileMessage` component: renders an `<img>` for image URLs, or a download link with file name and size for other types.
- Added `VoiceMessage` component: renders an HTML5 `<audio controls>` player.
- Added hidden `<input type="file">` with `ref={fileInputRef}` accepting images, audio, PDF, and plain text.
- Added `MediaRecorder` hold-to-record implementation:
  - `startRecording()` — acquires microphone stream, starts `MediaRecorder`, saves chunks in `chunksRef`
  - `stopRecording()` — stops recorder, releases mic tracks, uploads blob via `sendVoice`
  - Voice dial button uses `onPointerDown` / `onPointerUp` / `onPointerLeave` for hold gesture
  - Button turns red and pulses while recording
- File dial button now calls `fileInputRef.current.click()` (was `disabled` stub)
- `uploading` state replaces the textarea with an animated "Uploading…" placeholder
- Message rendering updated: checks `msg.type === 'file'` and `msg.type === 'voice'` before falling through to text/offer rendering
- Offer detection changed from `msg.body.startsWith('[OFFER:')` to only apply when `!isFile && !isVoice`

## Validation

- `npm run lint` — 0 errors, 0 warnings
- `npm run build` — clean (764 ms)

## Notes

- Migration 018 is idempotent: all DDL uses `IF NOT EXISTS` or `ON CONFLICT (id) DO NOTHING`; RLS policies are wrapped in `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN NULL; END $$`
- The `audio/webm` MIME type is used because `MediaRecorder` defaults to WebM in Chromium browsers. On Safari, the MIME type may differ; the bucket allows `audio/ogg` and `audio/mp4` as well.
- `loadRooms` now relies entirely on Supabase RLS, which already enforces that only participants see their own rooms. This is the intended design per migration 016.
