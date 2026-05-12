/// <reference types="jest" />

const mockBookingFindMany = jest.fn();
const mockBookingCount = jest.fn();
const mockFavFindMany = jest.fn();
const mockFavCount = jest.fn();
const mockEventFindMany = jest.fn();
const mockEventCount = jest.fn();

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return {
    ...actual,
    PrismaClient: jest.fn(() => ({
      booking: {
        findMany: mockBookingFindMany,
        count: mockBookingCount,
      },
      favorite: {
        findMany: mockFavFindMany,
        count: mockFavCount,
      },
      event: {
        findMany: mockEventFindMany,
        count: mockEventCount,
      },
      $disconnect: jest.fn(),
    })),
  };
});

const mockEventData = (id: number) => ({
  id, slug: `e${id}`, title: `Evento ${id}`, description: 'Desc',
  date: new Date(), location: 'Córdoba', capacity: 100, status: 'SCHEDULED',
  imageUrl: null, price: 0, organizerId: 10, categoryId: 1,
  createdAt: new Date(), updatedAt: new Date(),
  averageRating: 0, reviewCount: 0, currentBookings: 5,
  organizer: { id: 10, name: 'Org', email: 'org@t.com' },
  category: { id: 1, name: 'Música', color: '#3B82F6' },
});

beforeEach(() => {
  mockBookingFindMany.mockReset();
  mockBookingCount.mockReset();
  mockFavFindMany.mockReset();
  mockFavCount.mockReset();
  mockEventFindMany.mockReset();
  mockEventCount.mockReset();
});

describe('getUpcomingEvents', () => {
  it('debe retornar eventos futuros con bookingId y availableSpots', async () => {
    mockFavFindMany.mockResolvedValue([]);
    mockBookingFindMany.mockResolvedValue([
      { id: 10, status: 'confirmed', quantity: 1, Event: mockEventData(1) },
    ]);
    mockBookingCount.mockResolvedValue(1);

    const { getUpcomingEvents } = await import('../services/myEventsService');
    const result = await getUpcomingEvents(10);

    expect(result.events).toHaveLength(1);
    expect(result.events[0].id).toBe(1);
    expect(result.events[0].bookingId).toBe(10);
    expect(result.events[0].availableSpots).toBe(95);
    expect(mockBookingFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 10,
          status: 'confirmed',
        }),
      })
    );
  });

  it('debe retornar total correcto', async () => {
    mockBookingFindMany.mockResolvedValue([]);
    mockBookingCount.mockResolvedValue(7);

    const { getUpcomingEvents } = await import('../services/myEventsService');
    const result = await getUpcomingEvents(10);

    expect(result.total).toBe(7);
  });
});

describe('getPastEvents', () => {
  it('debe retornar eventos pasados ordenados descendente', async () => {
    mockFavFindMany.mockResolvedValue([]);
    mockBookingFindMany.mockResolvedValue([
      { id: 20, status: 'confirmed', quantity: 1, Event: mockEventData(3) },
    ]);
    mockBookingCount.mockResolvedValue(1);

    const { getPastEvents } = await import('../services/myEventsService');
    const result = await getPastEvents(10);

    expect(result.events).toHaveLength(1);
    expect(mockBookingFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { Event: { date: 'desc' } },
      })
    );
  });
});

describe('getFavoriteEvents', () => {
  it('debe retornar favoritos con isFavorited=true', async () => {
    mockFavFindMany.mockResolvedValue([
      { createdAt: new Date(), event: mockEventData(5) },
    ]);
    mockFavCount.mockResolvedValue(1);

    const { getFavoriteEvents } = await import('../services/myEventsService');
    const result = await getFavoriteEvents(10);

    expect(result.events).toHaveLength(1);
    expect(result.events[0].isFavorited).toBe(true);
  });

  it('debe filtrar por categoryId', async () => {
    mockFavFindMany.mockResolvedValue([]);
    mockFavCount.mockResolvedValue(0);

    const { getFavoriteEvents } = await import('../services/myEventsService');
    await getFavoriteEvents(10, { categoryId: 3 });

    expect(mockFavFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          event: expect.objectContaining({ categoryId: 3 }),
        }),
      })
    );
  });
});

describe('getOrganizedEvents', () => {
  it('debe retornar eventos organizados por el usuario', async () => {
    mockFavFindMany.mockResolvedValue([]);
    mockEventFindMany.mockResolvedValue([mockEventData(7)]);
    mockEventCount.mockResolvedValue(1);

    const { getOrganizedEvents } = await import('../services/myEventsService');
    const result = await getOrganizedEvents(10);

    expect(result.events).toHaveLength(1);
    expect(mockEventFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizerId: 10 }),
      })
    );
  });

  it('debe filtrar por status', async () => {
    mockFavFindMany.mockResolvedValue([]);
    mockEventFindMany.mockResolvedValue([]);
    mockEventCount.mockResolvedValue(0);

    const { getOrganizedEvents } = await import('../services/myEventsService');
    await getOrganizedEvents(10, { status: 'FINISHED' });

    expect(mockEventFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizerId: 10, status: 'FINISHED' }),
      })
    );
  });
});

describe('getMyEventsSummary', () => {
  it('debe combinar las 4 categorías', async () => {
    mockFavFindMany.mockResolvedValue([]);
    mockBookingFindMany.mockResolvedValue([]);
    mockBookingCount.mockResolvedValue(0);
    mockFavCount.mockResolvedValue(0);
    mockEventFindMany.mockResolvedValue([]);
    mockEventCount.mockResolvedValue(0);

    const { getMyEventsSummary } = await import('../services/myEventsService');
    const summary = await getMyEventsSummary(10);

    expect(summary).toHaveProperty('upcoming');
    expect(summary).toHaveProperty('past');
    expect(summary).toHaveProperty('favorites');
    expect(summary).toHaveProperty('organized');
  });
});
export {};
