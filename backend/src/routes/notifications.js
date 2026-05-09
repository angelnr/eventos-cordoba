const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { createNotification, createEventNotifications, VALID_TYPES } = require('../services/notificationService');

const router = express.Router();
const prisma = new PrismaClient();

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
      error: 'Token inv\u00e1lido'
    });
  }
};

const requireOrganizer = (req, res, next) => {
  if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Se requieren permisos de organizador'
    });
  }
  next();
};

router.get('/', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const unreadOnly = req.query.unreadOnly === 'true';
    const type = req.query.type || null;

    if (type && !VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        error: `Tipo de notificaci\u00f3n inv\u00e1lido. V\u00e1lidos: ${VALID_TYPES.join(', ')}`
      });
    }

    const where = { userId: req.user.id };
    if (unreadOnly) where.isRead = false;
    if (type) where.type = type;

    const skip = (page - 1) * limit;
    const take = limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          event: {
            select: { id: true, title: true, slug: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } })
    ]);

    const pages = Math.ceil(total / take);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener notificaciones'
    });
  }
});

router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener conteo de notificaciones'
    });
  }
});

router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const notificationId = parseInt(id);

    if (isNaN(notificationId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de notificaci\u00f3n inv\u00e1lido'
      });
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'Notificaci\u00f3n no encontrada'
      });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
      include: {
        event: {
          select: { id: true, title: true, slug: true }
        }
      }
    });

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al marcar notificaci\u00f3n como le\u00edda'
    });
  }
});

router.patch('/mark-all-read', requireAuth, async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });

    res.json({
      success: true,
      data: { updatedCount: result.count }
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al marcar todas las notificaciones como le\u00eddas'
    });
  }
});

router.delete('/read-all', requireAuth, async (req, res) => {
  try {
    const result = await prisma.notification.deleteMany({
      where: { userId: req.user.id, isRead: true }
    });

    res.json({
      success: true,
      data: { deletedCount: result.count }
    });
  } catch (error) {
    console.error('Delete read notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar notificaciones le\u00eddas'
    });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const notificationId = parseInt(id);

    if (isNaN(notificationId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de notificaci\u00f3n inv\u00e1lido'
      });
    }

    const result = await prisma.notification.deleteMany({
      where: { id: notificationId, userId: req.user.id }
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notificaci\u00f3n no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Notificaci\u00f3n eliminada'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar notificaci\u00f3n'
    });
  }
});

router.post('/', requireAuth, requireOrganizer, async (req, res) => {
  try {
    const { eventId, type, title, message } = req.body;

    if (type !== 'ORGANIZER_ANNOUNCEMENT') {
      return res.status(400).json({
        success: false,
        error: 'Solo se permite crear notificaciones de tipo ORGANIZER_ANNOUNCEMENT'
      });
    }

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: 'eventId es requerido'
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'title es requerido'
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'message es requerido'
      });
    }

    if (title.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'title no puede exceder 100 caracteres'
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'message no puede exceder 500 caracteres'
      });
    }

    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      select: { id: true, organizerId: true, title: true }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }

    if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No eres el organizador de este evento'
      });
    }

    const result = await createEventNotifications(event.id, {
      type: 'ORGANIZER_ANNOUNCEMENT',
      title: title.trim(),
      message: message.trim(),
      link: `/events/${event.id}`
    });

    res.status(201).json({
      success: true,
      message: `Notificaci\u00f3n enviada a ${result.recipientCount} usuarios`,
      data: { recipientCount: result.recipientCount }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear notificaci\u00f3n'
    });
  }
});

module.exports = router;
