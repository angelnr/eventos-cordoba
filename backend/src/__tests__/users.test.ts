/// <reference types="jest" />

import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

const mockUserFindUnique = jest.fn();
const mockUserUpdate = jest.fn();
const mockUserFindMany = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: {
      findUnique: mockUserFindUnique,
      update: mockUserUpdate,
      findMany: mockUserFindMany,
    },
    $disconnect: jest.fn(),
  })),
}));

import userRoutes from '../routes/users';

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

function makeRequest(method: string, path: string, body?: any, token?: string): Promise<{ status: number; body: any }> {
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

function adminToken(): string {
  return jwt.sign({ id: 1, email: 'admin@test.com', role: 'admin' }, JWT_SECRET);
}

function userToken(): string {
  return jwt.sign({ id: 2, email: 'user@test.com', role: 'user' }, JWT_SECRET);
}

describe('PATCH /api/users/:id/role', () => {
  beforeEach(() => {
    mockUserFindUnique.mockReset();
    mockUserUpdate.mockReset();
    mockUserFindMany.mockReset();
  });

  it('debe retornar 400 si el rol es inválido', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 3, email: 'test@test.com', name: 'Test', role: 'user' });

    const { status, body } = await makeRequest('PATCH', '/api/users/3/role', { role: 'superadmin' }, adminToken());

    expect(status).toBe(400);
    expect(body.error).toBe('Rol inválido. Valores permitidos: user, staff, organizer');
  });

  it('debe retornar 400 si no se envía rol', async () => {
    const { status, body } = await makeRequest('PATCH', '/api/users/3/role', {}, adminToken());

    expect(status).toBe(400);
    expect(body.error).toBe('Rol inválido. Valores permitidos: user, staff, organizer');
  });

  it('debe retornar 403 si el admin intenta cambiarse su propio rol', async () => {
    const { status, body } = await makeRequest('PATCH', '/api/users/1/role', { role: 'organizer' }, adminToken());

    expect(status).toBe(403);
    expect(body.error).toBe('No puedes cambiar tu propio rol');
  });

  it('debe retornar 403 si se intenta cambiar el rol de otro admin', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 5, email: 'admin2@test.com', name: 'Admin2', role: 'admin' });

    const { status, body } = await makeRequest('PATCH', '/api/users/5/role', { role: 'organizer' }, adminToken());

    expect(status).toBe(403);
    expect(body.error).toBe('No puedes cambiar el rol de otro administrador');
  });

  it('debe retornar 404 si el usuario no existe', async () => {
    mockUserFindUnique.mockResolvedValue(null);

    const { status, body } = await makeRequest('PATCH', '/api/users/999/role', { role: 'organizer' }, adminToken());

    expect(status).toBe(404);
    expect(body.error).toBe('Usuario no encontrado');
  });

  it('debe retornar 200 con mensaje si el usuario ya tiene ese rol', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 3, email: 'test@test.com', name: 'Test', role: 'user' });

    const { status, body } = await makeRequest('PATCH', '/api/users/3/role', { role: 'user' }, adminToken());

    expect(status).toBe(200);
    expect(body.message).toBe('El usuario ya tiene este rol');
    expect(body.data.role).toBe('user');
  });

  it('debe cambiar el rol exitosamente', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 3, email: 'test@test.com', name: 'Test', role: 'user' });
    mockUserUpdate.mockResolvedValue({ id: 3, email: 'test@test.com', name: 'Test', role: 'organizer' });

    const { status, body } = await makeRequest('PATCH', '/api/users/3/role', { role: 'organizer' }, adminToken());

    expect(status).toBe(200);
    expect(body.message).toBe('Rol actualizado exitosamente');
    expect(body.data.role).toBe('organizer');
    expect(body.data.email).toBe('test@test.com');
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { role: 'organizer' },
      select: { id: true, email: true, name: true, role: true },
    });
  });

  it('debe retornar 401 si no hay token', async () => {
    const { status, body } = await makeRequest('PATCH', '/api/users/3/role', { role: 'organizer' });

    expect(status).toBe(401);
    expect(body.error).toBe('Token requerido');
  });

  it('debe retornar 403 si el usuario no es admin', async () => {
    const { status, body } = await makeRequest('PATCH', '/api/users/3/role', { role: 'organizer' }, userToken());

    expect(status).toBe(403);
    expect(body.error).toBe('Se requieren permisos de administrador');
  });
});

describe('GET /api/users', () => {
  beforeEach(() => {
    mockUserFindUnique.mockReset();
    mockUserUpdate.mockReset();
    mockUserFindMany.mockReset();
  });

  it('debe retornar todos los usuarios con el campo role', async () => {
    const mockUsers = [
      { id: 1, email: 'admin@test.com', name: 'Admin', role: 'admin', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
      { id: 2, email: 'user@test.com', name: 'User', role: 'user', createdAt: '2025-01-02T00:00:00Z', updatedAt: '2025-01-02T00:00:00Z' },
    ];
    mockUserFindMany.mockResolvedValue(mockUsers);

    const { status, body } = await makeRequest('GET', '/api/users', undefined, adminToken());

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.data[0]).toHaveProperty('role', 'admin');
    expect(body.data[1]).toHaveProperty('role', 'user');
    expect(body.count).toBe(2);
  });

  it('debe filtrar usuarios por search en nombre y email', async () => {
    mockUserFindMany.mockResolvedValue([
      { id: 2, email: 'user@test.com', name: 'Usuario Uno', role: 'user', createdAt: '2025-01-02T00:00:00Z', updatedAt: '2025-01-02T00:00:00Z' },
    ]);

    const { status, body } = await makeRequest('GET', '/api/users?search=usuario', undefined, adminToken());

    expect(status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].name).toBe('Usuario Uno');
    expect(mockUserFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { name: { contains: 'usuario', mode: 'insensitive' } },
            { email: { contains: 'usuario', mode: 'insensitive' } },
          ],
        },
      })
    );
  });

  it('debe retornar 401 sin token', async () => {
    const { status, body } = await makeRequest('GET', '/api/users');

    expect(status).toBe(401);
    expect(body.error).toBe('Token requerido');
  });

  it('debe retornar 403 si el usuario no es admin', async () => {
    const { status, body } = await makeRequest('GET', '/api/users', undefined, userToken());

    expect(status).toBe(403);
    expect(body.error).toBe('Se requieren permisos de administrador');
  });
});
