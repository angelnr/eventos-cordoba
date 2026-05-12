/// <reference types="jest" />

import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret-with-at-least-32-chars!!';
process.env.JWT_SECRET = JWT_SECRET;

const mockTxEventFindUnique = jest.fn();
const mockTxBookingFindFirst = jest.fn();
const mockTxBookingCreate = jest.fn();
const mockTxEventUpdate = jest.fn();
const mockTxStatusLogCreate = jest.fn();
const mockTxBookingUpdate = jest.fn();
const mockTxTicketFindUnique = jest.fn();
const mockTxTicketUpdate = jest.fn();
const mockTxAuditLogCreate = jest.fn();
const mockBookingFindUnique = jest.fn();
const mockEventFindUnique = jest.fn();
const mockBookingFindMany = jest.fn();
const mockNotifCreate = jest.fn();
const mockGenerateTicket = jest.fn();
const mockInvalidateDash = jest.fn();

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return {
    ...actual,
    PrismaClient: jest.fn(() => ({
      booking: {
        findUnique: mockBookingFindUnique,
        findMany: mockBookingFindMany,
      },
      event: {
        findUnique: mockEventFindUnique,
      },
      $transaction: jest.fn((cb: Function, _opts?: any) =>
        cb({
          event: {
            findUnique: mockTxEventFindUnique,
            update: mockTxEventUpdate,
          },
          booking: {
            findFirst: mockTxBookingFindFirst,
            create: mockTxBookingCreate,
            update: mockTxBookingUpdate,
            findUnique: jest.fn(),
          },
          eventStatusLog: {
            create: mockTxStatusLogCreate,
          },
          ticket: {
            findUnique: mockTxTicketFindUnique,
            update: mockTxTicketUpdate,
          },
          ticketAuditLog: {
            create: mockTxAuditLogCreate,
          },
          $queryRaw: jest.fn(),
        })
      ),
      $disconnect: jest.fn(),
    })),
  };
});

jest.mock('express-rate-limit', () => {
  return jest.fn(() => (req: any, res: any, next: any) => next());
});

jest.mock('../services/notificationService', () => ({
  createNotification: (...args: any[]) => mockNotifCreate(...args),
}));

jest.mock('../services/ticketService', () => ({
  generateTicketForBooking: (...args: any[]) => mockGenerateTicket(...args),
}));

jest.mock('../services/dashboardService', () => ({
  invalidateDashboardCache: (...args: any[]) => mockInvalidateDash(...args),
}));

import bookingsRoutes from '../routes/bookings';

const app = express();
app.use(express.json());
app.use('/api/bookings', bookingsRoutes);

function makeRequest(
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = (server.address() as any).port;
      const postData = body ? JSON.stringify(body) : undefined;

      const options: http.RequestOptions = {
        hostname: 'localhost',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData).toString() } : {}),
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        res.on('end', () => {
          server.close();
          try {
            resolve({ status: res.statusCode || 500, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode || 500, body: data });
          }
        });
      });

      req.on('error', (err) => {
        server.close();
        reject(err);
      });

      if (postData) req.write(postData);
      req.end();
    });
  });
}

function userToken(id: number = 10, role: string = 'user'): string {
  return jwt.sign({ id, email: `user${id}@test.com`, role }, JWT_SECRET);
}

const defaultEvent = {
  id: 5,
  price: 0,
  capacity: 100,
  currentBookings: 5,
  organizerId: 20,
  status: 'SCHEDULED',
};

beforeEach(() => {
  mockTxEventFindUnique.mockReset();
  mockTxBookingFindFirst.mockReset();
  mockTxBookingCreate.mockReset();
  mockTxEventUpdate.mockReset();
  mockTxStatusLogCreate.mockReset();
  mockTxBookingUpdate.mockReset();
  mockTxTicketFindUnique.mockReset();
  mockTxTicketUpdate.mockReset();
  mockTxAuditLogCreate.mockReset();
  mockBookingFindUnique.mockReset();
  mockEventFindUnique.mockReset();
  mockBookingFindMany.mockReset();
  mockNotifCreate.mockReset();
  mockGenerateTicket.mockReset();
  mockInvalidateDash.mockReset();
});

describe('POST /api/bookings', () => {
  it('debe retornar 401 sin token', async () => {
    const { status, body } = await makeRequest('POST', '/api/bookings', { eventId: 5 });

    expect(status).toBe(401);
  });

  it('debe retornar 400 si falta eventId', async () => {
    const { status, body } = await makeRequest('POST', '/api/bookings', { quantity: 1 }, userToken());

    expect(status).toBe(400);
    expect(body.error).toBe('eventId es requerido');
  });

  it('debe retornar 400 si eventId no es número', async () => {
    const { status, body } = await makeRequest('POST', '/api/bookings', { eventId: 'abc' }, userToken());

    expect(status).toBe(400);
    expect(body.error).toBe('eventId inválido');
  });

  it('debe retornar 400 si quantity no es positivo', async () => {
    const { status, body } = await makeRequest('POST', '/api/bookings', { eventId: 5, quantity: 0 }, userToken());

    expect(status).toBe(400);
    expect(body.error).toBe('quantity debe ser un entero positivo');
  });

  it('debe retornar 404 si el evento no existe (transacción)', async () => {
    mockEventFindUnique.mockResolvedValue({ title: 'Test', organizerId: 20 }); // evento existe fuera de tx
    mockTxEventFindUnique.mockResolvedValue(null);

    const { status, body } = await makeRequest('POST', '/api/bookings', { eventId: 999, quantity: 1 }, userToken(10));

    expect(status).toBe(404);
    expect(body.error).toBe('Evento no encontrado');
  });

  it('debe retornar 400 si el evento no está SCHEDULED', async () => {
    mockEventFindUnique.mockResolvedValue({ title: 'Cancelado', organizerId: 20 });
    mockTxEventFindUnique.mockResolvedValue({ ...defaultEvent, status: 'CANCELLED' });

    const { status, body } = await makeRequest('POST', '/api/bookings', { eventId: 5, quantity: 1 }, userToken(10));

    expect(status).toBe(400);
    expect(body.error).toBe('El evento ha sido cancelado');
  });

  it('debe retornar 400 si el usuario es el organizador', async () => {
    mockEventFindUnique.mockResolvedValue({ title: 'Mi Evento', organizerId: 10 });
    mockTxEventFindUnique.mockResolvedValue({ ...defaultEvent, organizerId: 10 });

    const { status, body } = await makeRequest('POST', '/api/bookings', { eventId: 5, quantity: 1 }, userToken(10));

    expect(status).toBe(400);
    expect(body.error).toBe('No puedes reservar tu propio evento');
  });

  it('debe retornar 400 si ya existe una reserva confirmada', async () => {
    mockEventFindUnique.mockResolvedValue({ title: 'Evento', organizerId: 20 });
    mockTxEventFindUnique.mockResolvedValue(defaultEvent);
    mockTxBookingFindFirst.mockResolvedValue({ id: 1 });

    const { status, body } = await makeRequest('POST', '/api/bookings', { eventId: 5, quantity: 1 }, userToken(10));

    expect(status).toBe(400);
    expect(body.error).toBe('Ya tienes una reserva confirmada para este evento');
  });

  it('debe retornar 400 si no hay suficientes plazas', async () => {
    mockEventFindUnique.mockResolvedValue({ title: 'Evento', organizerId: 20 });
    mockTxEventFindUnique.mockResolvedValue({ ...defaultEvent, capacity: 10, currentBookings: 9 });
    mockTxBookingFindFirst.mockResolvedValue(null);

    const { status, body } = await makeRequest('POST', '/api/bookings', { eventId: 5, quantity: 3 }, userToken(10));

    expect(status).toBe(400);
    expect(body.error).toBe('No hay suficientes plazas disponibles');
  });

  it('debe crear reserva y actualizar currentBookings', async () => {
    mockEventFindUnique.mockResolvedValue({ title: 'Evento', organizerId: 20 });
    mockTxEventFindUnique.mockResolvedValue(defaultEvent);
    mockTxBookingFindFirst.mockResolvedValue(null);
    mockTxBookingCreate.mockResolvedValue({ id: 100, status: 'confirmed', quantity: 1, totalPrice: 0 });
    mockTxEventUpdate.mockResolvedValue({});
    mockNotifCreate.mockResolvedValue({});
    mockGenerateTicket.mockResolvedValue({});

    const { status, body } = await makeRequest('POST', '/api/bookings', { eventId: 5, quantity: 1 }, userToken(10));

    expect(status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(100);
    expect(mockTxEventUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 5 },
        data: { currentBookings: { increment: 1 } },
      })
    );
    expect(mockNotifCreate).toHaveBeenCalled();
    expect(mockGenerateTicket).toHaveBeenCalledWith(100, 10);
  });

  it('debe transicionar automáticamente a FULL si se completa aforo', async () => {
    mockEventFindUnique.mockResolvedValue({ title: 'Evento', organizerId: 20 });
    mockTxEventFindUnique.mockResolvedValue({ ...defaultEvent, capacity: 10, currentBookings: 9 });
    mockTxBookingFindFirst.mockResolvedValue(null);
    mockTxBookingCreate.mockResolvedValue({ id: 101, status: 'confirmed', quantity: 1, totalPrice: 0 });
    mockNotifCreate.mockResolvedValue({});
    mockGenerateTicket.mockResolvedValue({});

    const { status } = await makeRequest('POST', '/api/bookings', { eventId: 5, quantity: 1 }, userToken(10));

    expect(status).toBe(201);
    // Debe haber actualizado a FULL y creado log de estado
    const statusUpdates = mockTxEventUpdate.mock.calls;
    const fullUpdate = statusUpdates.find((call: any) => call[0].data && call[0].data.status === 'FULL');
    expect(fullUpdate).toBeDefined();
    expect(mockTxStatusLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fromStatus: 'SCHEDULED',
          toStatus: 'FULL',
        }),
      })
    );
  });

  it('debe llamar a invalidateDashboardCache del organizador', async () => {
    mockEventFindUnique.mockResolvedValue({ title: 'Evento', organizerId: 20 });
    mockTxEventFindUnique.mockResolvedValue(defaultEvent);
    mockTxBookingFindFirst.mockResolvedValue(null);
    mockTxBookingCreate.mockResolvedValue({ id: 102, status: 'confirmed', quantity: 1, totalPrice: 0 });
    mockTxEventUpdate.mockResolvedValue({});
    mockNotifCreate.mockResolvedValue({});
    mockGenerateTicket.mockResolvedValue({});

    await makeRequest('POST', '/api/bookings', { eventId: 5, quantity: 1 }, userToken(10));

    expect(mockInvalidateDash).toHaveBeenCalledWith(20);
  });
});

describe('GET /api/bookings', () => {
  it('debe retornar 401 sin token', async () => {
    const { status } = await makeRequest('GET', '/api/bookings');

    expect(status).toBe(401);
  });

  it('debe retornar reservas del usuario', async () => {
    const mockBookings = [
      { id: 1, status: 'confirmed', quantity: 1, Event: { title: 'Evento', organizer: { id: 20 }, category: { id: 1 } } },
    ];
    mockBookingFindMany.mockResolvedValue(mockBookings);

    const { status, body } = await makeRequest('GET', '/api/bookings', undefined, userToken(10));

    expect(status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it('debe filtrar por status si se proporciona', async () => {
    mockBookingFindMany.mockResolvedValue([]);

    await makeRequest('GET', '/api/bookings?status=confirmed', undefined, userToken(10));

    expect(mockBookingFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 10, status: 'confirmed' }),
      })
    );
  });

  it('debe excluir cancelled por defecto', async () => {
    mockBookingFindMany.mockResolvedValue([]);

    await makeRequest('GET', '/api/bookings', undefined, userToken(10));

    expect(mockBookingFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 10, status: { not: 'cancelled' } }),
      })
    );
  });
});

describe('DELETE /api/bookings/:id', () => {
  it('debe retornar 401 sin token', async () => {
    const { status } = await makeRequest('DELETE', '/api/bookings/1');

    expect(status).toBe(401);
  });

  it('debe retornar 400 si ID inválido', async () => {
    const { status, body } = await makeRequest('DELETE', '/api/bookings/abc', {}, userToken(10));

    expect(status).toBe(400);
    expect(body.error).toBe('ID de reserva inválido');
  });

  it('debe retornar 404 si la reserva no existe', async () => {
    mockBookingFindUnique.mockResolvedValue(null);

    const { status, body } = await makeRequest('DELETE', '/api/bookings/999', {}, userToken(10));

    expect(status).toBe(404);
    expect(body.error).toBe('Reserva no encontrada');
  });

  it('debe retornar 403 si la reserva no pertenece al usuario', async () => {
    mockBookingFindUnique.mockResolvedValue({ id: 1, userId: 999, quantity: 1, eventId: 5 });

    const { status, body } = await makeRequest('DELETE', '/api/bookings/1', {}, userToken(10));

    expect(status).toBe(403);
    expect(body.error).toBe('No tienes permisos para cancelar esta reserva');
  });

  it('debe cancelar reserva (soft delete), decrementar y transicionar FULL->SCHEDULED', async () => {
    mockBookingFindUnique.mockResolvedValue({ id: 1, userId: 10, quantity: 1, eventId: 5 });
    mockEventFindUnique.mockResolvedValue({ title: 'Evento' }); // para obtener título
    mockTxEventFindUnique.mockResolvedValue({ id: 5, currentBookings: 10, status: 'FULL' });
    mockTxBookingUpdate.mockResolvedValue({});
    mockTxEventUpdate.mockResolvedValue({});
    mockNotifCreate.mockResolvedValue({});

    const { status, body } = await makeRequest('DELETE', '/api/bookings/1', {}, userToken(10));

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    // Soft delete
    expect(mockTxBookingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ status: 'cancelled' }),
      })
    );
    // Decrementar
    expect(mockTxEventUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 5 },
        data: { currentBookings: { decrement: 1 } },
      })
    );
    // Transición FULL -> SCHEDULED
    const statusLogCall = mockTxStatusLogCreate.mock.calls.find(
      (call: any) => call[0].data && call[0].data.toStatus === 'SCHEDULED'
    );
    expect(statusLogCall).toBeDefined();
    expect(mockNotifCreate).toHaveBeenCalled();
  });

  it('debe invalidar ticket asociado si existe y es válido', async () => {
    mockBookingFindUnique.mockResolvedValue({ id: 1, userId: 10, quantity: 1, eventId: 5 });
    mockEventFindUnique.mockResolvedValue({ title: 'Evento' });
    mockTxEventFindUnique.mockResolvedValue({ id: 5, currentBookings: 5, status: 'SCHEDULED' });
    mockTxTicketFindUnique.mockResolvedValue({ id: 50, status: 'valid' });
    mockTxBookingUpdate.mockResolvedValue({});
    mockTxEventUpdate.mockResolvedValue({});
    mockNotifCreate.mockResolvedValue({});

    await makeRequest('DELETE', '/api/bookings/1', {}, userToken(10));

    expect(mockTxTicketUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 50 },
        data: expect.objectContaining({ status: 'invalidated' }),
      })
    );
    expect(mockTxAuditLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'TICKET_INVALIDATED' }),
      })
    );
  });
});
