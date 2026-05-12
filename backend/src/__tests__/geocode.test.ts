/// <reference types="jest" />

import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret-with-at-least-32-chars!!';
process.env.JWT_SECRET = JWT_SECRET;

const mockReverseGeocode = jest.fn();
const mockGetPlaceDetails = jest.fn();

jest.mock('../services/googleMapsService', () => ({
  googleMapsService: {
    reverseGeocode: mockReverseGeocode,
    getPlaceDetails: mockGetPlaceDetails,
  },
}));

jest.mock('express-rate-limit', () => jest.fn(() => (req: any, res: any, next: any) => next()));

import geocodeRoutes from '../routes/geocode';

const app = express();
app.use(express.json());
app.use('/api/geocode', geocodeRoutes);

function makeRequest(method: string, path: string, body?: any, token?: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = (server.address() as any).port;
      const postData = body ? JSON.stringify(body) : undefined;
      const req = http.request({
        hostname: 'localhost', port, path, method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData).toString() } : {}),
        },
      }, (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        res.on('end', () => {
          server.close();
          try { resolve({ status: res.statusCode || 500, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode || 500, body: data }); }
        });
      });
      req.on('error', (err) => { server.close(); reject(err); });
      if (postData) req.write(postData);
      req.end();
    });
  });
}

function userToken(id: number = 1): string {
  return jwt.sign({ id, email: `u${id}@t.com`, role: 'user' }, JWT_SECRET);
}

beforeEach(() => {
  mockReverseGeocode.mockReset();
  mockGetPlaceDetails.mockReset();
});

describe('POST /api/geocode/reverse', () => {
  it('debe retornar 400 si falta latitud', async () => {
    const { status, body } = await makeRequest('POST', '/api/geocode/reverse', { longitude: 0 }, userToken());
    expect(status).toBe(400);
    expect(body.error).toBe('Latitud es requerida');
  });

  it('debe retornar 400 si latitud inválida', async () => {
    const { status, body } = await makeRequest('POST', '/api/geocode/reverse', { latitude: 91, longitude: 0 }, userToken());
    expect(status).toBe(400);
  });

  it('debe retornar 200 con datos de dirección', async () => {
    mockReverseGeocode.mockResolvedValue({
      formattedAddress: 'Pl. Constitución, Córdoba',
      city: 'Córdoba', country: 'España', postalCode: '14002',
    });
    const { status, body } = await makeRequest('POST', '/api/geocode/reverse', { latitude: 37.884, longitude: -4.779 }, userToken());
    expect(status).toBe(200);
    expect(body.data.formattedAddress).toBe('Pl. Constitución, Córdoba');
  });

  it('debe retornar 400 si NO_RESULTS', async () => {
    mockReverseGeocode.mockRejectedValue(new Error('NO_RESULTS'));
    const { status, body } = await makeRequest('POST', '/api/geocode/reverse', { latitude: 0, longitude: 200 }, userToken());
    expect(status).toBe(400);
  });

  it('debe retornar 429 si QUOTA_EXCEEDED', async () => {
    mockReverseGeocode.mockRejectedValue(new Error('QUOTA_EXCEEDED'));
    const { status, body } = await makeRequest('POST', '/api/geocode/reverse', { latitude: 0, longitude: 0 }, userToken());
    expect(status).toBe(429);
  });

  it('debe retornar 503 si error genérico', async () => {
    mockReverseGeocode.mockRejectedValue(new Error('network error'));
    const { status } = await makeRequest('POST', '/api/geocode/reverse', { latitude: 0, longitude: 0 }, userToken());
    expect(status).toBe(503);
  });
});

describe('GET /api/geocode/place', () => {
  it('debe retornar 400 si falta placeId', async () => {
    const { status, body } = await makeRequest('GET', '/api/geocode/place', undefined, userToken());
    expect(status).toBe(400);
    expect(body.error).toBe('Place ID es requerido');
  });

  it('debe retornar 200 con datos del lugar', async () => {
    mockGetPlaceDetails.mockResolvedValue({ placeId: 'ChIJ_test', name: 'Plaza Mayor', formattedAddress: 'Córdoba' });
    const { status, body } = await makeRequest('GET', '/api/geocode/place?placeId=ChIJ_test', undefined, userToken());
    expect(status).toBe(200);
    expect(body.data.placeId).toBe('ChIJ_test');
  });

  it('debe retornar 400 si INVALID_PLACE_ID', async () => {
    mockGetPlaceDetails.mockRejectedValue(new Error('INVALID_PLACE_ID'));
    const { status } = await makeRequest('GET', '/api/geocode/place?placeId=bad', undefined, userToken());
    expect(status).toBe(400);
  });

  it('debe retornar 404 si PLACE_NOT_FOUND', async () => {
    mockGetPlaceDetails.mockRejectedValue(new Error('PLACE_NOT_FOUND'));
    const { status } = await makeRequest('GET', '/api/geocode/place?placeId=INVALID', undefined, userToken());
    expect(status).toBe(404);
  });

  it('debe retornar 429 si QUOTA_EXCEEDED', async () => {
    mockGetPlaceDetails.mockRejectedValue(new Error('QUOTA_EXCEEDED'));
    const { status } = await makeRequest('GET', '/api/geocode/place?placeId=ChIJ_q', undefined, userToken());
    expect(status).toBe(429);
  });
});
