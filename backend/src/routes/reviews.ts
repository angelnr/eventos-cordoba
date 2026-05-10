import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Rate limiting en memoria (5 reseñas por hora por usuario)
const reviewRateLimit = new Map<number, { count: number; resetAt: number }>();

function checkReviewRateLimit(userId: number): boolean {
  const MAX_REVIEWS_PER_HOUR = 5;
  const WINDOW_MS = 60 * 60 * 1000;
  const now = Date.now();
  const record = reviewRateLimit.get(userId);
  if (!record || now > record.resetAt) {
    reviewRateLimit.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_REVIEWS_PER_HOUR) {
    return false;
  }
  record.count++;
  return true;
}

// POST /api/reviews - Crear reseña
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { eventId, rating } = req.body;

    // Validar rating
    if (rating === undefined || rating === null) {
      return res.status(400).json({
        success: false,
        error: 'La puntuación es requerida'
      });
    }
    const parsedRating = parseInt(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'La puntuación debe ser un número entre 1 y 5'
      });
    }

    // Validar eventId
    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: 'eventId es requerido'
      });
    }
    const parsedEventId = parseInt(eventId);
    if (!Number.isInteger(parsedEventId) || parsedEventId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'eventId inválido'
      });
    }

    // Rate limit
    if (!checkReviewRateLimit(req.user!.id)) {
      return res.status(429).json({
        success: false,
        error: 'Demasiadas reseñas. Espera un momento.'
      });
    }

    // Buscar evento
    const event = await prisma.event.findUnique({
      where: { id: parsedEventId },
      select: { id: true, date: true, organizerId: true, averageRating: true, reviewCount: true }
    });

    if (!event) {
      return res.status(400).json({
        success: false,
        error: 'El evento no existe'
      });
    }

    // Validar evento finalizado
    if (new Date(event.date) >= new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Solo puedes reseñar eventos que ya han finalizado'
      });
    }

    // Validar que no es el organizador
    if (event.organizerId === req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'No puedes reseñar tu propio evento'
      });
    }

    // Crear reseña + actualizar media en transacción
    let newReview;
    try {
      const newAvg = (event.averageRating * event.reviewCount + parsedRating) / (event.reviewCount + 1);
      const roundedAvg = Math.round(newAvg * 100) / 100;

      const result = await prisma.$transaction([
        prisma.review.create({
          data: {
            rating: parsedRating,
            userId: req.user!.id,
            eventId: parsedEventId,
          },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        }),
        prisma.event.update({
          where: { id: parsedEventId },
          data: {
            averageRating: roundedAvg,
            reviewCount: { increment: 1 },
          },
        }),
      ]);
      newReview = result[0];
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          error: 'Ya has reseñado este evento'
        });
      }
      throw error;
    }

    console.log('POST /api/reviews - User:', req.user!.id, 'Event:', parsedEventId, 'Rating:', parsedRating);

    res.status(201).json({
      success: true,
      message: 'Reseña creada exitosamente',
      data: newReview,
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear reseña'
    });
  }
});

// PUT /api/reviews/:id - Actualizar reseña
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    // Validar rating
    if (rating === undefined || rating === null) {
      return res.status(400).json({
        success: false,
        error: 'La puntuación es requerida'
      });
    }
    const parsedRating = parseInt(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        error: 'La puntuación debe ser un número entre 1 y 5'
      });
    }

    // Buscar reseña existente
    const existingReview = await prisma.review.findUnique({
      where: { id: parseInt(id) },
      include: {
        event: { select: { organizerId: true, averageRating: true, reviewCount: true } },
      },
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        error: 'Reseña no encontrada'
      });
    }

    // Solo el propietario puede actualizar
    if (existingReview.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para editar esta reseña'
      });
    }

    // Calcular nueva media
    const oldRating = existingReview.rating;
    const eventData = existingReview.event;
    const newAvg = (eventData.averageRating * eventData.reviewCount - oldRating + parsedRating) / eventData.reviewCount;
    const roundedAvg = Math.round(Math.max(0, newAvg) * 100) / 100;

    // Actualizar reseña + media en transacción
    const result = await prisma.$transaction([
      prisma.review.update({
        where: { id: parseInt(id) },
        data: { rating: parsedRating },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.event.update({
        where: { id: existingReview.eventId },
        data: { averageRating: roundedAvg },
      }),
    ]);

    console.log('PUT /api/reviews/:id - User:', req.user!.id, 'Review:', id, 'New rating:', parsedRating);

    res.json({
      success: true,
      message: 'Reseña actualizada exitosamente',
      data: result[0],
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar reseña'
    });
  }
});

// DELETE /api/reviews/:id - Eliminar reseña
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar reseña con datos del evento
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
      include: {
        event: { select: { organizerId: true, averageRating: true, reviewCount: true } },
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Reseña no encontrada'
      });
    }

    // Verificar permisos: propietario, admin u organizador del evento
    const isOwner = review.userId === req.user!.id;
    const isAdmin = req.user!.role === 'admin';
    const isOrganizer = review.event.organizerId === req.user!.id;

    if (!isOwner && !isAdmin && !isOrganizer) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para eliminar esta reseña'
      });
    }

    // Calcular nueva media
    const eventData = review.event;
    const newCount = eventData.reviewCount - 1;
    const newAvg = newCount > 0
      ? (eventData.averageRating * eventData.reviewCount - review.rating) / newCount
      : 0;
    const roundedAvg = Math.round(Math.max(0, newAvg) * 100) / 100;

    // Eliminar reseña + actualizar media en transacción
    await prisma.$transaction([
      prisma.review.delete({ where: { id: parseInt(id) } }),
      prisma.event.update({
        where: { id: review.eventId },
        data: {
          averageRating: roundedAvg,
          reviewCount: newCount,
        },
      }),
    ]);

    console.log('DELETE /api/reviews/:id - User:', req.user!.id, 'Review:', id);

    res.json({
      success: true,
      message: 'Reseña eliminada exitosamente'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar reseña'
    });
  }
});

// GET /api/reviews/events/:eventId/my-review - Obtener reseña del usuario actual
router.get('/events/:eventId/my-review', requireAuth, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const parsedEventId = parseInt(eventId);

    const review = await prisma.review.findUnique({
      where: {
        userId_eventId: { userId: req.user!.id, eventId: parsedEventId },
      },
    });

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Get my review error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener tu reseña'
    });
  }
});

// GET /api/reviews/events/:eventId/stats - Estadísticas de reseñas del evento
router.get('/events/:eventId/stats', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const parsedEventId = parseInt(eventId);

    // Buscar evento para obtener averageRating y reviewCount (ya persistidos)
    const event = await prisma.event.findUnique({
      where: { id: parsedEventId },
      select: { averageRating: true, reviewCount: true },
    });

    if (!event) {
      return res.status(400).json({
        success: false,
        error: 'El evento no existe'
      });
    }

    // Calcular distribución: GROUP BY rating
    const distributionRaw = await prisma.review.groupBy({
      by: ['rating'],
      where: { eventId: parsedEventId },
      _count: { rating: true },
    });

    // Formatear distribución: asegurar que 1-5 estén presentes
    const distribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    distributionRaw.forEach((d) => {
      distribution[String(d.rating)] = d._count.rating;
    });

    // Reseña del usuario si está autenticado
    let userReview = null;
    if (req.user) {
      userReview = await prisma.review.findUnique({
        where: {
          userId_eventId: { userId: req.user.id, eventId: parsedEventId },
        },
        select: { id: true, rating: true, createdAt: true, updatedAt: true },
      });
    }

    res.json({
      success: true,
      data: {
        averageRating: event.averageRating,
        reviewCount: event.reviewCount,
        distribution,
        userReview,
      },
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas de reseñas'
    });
  }
});

// GET /api/reviews/events/:eventId - Listar reseñas paginadas
router.get('/events/:eventId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const parsedEventId = parseInt(eventId);

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: parsedEventId },
      select: { id: true },
    });

    if (!event) {
      return res.status(400).json({
        success: false,
        error: 'El evento no existe'
      });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));

    const total = await prisma.review.count({
      where: { eventId: parsedEventId },
    });

    const reviews = await prisma.review.findMany({
      where: { eventId: parsedEventId },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const data = reviews.map((review) => ({
      ...review,
      isOwner: req.user ? review.userId === req.user.id : false,
    }));

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener reseñas'
    });
  }
});

export default router;
