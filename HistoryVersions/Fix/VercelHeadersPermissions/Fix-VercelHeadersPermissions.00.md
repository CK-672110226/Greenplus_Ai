# Fix-VercelHeadersPermissions.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Fixed two headers in `vercel.json` that blocked camera (ScanPage) and geolocation (MapPage) on the deployed Vercel site.

## Root Cause

`Permissions-Policy: camera=(), geolocation=()` — empty parentheses = deny for ALL origins, including the app itself.

Browser violations observed on production:
```
[Violation] Permissions policy violation: camera is not allowed in this document.
[Violation] Permissions policy violation: Geolocation access has been blocked (Permissions-Policy)
```

Also: CSP `img-src` did not allow CartoDB tile URLs (`*.basemaps.cartocdn.com`) causing map tiles to fail to load.

## Changes

### `vercel.json`

**Permissions-Policy** (line 11):
- Before: `camera=(), microphone=(), geolocation=()`
- After: `camera=(self), microphone=(), geolocation=(self)`
- `(self)` = allow for the same origin only (greenplus-ai-chana-3523s-projects.vercel.app)
- `microphone=()` stays blocked — app does not use microphone

**Content-Security-Policy `img-src`** (line 12):
- Added `https://*.basemaps.cartocdn.com` — CartoDB Voyager + dark tile layers
- Added `https://*.tile.openstreetmap.org https://*.openstreetmap.org` — OSM fallback tiles

## Validation

- `npm run build` — 205 modules, clean

## Notes

- `manifest.json` returning 401 on Vercel is a separate issue caused by Vercel Deployment Protection (SSO) being enabled on the preview URL. Not fixable via headers — requires disabling Deployment Protection in Vercel project settings for the preview environment, or adding the manifest path to the bypass list.
