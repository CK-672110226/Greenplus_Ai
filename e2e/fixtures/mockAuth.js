// Seed localStorage so the app boots with a logged-in Redux state
// userSlice reads from Supabase realtime, but we can force profile via
// a custom Supabase mock injected at route level.

export async function mockUserSession(page, role = 'user') {
  // Intercept Supabase auth endpoints
  await page.route('**/auth/v1/user', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-user-id',
        email: 'test@cmu.ac.th',
        role: 'authenticated',
        user_metadata: {},
      }),
    })
  })

  // Intercept profile fetch (user_profiles table)
  await page.route('**/rest/v1/user_profiles*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{
        id: 'test-user-id',
        role,
        display_name: 'Test User',
        language_pref: 'en',
        eco_points: 150,
      }]),
    })
  })

  // Intercept Supabase session
  await page.route('**/auth/v1/token*', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        user: { id: 'test-user-id', email: 'test@cmu.ac.th' },
      }),
    })
  })
}

export async function seedBuyerStorage(page) {
  await page.addInitScript(() => {
    localStorage.setItem('buyer_settings', JSON.stringify({
      openDays: [1, 2, 3, 4, 5, 6],
      acceptedMaterials: ['aluminum_can', 'pet_bottle_clear', 'cardboard'],
    }))
  })
}
