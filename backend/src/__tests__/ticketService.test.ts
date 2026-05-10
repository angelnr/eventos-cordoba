/// <reference types="jest" />

import { generateToken } from '../services/ticketService';

const mockQueryRaw = jest.fn();
const mockTxCreate = jest.fn();
const mockTxUpdate = jest.fn();
const mockTxTicketFindUnique = jest.fn();
const mockTxBookingFindUnique = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => ({
      ticket: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      booking: {
        findUnique: jest.fn(),
      },
      ticketAuditLog: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn((cb: Function, _opts?: any) => cb({
        ticket: {
          create: mockTxCreate,
          findUnique: mockTxTicketFindUnique,
          update: mockTxUpdate,
        },
        ticketAuditLog: {
          create: jest.fn().mockResolvedValue({}),
        },
        booking: {
          findUnique: mockTxBookingFindUnique,
        },
        $queryRaw: mockQueryRaw,
      })),
      $queryRaw: jest.fn(),
      $disconnect: jest.fn(),
    })),
    Prisma: {
      TransactionIsolationLevel: {
        Serializable: 'Serializable',
      },
    },
  };
});

describe('generateToken', () => {
  it('debe generar un UUID v4 válido', () => {
    const token = generateToken();
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('debe generar tokens únicos', () => {
    const tokens = new Set(Array.from({ length: 1000 }, () => generateToken()));
    expect(tokens.size).toBe(1000);
  });
});

describe('validateTicket', () => {
  beforeEach(() => {
    mockQueryRaw.mockReset();
    mockTxUpdate.mockReset();
    mockTxTicketFindUnique.mockReset();
    mockTxBookingFindUnique.mockReset();
  });

  it('debe retornar already_used si el ticket ya fue validado', async () => {
    const { validateTicket } = await import('../services/ticketService');

    mockQueryRaw.mockResolvedValue([
      { id: 1, token: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', status: 'used', bookingId: 5, scannedAt: new Date(), validatedById: 10 },
    ]);

    mockTxTicketFindUnique.mockResolvedValue({
      id: 1,
      status: 'used',
      scannedAt: new Date(),
      validatedById: 10,
      booking: {
        user: { id: 7, name: 'María García', email: 'maria@example.com' },
        Event: { id: 3, title: 'Concierto', date: new Date(), location: 'Córdoba' },
      },
      validatedBy: { id: 10, name: 'Carlos Staff' },
    });

    const result = await validateTicket('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 20);
    expect(result.action).toBe('already_used');
    expect(result.user.name).toBe('María García');
  });

  it('debe lanzar 404 si el token no existe', async () => {
    const { validateTicket } = await import('../services/ticketService');

    mockQueryRaw.mockResolvedValue([]);

    await expect(validateTicket('00000000-0000-0000-0000-000000000000', 20)).rejects.toMatchObject({
      message: 'Token no encontrado',
      statusCode: 404,
    });
  });

  it('debe lanzar 422 si el ticket está invalidado', async () => {
    const { validateTicket } = await import('../services/ticketService');

    mockQueryRaw.mockResolvedValue([
      { id: 1, token: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', status: 'invalidated', bookingId: 5, scannedAt: null, validatedById: null },
    ]);

    await expect(validateTicket('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 20)).rejects.toMatchObject({
      message: 'Ticket invalidado',
      statusCode: 422,
    });
  });

  it('debe marcar como usado un ticket válido', async () => {
    const { validateTicket } = await import('../services/ticketService');

    mockQueryRaw.mockResolvedValue([
      { id: 1, token: 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', status: 'valid', bookingId: 5, scannedAt: null, validatedById: null },
    ]);

    mockTxBookingFindUnique.mockImplementation(async ({ where: { id } }: { where: { id: number } }) => {
      if (id === 5) {
        return {
          id: 5,
          user: { id: 7, name: 'María García', email: 'maria@example.com' },
          Event: { id: 3, title: 'Concierto', date: new Date(), location: 'Córdoba', status: 'active' },
        };
      }
      return null;
    });

    mockTxUpdate.mockResolvedValue({
      id: 1,
      token: 'valid-token',
      status: 'used',
      scannedAt: new Date(),
      validatedById: 20,
    });

    const result = await validateTicket('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 20);
    expect(result.action).toBe('validated');
    expect(result.ticket.status).toBe('used');
  });
});
