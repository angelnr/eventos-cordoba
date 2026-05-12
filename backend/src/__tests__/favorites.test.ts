/// <reference types="jest" />

import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret-with-at-least-32-chars!!';
process.env.JWT_SECRET = JWT_SECRET;

const mockFavFindMany = jest.fn();
const mockFavFindUnique = jest.fn();
const mockFavCreate = jest.fn();
const mockFavDeleteMany = jest.fn();
const mockFavCount = jest.fn();
const mockEventFindUnique = jest.fn();

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return { ...actual, PrismaClient: jest.fn(() => ({
    favorite: {
      findMany: mockFavFindMany,
      findUnique: mockFavFindUnique,
      create: mockFavCreate,
      deleteMany: mockFavDeleteMany,
      count: mockFavCount,
    },
    event: { findUnique: mockEventFindUnique },
    $disconnect: jest.fn(),
  })) };
});

jest.mock('express-rate-limit', () => jest.fn(() => (req: any, res: any, next: any) => next()));

import favoritesRoutes from '../routes/favorites';

const app = express();
app.use(express.json());
app.use('/api/favorites', favoritesRoutes);

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

function userToken(id: number = 1): string {
  return jwt.sign({ id, email: `u${id}@t.com`, role: 'user' }, JWT_SECRET);
}

beforeEach(() => {
  mockFavFindMany.mockReset();
  mockFavFindUnique.mockReset();
  mockFavCreate.mockReset();
  mockFavDeleteMany.mockReset();
  mockFavCount.mockReset();
  mockEventFindUnique.mockReset();
});

describe('GET /api/favorites/check', () => {
  it('debe retornar 400 si no se envía eventIds', async () => {
    const { status, body } = await makeRequest('GET', '/api/favorites/check', undefined, userToken());
    expect(status).toBe(400);
    expect(body.error).toBe('eventIds es requerido');
  });

  it('debe retornar 400 si eventIds vacío (sin IDs válidos)', async () => {
    const { status } = await makeRequest('GET', '/api/favorites/check?eventIds=abc', undefined, userToken());
    expect(status).toBe(400);
  });

  it('debe retornar 400 si hay más de 50 IDs', async () => {
    const ids = Array.from({ length: 51 }, (_, i) => i + 1).join(',');
    const { status } = await makeRequest('GET', `/api/favorites/check?eventIds=${ids}`, undefined, userToken());
    expect(status).toBe(400);
  });

  it('debe retornar mapa de booleanos', async () => {
    mockFavFindMany.mockResolvedValue([{ eventId: 1 }]);
    const { status, body } = await makeRequest('GET', '/api/favorites/check?eventIds=1,2,3', undefined, userToken());
    expect(status).toBe(200);
    expect(body.data).toEqual({ 1: true, 2: false, 3: false });
  });
});

describe('GET /api/favorites', () => {
  it('debe listar favoritos paginados', async () => {
    mockFavFindMany.mockResolvedValue([{ id: 1, userId: 1, eventId: 5, createdAt: new Date(), event: { id: 5, title: 'Evento', organizer: { id: 20, name: 'Org', email: 'org@t.com' }, category: { id: 1, name: 'Música', color: '#000' } } }]);
    mockFavCount.mockResolvedValue(1);
    const { status, body } = await makeRequest('GET', '/api/favorites', undefined, userToken());
    expect(status).toBe(200);
    expect(body.data.length).toBe(1);
    expect(body.pagination.total).toBe(1);
  });
});

describe('POST /api/favorites', () => {
  it('debe retornar 400 si falta eventId', async () => {
    const { status } = await makeRequest('POST', '/api/favorites', {}, userToken());
    expect(status).toBe(400);
  });

  it('debe retornar 404 si evento no existe', async () => {
    mockEventFindUnique.mockResolvedValue(null);
    const { status, body } = await makeRequest('POST', '/api/favorites', { eventId: 999 }, userToken());
    expect(status).toBe(404);
    expect(body.error).toBe('El evento no existe o no está disponible');
  });

  it('debe retornar 201 si se crea favorito', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 5, status: 'SCHEDULED' });
    mockFavCreate.mockResolvedValue({ userId: 1, eventId: 5 });
    const { status, body } = await makeRequest('POST', '/api/favorites', { eventId: 5 }, userToken());
    expect(status).toBe(201);
    expect(body.success).toBe(true);
  });

  it('debe devolver 200 si ya existe (P2002)', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 5, status: 'SCHEDULED' });
    mockFavCreate.mockRejectedValue({ code: 'P2002' });
    mockFavFindUnique.mockResolvedValue({ userId: 1, eventId: 5 });
    const { status, body } = await makeRequest('POST', '/api/favorites', { eventId: 5 }, userToken());
    expect(status).toBe(200);
    expect(body.message).toContain('ya está');
  });
});

describe('DELETE /api/favorites/:eventId', () => {
  it('debe retornar 400 si eventId inválido', async () => {
    const { status } = await makeRequest('DELETE', '/api/favorites/abc', undefined, userToken());
    expect(status).toBe(400);
  });

  it('debe eliminar favorito usando deleteMany (idempotente)', async () => {
    mockFavDeleteMany.mockResolvedValue({ count: 1 });
    const { status, body } = await makeRequest('DELETE', '/api/favorites/5', undefined, userToken());
    expect(status).toBe(200);
    expect(body.message).toBe('Evento eliminado de favoritos');
    expect(mockFavDeleteMany).toHaveBeenCalledWith({
      where: { userId: 1, eventId: 5 },
    });
  });
});
