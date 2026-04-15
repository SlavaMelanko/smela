import { resources } from '@smela/i18n/resources'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@ui/tests'

const en = resources.en.translation

import { LastActiveBadge } from '../LastActiveBadge'

vi.mock('@ui/lib/format', async importOriginal => {
  const actual = await importOriginal()

  return {
    ...actual,
    timeSince: vi.fn()
  }
})

import { timeSince } from '@ui/lib/format'

describe('LastActiveBadge', () => {
  it('renders nothing when date is not provided', () => {
    const { container } = renderWithProviders(<LastActiveBadge />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders "just now" when active less than 60 seconds ago', () => {
    timeSince.mockReturnValue({ seconds: 30, minutes: 0, hours: 0, days: 0 })

    renderWithProviders(<LastActiveBadge date={new Date()} />)

    expect(screen.getByText(en.lastActive.justNow)).toBeInTheDocument()
  })

  it('renders minutes when active less than 60 minutes ago', () => {
    timeSince.mockReturnValue({ seconds: 300, minutes: 5, hours: 0, days: 0 })

    renderWithProviders(<LastActiveBadge date={new Date()} />)

    expect(screen.getByText('5 minutes ago')).toBeInTheDocument()
  })

  it('renders hours when active less than 24 hours ago', () => {
    timeSince.mockReturnValue({
      seconds: 10800,
      minutes: 180,
      hours: 3,
      days: 0
    })

    renderWithProviders(<LastActiveBadge date={new Date()} />)

    expect(screen.getByText('3 hours ago')).toBeInTheDocument()
  })

  it('renders days when active less than 30 days ago', () => {
    timeSince.mockReturnValue({
      seconds: 604800,
      minutes: 10080,
      hours: 168,
      days: 7
    })

    renderWithProviders(<LastActiveBadge date={new Date()} />)

    expect(screen.getByText('7 days ago')).toBeInTheDocument()
  })

  it('renders formatted date when active 30 or more days ago', () => {
    timeSince.mockReturnValue({
      seconds: 2592000,
      minutes: 43200,
      hours: 720,
      days: 30
    })

    const date = new Date('2024-01-01')

    renderWithProviders(<LastActiveBadge date={date} />)

    expect(screen.getByText(/2024/)).toBeInTheDocument()
  })
})
