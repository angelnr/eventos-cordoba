/// <reference types="jest" />

import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret-with-at-least-32-chars!!';
process.env.JWT_SECRET = JWT_SECRET;

const mockNotifFindMany = jest.fn();
const mockNotifCount = jest.fn();
const mockNotifFindUnique = jest.fn();
const mockNotifUpdate = jest.fn();
const mockNotifUpdateMany = jest.fn();
const mockNotifDeleteMany = jest.fn();
const mockEventFindUnique = jest.fn();
const mockCreateEventNotifs = jest.fn();

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return { ...actual, PrismaClient: jest.fn(() => ({
    notification: {
      findMany: mockNotifFindMany,
      count: mockNotifCount,
      findUnique: mockNotifFindUnique,
      update: mockNotifUpdate,
      updateMany: mockNotifUpdateMany,
      deleteMany: mockNotifDeleteMany,
    },
    event: { findUnique: mockEventFindUnique },
    $disconnect: jest.fn(),
  })) };
});

jest.mock('../services/notificationService', () => ({
  createNotification: jest.fn(),
  createEventNotifications: (...args: any[]) => mockCreateEventNotifs(...args),
  VALID_TYPES: ['EVENT_CANCELLED', 'EVENT_DATE_CHANGED', 'EVENT_REMINDER', 'ORGANIZER_ANNOUNCEMENT', 'BOOKING_CONFIRMED'],
}));

import notificationsRoutes from '../routes/notifications';

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationsRoutes);

function makeRequest(method: string, path: string, body?: any, token?: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = (server.address() as any).port;
      const postData = body ? JSON.stringify(body) : undefined;
      const req = http.request({
        hostname: 'localhost', port, path, method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData).toString() } : {}),
        },
      }, (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        res.on('end', () => {
          server.close();
          try { resolve({ status: res.statusCode || 500, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode || 500, body: data }); }
        });
      });
      req.on('error', (err) => { server.close(); reject(err); });
      if (postData) req.write(postData);
      req.end();
    });
  });
}

function tokenFor(role: string = 'user', id: number = 1): string {
  return jwt.sign({ id, email: `u${id}@t.com`, role }, JWT_SECRET);
}

beforeEach(() => {
  [mockNotifFindMany, mockNotifCount, mockNotifFindUnique, mockNotifUpdate, mockNotifUpdateMany, mockNotifDeleteMany,
   mockEventFindUnique, mockCreateEventNotifs].forEach(m => m.mockReset());
});

describe('GET /api/notifications', () => {
  it('debe retornar 401 sin token', async () => {
    const { status } = await makeRequest('GET', '/api/notifications');
    expect(status).toBe(401);
  });

  it('debe listar notificaciones paginadas con unreadCount', async () => {
    mockNotifFindMany.mockResolvedValue([{ id: 1, type: 'BOOKING_CONFIRMED', isRead: false }]);
    mockNotifCount.mockResolvedValueOnce(1).mockResolvedValueOnce(1);

    const { status, body } = await makeRequest('GET', '/api/notifications', undefined, tokenFor());
    expect(status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.unreadCount).toBe(1);
  });

  it('debe filtrar unreadOnly', async () => {
    mockNotifFindMany.mockResolvedValue([]);
    mockNotifCount.mockResolvedValue(0);

    await makeRequest('GET', '/api/notifications?unreadOnly=true', undefined, tokenFor());

    expect(mockNotifFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 1, isRead: false }),
      })
    );
  });

  it('debe retornar 400 si type inválido', async () => {
    const { status, body } = await makeRequest('GET', '/api/notifications?type=INVALID_TYPE', undefined, tokenFor());
    expect(status).toBe(400);
    expect(body.error).toContain('Tipo de notificación inválido');
  });
});

describe('GET /api/notifications/unread-count', () => {
  it('debe retornar el conteo', async () => {
    mockNotifCount.mockResolvedValue(5);

    const { status, body } = await makeRequest('GET', '/api/notifications/unread-count', undefined, tokenFor());
    expect(status).toBe(200);
    expect(body.data.unreadCount).toBe(5);
  });
});

describe('PATCH /api/notifications/:id/read', () => {
  it('debe retornar 400 si ID inválido', async () => {
    const { status, body } = await makeRequest('PATCH', '/api/notifications/abc/read', {}, tokenFor());
    expect(status).toBe(400);
  });

  it('debe retornar 404 si no existe o no pertenece al usuario', async () => {
    mockNotifFindUnique.mockResolvedValue(null);
    const { status, body } = await makeRequest('PATCH', '/api/notifications/1/read', {}, tokenFor());
    expect(status).toBe(404);
  });

  it('debe marcar como leída', async () => {
    mockNotifFindUnique.mockResolvedValue({ id: 1, userId: 1 });
    mockNotifUpdate.mockResolvedValue({ id: 1, isRead: true });
    const { status, body } = await makeRequest('PATCH', '/api/notifications/1/read', {}, tokenFor());
    expect(status).toBe(200);
    expect(mockNotifUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 }, data: { isRead: true } })
    );
  });
});

describe('PATCH /api/notifications/mark-all-read', () => {
  it('debe marcar todas como leídas', async () => {
    mockNotifUpdateMany.mockResolvedValue({ count: 3 });
    const { status, body } = await makeRequest('PATCH', '/api/notifications/mark-all-read', {}, tokenFor());
    expect(status).toBe(200);
    expect(body.data.updatedCount).toBe(3);
  });
});

describe('DELETE /api/notifications/read-all', () => {
  it('debe eliminar notificaciones leídas', async () => {
    mockNotifDeleteMany.mockResolvedValue({ count: 5 });
    const { status, body } = await makeRequest('DELETE', '/api/notifications/read-all', undefined, tokenFor());
    expect(status).toBe(200);
    expect(body.data.deletedCount).toBe(5);
  });
});

describe('DELETE /api/notifications/:id', () => {
  it('debe retornar 404 si no existe', async () => {
    mockNotifDeleteMany.mockResolvedValue({ count: 0 });
    const { status, body } = await makeRequest('DELETE', '/api/notifications/999', undefined, tokenFor());
    expect(status).toBe(404);
  });

  it('debe eliminar notificación', async () => {
    mockNotifDeleteMany.mockResolvedValue({ count: 1 });
    const { status, body } = await makeRequest('DELETE', '/api/notifications/1', undefined, tokenFor());
    expect(status).toBe(200);
  });
});

describe('POST /api/notifications', () => {
  const orgToken = tokenFor('organizer', 10);

  it('debe retornar 400 si type no es ORGANIZER_ANNOUNCEMENT', async () => {
    const { status, body } = await makeRequest('POST', '/api/notifications', {
      eventId: 5, type: 'BOOKING_CONFIRMED', title: 'X', message: 'Y',
    }, orgToken);
    expect(status).toBe(400);
  });

  it('debe retornar 400 si falta eventId', async () => {
    const { status } = await makeRequest('POST', '/api/notifications', {
      type: 'ORGANIZER_ANNOUNCEMENT', title: 'X', message: 'Y',
    }, orgToken);
    expect(status).toBe(400);
  });

  it('debe retornar 404 si evento no existe', async () => {
    mockEventFindUnique.mockResolvedValue(null);
    const { status } = await makeRequest('POST', '/api/notifications', {
      eventId: 999, type: 'ORGANIZER_ANNOUNCEMENT', title: 'X', message: 'Y',
    }, orgToken);
    expect(status).toBe(404);
  });

  it('debe retornar 403 si no es organizador del evento', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 5, organizerId: 99, title: 'E' });
    const { status, body } = await makeRequest('POST', '/api/notifications', {
      eventId: 5, type: 'ORGANIZER_ANNOUNCEMENT', title: 'X', message: 'Y',
    }, orgToken);
    expect(status).toBe(403);
  });

  it('debe crear notificaciones', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 5, organizerId: 10, title: 'Evento' });
    mockCreateEventNotifs.mockResolvedValue({ recipientCount: 3 });
    const { status, body } = await makeRequest('POST', '/api/notifications', {
      eventId: 5, type: 'ORGANIZER_ANNOUNCEMENT', title: 'Anuncio', message: 'Importante',
    }, orgToken);
    expect(status).toBe(201);
    expect(body.data.recipientCount).toBe(3);
  });
});
