# Fix-ChatFileVoice.01 — Microphone recording fails on Safari / non-webm browsers

**Date:** 18 May 2026 (18 พฤษภาคม 2569)

## Overview

The voice recording button in ChatPage showed "Microphone not available" toast immediately on Safari without ever prompting for microphone permission. Root cause: `new MediaRecorder(stream, { mimeType: 'audio/webm' })` throws `NotSupportedError` on Safari (which only supports `audio/mp4`), and the catch block reported it as a microphone error.

## Reason

The code assumed `audio/webm` is universally available. On Safari (all versions), `MediaRecorder` only supports `audio/mp4`. The error was thrown after `getUserMedia` succeeded (permission was already granted or would be prompted) but looked to the user like a hardware/permission problem.

Additionally, if `navigator.mediaDevices` is undefined (non-HTTPS context), the code would throw a `TypeError` rather than giving a clear message.

## Changes

### src/pages/ChatPage.jsx — `startRecording`

- Added early guard: check `navigator.mediaDevices?.getUserMedia` exists before attempting; show "not supported" toast if absent
- Detect supported MIME type at runtime using `MediaRecorder.isTypeSupported()`:
  - Prefer `audio/webm` (Chrome, Firefox, Edge)
  - Fall back to `audio/mp4` (Safari)
  - Fall back to no mimeType (browser picks default)
- Store `mimeType` on the recorder instance as `mr._mimeType` for retrieval in `stopRecording`
- Pass `mimeType` to `sendVoice(blob, duration, mimeType)`
- Improved error message: "Microphone not available — check browser permissions"

### src/pages/ChatPage.jsx — `stopRecording`

- Read `mimeType` from `mr._mimeType` when constructing the Blob
- Pass `mimeType` as third arg to `sendVoice`

### src/hooks/useChat.js — `sendVoice`

- Added `mimeType = 'audio/webm'` parameter (default keeps backwards compatibility)
- Derive file extension from mimeType: `.mp4` if `audio/mp4`, otherwise `.webm`
- Upload blob with correct `contentType` and file path extension

## Validation

- `npm run lint` — 0 errors, 0 warnings
- `npm run build` — clean
- Chrome: `audio/webm` selected, records and uploads as `.webm`
- Safari: `audio/mp4` selected, records and uploads as `.mp4`

## Notes

- The `_mimeType` property on the MediaRecorder instance is a convention, not a web standard. Alternatives would be a `useRef` per recording or a closure variable, but `_mimeType` keeps the fix self-contained without restructuring the callbacks.
