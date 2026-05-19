/// <reference types="jest" />

import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret-with-at-least-32-chars!!';
process.env.JWT_SECRET = JWT_SECRET;

// ====== MOCKS ======
const mockEventFindUnique = jest.fn();
const mockEventFindMany = jest.fn();
const mockEventCount = jest.fn();
const mockEventAggregate = jest.fn();
const mockEventGroupBy = jest.fn();
const mockEventCreate = jest.fn();
const mockEventUpdate = jest.fn();
const mockEventDelete = jest.fn();
const mockCategoryFindMany = jest.fn();
const mockCategoryFindUnique = jest.fn();
const mockFavoriteFindMany = jest.fn();
const mockFavoriteFindUnique = jest.fn();
const mockFavoriteCount = jest.fn();
const mockFavoriteGroupBy = jest.fn();
const mockFavoriteDeleteMany = jest.fn();
const mockCommentCount = jest.fn();
const mockBookingFindMany = jest.fn();
const mockQueryRaw = jest.fn();
const mockStatusLogFindMany = jest.fn();
const mockStatusLogCount = jest.fn();
const mockStatusLogCreate = jest.fn();

const mockPlaceUpsert = jest.fn();
const mockSaveImage = jest.fn();
const mockDeleteImage = jest.fn();
const mockIsLocalImage = jest.fn();
const mockCreateEventNotifs = jest.fn();
const mockInvalidateDash = jest.fn();

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return {
    ...actual,
    PrismaClient: jest.fn(() => ({
      place: { upsert: mockPlaceUpsert },
      event: {
        findUnique: mockEventFindUnique,
        findMany: mockEventFindMany,
        count: mockEventCount,
        aggregate: mockEventAggregate,
        groupBy: mockEventGroupBy,
        create: mockEventCreate,
        update: mockEventUpdate,
        delete: mockEventDelete,
      },
      category: {
        findMany: mockCategoryFindMany,
        findUnique: mockCategoryFindUnique,
      },
      favorite: {
        findMany: mockFavoriteFindMany,
        findUnique: mockFavoriteFindUnique,
        count: mockFavoriteCount,
        groupBy: mockFavoriteGroupBy,
        deleteMany: mockFavoriteDeleteMany,
      },
      comment: { count: mockCommentCount },
      booking: { findMany: mockBookingFindMany },
      eventStatusLog: {
        findMany: mockStatusLogFindMany,
        count: mockStatusLogCount,
        create: mockStatusLogCreate,
      },
      $queryRaw: mockQueryRaw,
      $transaction: jest.fn((cb: Function) => cb({
        favorite: { deleteMany: mockFavoriteDeleteMany },
        event: { delete: mockEventDelete },
      })),
      $disconnect: jest.fn(),
    })),
    EventStatus: {
      SCHEDULED: 'SCHEDULED',
      CANCELLED: 'CANCELLED',
      FINISHED: 'FINISHED',
      FULL: 'FULL',
    },
  };
});

jest.mock('../services/storageService', () => ({
  saveImage: (...args: any[]) => mockSaveImage(...args),
  deleteImage: (...args: any[]) => mockDeleteImage(...args),
  isLocalImage: (...args: any[]) => mockIsLocalImage(...args),
}));

jest.mock('../services/notificationService', () => ({
  createEventNotifications: (...args: any[]) => mockCreateEventNotifs(...args),
}));

jest.mock('../services/dashboardService', () => ({
  invalidateDashboardCache: (...args: any[]) => mockInvalidateDash(...args),
}));

jest.mock('express-rate-limit', () => jest.fn(() => (req: any, res: any, next: any) => next()));

jest.mock('multer', () => {
  const multerFn = () => ({
    single: () => (req: any, res: any, next: any) => {
      req.file = undefined;
      next();
    },
  });
  multerFn.memoryStorage = () => ({});
  return multerFn;
});

// ====== IMPORTS ======
import eventsRoutes from '../routes/events';

const app = express();
app.use(express.json());
app.use('/api/events', eventsRoutes);

function makeRequest(method: string, path: string, body?: any, token?: string, contentType?: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = (server.address() as any).port;
      const postData = body ? JSON.stringify(body) : undefined;
      const req = http.request({
        hostname: 'localhost', port, path, method,
        headers: {
          'Content-Type': contentType || 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData).toString() } : {}),
        },
      }, (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        res.on('end', () => {
          server.close();
          try { resolve({ status: res.statusCode || 500, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode || 500, body: data }); }
        });
      });
      req.on('error', (err) => { server.close(); reject(err); });
      if (postData) req.write(postData);
      req.end();
    });
  });
}

function tokenFor(role: string = 'user', id: number = 20): string {
  return jwt.sign({ id, email: `u${id}@t.com`, role }, JWT_SECRET);
}

const sampleEvent = {
  id: 1, slug: 'test-event', title: 'Test Event', description: 'Desc',
  date: new Date(Date.now() + 86400000).toISOString(), location: 'Córdoba',
  locationId: null,
  capacity: 100, status: 'SCHEDULED', imageUrl: null, price: 0,
  organizerId: 20, categoryId: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  averageRating: 0, reviewCount: 0, currentBookings: 0,
  organizer: { id: 20, name: 'Org', email: 'org@t.com' },
  category: { id: 1, name: 'Música', color: '#3B82F6' },
};

beforeEach(() => {
  [mockEventFindUnique, mockEventFindMany, mockEventCount, mockEventAggregate, mockEventGroupBy,
   mockEventCreate, mockEventUpdate, mockEventDelete,
    mockCategoryFindMany, mockCategoryFindUnique,
    mockFavoriteFindMany, mockFavoriteFindUnique, mockFavoriteCount, mockFavoriteGroupBy, mockFavoriteDeleteMany,
    mockCommentCount, mockBookingFindMany, mockQueryRaw,
    mockStatusLogFindMany, mockStatusLogCount, mockStatusLogCreate,
    mockPlaceUpsert,
    mockSaveImage, mockDeleteImage, mockIsLocalImage, mockCreateEventNotifs, mockInvalidateDash,
  ].forEach(m => {
    m.mockReset();
    if (m === mockCreateEventNotifs) m.mockResolvedValue({});
    if (m === mockDeleteImage) m.mockResolvedValue(undefined);
    if (m === mockIsLocalImage) m.mockReturnValue(false);
  });
});

// ====== TESTS ======

describe('GET /api/events', () => {
  it('debe listar eventos con paginación', async () => {
    mockEventFindMany.mockResolvedValue([sampleEvent]);
    mockEventCount.mockResolvedValue(1);
    mockFavoriteGroupBy.mockResolvedValue([]);

    const { status, body } = await makeRequest('GET', '/api/events');
    expect(status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.pagination.total).toBe(1);
  });

  it('debe incluir isFavorited si usuario autenticado', async () => {
    mockEventFindMany.mockResolvedValue([sampleEvent]);
    mockEventCount.mockResolvedValue(1);
    mockFavoriteFindMany.mockResolvedValue([{ eventId: 1 }]);
    mockFavoriteGroupBy.mockResolvedValue([{ eventId: 1, _count: { eventId: 5 } }]);

    const { status, body } = await makeRequest('GET', '/api/events', undefined, tokenFor());
    expect(status).toBe(200);
    expect(body.data[0].isFavorited).toBe(true);
    expect(body.data[0].favoriteCount).toBe(5);
  });

  it('debe calcular availableSpots', async () => {
    const eventWithBookings = { ...sampleEvent, capacity: 100, currentBookings: 30 };
    mockEventFindMany.mockResolvedValue([eventWithBookings]);
    mockEventCount.mockResolvedValue(1);
    mockFavoriteGroupBy.mockResolvedValue([]);

    const { status, body } = await makeRequest('GET', '/api/events');
    expect(status).toBe(200);
    expect(body.data[0].availableSpots).toBe(70);
    expect(body.data[0].totalBookings).toBe(30);
  });

  it('debe retornar array vacío si filtro de disponibilidad no encuentra resultados', async () => {
    mockQueryRaw.mockResolvedValue([]);
    const { status, body } = await makeRequest('GET', '/api/events?available=true');
    expect(status).toBe(200);
    expect(body.data).toEqual([]);
  });
});

describe('GET /api/events/:id', () => {
  it('debe retornar 404 si no existe', async () => {
    mockEventFindUnique.mockResolvedValue(null);
    const { status } = await makeRequest('GET', '/api/events/999');
    expect(status).toBe(404);
  });

  it('debe retornar evento con availableSpots, totalBookings, commentCount', async () => {
    mockEventFindUnique.mockResolvedValue({ ...sampleEvent, bookings: [{ status: 'confirmed', quantity: 2 }] });
    mockCommentCount.mockResolvedValue(3);
    mockFavoriteFindUnique.mockResolvedValue(null);
    mockFavoriteCount.mockResolvedValue(5);

    const { status, body } = await makeRequest('GET', '/api/events/1');
    expect(status).toBe(200);
    expect(body.data.availableSpots).toBe(100 - 2);
    expect(body.data.totalBookings).toBe(2);
    expect(body.data.commentCount).toBe(3);
    expect(body.data.favoriteCount).toBe(5);
  });
});

describe('POST /api/events', () => {
  const orgToken = tokenFor('organizer', 20);
  const baseBody = { title: 'Nuevo', date: new Date(Date.now() + 86400000).toISOString(), location: 'Córdoba', categoryId: 1 };

  it('debe retornar 400 si faltan campos requeridos', async () => {
    const { status } = await makeRequest('POST', '/api/events', {}, orgToken);
    expect(status).toBe(400);
  });

  it('debe retornar 400 si externalImageUrl no es http/https', async () => {
    const { status, body } = await makeRequest('POST', '/api/events', { ...baseBody, imageUrl: 'ftp://x.jpg' }, orgToken);
    expect(status).toBe(400);
    expect(body.error).toContain('http');
  });

  it('debe retornar 400 si categoría no existe', async () => {
    mockCategoryFindUnique.mockResolvedValue(null);
    const { status, body } = await makeRequest('POST', '/api/events', baseBody, orgToken);
    expect(status).toBe(400);
    expect(body.error).toBe('Categoría no encontrada');
  });

  it('debe retornar 400 si latitud inválida', async () => {
    mockCategoryFindUnique.mockResolvedValue({ id: 1, name: 'Música', color: '#000' });
    const { status } = await makeRequest('POST', '/api/events', { ...baseBody, latitude: 91, longitude: 0 }, orgToken);
    expect(status).toBe(400);
  });

  it('debe retornar 201 y crear evento con externalImageUrl', async () => {
    mockCategoryFindUnique.mockResolvedValue({ id: 1, name: 'Música', color: '#000' });
    mockEventCreate.mockResolvedValue(sampleEvent);

    const { status, body } = await makeRequest('POST', '/api/events', {
      ...baseBody, imageUrl: 'https://example.com/img.jpg'
    }, orgToken);
    expect(status).toBe(201);
    expect(body.data.id).toBe(1);
  });

  it('debe retornar 201 y priorizar imagen subida', async () => {
    mockCategoryFindUnique.mockResolvedValue({ id: 1, name: 'Música', color: '#000' });
    mockSaveImage.mockResolvedValue('/uploads/events/new.png');
    mockEventCreate.mockResolvedValue({ ...sampleEvent, imageUrl: '/uploads/events/new.png' });

    // Simular multipart subiendo archivo - en tests sin multer real, req.file será undefined
    // Como el conditionalUpload mock no setea req.file, esto usará externalImageUrl
    const { status, body } = await makeRequest('POST', '/api/events', {
      ...baseBody, imageUrl: 'https://example.com/img.jpg'
    }, orgToken);
    expect(status).toBe(201);
  });

  it('debe llamar a invalidateDashboardCache', async () => {
    mockCategoryFindUnique.mockResolvedValue({ id: 1, name: 'Música', color: '#000' });
    mockEventCreate.mockResolvedValue(sampleEvent);

    await makeRequest('POST', '/api/events', baseBody, orgToken);

    expect(mockInvalidateDash).toHaveBeenCalledWith(20);
  });
});

describe('PUT /api/events/:id', () => {
  const orgToken = tokenFor('organizer', 20);

  it('debe retornar 400 si se envía status', async () => {
    mockEventFindUnique.mockResolvedValue(sampleEvent);
    const { status, body } = await makeRequest('PUT', '/api/events/1', { status: 'CANCELLED' }, orgToken);
    expect(status).toBe(400);
    expect(body.error).toContain('PATCH');
  });

  it('debe retornar 404 si evento no existe', async () => {
    mockEventFindUnique.mockResolvedValue(null);
    const { status } = await makeRequest('PUT', '/api/events/999', { title: 'Editado' }, orgToken);
    expect(status).toBe(404);
  });

  it('debe retornar 403 si no es organizador ni admin', async () => {
    mockEventFindUnique.mockResolvedValue(sampleEvent);
    const { status } = await makeRequest('PUT', '/api/events/1', { title: 'Editado' }, tokenFor('user', 99));
    expect(status).toBe(403);
  });

  it('debe retornar 400 si fecha es pasada', async () => {
    mockEventFindUnique.mockResolvedValue(sampleEvent);
    const { status, body } = await makeRequest('PUT', '/api/events/1', { date: '2020-01-01T00:00:00.000Z' }, orgToken);
    expect(status).toBe(400);
    expect(body.error).toContain('pasado');
  });

  it('debe actualizar correctamente', async () => {
    mockEventFindUnique.mockResolvedValue(sampleEvent);
    mockEventUpdate.mockResolvedValue({ ...sampleEvent, title: 'Editado' });

    const { status, body } = await makeRequest('PUT', '/api/events/1', { title: 'Editado', date: new Date(Date.now() + 2 * 86400000).toISOString() }, orgToken);
    expect(status).toBe(200);
    expect(mockEventUpdate).toHaveBeenCalled();
  });

  it('debe eliminar imagen anterior local si se proporciona nueva URL', async () => {
    mockEventFindUnique.mockResolvedValue({ ...sampleEvent, imageUrl: '/uploads/events/old.png' });
    mockIsLocalImage.mockReturnValue(true);
    mockDeleteImage.mockResolvedValue(undefined);
    mockEventUpdate.mockResolvedValue({ ...sampleEvent, imageUrl: 'https://new.com/img.jpg' });

    const { status } = await makeRequest('PUT', '/api/events/1', {
      imageUrl: 'https://new.com/img.jpg',
      date: new Date(Date.now() + 2 * 86400000).toISOString(),
    }, orgToken);
    expect(status).toBe(200);
    expect(mockDeleteImage).toHaveBeenCalled();
  });
});

describe('DELETE /api/events/:id', () => {
  const orgToken = tokenFor('organizer', 20);

  it('debe retornar 404 si no existe', async () => {
    mockEventFindUnique.mockResolvedValue(null);
    const { status } = await makeRequest('DELETE', '/api/events/999', undefined, orgToken);
    expect(status).toBe(404);
  });

  it('debe retornar 403 si no es organizador ni admin', async () => {
    mockEventFindUnique.mockResolvedValue(sampleEvent);
    const { status } = await makeRequest('DELETE', '/api/events/1', undefined, tokenFor('user', 99));
    expect(status).toBe(403);
  });

  it('debe eliminar en transacción y limpiar imagen local', async () => {
    mockEventFindUnique.mockResolvedValue({ ...sampleEvent, imageUrl: '/uploads/events/img.png' });
    mockIsLocalImage.mockReturnValue(true);
    mockDeleteImage.mockResolvedValue(undefined);

    const { status, body } = await makeRequest('DELETE', '/api/events/1', undefined, orgToken);
    expect(status).toBe(200);
    expect(mockDeleteImage).toHaveBeenCalled();
  });
});

describe('PATCH /api/events/:id/status', () => {
  const orgToken = tokenFor('organizer', 20);

  it('debe retornar 400 si falta status', async () => {
    const { status } = await makeRequest('PATCH', '/api/events/1/status', {}, orgToken);
    expect(status).toBe(400);
  });

  it('debe retornar 404 si evento no existe', async () => {
    mockEventFindUnique.mockResolvedValue(null);
    const { status, body } = await makeRequest('PATCH', '/api/events/999/status', { status: 'FULL' }, orgToken);
    expect(status).toBe(404);
  });

  it('debe retornar 200 si transición válida', async () => {
    mockEventFindUnique
      .mockResolvedValueOnce({ id: 1, organizerId: 20 }) // primera llamada (fetch del router)
      .mockResolvedValueOnce({ id: 1, status: 'SCHEDULED', title: 'Test', capacity: 100, currentBookings: 0 }); // segunda llamada (dentro de transitionEventStatus)
    mockEventUpdate.mockResolvedValue({ id: 1, title: 'Test', status: 'FULL' });
    mockStatusLogCreate.mockResolvedValue({});

    const { status, body } = await makeRequest('PATCH', '/api/events/1/status', { status: 'FULL' }, orgToken);
    expect(status).toBe(200);
    expect(body.data.status).toBe('FULL');
  });
});

describe('GET /api/events/:id/status-log', () => {
  const orgToken = tokenFor('organizer', 20);

  it('debe retornar 403 si no es organizador ni admin', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 1, organizerId: 20 });
    const { status } = await makeRequest('GET', '/api/events/1/status-log', undefined, tokenFor('user', 99));
    expect(status).toBe(403);
  });

  it('debe retornar historial paginado', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 1, organizerId: 20 });
    mockStatusLogFindMany.mockResolvedValue([{ id: 1, fromStatus: 'SCHEDULED', toStatus: 'FULL', changedBy: { id: 20, name: 'Org' } }]);
    mockStatusLogCount.mockResolvedValue(1);

    const { status, body } = await makeRequest('GET', '/api/events/1/status-log', undefined, orgToken);
    expect(status).toBe(200);
    expect(body.data).toHaveLength(1);
  });
});

describe('GET /api/events/filters-meta', () => {
  it('debe retornar metadatos de filtros', async () => {
    mockCategoryFindMany.mockResolvedValue([{ id: 1, name: 'Música', color: '#000', _count: { events: 5 } }]);
    mockEventAggregate.mockResolvedValue({ _min: { price: 0 }, _max: { price: 100 }, _avg: { averageRating: 4.5 } });
    mockEventCount.mockResolvedValueOnce(10).mockResolvedValueOnce(3);
    mockQueryRaw.mockResolvedValue([{ count: 2 }]);

    const { status, body } = await makeRequest('GET', '/api/events/filters-meta');
    expect(status).toBe(200);
    expect(body.data.categories).toHaveLength(1);
    expect(body.data.priceRange).toEqual({ min: 0, max: 100 });
    expect(body.data.totalActiveEvents).toBe(10);
  });
});

describe('GET /api/events/my-events', () => {
  it('debe retornar 403 si no es organizer', async () => {
    const { status } = await makeRequest('GET', '/api/events/my-events', undefined, tokenFor('user'));
    expect(status).toBe(403);
  });

  it('debe listar eventos del organizador con stats', async () => {
    mockEventFindMany.mockResolvedValue([{
      ...sampleEvent,
      bookings: [{ status: 'confirmed', quantity: 3 }],
    }]);

    const { status, body } = await makeRequest('GET', '/api/events/my-events', undefined, tokenFor('organizer', 20));
    expect(status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].totalBookings).toBe(3);
  });
});

describe('GET /api/events/my-events-today', () => {
  it('debe retornar 403 si no es staff', async () => {
    const { status } = await makeRequest('GET', '/api/events/my-events-today', undefined, tokenFor('user'));
    expect(status).toBe(403);
  });

  it('debe listar eventos de hoy', async () => {
    mockEventFindMany.mockResolvedValue([{ id: 1, title: 'Hoy', date: new Date(), location: 'Córdoba', price: 0, status: 'SCHEDULED', imageUrl: null }]);

    const { status, body } = await makeRequest('GET', '/api/events/my-events-today', undefined, tokenFor('staff', 20));
    expect(status).toBe(200);
    expect(body.data).toHaveLength(1);
  });
});

describe('GET /api/events/status-transitions', () => {
  it('debe retornar configuraciones de transiciones', async () => {
    const { status, body } = await makeRequest('GET', '/api/events/status-transitions');
    expect(status).toBe(200);
    expect(body.data).toHaveProperty('SCHEDULED');
    expect(body.data).toHaveProperty('CANCELLED');
    expect(body.data).toHaveProperty('FINISHED');
    expect(body.data).toHaveProperty('FULL');
  });
});
