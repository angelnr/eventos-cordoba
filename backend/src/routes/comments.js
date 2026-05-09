const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Rate limiting en memoria
const commentRateLimit = new Map();

function checkRateLimit(userId) {
  const MAX_COMMENTS_PER_HOUR = 10;
  const WINDOW_MS = 60 * 60 * 1000;
  const now = Date.now();
  const record = commentRateLimit.get(userId);
  if (!record || now > record.resetAt) {
    commentRateLimit.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_COMMENTS_PER_HOUR) {
    return false;
  }
  record.count++;
  return true;
}

function sanitizeContent(content) {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

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

// Middleware de autenticación opcional
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // Token inválido — continuar sin usuario
    }
  }
  next();
};

// GET /api/comments/events/:id/comments - Listar comentarios de un evento
router.get('/events/:id/comments', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

    const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }

    const isOrganizerOrAdmin = req.user &&
      (req.user.role === 'admin' || event.organizerId === req.user.id);

    const whereRoot = {
      eventId: parseInt(id),
      parentId: null,
    };

    if (!isOrganizerOrAdmin) {
      whereRoot.status = 'approved';
    }

    const total = await prisma.comment.count({ where: whereRoot });

    const comments = await prisma.comment.findMany({
      where: whereRoot,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    let data = comments.map(comment => {
      let replies = comment.replies;

      if (!isOrganizerOrAdmin) {
        replies = replies.filter(r => r.status === 'approved');
      }

      const mappedReplies = replies.map(reply => ({
        ...reply,
        isOwner: req.user ? reply.userId === req.user.id : false,
        isHidden: reply.status === 'hidden',
      }));

      return {
        ...comment,
        isOwner: req.user ? comment.userId === req.user.id : false,
        isHidden: comment.status === 'hidden',
        replies: mappedReplies,
      };
    });

    if (!isOrganizerOrAdmin) {
      data = data.filter(c => c.status === 'approved');
    }

    const totalComments = await prisma.comment.count({
      where: { eventId: parseInt(id), status: 'approved' }
    });

    const totalReplies = await prisma.comment.count({
      where: { eventId: parseInt(id), status: 'approved', parentId: { not: null } }
    });

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalComments,
        totalReplies,
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener comentarios'
    });
  }
});

// POST /api/comments - Crear comentario o respuesta
router.post('/', requireAuth, async (req, res) => {
  try {
    const { eventId, content, parentId } = req.body;

    if (!content || content.trim().length < 1) {
      return res.status(400).json({
        success: false,
        error: 'El contenido del comentario es requerido'
      });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'El comentario no puede exceder 1000 caracteres'
      });
    }

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: 'eventId es requerido'
      });
    }

    const event = await prisma.event.findUnique({ where: { id: parseInt(eventId) } });
    if (!event) {
      return res.status(400).json({
        success: false,
        error: 'El evento no existe'
      });
    }

    if (parentId !== null && parentId !== undefined) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parseInt(parentId) } });
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          error: 'Comentario padre no encontrado'
        });
      }
      if (parentComment.parentId !== null) {
        return res.status(400).json({
          success: false,
          error: 'Solo se permite un nivel de respuestas'
        });
      }
      if (parentComment.eventId !== parseInt(eventId)) {
        return res.status(400).json({
          success: false,
          error: 'El comentario padre no pertenece a este evento'
        });
      }
    }

    if (!checkRateLimit(req.user.id)) {
      return res.status(429).json({
        success: false,
        error: 'Demasiados comentarios. Espera un momento antes de comentar de nuevo.'
      });
    }

    const sanitizedContent = sanitizeContent(content);

    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        status: 'approved',
        userId: req.user.id,
        eventId: parseInt(eventId),
        parentId: parentId ? parseInt(parentId) : null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    console.log('POST /api/comments - User:', req.user.id, 'Event:', eventId);

    res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente',
      data: { ...comment, isOwner: true, replies: [] },
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear comentario'
    });
  }
});

// PUT /api/comments/:id - Editar comentario
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length < 1) {
      return res.status(400).json({
        success: false,
        error: 'El contenido del comentario es requerido'
      });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'El comentario no puede exceder 1000 caracteres'
      });
    }

    const comment = await prisma.comment.findUnique({ where: { id: parseInt(id) } });
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comentario no encontrado'
      });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para editar este comentario'
      });
    }

    const EDIT_WINDOW_MS = 15 * 60 * 1000;
    const commentAge = Date.now() - new Date(comment.createdAt).getTime();
    if (commentAge > EDIT_WINDOW_MS) {
      return res.status(403).json({
        success: false,
        error: 'Solo puedes editar comentarios dentro de los 15 minutos posteriores a su creación'
      });
    }

    const sanitizedContent = sanitizeContent(content);

    const updated = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content: sanitizedContent },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.json({
      success: true,
      message: 'Comentario actualizado exitosamente',
      data: { ...updated, isOwner: true },
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar comentario'
    });
  }
});

// DELETE /api/comments/:id - Eliminar comentario (soft delete)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: { event: { select: { organizerId: true } } },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comentario no encontrado'
      });
    }

    const isOwner = comment.userId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isOrganizer = comment.event.organizerId === req.user.id;

    if (!isOwner && !isAdmin && !isOrganizer) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para eliminar este comentario'
      });
    }

    await prisma.comment.update({
      where: { id: parseInt(id) },
      data: {
        content: '[comentario eliminado]',
        status: 'hidden',
      },
    });

    res.json({
      success: true,
      message: 'Comentario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar comentario'
    });
  }
});

// PATCH /api/comments/:id/hide - Moderación: ocultar/mostrar comentario
router.patch('/:id/hide', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['hidden', 'approved'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status debe ser "hidden" o "approved"'
      });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: { event: { select: { organizerId: true } } },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comentario no encontrado'
      });
    }

    const isAdmin = req.user.role === 'admin';
    const isOrganizer = comment.event.organizerId === req.user.id;

    if (!isAdmin && !isOrganizer) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para moderar este comentario'
      });
    }

    const updated = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.json({
      success: true,
      message: status === 'hidden' ? 'Comentario ocultado exitosamente' : 'Comentario visible nuevamente',
      data: { ...updated, isOwner: comment.userId === req.user.id },
    });
  } catch (error) {
    console.error('Hide comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al moderar comentario'
    });
  }
});

module.exports = router;
