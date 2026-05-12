/// <reference types="jest" />

import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret-with-at-least-32-chars!!';
process.env.JWT_SECRET = JWT_SECRET;

const mockGetDashboardMetrics = jest.fn();
const mockGetEventsCreated = jest.fn();
const mockGetAttendeeMetrics = jest.fn();
const mockGetRatingMetrics = jest.fn();
const mockGetCompletedEvents = jest.fn();

jest.mock('../services/dashboardService', () => ({
  getDashboardMetrics: (...args: any[]) => mockGetDashboardMetrics(...args),
  getEventsCreatedMetrics: (...args: any[]) => mockGetEventsCreated(...args),
  getAttendeeMetrics: (...args: any[]) => mockGetAttendeeMetrics(...args),
  getRatingMetrics: (...args: any[]) => mockGetRatingMetrics(...args),
  getCompletedEventsMetrics: (...args: any[]) => mockGetCompletedEvents(...args),
}));

import dashboardRoutes from '../routes/dashboard';

const app = express();
app.use(express.json());
app.use('/api/dashboard', dashboardRoutes);

function makeRequest(method: string, path: string, token?: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = (server.address() as any).port;
      const req = http.request({
        hostname: 'localhost', port, path, method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
      req.end();
    });
  });
}

function tokenFor(role: string): string {
  return jwt.sign({ id: 1, email: `u@t.com`, role }, JWT_SECRET);
}

beforeEach(() => {
  mockGetDashboardMetrics.mockReset();
  mockGetEventsCreated.mockReset();
  mockGetAttendeeMetrics.mockReset();
  mockGetRatingMetrics.mockReset();
  mockGetCompletedEvents.mockReset();
});

describe('GET /api/dashboard/metrics', () => {
  it('debe retornar 401 sin token', async () => {
    const { status } = await makeRequest('GET', '/api/dashboard/metrics');
    expect(status).toBe(401);
  });

  it('debe retornar 403 si rol es user', async () => {
    const { status, body } = await makeRequest('GET', '/api/dashboard/metrics', tokenFor('user'));
    expect(status).toBe(403);
    expect(body.error).toContain('organizador o administrador');
  });

  it('debe retornar 200 si es organizer', async () => {
    mockGetDashboardMetrics.mockResolvedValue({ totalEvents: 5 });
    const { status, body } = await makeRequest('GET', '/api/dashboard/metrics', tokenFor('organizer'));
    expect(status).toBe(200);
    expect(body.data.totalEvents).toBe(5);
  });

  it('debe retornar 403 si scope=all y no es admin', async () => {
    const { status, body } = await makeRequest('GET', '/api/dashboard/metrics?scope=all', tokenFor('organizer'));
    expect(status).toBe(403);
    expect(body.error).toContain('Solo administradores');
  });

  it('debe retornar 200 si scope=all y es admin', async () => {
    mockGetDashboardMetrics.mockResolvedValue({ totalEvents: 50 });
    const { status, body } = await makeRequest('GET', '/api/dashboard/metrics?scope=all', tokenFor('admin'));
    expect(status).toBe(200);
    expect(body.data.totalEvents).toBe(50);
  });

  it('debe retornar 400 si startDate inválida', async () => {
    const { status, body } = await makeRequest('GET', '/api/dashboard/metrics?startDate=bad-date', tokenFor('organizer'));
    expect(status).toBe(400);
    expect(body.error).toContain('startDate inválida');
  });

  it('debe retornar 400 si startDate > endDate', async () => {
    const { status } = await makeRequest('GET', '/api/dashboard/metrics?startDate=2025-12-31&endDate=2025-01-01', tokenFor('organizer'));
    expect(status).toBe(400);
  });

  it('debe retornar 400 si status inválido', async () => {
    const { status } = await makeRequest('GET', '/api/dashboard/metrics?status=INVALID', tokenFor('organizer'));
    expect(status).toBe(400);
  });

  it('debe pasar refresh=true al servicio', async () => {
    mockGetDashboardMetrics.mockResolvedValue({ totalEvents: 3 });
    await makeRequest('GET', '/api/dashboard/metrics?refresh=true', tokenFor('organizer'));
    expect(mockGetDashboardMetrics).toHaveBeenCalledWith(1, expect.any(Object), true);
  });
});

describe('GET /api/dashboard/metrics/events-created', () => {
  it('debe retornar 200', async () => {
    mockGetEventsCreated.mockResolvedValue({ totalEvents: 10 });
    const { status } = await makeRequest('GET', '/api/dashboard/metrics/events-created', tokenFor('organizer'));
    expect(status).toBe(200);
  });
});

describe('GET /api/dashboard/metrics/attendees', () => {
  it('debe retornar 200', async () => {
    mockGetAttendeeMetrics.mockResolvedValue({ totalAttendees: 100 });
    const { status } = await makeRequest('GET', '/api/dashboard/metrics/attendees', tokenFor('organizer'));
    expect(status).toBe(200);
  });
});

describe('GET /api/dashboard/metrics/average-rating', () => {
  it('debe retornar 200', async () => {
    mockGetRatingMetrics.mockResolvedValue({ averageRating: 4.5 });
    const { status } = await makeRequest('GET', '/api/dashboard/metrics/average-rating', tokenFor('organizer'));
    expect(status).toBe(200);
  });
});

describe('GET /api/dashboard/metrics/events-completed', () => {
  it('debe retornar 200', async () => {
    mockGetCompletedEvents.mockResolvedValue({ completedEvents: 3 });
    const { status } = await makeRequest('GET', '/api/dashboard/metrics/events-completed', tokenFor('organizer'));
    expect(status).toBe(200);
  });
});
