import { resources } from '@smela/i18n/resources'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@ui/contexts/ThemeContext'
import { ToastProvider } from '@ui/contexts/ToastContext'
import { renderWithProviders } from '@ui/tests'
const en = resources.en.translation

import { TeamPageHeader } from '../TeamPageHeader'
import { UserPageHeader } from '../UserPageHeader'

const mockUseCurrentUser = vi.fn()
const mockWriteText = vi.fn()

vi.mock('@ui/hooks/useAuth', async () => ({
  ...(await vi.importActual('@ui/hooks/useAuth')),
  useCurrentUser: () => mockUseCurrentUser()
}))

const ME = {
  id: '1',
  nickname: 'Ali',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  role: 'admin'
}
const OTHER = {
  id: '2',
  nickname: 'Bobby',
  firstName: null,
  lastName: null,
  email: 'bob@example.com',
  role: 'member'
}

beforeEach(() => {
  mockUseCurrentUser.mockReturnValue({ user: ME })
  mockWriteText.mockResolvedValue()
})

const renderHeader = ui =>
  renderWithProviders(
    <ThemeProvider>
      <ToastProvider>{ui}</ToastProvider>
    </ThemeProvider>
  )

const copyId = async label => {
  const user = userEvent.setup()

  // Override after setup, which installs its own clipboard stub
  vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(mockWriteText)

  await user.click(screen.getByRole('button', { name: en.moreActions }))
  await user.click(await screen.findByRole('menuitem', { name: label }))
}

describe('PageHeader', () => {
  it('TeamPageHeader renders name and website link', () => {
    renderHeader(
      <TeamPageHeader id='t1' name='Acme Corp' website='https://acme.com' />
    )

    expect(screen.getByText('Acme Corp')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /https:\/\/acme\.com/ })

    expect(link).toHaveAttribute('href', 'https://acme.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('TeamPageHeader copies team ID from the menu', async () => {
    renderHeader(<TeamPageHeader id='t1' name='Acme Corp' />)

    await copyId(en.team.copyId)

    expect(mockWriteText).toHaveBeenCalledWith('t1')
    expect(await screen.findByText(en.clipboard.success)).toBeInTheDocument()
  })

  it('shows error toast when clipboard write fails', async () => {
    mockWriteText.mockRejectedValue(new Error('denied'))
    renderHeader(<TeamPageHeader id='t1' name='Acme Corp' />)

    await copyId(en.team.copyId)

    expect(await screen.findByText(en.clipboard.error)).toBeInTheDocument()
  })

  it('TeamPageHeader hides leaving the team by default', async () => {
    const user = userEvent.setup()

    renderHeader(<TeamPageHeader id='t1' name='Acme Corp' />)

    await user.click(screen.getByRole('button', { name: en.moreActions }))
    await screen.findByRole('menuitem', { name: en.team.copyId })

    expect(
      screen.queryByRole('menuitem', { name: en.team.leave.title })
    ).not.toBeInTheDocument()
  })

  it('TeamPageHeader leaves the team from the menu', async () => {
    const user = userEvent.setup()
    const onLeave = vi.fn()

    renderHeader(<TeamPageHeader id='t1' name='Acme Corp' onLeave={onLeave} />)

    await user.click(screen.getByRole('button', { name: en.moreActions }))
    await user.click(
      await screen.findByRole('menuitem', { name: en.team.leave.title })
    )

    expect(onLeave).toHaveBeenCalled()
  })
})

describe('UserPageHeader', () => {
  it('copies user ID from the menu', async () => {
    renderHeader(<UserPageHeader user={OTHER} />)

    await copyId(en.user.copyId)

    expect(mockWriteText).toHaveBeenCalledWith(OTHER.id)
    expect(await screen.findByText(en.clipboard.success)).toBeInTheDocument()
  })

  it('displays user name and email', () => {
    renderHeader(<UserPageHeader user={OTHER} />)

    expect(screen.getByText('Bobby')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: OTHER.email })).toBeInTheDocument()
  })

  it('shows YouBadge when viewing own profile', () => {
    renderHeader(<UserPageHeader user={ME} />)

    expect(screen.getByText(`(${en.you})`)).toBeInTheDocument()
  })

  it('shows last active label when viewing another user with lastActive set', () => {
    renderHeader(
      <UserPageHeader user={{ ...OTHER, lastActive: '2025-01-01T00:00:00Z' }} />
    )

    expect(screen.getByText(`${en.lastActive.label}:`)).toBeInTheDocument()
  })

  it('does not show last active when viewing own profile', () => {
    renderHeader(
      <UserPageHeader user={{ ...ME, lastActive: '2025-01-01T00:00:00Z' }} />
    )

    expect(
      screen.queryByText(`${en.lastActive.label}:`)
    ).not.toBeInTheDocument()
  })

  it('does not show last active when user.lastActive is absent', () => {
    renderHeader(<UserPageHeader user={{ ...OTHER, lastActive: null }} />)

    expect(
      screen.queryByText(`${en.lastActive.label}:`)
    ).not.toBeInTheDocument()
  })
})
