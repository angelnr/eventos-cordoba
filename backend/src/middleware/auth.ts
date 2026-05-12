import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ success: false, error: 'Token requerido' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token inválido' });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string };
      req.user = decoded;
    } catch {
      // Token inválido — continuar sin usuario
    }
  }
  next();
}

export function requireOrganizer(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Autenticación requerida' });
    return;
  }
  if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Se requieren permisos de organizador' });
    return;
  }
  next();
}

export function requireStaff(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Autenticación requerida' });
    return;
  }
  if (req.user.role !== 'staff' && req.user.role !== 'organizer' && req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Se requieren permisos de staff u organizador' });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Autenticación requerida' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Se requieren permisos de administrador' });
    return;
  }
  next();
}
