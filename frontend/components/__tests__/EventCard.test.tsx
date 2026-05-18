import { render, screen } from '@testing-library/react'
import EventCard from '../EventCard'
import type { EventResponse } from '../../lib/queries/useEvents'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

jest.mock('../FavoriteButton', () => ({
  FavoriteButton: ({ onToggle, initialFavorited }: any) => (
    <button data-testid="favorite-btn" onClick={() => onToggle?.(1, !initialFavorited)}>
      {initialFavorited ? 'fav' : 'no-fav'}
    </button>
  ),
}))

jest.mock('../StatusBadge', () => ({
  StatusBadge: ({ status }: any) => <span data-testid="status">{status}</span>,
}))

jest.mock('../../lib/imageUtils', () => ({
  getImageUrl: (url: string) => url,
  getContrastColor: () => '#000000',
}))

const mockEvent: EventResponse = {
  id: 1,
  title: 'Concierto Test',
  description: 'Desc',
  date: '2026-07-15T21:00:00Z',
  location: 'Teatro',
  capacity: 100,
  price: 25,
  status: 'SCHEDULED',
  imageUrl: undefined,
  organizerId: 1,
  categoryId: 1,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  averageRating: 4.5,
  reviewCount: 10,
  currentBookings: 50,
  availableSpots: 50,
  totalBookings: 50,
  isFavorited: false,
  favoriteCount: 3,
  organizer: { id: 1, name: 'Org Test' },
  category: { id: 1, name: 'Musica', color: '#ff0000' },
}

describe('EventCard', () => {
  it('muestra titulo, fecha, ubicacion, precio y plazas', () => {
    render(<EventCard event={mockEvent} />)
    expect(screen.getByTestId('event-title')).toHaveTextContent('Concierto Test')
    expect(screen.getByText(/teatro/i)).toBeInTheDocument()
    expect(screen.getByTestId('event-price')).toHaveTextContent('25.00')
    expect(screen.getByTestId('event-spots')).toHaveTextContent(/50 plazas/)
  })

  it('muestra Gratis cuando precio es 0', () => {
    render(<EventCard event={{ ...mockEvent, price: 0 }} />)
    expect(screen.getByTestId('event-price')).toHaveTextContent('Gratis')
  })

  it('muestra Sin categoria cuando no hay categoria', () => {
    render(<EventCard event={{ ...mockEvent, category: null }} />)
    expect(screen.getByTestId('event-card')).toHaveTextContent('Sin categor')
  })

  it('renderiza badge de estado cuando no es SCHEDULED', () => {
    render(<EventCard event={{ ...mockEvent, status: 'CANCELLED' as const }} />)
    expect(screen.getByTestId('status')).toHaveTextContent('CANCELLED')
  })

  it('muestra contador de favoritos', () => {
    render(<EventCard event={mockEvent} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('no tiene violaciones de accesibilidad basicas', async () => {
    const { container } = render(<EventCard event={mockEvent} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
