/// <reference types="jest" />

import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret-with-at-least-32-chars!!';
process.env.JWT_SECRET = JWT_SECRET;

const mockReviewFindUnique = jest.fn();
const mockReviewFindMany = jest.fn();
const mockReviewCreate = jest.fn();
const mockReviewUpdate = jest.fn();
const mockReviewDelete = jest.fn();
const mockReviewCount = jest.fn();
const mockReviewGroupBy = jest.fn();
const mockEventFindUnique = jest.fn();
const mockEventUpdate = jest.fn();
const mockTx = jest.fn();

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return { ...actual, PrismaClient: jest.fn(() => ({
    review: {
      findUnique: mockReviewFindUnique,
      findMany: mockReviewFindMany,
      create: mockReviewCreate,
      update: mockReviewUpdate,
      delete: mockReviewDelete,
      count: mockReviewCount,
      groupBy: mockReviewGroupBy,
    },
    event: { findUnique: mockEventFindUnique, update: mockEventUpdate },
    $transaction: jest.fn((queries: any[]) => Promise.all(queries)),
    $disconnect: jest.fn(),
  })) };
});

import reviewsRoutes from '../routes/reviews';

const app = express();
app.use(express.json());
app.use('/api/reviews', reviewsRoutes);

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
  [mockReviewFindUnique, mockReviewFindMany, mockReviewCreate, mockReviewUpdate, mockReviewDelete,
   mockReviewCount, mockReviewGroupBy, mockEventFindUnique, mockEventUpdate].forEach(m => m.mockReset());
});

describe('POST /api/reviews', () => {
  it('debe retornar 400 si falta rating', async () => {
    const { status } = await makeRequest('POST', '/api/reviews', { eventId: 1 }, tokenFor());
    expect(status).toBe(400);
  });

  it('debe retornar 400 si rating no es 1-5', async () => {
    const { status, body } = await makeRequest('POST', '/api/reviews', { eventId: 1, rating: 6 }, tokenFor());
    expect(status).toBe(400);
    expect(body.error).toContain('1 y 5');
  });

  it('debe retornar 400 si evento no existe', async () => {
    mockEventFindUnique.mockResolvedValue(null);
    const { status } = await makeRequest('POST', '/api/reviews', { eventId: 999, rating: 5 }, tokenFor());
    expect(status).toBe(400);
  });

  it('debe retornar 400 si evento no ha finalizado', async () => {
    const futureDate = new Date(Date.now() + 86400000);
    mockEventFindUnique.mockResolvedValue({ id: 1, date: futureDate, organizerId: 10, averageRating: 0, reviewCount: 0 });
    const { status, body } = await makeRequest('POST', '/api/reviews', { eventId: 1, rating: 5 }, tokenFor());
    expect(status).toBe(400);
    expect(body.error).toContain('finalizado');
  });

  it('debe retornar 403 si es el organizador', async () => {
    const pastDate = new Date(Date.now() - 86400000);
    mockEventFindUnique.mockResolvedValue({ id: 1, date: pastDate, organizerId: 1, averageRating: 0, reviewCount: 0 });
    const { status } = await makeRequest('POST', '/api/reviews', { eventId: 1, rating: 5 }, tokenFor());
    expect(status).toBe(403);
  });

  it('debe retornar 201 y crear reseña', async () => {
    const pastDate = new Date(Date.now() - 86400000);
    mockEventFindUnique.mockResolvedValue({ id: 1, date: pastDate, organizerId: 10, averageRating: 4.0, reviewCount: 2 });
    mockReviewCreate.mockResolvedValue({ id: 5, rating: 5, userId: 1, eventId: 1, user: { id: 1, name: 'U', avatar: null } });
    mockEventUpdate.mockResolvedValue({});

    const { status, body } = await makeRequest('POST', '/api/reviews', { eventId: 1, rating: 5 }, tokenFor());
    expect(status).toBe(201);
    expect(body.data.rating).toBe(5);
  });
});

describe('PUT /api/reviews/:id', () => {
  it('debe retornar 404 si reseña no existe', async () => {
    mockReviewFindUnique.mockResolvedValue(null);
    const { status } = await makeRequest('PUT', '/api/reviews/999', { rating: 4 }, tokenFor());
    expect(status).toBe(404);
  });

  it('debe retornar 403 si no es el propietario', async () => {
    mockReviewFindUnique.mockResolvedValue({ id: 1, userId: 99, event: { organizerId: 10, averageRating: 4, reviewCount: 3 } });
    const { status } = await makeRequest('PUT', '/api/reviews/1', { rating: 4 }, tokenFor());
    expect(status).toBe(403);
  });

  it('debe actualizar reseña', async () => {
    mockReviewFindUnique.mockResolvedValue({ id: 1, userId: 1, rating: 3, event: { organizerId: 10, averageRating: 4.0, reviewCount: 3 } });
    mockReviewUpdate.mockResolvedValue({ id: 1, rating: 5, user: { id: 1, name: 'U', avatar: null } });
    mockEventUpdate.mockResolvedValue({});

    const { status, body } = await makeRequest('PUT', '/api/reviews/1', { rating: 5 }, tokenFor());
    expect(status).toBe(200);
    expect(body.data.rating).toBe(5);
  });
});

describe('DELETE /api/reviews/:id', () => {
  it('debe retornar 404 si no existe', async () => {
    mockReviewFindUnique.mockResolvedValue(null);
    const { status } = await makeRequest('DELETE', '/api/reviews/999', undefined, tokenFor());
    expect(status).toBe(404);
  });

  it('debe eliminar reseña y recalcular media', async () => {
    mockReviewFindUnique.mockResolvedValue({ id: 1, userId: 1, rating: 4, event: { organizerId: 10, averageRating: 4.0, reviewCount: 2 } });
    mockReviewDelete.mockResolvedValue({});
    mockEventUpdate.mockResolvedValue({});

    const { status } = await makeRequest('DELETE', '/api/reviews/1', undefined, tokenFor());
    expect(status).toBe(200);
  });
});

describe('GET /api/reviews/events/:eventId', () => {
  it('debe retornar 400 si evento no existe', async () => {
    mockEventFindUnique.mockResolvedValue(null);
    const { status } = await makeRequest('GET', '/api/reviews/events/999');
    expect(status).toBe(400);
  });

  it('debe listar reseñas paginadas', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 1 });
    mockReviewCount.mockResolvedValue(2);
    mockReviewFindMany.mockResolvedValue([
      { id: 1, rating: 5, userId: 2, user: { id: 2, name: 'U2', avatar: null } },
      { id: 2, rating: 4, userId: 3, user: { id: 3, name: 'U3', avatar: null } },
    ]);

    const { status, body } = await makeRequest('GET', '/api/reviews/events/1');
    expect(status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.pagination.total).toBe(2);
  });
});

describe('GET /api/reviews/events/:eventId/my-review', () => {
  it('debe retornar reseña del usuario o null', async () => {
    mockReviewFindUnique.mockResolvedValue(null);
    const { status, body } = await makeRequest('GET', '/api/reviews/events/1/my-review', undefined, tokenFor());
    expect(status).toBe(200);
    expect(body.data).toBeNull();
  });
});

describe('GET /api/reviews/events/:eventId/stats', () => {
  it('debe retornar estadísticas de reseñas', async () => {
    mockEventFindUnique.mockResolvedValue({ averageRating: 4.2, reviewCount: 5 });
    mockReviewGroupBy.mockResolvedValue([
      { rating: 5, _count: { rating: 3 } },
      { rating: 4, _count: { rating: 2 } },
    ]);

    const { status, body } = await makeRequest('GET', '/api/reviews/events/1/stats');
    expect(status).toBe(200);
    expect(body.data.averageRating).toBe(4.2);
    expect(body.data.distribution['5']).toBe(3);
    expect(body.data.distribution['1']).toBe(0);
  });
});
