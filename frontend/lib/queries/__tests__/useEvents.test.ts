import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEvents, useFiltersMeta } from '../useEvents'
import type { EventFilters } from '../../useEventFilters'
import React from 'react'

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return React.createElement(QueryClientProvider, { client }, children)
}

describe('useEvents', () => {
  it('retorna eventos paginados', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ id: 1, title: 'Evento 1' }],
        pagination: {
          page: 1,
          limit: 12,
          total: 1,
          pages: 1,
          hasNext: false,
          hasPrev: false,
        },
        filters: { applied: {} },
      }),
    } as Response)

    const filters: EventFilters = { page: 1, limit: 12, sortBy: 'date', sortOrder: 'asc' }
    const { result } = renderHook(() => useEvents(filters), {
      wrapper,
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
  })
})

describe('useFiltersMeta', () => {
  it('carga metadatos', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          categories: [
            { id: 1, name: 'Musica', color: '#ff0', eventCount: 5 },
          ],
          priceRange: { min: 0, max: 100 },
          ratingRange: { min: 1, max: 5, average: 3.5 },
          totalActiveEvents: 10,
          totalFreeEvents: 2,
          totalAvailableEvents: 8,
          totalSoldOutEvents: 2,
        },
      }),
    } as Response)

    const { result } = renderHook(() => useFiltersMeta(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.categories[0].name).toBe('Musica')
  })
})
