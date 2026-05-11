import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const API_URL = process.env.E2E_API_URL || 'http://backend:3001';
const TEST_USER = { email: 'admin@example.com', password: 'admin123' };
let authToken: string;

test.describe('Avatar Upload Flow - E2E', () => {

  test('1. Login returns avatar field', async ({ request }) => {
    const res = await request.post(`${API_URL}/api/auth/login`, {
      data: TEST_USER,
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBeTruthy();
    expect(body.data.user).toHaveProperty('avatar');
    authToken = body.data.token;
  });

  test('2. Upload avatar returns success with URL', async ({ request }) => {
    const pngBuffer = createMinimalPNG();

    const res = await request.post(`${API_URL}/api/users/me/avatar`, {
      headers: { Authorization: `Bearer ${authToken}` },
      multipart: {
        avatar: {
          name: 'avatar.png',
          mimeType: 'image/png',
          buffer: pngBuffer,
        },
      },
    });
    const body = await res.json();
    expect(body.success).toBeTruthy();
    expect(body.data.user.avatar).toMatch(/^\/uploads\/avatars\/.+\.png$/);
  });

  test('3. GET /me returns the avatar', async ({ request }) => {
    const res = await request.get(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const body = await res.json();
    expect(body.success).toBeTruthy();
    expect(body.data.avatar).toMatch(/^\/uploads\/avatars\/.+\.png$/);
  });

  test('4. Replace avatar generates new URL', async ({ request }) => {
    // Get current avatar URL
    const getRes = await request.get(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const oldAvatar = (await getRes.json()).data.avatar;

    // Upload again
    const pngBuffer = createMinimalPNG();
    const res = await request.post(`${API_URL}/api/users/me/avatar`, {
      headers: { Authorization: `Bearer ${authToken}` },
      multipart: {
        avatar: {
          name: 'avatar.png',
          mimeType: 'image/png',
          buffer: pngBuffer,
        },
      },
    });
    const body = await res.json();
    expect(body.success).toBeTruthy();
    expect(body.data.user.avatar).not.toBe(oldAvatar);
  });

  test('5. DELETE avatar removes it', async ({ request }) => {
    const res = await request.delete(`${API_URL}/api/users/me/avatar`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const body = await res.json();
    expect(body.success).toBeTruthy();
    expect(body.data.user.avatar).toBeNull();
  });

  test('6. DELETE without avatar still succeeds', async ({ request }) => {
    const res = await request.delete(`${API_URL}/api/users/me/avatar`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const body = await res.json();
    expect(body.success).toBeTruthy();
  });

  test('7. No auth returns 401 Token requerido', async ({ request }) => {
    const pngBuffer = createMinimalPNG();
    const res = await request.post(`${API_URL}/api/users/me/avatar`, {
      multipart: {
        avatar: {
          name: 'avatar.png',
          mimeType: 'image/png',
          buffer: pngBuffer,
        },
      },
    });
    const body = await res.json();
    expect(body.error).toBe('Token requerido');
  });

  test('8. DELETE without auth returns 401', async ({ request }) => {
    const res = await request.delete(`${API_URL}/api/users/me/avatar`);
    expect(res.status()).toBe(401);
  });

  test('9. Verify returns avatar', async ({ request }) => {
    // Re-upload first to have an avatar
    const pngBuffer = createMinimalPNG();
    await request.post(`${API_URL}/api/users/me/avatar`, {
      headers: { Authorization: `Bearer ${authToken}` },
      multipart: {
        avatar: {
          name: 'avatar.png',
          mimeType: 'image/png',
          buffer: pngBuffer,
        },
      },
    });

    const res = await request.post(`${API_URL}/api/auth/verify`, {
      data: { token: authToken },
    });
    const body = await res.json();
    expect(body.success).toBeTruthy();
    expect(body.data.user.avatar).toMatch(/^\/uploads\/avatars\/.+\.png$/);
  });

  test('10. Cleanup: delete avatar', async ({ request }) => {
    const res = await request.delete(`${API_URL}/api/users/me/avatar`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.ok()).toBeTruthy();
  });
});

function createMinimalPNG(): Buffer {
  // Minimal 2x2 blue PNG
  const zlib = require('zlib');
  const crc32 = (buf: Buffer): number => {
    let crc = 0xFFFFFFFF;
    const table = new Int32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    for (let i = 0; i < buf.length; i++) {
      crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  };

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(2, 0);  // width
  ihdrData.writeUInt32BE(2, 4);  // height
  ihdrData[8] = 8;   // bit depth
  ihdrData[9] = 2;   // color type (RGB)

  const ihdrType = Buffer.from('IHDR');
  const ihdrLen = Buffer.alloc(4);
  ihdrLen.writeUInt32BE(13, 0);
  const ihdrCrcData = Buffer.concat([ihdrType, ihdrData]);
  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeUInt32BE(crc32(ihdrCrcData), 0);
  const ihdr = Buffer.concat([ihdrLen, ihdrType, ihdrData, ihdrCrc]);

  const rawData = Buffer.from([0, 0, 0, 255, 0, 0, 255, 0, 0, 255, 0, 0, 255]);
  const compressed = zlib.deflateSync(rawData);
  const idatType = Buffer.from('IDAT');
  const idatLen = Buffer.alloc(4);
  idatLen.writeUInt32BE(compressed.length, 0);
  const idatCrcData = Buffer.concat([idatType, compressed]);
  const idatCrc = Buffer.alloc(4);
  idatCrc.writeUInt32BE(crc32(idatCrcData), 0);
  const idat = Buffer.concat([idatLen, idatType, compressed, idatCrc]);

  const iendType = Buffer.from('IEND');
  const iendLen = Buffer.alloc(4);
  iendLen.writeUInt32BE(0, 0);
  const iendCrcData = iendType;
  const iendCrc = Buffer.alloc(4);
  iendCrc.writeUInt32BE(crc32(iendCrcData), 0);
  const iend = Buffer.concat([iendLen, iendType, iendCrc]);

  return Buffer.concat([sig, ihdr, idat, iend]);
}
