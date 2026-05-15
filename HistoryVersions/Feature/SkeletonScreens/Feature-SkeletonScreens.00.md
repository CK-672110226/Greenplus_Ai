# Feature-SkeletonScreens.00

**Date:** 15 May 2026 (15 พฤษภาคม 2569)

## Overview

Replaced all animate-pulse "Loading..." text spinners with proper block skeleton UI across four pages. Fixed hardcoded build date in SettingsPage.

## Changes

- DashboardPage: 3 skeleton rows (h-20) instead of "Loading..." text while bookings load
- MarketplacePage: 4 skeleton rows (h-12) instead of "Loading prices…" text while pricing loads
- SchedulePage: 2 skeleton rows (h-24) instead of "Loading..." text while slots load
- MapPage: placeholder skeleton block matching map dimensions while shops load
- SettingsPage: version footer now uses dynamic date instead of hardcoded "20260514"

## Validation

npm run lint — clean. npm run build — built in 375ms.
