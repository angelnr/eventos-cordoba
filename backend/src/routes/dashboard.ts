import { Router, Request, Response } from 'express';
import { EventStatus } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import * as dashboardService from '../services/dashboardService';

const router = Router();

function requireDashboardAccess(req: Request, res: Response, next: any) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'No autenticado' });
  }

  const scope = (req.query.scope as string) || 'mine';

  if (scope === 'all' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Solo administradores pueden ver métricas globales.',
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de organizador o administrador.',
    });
  }

  next();
}

function parseFilters(query: any): dashboardService.DashboardFilters {
  const filters: dashboardService.DashboardFilters = {};

  if (query.scope === 'all' || query.scope === 'mine') {
    filters.scope = query.scope;
  }

  if (query.startDate) {
    const start = new Date(query.startDate as string);
    if (isNaN(start.getTime())) {
      throw new Error('startDate inválida. Use formato ISO 8601.');
    }
    filters.startDate = start;
  }

  if (query.endDate) {
    const end = new Date(query.endDate as string);
    if (isNaN(end.getTime())) {
      throw new Error('endDate inválida. Use formato ISO 8601.');
    }
    filters.endDate = end;
  }

  if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
    throw new Error('startDate debe ser anterior a endDate.');
  }

  if (query.status) {
    const validStatuses: EventStatus[] = ['SCHEDULED', 'CANCELLED', 'FINISHED', 'FULL'];
    const statuses = (query.status as string).split(',').map((s: string) => s.trim().toUpperCase());
    const invalid = statuses.filter((s: string) => !validStatuses.includes(s as EventStatus));
    if (invalid.length > 0) {
      throw new Error(
        `Estados inválidos: ${invalid.join(', ')}. Valores permitidos: ${validStatuses.join(', ')}`
      );
    }
    filters.statuses = statuses as EventStatus[];
  }

  return filters;
}

router.get('/metrics', requireAuth, requireDashboardAccess, async (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    const refresh = req.query.refresh === 'true';
    const data = await dashboardService.getDashboardMetrics(req.user!.id, filters, refresh);
    res.json({ success: true, data });
  } catch (error: any) {
    if (error.message && (error.message.includes('inválida') || error.message.includes('debe ser'))) {
      return res.status(400).json({ success: false, error: error.message });
    }
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ success: false, error: 'Error al obtener métricas del dashboard' });
  }
});

router.get('/metrics/events-created', requireAuth, requireDashboardAccess, async (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    const refresh = req.query.refresh === 'true';
    const data = await dashboardService.getEventsCreatedMetrics(req.user!.id, filters, refresh);
    res.json({ success: true, data });
  } catch (error: any) {
    if (error.message && (error.message.includes('inválida') || error.message.includes('debe ser'))) {
      return res.status(400).json({ success: false, error: error.message });
    }
    console.error('Events created metrics error:', error);
    res.status(500).json({ success: false, error: 'Error al obtener métricas de eventos creados' });
  }
});

router.get('/metrics/attendees', requireAuth, requireDashboardAccess, async (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    const refresh = req.query.refresh === 'true';
    const data = await dashboardService.getAttendeeMetrics(req.user!.id, filters, refresh);
    res.json({ success: true, data });
  } catch (error: any) {
    if (error.message && (error.message.includes('inválida') || error.message.includes('debe ser'))) {
      return res.status(400).json({ success: false, error: error.message });
    }
    console.error('Attendee metrics error:', error);
    res.status(500).json({ success: false, error: 'Error al obtener métricas de asistentes' });
  }
});

router.get('/metrics/average-rating', requireAuth, requireDashboardAccess, async (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    const refresh = req.query.refresh === 'true';
    const data = await dashboardService.getRatingMetrics(req.user!.id, filters, refresh);
    res.json({ success: true, data });
  } catch (error: any) {
    if (error.message && (error.message.includes('inválida') || error.message.includes('debe ser'))) {
      return res.status(400).json({ success: false, error: error.message });
    }
    console.error('Rating metrics error:', error);
    res.status(500).json({ success: false, error: 'Error al obtener métricas de puntuación' });
  }
});

router.get('/metrics/events-completed', requireAuth, requireDashboardAccess, async (req: Request, res: Response) => {
  try {
    const filters = parseFilters(req.query);
    const refresh = req.query.refresh === 'true';
    const data = await dashboardService.getCompletedEventsMetrics(req.user!.id, filters, refresh);
    res.json({ success: true, data });
  } catch (error: any) {
    if (error.message && (error.message.includes('inválida') || error.message.includes('debe ser'))) {
      return res.status(400).json({ success: false, error: error.message });
    }
    console.error('Completed events metrics error:', error);
    res.status(500).json({ success: false, error: 'Error al obtener métricas de eventos completados' });
  }
});

export default router;
