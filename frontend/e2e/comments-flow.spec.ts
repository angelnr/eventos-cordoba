import { test, expect } from '@playwright/test'
import { loginAs, FRONTEND_URL, API_URL } from './helpers'

test.describe('Comentarios - UI E2E', () => {
  let eventId: number

  test.beforeAll(async ({ request }) => {
    // Create a fresh event
    const loginRes = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: 'organizer@example.com', password: 'organizer123' },
    })
    const orgToken = (await loginRes.json()).data.token
    const createRes = await request.post(`${API_URL}/api/events`, {
      headers: { Authorization: `Bearer ${orgToken}` },
      data: {
        title: `E2E Comments Test ${Date.now()}`,
        description: 'Evento para test de comentarios',
        date: new Date(Date.now() + 7 * 86400000).toISOString(),
        location: 'Cordoba',
        capacity: 100,
        price: 0,
        categoryId: 1,
      },
    })
    eventId = (await createRes.json()).data.id
  })

  test('Usuario publica comentario', async ({ page }) => {
    await loginAs(page, 'user@example.com', 'user123')
    await page.goto(`${FRONTEND_URL}/events/${eventId}`)
    await page.locator('h2:has-text("Comentarios")').scrollIntoViewIfNeeded()
    await page.fill('textarea', 'Comentario E2E')
    await page.click('button:has-text("Publicar")')
    await expect(page.locator('[class*="text-gray-700"]').filter({ hasText: 'Comentario E2E' }).first()).toBeVisible({ timeout: 8000 })
  })

  test('No logueado ve mensaje para comentar', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/events/${eventId}`)
    await page.locator('h2:has-text("Comentarios")').scrollIntoViewIfNeeded()
    await expect(page.getByText('Inicia sesión para comentar')).toBeVisible()
  })
})
