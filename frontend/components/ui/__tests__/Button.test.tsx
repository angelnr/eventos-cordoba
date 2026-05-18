import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Button', () => {
  it('renderiza children y responde a click', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Haz clic</Button>)

    const button = screen.getByTestId('button')
    expect(button).toHaveTextContent('Haz clic')

    await userEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('aplica variantes correctamente', () => {
    const { rerender } = render(<Button variant="primary">P</Button>)
    expect(screen.getByTestId('button')).toHaveClass('bg-blue-600')

    rerender(<Button variant="danger">D</Button>)
    expect(screen.getByTestId('button')).toHaveClass('bg-red-600')

    rerender(<Button variant="secondary">S</Button>)
    expect(screen.getByTestId('button')).toHaveClass('bg-gray-200')
  })

  it('muestra spinner y deshabilita cuando isLoading=true', () => {
    render(<Button isLoading>Cargando</Button>)
    const button = screen.getByTestId('button')
    expect(button).toBeDisabled()
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('respeta disabled prop', () => {
    render(<Button disabled>No click</Button>)
    expect(screen.getByTestId('button')).toBeDisabled()
  })

  it('aplica fullWidth', () => {
    render(<Button fullWidth>Ancho</Button>)
    expect(screen.getByTestId('button')).toHaveClass('w-full')
  })

  it('no tiene violaciones de accesibilidad basicas', async () => {
    const { container } = render(
      <Button onClick={() => {}}>Accesible</Button>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
