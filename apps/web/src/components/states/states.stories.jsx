import { fn } from 'storybook/test'

import { AddButton } from '@/components/buttons'

import { EmptyState, ErrorState } from '.'

export default {
  title: 'Components/States',
  parameters: { layout: 'fullscreen' },
  decorators: [
    Story => (
      <div className='flex min-h-screen w-full items-center justify-center'>
        <Story />
      </div>
    )
  ]
}

export const Empty = {
  args: {
    onAdd: fn()
  },
  render: ({ onAdd }) => (
    <EmptyState text='No items found'>
      <AddButton label='Add item' onClick={onAdd} />
    </EmptyState>
  )
}

export const Error = {
  args: {
    onRetry: fn()
  },
  render: ({ onRetry }) => (
    <ErrorState text='Failed to load data' onRetry={onRetry} />
  )
}
