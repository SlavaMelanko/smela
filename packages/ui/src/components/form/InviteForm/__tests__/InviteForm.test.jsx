import { resources } from '@smela/i18n/resources'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@ui/tests'
const en = resources.en.translation

import { InviteForm } from '..'

const defaultPermissions = {
  users: { view: true, manage: false },
  teams: { view: true, manage: false }
}

const renderForm = ({ onSubmit = vi.fn(), formFields } = {}) => {
  renderWithProviders(
    <InviteForm
      onSubmit={onSubmit}
      formFields={formFields}
      defaultPermissions={defaultPermissions}
    />
  )

  return {
    firstNameInput: screen.queryByLabelText(en.firstName.label, {
      exact: false
    }),
    lastNameInput: screen.queryByLabelText(en.lastName.label, { exact: false }),
    emailInput: screen.getByLabelText(en.email.label, { exact: false }),
    positionInput: screen.queryByLabelText(en.position.label, { exact: false }),
    submitButton: screen.getByRole('button', { name: en.invite.send.cta }),
    permissionsSection: screen.queryByText(en.permissions.name)
  }
}

describe('InviteForm', () => {
  let user

  beforeEach(() => {
    user = userEvent.setup()
  })

  describe('field visibility', () => {
    it('shows position field by default', () => {
      const { positionInput } = renderForm()

      expect(positionInput).toBeInTheDocument()
    })

    it('hides position field when formFields.position is false', () => {
      const { positionInput } = renderForm({
        formFields: { position: false }
      })

      expect(positionInput).not.toBeInTheDocument()
    })

    it('hides name fields when formFields hides them', () => {
      const { firstNameInput, lastNameInput } = renderForm({
        formFields: { firstName: false, lastName: false }
      })

      expect(firstNameInput).not.toBeInTheDocument()
      expect(lastNameInput).not.toBeInTheDocument()
    })

    it('shows permissions section by default', () => {
      const { permissionsSection } = renderForm()

      expect(permissionsSection).toBeInTheDocument()
    })

    it('hides permissions section when formFields.permissions is false', () => {
      const { permissionsSection } = renderForm({
        formFields: { permissions: false }
      })

      expect(permissionsSection).not.toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('sends all fields by default', async () => {
      const onSubmit = vi.fn()
      const { firstNameInput, emailInput, positionInput, submitButton } =
        renderForm({ onSubmit })

      await user.type(firstNameInput, 'John')
      await user.type(emailInput, 'john@example.com')
      await user.type(positionInput, 'Developer')
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })

      const submittedData = onSubmit.mock.calls[0][0]

      expect(submittedData).toHaveProperty('firstName', 'John')
      expect(submittedData).toHaveProperty('email', 'john@example.com')
      expect(submittedData).toHaveProperty('position', 'Developer')
      expect(submittedData).toHaveProperty('permissions')
      expect(submittedData.permissions).toHaveProperty('users')
      expect(submittedData.permissions).toHaveProperty('teams')
      expect(submittedData.permissions.users).toHaveProperty('view')
      expect(submittedData.permissions.users).toHaveProperty('manage')
      expect(submittedData.permissions.teams).toHaveProperty('view')
      expect(submittedData.permissions.teams).toHaveProperty('manage')
    })

    it('accepts a single-character position', async () => {
      const onSubmit = vi.fn()
      const { firstNameInput, emailInput, positionInput, submitButton } =
        renderForm({ onSubmit })

      await user.type(firstNameInput, 'John')
      await user.type(emailInput, 'john@example.com')
      await user.type(positionInput, 'A')
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })

      const submittedData = onSubmit.mock.calls[0][0]

      expect(submittedData).toHaveProperty('position', 'A')
    })

    it('excludes hidden fields from submission', async () => {
      const onSubmit = vi.fn()
      const { firstNameInput, emailInput, submitButton } = renderForm({
        onSubmit,
        formFields: { position: false }
      })

      await user.type(firstNameInput, 'John')
      await user.type(emailInput, 'john@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })

      const submittedData = onSubmit.mock.calls[0][0]

      expect(submittedData).not.toHaveProperty('position')
      expect(submittedData).toMatchObject({
        firstName: 'John',
        email: 'john@example.com'
      })
    })
  })

  describe('member invite without names', () => {
    it('submits email and position without requiring a first name', async () => {
      const onSubmit = vi.fn()
      const { emailInput, positionInput, submitButton } = renderForm({
        onSubmit,
        formFields: { firstName: false, lastName: false }
      })

      await user.type(emailInput, 'john@example.com')
      await user.type(positionInput, 'Developer')
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })

      const submittedData = onSubmit.mock.calls[0][0]

      expect(submittedData).not.toHaveProperty('firstName')
      expect(submittedData).not.toHaveProperty('lastName')
      expect(submittedData).toMatchObject({
        email: 'john@example.com',
        position: 'Developer'
      })
    })
  })

  describe('permissions matrix', () => {
    it('renders permissions matrix with resource labels and switches', () => {
      renderForm()

      expect(
        screen.getByText(en.permissions.resources.values.users)
      ).toBeInTheDocument()

      expect(
        screen.getByText(en.permissions.resources.values.teams)
      ).toBeInTheDocument()

      // Header renders column labels once
      expect(
        screen.getByText(en.permissions.actions.values.view)
      ).toBeInTheDocument()

      expect(
        screen.getByText(en.permissions.actions.values.manage)
      ).toBeInTheDocument()
    })

    it('includes permissions data in form submission', async () => {
      const onSubmit = vi.fn()
      const { firstNameInput, emailInput, submitButton } = renderForm({
        onSubmit
      })

      await user.type(firstNameInput, 'John')
      await user.type(emailInput, 'john@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })

      const submittedData = onSubmit.mock.calls[0][0]

      // Verify default permission values
      expect(submittedData.permissions).toEqual({
        users: { view: true, manage: false },
        teams: { view: true, manage: false }
      })
    })
  })
})
