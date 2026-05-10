import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUMMARY_LIMIT = 6;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

const EVENT_SELECT: any = {
  id: true, slug: true, title: true, description: true,
  date: true, location: true, latitude: true, longitude: true,
  capacity: true, status: true, imageUrl: true, price: true,
  organizerId: true, categoryId: true, createdAt: true, updatedAt: true,
  averageRating: true, reviewCount: true, currentBookings: true,
  organizer: { select: { id: true, name: true, email: true } },
  category: { select: { id: true, name: true, color: true } },
};

interface MyEventsQuery {
  page?: string;
  limit?: string;
  category?: string;
  status?: string;
  [key: string]: any;
}

interface MyEventsOptions {
  paginate?: boolean;
  query?: MyEventsQuery;
  categoryId?: number;
  status?: string;
}

function parsePagination(query: MyEventsQuery): { page: number; limit: number; skip: number } {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function buildPagination(total: number, page: number, limit: number) {
  const pages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
}

function addComputedFields(events: any[]) {
  return events.map(event => ({
    ...event,
    availableSpots: Math.max(0, event.capacity - event.currentBookings),
    totalBookings: event.currentBookings,
  }));
}

async function addFavoriteStatus(events: any[], userId: number | null | undefined) {
  if (!userId || events.length === 0) return events;
  const eventIds = events.map(e => e.id);
  const favorites = await prisma.favorite.findMany({
    where: { userId, eventId: { in: eventIds } },
    select: { eventId: true },
  });
  const favoriteSet = new Set(favorites.map(f => f.eventId));
  return events.map(e => ({ ...e, isFavorited: favoriteSet.has(e.id) }));
}

export async function getUpcomingEvents(userId: number, options: MyEventsOptions = {}): Promise<{ events: any[]; total: number; pagination?: any }> {
  const pagination = parsePagination(options.query || {});
  const page = pagination.page;
  const limit = options.paginate ? pagination.limit : SUMMARY_LIMIT;
  const skip = options.paginate ? pagination.skip : 0;

  const where: any = {
    userId,
    status: 'confirmed',
    Event: {
      date: { gt: new Date() },
      status: { not: 'CANCELLED' },
    },
  };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        Event: { select: EVENT_SELECT },
      },
      orderBy: { Event: { date: 'asc' } },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  let events = addComputedFields(bookings.map(b => b.Event));
  events = await addFavoriteStatus(events, userId);

  const enriched = bookings.map((b, i) => ({
    ...events[i],
    bookingId: b.id,
    bookingStatus: b.status,
    bookingQuantity: b.quantity,
  }));

  return {
    events: enriched,
    total,
    ...(options.paginate ? { pagination: buildPagination(total, page, limit) } : {}),
  };
}

export async function getPastEvents(userId: number, options: MyEventsOptions = {}): Promise<{ events: any[]; total: number; pagination?: any }> {
  const pagination = parsePagination(options.query || {});
  const page = pagination.page;
  const limit = options.paginate ? pagination.limit : SUMMARY_LIMIT;
  const skip = options.paginate ? pagination.skip : 0;

  const where: any = {
    userId,
    status: 'confirmed',
    Event: {
      date: { lte: new Date() },
      status: { not: 'CANCELLED' },
    },
  };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        Event: { select: EVENT_SELECT },
      },
      orderBy: { Event: { date: 'desc' } },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  let events = addComputedFields(bookings.map(b => b.Event));
  events = await addFavoriteStatus(events, userId);

  const enriched = bookings.map((b, i) => ({
    ...events[i],
    bookingId: b.id,
    bookingStatus: b.status,
    bookingQuantity: b.quantity,
  }));

  return {
    events: enriched,
    total,
    ...(options.paginate ? { pagination: buildPagination(total, page, limit) } : {}),
  };
}

export async function getFavoriteEvents(userId: number, options: MyEventsOptions = {}): Promise<{ events: any[]; total: number; pagination?: any }> {
  const pagination = parsePagination(options.query || {});
  const page = pagination.page;
  const limit = options.paginate ? pagination.limit : SUMMARY_LIMIT;
  const skip = options.paginate ? pagination.skip : 0;

  const where: any = {
    userId,
    event: { status: { not: 'CANCELLED' } },
  };

  if (options.categoryId) {
    where.event.categoryId = options.categoryId;
  }

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where,
      include: {
        event: { select: EVENT_SELECT },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.favorite.count({ where }),
  ]);

  let events = addComputedFields(favorites.map(f => f.event));
  events = events.map(e => ({ ...e, isFavorited: true }));

  return {
    events,
    total,
    ...(options.paginate ? { pagination: buildPagination(total, page, limit) } : {}),
  };
}

export async function getOrganizedEvents(userId: number, options: MyEventsOptions = {}): Promise<{ events: any[]; total: number; pagination?: any }> {
  const pagination = parsePagination(options.query || {});
  const page = pagination.page;
  const limit = options.paginate ? pagination.limit : SUMMARY_LIMIT;
  const skip = options.paginate ? pagination.skip : 0;

  const where: any = {
    organizerId: userId,
  };

  if (options.status) {
    where.status = options.status;
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      select: EVENT_SELECT,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);

  let enriched = addComputedFields(events);
  enriched = await addFavoriteStatus(enriched, userId);

  return {
    events: enriched,
    total,
    ...(options.paginate ? { pagination: buildPagination(total, page, limit) } : {}),
  };
}

export async function getMyEventsSummary(userId: number): Promise<Record<string, any>> {
  const [upcoming, past, favorites, organized] = await Promise.all([
    getUpcomingEvents(userId),
    getPastEvents(userId),
    getFavoriteEvents(userId),
    getOrganizedEvents(userId),
  ]);

  return {
    upcoming: { events: upcoming.events, total: upcoming.total },
    past: { events: past.events, total: past.total },
    favorites: { events: favorites.events, total: favorites.total },
    organized: { events: organized.events, total: organized.total },
  };
}

export { parsePagination, buildPagination };
