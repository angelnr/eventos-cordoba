import { test, expect } from '@playwright/test'
import { loginAs, FRONTEND_URL, API_URL } from './helpers'

test.describe('Reservas - UI E2E', () => {
  let eventId: number

  test.beforeAll(async ({ request }) => {
    const loginRes = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: 'organizer@example.com', password: 'organizer123' },
    })
    const orgToken = (await loginRes.json()).data.token
    const createRes = await request.post(`${API_URL}/api/events`, {
      headers: { Authorization: `Bearer ${orgToken}` },
      data: {
        title: `E2E Book Test ${Date.now()}`,
        description: 'Evento para test de reservas',
        date: new Date(Date.now() + 7 * 86400000).toISOString(),
        location: 'Cordoba',
        capacity: 100,
        price: 0,
        categoryId: 1,
      },
    })
    eventId = (await createRes.json()).data.id
  })

  test('Usuario reserva plaza', async ({ page }) => {
    await loginAs(page, 'user@example.com', 'user123')
    await page.goto(`${FRONTEND_URL}/events/${eventId}`)
    await expect(page.locator('[data-testid="book-button"]')).toBeVisible({ timeout: 10000 })
    await page.click('[data-testid="book-button"]')
    await page.waitForTimeout(2000)
    // Tras reservar, aparece boton cancelar y NO aparece boton reservar
    await expect(page.locator('[data-testid="cancel-booking-button"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="book-button"]')).not.toBeVisible()
  })

  test('Usuario cancela reserva', async ({ page }) => {
    const loginRes = await page.request.post(`${API_URL}/api/auth/login`, {
      data: { email: 'user@example.com', password: 'user123' },
    })
    const token = (await loginRes.json()).data.token
    await page.request.post(`${API_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { eventId, quantity: 1 },
    })

    await loginAs(page, 'user@example.com', 'user123')
    await page.goto(`${FRONTEND_URL}/events/${eventId}`)
    await expect(page.locator('[data-testid="cancel-booking-button"]')).toBeVisible({ timeout: 10000 })
    await page.click('[data-testid="cancel-booking-button"]')
    await page.waitForTimeout(2000)
    // Tras cancelar, aparece boton reservar y NO aparece boton cancelar
    await expect(page.locator('[data-testid="book-button"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('[data-testid="cancel-booking-button"]')).not.toBeVisible()
  })

  test('No logueado ve mensaje de login', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/events/${eventId}`)
    await expect(page.getByText('Inicia sesión para reservar')).toBeVisible()
  })

  test('Organizador no reserva su evento', async ({ page }) => {
    await loginAs(page, 'organizer@example.com', 'organizer123')
    await page.goto(`${FRONTEND_URL}/events/${eventId}`)
    await expect(page.locator('text=Eres el organizador')).toBeVisible()
    await expect(page.locator('[data-testid="book-button"]')).not.toBeVisible()
  })
})
