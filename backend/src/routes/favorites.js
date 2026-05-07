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

// GET /api/favorites/check - Comprobar estado de favoritos (batch) - DEBE IR ANTES DE /:eventId
router.get('/check', requireAuth, async (req, res) => {
  try {
    const { eventIds } = req.query;

    if (!eventIds) {
      return res.status(400).json({
        success: false,
        error: 'eventIds es requerido'
      });
    }

    const ids = eventIds.split(',').map(Number).filter(n => !isNaN(n) && n > 0);

    if (ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'eventIds debe contener IDs válidos'
      });
    }

    if (ids.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Máximo 50 IDs por petición'
      });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: req.user.id,
        eventId: { in: ids }
      },
      select: { eventId: true }
    });

    // Construir mapa de resultados: { "eventId": true/false }
    const result = {};
    ids.forEach(id => { result[id] = false; });
    favorites.forEach(f => { result[f.eventId] = true; });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Check favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al comprobar favoritos'
    });
  }
});

// GET /api/favorites - Listar favoritos del usuario
router.get('/', requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = Math.min(parseInt(limit), 50);

    const where = { userId: req.user.id };

    if (category) {
      where.event = { categoryId: parseInt(category) };
    }

    const eventFilter = { status: { not: 'cancelled' } };
    if (where.event) {
      where.event = { ...where.event, ...eventFilter };
    } else {
      where.event = eventFilter;
    }

    const favorites = await prisma.favorite.findMany({
      where,
      include: {
        event: {
          include: {
            organizer: { select: { id: true, name: true, email: true } },
            category: { select: { id: true, name: true, color: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });

    const total = await prisma.favorite.count({ where });

    res.json({
      success: true,
      data: favorites,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener favoritos'
    });
  }
});

// POST /api/favorites - Añadir favorito (idempotente)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: 'eventId es requerido'
      });
    }

    const parsedEventId = parseInt(eventId);

    if (isNaN(parsedEventId) || parsedEventId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'eventId debe ser un número entero positivo'
      });
    }

    // Verificar que el evento existe y está disponible
    const event = await prisma.event.findUnique({
      where: { id: parsedEventId }
    });

    if (!event || event.status === 'cancelled') {
      return res.status(404).json({
        success: false,
        error: 'El evento no existe o no está disponible'
      });
    }

    // Intentar crear el favorito. Si ya existe (P2002), devolver el existente con 200.
    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        eventId: parsedEventId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Evento añadido a favoritos',
      data: favorite
    });
  } catch (error) {
    // P2002 = unique constraint violation (ya era favorito)
    if (error.code === 'P2002') {
      try {
        const existing = await prisma.favorite.findUnique({
          where: {
            userId_eventId: {
              userId: req.user.id,
              eventId: parseInt(req.body.eventId)
            }
          }
        });

        return res.status(200).json({
          success: true,
          message: 'El evento ya está en tus favoritos',
          data: existing
        });
      } catch (innerError) {
        console.error('Error fetching existing favorite:', innerError);
        return res.status(500).json({
          success: false,
          error: 'Error al recuperar favorito existente'
        });
      }
    }

    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al añadir favorito'
    });
  }
});

// DELETE /api/favorites/:eventId - Eliminar favorito (idempotente)
router.delete('/:eventId', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const parsedEventId = parseInt(eventId);

    if (isNaN(parsedEventId)) {
      return res.status(400).json({
        success: false,
        error: 'eventId debe ser un número válido'
      });
    }

    // deleteMany es idempotente: no falla si no existe el registro
    await prisma.favorite.deleteMany({
      where: {
        userId: req.user.id,
        eventId: parsedEventId
      }
    });

    res.json({
      success: true,
      message: 'Evento eliminado de favoritos'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar favorito'
    });
  }
});

module.exports = router;
