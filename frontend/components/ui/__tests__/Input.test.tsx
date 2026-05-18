import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Input', () => {
  it('renderiza label, input y helperText', () => {
    render(<Input label="Email" helperText="Tu correo" />)
    expect(screen.getByText(/email/i)).toBeInTheDocument()
    expect(screen.getByTestId('input')).toBeInTheDocument()
    expect(screen.getByText(/tu correo/i)).toBeInTheDocument()
  })

  it('muestra error y aplica clases de error', () => {
    render(<Input label="Nombre" error="Requerido" />)
    expect(screen.getByText(/requerido/i)).toBeInTheDocument()
    expect(screen.getByTestId('input')).toHaveClass('border-red-300')
  })

  it('llama onChange al escribir', async () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)

    await userEvent.type(screen.getByTestId('input'), 'abc')
    expect(handleChange).toHaveBeenCalledTimes(3)
  })
})
