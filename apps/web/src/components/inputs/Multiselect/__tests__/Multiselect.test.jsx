import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Multiselect } from '../Multiselect'

// Mock browser APIs for tests
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  Element.prototype.scrollIntoView = jest.fn()
})

const defaultOptions = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
  { label: 'Option C', value: 'c' }
]

describe('Multiselect', () => {
  describe('Rendering', () => {
    it('renders with placeholder when no value selected', () => {
      render(
        <Multiselect
          options={defaultOptions}
          value={[]}
          onChange={() => {}}
          placeholder='Select items'
        />
      )

      expect(screen.getByText('Select items')).toBeInTheDocument()
    })

    it('displays selected value as badge', () => {
      render(
        <Multiselect
          options={defaultOptions}
          value={[{ label: 'Option A', value: 'a' }]}
          onChange={() => {}}
          placeholder='Select items'
        />
      )

      const trigger = screen.getByRole('combobox')
      const badge = within(trigger).getByText('Option A')

      expect(badge).toBeInTheDocument()
    })

    it('displays multiple selected values as badges', () => {
      render(
        <Multiselect
          options={defaultOptions}
          value={[
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' }
          ]}
          onChange={() => {}}
          placeholder='Select items'
        />
      )

      const trigger = screen.getByRole('combobox')

      expect(within(trigger).getByText('Option A')).toBeInTheDocument()
      expect(within(trigger).getByText('Option B')).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('calls onChange when selecting an option', async () => {
      const user = userEvent.setup()
      const handleChange = jest.fn()

      render(
        <Multiselect
          options={defaultOptions}
          value={[]}
          onChange={handleChange}
          placeholder='Select items'
        />
      )

      await user.click(screen.getByRole('combobox'))
      await user.click(screen.getByRole('option', { name: /Option A/i }))

      expect(handleChange).toHaveBeenCalledWith([
        { label: 'Option A', value: 'a' }
      ])
    })
  })

  describe('Props', () => {
    it('disables the component when disabled prop is true', () => {
      render(
        <Multiselect
          options={defaultOptions}
          value={[]}
          onChange={() => {}}
          placeholder='Select items'
          disabled
        />
      )

      expect(screen.getByRole('combobox')).toBeDisabled()
    })

    it('applies custom className to trigger', () => {
      render(
        <Multiselect
          options={defaultOptions}
          value={[]}
          onChange={() => {}}
          placeholder='Select items'
          className='custom-class'
        />
      )

      expect(screen.getByRole('combobox')).toHaveClass('custom-class')
    })
  })
})
