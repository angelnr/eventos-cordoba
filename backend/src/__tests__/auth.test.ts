/// <reference types="jest" />

import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = 'test-secret-with-at-least-32-chars!!';
process.env.JWT_SECRET = JWT_SECRET;
process.env.JWT_EXPIRES_IN = '15m';

const mockFindUnique = jest.fn();
const mockCreate = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: {
      findUnique: mockFindUnique,
      create: mockCreate,
    },
    $disconnect: jest.fn(),
  })),
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('express-rate-limit', () => {
  return jest.fn(() => (req: any, res: any, next: any) => next());
});

import authRoutes from '../routes/auth';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

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

beforeEach(() => {
  mockFindUnique.mockReset();
  mockCreate.mockReset();
  (bcrypt.compare as jest.Mock).mockReset();
  (bcrypt.hash as jest.Mock).mockReset();
});

describe('POST /api/auth/login', () => {
  it('debe retornar 400 si falta email', async () => {
    const { status, body } = await makeRequest('POST', '/api/auth/login', { password: 'Pass1234' });

    expect(status).toBe(400);
    expect(body.error).toBe('Email y password son requeridos');
  });

  it('debe retornar 400 si falta password', async () => {
    const { status, body } = await makeRequest('POST', '/api/auth/login', { email: 'test@test.com' });

    expect(status).toBe(400);
    expect(body.error).toBe('Email y password son requeridos');
  });

  it('debe retornar 400 si email tiene formato inválido', async () => {
    const { status, body } = await makeRequest('POST', '/api/auth/login', {
      email: 'not-an-email',
      password: 'Pass1234',
    });

    expect(status).toBe(400);
    expect(body.error).toBe('Formato de email inválido');
  });

  it('debe retornar 401 si el usuario no existe', async () => {
    mockFindUnique.mockResolvedValue(null);

    const { status, body } = await makeRequest('POST', '/api/auth/login', {
      email: 'noexist@test.com',
      password: 'Pass1234',
    });

    expect(status).toBe(401);
    expect(body.error).toBe('Credenciales inválidas');
  });

  it('debe retornar 401 si la contraseña no coincide', async () => {
    mockFindUnique.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: '$2a$12$hash',
      name: 'Test',
      role: 'user',
      avatar: null,
      themePreference: null,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const { status, body } = await makeRequest('POST', '/api/auth/login', {
      email: 'test@test.com',
      password: 'WrongPass1',
    });

    expect(status).toBe(401);
    expect(body.error).toBe('Credenciales inválidas');
  });

  it('debe retornar 200 con token y datos de usuario si las credenciales son correctas', async () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      password: '$2a$12$hash',
      name: 'Test User',
      role: 'organizer',
      avatar: null,
      themePreference: 'dark',
    };
    mockFindUnique.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const { status, body } = await makeRequest('POST', '/api/auth/login', {
      email: 'test@test.com',
      password: 'CorrectPass1',
    });

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe('Login exitoso');
    expect(body.data.user.id).toBe(1);
    expect(body.data.user.email).toBe('test@test.com');
    expect(body.data.user.name).toBe('Test User');
    expect(body.data.user.role).toBe('organizer');
    expect(body.data.token).toBeDefined();
    expect(body.data.user.themePreference).toBe('dark');
  });

  it('debe usar themePreference por defecto "system" si es null', async () => {
    mockFindUnique.mockResolvedValue({
      id: 2,
      email: 'user@test.com',
      password: '$2a$12$hash',
      name: 'User',
      role: 'user',
      avatar: null,
      themePreference: null,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const { status, body } = await makeRequest('POST', '/api/auth/login', {
      email: 'user@test.com',
      password: 'Pass1234',
    });

    expect(status).toBe(200);
    expect(body.data.user.themePreference).toBe('system');
  });
});

describe('POST /api/auth/register', () => {
  it('debe retornar 400 si falta email', async () => {
    const { status, body } = await makeRequest('POST', '/api/auth/register', { password: 'Pass1234' });

    expect(status).toBe(400);
    expect(body.error).toBe('Email y password son requeridos');
  });

  it('debe retornar 400 si email tiene formato inválido', async () => {
    const { status, body } = await makeRequest('POST', '/api/auth/register', {
      email: 'bad',
      password: 'Pass1234',
    });

    expect(status).toBe(400);
    expect(body.error).toBe('Formato de email inválido');
  });

  it('debe retornar 400 si la contraseña es débil (sin mayúscula)', async () => {
    const { status, body } = await makeRequest('POST', '/api/auth/register', {
      email: 'test@test.com',
      password: 'password1',
    });

    expect(status).toBe(400);
    expect(body.error).toContain('al menos 8 caracteres');
  });

  it('debe retornar 400 si la contraseña es débil (sin número)', async () => {
    const { status, body } = await makeRequest('POST', '/api/auth/register', {
      email: 'test@test.com',
      password: 'Password',
    });

    expect(status).toBe(400);
    expect(body.error).toContain('al menos 8 caracteres');
  });

  it('debe retornar 400 si la contraseña es demasiado corta', async () => {
    const { status, body } = await makeRequest('POST', '/api/auth/register', {
      email: 'test@test.com',
      password: 'Ab1',
    });

    expect(status).toBe(400);
    expect(body.error).toContain('al menos 8 caracteres');
  });

  it('debe retornar 400 si el usuario ya existe', async () => {
    mockFindUnique.mockResolvedValue({ id: 1, email: 'existing@test.com' });

    const { status, body } = await makeRequest('POST', '/api/auth/register', {
      email: 'existing@test.com',
      password: 'ValidPass1',
      name: 'Existing',
    });

    expect(status).toBe(400);
    expect(body.error).toBe('Usuario ya existe');
  });

  it('debe retornar 201 con token si el registro es exitoso', async () => {
    mockFindUnique.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$12$hashedpassword');
    mockCreate.mockResolvedValue({
      id: 3,
      email: 'newuser@test.com',
      name: 'New User',
      role: 'user',
      themePreference: null,
      createdAt: new Date().toISOString(),
    });

    const { status, body } = await makeRequest('POST', '/api/auth/register', {
      email: 'newuser@test.com',
      password: 'ValidPass1',
      name: 'New User',
    });

    expect(status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.message).toBe('Usuario registrado exitosamente');
    expect(body.data.user.email).toBe('newuser@test.com');
    expect(body.data.user.name).toBe('New User');
    expect(body.data.user.role).toBe('user');
    expect(body.data.token).toBeDefined();
    expect(bcrypt.hash).toHaveBeenCalledWith('ValidPass1', 12);
  });

  it('debe aceptar registro sin nombre (name opcional)', async () => {
    mockFindUnique.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$12$hash');
    mockCreate.mockResolvedValue({
      id: 4,
      email: 'noname@test.com',
      name: null,
      role: 'user',
      themePreference: null,
      createdAt: new Date().toISOString(),
    });

    const { status, body } = await makeRequest('POST', '/api/auth/register', {
      email: 'noname@test.com',
      password: 'ValidPass1',
    });

    expect(status).toBe(201);
    expect(body.data.user.name).toBeNull();
  });
});

describe('POST /api/auth/verify', () => {
  const validUser = {
    id: 1,
    email: 'test@test.com',
    name: 'Test',
    role: 'user',
    avatar: '/uploads/avatars/test.png',
    createdAt: new Date().toISOString(),
  };

  it('debe retornar 400 si falta token', async () => {
    const { status, body } = await makeRequest('POST', '/api/auth/verify', {});

    expect(status).toBe(400);
    expect(body.error).toBe('Token requerido');
  });

  it('debe retornar 401 si el token es inválido', async () => {
    const { status, body } = await makeRequest('POST', '/api/auth/verify', {
      token: 'token-malo',
    });

    expect(status).toBe(401);
    expect(body.error).toBe('Token inválido');
  });

  it('debe retornar 404 si el usuario del token ya no existe', async () => {
    mockFindUnique.mockResolvedValue(null);

    const token = jwt.sign({ id: 999, email: 'ghost@test.com', role: 'user' }, JWT_SECRET);

    const { status, body } = await makeRequest('POST', '/api/auth/verify', { token });

    expect(status).toBe(404);
    expect(body.error).toBe('Usuario no encontrado');
  });

  it('debe retornar 200 con datos del usuario si el token es válido', async () => {
    mockFindUnique.mockResolvedValue(validUser);

    const token = jwt.sign({ id: 1, email: 'test@test.com', role: 'user' }, JWT_SECRET);

    const { status, body } = await makeRequest('POST', '/api/auth/verify', { token });

    expect(status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe('test@test.com');
    expect(body.data.user.avatar).toBe('/uploads/avatars/test.png');
    expect(body.data.token.expiresIn).toBe('15m');
  });
});
