# Feature-SEO.00

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

SEO foundation layer: complete `<head>` rewrite with Thai meta tags, Open Graph / Twitter Card previews, JSON-LD structured data, non-blocking font loading, PWA manifest, and `robots.txt` + `sitemap.xml` for crawler guidance.

## Reason

- `<title>` was "GreenPlus.Ai" — no keywords, no value proposition; Google would display it as-is
- No `<meta name="description">` — SERP snippet is auto-generated (poor CTR)
- No Open Graph tags — LINE, Facebook, iMessage show no preview when the URL is shared
- No structured data — Google can't understand the app category, location, or language
- Google Fonts was loaded as a render-blocking `<link rel="stylesheet">` — delayed LCP by 300–800ms on mobile
- No `robots.txt` — crawlers attempted to index authenticated SPA routes (wasted crawl budget)
- No `sitemap.xml` — crawlers couldn't efficiently discover indexable pages
- No `manifest.json` — browser couldn't install the app as PWA; no branded splash screen

## Changes

### `index.html`

**Title tag:**
```
GreenPlus.Ai — AI คัดแยกขยะรีไซเคิล หาราคาและร้านรับซื้อใกล้คุณ
```

**Meta description** (Thai, 93 chars — under 160-char limit):
Covers primary value props: AI scan, today's prices, nearby buyer discovery in Chiang Mai.

**Keywords meta** — secondary signal for some crawlers (Thai + English blend).

**Canonical tag** — `https://greenplus.ai/` prevents SPA query-string variants from being treated as duplicate content.

**hreflang tags** — `th` (default), `en` (via `?lang=en`), `x-default` for language-unspecified users.

**Open Graph tags:**
- `og:type`, `og:url`, `og:site_name`, `og:title`, `og:description`, `og:image` (1200×630)
- `og:locale`: `th_TH` + `og:locale:alternate`: `en_US`
- Image URL: `https://greenplus.ai/og-cover.png` — **must be created and deployed** (see Notes)

**Twitter Card** — `summary_large_image` type.

**Icons & PWA:**
- `apple-touch-icon` → `/Lightmode.png`
- `<link rel="manifest" href="/manifest.json">`
- `<meta name="theme-color" content="#16a34a">` — browser chrome tinted green
- `apple-mobile-web-app-capable` and status bar meta tags

**JSON-LD structured data:**
- Schema type: `WebApplication` (correct for a browser SPA)
- `applicationCategory`: `UtilitiesApplication`
- `offers.price`: 0 (free to use)
- `provider.areaServed`: Chiang Mai (city)
- Enables Google's rich results for app-type queries

**Font loading — non-blocking:**
Changed `<link rel="stylesheet">` to `media="print" onload="this.media='all'"` pattern.
Fonts are downloaded in the background; LCP is no longer blocked by Google Fonts.
`<noscript>` fallback preserves fonts for crawlers.

### `public/robots.txt` (NEW)

Blocks all authenticated routes (`/scan`, `/basket`, `/dashboard`, etc.) and the admin panel.
Allows `/ ` and `/login` for indexing.
Points to sitemap.

### `public/sitemap.xml` (NEW)

Includes two indexable URLs:
- `https://greenplus.ai/` — priority 1.0, weekly
- `https://greenplus.ai/login` — priority 0.5, monthly

Both include `xhtml:link` hreflang alternates.

### `public/manifest.json` (NEW)

- `display: standalone` — launches as full-screen PWA when added to home screen
- `theme_color: #16a34a` — matches CSS `--green` token
- `background_color: #f5f0e8` — matches CSS `--paper` token (splash screen)
- `lang: th`
- Icon: `/Lightmode.png` (192×192)

## Validation

- `npm run lint` — zero errors (HTML files not linted by ESLint)
- Open Graph tags: verify at https://opengraph.xyz/ or Meta Sharing Debugger after deployment
- robots.txt: verify at `https://greenplus.ai/robots.txt`
- sitemap.xml: submit to Google Search Console after deployment

## Notes

**Action required — OG cover image:**
Create `public/og-cover.png` at 1200×630px with the GreenPlus.Ai brand mark + tagline.
Until this image exists at the production URL, social previews show nothing.
Suggested content: green background, logo, "AI คัดแยกขยะ · หาราคารับซื้อ · เชียงใหม่".

**Domain assumption:**
All absolute URLs use `https://greenplus.ai`. Update if the production domain differs.

**Dynamic meta for inner pages:**
This implementation gives every page the same title/description (SPA limitation).
For phase 2, implement react-helmet or Vite SSR to inject per-page meta.
