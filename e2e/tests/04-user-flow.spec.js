/**
 * 04-user-flow.spec.js
 *
 * Tests for pages accessible in the user role.
 *
 * All routes are behind ProtectedRoute and redirect unauthenticated visitors
 * to /login. Each test uses mockUserSession(page, role) from the shared
 * fixture to inject a valid session before navigating to a protected route.
 *
 * Fixture contract (implemented by e2e/fixtures/mockAuth.js):
 *   mockUserSession(page, role) — seeds Redux store with a session + profile
 *                                 for the given role ('user' | 'buyer' | 'admin')
 *   seedBuyerStorage(page)      — additionally seeds buyer-specific Redux state
 */

import { test, expect } from '@playwright/test'
import { mockUserSession } from '../fixtures/mockAuth.js'

// ---------------------------------------------------------------------------
// MarketplacePage — listings
// ---------------------------------------------------------------------------

test.describe('MarketplacePage — listings', () => {
  test.beforeEach(async ({ page }) => {
    // marketplace is a ProtectedRoute (any role), so authenticate first
    await mockUserSession(page, 'user')
  })

  test('shows listings or empty state', async ({ page }) => {
    await page.goto('/marketplace')
    await page.waitForLoadState('networkidle')

    // Either card-like bordered elements exist, or an empty-state message
    const cards = page.locator('[class*="border"][class*="shadow"]')
    const empty = page.getByText(/no listings|ไม่พบ/i)
    const hasCards = (await cards.count()) > 0
    const hasEmpty = (await empty.count()) > 0
    expect(hasCards || hasEmpty).toBe(true)
  })

  test('grade filter pills A, B, C and All render', async ({ page }) => {
    await page.goto('/marketplace')
    await page.waitForLoadState('networkidle')

    // GradePills renders an "All" button (label comes from the filter list, not
    // from a translation key in this component)
    await expect(
      page.getByRole('button', { name: /^all$|^ทั้งหมด$/i }).first()
    ).toBeVisible()

    // Grade buttons A, B, C should also be present
    await expect(
      page.getByRole('button', { name: /^A$/i }).first()
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /^B$/i }).first()
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /^C$/i }).first()
    ).toBeVisible()
  })

  test('clicking grade A filter keeps user on marketplace', async ({ page }) => {
    await page.goto('/marketplace')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /^A$/i }).first().click()
    await expect(page).toHaveURL(/\/marketplace/)
  })

  test('clicking grade A then All restores full listing', async ({ page }) => {
    await page.goto('/marketplace')
    await page.waitForLoadState('networkidle')

    // Filter down then reset — page must remain stable
    await page.getByRole('button', { name: /^A$/i }).first().click()
    await page.getByRole('button', { name: /^all$|^ทั้งหมด$/i }).first().click()
    await expect(page).toHaveURL(/\/marketplace/)
  })
})

// ---------------------------------------------------------------------------
// MapPage
// ---------------------------------------------------------------------------

test.describe('MapPage', () => {
  test.beforeEach(async ({ page }) => {
    await mockUserSession(page, 'user')
  })

  test('renders Leaflet map container', async ({ page }) => {
    await page.goto('/map')
    // Leaflet injects .leaflet-container once the map has mounted
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 8000 })
  })

  test('filter pills are visible', async ({ page }) => {
    await page.goto('/map')
    await expect(
      page.getByRole('button', { name: /^all$|^ทั้งหมด$/i }).first()
    ).toBeVisible({ timeout: 8000 })
  })

  test('desktop: map wrapper height does not exceed 480px cap', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/map')
    await page.locator('.leaflet-container').waitFor({ state: 'visible', timeout: 8000 })

    // The parent wrapper uses responsive height (55vw capped at 480px).
    // On a 1280-wide viewport 55vw = 704px, so the cap of 480px applies.
    const mapWrapper = page.locator('.leaflet-container').locator('..')
    const box = await mapWrapper.boundingBox()
    if (box) {
      expect(box.height).toBeLessThanOrEqual(480)
    }
  })

  test('desktop: map wrapper is not a fixed 420px height', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/map')
    await page.locator('.leaflet-container').waitFor({ state: 'visible', timeout: 8000 })

    const mapWrapper = page.locator('.leaflet-container').locator('..')
    const box = await mapWrapper.boundingBox()
    if (box) {
      // Responsive height should not equal the old fixed 420px value
      expect(box.height).not.toBe(420)
    }
  })
})

// ---------------------------------------------------------------------------
// ScanPage
// ---------------------------------------------------------------------------

test.describe('ScanPage', () => {
  test.beforeEach(async ({ page }) => {
    await mockUserSession(page, 'user')
  })

  test('renders scan interface without crashing', async ({ page }) => {
    await page.context().grantPermissions(['camera'])
    await page.goto('/scan')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('body')).toBeVisible()
  })

  test('upload toggle button is present', async ({ page }) => {
    await page.goto('/scan')
    // The ScanPage renders a button to switch to image upload mode
    const uploadBtn = page.getByRole('button', { name: /upload|อัปโหลด/i })
    await expect(uploadBtn.first()).toBeVisible({ timeout: 5000 })
  })
})

// ---------------------------------------------------------------------------
// EcoPointsPage
// ---------------------------------------------------------------------------

test.describe('EcoPointsPage', () => {
  test.beforeEach(async ({ page }) => {
    await mockUserSession(page, 'user')
  })

  test('renders all four tier names', async ({ page }) => {
    await page.goto('/eco-points')
    await page.waitForLoadState('networkidle')

    // TIERS constant: Bronze, Silver, Gold, Platinum
    await expect(page.getByText(/bronze/i)).toBeVisible()
    await expect(page.getByText(/silver/i)).toBeVisible()
    await expect(page.getByText(/gold/i)).toBeVisible()
    await expect(page.getByText(/platinum/i)).toBeVisible()
  })

  test('rewards section shows a redeem action', async ({ page }) => {
    await page.goto('/eco-points')
    await page.waitForLoadState('networkidle')

    // t.redeemPoints = 'Redeem' (en) / section heading or button text
    await expect(page.getByText(/redeem|แลก/i).first()).toBeVisible()
  })

  test('page heading matches eco-points title', async ({ page }) => {
    await page.goto('/eco-points')
    await page.waitForLoadState('networkidle')

    // t.ecoPointsTitle = 'Eco Points' (en)
    await expect(page.getByRole('heading', { name: /eco.?points|อีโค|แต้ม/i })).toBeVisible()
  })

  test('your points label is visible', async ({ page }) => {
    await page.goto('/eco-points')
    await page.waitForLoadState('networkidle')

    // t.yourPoints = 'Your Points' (en)
    await expect(page.getByText(/your points|แต้มของคุณ/i)).toBeVisible()
  })
})
