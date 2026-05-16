# GreenPlus Ai

> **เปลี่ยนขยะจากสิ่งไร้ค่า สู่สินทรัพย์ที่มีมูลค่าทางจิตใจและการเงิน เพื่อสร้างสังคมที่ยั่งยืน**  
> *Turn waste from worthless to an asset — financially and spiritually — for a sustainable society.*

---

## What is GreenPlus Ai?

GreenPlus Ai is a **bilingual (Thai / English) waste-to-value platform** built for the community around Chiang Mai University (CMU rear zone) and Tambon Suthep. It connects three roles:

| Role | Description |
|------|-------------|
| **User (Seller)** | Scan recyclable waste, get an instant AI valuation, and find the best nearby buyers |
| **Buyer (Shop)** | Industrial dashboard to manage pricing, booking queues, and incoming waste supply |
| **Admin** | Heatmap oversight, new-shop approval, and Marketplace moderation |

---

## Key Features

- **2-Stage AI Scanner** — Stage 1 detects object type (PET bottle, aluminium can, cardboard…); Stage 2 scores cleanliness (Clean / Dirty) for fair pricing
- **Edge AI Processing** — All image analysis runs in the browser; no user photos are uploaded to any server (Privacy First)
- **Real-time Valuation** — Formula-based pricing engine using Chiang Mai market reference rates (May 2026)
- **Smart Basket** — Accumulate scan results, adjust weights, then find the nearest shop that accepts everything — or get a multi-stop route plan sorted by distance
- **Multi-Stop Tree Routing** — Nearest-neighbor TSP graph traversal: advances the current node to each visited shop, minimising total travel distance across all drops
- **Shop Calendar Filtering** — Shops declare open days (`openDays`); routing engine filters closed shops before building any route so users never navigate to a closed shop
- **Smart Map** — Pulsing map pins show shops that accept the material currently in hand
- **Marketplace** — High-density list view for buying / selling recyclables with grade filtering
- **Role Profiles** — Per-role profile pages: User (scan history + Eco-Points), Buyer (shop info + accepted materials), Admin (pending actions + platform stats)
- **Buyer Calendar Dashboard** — Buyers toggle Open/Closed for each day of the week to manage routing availability
- **Live Booking Notifications** — Buyers receive real-time alerts via Supabase Realtime when new bookings arrive; open-days and accepted-materials settings persist across devices
- **Waste Handling Rules** — Per-material rule cards (reject / warning / info / dispose) guide users on preparation, correct bins, and drop-off points for all 8 material types
- **Eco-Points (Impact Points)** — Gamification layer rewarding verified recycling activity
- **Anti-Troll System** — Detects humans / living things in the scanner and responds with a playful message
- **Dark Mode** — Full token-based dark-mode support

---

## Responsive Layout — Desktop vs Mobile

The application fully supports both viewports. Layout rules differ by page and role:

| Page / Feature | Mobile (`< 768px`) | Desktop (`≥ 768px`) |
|---|---|---|
| **Navigation** | Fixed Bottom Tab Bar (User) · Horizontal strip (Buyer/Admin) | Fixed Left Sidebar (200–240 px) · main content fills remaining width |
| **Scanner** | Full-screen camera · Bottom Sheet popup (swipe up/down) | Left: camera viewport · Right: fixed result panel with factor breakdown · keyboard/drag replaces swipe |
| **Basket & Routing** | Stacked cards · route map behind toggle | 2-column split: left basket items · right Smart Map + route steps |
| **Marketplace** | Single-column feed · filters in drawer | 2–3-column grid · filters in persistent sidebar |
| **Buyer Dashboard** | Stacked metrics · horizontal-scroll tables | Grid metrics (3–4 per row) · full-width booking queue + pricing CRUD |

---

## Design System — Mono-Logic Minimalist v0

| Token | Value |
|-------|-------|
| Background (Paper) | `#FAFAF7` |
| Ink (text / borders) | `#1A1A1A` |
| Primary Accent | `#22C55E` (green) |
| Alert / Grade C | `#F59E0B` (orange) |
| Bounding Box | `#5BC0BE` (blue) |
| Border | `1.5px solid var(--ink)` |
| Shadow | `2px 2px 0 var(--ink)` (flat offset, no blur) |
| UI Font | `Architects Daughter`, `Caveat` / `Sarabun` (Thai) |
| Data Font | `JetBrains Mono` / `IBM Plex Sans Thai` (Thai) |

**Rules:** No drop shadows. No gradients. Paper background — not white screen. Data is the UI.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 (Functional Components) + Vite 8 |
| Routing | React Router DOM v7 |
| State | Redux Toolkit (`wasteSlice`, `marketplaceSlice`, `userSlice`) |
| Styling | Tailwind CSS v4 + CSS custom properties (design tokens) |
| Forms | React Hook Form + Zod (schema validation) |
| i18n | i18next + react-i18next (TH / EN, synced with Redux) |
| Map | react-leaflet + Leaflet (open-source, no API key) |
| Notifications | Sonner (toast system, mounted at app root) |
| Testing | Vitest + Testing Library + jsdom |
| Backend / DB | Supabase (Postgres + Auth + Storage) |
| AI | Edge AI — browser-side inference (YOLO-based detection) |
| Deploy | Vercel |
| Environment | `.env.local` — API keys never committed |

---

## Database Schema

| Table | Key Columns |
|-------|-------------|
| `waste_items` | `id`, `name`, `unit`, `base_weight`, `base_price` (dirty = base_price × 0.7) |
| `shops` | `id`, `owner_id`, `name`, `lat`, `lng`, `accepts[]`, `openDays[]`, `verified`, `status` |
| `marketplace_posts` | `id`, `user_id`, `title`, `material_type`, `status` |
| `user_profiles` | `id`, `role`, `language_pref`, `eco_points` |
| `scan_history` | `id`, `user_id`, `item_type`, `grade`, `calculated_value` |
| `bookings` | `id`, `user_id`, `shop_id`, `slot_id`, `materials`, `status` |
| `shop_hours` | `shop_id`, `day_of_week`, `open_time`, `close_time`, `is_open` |
| `time_slots` | `shop_id`, `date`, `start_time`, `capacity`, `booked_count` |

---

## Pricing Reference — In-App Base Rates (May 2026)

Clean = base price. Dirty = base price × 0.7.

| Material | Clean (base) | Dirty (×0.70) |
|----------|-------------|---------------|
| PET bottle (clear) | ฿8/kg | ฿5.60/kg |
| Aluminium can | ฿40/kg | ฿28/kg |
| Cardboard | ฿3/kg | ฿2.10/kg |
| Newspaper | ฿2/kg | ฿1.40/kg |
| Mixed plastic | ฿5/kg | ฿3.50/kg |
| Copper | ฿200/kg | ฿140/kg |
| Glass | ฿1/kg | ฿0.70/kg |
| Used cooking oil | ฿12/kg | ฿8.40/kg |

*Reference rates derived from Chiang Mai scrap-shop surveys (วงษ์พาณิชย์, ปั๊มบางจาก ทอดไม่ทิ้ง, Recycle Station ตลาดจริงใจ)*

---

## Getting Started

### Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18.x or higher |
| npm | 9.x or higher |
| Git | any recent version |

### 1 — Clone & install

```bash
git clone https://github.com/<your-org>/Greenplus_Ai.git
cd Greenplus_Ai
npm install
```

### 2 — Environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and set:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

> Keys are available in the Supabase dashboard → **Project Settings → API**.  
> Never commit `.env.local` — it is in `.gitignore`.

### 3 — Start development

```bash
npm run dev
# → http://localhost:5173
```

Hot Module Replacement (HMR) is enabled. Changes to any file in `src/` reload instantly.

### 4 — Run tests

```bash
npm run test         # watch mode (re-runs on file save)
npm run test:run     # single run (CI)
npm run test:ui      # browser-based Vitest UI
npm run coverage     # single run + coverage report
```

Test files live alongside source in `src/test/` and follow the `*.test.jsx` / `*.test.js` pattern.

### 5 — Lint

```bash
npm run lint
```

ESLint is configured with `react-hooks` and `react-refresh` rules. Fix all lint errors before opening a PR.

### 6 — Build & preview

```bash
npm run build        # outputs to dist/
npm run preview      # serve dist/ locally at http://localhost:4173
```

### Deploying to Vercel

1. Push to `main` — Vercel auto-deploys on every push.
2. Add the same environment variables in **Vercel → Project → Settings → Environment Variables**.
3. Framework preset: **Vite** (auto-detected).

---

## Pilot Area

- **หลัง มช.** (CMU rear zone) — student dormitory corridor
- **ตำบลสุเทพ** (Tambon Suthep) — local scrap shops and community drop points

Target users: CMU students in dormitories, Digital Nomads / Expats (English UI), and local waste-shop operators.

---

## Project Structure

```
src/
  main.jsx          — React 19 createRoot entry
  App.jsx           — Root component / router + <Toaster />
  index.css         — Global CSS tokens (design system)
  App.css           — App-level styles
  assets/           — Static images
  lib/
    supabase.js     — Supabase client singleton
  store/
    index.js        — Redux store
    userSlice.js    — session, profile, language
    wasteSlice.js   — scan results, basket
    marketplaceSlice.js
  components/
    Button.jsx      — Primary UI button (variant: primary / secondary / ghost)
    Card.jsx        — Bordered flat-shadow card wrapper
    GradeTag.jsx    — Grade A / B / C badge
    NavBar.jsx      — Top navigation bar
    ProtectedRoute.jsx — Role-based route guard
  pages/
    LandingPage.jsx
    LoginPage.jsx
    ScanPage.jsx
    BasketPage.jsx       — basket items + shop matching + route planner
    MapPage.jsx
    MarketplacePage.jsx
    DashboardPage.jsx
    AdminPage.jsx
    SettingsPage.jsx
    ProfilePage.jsx      — role-specific profile (User / Buyer / Admin)
  hooks/
    useAuth.js      — Supabase auth listener → Redux
    useT.js         — Translation hook (returns key map, syncs i18next)
    useGPS.js       — Geolocation hook (request, lat, lng, loading)
  utils/
    haversine.js    — Haversine great-circle distance (km)
  i18n/
    index.js        — i18next initialisation
    en.js           — English strings
    th.js           — Thai strings
  test/
    setup.js        — @testing-library/jest-dom global matchers
    smoke.test.jsx  — Baseline component smoke test
HistoryVersions/    — Canonical AI-assisted implementation history
PRD.md              — Product Requirements Document
```

---

## Contributing

All code changes are tracked in `HistoryVersions/` per the [AI Working Rules](PROJECT_AI_WORKING_RULES.md). Before editing, review the relevant history files and create a new version file after completing any task.
