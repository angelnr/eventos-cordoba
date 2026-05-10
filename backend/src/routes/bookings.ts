import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { createNotification } from '../services/notificationService';
import { generateTicketForBooking } from '../services/ticketService';

const router = Router();
const prisma = new PrismaClient();

// POST /api/bookings - Crear reserva
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { eventId, quantity = 1 } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: 'eventId es requerido'
      });
    }

    const parsedEventId = parseInt(eventId);
    const parsedQuantity = parseInt(quantity);

    if (isNaN(parsedEventId) || parsedEventId < 1) {
      return res.status(400).json({
        success: false,
        error: 'eventId inválido'
      });
    }

    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'quantity debe ser un entero positivo'
      });
    }

    // Obtener título del evento antes de la transacción
    const eventInfo = await prisma.event.findUnique({
      where: { id: parsedEventId },
      select: { title: true }
    });

    const booking = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: parsedEventId },
        select: {
          id: true,
          price: true,
          capacity: true,
          currentBookings: true,
          organizerId: true,
          status: true
        }
      });

      if (!event) {
        const err: any = new Error('Evento no encontrado');
        err.statusCode = 404;
        throw err;
      }

      if (event.status !== 'SCHEDULED') {
        const statusMessages: Record<string, string> = {
          CANCELLED: 'El evento ha sido cancelado',
          FINISHED: 'El evento ya ha finalizado',
          FULL: 'El evento está completo, no hay plazas disponibles',
        };
        const message = statusMessages[event.status] || 'El evento no está disponible para reservas';
        const err: any = new Error(message);
        err.statusCode = 400;
        throw err;
      }

      if (event.organizerId === req.user!.id) {
        const err: any = new Error('No puedes reservar tu propio evento');
        err.statusCode = 400;
        throw err;
      }

      const existingBooking = await tx.booking.findFirst({
        where: {
          eventId: parsedEventId,
          userId: req.user!.id,
          status: 'confirmed'
        },
        select: { id: true }
      });

      if (existingBooking) {
        const err: any = new Error('Ya tienes una reserva confirmada para este evento');
        err.statusCode = 400;
        throw err;
      }

      if (event.currentBookings + parsedQuantity > event.capacity) {
        const err: any = new Error('No hay suficientes plazas disponibles');
        err.statusCode = 400;
        throw err;
      }

      const booking = await tx.booking.create({
        data: {
          eventId: parsedEventId,
          userId: req.user!.id,
          quantity: parsedQuantity,
          totalPrice: event.price * parsedQuantity,
          status: 'confirmed'
        }
      });

      await tx.event.update({
        where: { id: parsedEventId },
        data: { currentBookings: { increment: parsedQuantity } }
      });

      // Transición automática a FULL si se completa el aforo
      if (event.currentBookings + parsedQuantity >= event.capacity && event.status === 'SCHEDULED') {
        await tx.event.update({
          where: { id: parsedEventId },
          data: { status: 'FULL' },
        });
        await tx.eventStatusLog.create({
          data: {
            eventId: parsedEventId,
            fromStatus: 'SCHEDULED',
            toStatus: 'FULL',
            reason: 'Aforo completo tras reserva',
            changedById: null,
          },
        });
      }

      return booking;
    });

    createNotification({
      userId: req.user!.id,
      type: 'BOOKING_CONFIRMED',
      title: 'Reserva confirmada',
      message: `Tu reserva para "${eventInfo?.title || 'el evento'}" ha sido confirmada.`,
      eventId: parsedEventId,
      link: `/events/${parsedEventId}`
    }).catch(err => console.error('Error creating booking notification:', err));

    // Generar ticket automáticamente
    generateTicketForBooking(booking.id, req.user!.id).catch(err =>
      console.error('Error generating ticket for booking:', err)
    );

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: booking
    });

  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear la reserva'
    });
  }
});

// GET /api/bookings - Mis reservas
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = { userId: req.user!.id };
    if (status && status !== 'all') {
      where.status = status as string;
    } else if (!status) {
      where.status = { not: 'cancelled' };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        Event: {
          include: {
            organizer: {
              select: { id: true, name: true, email: true }
            },
            category: {
              select: { id: true, name: true, color: true }
            }
          }
        }
      },
      orderBy: { bookedAt: 'desc' }
    });

    res.json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener reservas'
    });
  }
});

// DELETE /api/bookings/:id - Cancelar reserva (soft delete)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);

    if (isNaN(parsedId) || parsedId < 1) {
      return res.status(400).json({
        success: false,
        error: 'ID de reserva inválido'
      });
    }

    // Buscar la reserva (solo campos necesarios para validación)
    const booking = await prisma.booking.findUnique({
      where: { id: parsedId },
      select: { id: true, userId: true, quantity: true, eventId: true }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    // Verificar que pertenece al usuario
    if (booking.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para cancelar esta reserva'
      });
    }

    const eventTitle = await prisma.event.findUnique({
      where: { id: booking.eventId },
      select: { title: true }
    });

    // Transacción atómica: cancelar reserva + decrementar contador
    await prisma.$transaction(async (tx) => {
      // Leer estado del evento actual antes de modificar
      const eventBefore = await tx.event.findUnique({
        where: { id: booking.eventId },
        select: { id: true, currentBookings: true, status: true }
      });

      if (!eventBefore) {
        const err: any = new Error('Evento no encontrado');
        err.statusCode = 404;
        throw err;
      }

      if (eventBefore.currentBookings < booking.quantity) {
        console.error('Inconsistencia en currentBookings:', {
          eventId: eventBefore.id,
          currentBookings: eventBefore.currentBookings,
          attemptedDecrement: booking.quantity
        });
        const err: any = new Error('Error de consistencia en la base de datos');
        err.statusCode = 500;
        throw err;
      }

      // Soft delete: marcar como cancelado en vez de eliminar
      await tx.booking.update({
        where: { id: parsedId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date()
        }
      });

      await tx.event.update({
        where: { id: booking.eventId },
        data: { currentBookings: { decrement: booking.quantity } }
      });

      // Transición automática de FULL a SCHEDULED si se libera plaza
      const newCurrentBookings = eventBefore.currentBookings - booking.quantity;
      if (eventBefore.status === 'FULL' && newCurrentBookings < eventBefore.currentBookings) {
        await tx.event.update({
          where: { id: booking.eventId },
          data: { status: 'SCHEDULED' },
        });
        await tx.eventStatusLog.create({
          data: {
            eventId: booking.eventId,
            fromStatus: 'FULL',
            toStatus: 'SCHEDULED',
            reason: 'Plaza liberada tras cancelación de reserva',
            changedById: req.user!.id,
          },
        });
      }

      // Invalidar el ticket asociado si existe
      const associatedTicket = await tx.ticket.findUnique({
        where: { bookingId: parsedId },
        select: { id: true, status: true }
      });
      if (associatedTicket && associatedTicket.status === 'valid') {
        await tx.ticket.update({
          where: { id: associatedTicket.id },
          data: {
            status: 'invalidated',
            invalidatedAt: new Date(),
            invalidationReason: 'Reserva cancelada por el usuario'
          }
        });
        await tx.ticketAuditLog.create({
          data: {
            ticketId: associatedTicket.id,
            action: 'TICKET_INVALIDATED',
            userId: req.user!.id,
            metadata: JSON.stringify({ reason: 'Reserva cancelada por el usuario', bookingId: parsedId })
          }
        });
      }
    });

    createNotification({
      userId: req.user!.id,
      type: 'EVENT_CANCELLED',
      title: 'Reserva cancelada',
      message: `Tu reserva para "${eventTitle?.title || 'el evento'}" ha sido cancelada.`,
      eventId: booking.eventId,
      link: `/events/${booking.eventId}`
    }).catch(err => console.error('Error creating cancellation notification:', err));

    res.json({
      success: true,
      message: 'Reserva cancelada exitosamente'
    });

  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cancelar la reserva'
    });
  }
});

export default router;
