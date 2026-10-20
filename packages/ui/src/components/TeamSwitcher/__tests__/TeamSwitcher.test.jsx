import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@ui/tests'

import { TeamSwitcher } from '../TeamSwitcher'

describe('TeamSwitcher', () => {
  it.each([
    { hasTeam: true, hasInvite: false, description: '' },
    {
      hasTeam: false,
      hasInvite: true,
      description: 'You have pending invitations'
    },
    {
      hasTeam: true,
      hasInvite: true,
      description: 'You have pending invitations'
    }
  ])(
    'describes the trigger as "$description" when hasTeam=$hasTeam and hasInvite=$hasInvite',
    ({ hasTeam, hasInvite, description }) => {
      renderWithProviders(
        <TeamSwitcher
          teams={hasTeam ? [{ id: 'design', name: 'Design' }] : []}
          invites={hasInvite ? [{ id: 'marketing', name: 'Marketing' }] : []}
        />
      )

      expect(
        screen.getByRole('button', { name: 'Switch team' })
      ).toHaveAccessibleDescription(description)
    }
  )

  it('shows the no-team state with creation disabled until a callback is provided', () => {
    renderWithProviders(<TeamSwitcher teams={[]} />)

    expect(screen.getByText('No team yet')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create team' })).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Switch team' })
    ).not.toBeInTheDocument()
  })

  it('creates the first team from the empty state without navigating', async () => {
    const user = userEvent.setup()
    const onCreateTeam = vi.fn()

    renderWithProviders(<TeamSwitcher teams={[]} onCreateTeam={onCreateTeam} />)

    await user.click(screen.getByRole('button', { name: 'Create team' }))

    expect(onCreateTeam).toHaveBeenCalledOnce()
    expect(globalThis.mockNavigate).not.toHaveBeenCalled()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('uses the first team in the ordered list as active', async () => {
    const user = userEvent.setup()
    const teams = [
      { id: 'design', name: 'Design', position: 'Designer' },
      { id: 'engineering', name: 'Engineering', position: 'Developer' }
    ]

    renderWithProviders(<TeamSwitcher teams={teams} />)

    expect(screen.getByRole('button', { name: /Design/ })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Engineering/ })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Switch team' }))

    const menu = await screen.findByRole('menu')

    expect(
      within(menu).getByRole('menuitemradio', { name: /Design/ })
    ).toHaveAttribute('aria-checked', 'true')

    expect(
      within(menu).getByRole('menuitemradio', { name: /Engineering/ })
    ).toHaveAttribute('aria-checked', 'false')
  })

  it('renders team badge with name, position, icon, and button', () => {
    const team = {
      id: 'engineering',
      name: 'Engineering Team',
      position: 'Senior Developer'
    }

    renderWithProviders(<TeamSwitcher teams={[team]} />)

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

    renderWithProviders(<TeamSwitcher teams={[teamWithoutPosition]} />)

    expect(screen.getByText('Team member')).toBeInTheDocument()
  })

  it('preserves team navigation without opening the switcher', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <TeamSwitcher teams={[{ id: 'engineering', name: 'Engineering' }]} />
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
      <TeamSwitcher teams={teams} onTeamChange={onTeamChange} />
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

  it('does not switch to the team that is already active', async () => {
    const user = userEvent.setup()
    const onTeamChange = vi.fn()

    renderWithProviders(
      <TeamSwitcher
        teams={[{ id: 'engineering', name: 'Engineering' }]}
        onTeamChange={onTeamChange}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Switch team' }))
    await user.click(
      await screen.findByRole('menuitemradio', { name: /Engineering/ })
    )

    expect(onTeamChange).not.toHaveBeenCalled()
  })

  it('calls the create action without switching teams or navigating', async () => {
    const user = userEvent.setup()
    const onCreateTeam = vi.fn()
    const onTeamChange = vi.fn()

    renderWithProviders(
      <TeamSwitcher
        teams={[{ id: 'engineering', name: 'Engineering' }]}
        onCreateTeam={onCreateTeam}
        onTeamChange={onTeamChange}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Switch team' }))
    await user.click(
      await screen.findByRole('menuitem', { name: 'Create team' })
    )

    expect(onCreateTeam).toHaveBeenCalledOnce()
    expect(onTeamChange).not.toHaveBeenCalled()
    expect(globalThis.mockNavigate).not.toHaveBeenCalled()
  })

  it('disables creation when no create callback is provided', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <TeamSwitcher teams={[{ id: 'engineering', name: 'Engineering' }]} />
    )

    await user.click(screen.getByRole('button', { name: 'Switch team' }))

    expect(
      await screen.findByRole('menuitem', { name: 'Create team' })
    ).toHaveAttribute('aria-disabled', 'true')
  })

  describe('invitations', () => {
    const invites = [
      {
        id: 'marketing',
        name: 'Marketing',
        inviter: { firstName: 'Jane', lastName: 'Doe' }
      }
    ]

    it('keeps the menu reachable with invites but no team yet', async () => {
      const user = userEvent.setup()

      renderWithProviders(<TeamSwitcher teams={[]} invites={invites} />)

      expect(screen.getByText('No team yet')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Switch team' }))

      const menu = await screen.findByRole('menu')

      expect(within(menu).getByText('Invitations')).toBeInTheDocument()
      expect(within(menu).getByText('From Jane Doe')).toBeInTheDocument()
      expect(within(menu).queryByRole('menuitemradio')).not.toBeInTheDocument()
    })

    it('accepts an invite through its callback', async () => {
      const user = userEvent.setup()
      const onAcceptInvite = vi.fn()
      const onDeclineInvite = vi.fn()

      renderWithProviders(
        <TeamSwitcher
          teams={[{ id: 'engineering', name: 'Engineering' }]}
          invites={invites}
          onAcceptInvite={onAcceptInvite}
          onDeclineInvite={onDeclineInvite}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Switch team' }))
      await user.click(
        await screen.findByRole('menuitem', {
          name: 'Accept invitation to Marketing'
        })
      )

      expect(onAcceptInvite).toHaveBeenCalledWith('marketing')
      expect(onDeclineInvite).not.toHaveBeenCalled()
    })

    it('declines an invite through its callback', async () => {
      const user = userEvent.setup()
      const onAcceptInvite = vi.fn()
      const onDeclineInvite = vi.fn()

      renderWithProviders(
        <TeamSwitcher
          teams={[]}
          invites={invites}
          onAcceptInvite={onAcceptInvite}
          onDeclineInvite={onDeclineInvite}
        />
      )

      await user.click(screen.getByRole('button', { name: 'Switch team' }))
      await user.click(
        await screen.findByRole('menuitem', {
          name: 'Decline invitation to Marketing'
        })
      )

      expect(onDeclineInvite).toHaveBeenCalledWith('marketing')
      expect(onAcceptInvite).not.toHaveBeenCalled()
    })
  })
})
