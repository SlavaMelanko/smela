import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/tests'
import en from '$/locales/en.json'

import { FormField } from '../FormField'

const MockInput = ({ name, id, error, ...props }) => (
  <input
    data-testid='mock-input'
    name={name}
    id={id}
    data-error={error ? 'true' : 'false'}
    {...props}
  />
)

describe('FormField', () => {
  it('clones child with name, id, and error props', () => {
    const error = { message: 'email.error.required' }

    renderWithProviders(
      <FormField name='email' error={error}>
        <MockInput placeholder='Enter email' />
      </FormField>
    )

    const input = screen.getByTestId('mock-input')

    expect(input).toHaveAttribute('name', 'email')
    expect(input).toHaveAttribute('id', 'email')
    expect(input).toHaveAttribute('data-error', 'true')
    expect(input).toHaveAttribute('placeholder', 'Enter email')
  })

  it('renders label with required asterisk and htmlFor attribute', () => {
    renderWithProviders(
      <FormField name='email' label='Email Address'>
        <MockInput />
      </FormField>
    )

    const label = screen.getByText('Email Address')

    expect(label).toBeInTheDocument()
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveAttribute('for', 'email')
    expect(label.querySelector('.text-destructive')).toHaveTextContent('*')
  })

  it('hides required asterisk when optional is true', () => {
    renderWithProviders(
      <FormField name='email' label='Email Address' optional>
        <MockInput />
      </FormField>
    )

    const label = screen.getByText('Email Address')

    expect(label.querySelector('.text-destructive')).not.toBeInTheDocument()
  })

  it('displays translated error message when error exists', () => {
    const error = { message: 'email.error.required' }

    renderWithProviders(
      <FormField name='email' label='Email' error={error}>
        <MockInput />
      </FormField>
    )

    expect(screen.getByRole('alert')).toHaveTextContent(en.email.error.required)
  })
})
