import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FavoriteButton } from '../FavoriteButton'
import * as auth from '../../lib/auth'
import * as favorites from '../../lib/useFavorites'

jest.mock('../../lib/auth')
jest.mock('../../lib/useFavorites')
jest.mock('../../lib/notifications', () => ({ showError: jest.fn() }))

const mockUseAuth = auth.useAuth as jest.MockedFunction<typeof auth.useAuth>
const mockUseFavorites = favorites.useFavorites as jest.MockedFunction<
  typeof favorites.useFavorites
>

describe('FavoriteButton', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Test', email: 't@t.com', role: 'user' },
    } as any)
    mockUseFavorites.mockReturnValue({
      toggleFavorite: jest.fn().mockResolvedValue(true),
    })
  })

  it('muestra corazon vacio cuando no es favorito', () => {
    render(<FavoriteButton eventId={1} initialFavorited={false} />)
    expect(screen.getByTestId('favorite-button')).toHaveAttribute(
      'aria-label',
      'Añadir a favoritos'
    )
  })

  it('muestra corazon lleno cuando es favorito', () => {
    render(<FavoriteButton eventId={1} initialFavorited={true} />)
    expect(screen.getByTestId('favorite-button')).toHaveAttribute(
      'aria-label',
      'Quitar de favoritos'
    )
  })

  it('redirige a login si no hay usuario', async () => {
    const toggleFn = jest.fn().mockResolvedValue(true)
    mockUseAuth.mockReturnValue({ user: null } as any)
    mockUseFavorites.mockReturnValue({ toggleFavorite: toggleFn })

    render(<FavoriteButton eventId={1} />)
    await userEvent.click(screen.getByTestId('favorite-button'))

    // No debe llamar a toggleFavorite porque redirige a login
    expect(toggleFn).not.toHaveBeenCalled()
  })

  it('llama toggleFavorite y onToggle al hacer click', async () => {
    const toggleFn = jest.fn().mockResolvedValue(true)
    const onToggle = jest.fn()
    mockUseFavorites.mockReturnValue({ toggleFavorite: toggleFn })

    render(
      <FavoriteButton
        eventId={1}
        initialFavorited={false}
        onToggle={onToggle}
      />
    )
    await userEvent.click(screen.getByTestId('favorite-button'))

    await waitFor(() => {
      expect(toggleFn).toHaveBeenCalledWith(1, false)
      expect(onToggle).toHaveBeenCalledWith(1, true)
    })
  })

  it('revierte estado si toggleFavorite falla', async () => {
    const toggleFn = jest.fn().mockResolvedValue(false)
    mockUseFavorites.mockReturnValue({ toggleFavorite: toggleFn })

    render(<FavoriteButton eventId={1} initialFavorited={false} />)
    await userEvent.click(screen.getByTestId('favorite-button'))

    await waitFor(() => {
      expect(screen.getByTestId('favorite-button')).toHaveAttribute(
        'aria-label',
        'Añadir a favoritos'
      )
    })
  })
})
