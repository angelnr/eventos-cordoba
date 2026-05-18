import { renderHook, waitFor } from '@testing-library/react'
import { useComments } from '../useComments'

describe('useComments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('carga comentarios al montar', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ id: 1, content: 'Hola', user: { id: 1, name: 'A', avatar: null } }],
        stats: { totalComments: 1 },
        pagination: { pages: 1 },
      }),
    } as Response)

    const { result } = renderHook(() => useComments(1, 'tok'))

    await waitFor(() => expect(result.current.comments.length).toBe(1))
    expect(result.current.totalComments).toBe(1)
    expect(result.current.hasMore).toBe(false)
  })
})
