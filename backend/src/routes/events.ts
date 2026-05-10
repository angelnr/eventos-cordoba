import { Router, Request, Response } from 'express';
import path from 'path';
import { PrismaClient, EventStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { upload } from '../middleware/upload';
import { saveImage, deleteImage, isLocalImage } from '../services/storageService';
import { createEventNotifications } from '../services/notificationService';
import {
  validateFilterParams,
  buildFilterWhere,
  getAvailabilityIds,
  buildAppliedFiltersSummary
} from '../services/eventFilters';
import { requireAuth, requireOrganizer, optionalAuth } from '../middleware/auth';
import { transitionEventStatus, getAllowedTransitions, EVENT_STATUS_CONFIG } from '../services/eventStatusService';

const router = Router();
const prisma = new PrismaClient();

// Middleware condicional: si es multipart/form-data, usar Multer.
// Si no, pasar al handler (express.json() ya procesó el body).
const conditionalUpload = (req: Request, res: Response, next: any) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return next();
  }

  upload.single('image')(req, res, (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'El archivo excede el tamaño máximo de 5MB.'
        });
      }
      if (err.message === 'INVALID_EXTENSION' || err.message === 'INVALID_MIME_TYPE') {
        return res.status(400).json({
          success: false,
          error: 'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.'
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Error al procesar el archivo.'
      });
    }
    next();
  });
};

// GET /api/events - Listar eventos con filtros avanzados
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { cleaned, errors } = validateFilterParams(req.query as Record<string, any>);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Parámetros de filtro inválidos',
        details: errors
      });
    }

    const where: any = buildFilterWhere(cleaned);
    const skip = (cleaned.page! - 1) * cleaned.limit!;
    const take = cleaned.limit!;

    // Si hay filtro de disponibilidad, obtener IDs primero
    if (cleaned.available || cleaned.soldOut) {
      const ids = await getAvailabilityIds(cleaned);

      if (ids !== null && ids.length === 0) {
        return res.json({
          success: true,
          data: [],
          pagination: {
            page: cleaned.page,
            limit: take,
            total: 0,
            pages: 0,
            hasNext: false,
            hasPrev: false
          },
          filters: { applied: buildAppliedFiltersSummary(cleaned) }
        });
      }

      if (ids !== null) {
        if (where.AND) {
          where.AND.push({ id: { in: ids } });
        } else {
          where.id = { in: ids };
        }
      }
    }

    const orderBy: any = {};
    orderBy[cleaned.sortBy!] = cleaned.sortOrder;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        select: {
          id: true, slug: true, title: true, description: true,
          date: true, location: true, latitude: true, longitude: true,
          capacity: true, status: true, imageUrl: true, price: true,
          organizerId: true, categoryId: true, createdAt: true, updatedAt: true,
          averageRating: true, reviewCount: true, currentBookings: true,
          organizer: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true, color: true } }
        },
        orderBy,
        skip,
        take
      }),
      prisma.event.count({ where })
    ]);

    // Calcular availableSpots desde currentBookings (columna denormalizada)
    const eventsWithStats = events.map(event => ({
      ...event,
      availableSpots: Math.max(0, event.capacity - event.currentBookings),
      totalBookings: event.currentBookings
    }));

    // Añadir información de favoritos si el usuario está autenticado
    let eventsWithFavorites = eventsWithStats;

    if (req.user) {
      const eventIds = eventsWithStats.map(e => e.id);
      if (eventIds.length > 0) {
        const userFavorites = await prisma.favorite.findMany({
          where: { userId: req.user.id, eventId: { in: eventIds } },
          select: { eventId: true }
        });
        const favoriteSet = new Set(userFavorites.map(f => f.eventId));
        eventsWithFavorites = eventsWithStats.map(e => ({
          ...e,
          isFavorited: favoriteSet.has(e.id)
        }));
      }
    }

    // Añadir conteo de favoritos
    let eventsWithFavCounts = eventsWithFavorites;
    if (eventsWithFavorites.length > 0) {
      const eventIds = eventsWithFavorites.map(e => e.id);
      const favoriteCounts = await prisma.favorite.groupBy({
        by: ['eventId'],
        where: { eventId: { in: eventIds } },
        _count: { eventId: true }
      });
      const countMap: Record<number, number> = {};
      favoriteCounts.forEach(fc => { countMap[fc.eventId] = fc._count.eventId; });
      eventsWithFavCounts = eventsWithFavorites.map(e => ({
        ...e,
        favoriteCount: countMap[e.id] || 0
      }));
    }

    const pages = Math.ceil(total / take);

    res.json({
      success: true,
      data: eventsWithFavCounts,
      pagination: {
        page: cleaned.page,
        limit: take,
        total,
        pages,
        hasNext: cleaned.page! < pages,
        hasPrev: cleaned.page! > 1
      },
      filters: {
        applied: buildAppliedFiltersSummary(cleaned)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener eventos'
    });
  }
});

// GET /api/events/my-events - Eventos organizados por el usuario actual (DEBE IR ANTES DE /:id)
router.get('/my-events', requireAuth, requireOrganizer, async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: { organizerId: req.user!.id },
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, color: true, description: true }
        },
        bookings: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calcular estadísticas para cada evento
    const eventsWithStats = events.map(event => {
      const totalBookings = event.bookings.reduce((sum, booking) =>
        booking.status === 'confirmed' ? sum + booking.quantity : sum, 0
      );

      return {
        ...event,
        totalBookings,
        availableSpots: event.capacity - totalBookings
      };
    });

    res.json({
      success: true,
      data: eventsWithStats
    });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener tus eventos'
    });
  }
});

// GET /api/events/filters-meta - Metadatos para filtros (DEBE IR ANTES DE /:id)
router.get('/filters-meta', async (req: Request, res: Response) => {
  try {
    const [categories, priceRange, totalActive, totalFree, totalSoldOutRaw] = await Promise.all([
      prisma.category.findMany({
        include: { _count: { select: { events: { where: { status: 'SCHEDULED' } } } } },
        orderBy: { name: 'asc' }
      }),
      prisma.event.aggregate({
        where: { status: 'SCHEDULED' },
        _min: { price: true },
        _max: { price: true },
        _avg: { averageRating: true }
      }),
      prisma.event.count({ where: { status: 'SCHEDULED' } }),
      prisma.event.count({ where: { status: 'SCHEDULED', price: 0 } }),
      prisma.$queryRaw<Array<{ count: number }>>`SELECT COUNT(*)::int as count FROM events WHERE status = 'SCHEDULED' AND "currentBookings" >= capacity`
    ]);

    const totalSoldOut = totalSoldOutRaw[0]?.count || 0;

    res.json({
      success: true,
      data: {
        categories: categories.map(c => ({
          id: c.id,
          name: c.name,
          color: c.color,
          eventCount: (c as any)._count.events
        })),
        priceRange: {
          min: priceRange._min.price || 0,
          max: priceRange._max.price || 0
        },
        ratingRange: {
          min: 0,
          max: 5,
          average: Math.round((priceRange._avg.averageRating || 0) * 10) / 10
        },
        totalActiveEvents: totalActive,
        totalFreeEvents: totalFree,
        totalSoldOutEvents: totalSoldOut,
        totalAvailableEvents: totalActive - totalSoldOut
      }
    });
  } catch (error) {
    console.error('Get filters meta error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener metadatos de filtros'
    });
  }
});

// GET /api/events/status-transitions - Transiciones permitidas (DEBE IR ANTES DE /:id)
router.get('/status-transitions', async (req: Request, res: Response) => {
  try {
    const transitions = EVENT_STATUS_CONFIG;
    const data: Record<string, any> = {};
    for (const [status, config] of Object.entries(transitions)) {
      data[status] = {
        label: config.label,
        allowedTransitions: getAllowedTransitions(status as EventStatus),
        canBook: config.canBook,
        canGenerateTicket: config.canGenerateTicket,
        canCheckIn: config.canCheckIn,
        canFavorite: config.canFavorite,
      };
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get status transitions error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener transiciones de estado'
    });
  }
});

// PATCH /api/events/:id/status - Cambiar estado del evento (DEBE IR ANTES DE /:id)
router.patch('/:id/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'El campo status es requerido'
      });
    }

    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId < 1) {
      return res.status(400).json({
        success: false,
        error: 'ID de evento inválido'
      });
    }

    const validStatuses: EventStatus[] = ['SCHEDULED', 'CANCELLED', 'FINISHED', 'FULL'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Estado inválido: ${status}. Valores permitidos: ${validStatuses.join(', ')}`
      });
    }

    // Verificar permisos (solo organizador del evento o admin)
    const event = await prisma.event.findUnique({
      where: { id: parsedId },
      select: { id: true, organizerId: true }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }

    if (event.organizerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para cambiar el estado de este evento'
      });
    }

    const result = await transitionEventStatus(
      parsedId,
      status as EventStatus,
      req.user!.id,
      reason || ''
    );

    res.json({
      success: true,
      message: `Estado actualizado de ${result.log.fromStatus} a ${result.log.toStatus}`,
      data: {
        id: result.event.id,
        title: result.event.title,
        status: result.event.status,
        previousStatus: result.log.fromStatus,
        updatedAt: result.event.updatedAt
      }
    });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    }
    console.error('Update event status error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cambiar el estado del evento'
    });
  }
});

// GET /api/events/:id/status-log - Historial de cambios de estado (DEBE IR ANTES DE /:id)
router.get('/:id/status-log', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId < 1) {
      return res.status(400).json({
        success: false,
        error: 'ID de evento inválido'
      });
    }

    // Verificar permisos (solo organizador del evento o admin)
    const event = await prisma.event.findUnique({
      where: { id: parsedId },
      select: { id: true, organizerId: true }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }

    if (event.organizerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para ver el historial de este evento'
      });
    }

    const [logs, total] = await Promise.all([
      prisma.eventStatusLog.findMany({
        where: { eventId: parsedId },
        include: {
          changedBy: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.eventStatusLog.count({ where: { eventId: parsedId } }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    });
  } catch (error) {
    console.error('Get event status log error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener historial de estados'
    });
  }
});

// GET /api/events/:id - Obtener evento específico
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        organizer: {
          select: { id: true, name: true, email: true, role: true }
        },
        category: {
          select: { id: true, name: true, color: true, description: true }
        },
        bookings: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }

    // Calcular estadísticas
    const totalBookings = event.bookings.reduce((sum, booking) =>
      booking.status === 'confirmed' ? sum + booking.quantity : sum, 0
    );

    const commentCount = await prisma.comment.count({
      where: { eventId: parseInt(id), status: 'approved' }
    });

    const eventWithStats = {
      ...event,
      availableSpots: event.capacity - totalBookings,
      totalBookings,
      commentCount
    };

    // Añadir información de favoritos
    let result: any = { ...eventWithStats };

    if (req.user) {
      const favorite = await prisma.favorite.findUnique({
        where: { userId_eventId: { userId: req.user.id, eventId: parseInt(id) } }
      });
      result.isFavorited = !!favorite;
    }

    result.favoriteCount = await prisma.favorite.count({
      where: { eventId: parseInt(id) }
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener evento'
    });
  }
});

// POST /api/events - Crear evento (requiere autenticación y rol organizador)
router.post('/', requireAuth, requireOrganizer, conditionalUpload, async (req: Request, res: Response) => {
  try {
    const { title, description, date, location, capacity, price, categoryId, imageUrl: externalImageUrl } = req.body;

    // Validaciones
    if (!title || !date || !location || !categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Título, fecha, ubicación y categoría son requeridos'
      });
    }

    // Verificar que la categoría existe
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) }
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    // Determinar imageUrl: archivo subido tiene prioridad sobre URL externa
    let finalImageUrl: string | null = externalImageUrl || null;

    if (req.file) {
      try {
        finalImageUrl = await saveImage(req.file.buffer, path.extname(req.file.originalname));
      } catch (saveError: any) {
        if (saveError.message === 'FILE_TOO_LARGE') {
          return res.status(400).json({ success: false, error: 'El archivo excede el tamaño máximo de 5MB.' });
        }
        if (saveError.message === 'INVALID_FILE_TYPE' || saveError.message === 'INVALID_MIME_TYPE' || saveError.message === 'INVALID_EXTENSION') {
          return res.status(400).json({ success: false, error: 'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.' });
        }
        throw saveError;
      }
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        location,
        capacity: capacity ? parseInt(capacity) : 100,
        price: price ? parseFloat(price) : 0,
        categoryId: parseInt(categoryId),
        organizerId: req.user!.id,
        imageUrl: finalImageUrl
      },
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, color: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      data: event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear evento'
    });
  }
});

// PUT /api/events/:id - Actualizar evento (solo organizador del evento o admin)
router.put('/:id', requireAuth, conditionalUpload, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, capacity, price, categoryId, imageUrl: externalImageUrl, status } = req.body;

    if (status) {
      return res.status(400).json({
        success: false,
        error: 'Para cambiar el estado del evento, usa PATCH /api/events/:id/status'
      });
    }

    // Buscar el evento
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }

    // Verificar permisos (solo organizador del evento o admin)
    if (event.organizerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para editar este evento'
      });
    }

    // Si se cambia la categoría, verificar que existe
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) }
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          error: 'Categoría no encontrada'
        });
      }
    }

    const parsedPrice = price !== undefined ? parseFloat(price) : undefined;
    const parsedCapacity = capacity !== undefined ? parseInt(capacity) : undefined;
    const parsedCategoryId = categoryId !== undefined ? parseInt(categoryId) : undefined;

    // Construir objeto de actualización
    const updateData: Record<string, any> = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date) updateData.date = new Date(date);
    if (location) updateData.location = location;
    if (parsedCapacity !== undefined && !Number.isNaN(parsedCapacity)) updateData.capacity = parsedCapacity;
    if (parsedPrice !== undefined && !Number.isNaN(parsedPrice)) updateData.price = parsedPrice;
    if (parsedCategoryId !== undefined && !Number.isNaN(parsedCategoryId)) updateData.categoryId = parsedCategoryId;

    // Manejo de imagen
    if (req.file) {
      // Nueva imagen subida — guardar y reemplazar la anterior
      try {
        const oldImageUrl = event.imageUrl;
        updateData.imageUrl = await saveImage(req.file.buffer, path.extname(req.file.originalname));
        if (isLocalImage(oldImageUrl)) {
          await deleteImage(oldImageUrl).catch(() => {});
        }
      } catch (saveError: any) {
        if (saveError.message === 'FILE_TOO_LARGE') {
          return res.status(400).json({ success: false, error: 'El archivo excede el tamaño máximo de 5MB.' });
        }
        if (saveError.message === 'INVALID_FILE_TYPE' || saveError.message === 'INVALID_MIME_TYPE' || saveError.message === 'INVALID_EXTENSION') {
          return res.status(400).json({ success: false, error: 'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.' });
        }
        throw saveError;
      }
    } else if (externalImageUrl !== undefined) {
      // Se envió imageUrl (vacío: eliminar imagen, URL: reemplazar)
      if (externalImageUrl === '' || externalImageUrl === 'null') {
        if (isLocalImage(event.imageUrl)) {
          await deleteImage(event.imageUrl).catch(() => {});
        }
        updateData.imageUrl = null;
      } else {
        if (isLocalImage(event.imageUrl)) {
          await deleteImage(event.imageUrl).catch(() => {});
        }
        updateData.imageUrl = externalImageUrl;
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, color: true }
        }
      }
    });

    // Generar notificaciones si cambió la fecha
    if (updateData.date && new Date(updateData.date).getTime() !== new Date(event.date).getTime()) {
      const newDate = new Date(updateData.date);
      const formattedDate = newDate.toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      createEventNotifications(parseInt(id), {
        type: 'EVENT_DATE_CHANGED' as any,
        title: 'Cambio de fecha',
        message: `La fecha del evento "${event.title}" ha cambiado al ${formattedDate}.`,
        link: `/events/${id}`
      }).catch(err => console.error('Error creating date change notifications:', err));
    }

    res.json({
      success: true,
      message: 'Evento actualizado exitosamente',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar evento'
    });
  }
});

// DELETE /api/events/:id - Eliminar evento (solo organizador del evento o admin)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Buscar el evento
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }

    // Verificar permisos (solo organizador del evento o admin)
    if (event.organizerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para eliminar este evento'
      });
    }

    // Notificar a los usuarios antes de eliminar el evento
    createEventNotifications(parseInt(id), {
      type: 'EVENT_CANCELLED' as any,
      title: 'Evento eliminado',
      message: `El evento "${event.title}" ha sido eliminado.`,
      link: null as any
    }).catch(err => console.error('Error creating deletion notifications:', err));

    // Eliminar imagen del filesystem si es local
    if (isLocalImage(event.imageUrl)) {
      await deleteImage(event.imageUrl).catch(() => {});
    }

    // Eliminar favoritos del evento para evitar error de FK RESTRICT
    await prisma.favorite.deleteMany({
      where: { eventId: parseInt(id) }
    });

    await prisma.event.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar evento'
    });
  }
});

// POST /api/events/:id/image - Subir imagen para evento (requiere autenticación)
router.post('/:id/image', requireAuth, (req: Request, res: Response, next: any) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return res.status(400).json({
      success: false,
      error: 'Content-Type debe ser multipart/form-data'
    });
  }

  upload.single('image')(req, res, (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, error: 'El archivo excede el tamaño máximo de 5MB.' });
      }
      if (err.message === 'INVALID_EXTENSION' || err.message === 'INVALID_MIME_TYPE') {
        return res.status(400).json({ success: false, error: 'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.' });
      }
      return res.status(400).json({ success: false, error: 'Error al procesar el archivo.' });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Campo "image" no encontrado en la solicitud'
      });
    }

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }

    // Verificar permisos (solo organizador del evento o admin)
    if (event.organizerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para editar este evento'
      });
    }

    // Guardar la nueva imagen
    let imageUrl;
    try {
      imageUrl = await saveImage(req.file.buffer, path.extname(req.file.originalname));
    } catch (saveError: any) {
      if (saveError.message === 'FILE_TOO_LARGE') {
        return res.status(400).json({ success: false, error: 'El archivo excede el tamaño máximo de 5MB.' });
      }
      if (saveError.message === 'INVALID_FILE_TYPE' || saveError.message === 'INVALID_MIME_TYPE' || saveError.message === 'INVALID_EXTENSION') {
        return res.status(400).json({ success: false, error: 'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.' });
      }
      throw saveError;
    }

    // Eliminar imagen anterior si era local
    if (isLocalImage(event.imageUrl)) {
      await deleteImage(event.imageUrl).catch(() => {});
    }

    // Actualizar el evento en la base de datos
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: { imageUrl },
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, color: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: {
        event: updatedEvent,
        imageUrl
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al subir imagen'
    });
  }
});

// DELETE /api/events/:id/image - Eliminar imagen de evento
router.delete('/:id/image', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Evento no encontrado'
      });
    }

    if (event.organizerId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para editar este evento'
      });
    }

    if (!event.imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'El evento no tiene imagen'
      });
    }

    // Eliminar archivo del filesystem si es imagen local
    if (isLocalImage(event.imageUrl)) {
      await deleteImage(event.imageUrl);
    }

    // Actualizar BD
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: { imageUrl: null },
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, color: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar imagen'
    });
  }
});

export default router;
