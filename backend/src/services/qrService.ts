import QRCode from 'qrcode';

const QR_BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://eventoscordoba.xyz';

export function getQrPayload(token: string): string {
  return `${QR_BASE_URL}/tickets/verify/${token}`;
}

export async function generateQrImage(token: string): Promise<Buffer> {
  const payload = getQrPayload(token);
  return QRCode.toBuffer(payload, {
    type: 'png',
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}

export async function generateQrDataUrl(token: string): Promise<string> {
  const payload = getQrPayload(token);
  return QRCode.toDataURL(payload, {
    width: 400,
    margin: 2,
    errorCorrectionLevel: 'H',
  });
}
