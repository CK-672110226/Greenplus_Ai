import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('renders hero headline and CTA buttons', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toBeVisible()
    // Primary CTA: "I have recyclables →" navigates to /login?role=user
    // Secondary CTA: "I want to buy" navigates to /login?role=buyer
    // Both are <button> elements (not <a>) on the landing page
    await expect(
      page.getByRole('button', { name: /recyclables|scan|เริ่ม/i }).first()
    ).toBeVisible()
  })

  test('has correct page title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/GreenPlus/i)
  })

  test('primary CTA navigates to user login', async ({ page }) => {
    await page.goto('/')
    // "I have recyclables →" button
    await page.getByRole('button', { name: /recyclables/i }).first().click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('secondary CTA navigates to buyer login', async ({ page }) => {
    await page.goto('/')
    // "I want to buy" button
    await page.getByRole('button', { name: /buy/i }).first().click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('navigation to login works via role chooser cards', async ({ page }) => {
    await page.goto('/')
    // Role chooser buttons each navigate to /login?role=...
    const roleButtons = page.getByRole('button').filter({ hasText: /recycler|buyer/i })
    const count = await roleButtons.count()
    if (count > 0) {
      await roleButtons.first().click()
      await expect(page).toHaveURL(/\/login/)
    }
  })

  test('hero section contains stats bar', async ({ page }) => {
    await page.goto('/')
    // Stats bar shows recycled kg, paid out, active buyers
    await expect(page.getByText(/kg recycled/i)).toBeVisible()
    await expect(page.getByText(/active buyers/i)).toBeVisible()
  })

  test('page renders without console errors', async ({ page }) => {
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    // Filter out known third-party / extension errors and CSP warnings for Vercel dev scripts
    const criticalErrors = errors.filter(e =>
      !e.includes('extension') &&
      !e.includes('favicon') &&
      !e.includes('net::ERR') &&
      !e.includes('va.vercel-scripts.com')
    )
    expect(criticalErrors).toHaveLength(0)
  })
})
