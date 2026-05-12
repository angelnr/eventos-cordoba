/// <reference types="jest" />

import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret-with-at-least-32-chars!!';
process.env.JWT_SECRET = JWT_SECRET;

const mockCommentFindMany = jest.fn();
const mockCommentFindUnique = jest.fn();
const mockCommentCount = jest.fn();
const mockCommentCreate = jest.fn();
const mockCommentUpdate = jest.fn();
const mockEventFindUnique = jest.fn();

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return { ...actual, PrismaClient: jest.fn(() => ({
    comment: {
      findMany: mockCommentFindMany,
      findUnique: mockCommentFindUnique,
      count: mockCommentCount,
      create: mockCommentCreate,
      update: mockCommentUpdate,
    },
    event: { findUnique: mockEventFindUnique },
    $disconnect: jest.fn(),
  })) };
});

import commentsRoutes from '../routes/comments';

const app = express();
app.use(express.json());
app.use('/api/comments', commentsRoutes);

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
  [mockCommentFindMany, mockCommentFindUnique, mockCommentCount, mockCommentCreate, mockCommentUpdate,
   mockEventFindUnique].forEach(m => m.mockReset());
});

describe('GET /api/comments/events/:id/comments', () => {
  it('debe retornar 404 si evento no existe', async () => {
    mockEventFindUnique.mockResolvedValue(null);
    const { status } = await makeRequest('GET', '/api/comments/events/999/comments');
    expect(status).toBe(404);
  });

  it('debe listar comentarios aprobados para usuario anónimo', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 1, organizerId: 10 });
    mockCommentCount.mockResolvedValue(1);
    mockCommentFindMany.mockResolvedValue([{
      id: 1, content: 'Buen evento', status: 'approved', userId: 5, parentId: null,
      user: { id: 5, name: 'User', avatar: null },
      replies: [],
    }]);

    const { status, body } = await makeRequest('GET', '/api/comments/events/1/comments');
    expect(status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].isOwner).toBe(false);
    expect(body.stats.totalComments).toBe(1);
  });
});

describe('POST /api/comments', () => {
  it('debe retornar 400 si falta contenido', async () => {
    const { status } = await makeRequest('POST', '/api/comments', { eventId: 1 }, tokenFor());
    expect(status).toBe(400);
  });

  it('debe retornar 400 si contenido > 1000 chars', async () => {
    const { status } = await makeRequest('POST', '/api/comments', {
      eventId: 1, content: 'a'.repeat(1001),
    }, tokenFor());
    expect(status).toBe(400);
  });

  it('debe retornar 400 si evento no existe', async () => {
    mockEventFindUnique.mockResolvedValue(null);
    const { status, body } = await makeRequest('POST', '/api/comments', {
      eventId: 999, content: 'Hola',
    }, tokenFor());
    expect(status).toBe(400);
  });

  it('debe retornar 404 si parentId no existe', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 1, organizerId: 10 });
    mockCommentFindUnique.mockResolvedValue(null);
    const { status } = await makeRequest('POST', '/api/comments', {
      eventId: 1, content: 'Respuesta', parentId: 999,
    }, tokenFor());
    expect(status).toBe(404);
  });

  it('debe crear comentario y sanitizar HTML', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 1, organizerId: 10 });
    mockCommentFindMany.mockResolvedValue([]);
    mockCommentFindMany.mockResolvedValue([]);
    mockCommentCount.mockResolvedValue(0);
    mockCommentCreate.mockResolvedValue({
      id: 10, content: '&lt;script&gt;alert(1)&lt;/script&gt;', status: 'approved',
      userId: 1, eventId: 1, parentId: null,
      user: { id: 1, name: 'Yo', avatar: null },
    });

    const { status, body } = await makeRequest('POST', '/api/comments', {
      eventId: 1, content: '<script>alert(1)</script>',
    }, tokenFor());

    expect(status).toBe(201);
    expect(body.data.content).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
});

describe('PUT /api/comments/:id', () => {
  it('debe retornar 404 si comentario no existe', async () => {
    mockCommentFindUnique.mockResolvedValue(null);
    const { status } = await makeRequest('PUT', '/api/comments/999', { content: 'Editado' }, tokenFor());
    expect(status).toBe(404);
  });

  it('debe retornar 403 si no es el propietario', async () => {
    mockCommentFindUnique.mockResolvedValue({ id: 1, userId: 99, createdAt: new Date() });
    const { status } = await makeRequest('PUT', '/api/comments/1', { content: 'Editado' }, tokenFor());
    expect(status).toBe(403);
  });

  it('debe retornar 403 si han pasado más de 15 minutos', async () => {
    const oldDate = new Date(Date.now() - 16 * 60 * 1000);
    mockCommentFindUnique.mockResolvedValue({ id: 1, userId: 1, createdAt: oldDate });
    const { status } = await makeRequest('PUT', '/api/comments/1', { content: 'Editado' }, tokenFor());
    expect(status).toBe(403);
  });

  it('debe actualizar comentario si es propietario y dentro de 15 min', async () => {
    const recentDate = new Date(Date.now() - 1 * 60 * 1000);
    mockCommentFindUnique.mockResolvedValue({ id: 1, userId: 1, createdAt: recentDate });
    mockCommentUpdate.mockResolvedValue({ id: 1, content: 'Editado', userId: 1, user: { id: 1, name: 'Yo', avatar: null } });

    const { status, body } = await makeRequest('PUT', '/api/comments/1', { content: 'Editado' }, tokenFor());
    expect(status).toBe(200);
    expect(mockCommentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 }, data: { content: 'Editado' } })
    );
  });
});

describe('DELETE /api/comments/:id', () => {
  it('debe retornar 404 si no existe', async () => {
    mockCommentFindUnique.mockResolvedValue(null);
    const { status } = await makeRequest('DELETE', '/api/comments/999', undefined, tokenFor());
    expect(status).toBe(404);
  });

  it('debe soft-delete (ocultar contenido)', async () => {
    mockCommentFindUnique.mockResolvedValue({
      id: 1, userId: 1, event: { organizerId: 10 },
    });
    const { status, body } = await makeRequest('DELETE', '/api/comments/1', undefined, tokenFor());
    expect(status).toBe(200);
    expect(mockCommentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({
          content: '[comentario eliminado]',
          status: 'hidden',
        }),
      })
    );
  });
});

describe('PATCH /api/comments/:id/hide', () => {
  it('debe retornar 400 si status inválido', async () => {
    const adminToken = tokenFor('admin');
    const { status } = await makeRequest('PATCH', '/api/comments/1/hide', { status: 'deleted' }, adminToken);
    expect(status).toBe(400);
  });

  it('debe ocultar comentario si es admin', async () => {
    const adminToken = tokenFor('admin');
    mockCommentFindUnique.mockResolvedValue({ id: 1, userId: 5, event: { organizerId: 10 } });
    mockCommentUpdate.mockResolvedValue({ id: 1, status: 'hidden' });

    const { status, body } = await makeRequest('PATCH', '/api/comments/1/hide', { status: 'hidden' }, adminToken);
    expect(status).toBe(200);
    expect(body.message).toContain('ocultado');
  });
});
