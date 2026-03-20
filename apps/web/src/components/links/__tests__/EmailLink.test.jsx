import { render, screen } from '@testing-library/react'

import { EmailLink } from '../EmailLink'

describe('EmailLink', () => {
  const email = 'test@example.com'

  it('renders with mailto href', () => {
    render(<EmailLink email={email} />)

    const link = screen.getByRole('link')

    expect(link).toHaveAttribute('href', `mailto:${email}`)
  })

  it('displays email as text when no children provided', () => {
    render(<EmailLink email={email} />)

    expect(screen.getByText(email)).toBeInTheDocument()
  })

  it('displays children when provided', () => {
    render(<EmailLink email={email}>Contact Us</EmailLink>)

    expect(screen.getByText('Contact Us')).toBeInTheDocument()
    expect(screen.queryByText(email)).not.toBeInTheDocument()
  })

  it('applies default size and underline classes', () => {
    render(<EmailLink email={email} />)

    const link = screen.getByRole('link')

    expect(link).toHaveClass('text-base', 'hover:underline')
  })

  it('applies size variant', () => {
    render(<EmailLink email={email} size='sm' />)

    expect(screen.getByRole('link')).toHaveClass('text-sm')
  })

  it('applies underline variant', () => {
    render(<EmailLink email={email} underline='always' />)

    expect(screen.getByRole('link')).toHaveClass('underline')
  })
})
