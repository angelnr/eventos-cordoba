import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const VALID_TYPES = [
  'EVENT_CANCELLED',
  'EVENT_DATE_CHANGED',
  'EVENT_REMINDER',
  'ORGANIZER_ANNOUNCEMENT',
  'BOOKING_CONFIRMED'
] as const;

type NotificationType = typeof VALID_TYPES[number];

export async function createNotification({ userId, type, title, message, eventId = null, link = null }: {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  eventId?: number | null;
  link?: string | null;
}) {
  if (!VALID_TYPES.includes(type)) {
    throw new Error(`Tipo de notificación inválido: ${type}`);
  }
  if (!userId || !title || !message) {
    throw new Error('userId, title y message son requeridos');
  }

  return prisma.notification.create({
    data: {
      userId,
      type,
      title: title.substring(0, 100),
      message: message.substring(0, 500),
      link,
      eventId,
      isRead: false
    }
  });
}

export async function createNotificationForUsers(userIds: number[], { type, title, message, eventId = null, link = null }: {
  type: NotificationType;
  title: string;
  message: string;
  eventId?: number | null;
  link?: string | null;
}) {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return { count: 0 };
  }

  const uniqueUserIds = [...new Set(userIds)];

  const data = uniqueUserIds.map(userId => ({
    userId,
    type,
    title: title.substring(0, 100),
    message: message.substring(0, 500),
    link,
    eventId,
    isRead: false
  }));

  const result = await prisma.notification.createMany({ data, skipDuplicates: false });
  return { count: result.count };
}

export async function createEventNotifications(eventId: number, { type, title, message, link = null }: {
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
}) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true }
  });

  if (!event) {
    return { recipientCount: 0 };
  }

  const [bookings, favorites] = await Promise.all([
    prisma.booking.findMany({
      where: { eventId, status: { not: 'cancelled' } },
      select: { userId: true }
    }),
    prisma.favorite.findMany({
      where: { eventId },
      select: { userId: true }
    })
  ]);

  const userIdSet = new Set<number>();
  bookings.forEach(b => userIdSet.add(b.userId));
  favorites.forEach(f => userIdSet.add(f.userId));
  const userIds = [...userIdSet];

  if (userIds.length === 0) {
    return { recipientCount: 0 };
  }

  await createNotificationForUsers(userIds, { type, title, message, eventId, link });
  return { recipientCount: userIds.length };
}

export { VALID_TYPES };
