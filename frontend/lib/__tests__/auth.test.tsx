import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../auth'
import React from 'react'

const mockFetch = jest.fn()
global.fetch = mockFetch

jest.mock('../notifications', () => ({ showSuccess: jest.fn() }))

function TestConsumer() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="user">{auth.user ? auth.user.name : 'no-user'}</span>
      <span data-testid="init">{auth.isInitializing ? 'init' : 'ready'}</span>
      <button onClick={() => auth.login('test@test.com', 'pass123')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  )
}

function renderWithProvider() {
  return render(React.createElement(AuthProvider, null, React.createElement(TestConsumer)))
}

describe('AuthProvider', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mockFetch.mockClear()
  })

  it('termina sin token si no hay token guardado', async () => {
    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('init')).toHaveTextContent('ready'))
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  })

  it('verifica token en localStorage al montar', async () => {
    window.localStorage.setItem('auth_token', 'old_token')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          token: 'new_token',
          user: { id: 1, name: 'Carlos', email: 'c@t.com', role: 'user' },
        },
      }),
    } as Response)

    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Carlos'))
    expect(window.localStorage.getItem('auth_token')).toBe('new_token')
  })

  it('elimina token invalido', async () => {
    window.localStorage.setItem('auth_token', 'bad_token')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false }),
    } as Response)

    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('no-user'))
    expect(window.localStorage.getItem('auth_token')).toBeNull()
  })

  it('login guarda token y usuario', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { token: 'abc', user: { id: 2, name: 'Nuevo', email: 'n@n.com', role: 'user' } },
      }),
    } as Response)

    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('init')).toHaveTextContent('ready'))

    await act(async () => {
      screen.getByRole('button', { name: /login/i }).click()
    })

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('Nuevo'))
    expect(window.localStorage.getItem('auth_token')).toBe('abc')
  })

  it('logout limpia estado', async () => {
    window.localStorage.setItem('auth_token', 'tok')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { token: 'tok', user: { id: 1, name: 'X', email: 'x@x.com', role: 'user' } },
      }),
    } as Response)

    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('X'))

    await act(async () => {
      screen.getByRole('button', { name: /logout/i }).click()
    })

    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
    expect(window.localStorage.getItem('auth_token')).toBeNull()
  })
})
