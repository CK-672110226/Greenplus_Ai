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

- **2-Stage AI Scanner** — Stage 1 detects object type (PET bottle, aluminium can, cardboard…); Stage 2 scores cleanliness and assigns Grade A / B / C for fair pricing
- **Edge AI Processing** — All image analysis runs in the browser; no user photos are uploaded to any server (Privacy First)
- **Real-time Valuation** — Formula-based pricing engine using Chiang Mai market reference rates (May 2026)
- **Smart Map** — Pulsing map pins show shops that accept the material currently in hand
- **Marketplace** — High-density list view for buying / selling recyclables with grade filtering
- **Eco-Points (Impact Points)** — Gamification layer rewarding verified recycling activity
- **Anti-Troll System** — Detects humans / living things in the scanner and responds with a playful message
- **Dark Mode** — Full token-based dark-mode support

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
| State | Redux Toolkit (`wasteSlice`, `marketplaceSlice`, `userSlice`) |
| Styling | Tailwind CSS + CSS custom properties (design tokens) |
| Backend / DB | Supabase (Postgres) |
| AI | Edge AI — browser-side inference (YOLO-based detection) |
| Environment | `.env.local` — API keys never committed |

---

## Database Schema

| Table | Key Columns |
|-------|-------------|
| `waste_items` | `id`, `name`, `unit`, `base_weight`, `price_grade_a/b/c` |
| `marketplace_posts` | `id`, `user_id`, `title`, `material_type`, `status` |
| `user_profiles` | `id`, `role`, `language_pref`, `eco_points` |
| `scan_history` | `id`, `user_id`, `item_type`, `grade`, `calculated_value` |

---

## Pricing Reference — Chiang Mai Market (May 2026)

| Material | Grade A | Grade B (×0.75) | Grade C (×0.40) |
|----------|---------|-----------------|-----------------|
| Aluminium cans | ฿62/kg | ฿46.5/kg | not accepted |
| PET bottle (clear) | ฿8–10/kg | ฿6–7.5/kg | ฿3.2–4/kg |
| Copper (clean) | ฿380–385/kg | — | — |
| Used cooking oil | ฿20/kg | — | — |
| Cardboard | ฿4.50/kg | — | — |

*Sources: วงษ์พาณิชย์, Recycle Station ตลาดจริงใจ, ปั๊มบางจาก (ทอดไม่ทิ้ง)*

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint
```

Copy `.env.local.example` → `.env.local` and fill in your Supabase credentials before running.

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
  App.jsx           — Root component / router
  index.css         — Global CSS tokens (design system)
  App.css           — App-level styles
  assets/           — Static images
  lib/              — Supabase client + utilities
  store/            — Redux Toolkit slices (wasteSlice, marketplaceSlice, userSlice)
  components/       — Shared UI components
  pages/            — Route-level page components
HistoryVersions/    — Canonical AI-assisted implementation history
PRD.md              — Product Requirements Document
```

---

## Contributing

All code changes are tracked in `HistoryVersions/` per the [AI Working Rules](PROJECT_AI_WORKING_RULES.md). Before editing, review the relevant history files and create a new version file after completing any task.
