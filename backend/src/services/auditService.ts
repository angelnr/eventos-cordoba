import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const AUDIT_ACTIONS = {
  TICKET_CREATED: 'TICKET_CREATED',
  TICKET_VALIDATED: 'TICKET_VALIDATED',
  TICKET_INVALIDATED: 'TICKET_INVALIDATED',
  TICKET_EXPIRED: 'TICKET_EXPIRED',
  TICKET_REVALIDATED: 'TICKET_REVALIDATED',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

interface LogTicketActionParams {
  ticketId: number;
  action: AuditAction;
  userId?: number | null;
  metadata?: Record<string, unknown>;
}

export async function logTicketAction(params: LogTicketActionParams): Promise<void> {
  try {
    await prisma.ticketAuditLog.create({
      data: {
        ticketId: params.ticketId,
        action: params.action,
        userId: params.userId ?? null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (error) {
    console.error('[AuditService] Error logging ticket action:', error);
  }
}
