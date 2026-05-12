# Feature-TechStack.01

**Date:** 12 May 2026 (12 พฤษภาคม 2569)

## Overview
Updated `README.md` to reflect the completed tech stack and added a comprehensive project setup guide covering prerequisites, environment variables, commands, testing, and Vercel deployment.

## Reason
After Feature-TechStack.00 added five new libraries, the README still showed the old minimal tech-stack table and a four-command Getting Started section. New contributors would have no guidance on environment setup, test commands, or deployment.

## Changes

### `README.md`
- **Tech Stack table** — added Routing, Forms, i18n, Map, Notifications, Testing, and Deploy rows
- **Getting Started** — expanded into six numbered sections:
  1. Prerequisites (Node 18+, npm 9+, Git)
  2. Clone & install
  3. Environment variables (with `.env.local` key names and where to find them in Supabase dashboard)
  4. Start development (HMR note)
  5. Run tests (watch, single-run, UI, coverage variants)
  6. Build & preview
  - Vercel deployment steps (env vars, framework preset)
- **Project Structure** — annotated every directory and key file with one-line descriptions

## Validation
- No build or test commands to run for a documentation-only change
- Reviewed for accuracy against current `package.json` and `src/` directory tree

## Notes
- `.env.local.example` is referenced but not yet created in the repo — should be added as a follow-up so `cp .env.local.example .env.local` works out of the box
