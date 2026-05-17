# GreenPlus Ai — Design Specification v0.4

> เอกสารนี้คือ source-of-truth สำหรับ layout และ visual ของทุกหน้า  
> อ่านก่อนสร้าง/แก้ไข JSX ใดๆ ร่วมกับ `docs/ui-components.md` และ `docs/user-flow.md`

---

## 1. Design Language

### Aesthetic: Neo-brutalist mono

| หลักการ | รายละเอียด |
|--------|-----------|
| **Border** | `1.5px solid var(--ink)` ทุก surface — ไม่มี border-radius บน desktop (mobile ยกเว้น card = 6–8px) |
| **Shadow** | `2px 2px 0 var(--ink)` — flat drop ไม่ใช่ blur |
| **Color** | ink/paper เป็นหลัก, accent green (`--green` / `--green-ink`) เฉพาะ CTA และ positive metric |
| **Charts** | hatch fill (45° diagonal lines, stroke `--green`) ไม่ใช่ solid fill |
| **Typography** | uppercase + tracking-widest สำหรับ labels; JetBrains Mono สำหรับ data/metrics |
| **Active state** | background สลับ ink/paper (dark pill) — ไม่ใช่ underline |
| **Spacing** | 4/8/12/16/20/24px grid — ใช้ gap ไม่ใช่ margin ส่วนใหญ่ |

### Font roles

| token | font | ใช้เมื่อ |
|-------|------|---------|
| `font-brand` / `--hand` | Architects Daughter | โลโก้, h1 ที่ต้องการ personality |
| `font-body` / `--label` | Caveat, Sarabun | body text, button label, ชื่อ material |
| `font-data` / `--mono` | JetBrains Mono, IBM Plex Sans Thai | label uppercase, เลข, badge, metadata |

### Logo anatomy

```
 ┌──────────────┐
 │  G+  mark    │  ← green square, rounded corner = size × 0.25, ink border
 └──────────────┘
 GreenPlus Ai       ← wordmark: Green (ink) + Plus (green-ink) + Ai superscript (mono, 0.26× size)
```

- Mark minimum size: 24px
- Clearspace: ¼ mark height on all sides
- Dark bg → use inverse variant (paper color instead of ink)

---

## 2. Navigation Anatomy

### User shell — UserLayout (mobile-first)

```
┌─────────────────────────────────────────┐
│  TopBar  sticky  z-40                   │
│  [G+ logo]  [EN/TH]  [🛒 badge]        │  ← h: 56px, border-bottom 1.5px ink
├─────────────────────────────────────────┤
│                                         │
│              <Outlet />                 │  ← flex-1, pb-[68px]
│                                         │
├─────────────────────────────────────────┤
│  BottomTabBar  fixed  z-40              │
│  [Home][Scan][Basket🔴][Map][Profile]   │  ← h: 68px, border-top 1.5px ink
└─────────────────────────────────────────┘
```

- Active tab: `text-[--green]` + `bg-[--green-soft]` pill
- Basket badge: activeCount circle (green bg, paper text, 14px, rounded-full)
- Scan tab: center position, slightly elevated feel

### Buyer shell — BuyerLayout (desktop sidebar)

```
┌──────────┬──────────────────────────────┐
│ Sidebar  │  Topbar                      │
│ 200px    │  [logo + breadcrumb + user]  │
│ fixed    ├──────────────────────────────┤
│ left     │                              │
│ [logo]   │      <Outlet />              │
│ BUYER    │                              │
│ Dashboard│                              │
│ Mktplace │                              │
│ Pricing  │                              │
│ Profile  │                              │
│ ──────── │                              │
│ Settings │                              │
│ Sign out │                              │
│ [avatar] │                              │
└──────────┴──────────────────────────────┘
```

- Mobile: TopBar + horizontal scrollable nav strip (uppercase labels, ink border right)
- Active sidebar link: `border-l-[3px] border-[--green]` + `bg-[--ink] text-[--paper]`

### Admin shell — default NavBar

- Desktop top nav, standard ink/paper
- โลโก้ left, links right: Admin | Profile | Settings | Sign out | EN/TH toggle

---

## 3. Pages — Full Spec

---

### 3.0 LandingPage `/`

**Layout:** centered column, max-w-5xl, py-16

```
┌────────────────────────────────────────────────┐
│  GreenPlus.Ai   (font-brand 34px)              │
│  tagline text (font-body 18px, ink-2)          │
│                                                │
│  ┌──────────────┐  ┌──────────────┐           │
│  │  U            │  │  B            │          │
│  │  ผู้ขาย / User  │  │  ร้านรับซื้อ  │         │
│  │  desc        │  │  desc        │           │
│  │  [Sign In ▶] │  │  [Sign In ▶] │           │
│  └──────────────┘  └──────────────┘           │
└────────────────────────────────────────────────┘
```

- Role cards: `<Card>` with cursor-pointer + hover lift (shadow 3px 3px)
- Card marker: small mono label 'U' / 'B' (ink-3)
- Admin card: ไม่แสดง — เข้าผ่าน `/x/admin` เท่านั้น
- Auto-redirect: ถ้า session มีอยู่แล้ว → `ROLE_DEST[role]`
- **หายไปจาก wireframe**: stats bar (total recycled / total shops) ควรเพิ่ม

---

### 3.1 LoginPage `/login?role=user|buyer`

**Layout:** centered card, max-w-sm

```
┌─────────────────────────────┐
│  [G+ logo + wordmark]       │
│  "Sign In" (h1)             │
│                             │
│  [Email input]              │
│  [Password input]           │
│  [Sign In ▶]  (primary)     │
│                             │
│  ── or ──                   │
│  [Sign in with Google]      │
│  [Sign in with LINE]        │
│                             │
│  No account? Sign Up        │
└─────────────────────────────┘
```

- Role badge แสดงที่ top: "USER" / "BUYER" chip mono
- Error state: orange border + message below input
- Email not confirmed: orange warning card + resend button
- Buyer login: same layout แต่ไม่มี LINE button

---

### 3.2 AdminLoginPage `/x/admin`

**Layout:** centered card, max-w-xs, dark tinted bg (#062040)

```
┌──────────────────────────┐
│  [G+ mark]  ADMIN ONLY  │
│  Hidden route notice     │
│                          │
│  [Email input]           │
│  [Password input]        │
│  [Sign In ▶]             │
└──────────────────────────┘
```

- ไม่มี Google / LINE buttons
- Auto sign-out ถ้า role ≠ admin
- Future: 2FA PIN input (6-digit)

---

### 3.3 HomePage `/home` _(user)_

**Layout:** single column, px-4 py-6, gap-6

```
┌──────────────────────────────────────────┐
│  MORNING, ANAN  (mono)                   │
│  Good haul this week — 12.4 kg  (h1)    │
│                                          │
│  ┌──────────┐  ┌──────────────────────┐ │
│  │ earnings │  │ impact pts           │ │
│  │ ฿286 thb │  │ 2,480 pts            │ │
│  │ ▲ ฿42 wk │  │ ████████░░ Gold tier │ │
│  └──────────┘  └──────────────────────┘ │
│                                          │
│  ┌──────────────────────────────────────┐│
│  │ Weekly impact  [7d]                  ││
│  │  ▓ ▓ ▓ ▓ ▓ ▓ ▓  (hatch bar chart)   ││
│  └──────────────────────────────────────┘│
│                                          │
│  Recent scans                 view all → │
│  ┌──────────────────────────────────────┐│
│  │ PET bottle · 0.8kg   [A]  ฿16  2m   ││
│  │ Paper · 1.4kg        [B]  ฿11  1h   ││
│  │ Aluminium · 0.3kg    [A]  ฿42  yest.││
│  └──────────────────────────────────────┘│
│                                          │
│  ┌─────────────────────────────────────┐ │
│  │ !  3 buyers near you                │ │
│  │    Best deal · ฿26/kg PET · 1.2 km →│ │
│  └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

**Zones:**
1. Greeting + weekly weight KPI
2. 2-col stats: earnings + impact pts with progress bar
3. Bar chart (weekly, hatch fill) in Card
4. Recent scans list (max 3, from `waste.lastScan` + Supabase scan_history)
5. Buyer alert banner (green-soft bg, green-ink border) — from marketplace.posts nearest

**State read:** `user.profile.displayName`, `waste.basket`, `waste.lastScan`  
**Missing in code:** greeting name, weekly chart, buyer alert banner — ต้องเพิ่ม

---

### 3.4 ScanPage `/scan` _(user)_

**Layout:** single column, px-4 py-10, gap-6

```
┌─────────────────────────────────────────┐
│  ← back          camera 1 · flash auto  │  ← mini topbar
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ┌─                             ─┐ │  │
│  │  stage 1 of 2  [● live · 30fps]   │  │
│  │  ┌─────────┐                     │  │
│  │  │ PET·98% │  (bounding box)      │  │
│  │  └─────────┘                     │  │
│  │  ↕ 24cm · ⌀ 6.5cm · 0.82kg       │  │
│  │ └─                             ─┘ │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌─── Bottom sheet (after detect) ───┐  │
│  │  Plastic bottle (PET)   [Grade A] │  │
│  │                                   │  │
│  │  contamination          12% · low │  │
│  │  ████░░░░░░░░░░░░░░░░░░░          │  │
│  │                                   │  │
│  │  0.82 kg × ฿24/kg × 1.00 = ฿22.10│  │
│  │  +18 impact pts                    │  │
│  │                                   │  │
│  │  [↺ retake]  [✓ Add to basket (4)]│  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Phases:**
- `idle`: corner brackets (green), "Tap to scan" placeholder, Start Camera button
- `analyzing`: scanning animation + "ANALYZING..." overlay + stage indicator chip
- `result`: bottom sheet slides up with details
- `troll`: orange warning banner
- `error`: camera denied message

**Missing in code vs wireframe:**
- Stage indicator chip ("stage 1 of 2")
- Bounding box overlay with label
- Size measurements display
- Contamination % + progress bar (maps to `score`)
- Impact pts earned display
- Basket count in button label

---

### 3.5 BasketPage `/basket` _(user)_

**Layout:** single column, px-4 py-6, gap-4

```
┌──────────────────────────────────────────┐
│  BASKET · 3 of 4 active  (mono)          │
│  ฿ 69  estimated  (h1, green-ink accent) │
│                                          │
│  ┌──────────────────────────────────────┐│
│  │ [□] PET bottle  0.8kg  [A]  ฿16     ││  ← active
│  │ [□] Cardboard   1.4kg  [B]  ฿11     ││
│  │ [□] Aluminium   0.3kg  [A]  ฿42     ││
│  │ [□] Mixed paper 0.6kg  [C]  ฿3  ──  ││  ← skipped (strikethrough, opacity 0.4)
│  └──────────────────────────────────────┘│
│                                          │
│  ──── ROUTE ────────────────────────────  │
│                                          │
│  Pickup options              GPS · 0.0km │
│  ┌──────────────────────────────────────┐│
│  │ Single shop                          ││
│  │ Lung Somchai · 1.2 km · ฿65 total →  ││
│  └──────────────────────────────────────┘│
│  ┌──────────────────────────────────────┐│
│  │ ★ Multi-stop · best  (green border)  ││
│  │ 3 shops · 4.1 km loop · ฿78 total → ││
│  └──────────────────────────────────────┘│
│                                          │
│  [   Book pickup · ฿ 78 →   ] (primary) │
│  [        Clear basket       ] (ghost)   │
└──────────────────────────────────────────┘
```

**Items:** skip toggle (strikethrough + opacity), remove button (trash icon)  
**Route:** Single shop vs Multi-stop dengan highlight best option  
**Missing in code:** better skip UI

---

### 3.6 MapPage `/map` _(user)_

**Layout:** full-height, no padding — map fills top 60%, list below

```
┌──────────────────────────────────────────┐
│  NEARBY · 5 km radius  (mono)            │
│  Recyclers near you   [list ▾]           │
├──────────────────────────────────────────┤
│                                          │
│   ☞     Lung Somchai                    │  ← Leaflet map, OSM tiles
│       [me]           JJ Market          │  ← 5km dashed circle
│                  Nimman                  │
│                                          │
├──────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐│
│  │ ♻ Lung Somchai          1.2km [open] ││
│  │   accepts: PET, paper               ││
│  │   [Directions ↗]  [Book pickup]     ││
│  └──────────────────────────────────────┘│
│  ┌──────────────────────────────────────┐│
│  │ ♻ JJ Market #12         2.4km [open] ││
│  │ ...                                  ││
└──────────────────────────────────────────┘
```

**Missing in code:** shop open/closed status, "Book pickup" button from map, 5km radius circle

---

### 3.7 MarketplacePage `/marketplace` _(user + buyer)_

**Layout:** single column, px-4 py-6

```
┌─────────────────────────────────────────┐
│  CHIANG MAI · TODAY  (mono)             │
│  Marketplace  (h1)                      │
│                                         │
│  [All] [Grade A] [Grade B] [Grade C]    │  ← filter tabs
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ [A] Aluminium cans  50kg  ฿48/kg    ││
│  │ เฮียอ้วน · 1.2km  [Contact]         ││
│  └─────────────────────────────────────┘│
│  ... (more listings)                    │
│                                         │
│  [+ Post Ad]  (primary, sticky bottom)  │
└─────────────────────────────────────────┘
```

**Post Ad modal:**
```
┌─────────────────────────────┐
│  Post a listing             │
│  Material: [select ▾]       │
│  Grade: [A] [B] [C]         │
│  Weight (kg): [____]        │
│  Price (฿/kg): [____]       │
│  Shop name: [____]          │
│  Contact: [____]            │
│  Suggested: ฿XX/kg (hint)   │
│  [Cancel]  [Post Ad ▶]      │
└─────────────────────────────┘
```

---

### 3.8 EcoPointsPage `/eco-points` _(user)_

**Layout:** single column, px-4 py-6, gap-6

```
┌─────────────────────────────────────────┐
│  ECO POINTS  (mono)                     │
│  2,480 · Gold tier  (h1, green-ink)     │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ NEXT TIER · PLATINUM    520 pts to  ││
│  │ ████████████████░░░░░░░  go         ││
│  │ Hit 3,000 pts for ×1.1 multiplier   ││
│  └─────────────────────────────────────┘│
│                                         │
│  History                                │
│  ┌─────────────────────────────────────┐│
│  │  Scan · PET 0.8kg         +18 pts   ││
│  │  2m ago                             ││
│  │  Booking confirmed        +25 pts   ││
│  │  1h ago                             ││
│  │  Multi-stop bonus         +40 pts   ││
│  │  Daily streak · 7 days    +50 pts   ││
│  └─────────────────────────────────────┘│
│                                         │
│  [How points work →]  (secondary)       │
└─────────────────────────────────────────┘
```

**Tier system:**
| Tier | Points | Multiplier |
|------|--------|-----------|
| Bronze | 0–999 | ×1.0 |
| Silver | 1,000–1,999 | ×1.05 |
| Gold | 2,000–2,999 | ×1.1 |
| Platinum | 3,000+ | ×1.15 |

---

### 3.9 ProfilePage `/profile` _(all roles)_

**Layout:** single column, px-4 py-6, gap-6

```
┌─────────────────────────────────────────┐
│  ┌────┐  Anan W.                        │
│  │ A  │  user · Chiang Mai · ID 8421   │
│  └────┘  [verified ✓ · since Apr 2026]  │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Lifetime impact                     ││
│  │  248 kg   ฿ 4.2k                    ││
│  │  recycled  earned                  ││
│  └─────────────────────────────────────┘│
│                                         │
│  Scan history                           │
│  ┌─────────────────────────────────────┐│
│  │ PET bottle · 0.8kg   [A]  2m ago   ││
│  │ Paper · 1.4kg        [B]  1h ago   ││
│  │ Aluminium · 0.3kg    [A]  yest.    ││
│  │ HDPE · 0.5kg         [B]  2 days   ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Eco-points  2,480 pts · Gold  →     ││
│  │ Settings    language · dark mode  → ││
│  │ Help & FAQ  support@greenplus.ai  → ││
│  │ Sign out                          → ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

**Buyer variant:** shows `shopInfo`, `acceptedMaterials`, `pricingTable summary`  
**Admin variant:** shows "Platform Admin" badge, pending actions count

---

### 3.10 SettingsPage `/settings` _(all roles)_

**Layout:** single column, px-4 py-6, gap-4, sections with SectionDivider

```
┌─────────────────────────────────────────┐
│  SETTINGS  (mono)                       │
│  Preferences  (h1)                      │
│                                         │
│  ── APPEARANCE ────────────────────────  │
│  ┌─────────────────────────────────────┐│
│  │ Dark mode     match sys / on / off  ││  ← animated toggle pill
│  │ Language      ไทย · EN              ││
│  │ Units         metric · kg / km      ││
│  └─────────────────────────────────────┘│
│                                         │
│  ── NOTIFICATIONS ──────────────────────│
│  ┌─────────────────────────────────────┐│
│  │ Price alerts      2 active      →   ││
│  │ Pickup reminders  on · 30min    →   ││
│  │ Marketing         off           →   ││
│  └─────────────────────────────────────┘│
│                                         │
│  ── ACCOUNT ────────────────────────────│
│  ┌─────────────────────────────────────┐│
│  │ Linked accounts   Google · LINE  →  ││
│  │ Export my data                   →  ││
│  │ Delete account    permanent      →  ││
│  └─────────────────────────────────────┘│
│                                         │
│  v0.4.2 · build 428  (mono, centered)  │
└─────────────────────────────────────────┘
```

---

### 3.11 DashboardPage `/dashboard` _(buyer)_

**Layout:** desktop sidebar shell (BuyerLayout)

```
┌─────────────────────────────────────────────────────┐
│  HOME / DASHBOARD  (crumbs)                         │
│  Somchai Scrap — today's haul  (h1)  [today ▾][↓]  │
├─────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────────┐ ┌──────────┐ │
│  │pending │ │accepted│ │completed 7d│ │revenue 7d│ │
│  │   2    │ │   1    │ │    14  ▲   │ │฿4,820  ▲ │ │
│  └────────┘ └────────┘ └────────────┘ └──────────┘ │
├─────────────────────────────────────────────────────┤
│  [Bookings]  [Pricing]        ● 2 new requests      │
├─────────────────────────────────────────────────────┤
│  Bookings tab:                                       │
│  ┌──────────────────────────────────────────────────┐│
│  │  [A] Anan W.  PET, Paper, Al  2.5kg  ฿78        ││
│  │       14:00–15:00 today  ● pending               ││
│  │       [Accept ▶]  [Reject]                       ││
│  │  ─────────────────────────────────────────────  ││
│  │  [A] Café Linh  Cardboard  18kg  ฿92  ● pending  ││
│  │  ...                                             ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  Pricing tab:                                        │
│  Material     │ Grade A │ Grade B │ Grade C │ Cap   │
│  PET (clear)  │  ฿24.00 │  ฿18.00 │  ฿10.00 │ 200kg │
│  ...          │                                     │
└─────────────────────────────────────────────────────┘
```

**Status chips:**
- `pending` → ink border chip
- `accepted` → green chip
- `completed` → soft/muted chip
- `rejected` → red-tinted chip

---

### 3.12 AdminPage `/admin` _(admin)_

**Layout:** desktop full-width, max-w-4xl

**Tab: Shops**
```
Pending Approval (N)
┌──────────────────────────────────┐
│ ร้านชื่อ    เจ้าของ · พื้นที่      │
│              [Approve] [Reject]  │
└──────────────────────────────────┘

Active Shops
┌───────────────────────────┐
│ ร้านชื่อ   พื้นที่          │
│                  342 scans │
└───────────────────────────┘
```

**Tab: Heatmap**
```
Scan Density by District — Chiang Mai
┌──── 10×10 grid ─────────────────┐
│ color: paper-2 / green-soft / orange │
│ value inside each cell          │
│ legend: Low ░ ▒ █ High          │
└─────────────────────────────────┘
```

**Tab: AI Config**
```
[Model select ▾]
[API Key ****]
[System Prompt textarea]
[Confidence threshold slider 0.5–0.95]
[Save Config ▶]

Second Brain — Test
[Describe a waste item...] [Analyze]
→ result: material, grade, confidence, source, explanation
```

**Tab: AI Studio** _(C-07)_
```
Active Version: v0-mock
Upload ≥3 images per class, then train and deploy.

Training Classes (2×4 grid):
┌─────────────┐ ┌─────────────┐
│ PET Bottle  │ │ Aluminium   │
│ 5 images ✓  │ │ No images   │
│ [Add Images]│ │ [Add Images]│
└─────────────┘ └─────────────┘
... (8 classes total)

[Training bar when training]

[Train Model]  [Deploy]
```

**Tab: Moderation**
```
Moderation (N posts)
┌──────────────────────────────────────┐
│ [A] Aluminium  50kg  ฿48/kg  [flagged]│
│ เฮียอ้วน                              │
│ [Unflag]  [Remove]                   │
└──────────────────────────────────────┘
```

---

## 4. Shared Micro-patterns

### SectionDivider
```jsx
<div className="flex items-center gap-3 my-2">
  <span className="font-data text-[10px] text-[var(--ink-3)] uppercase tracking-widest whitespace-nowrap">
    {label}
  </span>
  <div className="flex-1 h-[1px] bg-[var(--ink-4)]" />
</div>
```

### KPI Card
```jsx
<div className="flex flex-col gap-1 p-4 border-[1.5px] border-[var(--ink)]">
  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">{label}</span>
  <div className="font-brand text-[32px] text-[var(--ink)] leading-none">{value}</div>
  {trend && <span className={`font-data text-[12px] ${trend.dir === 'up' ? 'text-[var(--green-ink)]' : 'text-[var(--orange)]'}`}>
    {trend.dir === 'up' ? '▲' : '▼'} {trend.value}
  </span>}
  {sub && <span className="font-data text-[11px] text-[var(--ink-3)]">{sub}</span>}
</div>
```

### Timeline item (EcoPoints history)
```jsx
<div className="flex justify-between py-2.5 border-b-[1px] border-[var(--ink-4)] last:border-0">
  <div>
    <div className="font-body text-[15px] text-[var(--ink)]">{label}</div>
    <div className="font-data text-[10px] text-[var(--ink-3)]">{time}</div>
  </div>
  <span className="font-data text-[14px] text-[var(--green-ink)] font-bold">{points}</span>
</div>
```

### Booking row (Dashboard)
```jsx
// Avatar initial + name + items + kg + pickup time + value + status chip + action buttons
// Status color: pending=ink, accepted=green, completed=paper-2/muted, rejected=orange-soft
```

### Progress bar
```jsx
<div className="w-full h-2 bg-[var(--paper-2)] border-[1.5px] border-[var(--ink)]">
  <div style={{ width: `${pct}%` }} className="h-full bg-[var(--green)] transition-all" />
</div>
```

### Toggle pill (Settings dark mode)
```jsx
// 40×22px pill, green bg when on, paper bg when off
// white circle dot slides left/right
// 1.5px green-ink border when on, ink-4 border when off
```

### Bar chart (hatch)
```jsx
// SVG with <defs><pattern id="hatch" ...> diagonal lines stroke green </pattern></defs>
// <rect fill="url(#hatch)" stroke="--green-ink" strokeWidth="1.5" />
// baseline <line> at bottom, stroke ink opacity 0.3
```

---

## 5. หน้าที่ยังขาด / ต้องเพิ่ม

| หน้า | สิ่งที่ขาด |
|------|-----------|
| **HomePage** | greeting name, weekly bar chart, buyer alert banner |
| **ScanPage** | stage indicator chip, bounding box overlay, contamination bar, impact pts |
| **ProfilePage** | lifetime stats grid (248 kg / ฿4.2k), avatar initial |
| **SettingsPage** | section dividers, notification rows, app version footer |
| **EcoPointsPage** | tier system display, timeline component, progress bar |
| **MapPage** | 5km radius circle, open/closed status, "Book pickup" from list |
| **LandingPage** | stats bar (total recycled / shops platform-wide) |
| **DashboardPage** | KPI cards (KpiCard pattern), status chips per booking |
| **All pages** | SectionDivider component, KpiCard component, Avatar component, ProgressBar component |

---

## 6. สิ่งที่ยังไม่มีใน wireframe (ต้องออกแบบเอง)

- **Notification drawer** — slide-in panel (price alerts, booking updates)
- **Onboarding flow** — first scan tutorial overlay
- **Empty states** — ทุก list page เมื่อไม่มีข้อมูล (empty basket, no scans, no bookings)
- **Error pages** — 404, network error
- **Loading skeletons** — แทน null/spinner ระหว่าง fetch
