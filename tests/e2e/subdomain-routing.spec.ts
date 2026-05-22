import { test, expect } from '@playwright/test'

test.describe('Subdomain Routing E2E Smoke Tests', () => {

  test('1. Hub homepage renders at http://lvh.me:3000', async ({ page }) => {
    const response = await page.goto('http://lvh.me:3000')
    expect(response).not.toBeNull()
    expect(response!.status()).toBe(200)

    // Assert middleware headers
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBe('hub')
    expect(headers['x-middleware-matched-route']).toBe('/(hub)')

    // Assert page content
    const heading = page.locator('h1')
    await expect(heading).toContainText('Solusi Energi Terbarukan')
    await expect(page.locator('header nav')).toContainText('DBSN')
  })

  test('2. PJU spoke page renders at http://pju.lvh.me:3000', async ({ page }) => {
    const response = await page.goto('http://pju.lvh.me:3000')
    expect(response).not.toBeNull()
    
    // Assert middleware headers
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBe('pju')
    expect(headers['x-middleware-matched-route']).toBe('/(spokes)/pju')

    // If Sanity has data, it might return 200, otherwise if notFound() is called it might return 404
    if (response!.status() === 200) {
      const headerText = await page.locator('header').innerText()
      expect(headerText.toLowerCase()).toContain('pju')
    } else {
      expect(response!.status()).toBe(404)
    }
  })

  test('3. Solar Cell spoke page renders at http://solarcell.lvh.me:3000', async ({ page }) => {
    const response = await page.goto('http://solarcell.lvh.me:3000')
    expect(response).not.toBeNull()
    
    // Assert middleware headers
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBe('solarcell')
    expect(headers['x-middleware-matched-route']).toBe('/(spokes)/solarcell')

    if (response!.status() === 200) {
      const headerText = await page.locator('header').innerText()
      expect(headerText.toLowerCase()).toContain('solarcell')
    } else {
      expect(response!.status()).toBe(404)
    }
  })

  test('4. Dashboard layout renders at http://dashboard.lvh.me:3000', async ({ page }) => {
    const response = await page.goto('http://dashboard.lvh.me:3000')
    expect(response).not.toBeNull()
    expect(response!.status()).toBe(200)

    // Assert middleware headers
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBe('dashboard')
    expect(headers['x-middleware-matched-route']).toBe('/dashboard')

    // Assert layout text
    await expect(page.locator('nav')).toContainText('Dashboard')
    await expect(page.locator('h1')).toContainText('DBSN Client Dashboard')
  })

  test('5. Unknown subdomain fallthrough at http://unknown.lvh.me:3000', async ({ page }) => {
    const response = await page.goto('http://unknown.lvh.me:3000')
    expect(response).not.toBeNull()
    
    // Should rewrite to /404 and return 404 status
    expect(response!.status()).toBe(404)
    
    // Assert headers: since it rewrites to /404, it should NOT have the subdomain headers
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBeUndefined()
  })

  test('6. API routes are not rewritten at http://lvh.me:3000/api/revalidate', async ({ page }) => {
    const response = await page.goto('http://lvh.me:3000/api/revalidate')
    expect(response).not.toBeNull()
    expect(response!.status()).toBe(200)

    // Should return JSON response
    const contentType = response!.headers()['content-type']
    expect(contentType).toContain('application/json')

    const body = await response!.json()
    expect(body.status).toBe('ok')

    // Middleware headers should not be present (skipped rewrite)
    const headers = response!.headers()
    expect(headers['x-middleware-subdomain']).toBeUndefined()
  })
})
