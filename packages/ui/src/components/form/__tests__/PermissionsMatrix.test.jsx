import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@ui/tests'
import { useForm } from 'react-hook-form'

// Mock PointerEvent for JSDOM
globalThis.PointerEvent = globalThis.Event

import { PermissionsMatrix } from '../PermissionsMatrix'

const TestWrapper = ({ initialPermissions, readOnly }) => {
  const { control } = useForm({
    defaultValues: {
      permissions: initialPermissions
    }
  })

  return (
    <PermissionsMatrix
      control={control}
      permissions={initialPermissions}
      isLoading={false}
      readOnly={readOnly}
    />
  )
}

describe('PermissionsMatrix', () => {
  const mockPermissions = {
    users: { view: false, manage: false },
    posts: { view: true, manage: false }
  }

  test('should automatically check view when manage is checked', async () => {
    const user = userEvent.setup()

    renderWithProviders(<TestWrapper initialPermissions={mockPermissions} />)

    // Find the manage switch for users (should be unchecked)
    const manageSwitches = screen.getAllByLabelText('Manage')
    const manageSwitch = manageSwitches[0] // users is first in the list

    // Find the view switch for users
    const viewSwitches = screen.getAllByLabelText('View')
    const viewSwitch = viewSwitches[0] // users is first in the list

    // Initially both should be unchecked
    expect(manageSwitch).not.toBeChecked()
    expect(viewSwitch).not.toBeChecked()

    // Click manage switch
    await user.click(manageSwitch)

    // Check that view is automatically checked
    expect(viewSwitch).toBeChecked()
    expect(manageSwitch).toBeChecked()
  })

  test('should automatically uncheck manage when view is unchecked', async () => {
    const user = userEvent.setup()

    const permissionsWithManage = {
      users: { view: true, manage: true }
    }

    renderWithProviders(
      <TestWrapper initialPermissions={permissionsWithManage} />
    )

    // Find the view and manage switches for users
    const viewSwitches = screen.getAllByLabelText('View')
    const viewSwitch = viewSwitches[0] // users is first in the list
    const manageSwitches = screen.getAllByLabelText('Manage')
    const manageSwitch = manageSwitches[0] // users is first in the list

    // Initially both should be checked
    expect(viewSwitch).toBeChecked()
    expect(manageSwitch).toBeChecked()

    // Click view switch to uncheck it
    await user.click(viewSwitch)

    // Check that manage is automatically unchecked
    expect(viewSwitch).not.toBeChecked()
    expect(manageSwitch).not.toBeChecked()
  })

  test('should not toggle switches in read-only mode', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <TestWrapper initialPermissions={mockPermissions} readOnly />
    )

    const manageSwitch = screen.getAllByLabelText('Manage')[0]
    const viewSwitch = screen.getAllByLabelText('View')[1]

    await user.click(manageSwitch)
    await user.click(viewSwitch)

    expect(manageSwitch).not.toBeChecked()
    expect(viewSwitch).toBeChecked()
  })
})
