import { test, expect } from '@playwright/test';

const API_URL = process.env.E2E_API_URL || 'http://localhost:3001';

let createdEventId: number;
let ticketToken: string;
let userEmail: string;

test.describe('Sistema de Entradas QR - Flujo E2E', () => {

  test('1. Organizador crea evento + usuario se registra y reserva', async ({ request }) => {
    // 1a. Login as organizer
    const orgLogin = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: 'organizer@example.com', password: 'organizer123' },
    });
    expect(orgLogin.ok()).toBeTruthy();
    const orgToken = (await orgLogin.json()).data.token;

    // 1b. Create event
    const createEvent = await request.post(`${API_URL}/api/events`, {
      headers: { Authorization: `Bearer ${orgToken}` },
      data: {
        title: `Evento E2E Test ${Date.now()}`,
        description: 'Test automatizado',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'Córdoba, España',
        capacity: 100,
        price: 0,
        categoryId: 1,
      },
    });
    expect(createEvent.ok()).toBeTruthy();
    createdEventId = (await createEvent.json()).data.id;
    expect(createdEventId).toBeGreaterThan(0);
    console.log(`✅ Evento creado ID: ${createdEventId}`);

    // 1c. Register new user
    userEmail = `e2e_${Date.now()}@test.com`;
    const registerRes = await request.post(`${API_URL}/api/auth/register`, {
      data: { email: userEmail, password: 'Test123456', name: 'Usuario E2E' },
    });
    expect(registerRes.ok()).toBeTruthy();
    const userToken = (await registerRes.json()).data.token;
    expect(userToken).toBeDefined();
    console.log(`✅ Usuario registrado: ${userEmail}`);

    // 1d. Book the event
    const bookingRes = await request.post(`${API_URL}/api/bookings`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { eventId: createdEventId, quantity: 1 },
    });
    expect(bookingRes.ok()).toBeTruthy();
    console.log('✅ Reserva creada');
  });

  test('2. Ticket se genera automáticamente', async ({ request }) => {
    // Login as user to get their tickets
    const userLogin = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: userEmail, password: 'Test123456' },
    });
    expect(userLogin.ok()).toBeTruthy();
    const userToken = (await userLogin.json()).data.token;

    const ticketsRes = await request.get(`${API_URL}/api/tickets/my-tickets`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const ticketsData = await ticketsRes.json();
    expect(ticketsData.success).toBeTruthy();
    expect(ticketsData.data.length).toBeGreaterThan(0);
    ticketToken = ticketsData.data[0].token;
    expect(ticketToken).toBeTruthy();
    console.log(`✅ Ticket generado: ${ticketToken.substring(0, 15)}...`);
  });

  test('3. QR image se genera correctamente', async ({ request }) => {
    const userLogin = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: userEmail, password: 'Test123456' },
    });
    const userToken = (await userLogin.json()).data.token;

    const qrRes = await request.get(`${API_URL}/api/tickets/qr/${ticketToken}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(qrRes.status()).toBe(200);
    const contentType = qrRes.headers()['content-type'] || '';
    expect(contentType).toContain('image/png');
    console.log('✅ QR image generada (PNG)');
  });

  test('4. Staff valida ticket - primera vez', async ({ request }) => {
    const staffLogin = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: 'staff@example.com', password: 'staff123' },
    });
    const staffToken = (await staffLogin.json()).data.token;

    const validateRes = await request.post(`${API_URL}/api/tickets/validate`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      data: { token: ticketToken },
    });
    const validateBody = await validateRes.json();
    expect(validateBody.action).toBe('validated');
    console.log('✅ Primera validación: validated');
  });

  test('5. Re-validación bloqueada (already_used)', async ({ request }) => {
    const staffLogin = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: 'staff@example.com', password: 'staff123' },
    });
    const staffToken = (await staffLogin.json()).data.token;

    const validateRes = await request.post(`${API_URL}/api/tickets/validate`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
      data: { token: ticketToken },
    });
    const validateBody = await validateRes.json();
    expect(validateBody.action).toBe('already_used');
    console.log('✅ Re-validación: already_used (anti-fraude)');
  });

  test('6. Verify público sin auth (solo evento)', async ({ request }) => {
    const publicRes = await request.get(`${API_URL}/api/tickets/verify/${ticketToken}`);
    expect(publicRes.status()).toBe(200);
    const publicBody = await publicRes.json();
    expect(publicBody.success).toBeTruthy();
    expect(publicBody.data.status).toBe('used');
    expect(publicBody.data.event).toBeDefined();
    expect(publicBody.data.event.title).toContain('Evento E2E Test');
    expect(publicBody.data.user).toBeUndefined();
    console.log('✅ Verify público: OK (sin datos personales)');
  });

  test('7. UUID inválido retorna 404', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/tickets/verify/not-a-uuid`);
    expect(res.status()).toBe(404);
    console.log('✅ UUID inválido → 404');
  });

  test('8. Auth: 401 sin token, 403 sin permisos staff', async ({ request }) => {
    // No auth
    const noAuth = await request.post(`${API_URL}/api/tickets/validate`, {
      data: { token: '00000000-0000-0000-0000-000000000000' },
    });
    expect(noAuth.status()).toBe(401);

    // User without staff role
    const userLogin = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: userEmail, password: 'Test123456' },
    });
    const userToken = (await userLogin.json()).data.token;
    const userValidate = await request.post(`${API_URL}/api/tickets/validate`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { token: '00000000-0000-0000-0000-000000000000' },
    });
    expect(userValidate.status()).toBe(403);
    console.log('✅ Auth checks OK: 401/403');
  });

  test('9. Stats del evento y asistentes', async ({ request }) => {
    const adminLogin = await request.post(`${API_URL}/api/auth/login`, {
      data: { email: 'admin@example.com', password: 'admin123' },
    });
    const adminToken = (await adminLogin.json()).data.token;

    // Stats
    const statsRes = await request.get(`${API_URL}/api/tickets/event/${createdEventId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsBody = await statsRes.json();
    expect(statsBody.success).toBeTruthy();
    expect(statsBody.data.stats.total).toBeGreaterThan(0);
    expect(statsBody.data.stats.used).toBeGreaterThan(0);
    console.log(`✅ Stats: total=${statsBody.data.stats.total}, used=${statsBody.data.stats.used}`);

    // Asistentes
    const attendeesRes = await request.get(`${API_URL}/api/tickets/event/${createdEventId}/attendees`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const attendeesBody = await attendeesRes.json();
    expect(attendeesBody.success).toBeTruthy();
    expect(attendeesBody.data.attendees.length).toBeGreaterThan(0);
    expect(attendeesBody.data.attendees[0].user).toBeDefined();
    expect(attendeesBody.data.attendees[0].validatedBy).toBeDefined();
    console.log(`✅ Asistentes: ${attendeesBody.data.attendees.length}`);

    // Auditoría
    const auditRes = await request.get(`${API_URL}/api/tickets/${attendeesBody.data.attendees[0].ticketId}/audit`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const auditBody = await auditRes.json();
    expect(auditBody.data.length).toBeGreaterThanOrEqual(2);
    const actions = auditBody.data.map((l: any) => l.action);
    expect(actions).toContain('TICKET_CREATED');
    expect(actions).toContain('TICKET_VALIDATED');
    console.log(`✅ Auditoría: ${auditBody.data.length} eventos (${actions.join(', ')})`);

    // Cleanup: delete test event
    await request.delete(`${API_URL}/api/events/${createdEventId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✅ Evento de test eliminado');
  });
});
