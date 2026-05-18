import { test, expect } from '@playwright/test';

const API_URL = process.env.E2E_API_URL || 'http://localhost:3001';
const ADMIN = { email: 'admin@example.com', password: 'admin123' };
let adminToken: string;

test.describe('User Management - E2E', () => {

  test('1. Login as admin returns token', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/auth/login`, {
      data: ADMIN,
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBeTruthy();
    expect(body.data.user.role).toBe('admin');
    adminToken = body.data.token;
  });

  test('2. GET /api/users returns users with role field', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    // Every user must have role field
    for (const user of body.data) {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(['user', 'staff', 'organizer', 'admin']).toContain(user.role);
    }
  });

  test('3. GET /api/users?search= filters users', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/users?search=admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBe(true);
    // Should find at least the admin user
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    for (const user of body.data) {
      const matchesName = user.name && user.name.toLowerCase().includes('admin');
      const matchesEmail = user.email && user.email.toLowerCase().includes('admin');
      expect(matchesName || matchesEmail).toBe(true);
    }
  });

  test('4. GET /api/users without token returns 401', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/users`);
    expect(res.status()).toBe(401);
  });

  test('5. PATCH role with invalid value returns 400', async ({ request }) => {
    const res = await request.patch(`${API_URL}/api/users/3/role`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      data: { role: 'superadmin' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Rol inválido');
  });

  test('6. PATCH self-role-change returns 403', async ({ request }) => {
    const res = await request.patch(`${API_URL}/api/users/1/role`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      data: { role: 'user' },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('No puedes cambiar tu propio rol');
  });

  test('7. PATCH role without token returns 401', async ({ request }) => {
    const res = await request.patch(`${API_URL}/api/users/3/role`, {
      headers: { 'Content-Type': 'application/json' },
      data: { role: 'organizer' },
    });
    expect(res.status()).toBe(401);
  });

  test('8. PATCH role of non-existent user returns 404', async ({ request }) => {
    const res = await request.patch(`${API_URL}/api/users/99999/role`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      data: { role: 'organizer' },
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toContain('Usuario no encontrado');
  });

  test('9. Non-admin user cannot access user list', async ({ request }) => {
    // Login as regular user
    const loginRes = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: 'user@example.com', password: 'user123' },
    });
    expect(loginRes.ok()).toBeTruthy();
    const loginBody = await loginRes.json();
    const userToken = loginBody.data.token;

    const res = await request.get(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status()).toBe(403);
  });

  test('10. Full role change round-trip: user -> organizer -> user', async ({ request }) => {
    // Find a non-admin user to modify
    const listRes = await request.get(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listBody = await listRes.json();
    const targetUser = listBody.data.find((u: any) => u.role === 'user' && u.id !== 1);
    if (!targetUser) {
      test.skip(true, 'No se encontró un usuario no-admin para modificar');
      return;
    }

    // Change to organizer
    const promoteRes = await request.patch(`${API_URL}/api/users/${targetUser.id}/role`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      data: { role: 'organizer' },
    });
    expect(promoteRes.ok()).toBeTruthy();
    const promoteBody = await promoteRes.json();
    expect(promoteBody.data.role).toBe('organizer');

    // Verify the change persisted
    const verifyRes = await request.get(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const verifyBody = await verifyRes.json();
    const updatedUser = verifyBody.data.find((u: any) => u.id === targetUser.id);
    expect(updatedUser.role).toBe('organizer');

    // Change back to user
    const demoteRes = await request.patch(`${API_URL}/api/users/${targetUser.id}/role`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      data: { role: 'user' },
    });
    expect(demoteRes.ok()).toBeTruthy();
    const demoteBody = await demoteRes.json();
    expect(demoteBody.data.role).toBe('user');
  });
});
