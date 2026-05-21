import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../login'
import { useAuth } from '../../lib/auth'
import { useRouter } from 'next/router'

jest.mock('../../lib/auth')
jest.mock('next/router', () => ({ useRouter: jest.fn() }))

const mockPush = jest.fn()
const mockLogin = jest.fn()

;(useRouter as jest.Mock).mockReturnValue({ push: mockPush, query: {} })
;(useAuth as jest.Mock).mockReturnValue({
  login: mockLogin,
  isLoading: false,
  error: null,
  user: null,
})

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('muestra formulario', () => {
    render(<LoginPage />)
    expect(screen.getByTestId('login-email')).toBeInTheDocument()
    expect(screen.getByTestId('login-password')).toBeInTheDocument()
    expect(screen.getByTestId('login-submit')).toBeInTheDocument()
  })

  it('llama login y redirige en exito', async () => {
    mockLogin.mockResolvedValue(undefined)
    render(<LoginPage />)

    await userEvent.type(screen.getByTestId('login-email'), 'test@test.com')
    await userEvent.type(screen.getByTestId('login-password'), 'secret123')
    await userEvent.click(screen.getByTestId('login-submit'))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'secret123')
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('redirige si ya esta autenticado', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      user: { id: 1 },
    })
    render(<LoginPage />)
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
