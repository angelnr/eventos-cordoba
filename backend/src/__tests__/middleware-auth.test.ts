/// <reference types="jest" />

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret-with-at-least-32-chars!!';
process.env.JWT_SECRET = JWT_SECRET;

function createMockReq(headers?: Record<string, string>): Partial<Request> {
  return {
    headers: { authorization: headers?.authorization, ...headers } as any,
  };
}

function createMockRes(): Partial<Response> {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('middleware/auth - requireAuth', () => {
  let requireAuth: (req: Request, res: Response, next: NextFunction) => void;

  beforeAll(async () => {
    const mod = await import('../middleware/auth');
    requireAuth = mod.requireAuth;
  });

  it('debe retornar 401 si falta header Authorization', () => {
    const req = createMockReq({}) as Request;
    const res = createMockRes() as Response;
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Token requerido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 401 si el token es inválido', () => {
    const req = createMockReq({ authorization: 'Bearer token-malo' }) as Request;
    const res = createMockRes() as Response;
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe llamar next() si el token es válido', () => {
    const token = jwt.sign({ id: 1, email: 'test@test.com', role: 'user' }, JWT_SECRET);
    const req = createMockReq({ authorization: `Bearer ${token}` }) as Request;
    const res = createMockRes() as Response;
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user!.id).toBe(1);
    expect(req.user!.email).toBe('test@test.com');
    expect(req.user!.role).toBe('user');
  });
});

describe('middleware/auth - optionalAuth', () => {
  let optionalAuth: (req: Request, res: Response, next: NextFunction) => void;

  beforeAll(async () => {
    const mod = await import('../middleware/auth');
    optionalAuth = mod.optionalAuth;
  });

  it('debe continuar sin usuario si no hay token', () => {
    const req = createMockReq({}) as Request;
    const res = createMockRes() as Response;
    const next = jest.fn();

    optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it('debe poblar req.user si el token es válido', () => {
    const token = jwt.sign({ id: 2, email: 'user@test.com', role: 'organizer' }, JWT_SECRET);
    const req = createMockReq({ authorization: `Bearer ${token}` }) as Request;
    const res = createMockRes() as Response;
    const next = jest.fn();

    optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user!.id).toBe(2);
    expect(req.user!.role).toBe('organizer');
  });

  it('debe continuar sin usuario si el token es inválido (no lanza error)', () => {
    const req = createMockReq({ authorization: 'Bearer invalid-token' }) as Request;
    const res = createMockRes() as Response;
    const next = jest.fn();

    optionalAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });
});

describe('middleware/auth - requireOrganizer', () => {
  let requireOrganizer: (req: Request, res: Response, next: NextFunction) => void;

  beforeAll(async () => {
    const mod = await import('../middleware/auth');
    requireOrganizer = mod.requireOrganizer;
  });

  it('debe retornar 401 si no hay req.user', () => {
    const req = createMockReq({}) as Request;
    const res = createMockRes() as Response;
    const next = jest.fn();

    requireOrganizer(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Autenticación requerida' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 403 si el rol es user', () => {
    const req = createMockReq({}) as Request;
    (req as any).user = { id: 1, email: 'a@b.com', role: 'user' };
    const res = createMockRes() as Response;
    const next = jest.fn();

    requireOrganizer(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Se requieren permisos de organizador' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe llamar next() si el rol es organizer', () => {
    const req = createMockReq({}) as Request;
    (req as any).user = { id: 1, email: 'a@b.com', role: 'organizer' };
    const res = createMockRes() as Response;
    const next = jest.fn();

    requireOrganizer(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('debe llamar next() si el rol es admin', () => {
    const req = createMockReq({}) as Request;
    (req as any).user = { id: 1, email: 'a@b.com', role: 'admin' };
    const res = createMockRes() as Response;
    const next = jest.fn();

    requireOrganizer(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('middleware/auth - requireStaff', () => {
  let requireStaff: (req: Request, res: Response, next: NextFunction) => void;

  beforeAll(async () => {
    const mod = await import('../middleware/auth');
    requireStaff = mod.requireStaff;
  });

  it('debe retornar 401 si no hay req.user', () => {
    const req = createMockReq({}) as Request;
    const res = createMockRes() as Response;
    const next = jest.fn();

    requireStaff(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Autenticación requerida' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 403 si el rol es user', () => {
    const req = createMockReq({}) as Request;
    (req as any).user = { id: 1, email: 'a@b.com', role: 'user' };
    const res = createMockRes() as Response;
    const next = jest.fn();

    requireStaff(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Se requieren permisos de staff u organizador' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe llamar next() si el rol es staff', () => {
    const req = createMockReq({}) as Request;
    (req as any).user = { id: 1, email: 'a@b.com', role: 'staff' };
    const res = createMockRes() as Response;
    const next = jest.fn();

    requireStaff(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('debe llamar next() si el rol es organizer', () => {
    const req = createMockReq({}) as Request;
    (req as any).user = { id: 1, email: 'a@b.com', role: 'organizer' };
    const res = createMockRes() as Response;
    const next = jest.fn();

    requireStaff(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('debe llamar next() si el rol es admin', () => {
    const req = createMockReq({}) as Request;
    (req as any).user = { id: 1, email: 'a@b.com', role: 'admin' };
    const res = createMockRes() as Response;
    const next = jest.fn();

    requireStaff(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

describe('middleware/auth - requireAdmin', () => {
  let requireAdmin: (req: Request, res: Response, next: NextFunction) => void;

  beforeAll(async () => {
    const mod = await import('../middleware/auth');
    requireAdmin = mod.requireAdmin;
  });

  it('debe retornar 401 si no hay req.user', () => {
    const req = createMockReq({}) as Request;
    const res = createMockRes() as Response;
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Autenticación requerida' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe retornar 403 si el rol no es admin', () => {
    const req = createMockReq({}) as Request;
    (req as any).user = { id: 1, email: 'a@b.com', role: 'organizer' };
    const res = createMockRes() as Response;
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Se requieren permisos de administrador' });
    expect(next).not.toHaveBeenCalled();
  });

  it('debe llamar next() si el rol es admin', () => {
    const req = createMockReq({}) as Request;
    (req as any).user = { id: 1, email: 'a@b.com', role: 'admin' };
    const res = createMockRes() as Response;
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
