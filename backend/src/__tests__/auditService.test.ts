/// <reference types="jest" />

const mockAuditCreate = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    ticketAuditLog: {
      create: mockAuditCreate,
    },
    $disconnect: jest.fn(),
  })),
}));

beforeEach(() => {
  mockAuditCreate.mockReset();
});

describe('logTicketAction', () => {
  it('debe crear un audit log con todos los campos', async () => {
    mockAuditCreate.mockResolvedValue({ id: 1 });

    const { logTicketAction } = await import('../services/auditService');
    await logTicketAction({
      ticketId: 42,
      action: 'TICKET_VALIDATED',
      userId: 10,
      metadata: { reason: 'check-in', method: 'qr' },
    });

    expect(mockAuditCreate).toHaveBeenCalledWith({
      data: {
        ticketId: 42,
        action: 'TICKET_VALIDATED',
        userId: 10,
        metadata: JSON.stringify({ reason: 'check-in', method: 'qr' }),
      },
    });
  });

  it('debe aceptar userId null', async () => {
    mockAuditCreate.mockResolvedValue({ id: 2 });

    const { logTicketAction } = await import('../services/auditService');
    await logTicketAction({
      ticketId: 10,
      action: 'TICKET_CREATED',
      userId: null,
    });

    expect(mockAuditCreate).toHaveBeenCalledWith({
      data: {
        ticketId: 10,
        action: 'TICKET_CREATED',
        userId: null,
        metadata: null,
      },
    });
  });

  it('debe manejar error sin propagar (solo console.error)', async () => {
    mockAuditCreate.mockRejectedValue(new Error('DB error'));

    const { logTicketAction } = await import('../services/auditService');
    await expect(
      logTicketAction({ ticketId: 1, action: 'TICKET_VALIDATED', userId: 1 })
    ).resolves.toBeUndefined();
  });
});
export {};
