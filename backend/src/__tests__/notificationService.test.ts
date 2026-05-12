/// <reference types="jest" />

const mockNotifCreate = jest.fn();
const mockNotifCreateMany = jest.fn();
const mockBookingFindMany = jest.fn();
const mockFavoriteFindMany = jest.fn();
const mockEventFindUnique = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    notification: {
      create: mockNotifCreate,
      createMany: mockNotifCreateMany,
    },
    booking: {
      findMany: mockBookingFindMany,
    },
    favorite: {
      findMany: mockFavoriteFindMany,
    },
    event: {
      findUnique: mockEventFindUnique,
    },
    $disconnect: jest.fn(),
  })),
}));

beforeEach(() => {
  mockNotifCreate.mockReset();
  mockNotifCreateMany.mockReset();
  mockBookingFindMany.mockReset();
  mockFavoriteFindMany.mockReset();
  mockEventFindUnique.mockReset();
});

describe('createNotification', () => {
  it('debe lanzar error si el tipo es inválido', async () => {
    const { createNotification } = await import('../services/notificationService');

    await expect(
      createNotification({
        userId: 1,
        type: 'INVALID_TYPE' as any,
        title: 'Test',
        message: 'Message',
      })
    ).rejects.toThrow('Tipo de notificación inválido');
  });

  it('debe lanzar error si falta userId, title o message', async () => {
    const { createNotification } = await import('../services/notificationService');

    await expect(
      createNotification({ userId: 0 as any, type: 'BOOKING_CONFIRMED', title: '', message: '' })
    ).rejects.toThrow('userId, title y message son requeridos');
  });

  it('debe truncar title a 100 chars y message a 500', async () => {
    mockNotifCreate.mockResolvedValue({});

    const { createNotification } = await import('../services/notificationService');
    await createNotification({
      userId: 1,
      type: 'BOOKING_CONFIRMED',
      title: 'a'.repeat(150),
      message: 'b'.repeat(600),
    });

    expect(mockNotifCreate).toHaveBeenCalledWith({
      data: {
        userId: 1,
        type: 'BOOKING_CONFIRMED',
        title: 'a'.repeat(100),
        message: 'b'.repeat(500),
        link: null,
        eventId: null,
        isRead: false,
      },
    });
  });

  it('debe crear notificación correctamente', async () => {
    mockNotifCreate.mockResolvedValue({ id: 1, userId: 1, type: 'EVENT_REMINDER' });

    const { createNotification } = await import('../services/notificationService');
    const result = await createNotification({
      userId: 1,
      type: 'EVENT_REMINDER',
      title: 'Recordatorio',
      message: 'Tu evento empieza mañana',
      eventId: 10,
      link: '/events/10',
    });

    expect(result.id).toBe(1);
    expect(mockNotifCreate).toHaveBeenCalledWith({
      data: {
        userId: 1,
        type: 'EVENT_REMINDER',
        title: 'Recordatorio',
        message: 'Tu evento empieza mañana',
        link: '/events/10',
        eventId: 10,
        isRead: false,
      },
    });
  });

  it('debe aceptar tipos válidos: EVENT_CANCELLED, EVENT_DATE_CHANGED, ORGANIZER_ANNOUNCEMENT', async () => {
    mockNotifCreate.mockResolvedValue({});

    const { createNotification } = await import('../services/notificationService');

    await expect(
      createNotification({ userId: 1, type: 'EVENT_CANCELLED', title: 'X', message: 'Y' })
    ).resolves.toBeDefined();

    await expect(
      createNotification({ userId: 1, type: 'EVENT_DATE_CHANGED', title: 'X', message: 'Y' })
    ).resolves.toBeDefined();

    await expect(
      createNotification({ userId: 1, type: 'ORGANIZER_ANNOUNCEMENT', title: 'X', message: 'Y' })
    ).resolves.toBeDefined();
  });
});

describe('createNotificationForUsers', () => {
  it('debe retornar count 0 si el array está vacío', async () => {
    const { createNotificationForUsers } = await import('../services/notificationService');
    const result = await createNotificationForUsers([], {
      type: 'EVENT_CANCELLED',
      title: 'Test',
      message: 'Msg',
    });

    expect(result.count).toBe(0);
    expect(mockNotifCreateMany).not.toHaveBeenCalled();
  });

  it('debe deduplicar userIds', async () => {
    mockNotifCreateMany.mockResolvedValue({ count: 3 });

    const { createNotificationForUsers } = await import('../services/notificationService');
    const result = await createNotificationForUsers([1, 2, 1, 3, 2], {
      type: 'ORGANIZER_ANNOUNCEMENT',
      title: 'Anuncio',
      message: 'Importante',
    });

    expect(result.count).toBe(3);
    // Debe haber creado 3 notificaciones (userIds únicos: 1,2,3)
    expect(mockNotifCreateMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ userId: 1 }),
        expect.objectContaining({ userId: 2 }),
        expect.objectContaining({ userId: 3 }),
      ]),
      skipDuplicates: false,
    });
  });

  it('debe retornar 0 si el evento no existe', async () => {
    mockEventFindUnique.mockResolvedValue(null);

    const { createEventNotifications } = await import('../services/notificationService');
    const result = await createEventNotifications(999, {
      type: 'EVENT_CANCELLED',
      title: 'Cancelado',
      message: 'Evento cancelado',
    });

    expect(result.recipientCount).toBe(0);
  });

  it('debe combinar usuarios de bookings y favorites sin duplicados', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 10 });
    mockBookingFindMany.mockResolvedValue([
      { userId: 1 },
      { userId: 2 },
    ]);
    mockFavoriteFindMany.mockResolvedValue([
      { userId: 2 },
      { userId: 3 },
    ]);
    mockNotifCreateMany.mockResolvedValue({ count: 3 });

    const { createEventNotifications } = await import('../services/notificationService');
    const result = await createEventNotifications(10, {
      type: 'EVENT_CANCELLED',
      title: 'Cancelado',
      message: 'Evento cancelado',
    });

    expect(result.recipientCount).toBe(3);
    expect(mockNotifCreateMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ userId: 1 }),
        expect.objectContaining({ userId: 2 }),
        expect.objectContaining({ userId: 3 }),
      ]),
      skipDuplicates: false,
    });
  });

  it('debe retornar 0 si no hay bookings ni favorites', async () => {
    mockEventFindUnique.mockResolvedValue({ id: 10 });
    mockBookingFindMany.mockResolvedValue([]);
    mockFavoriteFindMany.mockResolvedValue([]);

    const { createEventNotifications } = await import('../services/notificationService');
    const result = await createEventNotifications(10, {
      type: 'EVENT_DATE_CHANGED',
      title: 'Cambio',
      message: 'Fecha cambiada',
    });

    expect(result.recipientCount).toBe(0);
    expect(mockNotifCreateMany).not.toHaveBeenCalled();
  });
});
export {};
