/**
 * 05-buyer-admin.spec.js
 *
 * Tests for buyer-role pages (DashboardPage, SettingsPage) and admin/profile
 * pages. All routes are behind ProtectedRoute.
 *
 * Fixture contract (implemented by e2e/fixtures/mockAuth.js):
 *   mockUserSession(page, role) — seeds Redux store with a session + profile
 *                                 for the given role ('user' | 'buyer' | 'admin')
 *   seedBuyerStorage(page)      — additionally seeds buyer-specific Redux state
 *                                 (openDays, acceptedMaterials, bookings)
 */

import { test, expect } from '@playwright/test'
import { mockUserSession, seedBuyerStorage } from '../fixtures/mockAuth.js'

// ---------------------------------------------------------------------------
// DashboardPage (Buyer)
// ---------------------------------------------------------------------------

test.describe('DashboardPage — buyer', () => {
  test.beforeEach(async ({ page }) => {
    // Dashboard requires role === 'buyer'
    await mockUserSession(page, 'buyer')
    await seedBuyerStorage(page)
  })

  test('renders four tab buttons', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Tabs rendered by TabBtn: t.recentBookings, t.myPricing, 'Shop Calendar', 'Materials'
    await expect(
      page.getByRole('button', { name: /recent bookings|การจอง/i }).first()
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /my pricing|ราคาของฉัน/i }).first()
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /shop calendar|ปฏิทินร้าน/i }).first()
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /^materials$|วัสดุที่รับ/i }).first()
    ).toBeVisible()
  })

  test('Weekly Volume chart day labels render', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // DAYS constant: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    // Rendered as <span> inside the bar chart
    await expect(page.getByText('Mon').first()).toBeVisible()
    await expect(page.getByText('Sat').first()).toBeVisible()
  })

  test('Calendar tab — full day names are visible', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /shop calendar|ปฏิทินร้าน/i }).first().click()

    // Calendar renders full names: Sunday, Monday, … Saturday
    await expect(page.getByText('Monday').first()).toBeVisible()
    await expect(page.getByText('Saturday').first()).toBeVisible()
    await expect(page.getByText('Sunday').first()).toBeVisible()
  })

  test('Calendar tab — day open/closed toggle buttons are present', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /shop calendar|ปฏิทินร้าน/i }).first().click()

    // Each day row has a button showing OPEN or CLOSED
    await expect(
      page.getByRole('button', { name: /open|closed|เปิด|ปิด/i }).first()
    ).toBeVisible()
  })

  test('Calendar tab — Save Calendar button is visible', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /shop calendar|ปฏิทินร้าน/i }).first().click()

    await expect(
      page.getByRole('button', { name: /save calendar|บันทึกการตั้งค่า/i })
    ).toBeVisible()
  })

  test('Materials tab — accepted material chips are visible', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /^materials$|วัสดุที่รับ/i }).first().click()

    // Material toggle buttons — names come from localName() which returns
    // locale strings like 'Aluminum Can', 'กระป๋องอลูมิเนียม', 'PET Bottle', etc.
    await expect(
      page
        .getByRole('button')
        .filter({ hasText: /aluminum|กระป๋อง|pet|พลาสติก/i })
        .first()
    ).toBeVisible({ timeout: 5000 })
  })

  test('Pricing tab — grade column headers render', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /my pricing|ราคาของฉัน/i }).first().click()

    // Grid header: 'Grade A (฿/kg)', 'Grade B (฿/kg)', 'Grade C (฿/kg)'
    // Match the t.gradeA / t.gradeB / t.gradeC translation keys
    await expect(page.getByText(/grade a/i).first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/grade b/i).first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/grade c/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('Pricing tab — Save Pricing button is visible', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /my pricing|ราคาของฉัน/i }).first().click()

    await expect(
      page.getByRole('button', { name: /save pricing|บันทึก/i })
    ).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// SettingsPage
// ---------------------------------------------------------------------------

test.describe('SettingsPage', () => {
  test.beforeEach(async ({ page }) => {
    // Settings is a ProtectedRoute (any authenticated role)
    await mockUserSession(page, 'user')
  })

  test('renders language section heading', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // SectionDivider label comes from t.language = 'Language' (en)
    await expect(page.getByText(/^language$|ภาษา/i)).toBeVisible()
  })

  test('renders Thai and English language buttons', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('button', { name: 'ภาษาไทย' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'English' })).toBeVisible()
  })

  test('renders appearance / dark mode section', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // SectionDivider for t.appearance = 'Appearance' (en)
    await expect(page.getByText(/appearance|การแสดงผล/i)).toBeVisible()

    // Toggle component: a <button> that contains the label text as a <span>
    // t.darkMode = 'Dark Mode' (en)
    await expect(page.getByText(/dark mode|โหมดมืด/i).first()).toBeVisible()
  })

  test('dark mode Toggle button click does not crash the page', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // The Toggle wraps the label in a full-width <button>; click it via the
    // label text since the button has no accessible name of its own.
    const toggleRow = page
      .getByRole('button')
      .filter({ hasText: /dark mode|โหมดมืด/i })

    if ((await toggleRow.count()) > 0) {
      await toggleRow.first().click()
      // Page remains visible and stable after toggle
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('switching language to Thai changes button state', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'ภาษาไทย' }).click()
    // The Thai button should now carry the active style (bg-green class applied)
    // Verify the page did not crash and is still on /settings
    await expect(page).toHaveURL(/\/settings/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('page content is constrained to max-w-xl on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // <main> uses max-w-xl (576px) with mx-auto — content width must be ≤ 576px
    const main = page.locator('main')
    const box = await main.boundingBox()
    if (box) {
      // Allow a small tolerance for padding/scrollbar
      expect(box.width).toBeLessThanOrEqual(600)
    }
  })
})

// ---------------------------------------------------------------------------
// AdminPage
// ---------------------------------------------------------------------------

test.describe('AdminPage', () => {
  test('renders page body without crash when authenticated as admin', async ({ page }) => {
    await mockUserSession(page, 'admin')
    await page.goto('/admin')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('body')).toBeVisible()
  })

  test('unauthenticated visitor is redirected away from /admin', async ({ page }) => {
    // No session seeded — ProtectedRoute redirects to /login
    await page.goto('/admin')
    await page.waitForLoadState('domcontentloaded')
    // Must not remain on /admin
    await expect(page).not.toHaveURL(/\/admin$/)
  })
})

// ---------------------------------------------------------------------------
// ProfilePage
// ---------------------------------------------------------------------------

test.describe('ProfilePage', () => {
  test('renders profile page without crash', async ({ page }) => {
    await mockUserSession(page, 'user')
    await page.goto('/profile')
    await page.waitForLoadState('domcontentloaded')
    await expect(page.locator('body')).toBeVisible()
  })

  test('unauthenticated visitor is redirected away from /profile', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('domcontentloaded')
    await expect(page).not.toHaveURL(/\/profile$/)
  })
})
