import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';
import { requireAuth, requireStaff, requireAdmin } from '../middleware/auth';
import * as ticketService from '../services/ticketService';
import * as qrService from '../services/qrService';
import { logTicketAction } from '../services/auditService';

const router = Router();
const prisma = new PrismaClient();

const validateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: 'Demasiadas validaciones. Intenta de nuevo en un minuto.' },
  keyGenerator: (req) => req.user?.id?.toString() || req.ip,
});

// POST /api/tickets/generate/:bookingId
router.post('/generate/:bookingId', requireAuth, async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    if (isNaN(bookingId) || bookingId < 1) {
      return res.status(400).json({ success: false, error: 'bookingId inválido' });
    }

    const result = await ticketService.generateTicketForBooking(bookingId, req.user!.id);

    if (result.created) {
      return res.status(201).json({ success: true, data: result.ticket });
    }
    return res.status(200).json({ success: true, data: result.ticket });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, error: error.message });
    }
    console.error('Generate ticket error:', error);
    return res.status(500).json({ success: false, error: 'Error al generar ticket' });
  }
});

// GET /api/tickets/my-tickets
router.get('/my-tickets', requireAuth, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const tickets = await ticketService.getUserTickets(req.user!.id, status);
    return res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('Get my tickets error:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener tus tickets' });
  }
});

// GET /api/tickets/:ticketId
router.get('/:ticketId', requireAuth, async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    if (isNaN(ticketId) || ticketId < 1) {
      return res.status(400).json({ success: false, error: 'ticketId inválido' });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            Event: {
              select: { id: true, title: true, date: true, location: true, imageUrl: true, status: true },
            },
          },
        },
        validatedBy: { select: { id: true, name: true } },
        auditLogs: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket no encontrado' });
    }

    if (ticket.booking.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'No tienes permiso para ver este ticket' });
    }

    return res.json({ success: true, data: ticket });
  } catch (error) {
    console.error('Get ticket error:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener ticket' });
  }
});

// GET /api/tickets/qr/:token
router.get('/qr/:token', requireAuth, async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { token },
      include: {
        booking: { select: { userId: true } },
      },
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Token no encontrado' });
    }

    if (ticket.booking.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'No tienes permiso para ver este QR' });
    }

    const qrImage = await qrService.generateQrImage(token);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="ticket-${token}.png"`);
    return res.send(qrImage);
  } catch (error) {
    console.error('Get QR error:', error);
    return res.status(500).json({ success: false, error: 'Error al generar QR' });
  }
});

// POST /api/tickets/validate
router.post('/validate', requireAuth, requireStaff, validateLimiter, async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Token es requerido' });
    }

    const result = await ticketService.validateTicket(token.trim(), req.user!.id);

    if (result.action === 'validated') {
      return res.json({ success: true, action: 'validated', data: result });
    }

    return res.json({ success: false, action: 'already_used', error: 'Este ticket ya fue validado', data: result });
  } catch (error: any) {
    if (error.statusCode === 422) {
      return res.status(422).json({ success: false, action: error.action || 'invalid', error: error.message });
    }
    if (error.statusCode === 410) {
      return res.status(410).json({ success: false, action: 'expired', error: error.message });
    }
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, action: 'not_found', error: error.message });
    }
    console.error('Validate ticket error:', error);
    return res.status(500).json({ success: false, error: 'Error al validar ticket' });
  }
});

// GET /api/tickets/verify/:token - Endpoint público (solo evento y estado, sin datos personales)
router.get('/verify/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const ticket = await ticketService.getTicketStatus(token);

    return res.json({
      success: true,
      data: {
        status: ticket.status,
        scannedAt: ticket.scannedAt,
        invalidationReason: ticket.invalidationReason,
        event: {
          id: ticket.booking.Event.id,
          title: ticket.booking.Event.title,
          date: ticket.booking.Event.date,
          location: ticket.booking.Event.location,
        },
      },
    });
  } catch (error: any) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, error: error.message });
    }
    console.error('Public verify error:', error);
    return res.status(500).json({ success: false, error: 'Error al verificar ticket' });
  }
});

// GET /api/tickets/status/:token (staff only - incluye datos del usuario)
router.get('/status/:token', requireAuth, requireStaff, async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const ticket = await ticketService.getTicketStatus(token);

    return res.json({
      success: true,
      data: {
        status: ticket.status,
        scannedAt: ticket.scannedAt,
        invalidationReason: ticket.invalidationReason,
        validatedBy: ticket.validatedBy ? { id: ticket.validatedBy.id, name: ticket.validatedBy.name } : null,
        event: {
          id: ticket.booking.Event.id,
          title: ticket.booking.Event.title,
          date: ticket.booking.Event.date,
          location: ticket.booking.Event.location,
        },
        user: {
          id: ticket.booking.user.id,
          name: ticket.booking.user.name,
          email: ticket.booking.user.email,
        },
      },
    });
  } catch (error: any) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, error: error.message });
    }
    console.error('Get ticket status error:', error);
    return res.status(500).json({ success: false, error: 'Error al consultar estado del ticket' });
  }
});

// POST /api/tickets/invalidate/:ticketId
router.post('/invalidate/:ticketId', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    if (isNaN(ticketId) || ticketId < 1) {
      return res.status(400).json({ success: false, error: 'ticketId inválido' });
    }

    const { reason } = req.body;
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Motivo de invalidación es requerido' });
    }

    const updatedTicket = await ticketService.invalidateTicket(ticketId, req.user!.id, reason.trim());

    return res.json({ success: true, data: updatedTicket });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, error: error.message });
    }
    console.error('Invalidate ticket error:', error);
    return res.status(500).json({ success: false, error: 'Error al invalidar ticket' });
  }
});

// GET /api/tickets/event/:eventId
router.get('/event/:eventId', requireAuth, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId) || eventId < 1) {
      return res.status(400).json({ success: false, error: 'eventId inválido' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, organizerId: true },
    });

    if (!event) {
      return res.status(404).json({ success: false, error: 'Evento no encontrado' });
    }

    if (event.organizerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'No tienes permiso para ver los tickets de este evento' });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string | undefined;

    const result = await ticketService.getEventTickets(eventId, page, limit, status);

    return res.json({
      success: true,
      data: {
        tickets: result.tickets,
        total: result.total,
        page,
        limit,
        stats: result.stats,
      },
    });
  } catch (error) {
    console.error('Get event tickets error:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener tickets del evento' });
  }
});

// GET /api/tickets/event/:eventId/attendees
router.get('/event/:eventId/attendees', requireAuth, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId) || eventId < 1) {
      return res.status(400).json({ success: false, error: 'eventId inválido' });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, organizerId: true },
    });

    if (!event) {
      return res.status(404).json({ success: false, error: 'Evento no encontrado' });
    }

    if (event.organizerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'No tienes permiso para ver los asistentes de este evento' });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));

    const where = {
      status: 'used' as const,
      booking: { eventId },
    };

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          booking: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          validatedBy: { select: { id: true, name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { scannedAt: 'desc' },
      }),
      prisma.ticket.count({ where }),
    ]);

    const attendees = tickets.map(t => ({
      ticketId: t.id,
      scannedAt: t.scannedAt,
      validatedBy: t.validatedBy,
      user: t.booking.user,
    }));

    return res.json({
      success: true,
      data: {
        attendees,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get attendees error:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener asistentes' });
  }
});

// GET /api/tickets/:ticketId/audit
router.get('/:ticketId/audit', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    if (isNaN(ticketId) || ticketId < 1) {
      return res.status(400).json({ success: false, error: 'ticketId inválido' });
    }

    const auditLogs = await prisma.ticketAuditLog.findMany({
      where: { ticketId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: auditLogs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener registros de auditoría' });
  }
});

export default router;
