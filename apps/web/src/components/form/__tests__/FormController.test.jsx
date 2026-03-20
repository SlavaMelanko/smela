import { screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'

import { renderWithProviders } from '@/tests'
import en from '$/locales/en.json'

import { FormController } from '../FormController'

// Wrapper component to provide form context
const TestFormWrapper = ({ children, defaultValues = {} }) => {
  const { control } = useForm({ defaultValues })

  return <form>{children(control)}</form>
}

describe('FormController', () => {
  it('renders label when provided', () => {
    const { container } = renderWithProviders(
      <TestFormWrapper>
        {control => (
          <FormController
            name='role'
            label='Role'
            control={control}
            render={({ field }) => <select {...field} />}
          />
        )}
      </TestFormWrapper>
    )

    const label = container.querySelector('label[for="role"]')

    expect(label).toBeInTheDocument()
    expect(label).toHaveTextContent('Role')
  })

  it('does not render label when not provided', () => {
    const { container } = renderWithProviders(
      <TestFormWrapper>
        {control => (
          <FormController
            name='role'
            control={control}
            render={({ field }) => <select {...field} />}
          />
        )}
      </TestFormWrapper>
    )

    const label = container.querySelector('label')

    expect(label).not.toBeInTheDocument()
  })

  it('renders controlled input via render prop', () => {
    const { container } = renderWithProviders(
      <TestFormWrapper defaultValues={{ role: 'admin' }}>
        {control => (
          <FormController
            name='role'
            control={control}
            render={({ field }) => (
              <select {...field} data-testid='role-select'>
                <option value='admin'>Admin</option>
                <option value='user'>User</option>
              </select>
            )}
          />
        )}
      </TestFormWrapper>
    )

    const select = container.querySelector('[data-testid="role-select"]')

    expect(select).toBeInTheDocument()
    expect(select).toHaveValue('admin')
  })

  it('displays translated error message when error exists', () => {
    const error = { message: 'email.error.required' }

    renderWithProviders(
      <TestFormWrapper>
        {control => (
          <FormController
            name='email'
            control={control}
            error={error}
            render={({ field }) => <input {...field} />}
          />
        )}
      </TestFormWrapper>
    )

    const errorMessage = screen.getByRole('alert')

    expect(errorMessage).toBeInTheDocument()
    expect(errorMessage).toHaveTextContent(en.email.error.required)
  })

  it('passes field and error to render function', () => {
    const error = { message: 'email.error.format' }
    const renderSpy = jest.fn(({ field }) => <input {...field} />)

    renderWithProviders(
      <TestFormWrapper defaultValues={{ email: 'test@example.com' }}>
        {control => (
          <FormController
            name='email'
            control={control}
            error={error}
            render={renderSpy}
          />
        )}
      </TestFormWrapper>
    )

    expect(renderSpy).toHaveBeenCalled()
    const callArgs = renderSpy.mock.calls[0][0]

    expect(callArgs.field).toBeDefined()
    expect(callArgs.field.name).toBe('email')
    expect(callArgs.field.value).toBe('test@example.com')
    expect(callArgs.error).toEqual(error)
  })
})
