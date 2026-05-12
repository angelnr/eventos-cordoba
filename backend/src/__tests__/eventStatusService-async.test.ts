/// <reference types="jest" />

const mockEventFindUnique = jest.fn();
const mockEventUpdate = jest.fn();
const mockStatusLogCreate = jest.fn();
const mockTicketFindMany = jest.fn();
const mockTicketUpdateMany = jest.fn();
const mockAuditLogCreate = jest.fn();
const mockUpdateManyResult = jest.fn();
const mockStatusEventFindMany = jest.fn();
const mockNotifCreateEvent = jest.fn();

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return {
    ...actual,
    PrismaClient: jest.fn(() => ({
      event: {
        findUnique: mockEventFindUnique,
        update: mockEventUpdate,
        findMany: mockStatusEventFindMany,
        updateMany: mockUpdateManyResult,
      },
      eventStatusLog: {
        create: mockStatusLogCreate,
      },
      ticket: {
        findMany: mockTicketFindMany,
        updateMany: mockTicketUpdateMany,
      },
      ticketAuditLog: {
        create: mockAuditLogCreate,
      },
      $transaction: jest.fn((cb: Function) =>
        cb({
          event: {
            findUnique: mockEventFindUnique,
            update: mockEventUpdate,
          },
          eventStatusLog: {
            create: mockStatusLogCreate,
          },
        })
      ),
      $disconnect: jest.fn(),
    })),
  };
});

jest.mock('../services/notificationService', () => ({
  createEventNotifications: (...args: any[]) => mockNotifCreateEvent(...args),
}));

beforeEach(() => {
  mockNotifCreateEvent.mockReset();
  mockNotifCreateEvent.mockResolvedValue({ recipientCount: 0 });
  mockEventFindUnique.mockReset();
  mockEventUpdate.mockReset();
  mockStatusLogCreate.mockReset();
  mockTicketFindMany.mockReset();
  mockTicketUpdateMany.mockReset();
  mockAuditLogCreate.mockReset();
  mockUpdateManyResult.mockReset();
  mockStatusEventFindMany.mockReset();
});

describe('transitionEventStatus', () => {
  it('debe lanzar 404 si el evento no existe', async () => {
    mockEventFindUnique.mockResolvedValue(null);

    const { transitionEventStatus } = await import('../services/eventStatusService');

    await expect(transitionEventStatus(999, 'FULL' as any, 1)).rejects.toMatchObject({
      message: 'Evento no encontrado',
      statusCode: 404,
    });
  });

  it('debe lanzar 400 si el estado es el mismo', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 1, status: 'SCHEDULED', title: 'E', capacity: 100, currentBookings: 0 });

    const { transitionEventStatus } = await import('../services/eventStatusService');

    await expect(transitionEventStatus(1, 'SCHEDULED' as any, 1)).rejects.toMatchObject({
      message: 'El evento ya está en estado SCHEDULED',
      statusCode: 400,
    });
  });

  it('debe lanzar 400 si la transición no está permitida', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 1, status: 'FINISHED', title: 'E', capacity: 100, currentBookings: 0 });

    const { transitionEventStatus } = await import('../services/eventStatusService');

    await expect(transitionEventStatus(1, 'SCHEDULED' as any, 1)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('debe lanzar 400 si se intenta reabrir a SCHEDULED pero aforo completo', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 1, status: 'FULL', title: 'E', capacity: 100, currentBookings: 100 });

    const { transitionEventStatus } = await import('../services/eventStatusService');

    await expect(transitionEventStatus(1, 'SCHEDULED' as any, 1)).rejects.toMatchObject({
      message: 'No se puede reabrir el evento: el aforo sigue completo',
      statusCode: 400,
    });
  });

  it('debe ejecutar transición SCHEDULED -> FULL y crear log', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 1, status: 'SCHEDULED', title: 'Evento', capacity: 100, currentBookings: 50 });
    mockEventUpdate.mockResolvedValue({ id: 1, status: 'FULL' });
    mockStatusLogCreate.mockResolvedValue({
      id: 1,
      eventId: 1,
      fromStatus: 'SCHEDULED',
      toStatus: 'FULL',
      reason: 'Aforo completo',
      changedById: 1,
    });

    const { transitionEventStatus } = await import('../services/eventStatusService');
    const result = await transitionEventStatus(1, 'FULL' as any, 1, 'Aforo completo');

    expect(result.event.status).toBe('FULL');
    expect(result.log.fromStatus).toBe('SCHEDULED');
    expect(result.log.toStatus).toBe('FULL');
    expect(mockStatusLogCreate).toHaveBeenCalledWith({
      data: {
        eventId: 1,
        fromStatus: 'SCHEDULED',
        toStatus: 'FULL',
        reason: 'Aforo completo',
        changedById: 1,
      },
    });
  });

  it('debe invalidar tickets y notificar si se cancela', async () => {
    mockNotifCreateEvent.mockResolvedValue({ recipientCount: 2 });
    mockEventFindUnique.mockResolvedValue({ id: 1, status: 'SCHEDULED', title: 'Evento', capacity: 100, currentBookings: 0 });
    mockEventUpdate.mockResolvedValue({ id: 1, status: 'CANCELLED' });
    mockStatusLogCreate.mockResolvedValue({});
    mockTicketFindMany.mockResolvedValue([{ id: 10 }, { id: 11 }]);
    mockTicketUpdateMany.mockResolvedValue({ count: 2 });
    mockAuditLogCreate.mockResolvedValue({});

    const { transitionEventStatus } = await import('../services/eventStatusService');
    await transitionEventStatus(1, 'CANCELLED' as any, 1);

    // Debe invalidar tickets
    expect(mockTicketUpdateMany).toHaveBeenCalled();
    expect(mockTicketFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { booking: { eventId: 1 }, status: 'valid' },
      })
    );
    // Debe notificar (2 tickets encontrados -> 2 audit logs)
    expect(mockAuditLogCreate).toHaveBeenCalledTimes(2);
    // Debe enviar notificación
    expect(mockNotifCreateEvent).toHaveBeenCalledWith(1, expect.objectContaining({
      type: 'EVENT_CANCELLED',
    }));
  });
});

describe('autoFinishPastEvents', () => {
  it('debe marcar eventos pasados como FINISHED y crear logs', async () => {
    mockUpdateManyResult.mockResolvedValue({ count: 2 });
    mockStatusEventFindMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    mockStatusLogCreate.mockResolvedValue({});

    const { autoFinishPastEvents } = await import('../services/eventStatusService');
    const result = await autoFinishPastEvents();

    expect(result.count).toBe(2);
    expect(mockStatusLogCreate).toHaveBeenCalledTimes(2);
  });

  it('debe retornar count 0 si no hay eventos para actualizar', async () => {
    mockUpdateManyResult.mockResolvedValue({ count: 0 });

    const { autoFinishPastEvents } = await import('../services/eventStatusService');
    const result = await autoFinishPastEvents();

    expect(result.count).toBe(0);
    expect(mockStatusLogCreate).not.toHaveBeenCalled();
  });
});
export {};
