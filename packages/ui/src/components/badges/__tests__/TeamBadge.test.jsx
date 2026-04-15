import { screen } from '@testing-library/react'
import { renderWithProviders } from '@ui/tests'

import { TeamBadge } from '../TeamBadge'

describe('TeamBadge', () => {
  it('renders team badge with name, position, icon, and button', () => {
    const team = {
      name: 'Engineering Team',
      position: 'Senior Developer'
    }

    renderWithProviders(<TeamBadge team={team} />)

    const button = screen.getByRole('button')

    expect(button).toBeInTheDocument()
    expect(button.querySelector('svg')).toHaveClass('lucide-users')
    expect(screen.getByText(team.name)).toBeInTheDocument()
    expect(screen.getByText(team.position)).toBeInTheDocument()
  })

  it('renders default position when position is missing', () => {
    const teamWithoutPosition = { name: 'Design Team' }

    renderWithProviders(<TeamBadge team={teamWithoutPosition} />)

    expect(screen.getByText('Team member')).toBeInTheDocument()
  })
})
