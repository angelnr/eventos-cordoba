import { renderHook, act } from '@testing-library/react'
import { useFavorites } from '../useFavorites'

jest.mock('../auth', () => ({
  useAuth: () => ({ token: 'test-token' }),
}))

describe('useFavorites', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('POST para anyadir favorito', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true } as Response)

    const { result } = renderHook(() => useFavorites())
    let success: boolean = false
    await act(async () => {
      success = await result.current.toggleFavorite(5, false)
    })

    expect(success).toBe(true)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/favorites'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ eventId: 5 }),
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      })
    )
  })

  it('DELETE para quitar favorito', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true } as Response)

    const { result } = renderHook(() => useFavorites())
    let success: boolean = false
    await act(async () => {
      success = await result.current.toggleFavorite(5, true)
    })

    expect(success).toBe(true)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/favorites/5'),
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      })
    )
  })
})
