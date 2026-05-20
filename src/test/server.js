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
]

export const server = setupServer(...handlers)
