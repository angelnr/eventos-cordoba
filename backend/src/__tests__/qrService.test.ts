/// <reference types="jest" />

beforeAll(() => {
  process.env.NEXT_PUBLIC_FRONTEND_URL = 'https://eventoscordoba.xyz';
});

const mockToBuffer = jest.fn();
const mockToDataURL = jest.fn();

jest.mock('qrcode', () => ({
  toBuffer: mockToBuffer,
  toDataURL: mockToDataURL,
}));

beforeEach(() => {
  mockToBuffer.mockReset();
  mockToDataURL.mockReset();
});

describe('getQrPayload', () => {
  it('debe generar URL correcta con el token', async () => {
    const { getQrPayload } = await import('../services/qrService');
    const payload = getQrPayload('token-123');

    expect(payload).toBe('https://eventoscordoba.xyz/tickets/verify/token-123');
  });
});

describe('generateQrImage', () => {
  it('debe llamar a QRCode.toBuffer con opciones correctas', async () => {
    mockToBuffer.mockResolvedValue(Buffer.from('png-data'));

    const { generateQrImage } = await import('../services/qrService');
    const result = await generateQrImage('test-token');

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(mockToBuffer).toHaveBeenCalledWith(
      'https://eventoscordoba.xyz/tickets/verify/test-token',
      expect.objectContaining({
        type: 'png',
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'H',
      })
    );
  });
});

describe('generateQrDataUrl', () => {
  it('debe llamar a QRCode.toDataURL con opciones correctas', async () => {
    mockToDataURL.mockResolvedValue('data:image/png;base64,abc');

    const { generateQrDataUrl } = await import('../services/qrService');
    const result = await generateQrDataUrl('data-token');

    expect(result).toBe('data:image/png;base64,abc');
    expect(mockToDataURL).toHaveBeenCalledWith(
      'https://eventoscordoba.xyz/tickets/verify/data-token',
      expect.objectContaining({
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'H',
      })
    );
  });
});
export {};
