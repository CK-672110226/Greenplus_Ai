import { test, expect } from '@playwright/test'

// Critical smoke tests — run on every PR.
// These catch crashes (blank screen, uncaught exceptions) that lint + build miss.
// A pageerror means the JS runtime threw and React couldn't mount — user sees blank white.

const SMOKE_PAGES = ['/', '/login']

for (const path of SMOKE_PAGES) {
  test(`${path} — no uncaught JS errors`, async ({ page }) => {
    const pageErrors = []
    page.on('pageerror', err => pageErrors.push(err.message))

    await page.goto(path)
    await page.waitForLoadState('networkidle')

    expect(
      pageErrors,
      `Uncaught JS errors on ${path}:\n${pageErrors.join('\n')}`
    ).toHaveLength(0)
  })

  test(`${path} — root element renders content`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')

    const root = page.locator('#root')
    await expect(root).not.toBeEmpty()
  })
}

test('/ — hero headline visible', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('h1').first()).toBeVisible()
})

test('/login — email input visible', async ({ page }) => {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('input[type="email"]')).toBeVisible()
})

test('/home — unauthenticated redirects away from blank screen', async ({ page }) => {
  const pageErrors = []
  page.on('pageerror', err => pageErrors.push(err.message))

  await page.goto('/home')
  await page.waitForLoadState('networkidle')

  // Should redirect to /login or /, never stay on /home unauthenticated
  await expect(page).not.toHaveURL(/\/home$/)
  expect(pageErrors).toHaveLength(0)
})
