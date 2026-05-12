/// <reference types="jest" />

const mockTicketFindUnique = jest.fn();
const mockTicketFindMany = jest.fn();
const mockTicketCount = jest.fn();
const mockTicketGroupBy = jest.fn();
const mockTicketUpdate = jest.fn();
const mockBookingFindUnique = jest.fn();
const mockTxCreate = jest.fn();
const mockTxAuditCreate = jest.fn();
const mockTxBookingFindUnique = jest.fn();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => ({
      ticket: {
        findUnique: mockTicketFindUnique,
        findMany: mockTicketFindMany,
        count: mockTicketCount,
        groupBy: mockTicketGroupBy,
        update: mockTicketUpdate,
      },
      booking: {
        findUnique: mockBookingFindUnique,
      },
      ticketAuditLog: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn((cb: Function, _opts?: any) =>
        cb({
          ticket: {
            create: mockTxCreate,
            findUnique: mockTicketFindUnique,
            update: mockTicketUpdate,
          },
          ticketAuditLog: {
            create: mockTxAuditCreate,
          },
          booking: {
            findUnique: mockTxBookingFindUnique,
          },
          $queryRaw: jest.fn(),
        })
      ),
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

beforeEach(() => {
  mockTicketFindUnique.mockReset();
  mockTicketFindMany.mockReset();
  mockTicketCount.mockReset();
  mockTicketGroupBy.mockReset();
  mockTicketUpdate.mockReset();
  mockBookingFindUnique.mockReset();
  mockTxCreate.mockReset();
  mockTxAuditCreate.mockReset();
  mockTxBookingFindUnique.mockReset();
});

const validBooking = {
  id: 1,
  userId: 10,
  status: 'confirmed',
  quantity: 2,
  totalPrice: 0,
  Event: { id: 5, title: 'Concierto', date: new Date(), status: 'SCHEDULED' },
};

describe('generateTicketForBooking', () => {
  it('debe lanzar 404 si la reserva no existe', async () => {
    mockBookingFindUnique.mockResolvedValue(null);

    const { generateTicketForBooking } = await import('../services/ticketService');

    await expect(generateTicketForBooking(999, 10)).rejects.toMatchObject({
      message: 'Reserva no encontrada',
      statusCode: 404,
    });
  });

  it('debe lanzar 403 si el userId no coincide', async () => {
    mockBookingFindUnique.mockResolvedValue(validBooking);

    const { generateTicketForBooking } = await import('../services/ticketService');

    await expect(generateTicketForBooking(1, 999)).rejects.toMatchObject({
      message: 'No tienes permiso sobre esta reserva',
      statusCode: 403,
    });
  });

  it('debe lanzar 400 si la reserva no está confirmada', async () => {
    mockBookingFindUnique.mockResolvedValue({
      ...validBooking,
      status: 'pending',
    });

    const { generateTicketForBooking } = await import('../services/ticketService');

    await expect(generateTicketForBooking(1, 10)).rejects.toMatchObject({
      message: 'Solo se pueden generar tickets para reservas confirmadas',
      statusCode: 400,
    });
  });

  it('debe retornar el ticket existente si ya fue generado (created: false)', async () => {
    mockBookingFindUnique.mockResolvedValue(validBooking);
    mockTicketFindUnique.mockResolvedValue({ id: 100, token: 'existing-token', status: 'valid', bookingId: 1 });

    const { generateTicketForBooking } = await import('../services/ticketService');
    const result = await generateTicketForBooking(1, 10);

    expect(result.created).toBe(false);
    expect(result.ticket.id).toBe(100);
  });

  it('debe crear un nuevo ticket y audit log si no existe (created: true)', async () => {
    mockBookingFindUnique.mockResolvedValue(validBooking);
    mockTicketFindUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(null); // first for existing check, second inside tx
    mockTxCreate.mockResolvedValue({ id: 200, token: 'new-token', status: 'valid' });
    mockTxAuditCreate.mockResolvedValue({});

    const { generateTicketForBooking } = await import('../services/ticketService');
    const result = await generateTicketForBooking(1, 10);

    expect(result.created).toBe(true);
    expect(result.ticket.id).toBe(200);
    expect(mockTxAuditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'TICKET_CREATED' }),
      })
    );
  });
});

describe('invalidateTicket', () => {
  it('debe lanzar 404 si el ticket no existe', async () => {
    mockTicketFindUnique.mockResolvedValue(null);

    const { invalidateTicket } = await import('../services/ticketService');

    await expect(invalidateTicket(999, 1, 'Razón')).rejects.toMatchObject({
      message: 'Ticket no encontrado',
      statusCode: 404,
    });
  });

  it('debe lanzar 400 si el ticket ya está invalidado', async () => {
    mockTicketFindUnique.mockResolvedValue({ id: 1, status: 'invalidated' });

    const { invalidateTicket } = await import('../services/ticketService');

    await expect(invalidateTicket(1, 1, 'Razón')).rejects.toMatchObject({
      message: 'El ticket ya está invalidado',
      statusCode: 400,
    });
  });

  it('debe lanzar 400 si el ticket ya fue usado', async () => {
    mockTicketFindUnique.mockResolvedValue({ id: 1, status: 'used' });

    const { invalidateTicket } = await import('../services/ticketService');

    await expect(invalidateTicket(1, 1, 'Razón')).rejects.toMatchObject({
      message: 'No se puede invalidar un ticket ya usado',
      statusCode: 400,
    });
  });

  it('debe invalidar el ticket y crear audit log', async () => {
    mockTicketFindUnique.mockResolvedValue({ id: 1, status: 'valid', bookingId: 10 });
    mockTicketUpdate.mockResolvedValue({
      id: 1,
      status: 'invalidated',
      invalidatedAt: new Date(),
      invalidatedById: 1,
      invalidationReason: 'Razón de prueba',
    });

    const { invalidateTicket } = await import('../services/ticketService');
    const result = await invalidateTicket(1, 1, 'Razón de prueba');

    expect(result.status).toBe('invalidated');
    expect(result.invalidationReason).toBe('Razón de prueba');
    expect(mockTxAuditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'TICKET_INVALIDATED',
          metadata: JSON.stringify({ reason: 'Razón de prueba' }),
        }),
      })
    );
  });
});

describe('getUserTickets', () => {
  it('debe retornar tickets del usuario con datos del evento', async () => {
    const mockTickets = [
      {
        id: 1,
        token: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
        status: 'valid',
        booking: {
          Event: { id: 5, title: 'Concierto', date: new Date(), location: 'Córdoba', imageUrl: null, status: 'SCHEDULED' },
        },
      },
    ];
    mockTicketFindMany.mockResolvedValue(mockTickets);

    const { getUserTickets } = await import('../services/ticketService');
    const tickets = await getUserTickets(10);

    expect(tickets).toHaveLength(1);
    expect(tickets[0].booking.Event.title).toBe('Concierto');
    expect(mockTicketFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { booking: { userId: 10 } },
      })
    );
  });

  it('debe filtrar por status si se proporciona', async () => {
    mockTicketFindMany.mockResolvedValue([]);

    const { getUserTickets } = await import('../services/ticketService');
    await getUserTickets(10, 'used');

    expect(mockTicketFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { booking: { userId: 10 }, status: 'used' },
      })
    );
  });
});

describe('getEventTickets', () => {
  it('debe retornar tickets paginados con stats', async () => {
    const mockTickets = [
      { id: 1, token: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', status: 'valid', booking: { user: { id: 10, name: 'User', email: 'u@t.com' } } },
    ];
    mockTicketFindMany.mockResolvedValue(mockTickets);
    mockTicketCount.mockResolvedValue(1);
    mockTicketGroupBy.mockResolvedValue([
      { status: 'valid', _count: { status: 1 } },
    ]);

    const { getEventTickets } = await import('../services/ticketService');
    const result = await getEventTickets(5, 1, 20);

    expect(result.tickets).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.stats).toEqual({ total: 1, valid: 1, used: 0, invalidated: 0, expired: 0 });
  });

  it('debe filtrar por status si se proporciona', async () => {
    mockTicketFindMany.mockResolvedValue([]);
    mockTicketCount.mockResolvedValue(0);
    mockTicketGroupBy.mockResolvedValue([]);

    const { getEventTickets } = await import('../services/ticketService');
    await getEventTickets(5, 1, 20, 'used');

    expect(mockTicketFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { booking: { eventId: 5 }, status: 'used' },
      })
    );
  });
});

describe('getTicketStatus', () => {
  it('debe lanzar 404 si el token no es un UUID válido', async () => {
    const { getTicketStatus } = await import('../services/ticketService');

    await expect(getTicketStatus('not-a-uuid')).rejects.toMatchObject({
      message: 'Token no encontrado',
      statusCode: 404,
    });
  });

  it('debe lanzar 404 si el ticket no existe', async () => {
    mockTicketFindUnique.mockResolvedValue(null);

    const { getTicketStatus } = await import('../services/ticketService');

    await expect(
      getTicketStatus('00000000-0000-0000-0000-000000000000')
    ).rejects.toMatchObject({
      message: 'Token no encontrado',
      statusCode: 404,
    });
  });

  it('debe retornar el ticket con booking y evento si existe', async () => {
    const mockTicket = {
      id: 1,
      token: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
      status: 'valid',
      booking: {
        id: 1,
        user: { id: 10, name: 'User', email: 'u@t.com' },
        Event: { id: 5, title: 'Concierto', date: new Date(), location: 'Córdoba', status: 'SCHEDULED' },
      },
    };
    mockTicketFindUnique.mockResolvedValue(mockTicket);

    const { getTicketStatus } = await import('../services/ticketService');
    const result = await getTicketStatus('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');

    expect(result.id).toBe(1);
    expect(result.booking.Event.title).toBe('Concierto');
  });
});
export {};
