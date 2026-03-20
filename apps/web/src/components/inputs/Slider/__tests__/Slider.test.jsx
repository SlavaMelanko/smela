import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests'

import { Slider } from '../Slider'

const defaultProps = {
  value: 500,
  onChange: jest.fn(),
  min: 0,
  max: 1000,
  presetValues: [100, 250, 500, 750, 1000],
  unit: 'USD'
}

describe('Slider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders labels with min and max values by default', () => {
    const { container } = renderWithProviders(<Slider {...defaultProps} />)

    const labels = container.querySelectorAll('.text-foreground')

    expect(labels[0]).toHaveTextContent('0 USD')
    expect(labels[1]).toHaveTextContent('1,000 USD')
  })

  it('renders preset buttons', () => {
    renderWithProviders(<Slider {...defaultProps} />)

    expect(screen.getByRole('button', { name: '100 USD' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '250 USD' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '500 USD' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '750 USD' })).toBeInTheDocument()
    expect(screen.getAllByText('1,000 USD')).toHaveLength(2) // range label + preset
  })

  it('calls onChange when preset button is clicked', async () => {
    const onChange = jest.fn()

    renderWithProviders(<Slider {...defaultProps} onChange={onChange} />)

    await userEvent.click(screen.getByRole('button', { name: '250 USD' }))

    expect(onChange).toHaveBeenCalledWith(250)
  })

  it('highlights active preset button', () => {
    renderWithProviders(<Slider {...defaultProps} value={750} />)

    const activeButton = screen.getByRole('button', { name: '750 USD' })

    expect(activeButton).toHaveClass('text-foreground')
  })

  it('renders without unit', () => {
    const { container } = renderWithProviders(
      <Slider {...defaultProps} unit={undefined} />
    )

    const labels = container.querySelectorAll('.text-foreground')

    expect(labels[0]).toHaveTextContent('0')
    expect(labels[1]).toHaveTextContent('1,000')
  })
})
