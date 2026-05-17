# GreenPlus Ai — User Flow & Page Composition

> อ่านไฟล์นี้ก่อนสร้างหรือแก้ไขหน้าใดๆ เพื่อให้เข้าใจว่าหน้านั้นอยู่ตรงไหนใน flow และต้องการ state อะไร

---

## 1. Entry Points & Role Routing

```
URL /          → LandingPage
                 ├── คลิก User card   → /login?role=user  → (auth) → /home
                 └── คลิก Buyer card  → /login?role=buyer → (auth) → /dashboard

URL /x/admin   → AdminLoginPage (hidden, no nav link)
                 └── (auth, role=admin) → /admin

SmartLayout (ครอบทุก route)
  role = user   → UserLayout   (TopBar + BottomTabBar)
  role = buyer  → BuyerLayout  (Sidebar desktop / TopBar+strip mobile)
  role = admin  → Default shell (NavBar)
  null/loading  → Default shell (NavBar)
```

---

## 2. User Flow — role: `user`

```
[/home] HomePage
   │  tap Scan CTA / BottomTab "Scan"
   ▼
[/scan] ScanPage ──────────────────────────────────────────────────────┐
   │  1. กด "Start Camera"                                              │
   │  2. กด "Scan Item" → twoStageInfer()                              │
   │     ├── troll/lowConfidence → anti-troll overlay → กด "Scan Again" ┘
   │     └── result → แสดง GradeTag + ScoreBar + weight + price + rules
   │  3. กด "Add to Basket" → dispatch addToBasket + insertScan (Supabase)
   │  4. กด "Scan Again" → reset
   │
   ▼  (BottomTab หรือ TopBar basket icon)
[/basket] BasketPage
   │  แสดงรายการ basket + estimate value
   │  กด "Skip" / "Remove" → dispatch toggleSkip / removeFromBasket
   │  กด "Use my location" → useGPS() → haversine distance
   │  กด "Find Route" → คำนวณ Single Shop / Multi-Stop
   │  กด "Book" → dispatch addBooking → toast bookingConfirmed
   │  กด "Clear Basket" → dispatch clearBasket
   │
   ├──► [/map] MapPage  (BottomTab)
   │      แสดง Leaflet map + shop markers
   │      กด shop marker → popup พร้อม "Get Directions" (external link)
   │
   ├──► [/marketplace] MarketplacePage  (Sidebar/TopBar shared)
   │      กรอง grade A/B/C
   │      user+buyer → แสดงปุ่ม "Post Ad" → PostAdForm modal
   │      กด "Contact" → toast/info
   │
   ├──► [/eco-points] EcoPointsPage  (BottomTab Profile → link)
   │      แสดง point total + tier + history
   │
   └──► [/profile] ProfilePage  (BottomTab)
          แสดง scan history, eco points, role info
          SettingsPage link
```

---

## 3. Buyer Flow — role: `buyer`

```
[/dashboard] DashboardPage
   │  สถิติ: pending / completed / revenue / avg grade
   │  รายการ booking → กด "Accept" / "Reject" → dispatch updateStatus
   │  Pricing tab → แก้ราคารับซื้อ per material/grade
   │
   ├──► [/marketplace] MarketplacePage (shared)
   │
   └──► [/profile] ProfilePage
          shopInfo, acceptedMaterials, pricingTable
```

---

## 4. Admin Flow — role: `admin`

```
[/admin] AdminPage  (เข้าจาก /x/admin → AdminLoginPage → /admin)
   │  Tab: Shops
   │    pending shops → Approve / Reject
   │    active shops list + scan count
   │
   │  Tab: Heatmap
   │    10×10 density grid (Chiang Mai districts)
   │
   │  Tab: AI Model Config
   │    เลือก model, ใส่ API Key, system prompt, confidence threshold
   │    Second Brain test panel
   │    dispatch setAiConfig → บันทึกลง localStorage
   │
   │  Tab: AI Studio  (C-07)
   │    per-class image upload (8 WASTE_ITEMS classes)
   │    กด "Train Model" → progress bar simulation
   │    กด "Deploy" → dispatch setAiConfig { onnxStage1Url, onnxStage2Url, modelVersion }
   │
   └──► Tab: Moderation
          รายการ marketplace posts ทั้งหมด
          กด "Flag/Unflag" → dispatch flagPost
          กด "Remove" → dispatch removePost
```

---

## 5. Page Composition

แต่ละหน้าประกอบด้วย components อะไร และอ่าน/เขียน Redux state ใด

### LandingPage `/`
| องค์ประกอบ | รายละเอียด |
|-----------|-----------|
| Components | `<Card>`, `<Button>` |
| Redux read | `user.session`, `user.profile.role`, `user.loading` |
| Redux write | — |
| Navigation | → `/login?role=user`, → `/login?role=buyer` |
| Auto-redirect | ถ้า session มีอยู่แล้ว → `ROLE_DEST[role]` |

---

### LoginPage `/login`
| องค์ประกอบ | รายละเอียด |
|-----------|-----------|
| Components | `<Card>`, `<Button>` |
| Redux read | `user.session`, `user.profile` |
| Redux write | `setSession`, `setProfile` (ผ่าน `useAuth` hook) |
| Services | `supabase.auth.signInWithPassword`, `supabase.auth.signInWithOAuth` |
| Navigation | → role-based ROLE_DEST หลัง auth สำเร็จ |

---

### AdminLoginPage `/x/admin`
| องค์ประกอบ | รายละเอียด |
|-----------|-----------|
| Components | `<Card>`, `<Button>` |
| Redux read | `user.session`, `user.profile` |
| Redux write | `setSession`, `setProfile` |
| Guard | ถ้า role ≠ admin → `supabase.auth.signOut()` อัตโนมัติ |
| Navigation | → `/admin` เมื่อ role=admin |

---

### HomePage `/home` _(user only)_
| องค์ประกอบ | รายละเอียด |
|-----------|-----------|
| Components | `<Card>`, `<Button>`, `<GradeTag>` |
| Redux read | `waste.basket`, `waste.lastScan`, `user.language` |
| Redux write | — |
| Navigation | → `/scan`, → `/basket`, → `/map`, → `/eco-points` |
| State dependencies | `basket.filter(i => !i.skipped)` สำหรับ activeItems |

---

### ScanPage `/scan` _(user only)_
| องค์ประกอบ | รายละเอียด |
|-----------|-----------|
| Components | `<Card>`, `<Button>`, `<GradeTag>`, `ScoreBar` (local) |
| Redux read | `user.language`, `aiConfig` (threshold + ONNX URLs) |
| Redux write | `addToBasket`, `setLastScan` |
| Services | `twoStageInfer()`, `useScanInsert()` → Supabase |
| External | `navigator.mediaDevices.getUserMedia` |
| Data | `pricePerKg()`, `localName()`, `getRulesFor()`, `SEVERITY_COLOR` |
| Phases | `idle` → `analyzing` → `result` \| `troll` \| `error` |

---

### BasketPage `/basket` _(user only)_
| องค์ประกอบ | รายละเอียด |
|-----------|-----------|
| Components | `<Card>`, `<Button>`, `<GradeTag>` |
| Redux read | `waste.basket`, `bookings.bookings` |
| Redux write | `toggleSkip`, `removeFromBasket`, `clearBasket`, `addBooking` |
| Hooks | `useGPS()` → lat/lng |
| Utils | `haversineKm()` สำหรับคำนวณระยะทาง |
| Data | `SHOPS` (static mock), `pricePerKg()`, `localName()` |
| Logic | `computeRoutes()` → Single Shop / Multi-Stop assignment |

---

### MapPage `/map` _(user only)_
| องค์ประกอบ | รายละเอียด |
|-----------|-----------|
| Components | `<Card>`, `<Button>` |
| External lib | `react-leaflet` + OpenStreetMap tiles |
| Redux read | `user.language` |
| Redux write | — |
| Data | `SHOPS` static list (lat/lng, acceptedMaterials) |

---

### MarketplacePage `/marketplace` _(user + buyer)_
| องค์ประกอบ | รายละเอียด |
|-----------|-----------|
| Components | `<Card>`, `<Button>`, `<GradeTag>`, `PostAdForm` (local) |
| Redux read | `marketplace.posts`, `marketplace.gradeFilter`, `user.profile.role`, `user.language` |
| Redux write | `setGradeFilter`, `addPost` |
| Data | `WASTE_ITEMS`, `pricePerKg()`, `localName()` |
| Conditional | Post Ad button แสดงเฉพาะ role `user` หรือ `buyer` |

---

### DashboardPage `/dashboard` _(buyer only)_
| องค์ประกอบ | รายละเอียด |
|-----------|-----------|
| Components | `<Card>`, `<Button>` |
| Redux read | `bookings.bookings`, `user.language` |
| Redux write | `updateStatus` |
| Stats | pending / completed / revenue คำนวณจาก bookings array |
| Tabs | Bookings \| Pricing (local state สำหรับ pricing form) |

---

### AdminPage `/admin` _(admin only)_
| องค์ประกอบ | รายละเอียด |
|-----------|-----------|
| Components | `<Card>`, `<Button>`, `<GradeTag>`, `ClassUploadCard` (local), `TabBtn` (local) |
| Redux read | `aiConfig`, `marketplace.posts`, `user.language` |
| Redux write | `setAiConfig`, `flagPost`, `removePost` |
| Services | `classifyWaste()` (Second Brain test) |
| Tabs | Shops \| Heatmap \| AI Config \| AI Studio \| Moderation |
| Local state | pending shops, train progress, class images, trained version |

---

### ProfilePage `/profile` _(all roles)_
| องค์ประกอบ | รายละเอียด |
|-----------|-----------|
| Components | `<Card>`, `<Button>`, `<GradeTag>` |
| Redux read | `user.session`, `user.profile`, `waste.basket` |
| Redux write | — |
| Conditional | แสดง section ตาม role (user/buyer/admin แต่ละ role เห็นต่างกัน) |

---

### SettingsPage `/settings` _(all roles)_
| องค์ประกอบ | รายละเอียด |
|-----------|-----------|
| Components | `<Card>`, `<Button>` |
| Redux read | `user.darkMode`, `user.language` |
| Redux write | `toggleDarkMode`, `setLanguage` |

---

### EcoPointsPage `/eco-points` _(user only)_
| องค์ประกอบ | รายละเอียด |
|-----------|-----------|
| Components | `<Card>`, `<Button>` |
| Redux read | `user.session` |
| Redux write | — |
| Note | Points data มาจาก Supabase `eco_points` table (S-05 migration) |

---

## 6. Redux State ↔ Page Map

| Slice | หน้าที่อ่าน | หน้าที่เขียน |
|-------|-----------|------------|
| `user` | ทุกหน้า (session, profile, language, darkMode) | LoginPage, AdminLoginPage, SettingsPage |
| `waste.basket` | HomePage, BasketPage | ScanPage (addToBasket) |
| `waste.lastScan` | HomePage | ScanPage (setLastScan) |
| `marketplace` | MarketplacePage, AdminPage | MarketplacePage (addPost, setGradeFilter), AdminPage (flagPost, removePost) |
| `bookings` | DashboardPage, BasketPage | BasketPage (addBooking), DashboardPage (updateStatus) |
| `aiConfig` | ScanPage, AdminPage | AdminPage (setAiConfig) |

---

## 7. Protected Route Rules

```
<ProtectedRoute>                    → ต้อง session (ทุก role)
<ProtectedRoute requiredRole="user"> → เฉพาะ role = user
<ProtectedRoute requiredRole="buyer">→ เฉพาะ role = buyer
<ProtectedRoute requiredRole="admin">→ เฉพาะ role = admin
```

ถ้า `loading = true` → render `null` (ป้องกัน flash redirect)  
ถ้าไม่มี session → redirect `/login`  
ถ้า role ไม่ตรง → redirect `/`

---

## 8. Navigation Patterns

| Pattern | วิธีทำ |
|---------|-------|
| Programmatic nav | `useNavigate()` + `navigate('/path')` |
| Link (anchor) | `<Link to="/path">` จาก react-router-dom |
| Active tab highlight | `<NavLink>` พร้อม `({ isActive }) => className` |
| Redirect เมื่อ condition | `<Navigate to="..." replace />` ใน render |
| Back navigation | `navigate(-1)` หรือ navigate ไปหน้าหลักของ role |

---

## 9. การเพิ่มหน้าใหม่ — Checklist

1. **สร้างไฟล์** `src/pages/NewPage.jsx`
2. **เพิ่ม route** ใน `src/App.jsx` ภายใต้ `<Route element={<SmartLayout />}>`
3. **ห่อ** `<ProtectedRoute>` ถ้าต้อง auth
4. **เพิ่ม nav link** ใน layout ที่ถูก role (UserLayout/BuyerLayout/NavBar)
5. **เพิ่ม i18n key** ใน `src/i18n/en.js` และ `src/i18n/th.js`
6. **อัปเดต** section Page Composition ในไฟล์นี้
7. **สร้าง history file** ตาม PROJECT_AI_WORKING_RULES.md

---

## 10. On-Demand Logistics Flow

Added in M6 sprint (16 May 2026). Implements a Grab-inspired 3-sided real-time pickup system.

### New Routes

| Route | Role | Component | Status |
|-------|------|-----------|--------|
| /rider | buyer | RiderDashboardPage | Building (M6) |
| /onboarding | buyer | BuyerOnboardingPage | Building (M6/M7) |
| /chat | all-auth | ChatPage | M8 |
| /chat/:roomId | all-auth | ChatPage | M8 |

---

### User (Seller) Flow

```
[/basket]
   │  basket has items → "Call On-Demand Rider" button appears
   │  tap button → dispatch createBooking(status=searching)
   ▼
[/basket] with UserTrackingPanel visible
   │  status = searching → panel: "Looking for a rider near you…"
   │  status = accepted  → panel: rider name + ETA + live map dot
   │  status = arrived   → panel: "Your rider has arrived — meet them outside"
   │  status = completed → panel: receipt (actualWeight, actualValue) for 5 s then dismisses
   │  status = cancelled → panel: error + "Try again" CTA
   │
   └── UserTrackingPanel reads logisticsSlice.activeBooking (Supabase Realtime)
```

### Buyer (Rider) Flow

```
[/rider] RiderDashboardPage
   │  Toggle "Go Online" → dispatch setIsOnline(true) → UPDATE user_profiles.is_online
   │  GPS polling starts → dispatch setRiderLocation({ lat, lng }) every 10 s
   │  nearbyOrders updates — haversine(riderLat, orderLat) <= shop.pickup_radius_km (default 5 km)
   │
   │  Nearby Orders list shows: seller name, estimated weight, material types, distance
   │  tap "Accept" → dispatch acceptOrder → UPDATE bookings.status = accepted
   │
   │  Active Order panel shows:
   │    - Seller address + "Navigate" button (Google Maps external link)
   │    - "I've Arrived" button → UPDATE bookings.status = arrived, bookings.arrived_at
   │
   │  Weight Verification inputs:
   │    - actualWeight (kg) input — validates > 0 and < 10,000
   │    - actualValue (THB) auto-calculated from shop_pricing
   │
   │  "Complete & Pay" button → UPDATE bookings.status = completed,
   │    bookings.completed_at, bookings.actual_weight, bookings.actual_value
   │
   └── Toggle "Go Offline" → dispatch setIsOnline(false)
```

### Admin Flow

```
[/admin] → Tab: Heatmap
   │  existing CircleMarkers from scan_history (lat/lng added in AdminHeatmap feature)
   │  new: density overlay showing pickup request clusters
   │  new: filter toggle — "Show scan density" / "Show pickup requests"
   └── reads bookings table WHERE status IN (completed, arrived) for pickup heatmap layer
```

### Booking Status State Machine

```
                    ┌──────────────────────────────────────┐
                    │                                      ▼
pending ──► searching ──► accepted ──► arrived ──► completed
   │            │              │
   │            ▼              ▼
   └──► rejected        cancelled
```

| Status | Set by | Meaning |
|--------|--------|---------|
| pending | BasketPage (schedule booking) | Traditional scheduled booking, awaiting buyer action |
| searching | BasketPage (on-demand) | Broadcast to nearby riders, waiting for acceptance |
| accepted | RiderDashboardPage | Rider accepted, en route to seller |
| arrived | RiderDashboardPage | Rider at seller location, verifying weight |
| completed | RiderDashboardPage | Transaction closed, weight + value recorded |
| rejected | DashboardPage (buyer) | Traditional booking rejected by buyer |
| cancelled | BasketPage or timeout | User cancelled or no rider found within timeout |

### Redux Slices (new)

| Slice | Key State | Reads | Writes |
|-------|-----------|-------|--------|
| `logisticsSlice` | activeBooking, nearbyOrders, riderLocation, isOnline | RiderDashboardPage, UserTrackingPanel, BasketPage | RiderDashboardPage (online toggle, accept, arrived, complete), BasketPage (create on-demand booking) |
| `chatSlice` | rooms, messages | ChatPage (M8) | ChatPage (M8) |

### Page Composition — new pages

#### RiderDashboardPage `/rider` _(buyer role only)_

| Component | Detail |
|-----------|--------|
| Components | `<Card>`, `<Button>`, `<EmptyState>`, `<Skeleton>` |
| Redux read | `logistics.isOnline`, `logistics.nearbyOrders`, `logistics.activeBooking`, `logistics.riderLocation`, `user.profile` |
| Redux write | `setIsOnline`, `setNearbyOrders`, `setActiveBooking`, `setRiderLocation` |
| Hooks | `useRealtimeLogistics`, `useGPS` |
| Guard | `<ProtectedRoute requiredRole="buyer">` |
| Services | Supabase UPDATE `user_profiles` (is_online, lat/lng), UPDATE `bookings` (status transitions) |

#### BuyerOnboardingPage `/onboarding` _(buyer role only)_

| Component | Detail |
|-----------|--------|
| Components | `<Card>`, `<Button>`, `<ProgressBar>` |
| Local state | currentStep (1–3), formData |
| Step 1 | Shop name, phone (Thai format), Line ID |
| Step 2 | Accepted materials (checkbox list) |
| Step 3 | Pickup radius + base pricing per material |
| Services | Supabase UPDATE `shops` + UPDATE `user_profiles.onboarding_complete = true` |
| Guard | `<ProtectedRoute requiredRole="buyer">` |
| Post-complete | redirect → `/dashboard` |

#### ChatPage `/chat` and `/chat/:roomId` _(all authenticated roles — M8)_

| Component | Detail |
|-----------|--------|
| Status | Stub route only in M6; full implementation M8 |
| Components | `<Card>` stub |
| Redux read | `chat.rooms`, `chat.messages` (M8) |
| Guard | `<ProtectedRoute>` (any authenticated role) |
