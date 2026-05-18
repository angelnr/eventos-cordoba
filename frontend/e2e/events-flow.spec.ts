import { test, expect } from '@playwright/test'
import {
  loginAs,
  FRONTEND_URL,
  getAdminToken,
  cleanupEvent,
  API_URL,
} from './helpers'

test.describe('Eventos - UI E2E', () => {
  let adminToken: string
  let createdEventId: number | null = null

  test.beforeAll(async ({ request }) => {
    adminToken = await getAdminToken(request)
  })

  test.afterEach(async ({ request }) => {
    if (createdEventId) {
      await cleanupEvent(request, createdEventId, adminToken)
      createdEventId = null
    }
  })

  test('Usuario navega a eventos y ve detalle', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/events`)
    await page.waitForSelector('[data-testid="event-card"]', { timeout: 15000 })
    await page.locator('a[href^="/events/"]').first().click()
    await expect(page.locator('[data-testid="event-detail-title"]')).toBeVisible()
  })

  test('Organizador crea evento via API y verifica en UI', async ({ page }) => {
    // Crear evento via API para evitar UI compleja (LocationPicker)
    const loginRes = await page.request.post(`${API_URL}/api/auth/login`, {
      data: { email: 'organizer@example.com', password: 'organizer123' },
    })
    const orgToken = (await loginRes.json()).data.token
    const title = `E2E-API-${Date.now()}`
    const createRes = await page.request.post(`${API_URL}/api/events`, {
      headers: { Authorization: `Bearer ${orgToken}` },
      data: {
        title,
        description: 'Creado via API',
        date: new Date(Date.now() + 86400000).toISOString(),
        location: 'Cordoba, Espana',
        capacity: 50,
        price: 10,
        categoryId: 1,
      },
    })
    expect(createRes.ok()).toBeTruthy()
    const event = (await createRes.json()).data
    createdEventId = event.id

    // Verificar que aparece en el listado
    await loginAs(page, 'organizer@example.com', 'organizer123')
    await page.goto(`${FRONTEND_URL}/events`)
    await expect(page.locator('[data-testid="event-card"]').first()).toBeVisible({ timeout: 10000 })

    // Verificar detalle
    await page.goto(`${FRONTEND_URL}/events/${createdEventId}`)
    await expect(page.locator('[data-testid="event-detail-title"]')).toContainText(title)
  })
})
