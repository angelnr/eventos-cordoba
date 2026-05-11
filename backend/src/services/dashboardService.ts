import { PrismaClient, EventStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 60_000;

export interface DashboardFilters {
  startDate?: Date;
  endDate?: Date;
  statuses?: EventStatus[];
  scope?: 'mine' | 'all';
}

export interface DashboardMetrics {
  totalEvents: number;
  eventsByStatus: Record<string, number>;
  totalAttendees: number;
  averageRating: number;
  eventsWithReviews: number;
  completedEvents: number;
  scope: 'mine' | 'all';
  organizerId: number | null;
  filters: {
    startDate: Date | null;
    endDate: Date | null;
    statuses: string[] | null;
  };
  computedAt: string;
}

export interface EventCreatedMetrics {
  totalEvents: number;
  eventsByStatus: Record<string, number>;
  timeline: Array<{ month: string; count: number }>;
  filters: {
    startDate: Date | null;
    endDate: Date | null;
    statuses: string[] | null;
  };
}

export interface AttendeeMetrics {
  totalAttendees: number;
  byEventStatus: Record<string, number>;
  timeline: Array<{ month: string; count: number }>;
  filters: {
    startDate: Date | null;
    endDate: Date | null;
    statuses: string[] | null;
  };
}

export interface RatingMetrics {
  averageRating: number;
  eventsWithReviews: number;
  totalReviews: number;
  distribution: Record<string, number>;
  filters: {
    startDate: Date | null;
    endDate: Date | null;
    statuses: string[] | null;
  };
}

export interface CompletedEventsMetrics {
  completedEvents: number;
  breakdown: Record<string, number>;
  timeline: Array<{ month: string; count: number }>;
  filters: {
    startDate: Date | null;
    endDate: Date | null;
    statuses: string[] | null;
  };
}

function getCacheKey(userId: number, filters: DashboardFilters): string {
  const scope = filters.scope || 'mine';
  if (scope === 'all') {
    return `metrics:all:${JSON.stringify(filters)}`;
  }
  return `metrics:${userId}:mine:${JSON.stringify(filters)}`;
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function buildEventWhere(userId: number, filters: DashboardFilters): any {
  const where: any = {};

  if (filters.scope !== 'all') {
    where.organizerId = userId;
  }

  if (filters.statuses && filters.statuses.length > 0) {
    where.status = { in: filters.statuses };
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }

  return where;
}

function buildEventDateWhere(userId: number, filters: DashboardFilters): any {
  const where: any = {};

  if (filters.scope !== 'all') {
    where.organizerId = userId;
  }

  if (filters.statuses && filters.statuses.length > 0) {
    where.status = { in: filters.statuses };
  }

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = filters.startDate;
    if (filters.endDate) where.date.lte = filters.endDate;
  }

  return where;
}

function cleanFilters(filters: DashboardFilters) {
  return {
    startDate: filters.startDate || null,
    endDate: filters.endDate || null,
    statuses: filters.statuses || null,
  };
}

export async function getDashboardMetrics(
  userId: number,
  filters: DashboardFilters,
  refresh: boolean = false
): Promise<DashboardMetrics> {
  const cacheKey = getCacheKey(userId, filters);

  if (!refresh) {
    const cached = getCached<DashboardMetrics>(cacheKey);
    if (cached) return cached;
  }

  const eventWhere = buildEventWhere(userId, filters);
  const eventDateWhere = buildEventDateWhere(userId, filters);

  const [
    totalEvents,
    eventsByStatusRaw,
    ratingAggregate,
    completedEventsCount,
  ] = await Promise.all([
    prisma.event.count({ where: eventWhere }),
    prisma.event.groupBy({
      by: ['status'],
      where: eventWhere,
      _count: { status: true },
    }),
    prisma.event.aggregate({
      where: {
        ...eventDateWhere,
        reviewCount: { gt: 0 },
      },
      _avg: { averageRating: true },
      _count: true,
    }),
    prisma.event.count({
      where: {
        ...eventDateWhere,
        status: { in: ['FINISHED', 'FULL'] },
      },
    }),
  ]);

  const totalAttendees = await prisma.ticket.count({
    where: {
      status: 'used',
      booking: {
        Event: {
          ...eventDateWhere,
        },
      },
    },
  });

  const eventsByStatus: Record<string, number> = {};
  for (const row of eventsByStatusRaw) {
    eventsByStatus[row.status] = row._count.status;
  }

  const averageRating = ratingAggregate._avg.averageRating
    ? Math.round(ratingAggregate._avg.averageRating * 100) / 100
    : 0;

  const result: DashboardMetrics = {
    totalEvents,
    eventsByStatus,
    totalAttendees,
    averageRating,
    eventsWithReviews: ratingAggregate._count,
    completedEvents: completedEventsCount,
    scope: filters.scope || 'mine',
    organizerId: filters.scope === 'all' ? null : userId,
    filters: cleanFilters(filters),
    computedAt: new Date().toISOString(),
  };

  setCache(cacheKey, result);
  return result;
}

export async function getEventsCreatedMetrics(
  userId: number,
  filters: DashboardFilters,
  refresh: boolean = false
): Promise<EventCreatedMetrics> {
  const scope = filters.scope || 'mine';
  const cacheKey = `${scope}:events-created:${userId}:${JSON.stringify(filters)}`;

  if (!refresh) {
    const cached = getCached<EventCreatedMetrics>(cacheKey);
    if (cached) return cached;
  }

  const where = buildEventWhere(userId, filters);

  const [totalEvents, eventsByStatusRaw] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    }),
  ]);

  const eventsByStatus: Record<string, number> = {};
  for (const row of eventsByStatusRaw) {
    eventsByStatus[row.status] = row._count.status;
  }

  const result: EventCreatedMetrics = {
    totalEvents,
    eventsByStatus,
    timeline: [],
    filters: cleanFilters(filters),
  };

  setCache(cacheKey, result);
  return result;
}

export async function getAttendeeMetrics(
  userId: number,
  filters: DashboardFilters,
  refresh: boolean = false
): Promise<AttendeeMetrics> {
  const scope = filters.scope || 'mine';
  const cacheKey = `${scope}:attendees:${userId}:${JSON.stringify(filters)}`;

  if (!refresh) {
    const cached = getCached<AttendeeMetrics>(cacheKey);
    if (cached) return cached;
  }

  const where = buildEventDateWhere(userId, filters);

  const totalAttendees = await prisma.ticket.count({
    where: {
      status: 'used',
      booking: { Event: where },
    },
  });

  const result: AttendeeMetrics = {
    totalAttendees,
    byEventStatus: {},
    timeline: [],
    filters: cleanFilters(filters),
  };

  setCache(cacheKey, result);
  return result;
}

export async function getRatingMetrics(
  userId: number,
  filters: DashboardFilters,
  refresh: boolean = false
): Promise<RatingMetrics> {
  const scope = filters.scope || 'mine';
  const cacheKey = `${scope}:rating:${userId}:${JSON.stringify(filters)}`;

  if (!refresh) {
    const cached = getCached<RatingMetrics>(cacheKey);
    if (cached) return cached;
  }

  const where = buildEventDateWhere(userId, filters);

  const [aggregate, totalReviews, distributionRaw] = await Promise.all([
    prisma.event.aggregate({
      where: { ...where, reviewCount: { gt: 0 } },
      _avg: { averageRating: true },
      _count: true,
    }),
    prisma.review.count({
      where: { event: where },
    }),
    prisma.review.groupBy({
      by: ['rating'],
      where: { event: where },
      _count: { rating: true },
    }),
  ]);

  const distribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  for (const row of distributionRaw) {
    distribution[String(row.rating)] = row._count.rating;
  }

  const result: RatingMetrics = {
    averageRating: aggregate._avg.averageRating
      ? Math.round(aggregate._avg.averageRating * 100) / 100
      : 0,
    eventsWithReviews: aggregate._count,
    totalReviews,
    distribution,
    filters: cleanFilters(filters),
  };

  setCache(cacheKey, result);
  return result;
}

export async function getCompletedEventsMetrics(
  userId: number,
  filters: DashboardFilters,
  refresh: boolean = false
): Promise<CompletedEventsMetrics> {
  const scope = filters.scope || 'mine';
  const cacheKey = `${scope}:completed:${userId}:${JSON.stringify(filters)}`;

  if (!refresh) {
    const cached = getCached<CompletedEventsMetrics>(cacheKey);
    if (cached) return cached;
  }

  const where = buildEventDateWhere(userId, filters);
  const completedWhere = { ...where, status: { in: ['FINISHED', 'FULL'] as EventStatus[] } };

  const [completedEvents, breakdownRaw] = await Promise.all([
    prisma.event.count({ where: completedWhere }),
    prisma.event.groupBy({
      by: ['status'],
      where: completedWhere,
      _count: { status: true },
    }),
  ]);

  const breakdown: Record<string, number> = {};
  for (const row of breakdownRaw) {
    breakdown[row.status] = row._count.status;
  }

  const result: CompletedEventsMetrics = {
    completedEvents,
    breakdown,
    timeline: [],
    filters: cleanFilters(filters),
  };

  setCache(cacheKey, result);
  return result;
}

export function clearDashboardCache(): void {
  cache.clear();
}

export function invalidateDashboardCache(userId: number): void {
  for (const key of cache.keys()) {
    if (key.includes(`:${userId}:`) || key.startsWith('metrics:all:')) {
      cache.delete(key);
    }
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
    }
  }
}, 5 * 60 * 1000);
