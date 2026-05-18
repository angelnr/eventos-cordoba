import { Page, APIRequestContext, expect } from '@playwright/test'

export const API_URL =
  process.env.E2E_API_URL || 'http://localhost:3001'
export const FRONTEND_URL =
  process.env.E2E_FRONTEND_URL || 'http://localhost:3000'

export async function loginAs(
  page: Page,
  email: string,
  password: string
) {
  await page.goto(`${FRONTEND_URL}/login`)
  await page.fill('[data-testid="login-email"]', email)
  await page.fill('[data-testid="login-password"]', password)
  await page.click('[data-testid="login-submit"]')
  await page.waitForURL(/\/(dashboard|events)/)
}

export async function getAdminToken(request: APIRequestContext) {
  const res = await request.post(`${API_URL}/api/auth/login`, {
    data: { email: 'admin@example.com', password: 'admin123' },
  })
  expect(res.ok()).toBeTruthy()
  return (await res.json()).data.token
}

export async function cleanupEvent(
  request: APIRequestContext,
  eventId: number,
  adminToken: string
) {
  await request.delete(`${API_URL}/api/events/${eventId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  })
}
