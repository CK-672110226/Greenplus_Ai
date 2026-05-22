/**
 * loadTestData.js
 *
 * Mock data + route helpers for the 20-user / 100-order load test spec.
 *
 * UUID scheme mirrors supabase/seed/load_test_20users_100orders.sql so that
 * tests and DB seed stay in sync if you ever run against a real local DB.
 *
 * Usage:
 *   import { mockAs, USERS, SHOPS, BOOKINGS } from '../fixtures/loadTestData.js'
 *   await mockAs(page, USERS.buyer1)     // mount all REST mocks as buyer1
 *   await mockAs(page, USERS.driver1)    // mount as driver1
 *   await mockAs(page, USERS.cust01)     // mount as customer 01
 */

// ── User definitions ─────────────────────────────────────────────────────────

export const USERS = {
  buyer1: {
    id:           'b1000000-0000-0000-0000-000000000001',
    email:        'buyer1@greenplus.test',
    role:         'buyer',
    display_name: 'สมชาย ใจดี',
    language_pref:'th',
    eco_points:   0,
    is_driver:    false,
  },
  buyer2: {
    id:           'b1000000-0000-0000-0000-000000000002',
    email:        'buyer2@greenplus.test',
    role:         'buyer',
    display_name: 'มาลี รักสิน',
    language_pref:'th',
    eco_points:   0,
    is_driver:    false,
  },
  driver1: {
    id:           'd1000000-0000-0000-0000-000000000001',
    email:        'driver1@greenplus.test',
    role:         'user',
    display_name: 'ณัฐพงษ์ คุ้นกลาง',
    language_pref:'th',
    eco_points:   15,
    is_driver:    true,
    driver_vehicle:'motorcycle',
    is_online:    true,
  },
  driver2: {
    id:           'd1000000-0000-0000-0000-000000000002',
    email:        'driver2@greenplus.test',
    role:         'user',
    display_name: 'วันชัย ศรีสุข',
    language_pref:'th',
    eco_points:   22,
    is_driver:    true,
    driver_vehicle:'pickup',
    is_online:    false,
  },
  driver3: {
    id:           'd1000000-0000-0000-0000-000000000003',
    email:        'driver3@greenplus.test',
    role:         'user',
    display_name: 'ประพต รุ่งฤทธิ์',
    language_pref:'th',
    eco_points:   8,
    is_driver:    true,
    driver_vehicle:'motorcycle',
    is_online:    true,
  },
  driver4: {
    id:           'd1000000-0000-0000-0000-000000000004',
    email:        'driver4@greenplus.test',
    role:         'user',
    display_name: 'ศิริพร ธรรมศาสตร์',
    language_pref:'th',
    eco_points:   31,
    is_driver:    true,
    driver_vehicle:'truck',
    is_online:    false,
  },
  driver5: {
    id:           'd1000000-0000-0000-0000-000000000005',
    email:        'driver5@greenplus.test',
    role:         'user',
    display_name: 'กิตติพงษ์ สายชล',
    language_pref:'th',
    eco_points:   19,
    is_driver:    true,
    driver_vehicle:'pickup',
    is_online:    true,
  },
  cust01: { id:'c1000000-0000-0000-0000-000000000001', email:'cust01@greenplus.test', role:'user', display_name:'อภิชัย ยิ้มสวย',      language_pref:'th', eco_points: 47 },
  cust02: { id:'c1000000-0000-0000-0000-000000000002', email:'cust02@greenplus.test', role:'user', display_name:'ปิยะนุช แสงทอง',      language_pref:'th', eco_points: 83 },
  cust03: { id:'c1000000-0000-0000-0000-000000000003', email:'cust03@greenplus.test', role:'user', display_name:'ธีระพล มาดี',         language_pref:'th', eco_points: 12 },
  cust04: { id:'c1000000-0000-0000-0000-000000000004', email:'cust04@greenplus.test', role:'user', display_name:'กนกวรรณ ชัยชาญ',      language_pref:'th', eco_points:126 },
  cust05: { id:'c1000000-0000-0000-0000-000000000005', email:'cust05@greenplus.test', role:'user', display_name:'สุรศักดิ์ ดวงดี',     language_pref:'th', eco_points: 55 },
  cust06: { id:'c1000000-0000-0000-0000-000000000006', email:'cust06@greenplus.test', role:'user', display_name:'พรรณิภา เฉลิมชัย',    language_pref:'th', eco_points:200 },
  cust07: { id:'c1000000-0000-0000-0000-000000000007', email:'cust07@greenplus.test', role:'user', display_name:'ชัยรัตน์ พงษ์พิทักษ์',language_pref:'th', eco_points: 38 },
  cust08: { id:'c1000000-0000-0000-0000-000000000008', email:'cust08@greenplus.test', role:'user', display_name:'ลลิตา นวลจันทร์',     language_pref:'th', eco_points: 91 },
  cust09: { id:'c1000000-0000-0000-0000-000000000009', email:'cust09@greenplus.test', role:'user', display_name:'มนตรี ตั้งตรง',       language_pref:'th', eco_points: 62 },
  cust10: { id:'c1000000-0000-0000-0000-000000000010', email:'cust10@greenplus.test', role:'user', display_name:'สุภาพร ธรรมมาศ',      language_pref:'th', eco_points:  9 },
  cust11: { id:'c1000000-0000-0000-0000-000000000011', email:'cust11@greenplus.test', role:'user', display_name:'วิชิต ประสงค์ดี',     language_pref:'th', eco_points: 77 },
  cust12: { id:'c1000000-0000-0000-0000-000000000012', email:'cust12@greenplus.test', role:'user', display_name:'ดาวรุ่ง ฟ้าใส',       language_pref:'th', eco_points:144 },
  cust13: { id:'c1000000-0000-0000-0000-000000000013', email:'cust13@greenplus.test', role:'user', display_name:'พิทักษ์ รุ่งเรือง',   language_pref:'th', eco_points: 33 },
}

// ── Shops ────────────────────────────────────────────────────────────────────

export const SHOPS = [
  {
    id:        't1000000-0000-0000-0000-000000000001',
    owner_id:  'b1000000-0000-0000-0000-000000000001',
    name:      'กรีนพลัส นิมมาน',
    area:      'นิมมานเหมินท์',
    lat:       18.8012,
    lng:       98.9681,
    accepts:   ['aluminum_can','pet_bottle_clear','mixed_plastic','copper'],
    status:    'active',
    opens_at:  '08:00',
    closes_at: '18:00',
  },
  {
    id:        't1000000-0000-0000-0000-000000000002',
    owner_id:  'b1000000-0000-0000-0000-000000000002',
    name:      'กรีนพลัส สุเทพ',
    area:      'สุเทพ',
    lat:       18.7921,
    lng:       98.9744,
    accepts:   ['cardboard','newspaper','glass','cooking_oil','mixed_plastic'],
    status:    'active',
    opens_at:  '07:30',
    closes_at: '17:30',
  },
]

// ── Helper: build N bookings for a given seller + shop ───────────────────────

function makeBookings(sellerId, shopId, idPrefix, statuses) {
  const MATERIALS_A = ['aluminum_can','pet_bottle_clear','mixed_plastic','copper']
  const MATERIALS_B = ['cardboard','newspaper','glass','cooking_oil','mixed_plastic']
  const materials = shopId.endsWith('001') ? MATERIALS_A : MATERIALS_B
  return statuses.map((status, i) => ({
    id:                       `${idPrefix}${String(i + 1).padStart(3, '0')}`,
    seller_id:                sellerId,
    shop_id:                  shopId,
    material_type:            materials[i % materials.length],
    weight_kg:                10 + (i * 3.7),
    status,
    pickup_mode:              i % 2 === 0 ? 'dropOff' : 'onDemand',
    scheduled_at:             status === 'accepted' ? new Date(Date.now() + 86400000 * (i + 1)).toISOString() : null,
    assigned_driver_id:       (status === 'accepted' && i % 3 === 0)
                                ? 'd1000000-0000-0000-0000-000000000001' : null,
    driver_assignment_status: (status === 'accepted' && i % 3 === 0) ? 'accepted' : 'unassigned',
    created_at:               new Date(Date.now() - 86400000 * (30 - i)).toISOString(),
  }))
}

// 100 total: 40 completed, 25 accepted, 20 pending, 15 rejected
// Split shop A (55) / shop B (45)
export const BOOKINGS = [
  // Shop A — 55 bookings
  ...makeBookings('c1000000-0000-0000-0000-000000000001','t1000000-0000-0000-0000-000000000001',
    'fa000000-0000-0000-0001-',
    [...Array(20).fill('completed'), ...Array(13).fill('accepted'), ...Array(14).fill('pending'), ...Array(8).fill('rejected')]),
  // Shop B — 45 bookings
  ...makeBookings('c1000000-0000-0000-0000-000000000002','t1000000-0000-0000-0000-000000000002',
    'fb000000-0000-0000-0001-',
    [...Array(20).fill('completed'), ...Array(12).fill('accepted'), ...Array(6).fill('pending'), ...Array(7).fill('rejected')]),
]

// Bookings assigned to driver1 specifically
export const DRIVER1_BOOKINGS = BOOKINGS.filter(
  b => b.assigned_driver_id === 'd1000000-0000-0000-0000-000000000001'
)

// Bookings belonging to cust01
export const CUST01_BOOKINGS = BOOKINGS.filter(
  b => b.seller_id === 'c1000000-0000-0000-0000-000000000001'
)

// Bookings for shop A (buyer1's shop)
export const SHOP_A_BOOKINGS = BOOKINGS.filter(
  b => b.shop_id === 't1000000-0000-0000-0000-000000000001'
)

// ── Marketplace posts ────────────────────────────────────────────────────────

export const MARKETPLACE_POSTS = [
  { id:'mp000001', user_id:'c1000000-0000-0000-0000-000000000004', material_type:'aluminum_can',    quantity_kg: 50.0, price_per_kg:48.00, status:'active' },
  { id:'mp000002', user_id:'c1000000-0000-0000-0000-000000000006', material_type:'copper',          quantity_kg: 10.0, price_per_kg:240.00,status:'active' },
  { id:'mp000003', user_id:'c1000000-0000-0000-0000-000000000002', material_type:'cardboard',       quantity_kg:200.0, price_per_kg:3.00,  status:'active' },
  { id:'mp000004', user_id:'c1000000-0000-0000-0000-000000000008', material_type:'pet_bottle_clear',quantity_kg: 80.0, price_per_kg:9.60,  status:'active' },
  { id:'mp000005', user_id:'c1000000-0000-0000-0000-000000000011', material_type:'mixed_plastic',   quantity_kg:120.0, price_per_kg:4.50,  status:'active' },
  { id:'mp000006', user_id:'c1000000-0000-0000-0000-000000000012', material_type:'glass',           quantity_kg: 60.0, price_per_kg:1.20,  status:'active' },
  { id:'mp000007', user_id:'c1000000-0000-0000-0000-000000000009', material_type:'newspaper',       quantity_kg: 40.0, price_per_kg:2.50,  status:'sold'   },
  { id:'mp000008', user_id:'c1000000-0000-0000-0000-000000000003', material_type:'cooking_oil',     quantity_kg:  8.0, price_per_kg:13.00, status:'active' },
]

// ── Core mock installer ──────────────────────────────────────────────────────

/**
 * gotoProtected(page, path)
 *
 * Navigates to a ProtectedRoute page safely by first landing on '/' to let
 * auth initialize fully (session + profile), then going to the target.
 *
 * Why simple: mockAs() pre-populates the Redux store synchronously via
 * window.__reduxStore__ (exposed in dev mode by main.jsx). ProtectedRoute
 * already has session + profile by the time it renders, so no double-navigation
 * is needed to work around the async fetchOrCreateProfile race condition.
 */
export async function gotoProtected(page, path) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}

/**
 * mockAs(page, user)
 *
 * Seeds a fake Supabase session into localStorage BEFORE the app JS runs, then
 * installs Playwright route intercepts for all REST calls.
 *
 * Why addInitScript: supabase.auth.getSession() reads localStorage synchronously
 * during React init. Route-only mocks arrive too late — the app has already
 * decided "no session → redirect to /login". Intercepting localStorage.getItem
 * for any sb-*-auth-token key solves this regardless of the Supabase project ref.
 *
 * Call BEFORE page.goto() so both scripts and routes are active before boot.
 */
export async function mockAs(page, user) {
  // ── Step 1: inject fake session + profile BEFORE app boots ──────────────────
  // Also directly dispatches into the Redux store (window.__reduxStore__, set by
  // main.jsx in DEV mode) so ProtectedRoute sees session+profile on first render,
  // bypassing the async fetchOrCreateProfile race condition entirely.
  await page.addInitScript(({ id, email, role, displayName, languagePref, ecoPoints, isDriver, driverVehicle, isOnline }) => {
    const sessionData = {
      access_token:  'mock-access-token',
      token_type:    'bearer',
      expires_in:    3600,
      expires_at:    Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id,
        aud:   'authenticated',
        role:  'authenticated',
        email,
        email_confirmed_at: new Date().toISOString(),
        app_metadata:  { provider: 'email', providers: ['email'] },
        user_metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }
    const profileData = {
      id,
      role,
      display_name:  displayName,
      language_pref: languagePref ?? 'th',
      eco_points:    ecoPoints ?? 0,
      is_driver:     isDriver ?? false,
      driver_vehicle:driverVehicle ?? null,
      is_online:     isOnline ?? false,
      last_seen:     new Date().toISOString(),
    }

    // Mock localStorage so getSession() returns our fake session
    const sessionStr = JSON.stringify(sessionData)
    const origGetItem = Storage.prototype.getItem
    Storage.prototype.getItem = function(key) {
      if (typeof key === 'string' && /^sb-.+-auth-token$/.test(key)) return sessionStr
      return origGetItem.call(this, key)
    }

    // Inject session + profile directly into Redux store as soon as it's ready.
    // window.__reduxStore__ is set by main.jsx in DEV before createRoot() fires.
    const tryInjectStore = () => {
      if (window.__reduxStore__) {
        window.__reduxStore__.dispatch({ type: 'user/setSession', payload: sessionData })
        window.__reduxStore__.dispatch({ type: 'user/setProfile', payload: profileData })
      } else {
        setTimeout(tryInjectStore, 10)
      }
    }
    setTimeout(tryInjectStore, 0)
  }, {
    id:            user.id,
    email:         user.email,
    role:          user.role,
    displayName:   user.display_name,
    languagePref:  user.language_pref,
    ecoPoints:     user.eco_points,
    isDriver:      user.is_driver,
    driverVehicle: user.driver_vehicle,
    isOnline:      user.is_online,
  })

  // ── Step 2: network route mocks ─────────────────────────────────────────────

  // Auth: validate token / getUser
  await page.route('**/auth/v1/user', route =>
    route.fulfill({ status:200, contentType:'application/json',
      body: JSON.stringify({
        id: user.id, email: user.email, role:'authenticated',
        aud: 'authenticated',
        app_metadata: { provider:'email', providers:['email'] },
        user_metadata: {},
        created_at: new Date().toISOString(),
      }) })
  )

  // Auth: token refresh — return full session shape Supabase expects
  await page.route('**/auth/v1/token*', route =>
    route.fulfill({ status:200, contentType:'application/json',
      body: JSON.stringify({
        access_token:  'mock-access-token',
        token_type:    'bearer',
        expires_in:    3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: user.id, email: user.email, role:'authenticated',
          aud: 'authenticated',
          app_metadata: { provider:'email', providers:['email'] },
          user_metadata: {},
          created_at: new Date().toISOString(),
        },
      }) })
  )

  // Profile: return single object (not array) — fetchOrCreateProfile uses .single()
  // which calls response.json() directly, so a plain object gives data.role correctly.
  const profileObj = {
    id:            user.id,
    role:          user.role,
    display_name:  user.display_name,
    language_pref: user.language_pref ?? 'th',
    eco_points:    user.eco_points ?? 0,
    is_driver:     user.is_driver ?? false,
    driver_vehicle:user.driver_vehicle ?? null,
    is_online:     user.is_online ?? false,
    last_seen:     new Date().toISOString(),
  }
  await page.route('**/rest/v1/user_profiles*', route =>
    route.fulfill({ status:200, contentType:'application/json',
      body: JSON.stringify(profileObj) })
  )

  // Shops: all active shops
  await page.route('**/rest/v1/shops*', route =>
    route.fulfill({ status:200, contentType:'application/json',
      body: JSON.stringify(SHOPS) })
  )

  // Bookings: filter by seller_id or shop owner
  await page.route('**/rest/v1/bookings*', route => {
    let rows
    if (user.role === 'buyer') {
      const myShopIds = SHOPS.filter(s => s.owner_id === user.id).map(s => s.id)
      rows = BOOKINGS.filter(b => myShopIds.includes(b.shop_id))
    } else if (user.is_driver) {
      rows = BOOKINGS.filter(b => b.assigned_driver_id === user.id)
    } else {
      rows = BOOKINGS.filter(b => b.seller_id === user.id)
    }
    route.fulfill({ status:200, contentType:'application/json', body: JSON.stringify(rows) })
  })

  // Marketplace: active posts (public)
  await page.route('**/rest/v1/marketplace_posts*', route =>
    route.fulfill({ status:200, contentType:'application/json',
      body: JSON.stringify(MARKETPLACE_POSTS.filter(p => p.status === 'active')) })
  )

  // Scan history: own scans only
  await page.route('**/rest/v1/scan_history*', route =>
    route.fulfill({ status:200, contentType:'application/json', body: JSON.stringify([]) })
  )

  // Eco point ledger
  await page.route('**/rest/v1/eco_point_ledger*', route =>
    route.fulfill({ status:200, contentType:'application/json', body: JSON.stringify([]) })
  )

  // Notifications
  await page.route('**/rest/v1/notifications*', route =>
    route.fulfill({ status:200, contentType:'application/json', body: JSON.stringify([]) })
  )

  // Schedules
  await page.route('**/rest/v1/schedules*', route =>
    route.fulfill({ status:200, contentType:'application/json', body: JSON.stringify([]) })
  )

  // Shop pricing
  await page.route('**/rest/v1/shop_pricing*', route =>
    route.fulfill({ status:200, contentType:'application/json', body: JSON.stringify([
      { shop_id:'t1000000-0000-0000-0000-000000000001', material_type:'aluminum_can',    price_per_kg:45, cap_kg:100 },
      { shop_id:'t1000000-0000-0000-0000-000000000001', material_type:'pet_bottle_clear',price_per_kg: 9, cap_kg:200 },
      { shop_id:'t1000000-0000-0000-0000-000000000001', material_type:'copper',          price_per_kg:210,cap_kg: 50 },
      { shop_id:'t1000000-0000-0000-0000-000000000002', material_type:'cardboard',       price_per_kg: 4, cap_kg:300 },
      { shop_id:'t1000000-0000-0000-0000-000000000002', material_type:'newspaper',       price_per_kg: 3, cap_kg:200 },
    ]) })
  )

  // Supabase Realtime — return empty; prevents WS errors in test
  await page.route('**/realtime/v1/**', route => route.abort())
}
