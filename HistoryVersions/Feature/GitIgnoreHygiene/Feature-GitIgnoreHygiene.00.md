# Feature-GitIgnoreHygiene.00 History

Date: 12 May 2026 (12 พฤษภาคม 2569)

## Overview

Expanded repository ignore rules to cover common environment files, cache artifacts, and generated outputs for Node.js/Vite workflows.

## Reason

The baseline `.gitignore` was minimal and could allow temporary build/test/cache files into version control. This update improves repository hygiene and reduces noisy diffs.

## Changes

1. Updated `.gitignore`
   - Added environment file ignores (`.env`, `.env.*`) while allowing `.env.example`.
   - Added coverage and test output ignores (`coverage`, `.nyc_output`).
   - Added tooling cache ignores (`.cache`, `.turbo`, `.parcel-cache`, `.vite`, `*.tsbuildinfo`).
   - Added package manager store ignore (`.pnpm-store`).
   - Added optional lockfile ignores from other package managers (`yarn.lock`, `pnpm-lock.yaml`).
   - Added additional OS/editor artifacts (`Thumbs.db`, `.obsidian/workspace-mobile.json`).

2. Added `HistoryVersions/Feature/GitIgnoreHygiene/Feature-GitIgnoreHygiene.00.md`
   - Recorded baseline feature history for repository ignore-hygiene improvement.

## Validation

- Manually reviewed `.gitignore` entries for syntax and duplicate conflicts.
- Confirmed update is non-runtime and does not change application behavior.

## Notes

- If the team later adopts Yarn or pnpm as the primary package manager, lockfile ignore policy may need to be revisited.
