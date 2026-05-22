/**
 * mockUserSession(page, role)
 *
 * Seeds a fake Supabase session into localStorage BEFORE app JS runs, then
 * dispatches session+profile directly into the Redux store so ProtectedRoute
 * sees an authenticated state on first render — no async race condition.
 *
 * Uses the same addInitScript + window.__reduxStore__ pattern as mockAs() in
 * loadTestData.js. Call BEFORE page.goto().
 */
export async function mockUserSession(page, role = 'user') {
  const id = 'test-user-id'
  const email = 'test@cmu.ac.th'

  await page.addInitScript(({ id, email, role }) => {
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
      display_name:   'Test User',
      language_pref:  'en',
      eco_points:     150,
      is_driver:      false,
      driver_vehicle: null,
      is_online:      false,
      last_seen:      new Date().toISOString(),
    }

    // Mock localStorage so supabase.auth.getSession() returns our fake session
    const sessionStr = JSON.stringify(sessionData)
    const origGetItem = Storage.prototype.getItem
    Storage.prototype.getItem = function(key) {
      if (typeof key === 'string' && /^sb-.+-auth-token$/.test(key)) return sessionStr
      return origGetItem.call(this, key)
    }

    // Dispatch into Redux store as soon as it's available
    const tryInjectStore = () => {
      if (window.__reduxStore__) {
        window.__reduxStore__.dispatch({ type: 'user/setSession', payload: sessionData })
        window.__reduxStore__.dispatch({ type: 'user/setProfile', payload: profileData })
      } else {
        setTimeout(tryInjectStore, 10)
      }
    }
    setTimeout(tryInjectStore, 0)
  }, { id, email, role })

  // Route intercepts as fallback for any Supabase API calls the app makes
  await page.route('**/auth/v1/user', route =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ id, email, role: 'authenticated', aud: 'authenticated',
        app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {},
        created_at: new Date().toISOString() }) })
  )

  await page.route('**/auth/v1/token*', route =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ access_token: 'mock-access-token', token_type: 'bearer',
        expires_in: 3600, refresh_token: 'mock-refresh-token',
        user: { id, email, role: 'authenticated', aud: 'authenticated',
          app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {},
          created_at: new Date().toISOString() } }) })
  )

  await page.route('**/rest/v1/user_profiles*', route =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ id, role, display_name: 'Test User',
        language_pref: 'en', eco_points: 150, is_driver: false,
        driver_vehicle: null, is_online: false, last_seen: new Date().toISOString() }) })
  )

  await page.route('**/rest/v1/bookings*', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  )
  await page.route('**/rest/v1/shops*', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  )
  await page.route('**/rest/v1/schedules*', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  )
  await page.route('**/rest/v1/shop_pricing*', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  )
  await page.route('**/rest/v1/marketplace_posts*', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  )
  await page.route('**/rest/v1/notifications*', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  )
}

/**
 * seedBuyerStorage(page)
 *
 * Seeds buyer-specific localStorage state (openDays, acceptedMaterials) before
 * page boot. buyerSlice reads these via loadFromStorage() on initialState.
 * Call BEFORE page.goto(), after mockUserSession().
 */
export async function seedBuyerStorage(page) {
  await page.addInitScript(() => {
    localStorage.setItem('buyer_settings', JSON.stringify({
      openDays: [1, 2, 3, 4, 5, 6],
      acceptedMaterials: ['aluminum_can', 'pet_bottle_clear', 'cardboard'],
    }))
  })
}
