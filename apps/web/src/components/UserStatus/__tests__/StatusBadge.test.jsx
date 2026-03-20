import { screen } from '@testing-library/react'

import { UserStatus } from '@/lib/types'
import { renderWithProviders } from '@/tests'

import { getStatusTextColor } from '../colors'
import { StatusBadge } from '../StatusBadge'

describe('StatusBadge', () => {
  it('renders translated status text', () => {
    renderWithProviders(<StatusBadge status={UserStatus.ACTIVE} />)

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it.each([
    [UserStatus.ACTIVE, 'Active'],
    [UserStatus.ARCHIVED, 'Archived'],
    [UserStatus.NEW, 'New'],
    [UserStatus.PENDING, 'Pending'],
    [UserStatus.SUSPENDED, 'Suspended'],
    [UserStatus.TRIAL, 'Trial'],
    [UserStatus.VERIFIED, 'Verified']
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
