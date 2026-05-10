import { PrismaClient, Prisma } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const TICKET_STATUS = {
  VALID: 'valid',
  USED: 'used',
  INVALIDATED: 'invalidated',
  EXPIRED: 'expired',
} as const;

export type TicketStatus = typeof TICKET_STATUS[keyof typeof TICKET_STATUS];

export function generateToken(): string {
  return crypto.randomUUID();
}

export async function generateTicketForBooking(
  bookingId: number,
  userId: number
): Promise<{ ticket: any; created: boolean }> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { Event: true },
  });

  if (!booking) {
    const err: any = new Error('Reserva no encontrada');
    err.statusCode = 404;
    throw err;
  }

  if (booking.userId !== userId) {
    const err: any = new Error('No tienes permiso sobre esta reserva');
    err.statusCode = 403;
    throw err;
  }

  if (booking.status !== 'confirmed') {
    const err: any = new Error('Solo se pueden generar tickets para reservas confirmadas');
    err.statusCode = 400;
    throw err;
  }

  const existingTicket = await prisma.ticket.findUnique({
    where: { bookingId: bookingId },
  });

  if (existingTicket) {
    return { ticket: existingTicket, created: false };
  }

  const token = generateToken();

  const ticket = await prisma.$transaction(async (tx) => {
    const newTicket = await tx.ticket.create({
      data: {
        token,
        status: TICKET_STATUS.VALID,
        bookingId,
      },
    });

    await tx.ticketAuditLog.create({
      data: {
        ticketId: newTicket.id,
        action: 'TICKET_CREATED',
        userId,
        metadata: JSON.stringify({ bookingId }),
      },
    });

    return newTicket;
  });

  return { ticket, created: true };
}

export async function validateTicket(
  token: string,
  validatorId: number
): Promise<{ action: string; ticket: any; user: any; event: any }> {
  if (!isValidUUID(token)) {
    throw Object.assign(new Error('Token no encontrado'), { statusCode: 404 });
  }
  const result = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const tickets = await tx.$queryRaw<Array<{
        id: number;
        token: string;
        status: string;
        bookingId: number;
        scannedAt: Date | null;
        validatedById: number | null;
      }>>`
        SELECT id, token, status, "bookingId", "scannedAt", "validatedById"
        FROM tickets
        WHERE token = CAST(${token} AS uuid)
        FOR UPDATE
      `;

      if (tickets.length === 0) {
        throw Object.assign(new Error('Token no encontrado'), { statusCode: 404 });
      }

      const ticketRow = tickets[0];

      if (ticketRow.status === TICKET_STATUS.USED) {
        const fullTicket = await tx.ticket.findUnique({
          where: { id: ticketRow.id },
          include: {
            booking: {
              include: {
                user: { select: { id: true, name: true, email: true } },
                Event: { select: { id: true, title: true, date: true, location: true } },
              },
            },
            validatedBy: { select: { id: true, name: true } },
          },
        });
        return {
          action: 'already_used',
          ticket: fullTicket,
          user: fullTicket!.booking.user,
          event: fullTicket!.booking.Event,
        };
      }

      if (ticketRow.status === TICKET_STATUS.INVALIDATED) {
        throw Object.assign(new Error('Ticket invalidado'), {
          statusCode: 422,
          action: 'invalidated',
          ticketId: ticketRow.id,
        });
      }

      if (ticketRow.status === TICKET_STATUS.EXPIRED) {
        throw Object.assign(new Error('Ticket expirado'), {
          statusCode: 410,
          action: 'expired',
          ticketId: ticketRow.id,
        });
      }

      const booking = await tx.booking.findUnique({
        where: { id: ticketRow.bookingId },
        include: {
          Event: { select: { id: true, title: true, date: true, location: true, status: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      if (!booking || booking.Event.status === 'CANCELLED' || booking.Event.status === 'FINISHED') {
        throw Object.assign(new Error('El evento asociado está cancelado o ha finalizado'), { statusCode: 422 });
      }

      const updatedTicket = await tx.ticket.update({
        where: { id: ticketRow.id },
        data: {
          status: TICKET_STATUS.USED,
          scannedAt: new Date(),
          validatedById: validatorId,
        },
      });

      await tx.ticketAuditLog.create({
        data: {
          ticketId: updatedTicket.id,
          action: 'TICKET_VALIDATED',
          userId: validatorId,
          metadata: JSON.stringify({
            previousStatus: ticketRow.status,
            validatedAt: new Date().toISOString(),
          }),
        },
      });

      return {
        action: 'validated',
        ticket: updatedTicket,
        user: booking.user,
        event: booking.Event,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      timeout: 10000,
    }
  );

  return result;
}

export async function invalidateTicket(
  ticketId: number,
  adminId: number,
  reason: string
): Promise<any> {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw Object.assign(new Error('Ticket no encontrado'), { statusCode: 404 });
    }

    if (ticket.status === TICKET_STATUS.INVALIDATED) {
      throw Object.assign(new Error('El ticket ya está invalidado'), { statusCode: 400 });
    }

    if (ticket.status === TICKET_STATUS.USED) {
      throw Object.assign(new Error('No se puede invalidar un ticket ya usado'), { statusCode: 400 });
    }

    const updatedTicket = await tx.ticket.update({
      where: { id: ticketId },
      data: {
        status: TICKET_STATUS.INVALIDATED,
        invalidatedAt: new Date(),
        invalidatedById: adminId,
        invalidationReason: reason,
      },
    });

    await tx.ticketAuditLog.create({
      data: {
        ticketId: updatedTicket.id,
        action: 'TICKET_INVALIDATED',
        userId: adminId,
        metadata: JSON.stringify({ reason }),
      },
    });

    return updatedTicket;
  });
}

export async function getUserTickets(userId: number, status?: string): Promise<any[]> {
  const where: any = {
    booking: { userId },
  };
  if (status) {
    where.status = status;
  }

  return prisma.ticket.findMany({
    where,
    include: {
      booking: {
        include: {
          Event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
              imageUrl: true,
              status: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEventTickets(
  eventId: number,
  page: number = 1,
  limit: number = 20,
  status?: string
): Promise<{ tickets: any[]; total: number; stats: Record<string, number> }> {
  const where: any = {
    booking: { eventId },
  };
  if (status) {
    where.status = status;
  }

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        booking: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ticket.count({ where }),
  ]);

  const stats = await prisma.ticket.groupBy({
    by: ['status'],
    where: { booking: { eventId } },
    _count: { status: true },
  });

  const statsObj: Record<string, number> = { total, valid: 0, used: 0, invalidated: 0, expired: 0 };
  stats.forEach((s) => {
    statsObj[s.status] = s._count.status;
  });

  return { tickets, total, stats: statsObj };
}

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function getTicketStatus(token: string): Promise<any> {
  if (!isValidUUID(token)) {
    throw Object.assign(new Error('Token no encontrado'), { statusCode: 404 });
  }
  const ticket = await prisma.ticket.findUnique({
    where: { token },
    include: {
      booking: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          Event: { select: { id: true, title: true, date: true, location: true, status: true } },
        },
      },
    },
  });

  if (!ticket) {
    throw Object.assign(new Error('Token no encontrado'), { statusCode: 404 });
  }

  return ticket;
}
