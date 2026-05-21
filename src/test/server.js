import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('*/rest/v1/bookings*', () =>
    HttpResponse.json([
      { id: 'b1', status: 'pending', material_type: 'aluminum_can', weight_kg: 2,
        shops: { owner_id: 'u1', name: 'Test Shop' },
        seller: { display_name: 'Seller A' },
        created_at: new Date().toISOString(), scheduled_at: null },
    ])
  ),
  http.patch('*/rest/v1/bookings*', () => HttpResponse.json({ status: 'ok' })),
  http.post('*/rest/v1/scan_history*', () => HttpResponse.json({ id: 'scan1' })),
  http.get('*/rest/v1/shops*', () => HttpResponse.json([])),
  http.get('*/rest/v1/user_profiles*', () =>
    HttpResponse.json([{ id: 'u1', role: 'user', display_name: 'Test User' }])
  ),
  http.get('*/rest/v1/shop_pricing*', () =>
    HttpResponse.json([
      { shop_id: 'u1', material_type: 'aluminum_can',    price_per_kg: 40, cap_kg: 100 },
      { shop_id: 'u1', material_type: 'pet_bottle_clear',price_per_kg:  8, cap_kg: 200 },
      { shop_id: 'u1', material_type: 'cardboard',       price_per_kg:  3, cap_kg: 300 },
      { shop_id: 'u1', material_type: 'copper',          price_per_kg:200, cap_kg:  50 },
    ])
  ),
  http.get('*/rest/v1/marketplace_posts*', () => HttpResponse.json([])),
  http.get('*/rest/v1/schedules*', () => HttpResponse.json([])),
  http.get('*/rest/v1/notifications*', () => HttpResponse.json([])),
]

export const server = setupServer(...handlers)
