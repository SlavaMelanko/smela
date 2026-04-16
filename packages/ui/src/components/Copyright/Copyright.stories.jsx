import { Copyright } from '.'

const sizeToClass = {
  xs: 'text-xs',
  sm: 'text-sm',
  default: 'text-base',
  lg: 'text-lg'
}

export default {
  title: 'Components/Copyright',
  component: Copyright,
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <div className='flex items-center'>
        <Story />
      </div>
    )
  ],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg']
    }
  },
  args: { size: 'xs' }
}

export const Default = {
  render: ({ size }) => <Copyright className={sizeToClass[size]} />
}
