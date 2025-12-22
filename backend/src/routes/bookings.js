const express = require('express');
const { PrismaClient } = require('@prisma/client');

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

    // Verificar que el evento existe y está activo
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: { bookings: true }
    });

    if (!event || event.status !== 'active') {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado o no disponible'
      });
    }

    // Verificar que no sea el organizador
    if (event.organizerId === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes reservar tu propio evento'
      });
    }

    // Calcular plazas disponibles
    const totalBooked = event.bookings.reduce((sum, booking) =>
      booking.status === 'confirmed' ? sum + booking.quantity : sum, 0
    );

    if (totalBooked + quantity > event.capacity) {
      return res.status(400).json({
        success: false,
        error: 'No hay suficientes plazas disponibles'
      });
    }

    // Crear reserva
    const booking = await prisma.booking.create({
      data: {
        eventId: parseInt(eventId),
        userId: req.user.id,
        quantity: quantity,
        totalPrice: event.price * quantity
      }
    });

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: booking
    });

  } catch (error) {
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
        event: {
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

    // Buscar la reserva
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) }
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

    // Eliminar reserva
    await prisma.booking.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Reserva cancelada exitosamente'
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cancelar la reserva'
    });
  }
});

module.exports = router;
