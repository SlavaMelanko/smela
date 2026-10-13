import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@ui/tests'

import { TeamBadge } from '../TeamBadge'

describe('TeamBadge', () => {
  it('renders team badge with name, position, icon, and button', () => {
    const team = {
      id: 'engineering',
      name: 'Engineering Team',
      position: 'Senior Developer'
    }

    renderWithProviders(<TeamBadge team={team} />)

    const button = screen.getByRole('button', {
      name: `${team.name}${team.position}`
    })

    expect(button).toBeInTheDocument()
    expect(button.querySelector('svg')).toHaveClass('lucide-users')
    expect(screen.getByText(team.name)).toBeInTheDocument()
    expect(screen.getByText(team.position)).toBeInTheDocument()
  })

  it('renders default position when position is missing', () => {
    const teamWithoutPosition = { id: 'design', name: 'Design Team' }

    renderWithProviders(<TeamBadge team={teamWithoutPosition} />)

    expect(screen.getByText('Team member')).toBeInTheDocument()
  })

  it('preserves team navigation without opening the switcher', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <TeamBadge team={{ id: 'engineering', name: 'Engineering' }} />
    )

    await user.click(screen.getByRole('button', { name: /Engineering/ }))

    expect(globalThis.mockNavigate).toHaveBeenCalledWith('/team')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('opens the menu without navigating and selects a team through its callback', async () => {
    const user = userEvent.setup()
    const teams = [
      { id: 'engineering', name: 'Engineering', position: 'Developer' },
      { id: 'design', name: 'Design', position: 'Designer' }
    ]
    const onTeamChange = vi.fn()

    renderWithProviders(
      <TeamBadge team={teams[0]} teams={teams} onTeamChange={onTeamChange} />
    )

    await user.click(screen.getByRole('button', { name: 'Switch team' }))

    expect(globalThis.mockNavigate).not.toHaveBeenCalled()
    const menu = await screen.findByRole('menu')

    expect(
      within(menu).getByRole('menuitemradio', {
        name: /Engineering.*Developer/
      })
    ).toHaveAttribute('aria-checked', 'true')

    await user.click(
      within(menu).getByRole('menuitemradio', { name: /Design.*Designer/ })
    )

    expect(onTeamChange.mock.calls[0][0]).toBe('design')
    expect(globalThis.mockNavigate).not.toHaveBeenCalled()
  })

  it('calls the create action without switching teams or navigating', async () => {
    const user = userEvent.setup()
    const onCreateTeam = vi.fn()
    const onTeamChange = vi.fn()

    renderWithProviders(
      <TeamBadge
        team={{ id: 'engineering', name: 'Engineering' }}
        onCreateTeam={onCreateTeam}
        onTeamChange={onTeamChange}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Switch team' }))
    await user.click(
      await screen.findByRole('menuitem', { name: 'Create a team' })
    )

    expect(onCreateTeam).toHaveBeenCalledOnce()
    expect(onTeamChange).not.toHaveBeenCalled()
    expect(globalThis.mockNavigate).not.toHaveBeenCalled()
  })

  it('disables creation when no create callback is provided', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <TeamBadge team={{ id: 'engineering', name: 'Engineering' }} />
    )

    await user.click(screen.getByRole('button', { name: 'Switch team' }))

    expect(
      await screen.findByRole('menuitem', { name: 'Create a team' })
    ).toHaveAttribute('aria-disabled', 'true')
  })
})
