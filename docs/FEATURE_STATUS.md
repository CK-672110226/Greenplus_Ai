# GreenPlus AI — Feature Status & Implementation Map

> Single source of truth for current implementation state across all pages.
> Used by AI agents to scope tasks without re-reading every file.
> Last updated: 15 May 2026

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully implemented — real data, real API |
| ⚠️ | Partial — core works, some features stubbed |
| 🔴 | UI only — no backend integration |
| ❌ | Missing — not built |

---

## 1. Redux Store — Slice Shapes

### `user`
```
session: null | SupabaseSession
profile: null | { id, role:'user'|'buyer'|'admin', display_name, language_pref }
language: 'en' | 'th'
loading: boolean
darkMode: boolean  ← persisted gp_dark
```
Actions: `setSession`, `setProfile`, `setLanguage`, `clearUser`, `setDarkMode`, `toggleDarkMode`

### `waste`
```
basket: BasketItem[]
  BasketItem: { id, materialType, clean, weight, grade, confidence, source, factorScores, score, skipped, scannedAt }
lastScan: null | ScanResult
```
Actions: `addToBasket`, `removeFromBasket`, `clearBasket`, `setLastScan`, `updateWeight`, `toggleSkip`

### `bookings`
```
bookings: Booking[]
  Booking: { id, shopId, shopName, seller, materials:[materialType], totalKg, estValue, status:'pending'|'accepted'|'rejected'|'completed', createdAt }
```
Actions: `addBooking`, `updateStatus`, `setBookings`

### `marketplace`
```
posts: Post[]
  Post: { id, materialType, clean, qty, pricePerKg, shop, contact, lat, lng, flagged }
```
Actions: `addPost`, `removePost`, `flagPost`, `setPosts`

### `aiConfig`
```
model: 'mock' | 'vertex' | 'onnx' | ...
yoloStage1Url: ''        ← /model_ai/yolo_stage1.onnx (local)
yoloClassLabels: []
tmStage1Url: ''          ← /model_ai/tm-my-image-model/model.json (local)
stage1ClassLabels: []
tmStage2Urls: {}         ← { materialType: '/model_ai/.../model.json' }
onnxStage1Url / onnxStage2Url: ''
vertexProjectId / vertexLocation / vertexAccessToken / vertexStage1Endpoint / vertexStage2Endpoint: ''
confidenceThreshold: 0.6
modelVersion: 'v0-mock'
```
Persisted: `gp_ai_config` in localStorage

### `buyer`
```
openDays: [1,2,3,4,5,6]        ← 0=Sun..6=Sat
acceptedMaterials: [all 8]
```
Persisted: `buyer_settings` in localStorage

### `schedule`
```
slots: Slot[]
  Slot: { id, time:'HH:MM', seller, materials:[], totalKg, estValue, status }
```
Actions: `setSlots`, `addSlot`, `updateSlot`, `removeSlot`, `confirmSlot`, `cancelSlot`, `completeSlot`

### `notifications`
```
items: Notification[]
  Notification: { id, type:'new_order'|'price_alert'|'order_completed'|'flagged_item'|'system', title, body, read, createdAt }
```
Actions: `markRead`, `markAllRead`, `dismiss`, `addNotification`
Selector: `selectUnreadCount`

### `pricing`
```
prices: { [materialKey]: { A: number, B: number, C: number } }
savedAt: null | ISO string
```
Persisted: `gp_pricing` in localStorage
Default: pet_bottle_clear A:8 B:5.6 C:4, aluminum_can A:40 B:28 C:20, ...

### `customLabels`
```
{ [materialKey]: { th: string, en: string } }
```
Persisted: `gp_custom_labels` in localStorage

---

## 2. Waste Items Data (src/data/wasteItems.js)

```
WASTE_ITEMS keys → YOLO/TM class mapping:
  pet_bottle_clear  → ขวดน้ำ / ขวดพลาสติก PET ใส   basePrice: 8
  aluminum_can      → อลูมิเนียม / กระป๋อง           basePrice: 40
  cardboard         → กระดาษลัง / กล่องกระดาษ         basePrice: 3
  newspaper         → หนังสือ / หนังสือพิมพ์           basePrice: 2
  mixed_plastic     → พลาสติก / พลาสติกรวม            basePrice: 5
  copper            → เหล็ก / ทองแดง                  basePrice: 200
  glass             → ขวดแก้ว / แก้ว                  basePrice: 1
  cooking_oil       → น้ำมันเก่า / น้ำมันพืชใช้แล้ว   basePrice: 12
```

YOLO model (yolo_stage1.onnx) classes (by index):
```
0 ไม่ใช่ขยะ  (BIODEGRADABLE)
1 กระดาษลัง  (CARDBOARD)
2 ขวดแก้ว    (GLASS)
3 เหล็ก       (METAL)
4 กระดาษ     (PAPER)
5 พลาสติก    (PLASTIC)
```

TM local stage-1 model (11 classes):
```
ขวดน้ำ, เหล็ก, กระดาษ, กระดาษลัง, พลาสติก, ขวดแก้ว, น้ำมันเก่า, หนังสือ, อลูมิเนียม, เครื่องใช้ไฟฟ้าเสีย, ไม่ใช่ขยะ
```

---

## 3. Supabase Tables — Access Map

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `shops` | MapPage, BasketPage, MarketplacePage, AdminPage, LandingPage | — | AdminPage (approve/reject) | — |
| `bookings` | DashboardPage, SchedulePage | BasketPage | DashboardPage, SchedulePage | — |
| `user_profiles` | LoginPage (auth listener) | LoginPage (sign-up) | ProfilePage (buyer save) | — |
| `scan_history` | ProfilePage (useScanHistory) | ScanPage (useScanInsert) | — | — |
| `user_reports` | AdminPage (useUserReports) | ScanPage (report misid) | AdminPage (approve/reject) | — |
| `marketplace_posts` | MarketplacePage | MarketplacePage | — | AdminPage |
| `model_registry` | AdminPage (useModelRegistry) | AdminPage | AdminPage (activate) | — |
| `shop_pricing` | MarketplacePage, BasketPage | — | PricingPage (buyer) | — |
| `eco_point_ledger` | ❌ EcoPointsPage (not yet) | ❌ (not yet) | — | — |

---

## 4. Page-by-Page Status

### `/` — LandingPage ⚠️
| Item | Status |
|------|--------|
| Role selector (user/buyer) | ✅ |
| Particle background | ✅ |
| Active buyer count (real Supabase) | ✅ |
| Auto-redirect if authenticated | ✅ |
| Global stats (kg recycled, paid out) | 🔴 hardcoded "—" |

**Redux:** reads `user.session`, `user.profile`, `user.language`
**Supabase:** SELECT shops count

**Gap:** aggregate stats from scan_history + bookings not built

---

### `/login` — LoginPage ✅
| Item | Status |
|------|--------|
| Email/password sign-in + sign-up | ✅ |
| Google OAuth | ✅ |
| Email verification resend | ✅ |
| Role badge display | ✅ |
| Forgot password | 🔴 no handler |
| Remember me | 🔴 UI only |

**Redux:** reads `user.session`, `user.profile`
**Supabase:** `auth.signUp`, `auth.signInWithPassword`, `auth.signInWithOAuth`, `auth.resend`

---

### `/home` — HomePage ⚠️
| Item | Status |
|------|--------|
| Weekly hatch bar chart (basket data) | ✅ |
| KPI cards (kg, ฿, pending payout) | ✅ |
| Recent scans list | ✅ |
| Nearby shops | ✅ |
| "Last refresh Xm" | 🔴 hardcoded |
| Pending payout = 63% × total | 🔴 hardcoded formula |

**Redux:** reads `user.language`, `user.profile`, `waste.basket`, `waste.lastScan`
**Supabase:** shops (useShops)

---

### `/scan` — ScanPage ⚠️
| Item | Status |
|------|--------|
| Camera (getUserMedia) | ✅ |
| Upload fallback (desktop) | ✅ |
| YOLO → TM → ONNX → Vertex pipeline | ✅ |
| Batch queue (accumulate before basket) | ✅ |
| Dirty/clean alert modal | ✅ |
| Result swipe card (← discard / → accept) | ✅ |
| Add to basket + insertScan | ✅ |
| Report misidentification | ✅ |
| Flash / camera select buttons | 🔴 disabled |
| AI not-ready banner | ✅ |

**Redux:** reads `aiConfig`, `waste.basket`; writes `addToBasket`, `setLastScan`
**Supabase:** INSERT scan_history (useScanInsert), INSERT user_reports

**Gap:** flash + multi-camera selection not implemented

---

### `/basket` — BasketPage ✅
| Item | Status |
|------|--------|
| Item list with weight editor | ✅ |
| Skip/unskip toggle | ✅ |
| Manual add item | ✅ |
| Route planner (single/multi-stop TSP) | ✅ |
| GPS + haversine distance | ✅ |
| Booking modal → addBooking | ✅ |
| Market price comparison | ✅ |
| Clear basket | ✅ |

**Redux:** reads `waste.basket`; writes `removeFromBasket`, `updateWeight`, `toggleSkip`, `clearBasket`, `addBooking`
**Supabase:** shops (useShops), INSERT bookings

---

### `/map` — MapPage ✅
| Item | Status |
|------|--------|
| Leaflet map + CARTO tiles | ✅ |
| Dark mode toggle | ✅ |
| Shop markers (green=basket match, gray=no) | ✅ |
| GPS user marker | ✅ |
| Material filter sidebar/chips | ✅ |
| Shop popup (hours, distance, Google Maps) | ✅ |
| Open/closed status (UTC+7) | ✅ |

**Redux:** reads `user.darkMode`, `waste.basket`
**Supabase:** shops (useShops)

---

### `/marketplace` — MarketplacePage ⚠️
| Item | Status |
|------|--------|
| Pricing table (real shop_pricing) | ✅ |
| Category filter tabs | ✅ |
| Active shops sidebar | ✅ |
| Post ad form | ✅ |
| Post location tag | ✅ |
| Export CSV | 🔴 toast "coming soon" |
| Price alerts | 🔴 toast "coming soon" |

**Redux:** reads `waste.basket`; writes `addPost`, `setPosts`
**Supabase:** SELECT marketplace_posts, SELECT shops, INSERT marketplace_posts

---

### `/eco-points` — 🗑️ DELETED

---

### `/profile` — ProfilePage ⚠️
| Item | Status |
|------|--------|
| User: scan history table | ✅ |
| User: lifetime stats (kg, ฿) | ✅ |
| Buyer: accepted materials toggle + save | ✅ |
| Admin: stats (shops to approve, flagged) | 🔴 hardcoded 0 |

**Redux:** reads `user.session`, `user.profile`
**Supabase:** SELECT scan_history (useScanHistory), UPDATE user_profiles (buyer)

---

### `/settings` — SettingsPage ⚠️
| Item | Status |
|------|--------|
| Language toggle (EN/TH) | ✅ |
| Dark mode toggle | ✅ |
| Notification prefs (price/pickup/promo) | 🔴 no persist |
| Export data | 🔴 no handler |
| Delete account | 🔴 no handler |

**Redux:** reads/writes `user.language`, `user.darkMode`
**Supabase:** ❌ none

---

### `/notifications` — NotificationsPage 🔴
| Item | Status |
|------|--------|
| Notification list + date grouping | ✅ UI |
| Mark read / dismiss | ✅ (Redux only) |
| Unread count badge | ✅ (Redux only) |
| Backend notification push | ❌ not built |

**Redux:** reads/writes `notifications.items`
**Supabase:** ❌ no integration — needs Supabase Realtime or webhook

---

### `/dashboard` — DashboardPage ⚠️
| Item | Status |
|------|--------|
| Orders tab (accept/reject bookings) | ✅ |
| Calendar tab (open days) | ✅ local only |
| Materials tab (accepted materials) | 🔴 Redux/localStorage only |
| Revenue KPI (totalKg × 10) | 🔴 hardcoded formula |
| Shop settings → Supabase | ❌ not persisted |

**Redux:** reads `buyer.openDays`, `buyer.acceptedMaterials`; writes `setBookings`
**Supabase:** SELECT/UPDATE bookings (useSupabaseBookings)

**Gap:** buyer open days + accepted materials need to persist to `user_profiles` or `shops` table

---

### `/schedule` — SchedulePage ✅
| Item | Status |
|------|--------|
| Time-grouped slots | ✅ |
| Confirm / Complete / Cancel booking | ✅ |
| Real-time sync with Supabase bookings | ✅ |

**Redux:** reads/writes `schedule.slots`
**Supabase:** SELECT/UPDATE bookings (useSupabaseBookings)

---

### `/pricing` — PricingPage ⚠️
| Item | Status |
|------|--------|
| Pricing grid (material × grade A/B/C) | ✅ |
| Market rate comparison | ✅ |
| Save / Reset | ✅ local only |
| Persist to Supabase shop_pricing | ❌ not built |

**Redux:** reads/writes `pricing.prices`
**Supabase:** ❌ SELECT shop_pricing (read-only), no INSERT/UPDATE path from UI

---

### `/admin` — AdminPage ⚠️
| Item | Status |
|------|--------|
| Shops tab: pending list, approve/reject | ⚠️ UI + toast, no Supabase |
| Heatmap tab | 🔴 placeholder |
| Moderation tab: flag/remove posts | ✅ |
| AI Studio: model registry (URL + file upload) | ✅ |
| AI Studio: activate/deploy model | ✅ |
| Reports tab: misidentification reports | ⚠️ display works, approve unclear |

**Redux:** reads/writes `aiConfig`, `marketplace.posts`
**Supabase:** shops (useShops), user_reports (useUserReports), model_registry (useModelRegistry)

---

## 5. AI Pipeline Status

```
Stage 1 (material type):
  Priority 1: YOLO ONNX  /model_ai/yolo_stage1.onnx  → 6 classes (no bottle, oil, aluminum)
  Priority 2: TM local   /model_ai/tm-my-image-model  → 11 classes
  Priority 3: ONNX classifier  (if onnxStage1Url set)
  Priority 4: Vertex AI        (if vertexStage1Endpoint set)
  Fallback: noDetection:true   → user sees toast

Stage 2 (cleanliness per material):
  Priority 1: TM per-material  /model_ai/{ขวด,กระดาษ,ลัง,หลาสติก,แก้ว,น้ำมัน,เหล็ก}
  Priority 2: ONNX cleanliness (if onnxStage2Url set)
  Priority 3: Vertex AI        (if vertexStage2Endpoint set)
  Fallback: skip (stage2Pass:true, stage2Skipped:true)
```

---

## 6. Outstanding Tasks (by priority)

### P1 — Breaks core flow
| # | Task | File(s) |
|---|------|---------|
| 1 | YOLO parser fix for `[1,4+nc,anchors]` shape | `src/services/yoloInference.js` ✅ done |
| 2 | Block TM cloud URLs (CORS) | `src/services/tmInference.js` ✅ done |
| 3 | CSP allow `unsafe-eval` for TF.js | `vercel.json` ✅ done |

### P2 — Missing data persistence
| # | Task | File(s) |
|---|------|---------|
| 4 | Buyer settings (openDays, acceptedMaterials) → Supabase | DashboardPage, shops/user_profiles |
| 5 | PricingPage → INSERT/UPDATE shop_pricing in Supabase | PricingPage, usePricing hook needed |

### P3 — UI-only features needing backend
| # | Task | File(s) |
|---|------|---------|
| 6 | Notifications — push via Supabase Realtime / DB trigger | notificationSlice, new hook |
| 7 | Heatmap — aggregate scan_history by district | AdminPage, new Supabase query |
| 8 | Shop approval workflow in AdminPage | AdminPage, shops table UPDATE |
| 9 | LandingPage global stats (kg, paid) from scan_history | LandingPage, new Supabase query |

### P4 — UX polish
| # | Task | File(s) |
|---|------|---------|
| 10 | Forgot password flow | LoginPage |
| 11 | Admin profile stats (not hardcoded 0) | ProfilePage |
| 12 | Settings notification prefs persist | SettingsPage |
| 13 | Export scan history CSV | SettingsPage / ProfilePage |

---

## Feature 21 — On-Demand Logistics (Partial — M6)

**Status:** ⚠️ Partial  
**Files:** `src/store/logisticsSlice.js`, `src/hooks/useRealtimeLogistics.js`, `src/pages/RiderDashboardPage.jsx`, `src/components/UserTrackingPanel.jsx`, `src/pages/BuyerOnboardingPage.jsx`  
**DB:** `supabase/migrations/013_logistics_onboarding.sql`, `supabase/migrations/016_rider_realtime_rls.sql`

3-sided Grab-inspired system: Seller creates booking → Buyer accepts → Rider (buyer role) picks up with GPS tracking. Booking state machine: pending → accepted → searching → arrived → completed | cancelled | rejected.

**Missing:** Manual rider assignment UI in admin, rider rating system.

---

## Feature 22 — Chat / Messages (Partial — M8)

**Status:** ⚠️ Partial  
**Files:** `src/store/chatSlice.js`, `src/hooks/useChat.js`, `src/pages/ChatPage.jsx`  
**DB:** `supabase/migrations/014_chat.sql`

Real-time 1:1 chat between sellers and buyer shops via Supabase Realtime. Full thread UI with message bubbles, composer, keyboard shortcuts.

**Missing:** ChatOfferModal (make in-chat offers with price/item/date), mobile room list navigation, unread count badge.
