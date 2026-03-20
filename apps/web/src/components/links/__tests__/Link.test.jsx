import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests'

import { Link } from '../Link'

describe('Link', () => {
  it('renders children with correct href', () => {
    renderWithProviders(<Link to='/dashboard'>Dashboard</Link>)

    const link = screen.getByRole('link', { name: 'Dashboard' })

    expect(link).toHaveAttribute('href', '/dashboard')
  })

  it('applies default size and underline classes', () => {
    renderWithProviders(<Link to='/test'>Test</Link>)

    const link = screen.getByRole('link')

    expect(link).toHaveClass('text-base', 'hover:underline')
  })

  it.each([
    ['xs', 'text-xs'],
    ['sm', 'text-sm'],
    ['lg', 'text-lg']
  ])('applies %s size variant', (size, expectedClass) => {
    renderWithProviders(
      <Link to='/test' size={size}>
        Test
      </Link>
    )

    expect(screen.getByRole('link')).toHaveClass(expectedClass)
  })

  it.each([
    ['always', 'underline'],
    ['hover', 'hover:underline']
  ])('applies %s underline variant', (underline, expectedClass) => {
    renderWithProviders(
      <Link to='/test' underline={underline}>
        Test
      </Link>
    )

    expect(screen.getByRole('link')).toHaveClass(expectedClass)
  })

  it('sets target and rel for openInNewTab', () => {
    renderWithProviders(
      <Link to='/external' openInNewTab>
        External
      </Link>
    )

    const link = screen.getByRole('link')

    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does not set target when openInNewTab is false', () => {
    renderWithProviders(<Link to='/internal'>Internal</Link>)

    const link = screen.getByRole('link')

    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
  })
})
