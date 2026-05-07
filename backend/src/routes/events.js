const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { saveFile } = require('../utils/fileUpload');

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

// Middleware para verificar rol de organizador o admin
const requireOrganizer = (req, res, next) => {
  if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Se requieren permisos de organizador'
    });
  }
  next();
};

// GET /api/events - Listar eventos con filtros
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      dateFrom,
      dateTo,
      status = 'active',
      sortBy = 'date',
      sortOrder = 'asc',
      organizerId
    } = req.query;

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Construir filtros
    const where = {
      status: status
    };

    if (category) {
      where.categoryId = parseInt(category);
    }

    if (organizerId) {
      where.organizerId = parseInt(organizerId);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }

    // Construir ordenamiento
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const events = await prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, color: true }
        },
        bookings: {
          select: { id: true, quantity: true, status: true }
        }
      },
      orderBy,
      skip,
      take
    });

    // Calcular estadísticas de reservas para cada evento
    const eventsWithStats = events.map(event => {
      const totalBookings = event.bookings.reduce((sum, booking) =>
        booking.status === 'confirmed' ? sum + booking.quantity : sum, 0
      );

      return {
        ...event,
        availableSpots: event.capacity - totalBookings,
        totalBookings
      };
    });

    const total = await prisma.event.count({ where });

    res.json({
      success: true,
      data: eventsWithStats,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take)
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

// GET /api/events/my-events - Eventos organizados por el usuario actual (DEBE IR ANTES de /:id)
router.get('/my-events', requireAuth, requireOrganizer, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { organizerId: req.user.id },
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

// GET /api/events/:id - Obtener evento específico
router.get('/:id', async (req, res) => {
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

    const eventWithStats = {
      ...event,
      availableSpots: event.capacity - totalBookings,
      totalBookings
    };

    res.json({
      success: true,
      data: eventWithStats
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
router.post('/', requireAuth, requireOrganizer, async (req, res) => {
  try {
    const { title, description, date, location, capacity, price, categoryId, imageUrl } = req.body;

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

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        capacity: capacity || 100,
        price: price ?? 0,
        categoryId: parseInt(categoryId),
        organizerId: req.user.id,
        imageUrl
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
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, capacity, price, categoryId, imageUrl, status } = req.body;

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
    if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
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

    const parsedPrice =
  price !== undefined ? parseFloat(price) : undefined;

const parsedCapacity =
  capacity !== undefined ? parseInt(capacity) : undefined;

const parsedCategoryId =
  categoryId !== undefined ? parseInt(categoryId) : undefined;

const updatedEvent = await prisma.event.update({
  where: {
    id: parseInt(id)
  },
  data: {
    ...(title && { title }),

    ...(description !== undefined && {
      description
    }),

    ...(date && {
      date: new Date(date)
    }),

    ...(location && {
      location
    }),

    ...(parsedCapacity !== undefined &&
      !Number.isNaN(parsedCapacity) && {
        capacity: parsedCapacity
      }),

    ...(parsedPrice !== undefined &&
      !Number.isNaN(parsedPrice) && {
        price: parsedPrice
      }),

    ...(parsedCategoryId !== undefined &&
      !Number.isNaN(parsedCategoryId) && {
        categoryId: parsedCategoryId
      }),

    ...(imageUrl !== undefined && {
      imageUrl
    }),

    ...(status && {
      status
    })
  },

  include: {
    organizer: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },

    category: {
      select: {
        id: true,
        name: true,
        color: true
      }
    }
  }
});

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
router.delete('/:id', requireAuth, async (req, res) => {
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
    if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para eliminar este evento'
      });
    }

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

// POST /api/events/:id/image - Subir imagen para evento
router.post('/:id/image', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

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
    if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para editar este evento'
      });
    }

    // Verificar que la solicitud es multipart/form-data
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({
        success: false,
        error: 'Content-Type debe ser multipart/form-data'
      });
    }

    // Obtener el límite de tamaño del body
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (contentLength > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'El archivo excede el tamaño máximo de 5MB'
      });
    }

    // Parsear multipart/form-data manualmente
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      return res.status(400).json({
        success: false,
        error: 'Formato multipart/form-data inválido'
      });
    }

    // Leer el body completo
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);

    // Buscar el campo "file" en el body multipart
    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const parts = splitBufferByBoundary(bodyBuffer, boundaryBuffer);
    
    let fileData = null;
    let fileName = null;
    let fileType = null;

    for (const part of parts) {
      if (part.length === 0) continue;
      
      const partStr = part.toString('utf8');
      const headerEnd = partStr.indexOf('\r\n\r\n');
      if (headerEnd === -1) continue;
      
      const headers = partStr.substring(0, headerEnd);
      const content = part.slice(headerEnd + 4);
      
      // Buscar el campo "file"
      if (headers.includes('name="file"')) {
        // Extraer nombre de archivo y tipo
        const filenameMatch = headers.match(/filename="([^"]+)"/);
        const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/);
        
        if (filenameMatch && contentTypeMatch) {
          fileName = filenameMatch[1];
          fileType = contentTypeMatch[1].trim();
          fileData = content;
          break;
        }
      }
    }

    if (!fileData || !fileType) {
      return res.status(400).json({
        success: false,
        error: 'Campo "file" no encontrado en la solicitud'
      });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de archivo no permitido. Solo se aceptan JPEG y PNG'
      });
    }

    // Crear objeto de archivo para saveFile
    const file = {
      mimetype: fileType,
      size: fileData.length,
      stream: () => {
        const { Readable } = require('stream');
        const readable = new Readable();
        readable.push(fileData);
        readable.push(null);
        return readable;
      }
    };

    // Guardar el archivo
    const imageUrl = await saveFile(file, parseInt(id));

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
    
    if (error.message.includes('Tipo de archivo no permitido') || 
        error.message.includes('excede el tamaño máximo')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al subir imagen'
    });
  }
});

// Función auxiliar para dividir buffer por boundary
function splitBufferByBoundary(buffer, boundary) {
  const parts = [];
  let start = 0;
  
  while (start < buffer.length) {
    // Encontrar el siguiente boundary
    const boundaryIndex = buffer.indexOf(boundary, start);
    if (boundaryIndex === -1) break;
    
    // Saltar el boundary y el CRLF
    const partStart = start;
    const partEnd = boundaryIndex;
    
    if (partEnd > partStart) {
      parts.push(buffer.slice(partStart, partEnd));
    }
    
    // Mover el inicio después del boundary
    start = boundaryIndex + boundary.length;
    
    // Si el siguiente byte es '--', es el boundary final
    if (buffer[start] === 0x2D && buffer[start + 1] === 0x2D) {
      break;
    }
    
    // Saltar CRLF después del boundary
    if (buffer[start] === 0x0D && buffer[start + 1] === 0x0A) {
      start += 2;
    }
  }
  
  return parts;
}

module.exports = router;
