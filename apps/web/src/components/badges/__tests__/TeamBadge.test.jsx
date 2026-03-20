import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests'

import { TeamBadge } from '../TeamBadge'

const mockTeam = {
  name: 'Engineering Team',
  position: 'Senior Developer'
}

describe('TeamBadge', () => {
  it('renders team name', () => {
    renderWithProviders(<TeamBadge team={mockTeam} />)

    expect(screen.getByText('Engineering Team')).toBeInTheDocument()
  })

  it('renders team position', () => {
    renderWithProviders(<TeamBadge team={mockTeam} />)

    expect(screen.getByText('Senior Developer')).toBeInTheDocument()
  })

  it('renders default position when position is missing', () => {
    const teamWithoutPosition = { name: 'Design Team' }

    renderWithProviders(<TeamBadge team={teamWithoutPosition} />)

    expect(screen.getByText('Team member')).toBeInTheDocument()
  })

  it('renders as a button', () => {
    renderWithProviders(<TeamBadge team={mockTeam} />)

    const button = screen.getByRole('button')

    expect(button).toBeInTheDocument()
  })

  it('renders team icon', () => {
    renderWithProviders(<TeamBadge team={mockTeam} />)

    const button = screen.getByRole('button')
    const icon = button.querySelector('svg')

    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('lucide-users')
  })
})
