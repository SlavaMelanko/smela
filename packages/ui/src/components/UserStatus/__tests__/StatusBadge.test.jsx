import { screen } from '@testing-library/react'
import { UserStatus } from '@ui/lib/types'
import { renderWithProviders } from '@ui/tests'

import { getStatusTextColor } from '../colors'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
  it('renders translated status text', () => {
    renderWithProviders(<StatusBadge status={UserStatus.Active} />)

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it.each([
    [UserStatus.Active, 'Active'],
    [UserStatus.Archived, 'Archived'],
    [UserStatus.New, 'New'],
    [UserStatus.Pending, 'Pending'],
    [UserStatus.Suspended, 'Suspended'],
    [UserStatus.Trial, 'Trial'],
    [UserStatus.Verified, 'Verified']
  ])('applies correct color for %s status', (status, label) => {
    renderWithProviders(<StatusBadge status={status} />)

    expect(screen.getByText(label)).toHaveClass(getStatusTextColor(status))
  })

  it('renders translation key for unknown status', () => {
    renderWithProviders(<StatusBadge status='unknown' />)

    expect(screen.getByText('status.values.unknown')).toHaveClass(
      'text-muted-foreground'
    )
  })
})
