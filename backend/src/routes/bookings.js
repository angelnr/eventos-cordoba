const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { createNotification } = require('../services/notificationService');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token requerido'
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
};

// POST /api/bookings - Crear reserva
router.post('/', requireAuth, async (req, res) => {
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

      if (!event || event.status !== 'active') {
        const err = new Error('Evento no encontrado o no disponible');
        err.statusCode = 404;
        throw err;
      }

      if (event.organizerId === req.user.id) {
        const err = new Error('No puedes reservar tu propio evento');
        err.statusCode = 400;
        throw err;
      }

      const existingBooking = await tx.booking.findFirst({
        where: {
          eventId: parsedEventId,
          userId: req.user.id,
          status: 'confirmed'
        },
        select: { id: true }
      });

      if (existingBooking) {
        const err = new Error('Ya tienes una reserva confirmada para este evento');
        err.statusCode = 400;
        throw err;
      }

      if (event.currentBookings + parsedQuantity > event.capacity) {
        const err = new Error('No hay suficientes plazas disponibles');
        err.statusCode = 400;
        throw err;
      }

      const booking = await tx.booking.create({
        data: {
          eventId: parsedEventId,
          userId: req.user.id,
          quantity: parsedQuantity,
          totalPrice: event.price * parsedQuantity,
          status: 'confirmed'
        }
      });

      await tx.event.update({
        where: { id: parsedEventId },
        data: { currentBookings: { increment: parsedQuantity } }
      });

      return booking;
    });

    createNotification({
      userId: req.user.id,
      type: 'BOOKING_CONFIRMED',
      title: 'Reserva confirmada',
      message: `Tu reserva para "${eventInfo?.title || 'el evento'}" ha sido confirmada.`,
      eventId: parsedEventId,
      link: `/events/${parsedEventId}`
    }).catch(err => console.error('Error creating booking notification:', err));

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: booking
    });

  } catch (error) {
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
router.get('/', requireAuth, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
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

// DELETE /api/bookings/:id - Cancelar reserva
router.delete('/:id', requireAuth, async (req, res) => {
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
    if (booking.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para cancelar esta reserva'
      });
    }

    const eventTitle = await prisma.event.findUnique({
      where: { id: booking.eventId },
      select: { title: true }
    });

    // Transacción atómica: eliminar reserva + decrementar contador
    await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: booking.eventId },
        select: { id: true, currentBookings: true }
      });

      if (!event) {
        const err = new Error('Evento no encontrado');
        err.statusCode = 404;
        throw err;
      }

      if (event.currentBookings < booking.quantity) {
        console.error('Inconsistencia en currentBookings:', {
          eventId: event.id,
          currentBookings: event.currentBookings,
          attemptedDecrement: booking.quantity
        });
        const err = new Error('Error de consistencia en la base de datos');
        err.statusCode = 500;
        throw err;
      }

      await tx.booking.delete({
        where: { id: parsedId }
      });

      await tx.event.update({
        where: { id: booking.eventId },
        data: { currentBookings: { decrement: booking.quantity } }
      });
    });

    createNotification({
      userId: req.user.id,
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

  } catch (error) {
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

module.exports = router;
