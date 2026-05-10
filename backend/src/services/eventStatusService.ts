import { PrismaClient, EventStatus, Prisma } from '@prisma/client';
import { createEventNotifications } from './notificationService';

const prisma = new PrismaClient();

export const TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  SCHEDULED: ['FULL', 'CANCELLED', 'FINISHED'],
  CANCELLED: [],
  FINISHED: [],
  FULL: ['SCHEDULED', 'CANCELLED', 'FINISHED'],
};

export const EVENT_STATUS_CONFIG: Record<EventStatus, {
  label: string;
  color: string;
  bgColor: string;
  canBook: boolean;
  canGenerateTicket: boolean;
  canCheckIn: boolean;
  canFavorite: boolean;
}> = {
  SCHEDULED: {
    label: 'Programado',
    color: 'text-green-800 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    canBook: true,
    canGenerateTicket: true,
    canCheckIn: true,
    canFavorite: true,
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'text-red-800 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    canBook: false,
    canGenerateTicket: false,
    canCheckIn: false,
    canFavorite: false,
  },
  FINISHED: {
    label: 'Finalizado',
    color: 'text-gray-800 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    canBook: false,
    canGenerateTicket: false,
    canCheckIn: false,
    canFavorite: true,
  },
  FULL: {
    label: 'Completo',
    color: 'text-amber-800 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    canBook: false,
    canGenerateTicket: true,
    canCheckIn: true,
    canFavorite: true,
  },
};

export function canTransition(from: EventStatus, to: EventStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAllowedTransitions(status: EventStatus): EventStatus[] {
  return TRANSITIONS[status] ?? [];
}

export async function transitionEventStatus(
  eventId: number,
  newStatus: EventStatus,
  changedById: number | null,
  reason: string = '',
  tx?: Prisma.TransactionClient | PrismaClient
): Promise<{ event: any; log: any }> {
  const client = tx || prisma;

  const event = await client.event.findUnique({
    where: { id: eventId },
    select: { id: true, status: true, title: true, capacity: true, currentBookings: true },
  });

  if (!event) {
    throw Object.assign(new Error('Evento no encontrado'), { statusCode: 404 });
  }

  if (event.status === newStatus) {
    throw Object.assign(new Error(`El evento ya está en estado ${newStatus}`), { statusCode: 400 });
  }

  if (!canTransition(event.status, newStatus)) {
    const allowed = getAllowedTransitions(event.status).join(', ');
    throw Object.assign(
      new Error(`Transición no permitida: ${event.status} → ${newStatus}. Transiciones permitidas desde ${event.status}: ${allowed}`),
      { statusCode: 400 }
    );
  }

  if (newStatus === 'SCHEDULED' && event.currentBookings >= event.capacity) {
    throw Object.assign(
      new Error('No se puede reabrir el evento: el aforo sigue completo'),
      { statusCode: 400 }
    );
  }

  const previousStatus = event.status;

  const updatedEvent = await client.event.update({
    where: { id: eventId },
    data: { status: newStatus },
  });

  const log = await client.eventStatusLog.create({
    data: {
      eventId,
      fromStatus: previousStatus,
      toStatus: newStatus,
      reason,
      changedById,
    },
  });

  if (newStatus === 'CANCELLED') {
    await invalidateEventTickets(eventId, changedById, client);
    notifyStatusChange(eventId, event.title, newStatus).catch(err =>
      console.error('Error sending status change notifications:', err)
    );
  }

  if (newStatus === 'FULL') {
    console.log(`[EventStatus] Event ${eventId} is now FULL (${event.currentBookings}/${event.capacity})`);
  }

  return { event: updatedEvent, log };
}

async function invalidateEventTickets(
  eventId: number,
  changedById: number | null,
  client: Prisma.TransactionClient | PrismaClient
): Promise<number> {
  const reason = 'Evento cancelado por el organizador';

  const tickets = await client.ticket.findMany({
    where: {
      booking: { eventId },
      status: 'valid',
    },
    select: { id: true },
  });

  if (tickets.length === 0) return 0;

  await client.ticket.updateMany({
    where: {
      id: { in: tickets.map(t => t.id) },
    },
    data: {
      status: 'invalidated',
      invalidatedAt: new Date(),
      invalidationReason: reason,
    },
  });

  for (const ticket of tickets) {
    await client.ticketAuditLog.create({
      data: {
        ticketId: ticket.id,
        action: 'TICKET_INVALIDATED',
        userId: changedById,
        metadata: JSON.stringify({ reason, eventId }),
      },
    });
  }

  console.log(`[EventStatus] Invalidated ${tickets.length} tickets for event ${eventId}`);
  return tickets.length;
}

function notifyStatusChange(
  eventId: number,
  eventTitle: string,
  status: EventStatus,
): Promise<void> {
  if (status !== 'CANCELLED') return Promise.resolve();

  return createEventNotifications(eventId, {
    type: 'EVENT_CANCELLED' as any,
    title: 'Evento cancelado',
    message: `El evento "${eventTitle}" ha sido cancelado.`,
    link: `/events/${eventId}`,
  }).then(() => {}).catch(err => {
    console.error('Error sending status change notifications:', err);
  });
}

export async function autoFinishPastEvents(): Promise<{ count: number }> {
  const result = await prisma.event.updateMany({
    where: {
      status: { in: ['SCHEDULED', 'FULL'] },
      date: { lt: new Date() },
    },
    data: { status: 'FINISHED' },
  });

  if (result.count > 0) {
    // Find events that were just updated and create audit logs
    const events = await prisma.event.findMany({
      where: { status: 'FINISHED' },
      select: { id: true },
      orderBy: { updatedAt: 'desc' },
      take: result.count,
    });

    for (const event of events) {
      await prisma.eventStatusLog.create({
        data: {
          eventId: event.id,
          fromStatus: 'SCHEDULED',
          toStatus: 'FINISHED',
          reason: 'Transición automática: la fecha del evento ya ha pasado',
          changedById: null,
        },
      }).catch(() => {});
    }
  }

  return { count: result.count };
}
