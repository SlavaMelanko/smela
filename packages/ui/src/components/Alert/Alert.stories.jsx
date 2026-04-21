import { Alert } from '.'

const withContainer = Story => (
  <div className='flex items-center'>
    <Story />
  </div>
)

export default {
  title: 'Components/Alert',
  component: Alert,
  decorators: [withContainer],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive']
    },
    title: { control: 'text' },
    description: { control: 'text' }
  },
  args: {
    variant: 'default',
    title: 'Your session has expired',
    description: 'Please log in again to continue.'
  }
}

export const Default = {}

export const Destructive = {
  args: {
    variant: 'destructive',
    title: 'Delete your account',
    description:
      'This action is permanent and cannot be undone. All your data will be lost.'
  }
}

export const TitleOnly = {
  args: {
    title: 'No description provided',
    description: undefined
  }
}
