import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { allUserStatuses, UserStatus } from '@/lib/types'
import { renderWithProviders } from '@/tests'

import { StatusDropdown } from '../StatusDropdown'

const onChange = jest.fn()

describe('StatusDropdown', () => {
  beforeEach(() => {
    onChange.mockClear()
  })

  it('renders trigger with the current status', () => {
    renderWithProviders(
      <StatusDropdown value={UserStatus.ACTIVE} onChange={onChange} />
    )

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('opens dropdown and displays all statuses', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <StatusDropdown value={UserStatus.ACTIVE} onChange={onChange} />
    )

    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    const menu = screen.getByRole('menu')

    allUserStatuses.forEach(status => {
      expect(
        within(menu).getByRole('menuitemradio', {
          name: new RegExp(status, 'i')
        })
      ).toBeInTheDocument()
    })
  })

  it('calls onChange with the selected status', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <StatusDropdown value={UserStatus.ACTIVE} onChange={onChange} />
    )

    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('menuitemradio', { name: /suspended/i }))

    expect(onChange).toHaveBeenCalledWith(
      UserStatus.SUSPENDED,
      expect.anything()
    )
  })
})
