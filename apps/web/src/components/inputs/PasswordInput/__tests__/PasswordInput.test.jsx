import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'

import { PasswordInput } from '../PasswordInput'

const FormWithPasswordInput = ({ onSubmit, defaultPassword = '' }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: { password: defaultPassword }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PasswordInput
        {...register('password')}
        placeholder='Enter password'
        aria-label='Password'
      />
      <button type='submit'>Submit</button>
    </form>
  )
}

describe('PasswordInput', () => {
  it('renders with password type by default', () => {
    render(<PasswordInput placeholder='Enter password' />)

    const input = screen.getByPlaceholderText('Enter password')

    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'password')
  })

  it('toggles password visibility when clicking the toggle button', async () => {
    render(
      <PasswordInput placeholder='Enter password' defaultValue='secret123' />
    )

    const input = screen.getByPlaceholderText('Enter password')
    const toggleButton = screen.getByRole('button')

    // Initially password should be hidden
    expect(input).toHaveAttribute('type', 'password')

    // Click to show password
    await userEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')

    // Click to hide password again
    await userEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('preserves password value when toggling visibility', async () => {
    render(<PasswordInput placeholder='Enter password' />)

    const input = screen.getByPlaceholderText('Enter password')
    const toggleButton = screen.getByRole('button')

    // Type password
    await userEvent.type(input, 'MySecretPassword123!')
    expect(input).toHaveValue('MySecretPassword123!')

    // Toggle visibility and check value is preserved
    await userEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveValue('MySecretPassword123!')

    // Toggle back and check value is still there
    await userEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'password')
    expect(input).toHaveValue('MySecretPassword123!')
  })

  it('toggle button does not submit the form', async () => {
    const handleSubmit = jest.fn()

    render(<FormWithPasswordInput onSubmit={handleSubmit} />)

    const toggleButton = screen.getByLabelText(/toggle password visibility/i)

    // Click toggle button should not submit form
    await userEvent.click(toggleButton)
    expect(handleSubmit).not.toHaveBeenCalled()

    // Type in password field
    const input = screen.getByPlaceholderText('Enter password')

    await userEvent.type(input, 'test123')

    // Click toggle button again - still should not submit
    await userEvent.click(toggleButton)
    expect(handleSubmit).not.toHaveBeenCalled()

    // Only the submit button should submit the form
    const submitButton = screen.getByRole('button', { name: /submit/i })

    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        { password: 'test123' },
        expect.anything()
      )
    })
  })

  it('accepts and forwards all standard input props', () => {
    render(
      <PasswordInput
        name='userPassword'
        id='password-field'
        placeholder='Your password'
        required
        minLength={8}
        maxLength={128}
        disabled
        data-testid='password-input'
        aria-describedby='password-help'
        className='custom-input'
      />
    )

    const input = screen.getByPlaceholderText('Your password')

    expect(input).toHaveAttribute('name', 'userPassword')
    expect(input).toHaveAttribute('id', 'password-field')
    expect(input).toHaveAttribute('required')
    expect(input).toHaveAttribute('minLength', '8')
    expect(input).toHaveAttribute('maxLength', '128')
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('data-testid', 'password-input')
    expect(input).toHaveAttribute('aria-describedby', 'password-help')
    expect(input).toHaveClass('custom-input')
  })

  it('handles onChange events correctly', async () => {
    const handleChange = jest.fn()

    render(
      <PasswordInput placeholder='Enter password' onChange={handleChange} />
    )

    const input = screen.getByPlaceholderText('Enter password')

    await userEvent.type(input, 'a')
    expect(handleChange).toHaveBeenCalled()
  })

  it('works with react-hook-form', async () => {
    const handleSubmit = jest.fn()

    render(
      <FormWithPasswordInput
        onSubmit={handleSubmit}
        defaultPassword='initial'
      />
    )

    const input = screen.getByPlaceholderText('Enter password')
    const submitButton = screen.getByRole('button', { name: /submit/i })

    // Check initial value
    expect(input).toHaveValue('initial')

    // Clear and type new password
    await userEvent.clear(input)
    await userEvent.type(input, 'NewPassword456!')

    // Submit form
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        { password: 'NewPassword456!' },
        expect.anything()
      )
    })
  })

  it('toggle button is accessible via keyboard', async () => {
    render(<PasswordInput placeholder='Enter password' />)

    const input = screen.getByPlaceholderText('Enter password')
    const toggleButton = screen.getByRole('button')

    // Initially password is hidden
    expect(input).toHaveAttribute('type', 'password')

    // Tab to toggle button and press Enter
    await userEvent.type(input, 'test')
    await userEvent.tab()
    expect(toggleButton).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    expect(input).toHaveAttribute('type', 'text')

    // Press space to toggle back
    await userEvent.keyboard(' ')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('handles disabled state correctly', () => {
    render(<PasswordInput placeholder='Enter password' disabled />)

    const input = screen.getByPlaceholderText('Enter password')
    const toggleButton = screen.getByRole('button')

    expect(input).toBeDisabled()

    // Toggle button should be disabled when input is disabled
    expect(toggleButton).toBeDisabled()
  })

  it('handles read-only state correctly', async () => {
    render(
      <PasswordInput
        placeholder='Enter password'
        readOnly
        value='readonly123'
      />
    )

    const input = screen.getByPlaceholderText('Enter password')
    const toggleButton = screen.getByRole('button')

    expect(input).toHaveAttribute('readOnly')
    expect(input).toHaveValue('readonly123')

    // Should not be able to type in read-only input
    await userEvent.type(input, 'new')
    expect(input).toHaveValue('readonly123')

    // But toggle should still work
    await userEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')
  })

  it('respects defaultVisible prop', () => {
    render(<PasswordInput placeholder='Enter password' defaultVisible />)

    const input = screen.getByPlaceholderText('Enter password')

    // Should start with password visible
    expect(input).toHaveAttribute('type', 'text')
  })

  it('calls onVisibilityChange callback when toggling', async () => {
    const handleVisibilityChange = jest.fn()

    render(
      <PasswordInput
        placeholder='Enter password'
        onVisibilityChange={handleVisibilityChange}
      />
    )

    const toggleButton = screen.getByRole('button')

    // Toggle to show
    await userEvent.click(toggleButton)
    expect(handleVisibilityChange).toHaveBeenCalledWith(true)

    // Toggle to hide
    await userEvent.click(toggleButton)
    expect(handleVisibilityChange).toHaveBeenCalledWith(false)
  })

  it('uses custom toggleAriaLabel when provided', () => {
    render(
      <PasswordInput
        placeholder='Enter password'
        toggleAriaLabel='Custom toggle label'
      />
    )

    const toggleButton = screen.getByRole('button')

    expect(toggleButton).toHaveAttribute('aria-label', 'Custom toggle label')
  })

  it('uses default aria-label based on state when toggleAriaLabel not provided', async () => {
    render(<PasswordInput placeholder='Enter password' toggleAriaLabel='' />)

    const toggleButton = screen.getByRole('button')

    // Initially showing "Show password"
    expect(toggleButton).toHaveAttribute('aria-label', 'Show password')

    // After toggle, showing "Hide password"
    await userEvent.click(toggleButton)
    expect(toggleButton).toHaveAttribute('aria-label', 'Hide password')
  })

  it('disables toggle button when input is disabled but not readonly', () => {
    render(<PasswordInput placeholder='Enter password' disabled />)

    const toggleButton = screen.getByRole('button')

    expect(toggleButton).toBeDisabled()
  })

  it('keeps toggle button enabled when input is readonly', () => {
    render(<PasswordInput placeholder='Enter password' readOnly />)

    const toggleButton = screen.getByRole('button')

    expect(toggleButton).not.toBeDisabled()
  })
})
