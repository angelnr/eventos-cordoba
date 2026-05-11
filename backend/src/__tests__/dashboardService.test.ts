/// <reference types="jest" />

const mockEventCount = jest.fn();
const mockEventGroupBy = jest.fn();
const mockEventAggregate = jest.fn();
const mockTicketCount = jest.fn();
const mockReviewCount = jest.fn();
const mockReviewGroupBy = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => ({
      event: {
        count: mockEventCount,
        groupBy: mockEventGroupBy,
        aggregate: mockEventAggregate,
      },
      ticket: {
        count: mockTicketCount,
      },
      review: {
        count: mockReviewCount,
        groupBy: mockReviewGroupBy,
      },
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

let clearCache: () => void;

beforeAll(async () => {
  const mod = await import('../services/dashboardService');
  clearCache = (mod as any).clearDashboardCache;
});

beforeEach(() => {
  mockEventCount.mockReset();
  mockEventGroupBy.mockReset();
  mockEventAggregate.mockReset();
  mockTicketCount.mockReset();
  mockReviewCount.mockReset();
  mockReviewGroupBy.mockReset();
  clearCache();
});

describe('getDashboardMetrics', () => {
  it('debe retornar 0 en todas las métricas para un organizador sin eventos', async () => {
    const { getDashboardMetrics } = await import('../services/dashboardService');

    mockEventCount.mockResolvedValue(0);
    mockEventGroupBy.mockResolvedValue([]);
    mockEventAggregate.mockResolvedValue({ _avg: { averageRating: null }, _count: 0 });
    mockTicketCount.mockResolvedValue(0);

    const result = await getDashboardMetrics(100, {});

    expect(result.totalEvents).toBe(0);
    expect(result.totalAttendees).toBe(0);
    expect(result.averageRating).toBe(0);
    expect(result.completedEvents).toBe(0);
    expect(result.eventsWithReviews).toBe(0);
    expect(result.eventsByStatus).toEqual({});
    expect(result.scope).toBe('mine');
    expect(result.organizerId).toBe(100);
  });

  it('debe calcular correctamente con eventos de distintos estados', async () => {
    const { getDashboardMetrics } = await import('../services/dashboardService');

    mockEventCount.mockImplementation((args: any) => {
      const hasStatusFilter = args.where?.status?.in?.includes('FINISHED');
      if (hasStatusFilter) return Promise.resolve(3);
      return Promise.resolve(6);
    });

    mockEventGroupBy.mockResolvedValue([
      { status: 'SCHEDULED', _count: { status: 2 } },
      { status: 'CANCELLED', _count: { status: 1 } },
      { status: 'FINISHED', _count: { status: 2 } },
      { status: 'FULL', _count: { status: 1 } },
    ]);

    mockEventAggregate.mockResolvedValue({
      _avg: { averageRating: 4.25 },
      _count: 3,
    });

    mockTicketCount.mockResolvedValue(150);

    const result = await getDashboardMetrics(200, {});

    expect(result.totalEvents).toBe(6);
    expect(result.eventsByStatus).toEqual({
      SCHEDULED: 2,
      CANCELLED: 1,
      FINISHED: 2,
      FULL: 1,
    });
    expect(result.totalAttendees).toBe(150);
    expect(result.averageRating).toBe(4.25);
    expect(result.eventsWithReviews).toBe(3);
    expect(result.completedEvents).toBe(3);
  });

  it('debe soportar scope=all excluyendo organizerId', async () => {
    const { getDashboardMetrics } = await import('../services/dashboardService');

    mockEventCount.mockImplementation((args: any) => {
      const hasStatusFilter = args.where?.status?.in?.includes('FINISHED');
      if (hasStatusFilter) return Promise.resolve(20);
      return Promise.resolve(50);
    });

    mockEventGroupBy.mockResolvedValue([
      { status: 'SCHEDULED', _count: { status: 15 } },
      { status: 'FINISHED', _count: { status: 20 } },
      { status: 'FULL', _count: { status: 10 } },
      { status: 'CANCELLED', _count: { status: 5 } },
    ]);

    mockEventAggregate.mockResolvedValue({
      _avg: { averageRating: 4.10 },
      _count: 30,
    });

    mockTicketCount.mockResolvedValue(500);

    const result = await getDashboardMetrics(300, { scope: 'all' });

    expect(result.totalEvents).toBe(50);
    expect(result.scope).toBe('all');
    expect(result.organizerId).toBeNull();
  });

  it('debe retornar averageRating=0 si no hay reviews', async () => {
    const { getDashboardMetrics } = await import('../services/dashboardService');

    mockEventCount.mockResolvedValue(0);
    mockEventGroupBy.mockResolvedValue([]);
    mockEventAggregate.mockResolvedValue({
      _avg: { averageRating: null },
      _count: 0,
    });
    mockTicketCount.mockResolvedValue(0);

    const result = await getDashboardMetrics(400, {});

    expect(result.averageRating).toBe(0);
    expect(result.eventsWithReviews).toBe(0);
  });

  it('debe usar el caché en la segunda llamada sin refresh', async () => {
    const { getDashboardMetrics } = await import('../services/dashboardService');

    const userId = 500;

    mockEventCount.mockResolvedValue(10);
    mockEventGroupBy.mockResolvedValue([]);
    mockEventAggregate.mockResolvedValue({ _avg: { averageRating: null }, _count: 0 });
    mockTicketCount.mockResolvedValue(0);

    const first = await getDashboardMetrics(userId, {});
    expect(first.totalEvents).toBe(10);

    mockEventCount.mockResolvedValue(999);

    const second = await getDashboardMetrics(userId, {});
    expect(second.totalEvents).toBe(10);
  });

  it('debe ignorar el caché si refresh=true', async () => {
    const { getDashboardMetrics } = await import('../services/dashboardService');

    const userId = 600;

    mockEventCount.mockResolvedValue(10);
    mockEventGroupBy.mockResolvedValue([]);
    mockEventAggregate.mockResolvedValue({ _avg: { averageRating: null }, _count: 0 });
    mockTicketCount.mockResolvedValue(0);

    const first = await getDashboardMetrics(userId, {});
    expect(first.totalEvents).toBe(10);

    mockEventCount.mockResolvedValue(10);
    mockEventGroupBy.mockResolvedValue([
      { status: 'FINISHED', _count: { status: 8 } },
      { status: 'SCHEDULED', _count: { status: 2 } },
    ]);
    mockEventAggregate.mockResolvedValue({ _avg: { averageRating: 4.0 }, _count: 8 });
    mockTicketCount.mockResolvedValue(200);

    const second = await getDashboardMetrics(userId, {}, true);
    expect(second.totalEvents).toBe(10);
    expect(second.eventsByStatus.FINISHED).toBe(8);
  });
});

describe('invalidateDashboardCache', () => {
  it('debe invalidar la caché del usuario', async () => {
    const { getDashboardMetrics, invalidateDashboardCache } = await import('../services/dashboardService');

    const userId = 700;

    mockEventCount.mockResolvedValue(10);
    mockEventGroupBy.mockResolvedValue([]);
    mockEventAggregate.mockResolvedValue({ _avg: { averageRating: null }, _count: 0 });
    mockTicketCount.mockResolvedValue(0);

    await getDashboardMetrics(userId, {});

    mockEventCount.mockResolvedValue(20);
    mockEventGroupBy.mockResolvedValue([
      { status: 'FINISHED', _count: { status: 5 } },
      { status: 'SCHEDULED', _count: { status: 15 } },
    ]);
    mockEventAggregate.mockResolvedValue({ _avg: { averageRating: null }, _count: 0 });
    mockTicketCount.mockResolvedValue(0);

    invalidateDashboardCache(userId);

    const refreshed = await getDashboardMetrics(userId, {});
    expect(refreshed.totalEvents).toBe(20);
  });
});
