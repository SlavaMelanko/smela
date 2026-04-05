import { resources } from '@smela/i18n/resources'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@ui/tests'
const en = resources.en.translation

import { SettingsPageHeader } from '../SettingsPageHeader'
import { TeamPageHeader } from '../TeamPageHeader'
import { UserPageHeader } from '../UserPageHeader'

const mockUseCurrentUser = vi.fn()

vi.mock('@ui/hooks/useAuth', async () => ({
  ...(await vi.importActual('@ui/hooks/useAuth')),
  useCurrentUser: () => mockUseCurrentUser()
}))

const ME = {
  id: '1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  role: 'admin'
}
const OTHER = {
  id: '2',
  firstName: 'Bob',
  lastName: 'Jones',
  email: 'bob@example.com',
  role: 'member'
}

beforeEach(() => {
  mockUseCurrentUser.mockReturnValue({ user: ME })
})

describe('PageHeader', () => {
  it('TeamPageHeader renders name and website link', () => {
    renderWithProviders(
      <TeamPageHeader name='Acme Corp' website='https://acme.com' />
    )

    expect(screen.getByText('Acme Corp')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /https:\/\/acme\.com/ })

    expect(link).toHaveAttribute('href', 'https://acme.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('SettingsPageHeader renders title and description', () => {
    renderWithProviders(
      <SettingsPageHeader title='Settings' description='Your preferences' />
    )

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Your preferences')).toBeInTheDocument()
  })
})

describe('UserPageHeader', () => {
  it('displays user name and email', () => {
    renderWithProviders(<UserPageHeader user={OTHER} />)

    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: OTHER.email })).toBeInTheDocument()
  })

  it('shows YouBadge when viewing own profile', () => {
    renderWithProviders(<UserPageHeader user={ME} />)

    expect(screen.getByText(`(${en.you})`)).toBeInTheDocument()
  })

  it('shows last active label when viewing another user with lastActive set', () => {
    renderWithProviders(
      <UserPageHeader user={{ ...OTHER, lastActive: '2025-01-01T00:00:00Z' }} />
    )

    expect(screen.getByText(`${en.lastActive.label}:`)).toBeInTheDocument()
  })

  it('does not show last active when viewing own profile', () => {
    renderWithProviders(
      <UserPageHeader user={{ ...ME, lastActive: '2025-01-01T00:00:00Z' }} />
    )

    expect(
      screen.queryByText(`${en.lastActive.label}:`)
    ).not.toBeInTheDocument()
  })

  it('does not show last active when user.lastActive is absent', () => {
    renderWithProviders(
      <UserPageHeader user={{ ...OTHER, lastActive: null }} />
    )

    expect(
      screen.queryByText(`${en.lastActive.label}:`)
    ).not.toBeInTheDocument()
  })
})
