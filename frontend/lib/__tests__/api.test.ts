import { apiFetch, getApiUrl, ApiError } from '../api'

describe('getApiUrl', () => {
  it('retorna localhost en desarrollo (hostname por defecto en jsdom)', () => {
    expect(getApiUrl()).toBe('http://localhost:3001')
  })
})

describe('apiFetch', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    global.fetch = jest.fn()
  })

  it('retorna datos JSON en respuesta OK', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { id: 1 } }),
    } as Response)

    const result = await apiFetch('/api/events')
    expect(result).toEqual({ success: true, data: { id: 1 } })
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/events',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    )
  })

  it('incluye Authorization cuando se pasa token', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    await apiFetch('/api/protected', { token: 'abc123' })
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer abc123' }),
      })
    )
  })

  it('lanza ApiError con status y mensaje en respuesta fallida', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found', details: ['id invalido'] }),
    } as Response)

    try {
      await apiFetch('/api/events/999')
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      expect((err as ApiError).status).toBe(404)
      expect((err as ApiError).details).toEqual(['id invalido'])
    }
  })

  it('lanza ApiError con mensaje generico si body no tiene error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response)

    await expect(apiFetch('/api/fail')).rejects.toThrow('Error de API')
  })
})
